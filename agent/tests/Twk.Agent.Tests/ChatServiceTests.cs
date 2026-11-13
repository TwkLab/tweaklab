using System;
using System.IO;
using System.Threading.Tasks;
using Twk.Agent.Core.Models;
using Twk.Agent.Infrastructure.Services;
using Xunit;

namespace Twk.Agent.Tests;

public class ChatServiceTests
{
    [Fact]
    public void AgentChatMessage_RolesAndBadges_IdentifyCorrectly()
    {
        var techMsg = new AgentChatMessage
        {
            SenderName = "Técnico TWK",
            SenderRole = "tecnico",
            Content = "Olá cliente!"
        };

        var clientMsg = new AgentChatMessage
        {
            SenderName = "João",
            SenderRole = "cliente",
            Content = "Estou com problemas de FPS."
        };

        var sysMsg = new AgentChatMessage
        {
            SenderName = "Sistema",
            SenderRole = "sistema",
            Content = "Sessão iniciada."
        };

        Assert.True(techMsg.IsFromTechnician);
        Assert.False(techMsg.IsFromClient);
        Assert.Equal("TÉCNICO TWK", techMsg.RoleBadge);

        Assert.True(clientMsg.IsFromClient);
        Assert.False(clientMsg.IsFromTechnician);
        Assert.Equal("CLIENTE", clientMsg.RoleBadge);

        Assert.True(sysMsg.IsSystem);
        Assert.Equal("SISTEMA", sysMsg.RoleBadge);
    }

    [Fact]
    public async Task ChatService_SendMessage_PersistsAndLoadsLocally()
    {
        var service = new ChatService();
        var testTicket = "TEST-TICKET-" + Guid.NewGuid().ToString("N")[..8];

        var (success, msg, error) = await service.SendMessageAsync(
            testTicket,
            "Técnico Teste",
            "tecnico",
            "Mensagem de teste unitário.");

        Assert.True(success);
        Assert.Null(error);
        Assert.Equal("Mensagem de teste unitário.", msg.Content);

        var loaded = await service.LoadMessagesAsync(testTicket);
        Assert.Contains(loaded, m => m.Content == "Mensagem de teste unitário.");
    }

    [Fact]
    public async Task ChatService_SendEmptyMessage_ReturnsError()
    {
        var service = new ChatService();
        var testTicket = "TEST-EMPTY";

        var (success, _, error) = await service.SendMessageAsync(
            testTicket,
            "Técnico",
            "tecnico",
            "   ");

        Assert.False(success);
        Assert.NotNull(error);
    }
}
