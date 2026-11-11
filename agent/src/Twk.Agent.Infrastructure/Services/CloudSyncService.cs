using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Twk.Agent.Core.Models;

namespace Twk.Agent.Infrastructure.Services;

public class CloudSyncService
{
    private static readonly HttpClient HttpClient = new()
    {
        Timeout = TimeSpan.FromSeconds(15)
    };

    private const string ProductionSyncUrl = "https://tweaklab-lac.vercel.app/api/agent-sync";

    public async Task<(bool Success, string Message)> SyncEvidenceAsync(
        string email,
        object evidenceEnvelope,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var payload = new
            {
                email = email.Trim().ToLowerInvariant(),
                envelope = evidenceEnvelope
            };

            var json = JsonSerializer.Serialize(payload);
            using var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await HttpClient.PostAsync(ProductionSyncUrl, content, cancellationToken);
            var responseString = await response.Content.ReadAsStringAsync(cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                return (true, "Evidência sincronizada na nuvem com a conta TweakLab!");
            }

            return (false, $"Servidor retornou código {response.StatusCode}: {responseString}");
        }
        catch (Exception ex)
        {
            return (false, $"Erro na sincronização: {ex.Message}");
        }
    }
}
