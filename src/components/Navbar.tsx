"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  ShieldCheck,
  Terminal,
  Activity,
  Layers,
  ArrowRight,
  UserCheck,
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-twk-border/80 bg-twk-bg/90 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 h-18 flex items-center justify-between">
        {/* Brand / Logo: TWK symbol only as requested */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-10 w-28 sm:h-12 sm:w-36 flex items-center justify-start transition-transform group-hover:scale-105">
            <Image
              src="/branding/twk-symbol.png"
              alt="TWK"
              width={160}
              height={48}
              className="object-contain h-full w-auto drop-shadow-[0_0_15px_rgba(0,255,136,0.4)]"
              priority
            />
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-twk-green/10 text-twk-green border border-twk-green/30 tracking-wider font-semibold">
            Beta
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-twk-muted font-medium">
          <Link
            href="/#principios"
            className="hover:text-twk-green transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-twk-green/80" />
            Princípios
          </Link>
          <Link
            href="/#servicos"
            className="hover:text-twk-green transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-twk-green/80" />
            Serviços
          </Link>
          <Link
            href="/#metodologia"
            className="hover:text-twk-green transition-colors flex items-center gap-1.5"
          >
            <Activity className="w-4 h-4 text-twk-green/80" />
            Metodologia
          </Link>
          <Link
            href="/#evidencias"
            className="hover:text-twk-green transition-colors"
          >
            Evidências & Benchmarks
          </Link>
          <Link
            href="/#faq"
            className="hover:text-twk-green transition-colors"
          >
            FAQ
          </Link>
        </nav>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/admin"
            className="text-xs text-twk-dim hover:text-twk-muted px-2.5 py-1.5 rounded border border-transparent hover:border-twk-border transition-colors flex items-center gap-1 font-mono"
            title="Acesso reservado para equipe técnica"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Painel Técnico</span>
          </Link>

          <Link
            href="/portal"
            className="text-xs font-semibold text-twk-text hover:text-twk-green px-4 py-2.5 rounded-xl border border-twk-border hover:border-twk-green/40 bg-twk-surface/60 transition-all flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-twk-green" />
            <span>Portal do Cliente</span>
          </Link>

          <Link
            href="/portal/novo"
            className="text-xs font-semibold text-twk-bg bg-twk-green hover:bg-twk-green-hover px-5 py-2.5 rounded-xl shadow-twk-glow-sm hover:shadow-twk-glow transition-all flex items-center gap-1.5"
          >
            <span>Abrir Chamado</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/portal/novo"
            className="text-xs font-semibold text-twk-bg bg-twk-green px-3 py-1.5 rounded-lg shadow-sm"
          >
            Chamado
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg border border-twk-border text-twk-muted hover:text-twk-text focus:outline-none"
            aria-label="Abrir menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-twk-border bg-twk-surface/95 px-4 pt-3 pb-5 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-medium">
            <Link
              href="/#principios"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-twk-card text-twk-muted hover:text-twk-green"
            >
              Princípios Éticos
            </Link>
            <Link
              href="/#servicos"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-twk-card text-twk-muted hover:text-twk-green"
            >
              Serviços Oferecidos
            </Link>
            <Link
              href="/#metodologia"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-twk-card text-twk-muted hover:text-twk-green"
            >
              Metodologia de 5 Passos
            </Link>
            <Link
              href="/#evidencias"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-twk-card text-twk-muted hover:text-twk-green"
            >
              Evidências & Benchmarks
            </Link>
            <Link
              href="/#faq"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-twk-card text-twk-muted hover:text-twk-green"
            >
              Dúvidas Frequentes (FAQ)
            </Link>
          </div>

          <div className="pt-2 border-t border-twk-border/60 flex flex-col gap-2">
            <Link
              href="/portal"
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-sm font-semibold text-twk-text border border-twk-border py-2.5 rounded-lg bg-twk-card"
            >
              Acessar Portal do Cliente
            </Link>
            <Link
              href="/portal/novo"
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-sm font-semibold text-twk-bg bg-twk-green py-2.5 rounded-lg"
            >
              Solicitar Atendimento Técnico
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-xs text-twk-dim py-1.5 font-mono"
            >
              Acesso Técnico / Administrador
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
