"use client";

import { useState, useEffect, useRef } from "react";
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
  Copy,
  Check,
  Send,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";
import { initialTickets } from "@/data/mockTickets";
import { Ticket, ServiceAction, BenchmarkMetric, TicketStatus, TicketMessage } from "@/types";
import TicketStatusBadge, { getTicketTheme } from "@/components/TicketStatusBadge";

export default function TechnicianWorkbenchPage() {
  const params = useParams();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<"chat" | "acoes" | "benchmarks" | "laudo">("chat");

  // Chat State
  const [newChatMessage, setNewChatMessage] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const handleCopyCode = () => {
    if (!ticket) return;
    navigator.clipboard.writeText(ticket.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

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
    setLoading(false);
  }, [ticketId]);

  // Synchronize remote chat messages from Customer in Real Time
  useEffect(() => {
    if (!ticket) return;

    const pollChat = async () => {
      try {
        const query = ticket.code || ticket.id;
        const res = await fetch(`/api/chat?ticketId=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            setTicket((prev) => {
              if (!prev) return prev;
              const existingIds = new Set(prev.messages.map((m) => m.id));
              const newIncoming: TicketMessage[] = data.messages
                .filter((m: any) => !existingIds.has(m.id))
                .map((m: any) => ({
                  id: m.id,
                  ticketId: prev.id,
                  senderName: m.senderName,
                  senderRole: m.senderRole,
                  content: m.content,
                  sentAt: m.sentAt,
                }));

              if (newIncoming.length > 0) {
                const updated = {
                  ...prev,
                  messages: [...prev.messages, ...newIncoming],
                };
                const stored = localStorage.getItem("twk_tickets");
                if (stored) {
                  try {
                    const list: Ticket[] = JSON.parse(stored);
                    const idx = list.findIndex((t) => t.id === prev.id);
                    if (idx !== -1) {
                      list[idx] = updated;
                      localStorage.setItem("twk_tickets", JSON.stringify(list));
                    }
                  } catch {}
                }
                return updated;
              }
              return prev;
            });
          }
        }
      } catch {}
    };

    pollChat();
    const timer = setInterval(pollChat, 3000);
    return () => clearInterval(timer);
  }, [ticket?.id, ticket?.code]);

  const handleSendChatMessage = async (e?: React.FormEvent, explicitText?: string) => {
    if (e) e.preventDefault();
    const textToSend = explicitText || newChatMessage;
    if (!textToSend.trim() || !ticket) return;

    setIsSendingChat(true);
    const newMsgObj: TicketMessage = {
      id: `msg-${Date.now()}`,
      ticketId: ticket.id,
      senderName: "Técnico TWK",
      senderRole: "tecnico",
      content: textToSend.trim(),
      sentAt: new Date().toISOString(),
    };

    const updated: Ticket = {
      ...ticket,
      messages: [...ticket.messages, newMsgObj],
      updatedAt: new Date().toISOString(),
    };

    saveTicketUpdates(updated);
    if (!explicitText) {
      setNewChatMessage("");
    }

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: ticket.code || ticket.id,
          email: ticket.customerEmail,
          senderName: "Técnico TWK",
          senderRole: "tecnico",
          content: newMsgObj.content,
          sentAt: newMsgObj.sentAt,
        }),
      });
    } catch {}

    setIsSendingChat(false);
  };

  if (loading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-twk-muted">
        Carregando chamado técnico...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-4 px-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-twk-surface border border-twk-border flex items-center justify-center text-amber-400">
          <Terminal className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-twk-text">Chamado Não Localizado</h2>
        <p className="text-xs text-twk-muted leading-relaxed">
          O chamado informado não consta na base de dados ativa deste navegador.
        </p>
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-twk-surface border border-twk-border text-xs font-mono text-twk-green hover:border-twk-green/40"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar à Fila de Chamados</span>
          </Link>
        </div>
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

  const theme = getTicketTheme(ticket.status);

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
      <div
        className={`rounded-2xl p-6 space-y-4 border transition-all ${theme.cardBorder} ${theme.cardAccentBorder} ${theme.cardBg} ${theme.cardGlow}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-twk-border">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-twk-surface px-2.5 py-1 rounded-lg border border-twk-border/80">
                <span className="text-sm sm:text-base font-bold font-mono text-twk-text">
                  {ticket.code}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1 rounded hover:bg-twk-card text-twk-dim hover:text-twk-green transition-colors inline-flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                  title="Copiar código do chamado"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3 text-twk-green" />
                      <span className="text-[10px] text-twk-green font-bold">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[10px] hidden sm:inline">Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${theme.categoryBadge}`}
              >
                {theme.categoryLabel}
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-twk-border pb-2 overflow-x-auto font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveAdminTab("chat")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeAdminTab === "chat"
              ? "bg-twk-card border border-twk-green/40 text-twk-green font-bold shadow-twk-glow-sm"
              : "text-twk-muted hover:text-twk-text hover:bg-twk-surface border border-transparent"
          }`}
        >
          <Send className="w-3.5 h-3.5 text-twk-green" />
          <span>Chat com o Cliente ({ticket.messages.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab("acoes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeAdminTab === "acoes"
              ? "bg-twk-card border border-twk-green/40 text-twk-green font-bold shadow-twk-glow-sm"
              : "text-twk-muted hover:text-twk-text hover:bg-twk-surface border border-transparent"
          }`}
        >
          <History className="w-3.5 h-3.5 text-twk-green" />
          <span>Ações de Auditoria ({ticket.actions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab("benchmarks")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeAdminTab === "benchmarks"
              ? "bg-twk-card border border-twk-green/40 text-twk-green font-bold shadow-twk-glow-sm"
              : "text-twk-muted hover:text-twk-text hover:bg-twk-surface border border-transparent"
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-twk-green" />
          <span>Benchmarks ({ticket.benchmarks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab("laudo")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeAdminTab === "laudo"
              ? "bg-twk-card border border-twk-green/40 text-twk-green font-bold shadow-twk-glow-sm"
              : "text-twk-muted hover:text-twk-text hover:bg-twk-surface border border-transparent"
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-twk-green" />
          <span>Parecer Técnico</span>
        </button>
      </div>

      {/* Tab 1: Chat com o Cliente */}
      {activeAdminTab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Box */}
          <div className="lg:col-span-2 twk-card rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-twk-border">
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4 text-twk-green" />
                <h3 className="text-sm font-bold text-twk-text uppercase font-mono tracking-wider">
                  Comunicação Direta com {ticket.customerName}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-twk-green animate-pulse" />
                <span className="text-[10px] font-mono text-twk-green font-bold uppercase">
                  Canal ao Vivo Conectado
                </span>
              </div>
            </div>

            {/* Message Feed */}
            <div className="space-y-3.5 max-h-[500px] min-h-[300px] overflow-y-auto pr-2">
              {ticket.messages.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-twk-surface border border-twk-border flex items-center justify-center text-twk-dim">
                    <MessageSquare className="w-6 h-6 text-twk-green/60" />
                  </div>
                  <h4 className="text-xs font-bold text-twk-text font-mono uppercase">
                    Nenhuma mensagem neste chamado ainda
                  </h4>
                  <p className="text-xs text-twk-dim max-w-sm mx-auto">
                    Envie orientações para o cliente ou utilize os snippets rápidos ao lado para iniciar o contato.
                  </p>
                </div>
              ) : (
                ticket.messages.map((m) => {
                  const isTech = m.senderRole === "tecnico" || m.senderRole === "admin";
                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl max-w-xl text-xs space-y-1.5 ${
                        isTech
                          ? "ml-auto bg-twk-card border border-cyan-500/40 shadow-twk-glow-sm"
                          : "mr-auto bg-twk-surface border border-twk-green/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] font-mono">
                        <span className={isTech ? "text-cyan-400 font-bold" : "text-twk-green font-bold"}>
                          {isTech ? "Técnico TWK" : m.senderName} ({isTech ? "Você" : "Cliente"})
                        </span>
                        <span className="text-twk-dim">
                          {new Date(m.sentAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-twk-text leading-relaxed whitespace-pre-line text-[12.5px]">
                        {m.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Composer */}
            <form onSubmit={(e) => handleSendChatMessage(e)} className="pt-4 border-t border-twk-border space-y-2">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  placeholder="Escreva uma mensagem para o cliente... (Pressione Enter para enviar)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text focus:outline-none focus:border-twk-green/60 font-sans"
                />
                <button
                  type="submit"
                  disabled={isSendingChat || !newChatMessage.trim()}
                  className="px-6 py-2.5 rounded-xl bg-twk-green hover:bg-twk-green-hover disabled:opacity-50 text-twk-bg font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-twk-glow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-twk-dim px-1">
                <span>Destinatário: {ticket.customerEmail}</span>
                <span>Pressione Enter para enviar</span>
              </div>
            </form>
          </div>

          {/* Quick Snippets & Actions Sidebar */}
          <div className="space-y-6">
            <div className="twk-card rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-twk-text uppercase font-mono tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-twk-green" />
                <span>Snippets Rápidos de Atendimento</span>
              </h3>
              <p className="text-xs text-twk-dim">
                Respostas frequentes com 1 clique para agilizar a comunicação:
              </p>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleSendChatMessage(undefined, `Olá ${ticket.customerName}! Estou iniciando a análise do seu computador no chamado ${ticket.code}.`)}
                  className="w-full text-left p-3 rounded-xl bg-twk-surface hover:bg-twk-card border border-twk-border hover:border-twk-green/50 text-xs font-mono text-twk-text transition-all cursor-pointer"
                >
                  <span className="text-twk-green font-bold block mb-0.5">💬 1. Saudação Inicial</span>
                  <span className="text-[11px] text-twk-dim">Avisa o cliente que o atendimento foi iniciado.</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendChatMessage(undefined, "Diagnóstico preliminar concluído! Identifiquei pontos de otimização de latência e drivers. Iniciando os ajustes.")}
                  className="w-full text-left p-3 rounded-xl bg-twk-surface hover:bg-twk-card border border-twk-border hover:border-twk-green/50 text-xs font-mono text-twk-text transition-all cursor-pointer"
                >
                  <span className="text-cyan-400 font-bold block mb-0.5">🧪 2. Diagnóstico Concluído</span>
                  <span className="text-[11px] text-twk-dim">Informa que os testes de estabilidade iniciaram.</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendChatMessage(undefined, "Otimizações de sistema e calibragem de latência aplicadas com sucesso! Por favor, abra o seu jogo e teste a fluidez.")}
                  className="w-full text-left p-3 rounded-xl bg-twk-surface hover:bg-twk-card border border-twk-border hover:border-twk-green/50 text-xs font-mono text-twk-text transition-all cursor-pointer"
                >
                  <span className="text-twk-green font-bold block mb-0.5">⚡ 3. Otimização Aplicada</span>
                  <span className="text-[11px] text-twk-dim">Pede para o cliente validar o desempenho no jogo.</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendChatMessage(undefined, "Será necessário reiniciar o seu computador para que as configurações do Windows e drivers entrem em vigor.")}
                  className="w-full text-left p-3 rounded-xl bg-twk-surface hover:bg-twk-card border border-twk-border hover:border-twk-green/50 text-xs font-mono text-twk-text transition-all cursor-pointer"
                >
                  <span className="text-amber-400 font-bold block mb-0.5">🔄 4. Pedir Reinicialização</span>
                  <span className="text-[11px] text-twk-dim">Orienta o cliente a reiniciar a máquina.</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendChatMessage(undefined, "Atendimento concluído com êxito! O relatório técnico com os gráficos de antes e depois foi liberado no seu portal.")}
                  className="w-full text-left p-3 rounded-xl bg-twk-surface hover:bg-twk-card border border-twk-border hover:border-twk-green/50 text-xs font-mono text-twk-text transition-all cursor-pointer"
                >
                  <span className="text-emerald-400 font-bold block mb-0.5">✅ 5. Finalizar Atendimento</span>
                  <span className="text-[11px] text-twk-dim">Comunica o encerramento do suporte.</span>
                </button>
              </div>
            </div>

            {/* Client Context Card */}
            <div className="twk-card rounded-2xl p-6 space-y-3 text-xs font-mono">
              <span className="text-[10px] text-twk-dim uppercase font-bold block">
                Dados do Atendimento
              </span>
              <div className="p-3 rounded-xl bg-twk-surface border border-twk-border space-y-1">
                <div className="text-twk-muted">Cliente: <strong className="text-twk-text">{ticket.customerName}</strong></div>
                <div className="text-twk-muted truncate">E-mail: <strong className="text-twk-green">{ticket.customerEmail}</strong></div>
                <div className="text-twk-muted">Prioridade: <strong className="text-twk-text uppercase">{ticket.priority}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Ações & Procedimentos */}
      {activeAdminTab === "acoes" && (
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
                className="w-full py-2.5 rounded-xl bg-twk-surface hover:bg-twk-card border border-twk-border hover:border-twk-green/50 text-twk-text font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-twk-green" />
                <span>Adicionar Ação ao Chamado</span>
              </button>
            </form>
          </div>

          {/* Histórico das Ações Registradas */}
          <div className="twk-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-twk-text uppercase font-mono tracking-wider flex items-center justify-between pb-3 border-b border-twk-border">
              <span>Trilha de Auditoria Gravada</span>
              <span className="text-xs text-twk-green font-normal">
                {ticket.actions.length} {ticket.actions.length === 1 ? "ação" : "ações"}
              </span>
            </h3>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 text-xs font-mono">
              {ticket.actions.length === 0 ? (
                <div className="py-12 text-center text-twk-dim">
                  Nenhuma ação registrada neste chamado ainda.
                </div>
              ) : (
                ticket.actions.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-xl bg-twk-surface border border-twk-border space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-twk-card border border-twk-border text-[10px] text-twk-green uppercase font-bold">
                        {act.category}
                      </span>
                      <span className="text-[10px] text-twk-dim">
                        {new Date(act.performedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="font-bold text-twk-text text-xs">{act.description}</div>
                    <div className="text-[11px] text-twk-dim">{act.reason}</div>
                    {(act.beforeValue || act.afterValue) && (
                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-twk-border/50">
                        <div className="text-rose-400 truncate">Antes: {act.beforeValue || "-"}</div>
                        <div className="text-twk-green truncate">Depois: {act.afterValue || "-"}</div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Benchmarks */}
      {activeAdminTab === "benchmarks" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                className="w-full py-2.5 rounded-xl bg-twk-surface hover:bg-twk-card border border-twk-border hover:border-twk-green/50 text-twk-text font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-twk-green" />
                <span>Salvar Benchmark no Chamado</span>
              </button>
            </form>
          </div>

          {/* Lista de Benchmarks Salvos */}
          <div className="twk-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-twk-text uppercase font-mono tracking-wider flex items-center justify-between pb-3 border-b border-twk-border">
              <span>Métricas de Desempenho Salvas</span>
              <span className="text-xs text-twk-green font-normal">
                {ticket.benchmarks.length} {ticket.benchmarks.length === 1 ? "teste" : "testes"}
              </span>
            </h3>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 text-xs font-mono">
              {ticket.benchmarks.length === 0 ? (
                <div className="py-12 text-center text-twk-dim">
                  Nenhum benchmark registrado ainda.
                </div>
              ) : (
                ticket.benchmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-3.5 rounded-xl bg-twk-surface border border-twk-border space-y-2"
                  >
                    <div className="flex items-center justify-between font-bold text-twk-text">
                      <span>{bm.game}</span>
                      <span className="text-[10px] text-twk-dim">{bm.resolution}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-twk-border/50">
                      <div>
                        <span className="text-rose-400 block font-bold">Antes:</span>
                        <span>{bm.before.avgFps} FPS ({bm.before.low1Percent} 1% low • {bm.before.frametimeAvgMs}ms)</span>
                      </div>
                      <div>
                        <span className="text-twk-green block font-bold">Depois:</span>
                        <span>{bm.after.avgFps} FPS ({bm.after.low1Percent} 1% low • {bm.after.frametimeAvgMs}ms)</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Parecer Técnico */}
      {activeAdminTab === "laudo" && (
        <div className="twk-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-twk-text uppercase font-mono tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-twk-green" />
            <span>Parecer Técnico do Especialista (Exibido no Relatório)</span>
          </h3>
          <textarea
            rows={5}
            value={techNotes}
            onChange={(e) => setTechNotes(e.target.value)}
            placeholder="Descreva o resumo do problema, as hipóteses comprovadas e recomendações futuras para o cliente..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text font-mono focus:border-twk-green/60"
          />
          <button
            type="button"
            onClick={handleSaveTechNotes}
            className="px-5 py-2.5 rounded-xl bg-twk-green text-twk-bg font-bold text-xs font-mono flex items-center gap-2 hover:bg-twk-green-hover shadow-twk-glow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Atualizar Parecer do Chamado</span>
          </button>
        </div>
      )}
    </div>
  );
}

