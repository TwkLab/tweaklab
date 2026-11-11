using System;
using System.IO;
using System.Management;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using Twk.Agent.Core.Models;

namespace Twk.Agent.Windows.Collectors;

public class WindowsLiveTelemetryService
{
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
    private class MEMORYSTATUSEX
    {
        public uint dwLength = (uint)Marshal.SizeOf(typeof(MEMORYSTATUSEX));
        public uint dwMemoryLoad;
        public ulong ullTotalPhys;
        public ulong ullAvailPhys;
        public ulong ullTotalPageFile;
        public ulong ullAvailPageFile;
        public ulong ullTotalVirtual;
        public ulong ullAvailVirtual;
        public ulong ullAvailExtendedVirtual;
    }

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool GlobalMemoryStatusEx([In, Out] MEMORYSTATUSEX lpBuffer);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool GetSystemTimes(out long lpIdleTime, out long lpKernelTime, out long lpUserTime);

    private long _prevIdleTime;
    private long _prevKernelTime;
    private long _prevUserTime;
    private bool _hasInitializedCpu;
    private double _lastCpuUsage = 5.0;
    private string? _cachedGpuName;

    public WindowsLiveTelemetryService()
    {
        try
        {
            if (GetSystemTimes(out _prevIdleTime, out _prevKernelTime, out _prevUserTime))
            {
                _hasInitializedCpu = true;
            }
        }
        catch {}

        // Cache GPU name once
        try
        {
            using var gpuSearcher = new ManagementObjectSearcher("SELECT Name FROM Win32_VideoController");
            foreach (ManagementObject obj in gpuSearcher.Get())
            {
                var name = obj["Name"]?.ToString();
                if (!string.IsNullOrWhiteSpace(name))
                {
                    _cachedGpuName = name;
                    break;
                }
            }
        }
        catch {}
    }

    public Task<LiveMetrics> GetSnapshotAsync(CancellationToken cancellationToken = default)
    {
        // 1. CPU Usage via GetSystemTimes (Pure Win32, 0ms, no perflib/wmiaprpl crash risk)
        double cpuUsage = _lastCpuUsage;
        try
        {
            if (GetSystemTimes(out long idleTime, out long kernelTime, out long userTime))
            {
                if (_hasInitializedCpu)
                {
                    long usr = userTime - _prevUserTime;
                    long ker = kernelTime - _prevKernelTime;
                    long idl = idleTime - _prevIdleTime;
                    long sys = ker + usr;

                    if (sys > 0)
                    {
                        cpuUsage = Math.Round(((double)(sys - idl) / sys) * 100.0, 1);
                        cpuUsage = Math.Clamp(cpuUsage, 0.0, 100.0);
                        _lastCpuUsage = cpuUsage;
                    }
                }
                _prevIdleTime = idleTime;
                _prevKernelTime = kernelTime;
                _prevUserTime = userTime;
                _hasInitializedCpu = true;
            }
        }
        catch {}

        // 2. RAM Usage via GlobalMemoryStatusEx
        double ramUsedGb = 0;
        double ramTotalGb = 16.0;
        double ramUsagePercent = 0;
        try
        {
            var mem = new MEMORYSTATUSEX();
            if (GlobalMemoryStatusEx(mem))
            {
                ramTotalGb = Math.Round(mem.ullTotalPhys / (1024.0 * 1024.0 * 1024.0), 1);
                var availGb = mem.ullAvailPhys / (1024.0 * 1024.0 * 1024.0);
                ramUsedGb = Math.Round(Math.Max(0, ramTotalGb - availGb), 1);
                ramUsagePercent = mem.dwMemoryLoad;
            }
        }
        catch {}

        // 3. CPU Temperature (ACPI ThermalZone if standard WMI exposes it)
        double? cpuTemp = TryGetCpuTemperature();

        // 4. Drive Telemetry (C: drive)
        double? diskUsagePercent = null;
        double? diskFreeGb = null;
        double? diskTotalGb = null;
        string? diskFormatted = null;
        try
        {
            var systemDrive = Path.GetPathRoot(Environment.SystemDirectory) ?? "C:\\";
            var driveInfo = new DriveInfo(systemDrive);
            if (driveInfo.IsReady && driveInfo.TotalSize > 0)
            {
                diskTotalGb = Math.Round(driveInfo.TotalSize / (1024.0 * 1024.0 * 1024.0), 1);
                diskFreeGb = Math.Round(driveInfo.AvailableFreeSpace / (1024.0 * 1024.0 * 1024.0), 1);
                var usedBytes = driveInfo.TotalSize - driveInfo.AvailableFreeSpace;
                diskUsagePercent = Math.Round((double)usedBytes / driveInfo.TotalSize * 100.0, 1);
                diskFormatted = $"{diskFreeGb:F0} GB livres de {diskTotalGb:F0} GB";
            }
        }
        catch {}

        // 5. System Uptime
        string? uptimeFormatted = null;
        try
        {
            var uptime = TimeSpan.FromMilliseconds(Environment.TickCount64);
            uptimeFormatted = uptime.Days > 0
                ? $"{uptime.Days}d {uptime.Hours}h {uptime.Minutes}m"
                : $"{uptime.Hours}h {uptime.Minutes}m";
        }
        catch {}

        var snapshot = new LiveMetrics(
            CpuUsagePercent: Math.Clamp(cpuUsage, 0, 100),
            CpuTemperatureC: cpuTemp,
            RamUsagePercent: Math.Clamp(ramUsagePercent, 0, 100),
            RamUsedGb: ramUsedGb,
            RamTotalGb: ramTotalGb,
            GpuUsagePercent: null,
            GpuTemperatureC: null,
            GpuName: _cachedGpuName ?? "Placa de Vídeo Detectada",
            UpdatedAtUtc: DateTime.UtcNow,
            DiskUsagePercent: diskUsagePercent,
            DiskFreeGb: diskFreeGb,
            DiskTotalGb: diskTotalGb,
            DiskFormatted: diskFormatted,
            UptimeFormatted: uptimeFormatted
        );

        return Task.FromResult(snapshot);
    }

    private static double? TryGetCpuTemperature()
    {
        try
        {
            using var searcher = new ManagementObjectSearcher(@"root\WMI", "SELECT CurrentTemperature FROM MSAcpi_ThermalZoneTemperature");
            foreach (ManagementObject obj in searcher.Get())
            {
                if (obj["CurrentTemperature"] != null)
                {
                    var tempKelvinTenths = Convert.ToDouble(obj["CurrentTemperature"]);
                    var celsius = (tempKelvinTenths - 2732.0) / 10.0;
                    if (celsius is > 10 and < 115)
                    {
                        return Math.Round(celsius, 1);
                    }
                }
            }
        }
        catch {}

        return null;
    }
}
