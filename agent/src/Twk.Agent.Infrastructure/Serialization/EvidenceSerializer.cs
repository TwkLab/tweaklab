using System;
using System.Security.Cryptography;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using Twk.Agent.Core.Interfaces;
using Twk.Agent.Core.Models;

namespace Twk.Agent.Infrastructure.Serialization;

public class EvidenceSerializer : IEvidenceSerializer
{
    private static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public string SerializeSanitized<T>(EvidenceEnvelope<T> envelope)
    {
        return JsonSerializer.Serialize(envelope, Options);
    }

    public string ComputeDigest(string content)
    {
        var bytes = Encoding.UTF8.GetBytes(content);
        var hash = SHA256.HashData(bytes);
        return $"sha256:{Convert.ToHexString(hash).ToLowerInvariant()}";
    }
}
