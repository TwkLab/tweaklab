"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Cpu,
  Clock,
  ArrowRight,
  FileCheck2,
  AlertCircle,
  User,
  Sparkles,
} from "lucide-react";
import { initialTickets } from "@/data/mockTickets";
import { Ticket, UserProfile } from "@/types";
import TicketStatusBadge, { getTicketTheme } from "@/components/TicketStatusBadge";

export default function PortalPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Load client user if logged in
    const storedUser = localStorage.getItem("twk_client_user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {}
    }

    // Load persisted tickets
    const stored = localStorage.getItem("twk_tickets");
    if (stored) {
      try {
        setTickets(JSON.parse(stored));
      } catch {
        setTickets(initialTickets);
      }
    } else {
      setTickets(initialTickets);
    }
  }, []);

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.device.cpu.toLowerCase().includes(search.toLowerCase()) ||
      t.device.gpu.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "todos") return true;
    if (statusFilter === "pendentes")
      return t.status === "novo" || t.status === "aguardando_cliente";
    if (statusFilter === "ativos")
      return [
        "triagem",
        "agendado",
        "em_atendimento",
        "aguardando_validacao",
      ].includes(t.status);
    if (statusFilter === "resolvidos") return t.status === "concluido";
    return t.status === statusFilter;
  });

  const totalCount = tickets.length;
  const pendentesCount = tickets.filter(
    (t) => t.status === "novo" || t.status === "aguardando_cliente"
  ).length;
  const inProgressCount = tickets.filter(
    (t) =>
      t.status === "triagem" ||
      t.status === "em_atendimento" ||
      t.status === "agendado" ||
      t.status === "aguardando_validacao"
  ).length;
  const completedCount = tickets.filter((t) => t.status === "concluido").length;

  return (
    <div className="py-10 max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-twk-border">
        <div className="space-y-1">
          <div className="text-xs font-mono text-twk-green uppercase tracking-wider flex items-center gap-2">
            <span>Área do Cliente • TweakLab</span>
            {currentUser && (
              <span className="text-twk-dim">| Olá, <strong className="text-twk-text">{currentUser.name}</strong></span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-twk-text tracking-tight">
            Meus Chamados de Atendimento
          </h1>
          <p className="text-xs sm:text-sm text-twk-muted">
            Acompanhe o diagnóstico, autorizações, intervenções técnicas e relatórios em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/portal/perfil"
            className="px-4 py-2.5 rounded-xl bg-twk-surface hover:bg-twk-card border border-twk-border hover:border-twk-green/40 text-twk-text text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-sm"
          >
            <User className="w-3.5 h-3.5 text-twk-green" />
            <span>Meu Perfil & PC</span>
          </Link>

          <Link
            href="/portal/novo"
            className="px-5 py-2.5 rounded-xl bg-twk-green hover:bg-twk-green-hover text-twk-bg font-bold text-xs uppercase tracking-wider font-mono shadow-twk-glow-sm hover:shadow-twk-glow transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Abrir Novo Chamado</span>
          </Link>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="twk-card rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-twk-dim uppercase">
              Total Geral
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-twk-text">
              {totalCount}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-twk-surface border border-twk-border text-twk-muted">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="twk-card rounded-xl p-4 flex items-center justify-between border-amber-500/30 bg-amber-500/[0.02]">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-amber-400 uppercase">
              Pendentes
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
              {pendentesCount}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="twk-card rounded-xl p-4 flex items-center justify-between border-cyan-500/30 bg-cyan-500/[0.02]">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 uppercase">
              Ativos / Em Fila
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">
              {inProgressCount}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="twk-card rounded-xl p-4 flex items-center justify-between border-emerald-500/30 bg-emerald-500/[0.02]">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 uppercase">
              Resolvidos
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
              {completedCount}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <FileCheck2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Category Pills */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatusFilter("todos")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all border ${
              statusFilter === "todos"
                ? "bg-twk-surface border-twk-green text-twk-green font-bold shadow-twk-glow-sm"
                : "bg-twk-surface/40 border-twk-border text-twk-muted hover:text-twk-text"
            }`}
          >
            Todos ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter("pendentes")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all border flex items-center gap-1.5 ${
              statusFilter === "pendentes"
                ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                : "bg-twk-surface/40 border-twk-border text-twk-muted hover:text-amber-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Pendentes ({pendentesCount})
          </button>
          <button
            onClick={() => setStatusFilter("ativos")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all border flex items-center gap-1.5 ${
              statusFilter === "ativos"
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                : "bg-twk-surface/40 border-twk-border text-twk-muted hover:text-cyan-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Ativos ({inProgressCount})
          </button>
          <button
            onClick={() => setStatusFilter("resolvidos")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all border flex items-center gap-1.5 ${
              statusFilter === "resolvidos"
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                : "bg-twk-surface/40 border-twk-border text-twk-muted hover:text-emerald-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Resolvidos ({completedCount})
          </button>
        </div>

        {/* Search & dropdown bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-twk-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código (ex: TWK-2026-...) ou hardware..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text placeholder-twk-dim focus:outline-none focus:border-twk-green/60 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-twk-dim" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-muted focus:outline-none focus:border-twk-green/60 font-mono"
            >
              <option value="todos">Todos os status</option>
              <option value="pendentes">Categoria: Pendentes</option>
              <option value="ativos">Categoria: Ativos</option>
              <option value="resolvidos">Categoria: Resolvidos</option>
              <option value="novo">Novo</option>
              <option value="triagem">Em Triagem</option>
              <option value="em_atendimento">Em Atendimento</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="twk-card rounded-3xl p-12 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-twk-surface border border-twk-border flex items-center justify-center text-twk-green shadow-twk-glow-sm">
              <Plus className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-twk-text">
                Nenhum chamado aberto no momento
              </h3>
              <p className="text-xs text-twk-muted max-w-sm mx-auto leading-relaxed">
                Você ainda não possui atendimentos registrados. Clique no botão abaixo para abrir seu primeiro chamado.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/portal/novo"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-twk-green hover:bg-twk-green-hover text-twk-bg font-bold text-xs uppercase font-mono shadow-twk-glow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Abrir Novo Chamado</span>
              </Link>
            </div>
          </div>
        ) : (
          filteredTickets.map((t) => {
            const theme = getTicketTheme(t.status);
            return (
              <div
                key={t.id}
                className={`rounded-2xl p-5 border transition-all ${theme.cardBorder} ${theme.cardAccentBorder} ${theme.cardBg} ${theme.cardGlow} flex flex-col md:flex-row md:items-center justify-between gap-5 group`}
              >
                {/* Ticket Left Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-twk-text">
                      {t.code}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${theme.categoryBadge}`}
                    >
                      {theme.categoryLabel}
                    </span>
                    <TicketStatusBadge status={t.status} size="sm" />
                    <span className="text-[10px] font-mono text-twk-dim">
                      Criado em: {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href={`/portal/chamado/${t.id}`}
                      className="text-base font-bold text-twk-text group-hover:text-twk-green transition-colors block"
                    >
                      {t.title}
                    </Link>
                    <p className="text-xs text-twk-muted line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  {/* Hardware Specs preview */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-twk-dim">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-twk-muted" />
                      {t.device.cpu}
                    </span>
                    <span>•</span>
                    <span>{t.device.gpu}</span>
                    <span>•</span>
                    <span>{t.device.ram}</span>
                  </div>
                </div>

                {/* Actions Right */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-2.5 border-t md:border-t-0 pt-3 md:pt-0 border-twk-border/50">
                  {t.status === "concluido" && (
                    <Link
                      href={`/relatorio/${t.id}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Ver Relatório</span>
                    </Link>
                  )}

                  <Link
                    href={`/portal/chamado/${t.id}`}
                    className="px-4 py-2 rounded-xl bg-twk-surface hover:bg-twk-card border border-twk-border hover:border-twk-green/40 text-twk-text group-hover:text-twk-green text-xs font-semibold flex items-center gap-1.5 transition-all font-mono"
                  >
                    <span>Detalhes do Chamado</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
