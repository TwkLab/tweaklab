import { Stethoscope, Scale, ShieldAlert, Undo2 } from "lucide-react";

const principles = [
  {
    icon: Stethoscope,
    title: "1. Diagnosticar antes de otimizar",
    subtitle: "Investigação com evidências",
    description:
      "A maioria dos problemas de desempenho em jogos tem causas pontuais: conflitos de drivers, latência DPC, contenção de threads ou thermal throttling. Não aplicamos scripts cegos.",
  },
  {
    icon: Scale,
    title: "2. Medir antes e depois (1% Low)",
    subtitle: "Testes técnicos reproduzíveis",
    description:
      "O FPS médio engana. O que causa frustração em jogos competitivos são os micro-travamentos (1% low drops e frametime inconsistente). Medimos tudo em cenários idênticos antes de tocar no sistema.",
  },
  {
    icon: ShieldAlert,
    title: "3. Zero promessas milagrosas",
    subtitle: "Sem 'ganhe 200 FPS com 1 clique'",
    description:
      "Ganhos dependem estritamente do hardware e do tipo de gargalo. Prometer ganhos fixos sem diagnóstico é desonesto. Nosso compromisso é com a máxima estabilidade e fluidez real.",
  },
  {
    icon: Undo2,
    title: "4. Estabilidade & Reversibilidade",
    subtitle: "Segurança do Windows preservada",
    description:
      "Não desativamos proteções essenciais do Windows nem forçamos alterações de registro perigosas. Cada alteração realizada é explicada ao cliente e pode ser desfeita a qualquer momento.",
  },
];

export default function Principles() {
  return (
    <section id="principios" className="py-20 border-t border-twk-border/60 relative">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-twk-surface border border-twk-border text-xs font-mono text-twk-green">
            MANIFESTO TWEAKLAB
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-twk-text">
            Por que somos diferentes da maioria dos &ldquo;otimizadores&rdquo;?
          </h2>
          <p className="text-sm sm:text-base text-twk-muted leading-relaxed">
            A indústria da internet está saturada de .bat milagrosos e &ldquo;tweakers&rdquo; que
            corrompem o Windows e desativam proteções antivírus sem necessidade.
            Na TweakLab, operamos com rigor de engenharia de software e suporte técnico.
          </p>
        </div>

        {/* Principles Grid - Expands nicely on wide monitors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {principles.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="twk-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between group hover:border-twk-green/40 transition-all shadow-lg"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-twk-surface border border-twk-border group-hover:border-twk-green/50 flex items-center justify-center text-twk-green transition-colors shadow-twk-glow-sm">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-mono text-twk-green uppercase tracking-wider font-semibold">
                      {p.subtitle}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-twk-text">
                      {p.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-twk-muted leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-twk-border/40 mt-6 flex items-center justify-between text-[11px] font-mono text-twk-dim">
                  <span>REGRA TWK #{idx + 1}</span>
                  <span className="text-twk-green font-semibold">Inviolável</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
