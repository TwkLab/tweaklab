"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Cpu,
  Save,
  CheckCircle2,
  HardDrive,
  Monitor,
  Check,
  Plus,
} from "lucide-react";
import HardwareAutocomplete from "@/components/HardwareAutocomplete";
import ZeroInstallHardwareDetector from "@/components/ZeroInstallHardwareDetector";
import { DetectedSpecs } from "@/utils/hardwareDetection";
import { UserProfile, DeviceSpecs } from "@/types";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [discord, setDiscord] = useState("");
  const [phone, setPhone] = useState("");

  const [cpu, setCpu] = useState("");
  const [gpu, setGpu] = useState("");
  const [ram, setRam] = useState("");
  const [os, setOs] = useState("Windows 11 Pro 23H2 (64-bit)");
  const [storage, setStorage] = useState("");
  const [motherboard, setMotherboard] = useState("");

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSpecsDetected = (specs: DetectedSpecs) => {
    if (specs.cpu) setCpu(specs.cpu);
    if (specs.gpu) setGpu(specs.gpu);
    if (specs.ram) setRam(specs.ram);
    if (specs.os) setOs(specs.os);
    if (specs.storage) setStorage(specs.storage);
    if (specs.motherboard) setMotherboard(specs.motherboard);
  };

  useEffect(() => {
    const stored = localStorage.getItem("twk_client_user");
    if (stored) {
      try {
        const user: UserProfile = JSON.parse(stored);
        setName(user.name || "");
        setEmail(user.email || "");
        setDiscord(user.discord || "");
        setPhone(user.phone || "");

        if (user.device) {
          setCpu(user.device.cpu || "");
          setGpu(user.device.gpu || "");
          setRam(user.device.ram || "");
          setOs(user.device.os || "Windows 11 Pro 23H2 (64-bit)");
          setStorage(user.device.storage || "");
          setMotherboard(user.device.motherboard || "");
        }
      } catch {}
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const profile: UserProfile = {
      id: "cli-" + (email || "user").replace(/[^a-zA-Z0-9]/g, ""),
      name: name.trim() || "Cliente TweakLab",
      email: email.trim(),
      discord: discord.trim(),
      phone: phone.trim(),
      device: {
        cpu,
        gpu,
        ram,
        os,
        storage,
        motherboard,
      },
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("twk_client_user", JSON.stringify(profile));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top back */}
      <div className="flex items-center justify-between">
        <Link
          href="/portal"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-twk-muted hover:text-twk-green transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Portal do Cliente</span>
        </Link>

        <Link
          href="/portal/novo"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-twk-green hover:underline"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Abrir Chamado com esse Hardware</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-twk-border">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-twk-surface border border-twk-border text-xs font-mono text-twk-green">
          PERFIL & HARDWARE CADASTRADO
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-twk-text tracking-tight">
          Meu Perfil & Especificações do PC
        </h1>
        <p className="text-xs sm:text-sm text-twk-muted leading-relaxed">
          Salve a configuração das suas peças aqui. Quando você abrir um chamado, nós
          preencheremos o formulário automaticamente, agilizando seu atendimento técnico.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Informações de Contato */}
        <div className="twk-card rounded-2xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-twk-border">
            <User className="w-4 h-4 text-twk-green" />
            <h2 className="text-sm font-bold text-twk-text uppercase font-mono tracking-wider">
              1. Dados do Usuário
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted font-medium">Seu Nome / Apelido</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Lucas Mendonça"
                className="w-full px-3.5 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text focus:outline-none focus:border-twk-green/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted font-medium">E-mail para Contato</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: lucas@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text focus:outline-none focus:border-twk-green/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted font-medium">Usuário do Discord (Opcional)</label>
              <input
                type="text"
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                placeholder="Ex: @lucas_mendonca"
                className="w-full px-3.5 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text focus:outline-none focus:border-twk-green/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted font-medium">Telefone / WhatsApp (Opcional)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: (11) 98765-4321"
                className="w-full px-3.5 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text focus:outline-none focus:border-twk-green/60"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Meu Computador / Autocomplete Hardware */}
        <div className="twk-card rounded-2xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-twk-border">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-twk-green" />
              <h2 className="text-sm font-bold text-twk-text uppercase font-mono tracking-wider">
                2. Peças do Meu Computador
              </h2>
            </div>
            <span className="text-[11px] font-mono text-twk-green">
              Auto-completar ativo
            </span>
          </div>

          {/* Zero-Install Hardware Detector */}
          <ZeroInstallHardwareDetector onSpecsDetected={handleSpecsDetected} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted font-mono flex items-center justify-between">
                <span>Processador (CPU)</span>
                <span className="text-twk-dim text-[10px]">Ex: Ryzen ou Core</span>
              </label>
              <HardwareAutocomplete
                category="cpu"
                value={cpu}
                onChange={setCpu}
                placeholder="Digite para sugerir (ex: Ryzen 7 5700X)..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted font-mono flex items-center justify-between">
                <span>Placa de Vídeo (GPU)</span>
                <span className="text-twk-dim text-[10px]">Ex: RTX ou RX</span>
              </label>
              <HardwareAutocomplete
                category="gpu"
                value={gpu}
                onChange={setGpu}
                placeholder="Digite para sugerir (ex: RTX 4070, RX 7800 XT)..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted font-mono flex items-center justify-between">
                <span>Memória RAM</span>
                <span className="text-twk-dim text-[10px]">DDR4 / DDR5</span>
              </label>
              <HardwareAutocomplete
                category="ram"
                value={ram}
                onChange={setRam}
                placeholder="Digite para sugerir (ex: 32GB DDR4 3200MHz)..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted font-mono flex items-center justify-between">
                <span>Sistema Operacional</span>
                <span className="text-twk-dim text-[10px]">Versão do Windows</span>
              </label>
              <HardwareAutocomplete
                category="os"
                value={os}
                onChange={setOs}
                placeholder="Digite para sugerir (ex: Windows 11 Pro 23H2)..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted font-mono flex items-center justify-between">
                <span>Armazenamento (SSD / HD)</span>
                <span className="text-twk-dim text-[10px]">NVMe ou SATA</span>
              </label>
              <HardwareAutocomplete
                category="storage"
                value={storage}
                onChange={setStorage}
                placeholder="Digite para sugerir (ex: SSD NVMe 1TB M.2)..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-twk-muted font-mono flex items-center justify-between">
                <span>Placa-mãe (Opcional)</span>
                <span className="text-twk-dim text-[10px]">B550, B650, Z790</span>
              </label>
              <HardwareAutocomplete
                category="motherboard"
                value={motherboard}
                onChange={setMotherboard}
                placeholder="Digite para sugerir (ex: ASUS B550M, MSI B650)..."
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-900/50">
              <Check className="w-4 h-4" />
              <span>Informações salvas com sucesso!</span>
            </div>
          ) : (
            <div className="text-[11px] text-twk-dim font-mono">
              Dados salvos localmente e integrados aos novos chamados.
            </div>
          )}

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-twk-green hover:bg-twk-green-hover text-twk-bg font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-twk-glow hover:shadow-twk-glow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Informações</span>
          </button>
        </div>
      </form>
    </div>
  );
}
