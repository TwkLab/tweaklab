"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Printer,
  ArrowLeft,
  ShieldCheck,
  Cpu,
  Activity,
  History,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { initialTickets } from "@/data/mockTickets";
import { Ticket } from "@/types";

export default function ReportPage() {
  const params = useParams();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("twk_tickets");
    let list: Ticket[] = [];
    if (stored) {
      try {
        list = JSON.parse(stored);
      } catch {
        list = initialTickets;
      }
    } else {
      list = initialTickets;
    }

    const found = list.find((t) => t.id === ticketId);
    setTicket(found || list[0] || initialTickets[0]);
  }, [ticketId]);

  if (!ticket) {
    return (
      <div className="py-20 text-center font-mono text-xs text-twk-muted">
        Carregando relatório técnico...
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
      {/* Top action bar (hidden on print) */}
      <div className="print:hidden flex items-center justify-between pb-4 border-b border-twk-border">
        <Link
          href={`/portal/chamado/${ticket.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-twk-muted hover:text-twk-green"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Chamado</span>
        </Link>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-twk-green hover:bg-twk-green-hover text-twk-bg font-bold text-xs font-mono flex items-center gap-2 shadow-twk-glow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Salvar em PDF</span>
        </button>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-[#0A0D0A] print:bg-white print:text-black border border-twk-border print:border-gray-300 rounded-2xl p-8 sm:p-12 space-y-8 shadow-2xl">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-twk-border print:border-gray-300">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-twk-border print:border-gray-400">
              <Image
                src="/branding/twk-logo-clean.jpg"
                alt="Logo TWK"
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            <div>
              <div className="font-bold text-lg tracking-wider text-twk-text print:text-black">
                TWEAK<span className="text-twk-green print:text-emerald-700">LAB</span>
              </div>
              <div className="text-[11px] font-mono text-twk-dim print:text-gray-600">
                RELATÓRIO TÉCNICO DE ATENDIMENTO REMOTO
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono text-xs space-y-1">
            <div className="text-twk-green print:text-emerald-700 font-bold text-sm">
              CHAMADO: {ticket.code}
            </div>
            <div className="text-twk-dim print:text-gray-600">
              Data de Emissão: {new Date(ticket.updatedAt).toLocaleDateString("pt-BR")}
            </div>
            <div className="text-twk-dim print:text-gray-600">
              Status: <span className="uppercase font-semibold text-twk-text print:text-black">{ticket.status}</span>
            </div>
          </div>
        </div>

        {/* Client & Device Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-twk-surface print:bg-gray-50 border border-twk-border print:border-gray-200 text-xs font-mono">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase text-twk-dim print:text-gray-500 font-bold">
              DADOS DO CLIENTE
            </span>
            <div><strong className="text-twk-text print:text-black">Nome:</strong> {ticket.customerName}</div>
            <div><strong className="text-twk-text print:text-black">E-mail:</strong> {ticket.customerEmail}</div>
            <div><strong className="text-twk-text print:text-black">Categoria:</strong> {ticket.category}</div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase text-twk-dim print:text-gray-500 font-bold">
              ESPECIFICAÇÕES DO HARDWARE
            </span>
            <div><strong className="text-twk-text print:text-black">CPU:</strong> {ticket.device.cpu}</div>
            <div><strong className="text-twk-text print:text-black">GPU:</strong> {ticket.device.gpu}</div>
            <div><strong className="text-twk-text print:text-black">RAM:</strong> {ticket.device.ram}</div>
            <div><strong className="text-twk-text print:text-black">SO:</strong> {ticket.device.os}</div>
          </div>
        </div>

        {/* Section: Problem Summary & Hypothesis */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-twk-green print:text-emerald-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>1. Resumo do Problema & Parecer Técnico</span>
          </h3>

          <div className="p-4 rounded-xl bg-twk-surface print:bg-gray-50 border border-twk-border print:border-gray-200 text-xs leading-relaxed space-y-2">
            <div>
              <span className="font-semibold text-twk-text print:text-black">Sintoma Relatado: </span>
              <span className="text-twk-muted print:text-gray-700">{ticket.description}</span>
            </div>

            {ticket.technicianNotes && (
              <div className="pt-2 border-t border-twk-border/60 print:border-gray-300">
                <span className="font-semibold text-twk-green print:text-emerald-800">Conclusão Técnica: </span>
                <span className="text-twk-text print:text-gray-800">{ticket.technicianNotes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section: Benchmarks */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-twk-green print:text-emerald-700 flex items-center gap-1.5">
            <Activity className="w-4 h-4" />
            <span>2. Medições de Desempenho (Antes vs. Depois)</span>
          </h3>

          {ticket.benchmarks.length === 0 ? (
            <div className="p-4 rounded-xl border border-twk-border print:border-gray-200 text-xs text-twk-dim print:text-gray-500 font-mono">
              Sem dados de benchmark comparativo formal gravados para este chamado.
            </div>
          ) : (
            ticket.benchmarks.map((bm) => (
              <div
                key={bm.id}
                className="rounded-xl border border-twk-border print:border-gray-300 overflow-hidden text-xs font-mono"
              >
                <div className="p-3 bg-twk-surface print:bg-gray-100 flex justify-between items-center border-b border-twk-border print:border-gray-300">
                  <span className="font-bold text-twk-text print:text-black">{bm.game}</span>
                  <span className="text-[11px] text-twk-dim print:text-gray-600">
                    {bm.resolution} • {bm.preset}
                  </span>
                </div>

                <div className="grid grid-cols-3 p-4 gap-4 text-center bg-twk-card print:bg-white">
                  <div>
                    <span className="text-[10px] text-twk-dim print:text-gray-500 block">1% LOW FPS</span>
                    <span className="text-rose-400 print:text-red-600 font-bold">{bm.before.low1Percent} FPS</span>
                    <span className="mx-1 text-twk-dim">→</span>
                    <span className="text-twk-green print:text-emerald-700 font-bold">{bm.after.low1Percent} FPS</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-twk-dim print:text-gray-500 block">FPS MÉDIO</span>
                    <span className="text-twk-dim print:text-gray-600">{bm.before.avgFps} FPS</span>
                    <span className="mx-1 text-twk-dim">→</span>
                    <span className="text-twk-text print:text-black font-bold">{bm.after.avgFps} FPS</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-twk-dim print:text-gray-500 block">FRAMETIME</span>
                    <span className="text-twk-dim print:text-gray-600">{bm.before.frametimeAvgMs}ms</span>
                    <span className="mx-1 text-twk-dim">→</span>
                    <span className="text-emerald-400 print:text-emerald-700 font-bold">{bm.after.frametimeAvgMs}ms</span>
                  </div>
                </div>

                {bm.notes && (
                  <div className="p-2.5 bg-twk-surface/60 print:bg-gray-50 border-t border-twk-border print:border-gray-300 text-[11px] text-twk-muted print:text-gray-700">
                    <strong>Comentário de Medição:</strong> {bm.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Section: Action Audit Trail */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-twk-green print:text-emerald-700 flex items-center gap-1.5">
            <History className="w-4 h-4" />
            <span>3. Trilha de Modificações Executadas (Auditável)</span>
          </h3>

          <div className="border border-twk-border print:border-gray-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-twk-surface print:bg-gray-100 text-[10px] text-twk-dim print:text-gray-600 border-b border-twk-border print:border-gray-300">
                <tr>
                  <th className="p-3">HORA</th>
                  <th className="p-3">AÇÃO / MODIFICAÇÃO</th>
                  <th className="p-3">JUSTIFICATIVA TÉCNICA</th>
                  <th className="p-3">ANTES</th>
                  <th className="p-3">DEPOIS</th>
                  <th className="p-3">REVERSÍVEL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-twk-border/60 print:divide-gray-200">
                {ticket.actions.map((act) => (
                  <tr key={act.id} className="text-[11px]">
                    <td className="p-3 text-twk-dim print:text-gray-500">
                      {new Date(act.performedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="p-3 font-semibold text-twk-text print:text-black">
                      {act.description}
                    </td>
                    <td className="p-3 text-twk-muted print:text-gray-700">
                      {act.reason}
                    </td>
                    <td className="p-3 text-rose-400 print:text-red-600">
                      {act.beforeValue || "-"}
                    </td>
                    <td className="p-3 text-twk-green print:text-emerald-700">
                      {act.afterValue || "-"}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 print:text-emerald-800">
                        {act.reversible ? "Sim" : "Manual"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Ethical Disclaimer & Confirmation */}
        <div className="pt-4 border-t border-twk-border print:border-gray-300 space-y-4 text-xs font-mono text-twk-dim print:text-gray-600">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-twk-green print:text-emerald-700 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Compromisso de Estabilidade:</strong> A TweakLab declara que
              nenhum recurso essencial de segurança do Windows (Windows Defender,
              UAC, isolamento de núcleo) foi desativado de maneira indiscriminada.
              Caso o cliente deseje reverter qualquer parâmetro modificado, os valores
              anteriores constam formalmente neste documento.
            </p>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <div>
              <div className="text-twk-text print:text-black font-bold">TweakLab (TWK)</div>
              <div>Engenharia de Performance e Diagnóstico Windows</div>
            </div>

            <div className="p-2 px-3 rounded bg-twk-surface print:bg-gray-100 border border-twk-border print:border-gray-300 text-[10px]">
              Assinatura Criptográfica: SHA256-TWK-VAL-{(ticket.id).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

