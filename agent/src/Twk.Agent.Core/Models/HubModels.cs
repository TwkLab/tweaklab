using System;

namespace Twk.Agent.Core.Models;

public record LiveMetrics(
    double CpuUsagePercent,
    double? CpuTemperatureC,
    double RamUsagePercent,
    double RamUsedGb,
    double RamTotalGb,
    double? GpuUsagePercent,
    double? GpuTemperatureC,
    string? GpuName,
    DateTime UpdatedAtUtc,
    double? DiskUsagePercent = null,
    double? DiskFreeGb = null,
    double? DiskTotalGb = null,
    string? DiskFormatted = null,
    string? UptimeFormatted = null
);

public record TechnicianTool(
    string Id,
    string Name,
    string Category,
    string Description,
    string OfficialSiteUrl,
    string DownloadUrl,
    string RecommendedUse,
    string IconKey,
    bool IsInstalled = false,
    string? ExecutablePath = null
);

public record AgentUserProfile(
    string Name,
    string Email,
    string? TicketCode,
    string? Token,
    DateTime LoggedInAtUtc
);
