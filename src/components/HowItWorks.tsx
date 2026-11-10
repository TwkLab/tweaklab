import { FileText, Search, ShieldCheck, Terminal, CheckCircle2 } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Abertura de Chamado",
    icon: FileText,
    desc: "Você descreve o sintoma (jogo, crash, queda de frames) e informa voluntariamente a configuração do computador.",
  },
  {
    step: "02",
    title: "Triagem & Hipóteses",
    icon: Search,
    desc: "O técnico TWK investiga as hipóteses técnicas prováveis e planeja os testes de diagnóstico de linha de base.",
  },
  {
    step: "03",
    title: "Consentimento Explícito",
    icon: ShieldCheck,
    desc: "Apresentamos o escopo do que será testado. Nenhuma ferramenta ou configuração é alterada sem seu aval.",
  },
  {
    step: "04",
    title: "Atendimento Assistido",
    icon: Terminal,
    desc: "Sessão remota assistida em tempo real. Você visualiza cada ação e medimos o benchmark 'Antes' em cenário idêntico.",
  },
  {
    step: "05",
    title: "Relatório de Evidências",
    icon: CheckCircle2,
    desc: "Geração de relatório em PDF com comparativo de 1% low antes/depois, logs das ações e confirmação de estabilidade.",
  },
];

export default function HowItWorks() {
  return (
    <section id="metodologia" className="py-20 border-t border-twk-border/60 relative">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-twk-surface border border-twk-border text-xs font-mono text-twk-green">
            FLUXO TRANSPARENTE
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-twk-text">
            Como funciona o atendimento
          </h2>
          <p className="text-sm sm:text-base text-twk-muted leading-relaxed">
            Do primeiro contato até o relatório final: você no controle total de cada intervenção no seu sistema operacional.
          </p>
        </div>

        {/* Steps Grid - Spans nicely across wide monitors */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6 relative">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={st.step}
                className="twk-card rounded-2xl p-6 flex flex-col justify-between relative group hover:border-twk-green/40 transition-all shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-twk-dim group-hover:text-twk-green transition-colors">
                      {st.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-twk-surface border border-twk-border flex items-center justify-center text-twk-green group-hover:border-twk-green/40 shadow-twk-glow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm sm:text-base font-bold text-twk-text group-hover:text-twk-green transition-colors">
                      {st.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-twk-muted leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-twk-border/40 mt-5 text-[11px] font-mono text-twk-dim flex items-center justify-between">
                  <span>Passo {idx + 1} de 5</span>
                  <span className="text-twk-green">Auditado</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
