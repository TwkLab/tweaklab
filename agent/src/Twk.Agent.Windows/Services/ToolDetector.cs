using System;
using System.Collections.Generic;
using System.IO;
using Microsoft.Win32;
using Twk.Agent.Core.Models;

namespace Twk.Agent.Windows.Services;

public static class ToolDetector
{
    public static List<TechnicianTool> DetectInstalledTools(IReadOnlyList<TechnicianTool> tools)
    {
        var result = new List<TechnicianTool>(tools.Count);
        var registryMap = ScanRegistryForTools();

        var pf = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
        var pfx86 = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86);
        var localApp = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);

        foreach (var tool in tools)
        {
            // 1. Check registry map first
            if (registryMap.TryGetValue(tool.Id.ToLowerInvariant(), out var regPath) && File.Exists(regPath))
            {
                result.Add(tool with { IsInstalled = true, ExecutablePath = regPath });
                continue;
            }

            // 2. Check filesystem heuristics
            var fsPath = FindExecutable(tool.Id, pf, pfx86, localApp, appData);
            if (!string.IsNullOrEmpty(fsPath) && File.Exists(fsPath))
            {
                result.Add(tool with { IsInstalled = true, ExecutablePath = fsPath });
            }
            else
            {
                result.Add(tool);
            }
        }

        return result;
    }

    private static Dictionary<string, string> ScanRegistryForTools()
    {
        var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        try
        {
            var hives = new[]
            {
                (RegistryHive.LocalMachine, RegistryView.Registry64),
                (RegistryHive.LocalMachine, RegistryView.Registry32),
                (RegistryHive.CurrentUser, RegistryView.Default)
            };

            const string uninstallKey = @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall";

            foreach (var (hive, view) in hives)
            {
                try
                {
                    using var baseKey = RegistryKey.OpenBaseKey(hive, view);
                    using var subKey = baseKey.OpenSubKey(uninstallKey);
                    if (subKey == null) continue;

                    foreach (var name in subKey.GetSubKeyNames())
                    {
                        try
                        {
                            using var appKey = subKey.OpenSubKey(name);
                            if (appKey == null) continue;

                            var dispName = appKey.GetValue("DisplayName")?.ToString() ?? "";
                            var dispIcon = appKey.GetValue("DisplayIcon")?.ToString() ?? "";
                            var installLoc = appKey.GetValue("InstallLocation")?.ToString() ?? "";

                            string? cleanIcon = null;
                            if (!string.IsNullOrWhiteSpace(dispIcon))
                            {
                                cleanIcon = dispIcon.Trim('"', ' ').Split(',')[0].Trim();
                            }

                            MatchTool(map, dispName, cleanIcon, installLoc);
                        }
                        catch {}
                    }
                }
                catch {}
            }
        }
        catch {}

        return map;
    }

    private static void MatchTool(Dictionary<string, string> map, string name, string? iconPath, string? installLoc)
    {
        if (string.IsNullOrWhiteSpace(name)) return;
        var n = name.ToLowerInvariant();

        void AddIfValid(string id, string? candidate, params string[] fallbacks)
        {
            if (map.ContainsKey(id)) return;
            if (!string.IsNullOrEmpty(candidate) && File.Exists(candidate) && candidate.EndsWith(".exe", StringComparison.OrdinalIgnoreCase) && !candidate.Contains("unins", StringComparison.OrdinalIgnoreCase))
            {
                map[id] = candidate;
                return;
            }
            foreach (var fb in fallbacks)
            {
                if (File.Exists(fb))
                {
                    map[id] = fb;
                    return;
                }
            }
        }

        if (n.Contains("7-zip"))
        {
            AddIfValid("7zip", iconPath, @"C:\Program Files\7-Zip\7zFM.exe", @"C:\Program Files (x86)\7-Zip\7zFM.exe");
        }
        else if (n.Contains("cpu-z") || n.Contains("cpuid"))
        {
            AddIfValid("cpuz", iconPath, @"C:\Program Files\CPUID\CPU-Z\cpuz.exe");
        }
        else if (n.Contains("gpu-z") || n.Contains("techpowerup"))
        {
            AddIfValid("gpuz", iconPath, @"C:\Program Files (x86)\GPU-Z\GPU-Z.exe", @"C:\Program Files\GPU-Z\GPU-Z.exe");
        }
        else if (n.Contains("hwinfo"))
        {
            AddIfValid("hwinfo", iconPath, @"C:\Program Files\HWiNFO64\HWiNFO64.exe", @"C:\Program Files\HWiNFO\HWiNFO64.exe");
        }
        else if (n.Contains("crystaldiskinfo"))
        {
            AddIfValid("crystaldiskinfo", iconPath, @"C:\Program Files\CrystalDiskInfo\DiskInfo64.exe");
        }
        else if (n.Contains("rustdesk"))
        {
            AddIfValid("rustdesk", iconPath, @"C:\Program Files\RustDesk\RustDesk.exe", @"C:\Program Files\RustDesk\rustdesk.exe");
        }
        else if (n.Contains("wiztree"))
        {
            AddIfValid("wiztree", iconPath, @"C:\Program Files\WizTree\WizTree.exe", @"C:\Program Files\WizTree\WizTree64.exe");
        }
        else if (n.Contains("afterburner"))
        {
            AddIfValid("msiafterburner", null, @"C:\Program Files (x86)\MSI Afterburner\MSIAfterburner.exe", @"C:\Program Files\MSI Afterburner\MSIAfterburner.exe");
        }
        else if (n.Contains("rivatuner") || n.Contains("rtss"))
        {
            AddIfValid("rtss", null, @"C:\Program Files (x86)\RivaTuner Statistics Server\RTSS.exe", @"C:\Program Files\RivaTuner Statistics Server\RTSS.exe");
        }
        else if (n.Contains("display driver uninstaller") || n.Contains("ddu"))
        {
            AddIfValid("ddu", iconPath, @"C:\Program Files (x86)\Display Driver Uninstaller\Display Driver Uninstaller.exe", @"C:\Program Files\Display Driver Uninstaller\Display Driver Uninstaller.exe");
        }
        else if (n.Contains("capframex"))
        {
            AddIfValid("capframex", iconPath, Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "CapFrameX", "CapFrameX.exe"));
        }
        else if (n.Contains("presentmon"))
        {
            AddIfValid("presentmon", iconPath, @"C:\Program Files\Intel\PresentMon\PresentMon.exe");
        }
        else if (n.Contains("windbg"))
        {
            AddIfValid("windbg", iconPath, Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Microsoft", "WindowsApps", "windbg.exe"));
        }
        else if (n.Contains("occt"))
        {
            AddIfValid("occt", iconPath, @"C:\Program Files\OCCT\OCCT.exe", Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "OCCT", "OCCT.exe"));
        }
    }

    private static string? FindExecutable(string toolId, string pf, string pfx86, string localApp, string appData)
    {
        try
        {
            switch (toolId.ToLowerInvariant())
            {
                case "rustdesk":
                    return CheckFirst(
                        Path.Combine(pf, "RustDesk", "RustDesk.exe"),
                        Path.Combine(pf, "RustDesk", "rustdesk.exe"),
                        Path.Combine(localApp, "Programs", "RustDesk", "rustdesk.exe"),
                        Path.Combine(localApp, "Programs", "RustDesk", "RustDesk.exe"));

                case "hwinfo":
                    return CheckFirst(
                        Path.Combine(pf, "HWiNFO64", "HWiNFO64.exe"),
                        Path.Combine(pf, "HWiNFO", "HWiNFO64.exe"),
                        Path.Combine(pfx86, "HWiNFO32", "HWiNFO32.exe"),
                        Path.Combine(pfx86, "HWiNFO", "HWiNFO32.exe"));

                case "cpuz":
                    return CheckFirst(
                        Path.Combine(pf, "CPUID", "CPU-Z", "cpuz.exe"),
                        Path.Combine(pf, "CPUID", "CPU-Z", "cpuz64.exe"),
                        Path.Combine(pfx86, "CPUID", "CPU-Z", "cpuz.exe"));

                case "gpuz":
                    return CheckFirst(
                        Path.Combine(pfx86, "GPU-Z", "GPU-Z.exe"),
                        Path.Combine(pf, "GPU-Z", "GPU-Z.exe"),
                        Path.Combine(localApp, "Programs", "GPU-Z", "GPU-Z.exe"));

                case "crystaldiskinfo":
                    return CheckFirst(
                        Path.Combine(pf, "CrystalDiskInfo", "DiskInfo64.exe"),
                        Path.Combine(pfx86, "CrystalDiskInfo", "DiskInfo64.exe"),
                        Path.Combine(pf, "CrystalDiskInfo", "DiskInfo32.exe"),
                        Path.Combine(pfx86, "CrystalDiskInfo", "DiskInfo32.exe"));

                case "windbg":
                    return CheckFirst(
                        Path.Combine(localApp, "Microsoft", "WindowsApps", "windbg.exe"),
                        Path.Combine(pf, "Windows Kits", "10", "Debuggers", "x64", "windbg.exe"));

                case "capframex":
                    return CheckFirst(
                        Path.Combine(localApp, "CapFrameX", "CapFrameX.exe"),
                        Path.Combine(pf, "CapFrameX", "CapFrameX.exe"),
                        Path.Combine(pfx86, "CapFrameX", "CapFrameX.exe"));

                case "presentmon":
                    return CheckFirst(
                        Path.Combine(pf, "Intel", "PresentMon", "PresentMon.exe"),
                        Path.Combine(pf, "Intel Corporation", "Intel PresentMon", "PresentMon.exe"));

                case "msiafterburner":
                    return CheckFirst(
                        Path.Combine(pfx86, "MSI Afterburner", "MSIAfterburner.exe"),
                        Path.Combine(pf, "MSI Afterburner", "MSIAfterburner.exe"));

                case "rtss":
                    return CheckFirst(
                        Path.Combine(pfx86, "RivaTuner Statistics Server", "RTSS.exe"),
                        Path.Combine(pf, "RivaTuner Statistics Server", "RTSS.exe"));

                case "ddu":
                    return CheckFirst(
                        Path.Combine(pfx86, "Display Driver Uninstaller", "Display Driver Uninstaller.exe"),
                        Path.Combine(pf, "Display Driver Uninstaller", "Display Driver Uninstaller.exe"),
                        Path.Combine(pfx86, "Display Driver Uninstaller", "DDU.exe"),
                        Path.Combine(pf, "Display Driver Uninstaller", "DDU.exe"));

                case "occt":
                    return CheckFirst(
                        Path.Combine(pf, "OCCT", "OCCT.exe"),
                        Path.Combine(localApp, "Programs", "OCCT", "OCCT.exe"),
                        Path.Combine(pfx86, "OCCT", "OCCT.exe"));

                case "wiztree":
                    return CheckFirst(
                        Path.Combine(pf, "WizTree", "WizTree.exe"),
                        Path.Combine(pf, "WizTree", "WizTree64.exe"),
                        Path.Combine(pfx86, "WizTree", "WizTree.exe"),
                        Path.Combine(pfx86, "WizTree", "WizTree64.exe"));

                case "7zip":
                    return CheckFirst(
                        Path.Combine(pf, "7-Zip", "7zFM.exe"),
                        Path.Combine(pfx86, "7-Zip", "7zFM.exe"));

                default:
                    return null;
            }
        }
        catch
        {
            return null;
        }
    }

    private static string? CheckFirst(params string[] paths)
    {
        foreach (var p in paths)
        {
            if (File.Exists(p)) return p;
        }
        return null;
    }
}
