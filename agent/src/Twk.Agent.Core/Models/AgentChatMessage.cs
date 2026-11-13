using System;

namespace Twk.Agent.Core.Models;

public record AgentChatMessage
{
    public string Id { get; init; } = Guid.NewGuid().ToString("N");
    public string TicketId { get; init; } = "";
    public string SenderName { get; init; } = "Técnico TWK";
    public string SenderRole { get; init; } = "tecnico"; // "tecnico", "cliente", "sistema"
    public string Content { get; init; } = "";
    public DateTime SentAt { get; init; } = DateTime.UtcNow;

    public string FormattedTime => SentAt.ToLocalTime().ToString("HH:mm");

    public bool IsFromTechnician =>
        string.Equals(SenderRole, "tecnico", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(SenderRole, "admin", StringComparison.OrdinalIgnoreCase);

    public bool IsFromClient =>
        string.Equals(SenderRole, "cliente", StringComparison.OrdinalIgnoreCase);

    public bool IsSystem =>
        string.Equals(SenderRole, "sistema", StringComparison.OrdinalIgnoreCase);

    public string RoleBadge => IsSystem ? "SISTEMA" : (IsFromTechnician ? "TÉCNICO TWK" : "CLIENTE");
}
