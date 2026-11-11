using System.Threading;
using System.Threading.Tasks;
using Twk.Agent.Core.Models;

namespace Twk.Agent.Core.Interfaces;

public interface IHardwareCollector
{
    Task<HardwareInventory> CollectAsync(CancellationToken cancellationToken = default);
}

public interface IEvidenceSerializer
{
    string SerializeSanitized<T>(EvidenceEnvelope<T> envelope);
    string ComputeDigest(string content);
}
