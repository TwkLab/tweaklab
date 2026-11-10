import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function TermosPage() {
  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-twk-muted hover:text-twk-green"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Início</span>
        </Link>
      </div>

      <div className="space-y-3 pb-6 border-b border-twk-border">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-twk-surface border border-twk-border text-xs font-mono text-twk-green">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>GOVERNANÇA & ÉTICA</span>
        </div>
        <h1 className="text-3xl font-extrabold text-twk-text tracking-tight">
          Termos de Atendimento e Responsabilidade
        </h1>
        <p className="text-xs text-twk-dim font-mono">
          Versão 1.0 • Em vigor durante a Fase de Testes Beta (Novembro de 2026)
        </p>
      </div>

      <div className="prose prose-invert max-w-none space-y-6 text-xs sm:text-sm text-twk-muted leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-twk-text">1. Natureza do Serviço</h2>
          <p>
            A <strong>TweakLab (TWK)</strong> presta serviços de suporte técnico remoto,
            diagnóstico e consultoria de estabilidade para computadores operando com o
            sistema operacional Windows. Durante a presente fase beta, o serviço é
            oferecido gratuitamente para fins de teste, pesquisa e amadurecimento técnico.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-twk-text">2. Princípio da Evidência e Não Promessa Fixa</h2>
          <p>
            A TweakLab <strong>não promete nem assegura ganhos percentuais fixos de FPS</strong>.
            O desempenho final de jogos e softwares está estritamente condicionado aos limites físicos
            do hardware do cliente (CPU, GPU, RAM, placa-mãe e arrefecimento) e à programação dos próprios jogos.
            Nosso compromisso consiste na realização de testes de linha de base com medição de 1% low,
            eliminação de contenções de drivers e busca de consistência nos frametimes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-twk-text">3. Consentimento para Acesso Remoto</h2>
          <p>
            Todo acesso remoto é estritamente assistido e transparente:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>O cliente autoriza expressamente a conexão remota;</li>
            <li>O cliente tem visão contínua de todas as janelas e comandos executados em seu monitor;</li>
            <li>O cliente pode interromper o acesso a qualquer instante simplesmente encerrando o software de conexão;</li>
            <li>Nenhuma ferramenta de controle oculto ou acesso silencioso é permitida.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-twk-text">4. Preservação da Segurança do Sistema Operacional</h2>
          <p>
            A TweakLab repudia a desativação cega de componentes de segurança do Windows.
            Não desativamos o Windows Defender, Firewall, Controle de Conta de Usuário (UAC) ou
            Isolamento de Núcleo (VBS) de forma generalizada. Toda alteração relevante possui
            justificativa técnica, documentação no relatório e registro de estado anterior para reversão.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-twk-text">5. Reversibilidade e Responsabilidade</h2>
          <p>
            O cliente recebe no fechamento do chamado um relatório técnico detalhando as configurações
            modificadas. Embora nos dediquemos ao máximo em aplicar metodologias seguras e testadas,
            o cliente é responsável por manter backup de arquivos pessoais confidenciais antes de qualquer intervenção.
          </p>
        </section>
      </div>
    </div>
  );
}

