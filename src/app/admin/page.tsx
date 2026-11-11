"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Terminal,
  Cpu,
  Search,
  Filter,
  ArrowRight,
  Lock,
  LogOut,
  ShieldCheck,
  CheckCircle,
  Clock,
} from "lucide-react";
import { initialTickets } from "@/data/mockTickets";
import { Ticket, TicketStatus } from "@/types";
import TicketStatusBadge from "@/components/TicketStatusBadge";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState(false);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  useEffect(() => {
    // Check if session exists
    const isAuth = localStorage.getItem("twk_admin_authenticated");
    if (isAuth === "true") {
      setIsAuthenticated(true);
    }

    const stored = localStorage.getItem("twk_tickets");
    if (stored) {
      try {
        setTickets(JSON.parse(stored));
      } catch {
        setTickets(initialTickets);
      }
    } else {
      setTickets(initialTickets);
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = adminUser.trim().toLowerCase();
    const p = adminPassword.trim();

    // Accepted credentials: user: admin, password: admin or twk2026
    if (u === "admin" && (p === "admin" || p === "twk2026" || p === "admin123")) {
      localStorage.setItem("twk_admin_authenticated", "true");
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("twk_admin_authenticated");
    setIsAuthenticated(false);
  };

  const handleStatusChange = (id: string, newStatus: TicketStatus) => {
    const updated = tickets.map((t) =>
      t.id === id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
    );
    setTickets(updated);
    localStorage.setItem("twk_tickets", JSON.stringify(updated));
  };

  const filtered = tickets.filter((t) => {
    const matchText =
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "todos" ? true : t.status === filterStatus;
    return matchText && matchStatus;
  });

  // Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="py-20 max-w-md mx-auto px-4 space-y-6">
        <div className="twk-card rounded-3xl p-8 space-y-6 shadow-2xl hud-corner">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-twk-surface border border-twk-border flex items-center justify-center text-twk-green shadow-twk-glow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-twk-text">
              Acesso Técnico • TweakLab
            </h1>
            <p className="text-xs text-twk-muted leading-relaxed">
              Autenticação restrita para técnicos e administradores de suporte.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-twk-muted font-medium">Usuário</label>
              <input
                type="text"
                required
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-twk-text focus:outline-none focus:border-twk-green/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-twk-muted font-medium">Senha</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-twk-surface border border-twk-border text-twk-text focus:outline-none focus:border-twk-green/60"
              />
            </div>

            {loginError && (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-400 text-[11px] text-center">
                Usuário ou senha incorretos. (Dica: admin / admin)
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-twk-green hover:bg-twk-green-hover text-twk-bg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-twk-glow transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Entrar no Painel Técnico</span>
            </button>
          </form>

          <div className="text-[11px] text-center text-twk-dim font-mono border-t border-twk-border/60 pt-3">
            Credenciais padrão: <strong>admin</strong> / <strong>admin</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-twk-border">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-twk-surface border border-twk-border text-[11px] font-mono text-twk-green">
            <Terminal className="w-3.5 h-3.5" />
            <span>PAINEL DE CONTROLE TÉCNICO & AUDITORIA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-twk-text tracking-tight">
            Fila de Chamados Ativos
          </h1>
          <p className="text-xs sm:text-sm text-twk-muted">
            Área de triagem, registro de intervenções em tempo real e consolidação de evidências.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAdminLogout}
            className="text-xs font-mono text-rose-400 hover:text-rose-300 px-3 py-2 rounded-xl border border-rose-900/40 bg-rose-950/20 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão</span>
          </button>

          <Link
            href="/portal"
            className="text-xs font-mono text-twk-dim hover:text-twk-green px-3 py-2 rounded-xl border border-twk-border bg-twk-surface"
          >
            Visão do Cliente →
          </Link>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-twk-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por código, cliente ou problema..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text placeholder-twk-dim font-mono focus:outline-none focus:border-twk-green/60"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-twk-dim" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-muted font-mono focus:outline-none focus:border-twk-green/60"
          >
            <option value="todos">Todos os Status</option>
            <option value="novo">Novo</option>
            <option value="triagem">Triagem</option>
            <option value="em_atendimento">Em Atendimento</option>
            <option value="concluido">Concluído</option>
          </select>
        </div>
      </div>

      {/* Ticket Cards or Empty Queue */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="twk-card rounded-3xl p-12 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-twk-surface border border-twk-border flex items-center justify-center text-twk-green shadow-twk-glow-sm">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-twk-text">
                Fila de Atendimento Vazia
              </h3>
              <p className="text-xs text-twk-muted max-w-sm mx-auto leading-relaxed">
                Nenhum chamado pendente no momento. Quando um cliente abrir um atendimento pelo portal,
                ele aparecerá nesta lista em tempo real.
              </p>
            </div>
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="twk-card rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-twk-green/40 transition-all group"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-twk-green">
                    {t.code}
                  </span>
                  <TicketStatusBadge status={t.status} size="sm" />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-twk-surface border border-twk-border text-twk-dim uppercase">
                    Prioridade: {t.priority}
                  </span>
                  <span className="text-[11px] font-mono text-twk-text">
                    Cliente: <strong className="text-twk-green">{t.customerName}</strong>
                  </span>
                </div>

                <div className="space-y-1">
                  <Link
                    href={`/admin/chamado/${t.id}`}
                    className="text-base font-bold text-twk-text group-hover:text-twk-green transition-colors"
                  >
                    {t.title}
                  </Link>
                  <p className="text-xs text-twk-muted line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>
                </div>

                {/* Hardware badge */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-twk-dim">
                  <span className="p-1 px-2 rounded bg-twk-surface border border-twk-border/60 flex items-center gap-1 text-twk-muted">
                    <Cpu className="w-3.5 h-3.5 text-twk-green" />
                    {t.device.cpu} • {t.device.gpu}
                  </span>
                  <span className="text-twk-dim">
                    Ações: <strong className="text-twk-text">{t.actions.length}</strong>
                  </span>
                  <span>•</span>
                  <span className="text-twk-dim">
                    Benchmarks: <strong className="text-twk-text">{t.benchmarks.length}</strong>
                  </span>
                </div>
              </div>

              {/* Quick Actions and Entry button */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-twk-border">
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="text-twk-dim text-[11px]">Status:</span>
                  <select
                    value={t.status}
                    onChange={(e) =>
                      handleStatusChange(t.id, e.target.value as TicketStatus)
                    }
                    className="px-2.5 py-1 rounded-lg bg-twk-surface border border-twk-border text-xs text-twk-text font-mono focus:border-twk-green/60"
                  >
                    <option value="novo">Novo</option>
                    <option value="triagem">Triagem</option>
                    <option value="em_atendimento">Em Atendimento</option>
                    <option value="aguardando_validacao">Aguardando Validação</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <Link
                  href={`/admin/chamado/${t.id}`}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-twk-green hover:bg-twk-green-hover text-twk-bg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-twk-glow-sm font-mono"
                >
                  <span>Bancada Técnica</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
