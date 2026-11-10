import { TicketStatus } from "@/types";

interface Props {
  status: TicketStatus;
  size?: "sm" | "md";
}

export default function TicketStatusBadge({ status, size = "md" }: Props) {
  const configs: Record<
    TicketStatus,
    { label: string; bg: string; text: string; border: string; pulse?: boolean }
  > = {
    novo: {
      label: "Novo",
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/30",
    },
    triagem: {
      label: "Em Triagem",
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
      border: "border-cyan-500/30",
    },
    aguardando_cliente: {
      label: "Aguardando Cliente",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/30",
    },
    agendado: {
      label: "Agendado",
      bg: "bg-indigo-500/10",
      text: "text-indigo-400",
      border: "border-indigo-500/30",
    },
    em_atendimento: {
      label: "Em Atendimento",
      bg: "bg-twk-green/15",
      text: "text-twk-green",
      border: "border-twk-green/40",
      pulse: true,
    },
    aguardando_validacao: {
      label: "Aguardando Validação",
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      border: "border-purple-500/30",
    },
    concluido: {
      label: "Concluído",
      bg: "bg-emerald-500/15",
      text: "text-emerald-400",
      border: "border-emerald-500/40",
    },
    cancelado: {
      label: "Cancelado",
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      border: "border-rose-500/30",
    },
  };

  const current = configs[status] || configs.novo;
  const sizeClasses =
    size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      {current.pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-twk-green animate-pulse" />
      )}
      {current.label}
    </span>
  );
}

