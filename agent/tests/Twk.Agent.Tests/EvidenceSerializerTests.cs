using System;
using System.Collections.Generic;
using Twk.Agent.Core.Models;
using Twk.Agent.Infrastructure.Serialization;
using Xunit;

namespace Twk.Agent.Tests;

public class EvidenceSerializerTests
{
    [Fact]
    public void Serialize_ProducesDeterministicSha256Digest()
    {
        // Arrange
        var serializer = new EvidenceSerializer();
        var hardware = new HardwareInventory(
            Cpu: new CpuInfo("AMD Ryzen 7 5700X 8-Core Processor", 8, 16, 1, "x64", "OK"),
            Ram: new RamInfo("32.0 GB", 34359738368, new List<RamModule>
            {
                new RamModule("16.0 GB", 17179869184, "3200 MHz", "Kingston", "KF3200C16D4/16GX", "BANK 0"),
                new RamModule("16.0 GB", 17179869184, "3200 MHz", "Kingston", "KF3200C16D4/16GX", "BANK 2")
            }),
            Gpus: new List<GpuInfo>
            {
                new GpuInfo("NVIDIA GeForce RTX 3070", "552.22", "8.0 GB", 8589934592, "OK")
            },
            Disks: new List<DiskInfo>
            {
                new DiskInfo("KINGSTON SKC3000S1024G", "1024 GB", 1024209543168, "SSD", "NVMe", "OK")
            },
            Motherboard: new MotherboardInfo("Gigabyte Technology Co., Ltd.", "B550M AORUS ELITE", "F17", "2023-11-20"),
            OperatingSystem: new OperatingSystemInfo("Microsoft Windows 11 Pro", "10.0.22631", "23H2", "64-bit", "3 days"),
            CapturedAtUtc: new DateTime(2026, 11, 11, 0, 0, 0, DateTimeKind.Utc)
        );

        var consent = new ConsentReceipt(
            NoticeVersion: "1.0",
            Categories: new List<string> { "hardware_inventory" },
            ConfirmedAtUtc: new DateTime(2026, 11, 11, 0, 0, 1, DateTimeKind.Utc),
            PayloadDigest: "pending"
        );

        var envelope = new EvidenceEnvelope<HardwareInventory>(
            SchemaVersion: 1,
            ClientEvidenceId: Guid.Parse("11111111-2222-3333-4444-555555555555"),
            AgentVersion: "0.1.0",
            LinkId: null,
            CapturedAtUtc: new DateTime(2026, 11, 11, 0, 0, 0, DateTimeKind.Utc),
            Kind: "hardware_inventory",
            Consent: consent,
            Payload: hardware
        );

        // Act
        var json1 = serializer.SerializeSanitized(envelope);
        var digest1 = serializer.ComputeDigest(json1);

        var json2 = serializer.SerializeSanitized(envelope);
        var digest2 = serializer.ComputeDigest(json2);

        // Assert
        Assert.NotEmpty(json1);
        Assert.Equal(digest1, digest2);
        Assert.StartsWith("sha256:", digest1);
        Assert.Contains("AMD Ryzen 7 5700X", json1);
        Assert.Contains("NVIDIA GeForce RTX 3070", json1);
    }
}
