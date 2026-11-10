# TweakLab (TWK) — Plataforma de Diagnóstico & Performance

> **Plataforma de suporte técnico remoto especializada em computadores, Windows e desempenho em jogos, com diagnósticos baseados em evidências, medições antes/depois e transparência total sobre cada alteração realizada.**

---

## ⚡ Princípios Fundamentais

1. **Diagnosticar antes de otimizar**: Investigação rigorosa com evidências (DPC Latency, Event Viewer, Minidumps, alocação de threads e thermal throttling).
2. **Medir antes e depois com testes reproduzíveis**: O FPS médio pode enganar; a métrica essencial para eliminar stuttering é o **1% Low** e a estabilidade dos frametimes.
3. **Não prometer ganhos fixos de FPS**: Respeito à física do hardware e honestidade técnica.
4. **Segurança e estabilidade do Windows**: Sem desativação irresponsável de antivírus ou componentes de segurança do sistema operacional. Toda alteração possui justificativa técnica, é auditada e reversível.

---

## 🛠️ Stack Tecnológica

- **Framework**: [Next.js](https://nextjs.org/) (App Router) + TypeScript
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) com design system customizado TWK (`#050605` background, `#00FF88` Matrix Green)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Armazenamento / Backend**: Arquitetura desacoplada, pronta para migração e persistência no [Supabase](https://supabase.com/) (Postgres + Auth + Storage + RLS)

---

## 🚀 Como Executar o Projeto Localmente

### 1. Pré-requisitos
- **Node.js** v20+ ou v26+ (instalado no sistema)
- **npm** ou **pnpm**

### 2. Instalação das dependências
```bash
npm install
```

### 3. Execução em desenvolvimento
```bash
npm run dev
```
O projeto estará disponível em: [http://localhost:3000](http://localhost:3000)

### 4. Build de produção e verificação de tipos
```bash
npm run build
npm start
```

---

## 📁 Estrutura de Pastas

```
TweakLab/
├── public/
│   └── branding/              # Logotipos oficiais TWK (2D, 3D badge e mockups)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Layout mestre com tema escuro e fontes
│   │   ├── globals.css        # Paleta TWK, utilitários HUD e scrollbar customizada
│   │   ├── page.tsx           # Landing Page completa (Hero, Princípios, Metodologia, Benchmarks)
│   │   ├── portal/
│   │   │   ├── page.tsx       # Portal do Cliente (listagem e filtros de chamados)
│   │   │   ├── novo/page.tsx  # Formulário guiado para abertura de chamado com consentimento
│   │   │   └── chamado/[id]/  # Detalhes, pipeline de status, benchmarks e chat
│   │   ├── admin/
│   │   │   ├── page.tsx       # Fila e gestão de chamados do técnico/administrador
│   │   │   └── chamado/[id]/  # Bancada técnica para registrar ações e benchmarks
│   │   ├── relatorio/[id]/    # Relatório técnico oficial exportável e pronto para impressão (PDF)
│   │   ├── termos/            # Termos de Atendimento e Responsabilidade
│   │   └── privacidade/       # Política de Privacidade e LGPD
│   ├── components/            # Componentes reutilizáveis e interativos
│   ├── data/                  # Mock inicial tipado com casos de estudo reais
│   └── types/                 # Tipagens estritas de chamados, benchmarks e auditoria
├── tailwind.config.ts         # Configuração de cores e sombras personalizadas
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🧪 Roteiro de Testes Manuais

1. **Landing Page (`/`)**:
   - Navegue pelas seções: Princípios, Serviços, Metodologia de 5 Passos e FAQ.
   - Interaja com o comparativo de benchmarks antes/depois no seletor de jogos.
   - Inspecione a amostra de log de auditoria.

2. **Abertura de Chamado (`/portal/novo`)**:
   - Selecione a categoria (ex: *Otimização de Jogos*).
   - Preencha o sintoma e os dados voluntários de hardware.
   - Marque o termo de autorização e envie. Você será redirecionado para a página do chamado recém-criado.

3. **Portal do Cliente (`/portal/chamado/[id]`)**:
   - Acompanhe a linha do tempo do status.
   - Alterne entre as abas: *Visão Geral*, *Benchmarks*, *Trilha de Alterações* e *Mensagens*.
   - Envie uma mensagem pelo chat técnico.

4. **Bancada Técnica (`/admin/chamado/[id]`)**:
   - Altere o status do chamado (ex: para *Em Atendimento* ou *Concluído*).
   - Adicione uma nova ação técnica auditada ou registre um novo teste de benchmark.
   - As alterações se refletem instantaneamente no portal do cliente e no relatório final.

5. **Relatório Técnico & PDF (`/relatorio/[id]`)**:
   - Clique em *Imprimir / Salvar em PDF* para visualizar a folha de relatório formatada com identificação e assinatura criptográfica.

---

## 📌 Próximos Passos (Conforme Master Plan)

- [x] **Etapa 1: Fundação Web & Design System TWK**
- [ ] **Etapa 2: Conexão Supabase (Migrations de Banco + Auth + RLS)**
- [ ] **Etapa 3: Upload de Anexos e Logs no Supabase Storage**
- [ ] **Etapa 4: Geração de PDF no Servidor**
- [ ] **Etapa 5: Testes Automatizados com Vitest / Playwright**

