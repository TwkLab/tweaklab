using System;
using System.Collections.Generic;
using Twk.Agent.Core.Models;

namespace Twk.Agent.Core.Services;

public static class RamModelDecoder
{
    public static string DecodeCommercialModel(string manufacturer, string partNumber)
    {
        var part = (partNumber ?? "").Trim().ToUpperInvariant();
        var mfr = (manufacturer ?? "").Trim().ToUpperInvariant();

        // 1. ADATA / XPG
        if (mfr.Contains("A-DATA") || mfr.Contains("ADATA") || mfr.Contains("XPG") || part.StartsWith("AX4") || part.StartsWith("AX5"))
        {
            if (part.Contains("D41") || part.Contains("BT41") || part.Contains("ST41"))
                return "XPG Spectrix D41";
            if (part.Contains("D50"))
                return "XPG Spectrix D50";
            if (part.Contains("D60"))
                return "XPG Spectrix D60G";
            if (part.Contains("D30"))
                return "XPG Gammix D30";
            if (part.Contains("D10"))
                return "XPG Gammix D10";
            if (part.Contains("D35"))
                return "XPG Gammix D35";
            if (part.Contains("LANCER") || part.StartsWith("AX5U"))
                return "XPG Lancer DDR5";
            if (part.Contains("CASTER"))
                return "XPG Caster DDR5";

            if (part.Length > 4 && !part.StartsWith("DDR"))
                return $"XPG {part}";
            return "XPG Spectrix D41";
        }

        // 2. Corsair
        if (mfr.Contains("CORSAIR") || part.StartsWith("CM"))
        {
            if (part.StartsWith("CMW") || part.Contains("RGB PRO"))
                return "Corsair Vengeance RGB PRO";
            if (part.StartsWith("CMK"))
                return "Corsair Vengeance LPX";
            if (part.StartsWith("CMH"))
                return "Corsair Vengeance RGB";
            if (part.StartsWith("CMT"))
                return "Corsair Dominator Platinum";
            if (part.StartsWith("CMP"))
                return "Corsair Dominator Titanium";
            return "Corsair Vengeance";
        }

        // 3. Kingston / HyperX
        if (mfr.Contains("KINGSTON") || mfr.Contains("HYPERX") || part.StartsWith("KF4") || part.StartsWith("KF5") || part.StartsWith("HX4"))
        {
            if (part.Contains("RENEGADE"))
                return "Kingston FURY Renegade";
            if (part.Contains("BEAST") || part.Contains("BB") || part.StartsWith("KF"))
                return "Kingston FURY Beast";
            if (part.StartsWith("HX4") && part.Contains("PREDATOR"))
                return "HyperX Predator";
            if (part.StartsWith("HX4"))
                return "HyperX Fury";
            return "Kingston FURY";
        }

        // 4. G.Skill
        if (mfr.Contains("G.SKILL") || mfr.Contains("GSKILL") || part.StartsWith("F4-") || part.StartsWith("F5-"))
        {
            if (part.Contains("TZ5") || part.Contains("TRIDENT Z5"))
                return "G.Skill Trident Z5";
            if (part.Contains("GTZR") || part.Contains("GTZN") || part.Contains("TRIDENT"))
                return "G.Skill Trident Z RGB";
            if (part.Contains("RIPJAWS") || part.Contains("GVK"))
                return "G.Skill Ripjaws V";
            if (part.Contains("FLARE") || part.Contains("FX"))
                return "G.Skill Flare X5";
            return "G.Skill Trident Z";
        }

        // 5. TeamGroup / T-Force
        if (mfr.Contains("TEAM") || part.StartsWith("TF"))
        {
            if (part.Contains("DELTA") || part.StartsWith("TF3") || part.StartsWith("TF4"))
                return "T-Force Delta RGB";
            if (part.Contains("VULCAN"))
                return "T-Force Vulcan";
            if (part.Contains("XTREEM"))
                return "T-Force Xtreem";
            return "T-Force Gaming";
        }

        // 6. Crucial / Ballistix
        if (mfr.Contains("CRUCIAL") || mfr.Contains("MICRON") || part.StartsWith("BL"))
        {
            if (part.StartsWith("BL"))
                return "Crucial Ballistix";
            if (part.StartsWith("CP"))
                return "Crucial Pro";
            return "Crucial DDR4/DDR5";
        }

        if (!string.IsNullOrWhiteSpace(partNumber) && partNumber != "N/A" && !partNumber.StartsWith("DDR"))
        {
            return $"{CleanManufacturer(manufacturer)} {partNumber}";
        }

        return CleanManufacturer(manufacturer);
    }

    public static string ResolveKitSummary(IReadOnlyList<RamModule> modules, string totalFormatted)
    {
        if (modules == null || modules.Count == 0) return totalFormatted;

        string? primaryModel = null;
        string? speed = null;

        foreach (var mod in modules)
        {
            if (!string.IsNullOrEmpty(mod.Speed) && mod.Speed != "Indisponível")
            {
                speed = mod.Speed;
            }

            var decoded = DecodeCommercialModel(mod.Manufacturer, mod.PartNumber);
            if (!string.IsNullOrEmpty(decoded) && !decoded.Contains("Genérico"))
            {
                primaryModel = decoded;
            }
        }

        if (string.IsNullOrEmpty(primaryModel))
        {
            primaryModel = "Memória RAM";
        }

        var channel = modules.Count switch
        {
            1 => "Single-Channel",
            2 => "Dual-Channel",
            4 => "Quad-Channel",
            _ => $"{modules.Count}x Módulos"
        };

        var speedPart = !string.IsNullOrEmpty(speed) ? $" @ {speed}" : "";
        return $"{primaryModel} ({totalFormatted} • {channel}{speedPart})";
    }

    private static string CleanManufacturer(string? mfr)
    {
        var m = (mfr ?? "").Trim();
        if (m.Contains("A-DATA", StringComparison.OrdinalIgnoreCase) || m.Contains("ADATA", StringComparison.OrdinalIgnoreCase))
            return "ADATA / XPG";
        return string.IsNullOrEmpty(m) ? "Memória RAM" : m;
    }
}
