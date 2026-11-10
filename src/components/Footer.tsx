import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Cpu, GitCommit } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-twk-border bg-twk-surface/90 text-twk-muted text-sm pt-14 pb-10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-twk-border/60">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-28 flex items-center">
                <Image
                  src="/branding/twk-symbol.png"
                  alt="TWK"
                  width={120}
                  height={36}
                  className="object-contain h-full w-auto drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]"
                />
              </div>
            </div>
            <p className="text-xs text-twk-dim leading-relaxed">
              Plataforma de suporte técnico remoto especializada em Windows e
              desempenho em jogos. Diagnósticos baseados em evidências, medições
              reprodutíveis e transparência de reversão.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-twk-card border border-twk-border text-[11px] font-mono text-twk-green">
              <span className="w-2 h-2 rounded-full bg-twk-green animate-pulse" />
              <span>Ambiente Beta Controlado</span>
            </div>
          </div>

          {/* Links Col 1: Serviços */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-twk-text flex items-center gap-1.5 font-bold">
              <Cpu className="w-4 h-4 text-twk-green" />
              Serviços
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/#servicos"
                  className="hover:text-twk-green transition-colors"
                >
                  Diagnóstico de Falhas & Crashes
                </Link>
              </li>
              <li>
                <Link
                  href="/#servicos"
                  className="hover:text-twk-green transition-colors"
                >
                  Otimização de Latência & Frametime
                </Link>
              </li>
              <li>
                <Link
                  href="/#servicos"
                  className="hover:text-twk-green transition-colors"
                >
                  Consultoria de Hardware & Montagem
                </Link>
              </li>
              <li>
                <Link
                  href="/#evidencias"
                  className="hover:text-twk-green transition-colors"
                >
                  Relatórios com Benchmark Real
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Col 2: Plataforma */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-twk-text flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-twk-green" />
              Plataforma
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/portal"
                  className="hover:text-twk-green transition-colors"
                >
                  Portal do Cliente
                </Link>
              </li>
              <li>
                <Link
                  href="/portal/novo"
                  className="hover:text-twk-green transition-colors"
                >
                  Abrir Novo Chamado
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-twk-green transition-colors"
                >
                  Painel Administrativo
                </Link>
              </li>
              <li>
                <Link
                  href="/termos"
                  className="hover:text-twk-green transition-colors"
                >
                  Termos de Atendimento
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidade"
                  className="hover:text-twk-green transition-colors"
                >
                  Privacidade & LGPD
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Diretrizes Éticas */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-twk-text flex items-center gap-1.5 font-bold">
              <GitCommit className="w-4 h-4 text-twk-green" />
              Diretrizes Éticas
            </h4>
            <p className="text-xs text-twk-dim leading-relaxed">
              Não desativamos proteções do Windows (Defender, UAC, VBS) de forma
              indiscriminada. Não vendemos promessas mágicas de dobrar FPS. Toda
              intervenção é precedida de consentimento e documentada com logs
              reversíveis.
            </p>
            <div className="text-[11px] text-twk-dim font-mono pt-1">
              Fase inicial gratuita para testes com amigos e usuários convidados.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-twk-dim">
          <div>
            © {new Date().getFullYear()} TweakLab (TWK). Todos os direitos reservados.
          </div>
          <div className="text-[11px]">
            Desenvolvido com rigor técnico, telemetria de precisão e respeito à segurança do Windows.
          </div>
        </div>
      </div>
    </footer>
  );
}
