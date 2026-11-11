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
    DateTime UpdatedAtUtc
);

public record TechnicianTool(
    string Id,
    string Name,
    string Category,
    string Description,
    string OfficialSiteUrl,
    string DownloadUrl,
    string RecommendedUse,
    string IconKey
);

public record AgentUserProfile(
    string Name,
    string Email,
    string? TicketCode,
    string? Token,
    DateTime LoggedInAtUtc
);
