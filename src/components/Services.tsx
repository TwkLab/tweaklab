import Link from "next/link";
import { AlertTriangle, Zap, Wrench, ArrowRight, Check } from "lucide-react";

const services = [
  {
    id: "falhas",
    icon: AlertTriangle,
    title: "Diagnóstico de Falhas & Instabilidade",
    badge: "Solução de Problemas",
    description:
      "Seu jogo fecha sozinho? O computador congela ou dá tela azul (BSOD)? Nós identificamos a causa raiz com ferramentas profissionais de depuração.",
    features: [
      "Análise de despejo de memória (Minidump) via WinDbg",
      "Identificação de instabilidade em memórias DDR4/DDR5 (XMP/EXPO)",
      "Detecção de thermal throttling de CPU, GPU ou VRM",
      "Correção de corrupções de arquivos do sistema (SFC / DISM)",
    ],
    ctaText: "Resolver Travamentos",
    categoryParam: "diagnostico_falhas",
  },
  {
    id: "otimizacao",
    icon: Zap,
    title: "Otimização de Latência & 1% Low",
    badge: "Fluidez Competitiva",
    description:
      "Elimine os micro-travamentos que custam suas partidas. Focamos no que realmente importa para a sensação de jogo: frametimes estáveis e resposta imediata.",
    features: [
      "Benchmark antes e depois gravado com métricas de 1% low",
      "Auditoria de latência DPC de drivers de rede, áudio e vídeo",
      "Otimização de agendamento de threads e Core Parking de CPU",
      "Ajustes específicos de arquivos de configuração dos motores gráficos",
    ],
    ctaText: "Otimizar Meus Jogos",
    categoryParam: "otimizacao_jogos",
    highlight: true,
  },
  {
    id: "hardware",
    icon: Wrench,
    title: "Consultoria de Hardware & Upgrades",
    badge: "Orientação Imparcial",
    description:
      "Economize dinheiro. Avaliamos se o upgrade que você planeja realmente trará retorno ou se ficará preso por gargalo de processador ou fonte.",
    features: [
      "Cálculo de gargalo (bottleneck) real entre CPU, GPU e resolução",
      "Dimensionamento de fonte e verificação de barramentos PCIe",
      "Orientação de fluxo de ar, coolers e pasta térmica",
      "Recomendações sem vínculo comercial ou interesse em lojas",
    ],
    ctaText: "Pedir Consultoria",
    categoryParam: "consultoria_hardware",
  },
];

export default function Services() {
  return (
    <section id="servicos" className="py-20 border-t border-twk-border/60 relative">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-twk-surface border border-twk-border text-xs font-mono text-twk-green">
            SERVIÇOS ESPECIALIZADOS
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-twk-text">
            O que fazemos pelo seu setup
          </h2>
          <p className="text-sm sm:text-base text-twk-muted leading-relaxed">
            Atendimento remoto feito por técnicos reais, com comunicação direta,
            autorização a cada etapa e relatório completo em mãos.
          </p>
        </div>

        {/* Services Grid - Expands beautifully on wide PC monitors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-10">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className={`twk-card rounded-2xl p-7 sm:p-9 flex flex-col justify-between relative group transition-all shadow-xl ${
                  s.highlight
                    ? "border-twk-green/40 shadow-twk-glow-sm bg-gradient-to-b from-[#101810] to-[#0A0D0A]"
                    : ""
                }`}
              >
                {s.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-twk-green text-twk-bg font-bold font-mono text-[10px] uppercase tracking-wider shadow-twk-glow-sm">
                    Mais Solicitado
                  </div>
                )}

                <div className="space-y-6">
                  {/* Top */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-twk-surface border border-twk-border flex items-center justify-center text-twk-green group-hover:border-twk-green/50 transition-colors shadow-twk-glow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono text-twk-dim px-2.5 py-1 rounded bg-twk-surface border border-twk-border">
                      {s.badge}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-twk-text group-hover:text-twk-green transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-twk-muted leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  {/* Feature List */}
                  <ul className="space-y-3 pt-3 border-t border-twk-border/50">
                    {s.features.map((feat, fidx) => (
                      <li
                        key={fidx}
                        className="flex items-start gap-3 text-xs sm:text-sm text-twk-muted"
                      >
                        <Check className="w-4 h-4 text-twk-green flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom CTA */}
                <div className="pt-8 mt-6 border-t border-twk-border/40">
                  <Link
                    href={`/portal/novo?categoria=${s.categoryParam}`}
                    className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                      s.highlight
                        ? "bg-twk-green text-twk-bg hover:bg-twk-green-hover shadow-twk-glow-sm"
                        : "bg-twk-surface text-twk-text hover:text-twk-green border border-twk-border hover:border-twk-green/40"
                    }`}
                  >
                    <span>{s.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
