import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function BetaBanner() {
  return (
    <section className="py-16 relative">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="relative rounded-3xl overflow-hidden border border-twk-green/30 bg-gradient-to-r from-[#07130B] via-[#0B1A0E] to-[#07130B] p-8 sm:p-14 lg:p-16 text-center space-y-6 shadow-twk-glow">
          {/* Subtle background glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-twk-green/20 blur-[120px] rounded-full pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-twk-surface border border-twk-green/40 text-xs font-mono text-twk-green">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FASE DE TESTES CONTROLADOS • 100% GRATUITO</span>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-twk-text tracking-tight">
              Seu PC está engasgando ou fechando jogos?
            </h2>
            <p className="text-xs sm:text-base text-twk-muted leading-relaxed">
              Abra um chamado em nosso portal. Analisamos seu caso com seriedade,
              testamos antes e depois e você recebe o relatório completo de evidências.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/portal/novo"
              className="w-full sm:w-auto px-9 py-4 rounded-xl bg-twk-green hover:bg-twk-green-hover text-twk-bg font-bold text-sm tracking-wide shadow-twk-glow transition-all flex items-center justify-center gap-2 group"
            >
              <span>Abrir Meu Chamado de Teste</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/portal"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-twk-surface hover:bg-twk-card border border-twk-border text-twk-text font-medium text-sm transition-all"
            >
              Já possui chamado? Acompanhe o status
            </Link>
          </div>

          <div className="text-xs font-mono text-twk-dim pt-2">
            Disponível para amigos, conhecidos e usuários convidados nesta primeira fase.
          </div>
        </div>
      </div>
    </section>
  );
}
