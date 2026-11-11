using System;
using System.Collections.Generic;

namespace Twk.Agent.Core.Models;

public record ConsentReceipt(
    string NoticeVersion,
    IReadOnlyList<string> Categories,
    DateTime ConfirmedAtUtc,
    string PayloadDigest
);

public record EvidenceEnvelope<T>(
    int SchemaVersion,
    Guid ClientEvidenceId,
    string AgentVersion,
    string? LinkId,
    DateTime CapturedAtUtc,
    string Kind,
    ConsentReceipt Consent,
    T Payload
);
