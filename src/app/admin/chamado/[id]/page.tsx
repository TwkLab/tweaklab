"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Terminal,
  Activity,
  Plus,
  Save,
  CheckCircle2,
  Cpu,
  History,
  FileCheck2,
} from "lucide-react";
import { initialTickets } from "@/data/mockTickets";
import { Ticket, ServiceAction, BenchmarkMetric, TicketStatus } from "@/types";
import TicketStatusBadge from "@/components/TicketStatusBadge";

export default function TechnicianWorkbenchPage() {
  const params = useParams();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);

  // New Action Form State
  const [actionCategory, setActionCategory] = useState<
    "diagnostico" | "sistema" | "driver" | "bios" | "jogo" | "reversao"
  >("sistema");
  const [actionDesc, setActionDesc] = useState("");
  const [actionReason, setActionReason] = useState("");
  const [actionBefore, setActionBefore] = useState("");
  const [actionAfter, setActionAfter] = useState("");
  const [actionReversible, setActionReversible] = useState(true);

  // New Benchmark Form State
  const [bmGame, setBmGame] = useState("");
  const [bmResolution, setBmResolution] = useState("1920x1080 (1080p)");
  const [bmPreset, setBmPreset] = useState("Competitivo");
  const [bmDriver, setBmDriver] = useState("");
  const [bmBeforeAvg, setBmBeforeAvg] = useState("");
  const [bmBeforeLow1, setBmBeforeLow1] = useState("");
  const [bmBeforeFrametime, setBmBeforeFrametime] = useState("");
  const [bmAfterAvg, setBmAfterAvg] = useState("");
  const [bmAfterLow1, setBmAfterLow1] = useState("");
  const [bmAfterFrametime, setBmAfterFrametime] = useState("");
  const [bmNotes, setBmNotes] = useState("");

  // Technical notes state
  const [techNotes, setTechNotes] = useState("");

  useEffect(() => {
    const isAuth = localStorage.getItem("twk_admin_authenticated");
    if (isAuth !== "true") {
      window.location.href = "/admin";
      return;
    }

    const stored = localStorage.getItem("twk_tickets");
    let list: Ticket[] = [];
    if (stored) {
      try {
        list = JSON.parse(stored);
      } catch {
        list = initialTickets;
      }
    } else {
      list = initialTickets;
    }

    const found = list.find((t) => t.id === ticketId);
    if (found) {
      setTicket(found);
      setTechNotes(found.technicianNotes || "");
    }
  }, [ticketId]);

  if (!ticket) {
    return (
      <div className="py-20 text-center font-mono text-xs text-twk-muted">
        Carregando chamado técnico...
      </div>
    );
  }

  const saveTicketUpdates = (updated: Ticket) => {
    setTicket(updated);
    const stored = localStorage.getItem("twk_tickets");
    if (stored) {
      try {
        const list: Ticket[] = JSON.parse(stored);
        const idx = list.findIndex((t) => t.id === updated.id);
        if (idx !== -1) {
          list[idx] = updated;
          localStorage.setItem("twk_tickets", JSON.stringify(list));
        }
      } catch {}
    }
  };

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionDesc.trim() || !actionReason.trim()) return;

    const newAction: ServiceAction = {
      id: `act-${Date.now()}`,
      ticketId: ticket.id,
      category: actionCategory,
      description: actionDesc.trim(),
      reason: actionReason.trim(),
      beforeValue: actionBefore.trim(),
      afterValue: actionAfter.trim(),
      reversible: actionReversible,
      performedBy: "Técnico TWK #01",
      performedAt: new Date().toISOString(),
    };

    const updated: Ticket = {
      ...ticket,
      actions: [...ticket.actions, newAction],
      updatedAt: new Date().toISOString(),
    };

    saveTicketUpdates(updated);
    setActionDesc("");
    setActionReason("");
    setActionBefore("");
    setActionAfter("");
  };

  const handleAddBenchmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bmGame.trim()) return;

    const newBenchmark: BenchmarkMetric = {
      id: `bm-${Date.now()}`,
      ticketId: ticket.id,
      game: bmGame.trim(),
      resolution: bmResolution,
      preset: bmPreset,
      driverVersion: bmDriver || "Driver Atual",
      before: {
        avgFps: Number(bmBeforeAvg) || 0,
        low1Percent: Number(bmBeforeLow1) || 0,
        frametimeAvgMs: Number(bmBeforeFrametime) || 0,
      },
      after: {
        avgFps: Number(bmAfterAvg) || 0,
        low1Percent: Number(bmAfterLow1) || 0,
        frametimeAvgMs: Number(bmAfterFrametime) || 0,
      },
      notes: bmNotes.trim(),
      measuredAt: new Date().toISOString(),
    };

    const updated: Ticket = {
      ...ticket,
      benchmarks: [...ticket.benchmarks, newBenchmark],
      updatedAt: new Date().toISOString(),
    };

    saveTicketUpdates(updated);
    setBmGame("");
    setBmBeforeAvg("");
    setBmBeforeLow1("");
    setBmBeforeFrametime("");
    setBmAfterAvg("");
    setBmAfterLow1("");
    setBmAfterFrametime("");
    setBmNotes("");
  };

  const handleSaveTechNotes = () => {
    const updated: Ticket = {
      ...ticket,
      technicianNotes: techNotes,
      updatedAt: new Date().toISOString(),
    };
    saveTicketUpdates(updated);
    alert("Parecer técnico salvo com sucesso!");
  };

  const handleSetStatus = (newStatus: TicketStatus) => {
    const updated: Ticket = {
      ...ticket,
      status: newStatus,
      completedAt: newStatus === "concluido" ? new Date().toISOString() : ticket.completedAt,
      updatedAt: new Date().toISOString(),
    };
    saveTicketUpdates(updated);
  };

  return (
    <div className="py-10 max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-twk-muted hover:text-twk-green transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para Fila de Chamados</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/portal/chamado/${ticket.id}`}
            className="text-xs font-mono text-twk-dim hover:text-twk-green px-3 py-1.5 rounded-lg border border-twk-border bg-twk-surface"
          >
            Ver como Cliente →
          </Link>

          <Link
            href={`/relatorio/${ticket.id}`}
            className="px-4 py-2 rounded-xl bg-twk-green hover:bg-twk-green-hover text-twk-bg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-twk-glow-sm"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Gerar / Ver Relatório PDF</span>
          </Link>
        </div>
      </div>

      {/* Ticket Header */}
      <div className="twk-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-twk-border">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-base font-bold font-mono text-twk-green">
                {ticket.code}
              </span>
              <TicketStatusBadge status={ticket.status} />
              <span className="text-xs text-twk-dim font-mono">
                Cliente: {ticket.customerName} ({ticket.customerEmail})
              </span>
            </div>
            <h1 className="text-xl font-bold text-twk-text mt-1">{ticket.title}</h1>
          </div>

          {/* Quick status button controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSetStatus("em_atendimento")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                ticket.status === "em_atendimento"
                  ? "bg-twk-green/20 border-twk-green text-twk-green font-bold shadow-twk-glow-sm"
                  : "bg-twk-surface border-twk-border text-twk-dim hover:text-twk-text"
              }`}
            >
              Em Atendimento
            </button>

            <button
              type="button"
              onClick={() => handleSetStatus("concluido")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                ticket.status === "concluido"
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold"
                  : "bg-twk-surface border-twk-border text-twk-dim hover:text-twk-text"
              }`}
            >
              Marcar como Concluído
            </button>
          </div>
        </div>

        {/* Specs bar */}
        <div className="text-xs font-mono text-twk-dim flex flex-wrap gap-4 pt-1">
          <span><strong className="text-twk-muted">CPU:</strong> {ticket.device.cpu}</span>
          <span><strong className="text-twk-muted">GPU:</strong> {ticket.device.gpu}</span>
          <span><strong className="text-twk-muted">RAM:</strong> {ticket.device.ram}</span>
          <span><strong className="text-twk-muted">OS:</strong> {ticket.device.os}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: Registrar Nova Ação de Auditoria */}
        <div className="twk-card rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-twk-border">
            <h3 className="text-sm font-bold text-twk-text uppercase font-mono tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-twk-green" />
              <span>Registrar Ação no Log de Auditoria</span>
            </h3>
            <span className="text-[10px] text-twk-dim font-mono">
              {ticket.actions.length} ações salvas
            </span>
          </div>

          <form onSubmit={handleAddAction} className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-twk-dim">CATEGORIA</label>
                <select
                  value={actionCategory}
                  onChange={(e) => setActionCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-twk-surface border border-twk-border text-twk-text focus:border-twk-green/60"
                >
                  <option value="diagnostico">Diagnóstico</option>
                  <option value="driver">Driver</option>
                  <option value="sistema">Sistema / Windows</option>
                  <option value="bios">BIOS / Memória</option>
                  <option value="jogo">Configuração de Jogo</option>
                  <option value="reversao">Reversão de Ajuste</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-twk-dim">REVERSIBILIDADE</label>
                <div className="flex items-center h-9 px-3 rounded-xl bg-twk-surface border border-twk-border">
                  <input
                    type="checkbox"
                    id="rev-check"
                    checked={actionReversible}
                    onChange={(e) => setActionReversible(e.target.checked)}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="rev-check" className="text-twk-text cursor-pointer">
                    Ajuste Reversível
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-twk-dim">AÇÃO EXECUTADA</label>
              <input
                type="text"
                required
                value={actionDesc}
                onChange={(e) => setActionDesc(e.target.value)}
                placeholder="Ex: Desativação do Game DVR em segundo plano"
                className="w-full px-3 py-2 rounded-xl bg-twk-surface border border-twk-border text-twk-text focus:border-twk-green/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-twk-dim">JUSTIFICATIVA TÉCNICA (MOTIVO)</label>
              <textarea
                rows={2}
                required
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Ex: Game DVR causava contenção de I/O em disco NVMe"
                className="w-full px-3 py-2 rounded-xl bg-twk-surface border border-twk-border text-twk-text focus:border-twk-green/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-rose-400">ESTADO ANTERIOR (ANTES)</label>
                <input
                  type="text"
                  value={actionBefore}
                  onChange={(e) => setActionBefore(e.target.value)}
                  placeholder="Ex: DVR Ativo em disco"
                  className="w-full px-3 py-2 rounded-xl bg-twk-surface border border-twk-border text-twk-text focus:border-twk-green/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-twk-green">ESTADO POSTERIOR (DEPOIS)</label>
                <input
                  type="text"
                  value={actionAfter}
                  onChange={(e) => setActionAfter(e.target.value)}
                  placeholder="Ex: Desativado"
                  className="w-full px-3 py-2 rounded-xl bg-twk-surface border border-twk-border text-twk-text focus:border-twk-green/60"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-twk-surface hover:bg-twk-card border border-twk-border hover:border-twk-green/50 text-twk-text font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 text-twk-green" />
              <span>Adicionar Ação ao Chamado</span>
            </button>
          </form>
        </div>

        {/* Section 2: Registrar Benchmark Comparativo */}
        <div className="twk-card rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-twk-border">
            <h3 className="text-sm font-bold text-twk-text uppercase font-mono tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-twk-green" />
              <span>Registrar Benchmark Comparativo</span>
            </h3>
            <span className="text-[10px] text-twk-dim font-mono">
              {ticket.benchmarks.length} testes salvos
            </span>
          </div>

          <form onSubmit={handleAddBenchmark} className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-twk-dim">JOGO / CENÁRIO DE TESTE</label>
                <input
                  type="text"
                  required
                  value={bmGame}
                  onChange={(e) => setBmGame(e.target.value)}
                  placeholder="Ex: Warzone (Urzikstan)"
                  className="w-full px-3 py-2 rounded-xl bg-twk-surface border border-twk-border text-twk-text focus:border-twk-green/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-twk-dim">RESOLUÇÃO</label>
                <input
                  type="text"
                  value={bmResolution}
                  onChange={(e) => setBmResolution(e.target.value)}
                  placeholder="Ex: 2560x1440 (1440p)"
                  className="w-full px-3 py-2 rounded-xl bg-twk-surface border border-twk-border text-twk-text focus:border-twk-green/60"
                />
              </div>
            </div>

            {/* Before Metrics */}
            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/30 space-y-2">
              <div className="text-[10px] text-rose-400 font-bold uppercase">
                MEDIÇÃO ANTES (LINHA DE BASE)
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Avg FPS (ex: 128)"
                  value={bmBeforeAvg}
                  onChange={(e) => setBmBeforeAvg(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-twk-surface border border-twk-border text-twk-text text-xs"
                />
                <input
                  type="number"
                  placeholder="1% Low (ex: 42)"
                  value={bmBeforeLow1}
                  onChange={(e) => setBmBeforeLow1(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-twk-surface border border-twk-border text-twk-text text-xs"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Frametime ms"
                  value={bmBeforeFrametime}
                  onChange={(e) => setBmBeforeFrametime(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-twk-surface border border-twk-border text-twk-text text-xs"
                />
              </div>
            </div>

            {/* After Metrics */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-twk-green/30 space-y-2">
              <div className="text-[10px] text-twk-green font-bold uppercase">
                MEDIÇÃO DEPOIS (APÓS AJUSTES)
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Avg FPS (ex: 141)"
                  value={bmAfterAvg}
                  onChange={(e) => setBmAfterAvg(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-twk-surface border border-twk-border text-twk-text text-xs"
                />
                <input
                  type="number"
                  placeholder="1% Low (ex: 88)"
                  value={bmAfterLow1}
                  onChange={(e) => setBmAfterLow1(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-twk-surface border border-twk-border text-twk-text text-xs"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Frametime ms"
                  value={bmAfterFrametime}
                  onChange={(e) => setBmAfterFrametime(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-twk-surface border border-twk-border text-twk-text text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-twk-dim">NOTAS DO TESTE</label>
              <input
                type="text"
                value={bmNotes}
                onChange={(e) => setBmNotes(e.target.value)}
                placeholder="Ex: Eliminação dos solavancos; 1% low dobrou"
                className="w-full px-3 py-2 rounded-xl bg-twk-surface border border-twk-border text-twk-text focus:border-twk-green/60"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-twk-surface hover:bg-twk-card border border-twk-border hover:border-twk-green/50 text-twk-text font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 text-twk-green" />
              <span>Salvar Benchmark no Chamado</span>
            </button>
          </form>
        </div>
      </div>

      {/* Parecer Técnico Global */}
      <div className="twk-card rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-twk-text uppercase font-mono tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-twk-green" />
          <span>Parecer Técnico do Especialista (Exibido no Relatório)</span>
        </h3>
        <textarea
          rows={3}
          value={techNotes}
          onChange={(e) => setTechNotes(e.target.value)}
          placeholder="Descreva o resumo do problema, as hipóteses comprovadas e recomendações futuras para o cliente..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text font-mono focus:border-twk-green/60"
        />
        <button
          type="button"
          onClick={handleSaveTechNotes}
          className="px-5 py-2 rounded-xl bg-twk-green text-twk-bg font-bold text-xs font-mono flex items-center gap-2 hover:bg-twk-green-hover shadow-twk-glow-sm"
        >
          <Save className="w-4 h-4" />
          <span>Atualizar Parecer do Chamado</span>
        </button>
      </div>
    </div>
  );
}

