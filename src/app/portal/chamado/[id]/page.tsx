"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Cpu,
  FileCheck2,
  Send,
  History,
  Activity,
  ShieldCheck,
  RotateCcw,
  Clock,
  Printer,
  Sparkles,
} from "lucide-react";
import { initialTickets } from "@/data/mockTickets";
import { Ticket, TicketMessage } from "@/types";
import TicketStatusBadge from "@/components/TicketStatusBadge";

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [activeTab, setActiveTab] = useState<"geral" | "benchmarks" | "auditoria" | "chat">("geral");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
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
    } else {
      // fallback to first ticket if not found
      setTicket(list[0] || initialTickets[0]);
    }
  }, [ticketId]);

  if (!ticket) {
    return (
      <div className="py-20 text-center font-mono text-xs text-twk-muted">
        Carregando dados do chamado...
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsgObj: TicketMessage = {
      id: `msg-${Date.now()}`,
      ticketId: ticket.id,
      senderName: ticket.customerName || "Você (Cliente)",
      senderRole: "cliente",
      content: newMessage.trim(),
      sentAt: new Date().toISOString(),
    };

    const updatedTicket: Ticket = {
      ...ticket,
      messages: [...ticket.messages, newMsgObj],
      updatedAt: new Date().toISOString(),
    };

    setTicket(updatedTicket);
    setNewMessage("");

    // Update localStorage
    const stored = localStorage.getItem("twk_tickets");
    if (stored) {
      try {
        const list: Ticket[] = JSON.parse(stored);
        const idx = list.findIndex((t) => t.id === ticket.id);
        if (idx !== -1) {
          list[idx] = updatedTicket;
          localStorage.setItem("twk_tickets", JSON.stringify(list));
        }
      } catch {}
    }
  };

  // Pipeline step calculation
  const getStepProgress = (status: string) => {
    switch (status) {
      case "novo":
        return 1;
      case "triagem":
        return 2;
      case "agendado":
      case "aguardando_cliente":
        return 3;
      case "em_atendimento":
        return 4;
      case "aguardando_validacao":
      case "concluido":
        return 5;
      default:
        return 1;
    }
  };

  const currentStep = getStepProgress(ticket.status);

  return (
    <div className="py-10 max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
      {/* Top back & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/portal"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-twk-muted hover:text-twk-green transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para Meus Chamados</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/relatorio/${ticket.id}`}
            className="px-4 py-2 rounded-xl bg-twk-surface hover:bg-twk-card border border-twk-border hover:border-twk-green/40 text-twk-text text-xs font-mono flex items-center gap-2 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-twk-green" />
            <span>Visualizar Relatório Técnico</span>
          </Link>

          <Link
            href={`/admin/chamado/${ticket.id}`}
            className="px-3 py-2 rounded-xl bg-twk-surface hover:bg-twk-card border border-twk-border text-[11px] font-mono text-twk-dim hover:text-twk-muted"
            title="Acesso Técnico"
          >
            Editar no Modo Técnico
          </Link>
        </div>
      </div>

      {/* Ticket Header Card */}
      <div className="twk-card rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-twk-border">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-base font-extrabold text-twk-green">
                {ticket.code}
              </span>
              <TicketStatusBadge status={ticket.status} />
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-twk-surface border border-twk-border text-twk-dim uppercase">
                Prioridade: {ticket.priority}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-twk-text">
              {ticket.title}
            </h1>
          </div>

          <div className="text-left md:text-right text-xs font-mono text-twk-dim space-y-1">
            <div>Cliente: <span className="text-twk-text">{ticket.customerName}</span></div>
            <div>Aberto em: <span className="text-twk-text">{new Date(ticket.createdAt).toLocaleString("pt-BR")}</span></div>
          </div>
        </div>

        {/* Status Stepper */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-mono text-twk-dim uppercase tracking-wider">
            Linha do Tempo do Atendimento
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { step: 1, name: "Abertura" },
              { step: 2, name: "Triagem Técnica" },
              { step: 3, name: "Consentimento" },
              { step: 4, name: "Atendimento Remoto" },
              { step: 5, name: "Relatório & Conclusão" },
            ].map((s) => (
              <div
                key={s.step}
                className={`p-3 rounded-xl border text-center font-mono text-xs transition-all ${
                  s.step < currentStep
                    ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                    : s.step === currentStep
                    ? "bg-twk-green/10 border-twk-green text-twk-green font-bold shadow-twk-glow-sm"
                    : "bg-twk-surface/50 border-twk-border/50 text-twk-dim"
                }`}
              >
                <div className="text-[10px] opacity-75">Etapa 0{s.step}</div>
                <div className="font-medium text-xs mt-0.5">{s.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-twk-border text-xs font-mono space-x-2 sm:space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("geral")}
          className={`pb-3 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "geral"
              ? "border-twk-green text-twk-green font-bold"
              : "border-transparent text-twk-muted hover:text-twk-text"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Visão Geral & Setup</span>
        </button>

        <button
          onClick={() => setActiveTab("benchmarks")}
          className={`pb-3 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "benchmarks"
              ? "border-twk-green text-twk-green font-bold"
              : "border-transparent text-twk-muted hover:text-twk-text"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Benchmarks Antes vs Depois ({ticket.benchmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("auditoria")}
          className={`pb-3 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "auditoria"
              ? "border-twk-green text-twk-green font-bold"
              : "border-transparent text-twk-muted hover:text-twk-text"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Trilha de Alterações ({ticket.actions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`pb-3 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "chat"
              ? "border-twk-green text-twk-green font-bold"
              : "border-transparent text-twk-muted hover:text-twk-text"
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Mensagens & Histórico ({ticket.messages.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Tab 1: Geral */}
        {activeTab === "geral" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Problem Description */}
              <div className="twk-card rounded-2xl p-6 space-y-3">
                <h3 className="text-sm font-bold text-twk-text uppercase font-mono tracking-wider">
                  Relato do Problema
                </h3>
                <p className="text-xs sm:text-sm text-twk-muted leading-relaxed whitespace-pre-line">
                  {ticket.description}
                </p>
              </div>

              {/* Technician Notes */}
              {ticket.technicianNotes && (
                <div className="twk-card rounded-2xl p-6 border-twk-green/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-twk-green font-bold uppercase">
                    <Sparkles className="w-4 h-4" />
                    <span>Parecer Técnico & Diagnóstico Inicial</span>
                  </div>
                  <p className="text-xs sm:text-sm text-twk-text leading-relaxed font-mono">
                    {ticket.technicianNotes}
                  </p>
                </div>
              )}

              {/* Consents */}
              <div className="twk-card rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-twk-text uppercase font-mono tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-twk-green" />
                    <span>Autorizações & Consentimentos</span>
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    Válido
                  </span>
                </div>

                <div className="space-y-3">
                  {ticket.consents.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl bg-twk-surface border border-twk-border text-xs space-y-1"
                    >
                      <div className="font-semibold text-twk-text">{c.purpose}</div>
                      <div className="text-twk-muted text-[11px]">{c.scope}</div>
                      <div className="text-[10px] font-mono text-twk-dim pt-1">
                        Aceito em: {new Date(c.acceptedAt).toLocaleString("pt-BR")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Specs */}
            <div className="space-y-6">
              <div className="twk-card rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-twk-text uppercase font-mono tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-twk-green" />
                  <span>Hardware Registrado</span>
                </h3>

                <div className="space-y-3 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-twk-surface border border-twk-border/60">
                    <span className="text-twk-dim block text-[10px]">PROCESSADOR</span>
                    <span className="text-twk-text font-bold">{ticket.device.cpu}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-twk-surface border border-twk-border/60">
                    <span className="text-twk-dim block text-[10px]">PLACA DE VÍDEO</span>
                    <span className="text-twk-text font-bold">{ticket.device.gpu}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-twk-surface border border-twk-border/60">
                    <span className="text-twk-dim block text-[10px]">MEMÓRIA RAM</span>
                    <span className="text-twk-text font-bold">{ticket.device.ram}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-twk-surface border border-twk-border/60">
                    <span className="text-twk-dim block text-[10px]">SISTEMA OPERACIONAL</span>
                    <span className="text-twk-text font-bold">{ticket.device.os}</span>
                  </div>

                  {ticket.device.storage && (
                    <div className="p-2.5 rounded-xl bg-twk-surface border border-twk-border/60">
                      <span className="text-twk-dim block text-[10px]">ARMAZENAMENTO</span>
                      <span className="text-twk-text font-bold">{ticket.device.storage}</span>
                    </div>
                  )}

                  {ticket.device.motherboard && (
                    <div className="p-2.5 rounded-xl bg-twk-surface border border-twk-border/60">
                      <span className="text-twk-dim block text-[10px]">PLACA-MÃE</span>
                      <span className="text-twk-text font-bold">{ticket.device.motherboard}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Benchmarks */}
        {activeTab === "benchmarks" && (
          <div className="space-y-6">
            {ticket.benchmarks.length === 0 ? (
              <div className="twk-card rounded-2xl p-12 text-center space-y-3">
                <Activity className="w-8 h-8 mx-auto text-twk-dim" />
                <h3 className="text-sm font-semibold text-twk-text">
                  Nenhum benchmark registrado ainda
                </h3>
                <p className="text-xs text-twk-dim max-w-sm mx-auto">
                  Os benchmarks de antes e depois são capturados pelo técnico durante a sessão de atendimento.
                </p>
              </div>
            ) : (
              ticket.benchmarks.map((bm) => {
                const low1Diff = Math.round(
                  ((bm.after.low1Percent - bm.before.low1Percent) /
                    bm.before.low1Percent) *
                    100
                );
                const avgDiff = Math.round(
                  ((bm.after.avgFps - bm.before.avgFps) / bm.before.avgFps) * 100
                );

                return (
                  <div
                    key={bm.id}
                    className="twk-card rounded-2xl p-6 sm:p-8 space-y-6 hud-corner"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-twk-border">
                      <div>
                        <div className="text-xs font-mono text-twk-green uppercase">
                          RESULTADO COMPARATIVO DE BENCHMARK
                        </div>
                        <h3 className="text-lg font-bold text-twk-text mt-0.5">
                          {bm.game}
                        </h3>
                        <div className="text-xs text-twk-dim font-mono">
                          {bm.resolution} • {bm.preset} • Driver {bm.driverVersion}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-twk-dim">
                        Capturado em: {new Date(bm.measuredAt).toLocaleString("pt-BR")}
                      </span>
                    </div>

                    {/* Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* 1% Low */}
                      <div className="p-4 rounded-xl bg-twk-surface border border-twk-green/30 shadow-twk-glow-sm space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-twk-green font-bold">1% LOW (ESTABILIDADE)</span>
                          <span className="px-1.5 py-0.5 rounded bg-twk-green/20 text-twk-green font-bold">
                            +{low1Diff}%
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between pt-1 font-mono">
                          <div>
                            <span className="text-xs text-rose-400 block">Antes</span>
                            <span className="text-xl font-bold text-twk-text">{bm.before.low1Percent} FPS</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-twk-green block">Depois</span>
                            <span className="text-xl font-bold text-twk-green">{bm.after.low1Percent} FPS</span>
                          </div>
                        </div>
                      </div>

                      {/* FPS Médio */}
                      <div className="p-4 rounded-xl bg-twk-surface border border-twk-border space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-twk-muted font-bold">FPS MÉDIO</span>
                          <span className="px-1.5 py-0.5 rounded bg-twk-card text-twk-muted font-bold">
                            +{avgDiff}%
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between pt-1 font-mono">
                          <div>
                            <span className="text-xs text-twk-dim block">Antes</span>
                            <span className="text-xl font-bold text-twk-text">{bm.before.avgFps} FPS</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-twk-dim block">Depois</span>
                            <span className="text-xl font-bold text-twk-text">{bm.after.avgFps} FPS</span>
                          </div>
                        </div>
                      </div>

                      {/* Frametime */}
                      <div className="p-4 rounded-xl bg-twk-surface border border-twk-border space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-twk-muted font-bold">FRAMETIME MÉDIO</span>
                          <span className="text-emerald-400 text-[10px] font-mono">Otimizado</span>
                        </div>
                        <div className="flex items-baseline justify-between pt-1 font-mono">
                          <div>
                            <span className="text-xs text-twk-dim block">Antes</span>
                            <span className="text-xl font-bold text-twk-text">{bm.before.frametimeAvgMs}ms</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-emerald-400 block">Depois</span>
                            <span className="text-xl font-bold text-emerald-400">{bm.after.frametimeAvgMs}ms</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {bm.notes && (
                      <div className="p-3.5 rounded-xl bg-twk-card border border-twk-border text-xs text-twk-muted font-mono leading-relaxed">
                        <span className="text-twk-green font-bold">Observações Técnicas: </span>
                        {bm.notes}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 3: Auditoria */}
        {activeTab === "auditoria" && (
          <div className="twk-card rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-twk-border">
              <div>
                <h3 className="text-base font-bold text-twk-text flex items-center gap-2">
                  <History className="w-4 h-4 text-twk-green" />
                  <span>Trilha de Auditoria Técnica de Ações</span>
                </h3>
                <p className="text-xs text-twk-dim">
                  Registro detalhado e imutável de todas as intervenções executadas no seu computador.
                </p>
              </div>
            </div>

            {ticket.actions.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs text-twk-dim">
                Nenhuma ação técnica registrada até o momento.
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {ticket.actions.map((act) => (
                  <div
                    key={act.id}
                    className="p-4 rounded-xl bg-twk-surface border border-twk-border/80 hover:border-twk-green/30 transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-twk-dim">{new Date(act.performedAt).toLocaleTimeString("pt-BR")}</span>
                        <span className="px-1.5 py-0.5 rounded bg-twk-card text-twk-green uppercase text-[10px] font-bold">
                          {act.category}
                        </span>
                        <span className="font-bold text-twk-text">{act.description}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                        {act.reversible ? "Reversível" : "Manual"}
                      </span>
                    </div>

                    <div className="text-xs text-twk-muted leading-relaxed">
                      <span className="text-twk-dim">Justificativa técnica: </span>
                      {act.reason}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded bg-twk-card/70 text-twk-dim">
                        <span className="text-rose-400 font-bold">Antes: </span>
                        {act.beforeValue || "Não registrado"}
                      </div>
                      <div className="p-2 rounded bg-twk-card/70 text-twk-dim">
                        <span className="text-twk-green font-bold">Depois: </span>
                        {act.afterValue || "Aplicado"}
                      </div>
                    </div>

                    <div className="text-[10px] text-twk-dim pt-1 flex justify-between">
                      <span>Executado por: {act.performedBy}</span>
                      <span>ID: {act.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Chat / Mensagens */}
        {activeTab === "chat" && (
          <div className="twk-card rounded-2xl p-6 sm:p-8 space-y-6">
            <h3 className="text-sm font-bold text-twk-text uppercase font-mono tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4 text-twk-green" />
              <span>Comunicação Direta com o Técnico</span>
            </h3>

            {/* Message Feed */}
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
              {ticket.messages.length === 0 ? (
                <div className="py-8 text-center text-xs text-twk-dim font-mono">
                  Nenhuma mensagem enviada ainda.
                </div>
              ) : (
                ticket.messages.map((m) => {
                  const isClient = m.senderRole === "cliente";
                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl max-w-xl text-xs space-y-1.5 ${
                        isClient
                          ? "ml-auto bg-twk-card border border-twk-green/30"
                          : "mr-auto bg-twk-surface border border-twk-border"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] font-mono">
                        <span className={isClient ? "text-twk-green font-bold" : "text-cyan-400 font-bold"}>
                          {m.senderName} ({m.senderRole === "cliente" ? "Cliente" : "Técnico TWK"})
                        </span>
                        <span className="text-twk-dim">
                          {new Date(m.sentAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-twk-text leading-relaxed whitespace-pre-line">
                        {m.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="pt-4 border-t border-twk-border flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escreva uma mensagem ou dúvida para o técnico..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text focus:outline-none focus:border-twk-green/60"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-twk-green hover:bg-twk-green-hover text-twk-bg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-twk-glow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

