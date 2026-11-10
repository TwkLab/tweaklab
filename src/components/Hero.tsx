"use client";

import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Cpu,
  BarChart3,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import HardwareViewer3D from "./HardwareViewer3D";

export default function Hero() {
  return (
    <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-twk-green/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Main Container - Scaled for wide PC screens and mobile */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Col (6 cols on wide screens) */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Beta pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-twk-surface border border-twk-border text-xs text-twk-muted shadow-twk-glow-sm">
              <span className="w-2 h-2 rounded-full bg-twk-green animate-pulse" />
              <span className="text-twk-text font-medium">Fase de Testes Controlados</span>
              <span className="text-twk-border">|</span>
              <span className="text-twk-green font-mono font-semibold">Beta Gratuito</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-twk-text leading-[1.12]">
              Diagnóstico e performance para Windows baseados em{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-twk-green via-twk-green-hover to-emerald-400 twk-glow-text">
                evidências.
              </span>
            </h1>

            {/* Subhead */}
            <p className="text-sm sm:text-base lg:text-lg text-twk-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Sem scripts milagrosos que corrompem o Windows. Medimos antes e
              depois com testes de <strong className="text-twk-text font-semibold">1% low</strong> e{" "}
              <strong className="text-twk-text font-semibold">frametime</strong> reproduzíveis. Toda alteração é
              explicada, autorizada e reversível.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/portal/novo"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-twk-green hover:bg-twk-green-hover text-twk-bg font-bold text-sm tracking-wide transition-all shadow-twk-glow hover:shadow-twk-glow-lg flex items-center justify-center gap-2 group"
              >
                <span>Solicitar Atendimento Gratuito</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="#evidencias"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-twk-surface hover:bg-twk-card border border-twk-border hover:border-twk-green/40 text-twk-text font-medium text-sm transition-all flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-4 h-4 text-twk-green" />
                <span>Ver Demonstração de Relatório</span>
              </Link>
            </div>

            {/* Guarantee badges */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="flex items-center gap-2 text-xs text-twk-muted">
                <CheckCircle2 className="w-4 h-4 text-twk-green flex-shrink-0" />
                <span>100% Auditável</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-twk-muted">
                <RotateCcw className="w-4 h-4 text-twk-green flex-shrink-0" />
                <span>Ajustes Reversíveis</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-twk-muted">
                <ShieldCheck className="w-4 h-4 text-twk-green flex-shrink-0" />
                <span>Segurança Preservada</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-twk-muted">
                <Terminal className="w-4 h-4 text-twk-green flex-shrink-0" />
                <span>Zero Promessa Mágica</span>
              </div>
            </div>
          </div>

          {/* Right Col: Interactive 3D Hardware Viewer (6 cols on wide screens) */}
          <div className="lg:col-span-6 w-full space-y-3">
            <HardwareViewer3D />

            {/* Under-viewer metadata bar */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-twk-surface/70 border border-twk-border/60 text-[11px] font-mono text-twk-dim">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-twk-green" />
                <span>Modelo Interativo 3D: Pressione e arraste com o mouse</span>
              </div>
              <span className="text-twk-muted hidden sm:inline">Renderização WebGL 60FPS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
