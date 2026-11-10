import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacidadePage() {
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
          <Lock className="w-3.5 h-3.5" />
          <span>LGPD & PRIVACIDADE</span>
        </div>
        <h1 className="text-3xl font-extrabold text-twk-text tracking-tight">
          Política de Privacidade e Proteção de Dados
        </h1>
        <p className="text-xs text-twk-dim font-mono">
          Alinhada à Lei Geral de Proteção de Dados (Lei nº 13.709/2018) • Novembro de 2026
        </p>
      </div>

      <div className="prose prose-invert max-w-none space-y-6 text-xs sm:text-sm text-twk-muted leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-twk-text">1. Princípio da Minimização de Dados</h2>
          <p>
            A <strong>TweakLab (TWK)</strong> coleta única e exclusivamente os dados necessários
            para a identificação do usuário e para o diagnóstico técnico do computador. Não coletamos
            arquivos pessoais, históricos de navegação, senhas ou conteúdos confidenciais.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-twk-text">2. Dados Técnicos Coletados com Autorização</h2>
          <p>
            Durante a triagem e o atendimento, podem ser registrados voluntariamente:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nome / Apelido e e-mail de contato;</li>
            <li>Modelo de processador (CPU), placa de vídeo (GPU), memória RAM e placa-mãe;</li>
            <li>Versão e compilação do Windows;</li>
            <li>Logs de erros públicos do Windows (Event Viewer) e relatórios de latência de drivers (DPC);</li>
            <li>Métricas de taxa de quadros (FPS médio, 1% low e frametimes) geradas durante os testes de jogos.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-twk-text">3. Não Compartilhamento e Sigilo</h2>
          <p>
            Nenhum dado técnico ou de contato do cliente é comercializado, cedido ou compartilhado
            com terceiros ou anunciantes. Os dados de benchmark são utilizados estritamente para comprovar
            a eficácia do atendimento ao próprio cliente e gerar seu relatório assinado.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-twk-text">4. Direitos do Titular (LGPD)</h2>
          <p>
            Conforme a legislação brasileira, você possui o direito de consultar os dados mantidos,
            solicitar correções ou requerer a exclusão completa do seu histórico de chamados a qualquer momento,
            bastando solicitar através dos canais de suporte da TweakLab.
          </p>
        </section>
      </div>
    </div>
  );
}

