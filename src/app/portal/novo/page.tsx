"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Zap,
  Wrench,
  HelpCircle,
  Cpu,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Ticket, TicketCategory, TicketPriority } from "@/types";
import { initialTickets } from "@/data/mockTickets";

export default function NewTicketPage() {
  const router = useRouter();

  const [category, setCategory] = useState<TicketCategory>("otimizacao_jogos");
  const [priority, setPriority] = useState<TicketPriority>("alta");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Specs
  const [cpu, setCpu] = useState("");
  const [gpu, setGpu] = useState("");
  const [ram, setRam] = useState("");
  const [os, setOs] = useState("Windows 11 64-bit");
  const [storage, setStorage] = useState("");

  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      alert("Por favor, confirme a autorização de análise preliminar.");
      return;
    }

    setIsSubmitting(true);

    const now = new Date().toISOString();
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newId = `twk-t-${Date.now()}`;
    const newCode = `TWK-2026-${randomNum}`;

    const newTicket: Ticket = {
      id: newId,
      code: newCode,
      title: title || "Solicitação de diagnóstico técnico",
      description: description,
      category,
      priority,
      status: "novo",
      customerName: customerName || "Usuário Convidado (Beta)",
      customerEmail: customerEmail || "usuario.beta@example.com",
      device: {
        cpu: cpu || "Não especificado",
        gpu: gpu || "Não especificado",
        ram: ram || "Não especificado",
        os: os || "Windows 11",
        storage: storage || "SSD",
      },
      actions: [],
      benchmarks: [],
      messages: [
        {
          id: `msg-${Date.now()}`,
          ticketId: newId,
          senderName: customerName || "Cliente",
          senderRole: "cliente",
          content: description,
          sentAt: now,
        },
      ],
      consents: [
        {
          id: `c-${Date.now()}`,
          ticketId: newId,
          purpose: "Autorização para triagem técnica preliminar",
          scope: "Avaliação do problema relatado e planejamento de testes",
          acceptedAt: now,
          status: "ativo",
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    // Save to localStorage
    const existing = localStorage.getItem("twk_tickets");
    let list: Ticket[] = [];
    if (existing) {
      try {
        list = JSON.parse(existing);
      } catch {
        list = initialTickets;
      }
    } else {
      list = initialTickets;
    }

    list = [newTicket, ...list];
    localStorage.setItem("twk_tickets", JSON.stringify(list));

    setTimeout(() => {
      router.push(`/portal/chamado/${newId}`);
    }, 400);
  };

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/portal"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-twk-muted hover:text-twk-green transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Portal</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-twk-border">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-twk-surface border border-twk-border text-xs font-mono text-twk-green">
          ABERTURA DE ATENDIMENTO BETA
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-twk-text tracking-tight">
          Solicitar Atendimento Técnico
        </h1>
        <p className="text-xs sm:text-sm text-twk-muted leading-relaxed">
          Preencha com o máximo de detalhes que souber. Não se preocupe se não souber
          alguma especificação técnica do computador; nós ajudaremos a identificar durante a triagem.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Category */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-twk-text font-semibold flex items-center justify-between">
            <span>1. Qual é o objetivo do chamado?</span>
            <span className="text-twk-green text-[11px] font-normal">Obrigatório</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setCategory("otimizacao_jogos")}
              className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between space-y-2 ${
                category === "otimizacao_jogos"
                  ? "bg-twk-card border-twk-green shadow-twk-glow-sm"
                  : "bg-twk-surface border-twk-border hover:border-twk-border/80"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-twk-bg flex items-center justify-center text-twk-green">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-twk-text">
                  Otimização de Jogos
                </div>
                <div className="text-[11px] text-twk-dim mt-0.5">
                  Micro-travamentos, 1% low baixo, DPC latency.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCategory("diagnostico_falhas")}
              className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between space-y-2 ${
                category === "diagnostico_falhas"
                  ? "bg-twk-card border-twk-green shadow-twk-glow-sm"
                  : "bg-twk-surface border-twk-border hover:border-twk-border/80"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-twk-bg flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-twk-text">
                  Falhas & Crashes
                </div>
                <div className="text-[11px] text-twk-dim mt-0.5">
                  Jogo fecha sozinho, tela azul (BSOD), congelamento.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCategory("consultoria_hardware")}
              className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between space-y-2 ${
                category === "consultoria_hardware"
                  ? "bg-twk-card border-twk-green shadow-twk-glow-sm"
                  : "bg-twk-surface border-twk-border hover:border-twk-border/80"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-twk-bg flex items-center justify-center text-cyan-400">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-twk-text">
                  Consultoria de Hardware
                </div>
                <div className="text-[11px] text-twk-dim mt-0.5">
                  Upgrades, dimensionamento de fonte e gargalo.
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Contact Info */}
        <div className="space-y-4 pt-4 border-t border-twk-border/60">
          <label className="text-xs font-mono uppercase tracking-wider text-twk-text font-semibold">
            2. Seus Dados de Identificação
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted font-medium">Seu Nome / Apelido</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex: Lucas Mendonça"
                className="w-full px-3.5 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text focus:outline-none focus:border-twk-green/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted font-medium">E-mail para Notificações</label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Ex: lucas@exemplo.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text focus:outline-none focus:border-twk-green/60"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Problem Description */}
        <div className="space-y-4 pt-4 border-t border-twk-border/60">
          <label className="text-xs font-mono uppercase tracking-wider text-twk-text font-semibold">
            3. Descrição do Problema
          </label>

          <div className="space-y-1.5">
            <label className="text-xs text-twk-muted font-medium">Título Resumido</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Quedas frequentes de FPS no Warzone quando entro em tiroteios"
              className="w-full px-3.5 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text focus:outline-none focus:border-twk-green/60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-twk-muted font-medium">
              Relato detalhado (Em quais jogos acontece? Dá alguma mensagem de erro?)
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que acontece, com que frequência, e se você já tentou alterar algo recentemente..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text focus:outline-none focus:border-twk-green/60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-twk-muted font-medium">Urgência Sentida</label>
            <div className="flex flex-wrap gap-2">
              {(["baixa", "media", "alta", "critica"] as TicketPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all border ${
                    priority === p
                      ? "bg-twk-card border-twk-green text-twk-green font-bold"
                      : "bg-twk-surface border-twk-border text-twk-dim"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 4: Hardware Specs */}
        <div className="space-y-4 pt-4 border-t border-twk-border/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-twk-text font-semibold flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-twk-green" />
              <span>4. Peças do Computador (Informações Voluntárias)</span>
            </label>
            <span className="text-[11px] text-twk-dim">Ajuda a agilizar o diagnóstico</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted">Processador (CPU)</label>
              <input
                type="text"
                value={cpu}
                onChange={(e) => setCpu(e.target.value)}
                placeholder="Ex: AMD Ryzen 7 5700X ou Intel i5-13600K"
                className="w-full px-3.5 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text font-mono focus:outline-none focus:border-twk-green/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted">Placa de Vídeo (GPU)</label>
              <input
                type="text"
                value={gpu}
                onChange={(e) => setGpu(e.target.value)}
                placeholder="Ex: NVIDIA RTX 3070 8GB ou RX 6700 XT"
                className="w-full px-3.5 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text font-mono focus:outline-none focus:border-twk-green/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted">Memória RAM</label>
              <input
                type="text"
                value={ram}
                onChange={(e) => setRam(e.target.value)}
                placeholder="Ex: 32GB DDR4 3200MHz (2x16GB)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text font-mono focus:outline-none focus:border-twk-green/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted">Versão do Sistema Operacional</label>
              <input
                type="text"
                value={os}
                onChange={(e) => setOs(e.target.value)}
                placeholder="Ex: Windows 11 Pro 23H2"
                className="w-full px-3.5 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text font-mono focus:outline-none focus:border-twk-green/60"
              />
            </div>
          </div>
        </div>

        {/* Step 5: Consent */}
        <div className="pt-4 border-t border-twk-border/60">
          <div className="p-4 rounded-xl bg-twk-card border border-twk-green/30 space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent-check"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded bg-twk-surface border-twk-border text-twk-green focus:ring-0 cursor-pointer"
              />
              <label
                htmlFor="consent-check"
                className="text-xs text-twk-muted leading-relaxed cursor-pointer"
              >
                <strong className="text-twk-text">
                  Autorização de Triagem e Termo de Transparência:
                </strong>{" "}
                Autorizo a equipe técnica da TweakLab a analisar as informações
                técnicas fornecidas para elaboração do diagnóstico inicial. Compreendo
                que na TweakLab nenhuma intervenção no sistema operacional é feita sem
                autorização prévia e que toda alteração é reversível e auditável.
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-between">
          <Link
            href="/portal"
            className="text-xs text-twk-dim hover:text-twk-muted font-mono"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={isSubmitting || !consent}
            className="px-7 py-3 rounded-xl bg-twk-green hover:bg-twk-green-hover disabled:opacity-50 text-twk-bg font-bold text-xs uppercase tracking-wider shadow-twk-glow hover:shadow-twk-glow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? "Enviando Chamado..." : "Confirmar & Abrir Chamado"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

