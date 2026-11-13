"use client";

import { useState } from "react";
import {
  Zap,
  FileText,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  Upload,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  detectBrowserSpecs,
  parseDxDiag,
  parsePowerShellSpecs,
  DetectedSpecs,
} from "@/utils/hardwareDetection";

interface ZeroInstallHardwareDetectorProps {
  onSpecsDetected: (specs: DetectedSpecs) => void;
}

export default function ZeroInstallHardwareDetector({
  onSpecsDetected,
}: ZeroInstallHardwareDetectorProps) {
  const [activeTab, setActiveTab] = useState<"browser" | "dxdiag" | "powershell">("browser");
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [psInput, setPsInput] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [detectedSummary, setDetectedSummary] = useState<DetectedSpecs | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const psCommand = `powershell -Command "Get-CimInstance Win32_Processor | % { 'CPU: ' + $_.Name }; Get-CimInstance Win32_VideoController | % { 'GPU: ' + $_.Name }; Get-CimInstance Win32_PhysicalMemory | % { 'RAM: ' + [math]::round($_.Capacity/1GB) + 'GB ' + $_.Speed + 'MHz ' + $_.PartNumber }; Get-CimInstance Win32_DiskDrive | % { 'DISK: ' + $_.Model + ' (' + [math]::round($_.Size/1GB) + 'GB)' }; Get-CimInstance Win32_BaseBoard | % { 'BOARD: ' + $_.Manufacturer + ' ' + $_.Product }"`;

  const handleBrowserDetect = () => {
    const specs = detectBrowserSpecs();
    setDetectedSummary(specs);
    onSpecsDetected(specs);
    setStatusMessage("Placa de vídeo e parâmetros do navegador detectados com sucesso!");
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleDxDiagUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const specs = parseDxDiag(text);
        if (!specs.cpu && !specs.gpu && !specs.ram) {
          alert("Não foi possível identificar o hardware no arquivo informado. Certifique-se de selecionar o DxDiag.txt salvo pelo Windows.");
          return;
        }
        setDetectedSummary(specs);
        onSpecsDetected(specs);
        setStatusMessage("Relatório DxDiag importado! Processador, Placa de Vídeo, RAM e Windows preenchidos.");
        setTimeout(() => setStatusMessage(null), 4500);
      } catch (err) {
        alert("Falha ao ler o arquivo DxDiag.");
      }
    };
    reader.readAsText(file);
  };

  const handleCopyPsCommand = () => {
    navigator.clipboard.writeText(psCommand);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2500);
  };

  const handleParsePsInput = (val: string) => {
    setPsInput(val);
    if (!val.trim()) return;
    const specs = parsePowerShellSpecs(val);
    if (specs.cpu || specs.gpu || specs.ram || specs.storage) {
      setDetectedSummary(specs);
      onSpecsDetected(specs);
      setStatusMessage("Especificações extraídas do PowerShell aplicadas com sucesso!");
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="twk-card rounded-2xl p-5 border border-twk-border/80 bg-twk-surface/40 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-twk-border/60">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-twk-green/10 text-twk-green border border-twk-green/30 text-[10px] font-mono font-bold uppercase tracking-wider">
              Zero Instalação • 100% Web
            </span>
            <span className="text-xs font-bold text-twk-text font-mono">
              Captura Rápida de Especificações
            </span>
          </div>
          <p className="text-[11px] text-twk-dim">
            Suba as peças do seu PC direto no site sem precisar baixar nenhum executável (.exe).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="text-[11px] font-mono text-twk-muted hover:text-twk-green flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{showGuide ? "Ocultar Ajuda" : "Como funciona?"}</span>
          {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Guide details */}
      {showGuide && (
        <div className="p-3.5 rounded-xl bg-twk-bg/80 border border-twk-border/70 text-xs text-twk-muted font-mono space-y-2 leading-relaxed">
          <p>
            <strong className="text-twk-green">Por que não exigimos aplicativo?</strong> Sabemos que muitos usuários não gostam de baixar executáveis desconhecidos por segurança ou alertas do Windows SmartScreen.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[11px] text-twk-dim">
            <li><strong>Opção 1 (Navegador):</strong> Lê diretamente via WebGL a sua Placa de Vídeo e núcleos do processador com 1 clique.</li>
            <li><strong>Opção 2 (DxDiag):</strong> O Windows já tem o DxDiag pré-instalado de fábrica. Basta salvar o relatório em .txt e selecionar aqui. Não instala nada.</li>
            <li><strong>Opção 3 (PowerShell):</strong> Um comando de 1 linha que você cola no seu próprio terminal do Windows para pegar detalhes como número de peça da memória RAM.</li>
          </ul>
        </div>
      )}

      {/* Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("browser")}
          className={`px-3 py-2.5 rounded-xl text-left border font-mono transition-all flex items-center gap-2.5 cursor-pointer ${
            activeTab === "browser"
              ? "bg-twk-card border-twk-green text-twk-text shadow-twk-glow-sm"
              : "bg-twk-surface border-twk-border text-twk-muted hover:text-twk-text"
          }`}
        >
          <div className="w-7 h-7 rounded-lg bg-twk-bg flex items-center justify-center text-twk-green flex-shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold">1. Pelo Navegador</div>
            <div className="text-[10px] text-twk-dim">GPU + Cores (1 Clique)</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dxdiag")}
          className={`px-3 py-2.5 rounded-xl text-left border font-mono transition-all flex items-center gap-2.5 cursor-pointer ${
            activeTab === "dxdiag"
              ? "bg-twk-card border-twk-green text-twk-text shadow-twk-glow-sm"
              : "bg-twk-surface border-twk-border text-twk-muted hover:text-twk-text"
          }`}
        >
          <div className="w-7 h-7 rounded-lg bg-twk-bg flex items-center justify-center text-cyan-400 flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold">2. DxDiag do Windows</div>
            <div className="text-[10px] text-twk-dim">Relatório .txt Nativo</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("powershell")}
          className={`px-3 py-2.5 rounded-xl text-left border font-mono transition-all flex items-center gap-2.5 cursor-pointer ${
            activeTab === "powershell"
              ? "bg-twk-card border-twk-green text-twk-text shadow-twk-glow-sm"
              : "bg-twk-surface border-twk-border text-twk-muted hover:text-twk-text"
          }`}
        >
          <div className="w-7 h-7 rounded-lg bg-twk-bg flex items-center justify-center text-amber-400 flex-shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold">3. Linha PowerShell</div>
            <div className="text-[10px] text-twk-dim">1 Comando no Terminal</div>
          </div>
        </button>
      </div>

      {/* Tab 1: Browser Auto-Detection */}
      {activeTab === "browser" && (
        <div className="p-4 rounded-xl bg-twk-bg/60 border border-twk-border space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-twk-text flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-twk-green" />
                <span>Leitura Instantânea de Hardware pelo Navegador</span>
              </h4>
              <p className="text-[11px] text-twk-dim mt-0.5">
                Detecta sua GPU dedicada via WebGL, quantidade de núcleos lógicos e resolução de tela sem nenhum download.
              </p>
            </div>

            <button
              type="button"
              onClick={handleBrowserDetect}
              className="px-4 py-2 rounded-xl bg-twk-green hover:bg-twk-green-hover text-twk-bg font-bold text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-1.5 shadow-twk-glow-sm cursor-pointer transition-all flex-shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Detectar Meu PC Agora</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: DxDiag Report Upload */}
      {activeTab === "dxdiag" && (
        <div className="p-4 rounded-xl bg-twk-bg/60 border border-twk-border space-y-3">
          <div>
            <h4 className="text-xs font-bold text-twk-text flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Importar Relatório DxDiag (100% Nativo do Windows)</span>
            </h4>
            <div className="text-[11px] text-twk-dim mt-1 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-twk-surface border border-twk-border flex items-center justify-center text-[10px] font-bold text-twk-green">1</span>
                <span>Pressione <kbd className="px-1.5 py-0.5 bg-twk-surface border border-twk-border rounded text-[10px] text-twk-text font-mono">Win + R</kbd> no teclado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-twk-surface border border-twk-border flex items-center justify-center text-[10px] font-bold text-twk-green">2</span>
                <span>Digite <code className="text-twk-green font-bold">dxdiag</code> e aperte <kbd className="px-1.5 py-0.5 bg-twk-surface border border-twk-border rounded text-[10px] text-twk-text font-mono">Enter</kbd></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-twk-surface border border-twk-border flex items-center justify-center text-[10px] font-bold text-twk-green">3</span>
                <span>Clique em <strong>"Salvar todas as informações..."</strong> e selecione o arquivo gerado abaixo:</span>
              </div>
            </div>
          </div>

          <label className="border-2 border-dashed border-twk-border hover:border-cyan-400/60 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-twk-surface/30 hover:bg-twk-surface/60">
            <Upload className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-twk-text">
              Clique para selecionar ou arraste o DxDiag.txt aqui
            </span>
            <span className="text-[10px] text-twk-dim font-mono">
              Leitura local no navegador • Nenhum arquivo é enviado para servidores externos
            </span>
            <input
              type="file"
              accept=".txt"
              onChange={handleDxDiagUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Tab 3: PowerShell 1-Liner */}
      {activeTab === "powershell" && (
        <div className="p-4 rounded-xl bg-twk-bg/60 border border-twk-border space-y-3">
          <div>
            <h4 className="text-xs font-bold text-twk-text flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Comando Rápido no PowerShell (Sem Instalar Nada)</span>
            </h4>
            <p className="text-[11px] text-twk-dim mt-0.5">
              Ideal para quem quer detalhes precisos da placa-mãe, SSDs e part-number das memórias RAM.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-twk-surface border border-twk-border flex items-center justify-between gap-3">
            <code className="text-[11px] font-mono text-twk-green truncate flex-1 select-all">
              {psCommand}
            </code>
            <button
              type="button"
              onClick={handleCopyPsCommand}
              className="px-3 py-1.5 rounded-lg bg-twk-card hover:bg-twk-surface border border-twk-border text-[11px] font-mono text-twk-text hover:text-twk-green flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
            >
              {copiedCommand ? (
                <>
                  <Check className="w-3.5 h-3.5 text-twk-green" />
                  <span className="text-twk-green font-bold">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Comando</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-twk-muted font-mono">
              Cole a saída do PowerShell aqui para preencher o formulário:
            </label>
            <textarea
              rows={2}
              value={psInput}
              onChange={(e) => handleParsePsInput(e.target.value)}
              placeholder="Cole aqui o texto gerado pelo comando do PowerShell..."
              className="w-full px-3 py-2 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text font-mono focus:outline-none focus:border-amber-400/60"
            />
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {statusMessage && (
        <div className="p-3 rounded-xl bg-twk-green/15 border border-twk-green/40 flex items-center gap-2.5 text-xs font-mono text-twk-green animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-twk-green" />
          <span className="font-bold">{statusMessage}</span>
        </div>
      )}

      {/* Detected Hardware Preview */}
      {detectedSummary && (
        <div className="p-3 rounded-xl bg-twk-card border border-twk-green/30 text-xs font-mono space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-twk-green font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Dados Detectados (Preenchimento Automático Concluído):
            </span>
            <span className="text-[10px] text-twk-dim uppercase">
              {detectedSummary.detectionMethod}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-twk-muted pt-1">
            {detectedSummary.gpu && (
              <div>
                <strong className="text-twk-text">GPU: </strong> {detectedSummary.gpu}
              </div>
            )}
            {detectedSummary.cpu && (
              <div>
                <strong className="text-twk-text">CPU: </strong> {detectedSummary.cpu}
              </div>
            )}
            {detectedSummary.ram && (
              <div>
                <strong className="text-twk-text">RAM: </strong> {detectedSummary.ram}
              </div>
            )}
            {detectedSummary.os && (
              <div>
                <strong className="text-twk-text">OS: </strong> {detectedSummary.os}
              </div>
            )}
            {detectedSummary.motherboard && (
              <div>
                <strong className="text-twk-text">Placa-mãe: </strong> {detectedSummary.motherboard}
              </div>
            )}
            {detectedSummary.storage && (
              <div>
                <strong className="text-twk-text">Armazenamento: </strong> {detectedSummary.storage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
