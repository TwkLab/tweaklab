# Fatos e Reconhecimento da Base — Fase 0

Data de Verificação: 11/11/2026
Branch: `main`
HEAD: `bae682e` (fix(favicon): corrigir proporcao 1:1 do favicon e remover imagem retangular do header de icones)
Ambiente Web: Next.js 15 App Router, React 19, TailwindCSS, Three.js, Vercel
Deploy Web: https://tweaklab-lac.vercel.app/

## 1. Inventário de Capacidade Atual da Base

| Capacidade | Estado no Repositório | Caminho Principal | Detalhes e Limitações |
| :--- | :--- | :--- | :--- |
| Landing Page / Apresentação | **Real / Produção** | `src/app/page.tsx`, `src/components/*` | Totalmente funcional, responsivo, Three.js 3D. Valores de benchmarks são ilustrativos/demonstrativos. |
| Portal do Cliente (Chamados) | **Demo / LocalStorage** | `src/app/portal/page.tsx`, `src/app/portal/novo/page.tsx` | Armazenamento no navegador (`twk_tickets`, `twk_client_user`). Sem backend real ou autenticação com servidor. |
| Perfil & Especificações PC | **Demo / LocalStorage** | `src/app/portal/perfil/page.tsx` | Armazena specs em `localStorage` para autocompletar chamados locais. |
| Painel Técnico (Admin) | **Demo / Flag Local** | `src/app/admin/page.tsx` | Protegido apenas por flag em memória/localStorage (`twk_admin_authenticated`). Não usar como autorização real. |
| Relatório Técnico (PDF) | **Demo / Impressão** | `src/app/relatorio/[id]/page.tsx` | Rótulo SHA256 é sintético; geração via `window.print()`. |
| API Backend / Banco de Dados | **Ausente / Proposta** | N/A | Nenhum Route Handler `/api`, nem cliente de banco configurado no repositório. Supabase listado apenas como proposta no README. |
| TWK Agent Desktop | **Fase 1 em Desenvolvimento**| `agent/` | Solução .NET 8 / C# WPF x64 sob demanda sem privilégios administrativos. |

## 2. Decisões Arquiteturais Registradas (ADR)
- **ADR-001:** O TWK Agent roda como aplicativo de usuário comum (standard user), sem serviços em background, sem drivers de kernel e sem telemetria passiva.
- **ADR-002:** Toda coleta requer consentimento granular e explícito exibido previamente na tela.
- **ADR-003:** O aplicativo opera inicialmente em **Modo Local Offline**, salvando e exportando relatórios JSON/HTML auditáveis sem depender de rede.
- **ADR-004:** Separação estrita de camadas: `Twk.Agent.Core` não possui nenhuma dependência do Windows, WPF ou HTTP.
