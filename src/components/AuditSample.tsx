import { History, Shield, CheckCircle2, RotateCcw } from "lucide-react";

const auditActions = [
  {
    time: "15:20:14",
    category: "Diagnóstico",
    action: "Inspeção de latência DPC via LatencyMon",
    reason: "Identificar qual driver do kernel estava acumulando interrupções",
    before: "Pico de 2450 µs em nvlddmkm.sys",
    after: "Isolamento confirmado no agendamento de GPU",
    reversible: true,
  },
  {
    time: "16:05:30",
    category: "Driver",
    action: "Execução de DDU em Modo de Segurança com isolamento de telemetria",
    reason: "Remover acúmulo de cache corrompido pós atualização do Windows 11",
    before: "NVIDIA v551.23 sobreposta com logs antigos",
    after: "Instalação limpa v552.12 sem bloatwares",
    reversible: true,
  },
  {
    time: "16:30:45",
    category: "Sistema",
    action: "Desativação de Game DVR em background (preservando Game Mode nativo)",
    reason: "Contenção de escrita contínua em disco durante renderização de texturas",
    before: "DVR gravando buffer contínuo em disco SSD",
    after: "Gravação desativada; priorização do Game Mode mantida",
    reversible: true,
  },
  {
    time: "17:00:12",
    category: "Motor Gráfico",
    action: "Ajuste de RendererWorkerCount no adv_options.ini para 6 threads",
    reason: "Evitar que o jogo dispute as threads de SO com Discord e antivírus",
    before: "RendererWorkerCount = 8 (100% dos núcleos físicos)",
    after: "RendererWorkerCount = 6 (estabilidade total)",
    reversible: true,
  },
];

export default function AuditSample() {
  return (
    <section className="py-20 border-t border-twk-border/60 relative">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-twk-surface border border-twk-border text-xs font-mono text-twk-green">
              TRANSPARÊNCIA TOTAL
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-twk-text leading-tight">
              Cada clique registrado. Cada alteração justificada.
            </h2>
            <p className="text-sm sm:text-base text-twk-muted leading-relaxed">
              Você nunca mais precisará perguntar &ldquo;o que esse programa fez no meu PC?&rdquo;.
              Nosso sistema gera uma trilha de auditoria completa entregue a você no
              relatório final.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 text-xs sm:text-sm text-twk-muted">
                <CheckCircle2 className="w-5 h-5 text-twk-green flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-twk-text">Motivo técnico claro:</strong> explicamos o porquê de cada modificação.
                </span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-twk-muted">
                <RotateCcw className="w-5 h-5 text-twk-green flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-twk-text">Registro de reversão:</strong> salvamos o estado anterior para permitir restauração imediata.
                </span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-twk-muted">
                <Shield className="w-5 h-5 text-twk-green flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-twk-text">Sem caixas pretas:</strong> você tem acesso ao arquivo gerado para auditar quando quiser.
                </span>
              </div>
            </div>
          </div>

          {/* Right Audit Table Mockup */}
          <div className="lg:col-span-7">
            <div className="twk-card rounded-3xl p-6 sm:p-8 shadow-2xl hud-corner font-mono text-xs">
              <div className="flex items-center justify-between pb-4 border-b border-twk-border">
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4 text-twk-green" />
                  <span className="font-bold text-sm text-twk-text">
                    LOG DE AUDITORIA • CHAMADO #TWK-2026-001
                  </span>
                </div>
                <span className="text-[10px] text-twk-green px-2.5 py-0.5 rounded-full bg-twk-green/10 border border-twk-green/20 font-semibold">
                  Autenticado & Concluído
                </span>
              </div>

              <div className="mt-5 space-y-3.5">
                {auditActions.map((act, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-twk-surface border border-twk-border/80 hover:border-twk-green/30 transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-twk-dim font-bold">{act.time}</span>
                        <span className="px-2 py-0.5 rounded bg-twk-card text-twk-green font-semibold">
                          {act.category}
                        </span>
                        <span className="font-bold text-twk-text">{act.action}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                        {act.reversible ? "Reversível" : "Manual"}
                      </span>
                    </div>

                    <div className="text-xs text-twk-muted leading-relaxed">
                      <span className="text-twk-dim">Motivo:</span> {act.reason}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2.5 rounded bg-twk-card/60 text-twk-dim truncate">
                        <span className="text-rose-400 font-bold">Antes:</span> {act.before}
                      </div>
                      <div className="p-2.5 rounded bg-twk-card/60 text-twk-dim truncate">
                        <span className="text-twk-green font-bold">Depois:</span> {act.after}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-twk-border/60 flex items-center justify-between text-xs text-twk-dim">
                <span>Trilha de eventos assinada criptograficamente</span>
                <span className="text-twk-muted font-bold">Responsável: Técnico TWK #01</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
