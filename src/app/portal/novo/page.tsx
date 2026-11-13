"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Zap,
  Wrench,
  Cpu,
  CheckCircle2,
  UserCheck,
  Sparkles,
  LogIn,
  FileCode2,
  Upload,
} from "lucide-react";
import { Ticket, TicketCategory, TicketPriority, UserProfile } from "@/types";
import { initialTickets } from "@/data/mockTickets";
import HardwareAutocomplete from "@/components/HardwareAutocomplete";
import ZeroInstallHardwareDetector from "@/components/ZeroInstallHardwareDetector";
import { DetectedSpecs } from "@/utils/hardwareDetection";

function NewTicketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Client Session State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loginName, setLoginName] = useState("");
  const [loginEmail, setLoginEmail] = useState("");

  // Form State
  const initialCategory = (searchParams?.get("categoria") as TicketCategory) || "otimizacao_jogos";
  const [category, setCategory] = useState<TicketCategory>(initialCategory);
  const [priority, setPriority] = useState<TicketPriority>("alta");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Hardware Specs
  const [cpu, setCpu] = useState("");
  const [gpu, setGpu] = useState("");
  const [ram, setRam] = useState("");
  const [os, setOs] = useState("Windows 11 Pro 23H2 (64-bit)");
  const [storage, setStorage] = useState("");

  // TWK Agent Evidence Import
  const [evidenceDigest, setEvidenceDigest] = useState<string | null>(null);
  const [evidenceRawJson, setEvidenceRawJson] = useState<string | null>(null);
  const [agentImportSuccess, setAgentImportSuccess] = useState(false);

  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasImportedProfile, setHasImportedProfile] = useState(false);

  const handleSpecsDetected = (specs: DetectedSpecs) => {
    if (specs.cpu) setCpu(specs.cpu);
    if (specs.gpu) setGpu(specs.gpu);
    if (specs.ram) setRam(specs.ram);
    if (specs.os) setOs(specs.os);
    if (specs.storage) setStorage(specs.storage);
    if (specs.motherboard && !storage) {
      setStorage(`Placa-mãe: ${specs.motherboard}`);
    }
  };

  const handleImportEvidenceJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const envelope = JSON.parse(text);
        if (!envelope || !envelope.payload) {
          alert("O arquivo selecionado não contém um Envelope de Evidência TweakLab válido.");
          return;
        }

        const payload = envelope.payload;
        if (payload.cpu?.model) setCpu(payload.cpu.model);
        if (payload.gpus?.[0]?.model) setGpu(payload.gpus[0].model);
        if (payload.ram?.totalFormatted) {
          const mod = payload.ram.modules?.[0];
          setRam(`${payload.ram.totalFormatted} ${mod?.speed || ""} ${mod?.partNumber || ""}`.trim());
        }
        if (payload.operatingSystem?.caption) {
          setOs(`${payload.operatingSystem.caption} (${payload.operatingSystem.osArchitecture || ""})`.trim());
        }
        if (payload.disks?.[0]?.model) {
          setStorage(`${payload.disks[0].model} (${payload.disks[0].sizeFormatted || ""})`.trim());
        }

        setEvidenceDigest(envelope.consent?.payloadDigest || "sha256:importado");
        setEvidenceRawJson(text);
        setAgentImportSuccess(true);
      } catch (err) {
        alert("Falha ao ler o arquivo JSON do TWK Agent.");
      }
    };
    reader.readAsText(file);
  };

  // Auto-fetch synced evidence from cloud for this user
  const checkCloudEvidence = async (email: string) => {
    try {
      const res = await fetch(`/api/agent-sync?email=${encodeURIComponent(email)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.found && data.envelope) {
        const env = data.envelope;
        const payload = env.payload;
        if (payload?.cpu?.model) setCpu(payload.cpu.model);
        if (payload?.gpus?.[0]?.model) setGpu(payload.gpus[0].model);
        if (payload?.ram?.totalFormatted) {
          const mod = payload.ram.modules?.[0];
          setRam(`${payload.ram.totalFormatted} ${mod?.speed || ""} ${mod?.partNumber || ""}`.trim());
        }
        if (payload?.operatingSystem?.caption) {
          setOs(`${payload.operatingSystem.caption} (${payload.operatingSystem.osArchitecture || ""})`.trim());
        }
        if (payload?.disks?.[0]?.model) {
          setStorage(`${payload.disks[0].model} (${payload.disks[0].sizeFormatted || ""})`.trim());
        }

        setEvidenceDigest(env.consent?.payloadDigest || "sha256:nuvem");
        setEvidenceRawJson(JSON.stringify(env, null, 2));
        setAgentImportSuccess(true);
      }
    } catch {}
  };

  // Load client user session
  useEffect(() => {
    const stored = localStorage.getItem("twk_client_user");
    if (stored) {
      try {
        const user: UserProfile = JSON.parse(stored);
        setCurrentUser(user);
        if (user.device) {
          if (user.device.cpu) setCpu(user.device.cpu);
          if (user.device.gpu) setGpu(user.device.gpu);
          if (user.device.ram) setRam(user.device.ram);
          if (user.device.os) setOs(user.device.os);
          if (user.device.storage) setStorage(user.device.storage);
          setHasImportedProfile(true);
        }
        if (user.email) {
          checkCloudEvidence(user.email);
        }
      } catch {}
    }
  }, []);

  const handleSimpleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName.trim() || !loginEmail.trim()) return;

    const user: UserProfile = {
      id: "cli-" + loginEmail.replace(/[^a-zA-Z0-9]/g, ""),
      name: loginName.trim(),
      email: loginEmail.trim(),
      device: {
        cpu,
        gpu,
        ram,
        os,
        storage,
      },
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("twk_client_user", JSON.stringify(user));
    setCurrentUser(user);
    checkCloudEvidence(user.email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      alert("Por favor, confirme a autorização de triagem e termos de transparência.");
      return;
    }

    const cleanTitle = title.trim();
    const cleanDesc = description.trim();

    if (!cleanTitle || !cleanDesc) {
      alert("Por favor, preencha o título resumido e a descrição dos sintomas do seu computador.");
      return;
    }

    setIsSubmitting(true);

    const now = new Date().toISOString();
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newId = `twk-t-${Date.now()}`;
    const newCode = `TWK-2026-${randomNum}`;

    const clientName = currentUser?.name?.trim() || loginName.trim() || "Cliente";
    const clientEmail = currentUser?.email?.trim() || loginEmail.trim() || "cliente@tweaklab.com";

    const newTicket: Ticket = {
      id: newId,
      code: newCode,
      title: cleanTitle,
      description: cleanDesc,
      category,
      priority,
      status: "novo",
      customerName: clientName,
      customerEmail: clientEmail,
      device: {
        cpu: cpu || "Não especificado",
        gpu: gpu || "Não especificado",
        ram: ram || "Não especificado",
        os: os || "Windows 11",
        storage: storage || "SSD",
      },
      actions: [],
      benchmarks: [],
      evidenceDigest: evidenceDigest || undefined,
      evidenceRawJson: evidenceRawJson || undefined,
      messages: [
        {
          id: `msg-${Date.now()}`,
          ticketId: newId,
          senderName: clientName,
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

  // If client is not identified, require simple login first
  if (!currentUser) {
    return (
      <div className="py-16 max-w-md mx-auto px-4 space-y-6">
        <div>
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-twk-muted hover:text-twk-green"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Portal</span>
          </Link>
        </div>

        <div className="twk-card rounded-2xl p-7 sm:p-8 space-y-6 shadow-2xl hud-corner">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-twk-surface border border-twk-border flex items-center justify-center text-twk-green shadow-twk-glow-sm">
              <LogIn className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-twk-text">
              Identificação do Cliente
            </h1>
            <p className="text-xs text-twk-muted leading-relaxed">
              Para abrir um chamado e acompanhar o atendimento, informe seu nome e e-mail.
            </p>
          </div>

          <form onSubmit={handleSimpleLogin} className="space-y-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-twk-muted font-medium">Seu Nome / Apelido</label>
              <input
                type="text"
                required
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Ex: Lucas Mendonça"
                className="w-full px-3.5 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-twk-text focus:outline-none focus:border-twk-green/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-twk-muted font-medium">Seu E-mail</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Ex: lucas@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-twk-text focus:outline-none focus:border-twk-green/60"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-twk-green hover:bg-twk-green-hover text-twk-bg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-twk-glow transition-all"
            >
              <span>Continuar para Abertura de Chamado</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>

          <div className="text-[11px] text-center text-twk-dim font-mono">
            Sem senhas complexas durante a fase de testes.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top back */}
      <div className="flex items-center justify-between">
        <Link
          href="/portal"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-twk-muted hover:text-twk-green transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Portal</span>
        </Link>

        {/* User identification bar */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <span className="text-twk-dim">Conectado como:</span>
          <span className="text-twk-green font-bold">{currentUser.name}</span>
          <Link
            href="/portal/perfil"
            className="text-[11px] text-twk-dim hover:text-twk-text underline"
          >
            (Editar Perfil / PC)
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-twk-border">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-twk-surface border border-twk-border text-xs font-mono text-twk-green">
          ABERTURA DE ATENDIMENTO TÉCNICO
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-twk-text tracking-tight">
          Solicitar Atendimento Especializado
        </h1>
        <p className="text-xs sm:text-sm text-twk-muted leading-relaxed">
          Preencha com o problema enfrentado. As caixas de peças de computador possuem
          auto-completar para agilizar o preenchimento.
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

        {/* Step 2: Problem Description */}
        <div className="space-y-4 pt-4 border-t border-twk-border/60">
          <label className="text-xs font-mono uppercase tracking-wider text-twk-text font-semibold">
            2. Descrição do Problema
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
                      ? "bg-twk-card border-twk-green text-twk-green font-bold shadow-twk-glow-sm"
                      : "bg-twk-surface border-twk-border text-twk-dim"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Hardware Specs with Autocomplete */}
        <div className="space-y-4 pt-4 border-t border-twk-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-mono uppercase tracking-wider text-twk-text font-semibold flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-twk-green" />
              <span>3. Peças do Computador (Auto-Completar Ativo)</span>
            </label>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-twk-surface hover:bg-twk-card border border-twk-green/40 hover:border-twk-green text-[11px] font-mono text-twk-green transition-all shadow-twk-glow-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>Importar Evidência do TWK Agent</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportEvidenceJson}
                />
              </label>

              {hasImportedProfile && !agentImportSuccess && (
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Perfil Ativo
                </span>
              )}
            </div>
          </div>

          {agentImportSuccess && (
            <div className="p-3.5 rounded-xl bg-twk-green/10 border border-twk-green/40 flex items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-twk-green flex-shrink-0" />
                <div>
                  <span className="text-twk-green font-bold">Evidência TWK Agent Vinculada:</span>{" "}
                  <span className="text-twk-muted truncate block sm:inline">{evidenceDigest}</span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-twk-bg bg-twk-green px-2 py-0.5 rounded flex-shrink-0">
                Auditável
              </span>
            </div>
          )}

          {/* Zero Install Hardware Detector */}
          <ZeroInstallHardwareDetector onSpecsDetected={handleSpecsDetected} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted font-mono">Processador (CPU)</label>
              <HardwareAutocomplete
                category="cpu"
                value={cpu}
                onChange={setCpu}
                placeholder="Ex: Ryzen 7 5700X ou Core i5-13600K..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted font-mono">Placa de Vídeo (GPU)</label>
              <HardwareAutocomplete
                category="gpu"
                value={gpu}
                onChange={setGpu}
                placeholder="Ex: RTX 4070 ou RX 7800 XT..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted font-mono">Memória RAM</label>
              <HardwareAutocomplete
                category="ram"
                value={ram}
                onChange={setRam}
                placeholder="Ex: 32GB DDR4 3200MHz..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted font-mono">Versão do Windows</label>
              <HardwareAutocomplete
                category="os"
                value={os}
                onChange={setOs}
                placeholder="Ex: Windows 11 Pro 23H2..."
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs text-twk-muted font-mono">Armazenamento (SSD / HD)</label>
              <HardwareAutocomplete
                category="storage"
                value={storage}
                onChange={setStorage}
                placeholder="Ex: SSD NVMe 1TB M.2..."
              />
            </div>
          </div>
        </div>

        {/* Step 4: Consent */}
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
                que nenhuma alteração no Windows é feita sem autorização prévia e que toda
                intervenção é documentada e reversível.
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
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
            className="px-7 py-3 rounded-xl bg-twk-green hover:bg-twk-green-hover disabled:opacity-50 text-twk-bg font-bold text-xs uppercase tracking-wider shadow-twk-glow hover:shadow-twk-glow-lg transition-all flex items-center gap-2 cursor-pointer font-mono"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? "Enviando Chamado..." : "Confirmar & Abrir Chamado"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewTicketPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-twk-bg flex items-center justify-center text-twk-muted font-mono text-xs">
          Carregando formulário do chamado...
        </div>
      }
    >
      <NewTicketContent />
    </Suspense>
  );
}
