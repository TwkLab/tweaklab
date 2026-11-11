using System;
using System.Collections.Generic;

namespace Twk.Agent.Core.Models;

public record HardwareInventory(
    CpuInfo Cpu,
    RamInfo Ram,
    IReadOnlyList<GpuInfo> Gpus,
    IReadOnlyList<DiskInfo> Disks,
    MotherboardInfo Motherboard,
    OperatingSystemInfo OperatingSystem,
    DateTime CapturedAtUtc
);

public record CpuInfo(
    string Model,
    int? PhysicalCores,
    int? LogicalProcessors,
    int? NumberOfSockets,
    string Architecture,
    string Status
);

public record RamModule(
    string CapacityFormatted,
    long CapacityBytes,
    string Speed,
    string Manufacturer,
    string PartNumber,
    string BankLabel,
    string? CommercialModel = null
);

public record RamInfo(
    string TotalFormatted,
    long TotalBytes,
    IReadOnlyList<RamModule> Modules,
    string? CommercialSummary = null
);

public record GpuInfo(
    string Model,
    string DriverVersion,
    string DedicatedVramFormatted,
    long? DedicatedVramBytes,
    string Status
);

public record DiskInfo(
    string Model,
    string SizeFormatted,
    long SizeBytes,
    string MediaType,
    string BusType,
    string Status
);

public record MotherboardInfo(
    string Manufacturer,
    string Model,
    string BiosVersion,
    string BiosReleaseDate
);

public record OperatingSystemInfo(
    string Caption,
    string Version,
    string BuildNumber,
    string Architecture,
    string? BootUptime
);
