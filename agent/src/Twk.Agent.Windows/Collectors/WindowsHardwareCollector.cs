using System;
using System.Collections.Generic;
using System.Management;
using System.Threading;
using System.Threading.Tasks;
using Twk.Agent.Core.Interfaces;
using Twk.Agent.Core.Models;

namespace Twk.Agent.Windows.Collectors;

public class WindowsHardwareCollector : IHardwareCollector
{
    public Task<HardwareInventory> CollectAsync(CancellationToken cancellationToken = default)
    {
        return Task.Run(() =>
        {
            cancellationToken.ThrowIfCancellationRequested();

            var cpu = CollectCpu();
            cancellationToken.ThrowIfCancellationRequested();

            var ram = CollectRam();
            cancellationToken.ThrowIfCancellationRequested();

            var gpus = CollectGpus();
            cancellationToken.ThrowIfCancellationRequested();

            var disks = CollectDisks();
            cancellationToken.ThrowIfCancellationRequested();

            var mb = CollectMotherboard();
            cancellationToken.ThrowIfCancellationRequested();

            var os = CollectOperatingSystem();

            return new HardwareInventory(cpu, ram, gpus, disks, mb, os, DateTime.UtcNow);
        }, cancellationToken);
    }

    private CpuInfo CollectCpu()
    {
        try
        {
            using var searcher = new ManagementObjectSearcher(
                "SELECT Name, NumberOfCores, NumberOfLogicalProcessors, SocketDesignation, Architecture, Status FROM Win32_Processor");
            foreach (ManagementObject obj in searcher.Get())
            {
                var name = obj["Name"]?.ToString()?.Trim() ?? "Processador Desconhecido";
                var cores = obj["NumberOfCores"] != null ? Convert.ToInt32(obj["NumberOfCores"]) : (int?)null;
                var threads = obj["NumberOfLogicalProcessors"] != null ? Convert.ToInt32(obj["NumberOfLogicalProcessors"]) : (int?)null;
                var archCode = obj["Architecture"] != null ? Convert.ToInt32(obj["Architecture"]) : -1;
                var arch = archCode switch
                {
                    9 => "x64",
                    0 => "x86",
                    12 => "ARM64",
                    _ => "Desconhecido"
                };
                var status = obj["Status"]?.ToString() ?? "OK";
                return new CpuInfo(name, cores, threads, 1, arch, status);
            }
        }
        catch
        {
            // Fallback graceful
        }
        return new CpuInfo("Indisponível", null, null, null, "Desconhecido", "Não Consultado");
    }

    private RamInfo CollectRam()
    {
        long totalBytes = 0;
        var modules = new List<RamModule>();

        try
        {
            using var searcher = new ManagementObjectSearcher(
                "SELECT Capacity, Speed, Manufacturer, PartNumber, BankLabel FROM Win32_PhysicalMemory");
            foreach (ManagementObject obj in searcher.Get())
            {
                var cap = obj["Capacity"] != null ? Convert.ToInt64(obj["Capacity"]) : 0L;
                totalBytes += cap;
                var speed = obj["Speed"] != null ? $"{obj["Speed"]} MT/s" : "Indisponível";
                var mfr = obj["Manufacturer"]?.ToString()?.Trim() ?? "Genérico";
                var part = obj["PartNumber"]?.ToString()?.Trim() ?? "N/A";
                var bank = obj["BankLabel"]?.ToString()?.Trim() ?? "Slot";
                var formatted = $"{cap / (1024.0 * 1024.0 * 1024.0):F1} GiB";

                modules.Add(new RamModule(formatted, cap, speed, mfr, part, bank));
            }
        }
        catch
        {
        }

        var totalFormatted = totalBytes > 0 
            ? $"{totalBytes / (1024.0 * 1024.0 * 1024.0):F1} GiB" 
            : "Indisponível";

        return new RamInfo(totalFormatted, totalBytes, modules);
    }

    private IReadOnlyList<GpuInfo> CollectGpus()
    {
        var list = new List<GpuInfo>();
        try
        {
            using var searcher = new ManagementObjectSearcher(
                "SELECT Name, DriverVersion, AdapterRAM, Status FROM Win32_VideoController");
            foreach (ManagementObject obj in searcher.Get())
            {
                var name = obj["Name"]?.ToString()?.Trim() ?? "Placa de Vídeo";
                var driver = obj["DriverVersion"]?.ToString()?.Trim() ?? "Indisponível";
                var status = obj["Status"]?.ToString() ?? "OK";

                long? vramBytes = null;
                string vramFormatted = "Indisponível";
                if (obj["AdapterRAM"] != null)
                {
                    var ramUint = Convert.ToInt64(obj["AdapterRAM"]);
                    if (ramUint > 0)
                    {
                        vramBytes = ramUint;
                        vramFormatted = $"{ramUint / (1024.0 * 1024.0 * 1024.0):F1} GiB (WMI)";
                    }
                }

                list.Add(new GpuInfo(name, driver, vramFormatted, vramBytes, status));
            }
        }
        catch
        {
        }

        if (list.Count == 0)
        {
            list.Add(new GpuInfo("Indisponível", "N/A", "N/A", null, "Não Detectado"));
        }
        return list;
    }

    private IReadOnlyList<DiskInfo> CollectDisks()
    {
        var list = new List<DiskInfo>();
        try
        {
            using var searcher = new ManagementObjectSearcher(
                "SELECT Model, Size, InterfaceType, Status FROM Win32_DiskDrive");
            foreach (ManagementObject obj in searcher.Get())
            {
                var model = obj["Model"]?.ToString()?.Trim() ?? "Disco";
                var size = obj["Size"] != null ? Convert.ToInt64(obj["Size"]) : 0L;
                var bus = obj["InterfaceType"]?.ToString()?.Trim() ?? "Desconhecido";
                var status = obj["Status"]?.ToString() ?? "OK";
                var formatted = size > 0 ? $"{size / (1000.0 * 1000.0 * 1000.0):F0} GB" : "Indisponível";

                list.Add(new DiskInfo(model, formatted, size, "Físico", bus, status));
            }
        }
        catch
        {
        }
        return list;
    }

    private MotherboardInfo CollectMotherboard()
    {
        string mfr = "Indisponível";
        string model = "Indisponível";
        string biosVer = "Indisponível";
        string biosDate = "Indisponível";

        try
        {
            using var searcherMb = new ManagementObjectSearcher("SELECT Manufacturer, Product FROM Win32_BaseBoard");
            foreach (ManagementObject obj in searcherMb.Get())
            {
                mfr = obj["Manufacturer"]?.ToString()?.Trim() ?? mfr;
                model = obj["Product"]?.ToString()?.Trim() ?? model;
                break;
            }

            using var searcherBios = new ManagementObjectSearcher("SELECT SMBIOSBIOSVersion, ReleaseDate FROM Win32_BIOS");
            foreach (ManagementObject obj in searcherBios.Get())
            {
                biosVer = obj["SMBIOSBIOSVersion"]?.ToString()?.Trim() ?? biosVer;
                biosDate = obj["ReleaseDate"]?.ToString()?.Trim() ?? biosDate;
                break;
            }
        }
        catch
        {
        }

        return new MotherboardInfo(mfr, model, biosVer, biosDate);
    }

    private OperatingSystemInfo CollectOperatingSystem()
    {
        string caption = "Microsoft Windows";
        string version = "Indisponível";
        string build = "Indisponível";
        string arch = "x64";
        string? uptime = null;

        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT Caption, Version, BuildNumber, OSArchitecture, LastBootUpTime FROM Win32_OperatingSystem");
            foreach (ManagementObject obj in searcher.Get())
            {
                caption = obj["Caption"]?.ToString()?.Trim() ?? caption;
                version = obj["Version"]?.ToString()?.Trim() ?? version;
                build = obj["BuildNumber"]?.ToString()?.Trim() ?? build;
                arch = obj["OSArchitecture"]?.ToString()?.Trim() ?? arch;

                if (obj["LastBootUpTime"] != null)
                {
                    uptime = ManagementDateTimeConverter.ToDateTime(obj["LastBootUpTime"].ToString()).ToString("dd/MM/yyyy HH:mm:ss");
                }
                break;
            }
        }
        catch
        {
        }

        return new OperatingSystemInfo(caption, version, build, arch, uptime);
    }
}
