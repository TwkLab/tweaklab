using System;
using System.Collections.Generic;
using System.IO;
using Twk.Agent.Core.Models;

namespace Twk.Agent.Windows.Services;

public static class ToolDetector
{
    public static List<TechnicianTool> DetectInstalledTools(IReadOnlyList<TechnicianTool> tools)
    {
        var result = new List<TechnicianTool>(tools.Count);
        var programFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
        var programFilesX86 = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86);
        var localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);

        foreach (var tool in tools)
        {
            var detectedPath = FindExecutable(tool.Id, programFiles, programFilesX86, localAppData);
            if (!string.IsNullOrEmpty(detectedPath) && File.Exists(detectedPath))
            {
                result.Add(tool with { IsInstalled = true, ExecutablePath = detectedPath });
            }
            else
            {
                result.Add(tool);
            }
        }

        return result;
    }

    private static string? FindExecutable(string toolId, string pf, string pfx86, string localApp)
    {
        try
        {
            switch (toolId.ToLowerInvariant())
            {
                case "rustdesk":
                    return CheckFirst(
                        Path.Combine(pf, "RustDesk", "rustdesk.exe"),
                        Path.Combine(localApp, "Programs", "RustDesk", "rustdesk.exe"));

                case "hwinfo":
                    return CheckFirst(
                        Path.Combine(pf, "HWiNFO64", "HWiNFO64.exe"),
                        Path.Combine(pf, "HWiNFO", "HWiNFO64.exe"),
                        Path.Combine(pfx86, "HWiNFO32", "HWiNFO32.exe"));

                case "cpuz":
                    return CheckFirst(
                        Path.Combine(pf, "CPUID", "CPU-Z", "cpuz.exe"),
                        Path.Combine(pfx86, "CPUID", "CPU-Z", "cpuz.exe"));

                case "gpuz":
                    return CheckFirst(
                        Path.Combine(pf, "GPU-Z", "GPU-Z.exe"),
                        Path.Combine(localApp, "Programs", "GPU-Z", "GPU-Z.exe"));

                case "crystaldiskinfo":
                    return CheckFirst(
                        Path.Combine(pf, "CrystalDiskInfo", "DiskInfo64.exe"),
                        Path.Combine(pfx86, "CrystalDiskInfo", "DiskInfo32.exe"));

                case "windbg":
                    return CheckFirst(
                        Path.Combine(localApp, "Microsoft", "WindowsApps", "windbg.exe"),
                        Path.Combine(pf, "Windows Kits", "10", "Debuggers", "x64", "windbg.exe"));

                case "capframex":
                    return CheckFirst(
                        Path.Combine(localApp, "CapFrameX", "CapFrameX.exe"),
                        Path.Combine(pf, "CapFrameX", "CapFrameX.exe"));

                case "presentmon":
                    return CheckFirst(
                        Path.Combine(pf, "Intel", "PresentMon", "PresentMon.exe"));

                case "msiafterburner":
                    return CheckFirst(
                        Path.Combine(pfx86, "MSI Afterburner", "MSIAfterburner.exe"),
                        Path.Combine(pf, "MSI Afterburner", "MSIAfterburner.exe"));

                case "rtss":
                    return CheckFirst(
                        Path.Combine(pfx86, "RivaTuner Statistics Server", "RTSS.exe"),
                        Path.Combine(pf, "RivaTuner Statistics Server", "RTSS.exe"));

                case "occt":
                    return CheckFirst(
                        Path.Combine(pf, "OCCT", "OCCT.exe"),
                        Path.Combine(localApp, "Programs", "OCCT", "OCCT.exe"));

                case "wiztree":
                    return CheckFirst(
                        Path.Combine(pf, "WizTree", "WizTree64.exe"),
                        Path.Combine(pfx86, "WizTree", "WizTree.exe"));

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
