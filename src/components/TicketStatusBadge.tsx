import { TicketStatus } from "@/types";
import {
  Clock,
  Search,
  UserCheck,
  Calendar,
  Zap,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Props {
  status: TicketStatus;
  size?: "sm" | "md";
}

export interface TicketTheme {
  category: "pendente" | "ativo" | "resolvido" | "cancelado";
  categoryLabel: string;
  categoryBadge: string;
  cardBorder: string;
  cardAccentBorder: string;
  cardBg: string;
  cardGlow: string;
  dotColor: string;
  pulse?: boolean;
}

export function getTicketTheme(status: TicketStatus): TicketTheme {
  switch (status) {
    case "novo":
      return {
        category: "pendente",
        categoryLabel: "Pendente",
        categoryBadge:
          "bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]",
        cardBorder: "border-amber-500/60 hover:border-amber-400",
        cardAccentBorder: "border-l-[6px] border-l-amber-400",
        cardBg: "bg-[#0d0c07]/90",
        cardGlow: "shadow-[0_0_20px_rgba(245,158,11,0.06)]",
        dotColor: "bg-amber-400",
        pulse: true,
      };
    case "aguardando_cliente":
      return {
        category: "pendente",
        categoryLabel: "Aguardando Resposta",
        categoryBadge:
          "bg-orange-500/15 text-orange-300 border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.15)]",
        cardBorder: "border-orange-500/60 hover:border-orange-400",
        cardAccentBorder: "border-l-[6px] border-l-orange-400",
        cardBg: "bg-[#0d0a06]/90",
        cardGlow: "shadow-[0_0_20px_rgba(249,115,22,0.06)]",
        dotColor: "bg-orange-400",
      };
    case "triagem":
      return {
        category: "ativo",
        categoryLabel: "Ativo • Triagem",
        categoryBadge:
          "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]",
        cardBorder: "border-cyan-500/60 hover:border-cyan-400",
        cardAccentBorder: "border-l-[6px] border-l-cyan-400",
        cardBg: "bg-[#060c0e]/90",
        cardGlow: "shadow-[0_0_20px_rgba(6,182,212,0.08)]",
        dotColor: "bg-cyan-400",
      };
    case "agendado":
      return {
        category: "ativo",
        categoryLabel: "Ativo • Agendado",
        categoryBadge:
          "bg-blue-500/15 text-blue-300 border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.15)]",
        cardBorder: "border-blue-500/60 hover:border-blue-400",
        cardAccentBorder: "border-l-[6px] border-l-blue-400",
        cardBg: "bg-[#06090f]/90",
        cardGlow: "shadow-[0_0_20px_rgba(59,130,246,0.08)]",
        dotColor: "bg-blue-400",
      };
    case "em_atendimento":
      return {
        category: "ativo",
        categoryLabel: "Ativo • Ao Vivo",
        categoryBadge:
          "bg-twk-green/20 text-twk-green border-twk-green/60 shadow-twk-glow-sm",
        cardBorder: "border-twk-green/80 hover:border-twk-green shadow-[0_0_25px_rgba(0,255,136,0.15)]",
        cardAccentBorder: "border-l-[6px] border-l-twk-green",
        cardBg: "bg-[#050d07]/90",
        cardGlow: "shadow-[0_0_25px_rgba(0,255,136,0.15)]",
        dotColor: "bg-twk-green",
        pulse: true,
      };
    case "aguardando_validacao":
      return {
        category: "ativo",
        categoryLabel: "Ativo • Em Testes",
        categoryBadge:
          "bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.15)]",
        cardBorder: "border-purple-500/60 hover:border-purple-400",
        cardAccentBorder: "border-l-[6px] border-l-purple-400",
        cardBg: "bg-[#0b0610]/90",
        cardGlow: "shadow-[0_0_20px_rgba(168,85,247,0.08)]",
        dotColor: "bg-purple-400",
      };
    case "concluido":
      return {
        category: "resolvido",
        categoryLabel: "Resolvido",
        categoryBadge:
          "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]",
        cardBorder: "border-emerald-500/50 hover:border-emerald-400",
        cardAccentBorder: "border-l-[6px] border-l-emerald-400",
        cardBg: "bg-[#060e09]/90",
        cardGlow: "shadow-[0_0_20px_rgba(16,185,129,0.06)]",
        dotColor: "bg-emerald-400",
      };
    case "cancelado":
      return {
        category: "cancelado",
        categoryLabel: "Cancelado",
        categoryBadge: "bg-zinc-800 text-zinc-400 border-zinc-700",
        cardBorder: "border-zinc-800/80 hover:border-zinc-700",
        cardAccentBorder: "border-l-[6px] border-l-zinc-700",
        cardBg: "bg-[#0a0a0a]/70 opacity-75",
        cardGlow: "",
        dotColor: "bg-zinc-600",
      };
    default:
      return {
        category: "pendente",
        categoryLabel: "Pendente",
        categoryBadge: "bg-twk-surface text-twk-muted border-twk-border",
        cardBorder: "border-twk-border hover:border-twk-green/40",
        cardAccentBorder: "border-l-[6px] border-l-twk-border",
        cardBg: "bg-twk-card",
        cardGlow: "",
        dotColor: "bg-twk-dim",
      };
  }
}

export default function TicketStatusBadge({ status, size = "md" }: Props) {
  const configs: Record<
    TicketStatus,
    {
      label: string;
      bg: string;
      text: string;
      border: string;
      icon: typeof Clock;
      pulse?: boolean;
    }
  > = {
    novo: {
      label: "Pendente (Novo)",
      bg: "bg-amber-500/15",
      text: "text-amber-300",
      border: "border-amber-500/40",
      icon: Clock,
      pulse: true,
    },
    aguardando_cliente: {
      label: "Aguardando Cliente",
      bg: "bg-orange-500/15",
      text: "text-orange-300",
      border: "border-orange-500/40",
      icon: UserCheck,
    },
    triagem: {
      label: "Em Triagem",
      bg: "bg-cyan-500/15",
      text: "text-cyan-300",
      border: "border-cyan-500/40",
      icon: Search,
    },
    agendado: {
      label: "Agendado",
      bg: "bg-blue-500/15",
      text: "text-blue-300",
      border: "border-blue-500/40",
      icon: Calendar,
    },
    em_atendimento: {
      label: "Em Atendimento",
      bg: "bg-twk-green/20",
      text: "text-twk-green",
      border: "border-twk-green/60",
      icon: Zap,
      pulse: true,
    },
    aguardando_validacao: {
      label: "Em Validação",
      bg: "bg-purple-500/15",
      text: "text-purple-300",
      border: "border-purple-500/40",
      icon: Activity,
    },
    concluido: {
      label: "Resolvido",
      bg: "bg-emerald-500/20",
      text: "text-emerald-300",
      border: "border-emerald-500/40",
      icon: CheckCircle2,
    },
    cancelado: {
      label: "Cancelado",
      bg: "bg-zinc-800/80",
      text: "text-zinc-400",
      border: "border-zinc-700/60",
      icon: XCircle,
    },
  };

  const current = configs[status] || configs.novo;
  const Icon = current.icon;
  const sizeClasses =
    size === "sm" ? "text-[10px] px-2.5 py-0.5" : "text-xs px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      {current.pulse ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      ) : (
        <Icon className="w-3 h-3 flex-shrink-0" />
      )}
      {current.label}
    </span>
  );
}
