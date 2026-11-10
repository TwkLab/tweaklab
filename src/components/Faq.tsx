"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Vocês desativam o Windows Defender, Firewall ou atualizações de segurança?",
    answer:
      "Definitivamente não. Jamais desativamos as proteções fundamentais do Windows. Desligar antivírus para 'ganhar FPS' é uma prática perigosa e ultrapassada. Nossas melhorias vêm do ajuste de DPC latency, resolução de conflitos de drivers, agendamento de threads no processador e eliminação de contenção de leitura em disco.",
  },
  {
    question: "Quantos FPS eu vou ganhar no meu computador?",
    answer:
      "Desconfie de qualquer um que prometa números fixos sem antes analisar suas peças. Se sua placa de vídeo já estiver operando a 99% de uso (GPU-bound), o ganho no FPS médio será sutil. Nosso objetivo principal é estabilizar a métrica de 1% Low e os frametimes: é essa estabilidade que elimina o stuttering e dá a sensação de fluidez real nos movimentos do mouse.",
  },
  {
    question: "Como funciona a sessão de atendimento remoto?",
    answer:
      "O atendimento é 100% assistido e transparente. Nós combinamos um horário com você, você acompanha visualmente na sua tela tudo o que o técnico faz, e você pode cancelar o acesso com um clique a qualquer instante. Nada é feito às escondidas.",
  },
  {
    question: "Por que a fase beta é gratuita?",
    answer:
      "A TweakLab foi concebida com base em rigor de engenharia. Antes de lançar qualquer serviço comercial, nosso compromisso é realizar testes controlados com amigos e usuários convidados, validar metodologias e amadurecer nossos relatórios de auditoria.",
  },
  {
    question: "É possível reverter as alterações caso eu não goste?",
    answer:
      "Sim. Todas as alterações técnicas são categorizadas quanto à reversibilidade. No relatório final do seu chamado, registramos o valor original ('Antes') e o valor modificado ('Depois'), permitindo restauração total a qualquer momento.",
  },
  {
    question: "Vocês usam aqueles 'otimizadores automáticos' que circulam no YouTube?",
    answer:
      "Não. Softwares automatizados ou executáveis de procedência duvidosa são a maior causa de instabilidade no Windows. Todo diagnóstico é feito com ferramentas profissionais oficiais (WinDbg, LatencyMon, PresentMon, Event Viewer, DDU) e ajustes manuais explicados individualmente.",
  },
];

export default function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 border-t border-twk-border/60 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-twk-surface border border-twk-border text-xs font-mono text-twk-green">
            ESCLARECIMENTOS
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-twk-text">
            Perguntas Frequentes
          </h2>
          <p className="text-sm sm:text-base text-twk-muted">
            Transparência técnica absoluta sobre nossos métodos, segurança e filosofia.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="twk-card rounded-xl border border-twk-border overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:text-twk-green transition-colors focus:outline-none"
                >
                  <span className="text-sm sm:text-base font-semibold text-twk-text flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-twk-green flex-shrink-0" />
                    {f.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-twk-muted transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? "rotate-180 text-twk-green" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-twk-muted leading-relaxed border-t border-twk-border/50 font-normal">
                    {f.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

