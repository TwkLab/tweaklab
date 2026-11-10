"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, Cpu, Activity, Clock, ShieldCheck } from "lucide-react";

interface BenchmarkCase {
  id: string;
  game: string;
  scenario: string;
  hardware: string;
  resolution: string;
  before: {
    avgFps: number;
    low1Percent: number;
    frametimeMs: number;
    dpcPeakUs: number;
  };
  after: {
    avgFps: number;
    low1Percent: number;
    frametimeMs: number;
    dpcPeakUs: number;
  };
  keyChange: string;
}

const cases: BenchmarkCase[] = [
  {
    id: "warzone",
    game: "Call of Duty: Warzone",
    scenario: "Urzikstan • 1440p Competitivo • DLSS Qualidade",
    hardware: "Ryzen 7 5700X • RTX 3070 8GB • 32GB RAM",
    resolution: "2560x1440",
    before: {
      avgFps: 128,
      low1Percent: 42,
      frametimeMs: 14.8,
      dpcPeakUs: 2450,
    },
    after: {
      avgFps: 141,
      low1Percent: 88,
      frametimeMs: 7.1,
      dpcPeakUs: 410,
    },
    keyChange:
      "Isolamento de DPC Latency do driver de rede + Limpeza de Shader Cache + Otimização de threads no adv_options.ini",
  },
  {
    id: "cs2",
    game: "Counter-Strike 2",
    scenario: "Mirage 10v10 Deathmatch • 1080p Nativo • Baixo Competitivo",
    hardware: "i5-12400F • RTX 4060 8GB • 16GB DDR4",
    resolution: "1920x1080",
    before: {
      avgFps: 245,
      low1Percent: 95,
      frametimeMs: 10.5,
      dpcPeakUs: 1890,
    },
    after: {
      avgFps: 268,
      low1Percent: 172,
      frametimeMs: 4.8,
      dpcPeakUs: 320,
    },
    keyChange:
      "Desativação de HPET conflituoso + Desativação de Game DVR em background + Alinhamento de temporizador de alta precisão",
  },
  {
    id: "finals",
    game: "The Finals (Unreal Engine 5)",
    scenario: "Monaco Destruction • 1080p High • FSR Qualidade",
    hardware: "Ryzen 5 5600 • RX 6700 XT 12GB • 16GB RAM",
    resolution: "1920x1080",
    before: {
      avgFps: 102,
      low1Percent: 38,
      frametimeMs: 18.2,
      dpcPeakUs: 2100,
    },
    after: {
      avgFps: 114,
      low1Percent: 74,
      frametimeMs: 9.3,
      dpcPeakUs: 550,
    },
    keyChange:
      "Reset de shader pipeline corrompido + Ajuste de alocação de memória virtual (Pagefile) em SSD NVMe",
  },
];

export default function BenchmarkPreview() {
  const [selectedCase, setSelectedCase] = useState<BenchmarkCase>(cases[0]);

  // Calculations
  const low1Diff = Math.round(
    ((selectedCase.after.low1Percent - selectedCase.before.low1Percent) /
      selectedCase.before.low1Percent) *
      100
  );
  const avgFpsDiff = Math.round(
    ((selectedCase.after.avgFps - selectedCase.before.avgFps) /
      selectedCase.before.avgFps) *
      100
  );
  const frametimeReduction = Math.round(
    ((selectedCase.before.frametimeMs - selectedCase.after.frametimeMs) /
      selectedCase.before.frametimeMs) *
      100
  );

  return (
    <section id="evidencias" className="py-20 border-t border-twk-border/60 relative">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-twk-surface border border-twk-border text-xs font-mono text-twk-green">
            MEDIDAS REAIS DE DESEMPENHO
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-twk-text">
            O impacto na estabilidade: Antes vs. Depois
          </h2>
          <p className="text-sm sm:text-base text-twk-muted leading-relaxed">
            Repare no detalhe técnico: o FPS médio sobe de forma moderada, mas a
            métrica crucial — o <strong className="text-twk-text font-semibold">1% Low</strong> —
            quase dobra. É essa estabilidade que faz o jogo parar de travar nos tiroteios.
          </p>
        </div>

        {/* Game Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {cases.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-mono transition-all border ${
                selectedCase.id === c.id
                  ? "bg-twk-green text-twk-bg border-twk-green font-bold shadow-twk-glow-sm"
                  : "bg-twk-surface text-twk-muted hover:text-twk-text border-twk-border hover:border-twk-border/80"
              }`}
            >
              {c.game}
            </button>
          ))}
        </div>

        {/* Benchmark Showcase Card - Full Width on Wide Desktops */}
        <div className="twk-card rounded-3xl p-6 sm:p-10 lg:p-12 w-full space-y-8 hud-corner shadow-2xl">
          {/* Header of Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-twk-border">
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-twk-green font-bold tracking-wider">
                CASO DE TESTE CONTROLADO • METODOLOGIA TWK
              </div>
              <h3 className="text-xl sm:text-3xl font-extrabold text-twk-text">
                {selectedCase.game}
              </h3>
              <div className="text-xs sm:text-sm text-twk-dim">
                Cenário: {selectedCase.scenario}
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-xs sm:text-sm font-mono shadow-sm">
              <Cpu className="w-4 h-4 text-twk-green" />
              <span className="text-twk-muted font-medium">
                {selectedCase.hardware}
              </span>
            </div>
          </div>

          {/* Comparative Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Metric 1: 1% Low (The Star) */}
            <div className="p-6 rounded-2xl bg-twk-surface/90 border border-twk-green/30 shadow-twk-glow-sm space-y-4">
              <div className="flex items-center justify-between text-xs sm:text-sm font-mono">
                <span className="text-twk-green font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  1% Low (Sem Travamentos)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-twk-green/20 text-twk-green font-bold">
                  +{low1Diff}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/30 text-center">
                  <div className="text-[11px] uppercase font-mono text-rose-400">
                    Antes
                  </div>
                  <div className="text-3xl font-bold font-mono text-twk-text mt-1">
                    {selectedCase.before.low1Percent}
                  </div>
                  <div className="text-[11px] text-twk-dim">FPS</div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-twk-green/40 text-center">
                  <div className="text-[11px] uppercase font-mono text-twk-green font-bold">
                    Depois
                  </div>
                  <div className="text-3xl font-bold font-mono text-twk-green mt-1">
                    {selectedCase.after.low1Percent}
                  </div>
                  <div className="text-[11px] text-twk-dim">FPS</div>
                </div>
              </div>

              {/* Progress Bar Comparison */}
              <div className="space-y-2 pt-2 text-[11px] font-mono">
                <div className="flex justify-between text-twk-dim">
                  <span>Antes: {selectedCase.before.low1Percent} FPS</span>
                  <span className="text-twk-green font-bold">Depois: {selectedCase.after.low1Percent} FPS</span>
                </div>
                <div className="h-2.5 rounded-full bg-twk-card overflow-hidden flex">
                  <div
                    className="h-full bg-twk-green shadow-twk-glow-sm transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (selectedCase.after.low1Percent / 220) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Metric 2: Average FPS */}
            <div className="p-6 rounded-2xl bg-twk-surface/90 border border-twk-border space-y-4">
              <div className="flex items-center justify-between text-xs sm:text-sm font-mono">
                <span className="text-twk-muted uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                  <TrendingUp className="w-4 h-4 text-twk-muted" />
                  FPS Médio (Taxa Bruta)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-twk-card text-twk-muted font-bold">
                  +{avgFpsDiff}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-twk-card border border-twk-border/60 text-center">
                  <div className="text-[11px] uppercase font-mono text-twk-dim">
                    Antes
                  </div>
                  <div className="text-3xl font-bold font-mono text-twk-text mt-1">
                    {selectedCase.before.avgFps}
                  </div>
                  <div className="text-[11px] text-twk-dim">FPS</div>
                </div>

                <div className="p-4 rounded-xl bg-twk-card border border-twk-border/80 text-center">
                  <div className="text-[11px] uppercase font-mono text-twk-text font-bold">
                    Depois
                  </div>
                  <div className="text-3xl font-bold font-mono text-twk-text mt-1">
                    {selectedCase.after.avgFps}
                  </div>
                  <div className="text-[11px] text-twk-dim">FPS</div>
                </div>
              </div>

              <div className="text-xs text-twk-dim leading-relaxed pt-2">
                Ganhos de FPS médio ocorrem pela desobstrução de I/O e eliminação de processos ociosos de fundo.
              </div>
            </div>

            {/* Metric 3: Frametime & DPC Latency */}
            <div className="p-6 rounded-2xl bg-twk-surface/90 border border-twk-border space-y-4">
              <div className="flex items-center justify-between text-xs sm:text-sm font-mono">
                <span className="text-twk-muted uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                  <Clock className="w-4 h-4 text-twk-muted" />
                  Latência & Frametime
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold">
                  -{frametimeReduction}% ms
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-twk-card border border-twk-border/60 text-center">
                  <div className="text-[11px] uppercase font-mono text-rose-400">
                    Spikes de Pico
                  </div>
                  <div className="text-2xl font-bold font-mono text-rose-300 mt-1">
                    {selectedCase.before.frametimeMs}ms
                  </div>
                  <div className="text-[11px] text-twk-dim font-mono">
                    DPC: {selectedCase.before.dpcPeakUs}µs
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-twk-card border border-twk-border/80 text-center">
                  <div className="text-[11px] uppercase font-mono text-emerald-400 font-bold">
                    Estabilizado
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {selectedCase.after.frametimeMs}ms
                  </div>
                  <div className="text-[11px] text-twk-dim font-mono">
                    DPC: {selectedCase.after.dpcPeakUs}µs
                  </div>
                </div>
              </div>

              <div className="text-xs text-twk-dim leading-relaxed pt-2">
                Quanto mais reto e baixo o gráfico de frametimes, menor a sensação de &ldquo;arrasto&rdquo; no mouse.
              </div>
            </div>
          </div>

          {/* Key Change Log Description */}
          <div className="p-5 rounded-2xl bg-twk-card border border-twk-border flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-twk-green flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="font-bold text-twk-text">
                O que foi corrigido nesse atendimento:
              </div>
              <div className="text-twk-muted leading-relaxed font-mono text-xs">
                {selectedCase.keyChange}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
