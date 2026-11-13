using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Twk.Agent.Core.Models;

namespace Twk.Agent.Infrastructure.Services;

public class ChatService
{
    private static readonly HttpClient HttpClient = new()
    {
        Timeout = TimeSpan.FromSeconds(8)
    };

    private const string ProductionChatUrl = "https://tweaklab-lac.vercel.app/api/chat";

    private readonly string _cacheDirectory;

    public ChatService()
    {
        _cacheDirectory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "TweakLab", "Chats");
        try
        {
            if (!Directory.Exists(_cacheDirectory))
            {
                Directory.CreateDirectory(_cacheDirectory);
            }
        }
        catch {}
    }

    private string GetCacheFilePath(string ticketId)
    {
        var safeName = string.Join("_", (ticketId ?? "geral").Split(Path.GetInvalidFileNameChars()));
        if (string.IsNullOrWhiteSpace(safeName)) safeName = "geral";
        return Path.Combine(_cacheDirectory, $"chat_{safeName.ToLowerInvariant()}.json");
    }

    public async Task<List<AgentChatMessage>> LoadMessagesAsync(string ticketId, string? email = null)
    {
        var localList = LoadFromDisk(ticketId);

        // If completely empty, seed a welcome message
        if (localList.Count == 0)
        {
            var welcome = new AgentChatMessage
            {
                TicketId = ticketId,
                SenderName = "Sistema TweakLab",
                SenderRole = "sistema",
                Content = "Sessão de atendimento iniciada. Use este chat para orientar o cliente, confirmar procedimentos e compartilhar o diagnóstico.",
                SentAt = DateTime.UtcNow
            };
            localList.Add(welcome);
            SaveToDisk(ticketId, localList);
        }

        // Try syncing remote in background
        try
        {
            var remote = await FetchRemoteMessagesAsync(ticketId, email);
            if (remote != null && remote.Count > 0)
            {
                var merged = MergeMessages(localList, remote);
                SaveToDisk(ticketId, merged);
                return merged;
            }
        }
        catch {}

        return localList;
    }

    public async Task<(bool Success, AgentChatMessage Message, string? Error)> SendMessageAsync(
        string ticketId,
        string senderName,
        string senderRole,
        string content,
        string? email = null,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return (false, new AgentChatMessage(), "A mensagem não pode ser vazia.");
        }

        var newMsg = new AgentChatMessage
        {
            TicketId = ticketId,
            SenderName = string.IsNullOrWhiteSpace(senderName) ? "Técnico TWK" : senderName,
            SenderRole = senderRole,
            Content = content.Trim(),
            SentAt = DateTime.UtcNow
        };

        // 1. Immediately persist locally
        var current = LoadFromDisk(ticketId);
        current.Add(newMsg);
        SaveToDisk(ticketId, current);

        // 2. Dispatch to cloud API in fire-and-forget / try-catch
        try
        {
            var payload = new
            {
                ticketId,
                email,
                senderName = newMsg.SenderName,
                senderRole = newMsg.SenderRole,
                content = newMsg.Content,
                sentAt = newMsg.SentAt.ToString("o")
            };

            var json = JsonSerializer.Serialize(payload);
            using var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await HttpClient.PostAsync(ProductionChatUrl, httpContent, ct);
            if (!response.IsSuccessStatusCode)
            {
                // Message saved locally even if cloud fails
                return (true, newMsg, null);
            }
        }
        catch (Exception)
        {
            // Offline / network fallback
            return (true, newMsg, null);
        }

        return (true, newMsg, null);
    }

    public async Task<List<AgentChatMessage>?> FetchRemoteMessagesAsync(
        string ticketId,
        string? email = null,
        CancellationToken ct = default)
    {
        try
        {
            var url = $"{ProductionChatUrl}?ticketId={Uri.EscapeDataString(ticketId)}";
            if (!string.IsNullOrEmpty(email))
            {
                url += $"&email={Uri.EscapeDataString(email)}";
            }

            var response = await HttpClient.GetAsync(url, ct);
            if (!response.IsSuccessStatusCode) return null;

            var json = await response.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.TryGetProperty("messages", out var messagesElem) && messagesElem.ValueKind == JsonValueKind.Array)
            {
                var list = new List<AgentChatMessage>();
                foreach (var item in messagesElem.EnumerateArray())
                {
                    var id = item.TryGetProperty("id", out var idProp) ? idProp.GetString() ?? Guid.NewGuid().ToString("N") : Guid.NewGuid().ToString("N");
                    var tId = item.TryGetProperty("ticketId", out var tProp) ? tProp.GetString() ?? ticketId : ticketId;
                    var sName = item.TryGetProperty("senderName", out var snProp) ? snProp.GetString() ?? "Usuário" : "Usuário";
                    var sRole = item.TryGetProperty("senderRole", out var srProp) ? srProp.GetString() ?? "cliente" : "cliente";
                    var body = item.TryGetProperty("content", out var cProp) ? cProp.GetString() ?? "" : "";
                    var sentAt = DateTime.UtcNow;
                    if (item.TryGetProperty("sentAt", out var timeProp) && DateTime.TryParse(timeProp.GetString(), out var dt))
                    {
                        sentAt = dt.ToUniversalTime();
                    }

                    list.Add(new AgentChatMessage
                    {
                        Id = id,
                        TicketId = tId,
                        SenderName = sName,
                        SenderRole = sRole,
                        Content = body,
                        SentAt = sentAt
                    });
                }
                return list;
            }
        }
        catch {}

        return null;
    }

    private List<AgentChatMessage> LoadFromDisk(string ticketId)
    {
        try
        {
            var path = GetCacheFilePath(ticketId);
            if (!File.Exists(path)) return new List<AgentChatMessage>();

            var json = File.ReadAllText(path, Encoding.UTF8);
            var items = JsonSerializer.Deserialize<List<AgentChatMessage>>(json);
            return items ?? new List<AgentChatMessage>();
        }
        catch
        {
            return new List<AgentChatMessage>();
        }
    }

    private void SaveToDisk(string ticketId, List<AgentChatMessage> messages)
    {
        try
        {
            var path = GetCacheFilePath(ticketId);
            var json = JsonSerializer.Serialize(messages, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(path, json, Encoding.UTF8);
        }
        catch {}
    }

    private static List<AgentChatMessage> MergeMessages(List<AgentChatMessage> local, List<AgentChatMessage> remote)
    {
        var dict = new Dictionary<string, AgentChatMessage>(StringComparer.OrdinalIgnoreCase);

        foreach (var msg in local)
        {
            var key = string.IsNullOrEmpty(msg.Id) ? $"{msg.SenderRole}_{msg.Content}_{msg.SentAt.Ticks}" : msg.Id;
            dict[key] = msg;
        }

        foreach (var msg in remote)
        {
            var key = string.IsNullOrEmpty(msg.Id) ? $"{msg.SenderRole}_{msg.Content}_{msg.SentAt.Ticks}" : msg.Id;
            dict[key] = msg;
        }

        return dict.Values.OrderBy(m => m.SentAt).ToList();
    }
}
