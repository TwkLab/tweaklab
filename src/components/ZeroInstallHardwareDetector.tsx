"use client";

import { useState } from "react";
import {
  Terminal,
  FileText,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Upload,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  ClipboardPaste,
  ShieldAlert,
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
  const [activeTab, setActiveTab] = useState<"powershell" | "dxdiag" | "browser">("powershell");
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [psInput, setPsInput] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [detectedSummary, setDetectedSummary] = useState<DetectedSpecs | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [isReadingClipboard, setIsReadingClipboard] = useState(false);

  // Clean, robust PowerShell one-liner that saves directly to Windows clipboard
  const psCommand =
    '$c = (Get-CimInstance Win32_Processor).Name; ' +
    '$g = (Get-CimInstance Win32_VideoController | Select-Object -ExpandProperty Name -First 1); ' +
    '$r = (Get-CimInstance Win32_PhysicalMemory | ForEach-Object { "$([math]::Round($_.Capacity/1GB))GB $($_.Speed)MHz $($_.PartNumber.Trim())" }) -join " + "; ' +
    '$d = (Get-CimInstance Win32_DiskDrive | Select-Object -ExpandProperty Model) -join ", "; ' +
    'Set-Clipboard -Value "CPU: $c`nGPU: $g`nRAM: $r`nDISK: $d"';

  const handleCopyPsCommand = () => {
    navigator.clipboard.writeText(psCommand);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2500);
  };

  const handlePasteFromClipboard = async () => {
    setIsReadingClipboard(true);
    try {
      const text = await navigator.clipboard.readText();
      if (text && (text.includes("CPU:") || text.includes("GPU:") || text.includes("RAM:"))) {
        handleParsePsInput(text);
      } else {
        alert("O clipboard não contém as especificações no formato esperado. Copie e execute o comando do PowerShell primeiro.");
      }
    } catch {
      alert("Para colar automaticamente, permita o acesso ao clipboard no navegador ou cole o texto na caixa abaixo.");
    } finally {
      setIsReadingClipboard(false);
    }
  };

  const handleParsePsInput = (val: string) => {
    setPsInput(val);
    if (!val.trim()) return;
    const specs = parsePowerShellSpecs(val);
    if (specs.cpu || specs.gpu || specs.ram || specs.storage) {
      setDetectedSummary(specs);
      onSpecsDetected(specs);
      setStatusMessage("Nomes exatos das peças detectados e aplicados com sucesso!");
      setTimeout(() => setStatusMessage(null), 4500);
    }
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
        setStatusMessage("Relatório DxDiag importado! Processador, Placa de Vídeo, RAM e Windows preenchidos com os nomes reais.");
        setTimeout(() => setStatusMessage(null), 4500);
      } catch (err) {
        alert("Falha ao ler o arquivo DxDiag.");
      }
    };
    reader.readAsText(file);
  };

  const handleBrowserDetect = () => {
    const specs = detectBrowserSpecs();
    setDetectedSummary(specs);
    onSpecsDetected(specs);
    setStatusMessage("Placa de vídeo e parâmetros do navegador detectados.");
    setTimeout(() => setStatusMessage(null), 4000);
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
              Captura das Peças Reais (Nomes e Modelos Exatos)
            </span>
          </div>
          <p className="text-[11px] text-twk-dim">
            Detecte os modelos exatos (Ryzen 5 / RTX 3090 / XPG Spectrix) sem baixar nenhum aplicativo (.exe).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="text-[11px] font-mono text-twk-muted hover:text-twk-green flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{showGuide ? "Ocultar Explicação" : "Por que não pelo navegador?"}</span>
          {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Guide details */}
      {showGuide && (
        <div className="p-3.5 rounded-xl bg-twk-bg/90 border border-twk-border/70 text-xs text-twk-muted font-mono space-y-2 leading-relaxed">
          <p className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-twk-text">Regra de Segurança dos Navegadores:</strong> Por normas internacionais da W3C, o Google Chrome, Edge e Firefox <strong>proíbem</strong> que sites leiam o nome da CPU e o modelo das memórias RAM por código puro do site (para evitar rastreamento de anúncios). O navegador só tem permissão de ver o número de núcleos (ex: 12 ou 16).
            </span>
          </p>
          <p className="text-[11px] text-twk-dim pl-6">
            Por isso, para puxar o nome comercial exato (como <strong>Ryzen 5 4600G</strong>, <strong>RTX 3090</strong> e <strong>XPG Spectrix D41</strong>) sem precisar instalar nenhum programa, oferecemos o comando rápido nativo do Windows (Opção 1) ou o relatório DxDiag oficial (Opção 2).
          </p>
        </div>
      )}

      {/* Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("powershell")}
          className={`px-3 py-2.5 rounded-xl text-left border font-mono transition-all flex items-center gap-2.5 cursor-pointer ${
            activeTab === "powershell"
              ? "bg-twk-card border-twk-green text-twk-text shadow-twk-glow-sm"
              : "bg-twk-surface border-twk-border text-twk-muted hover:text-twk-text"
          }`}
        >
          <div className="w-7 h-7 rounded-lg bg-twk-bg flex items-center justify-center text-twk-green flex-shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>1. Comando Rápido</span>
              <span className="text-[9px] px-1 rounded bg-twk-green text-twk-bg font-bold">100% Exato</span>
            </div>
            <div className="text-[10px] text-twk-dim">Copia direto pro Clipboard</div>
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
          onClick={() => setActiveTab("browser")}
          className={`px-3 py-2.5 rounded-xl text-left border font-mono transition-all flex items-center gap-2.5 cursor-pointer ${
            activeTab === "browser"
              ? "bg-twk-card border-twk-green text-twk-text shadow-twk-glow-sm"
              : "bg-twk-surface border-twk-border text-twk-muted hover:text-twk-text"
          }`}
        >
          <div className="w-7 h-7 rounded-lg bg-twk-bg flex items-center justify-center text-amber-400 flex-shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold">3. Leitura WebGL</div>
            <div className="text-[10px] text-twk-dim">GPU + Cores (Apenas Web)</div>
          </div>
        </button>
      </div>

      {/* Tab 1: PowerShell 1-Liner with Auto-Clipboard */}
      {activeTab === "powershell" && (
        <div className="p-4 rounded-xl bg-twk-bg/60 border border-twk-border space-y-3">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-twk-text flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-twk-green" />
              <span>Puxar Nomes Exatos (Ryzen, RTX, XPG Spectrix) em 2 Passos:</span>
            </h4>
            <div className="text-[11px] text-twk-dim space-y-1 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-twk-surface border border-twk-border flex items-center justify-center text-[10px] font-bold text-twk-green">1</span>
                <span>Copie o comando abaixo, abra o terminal do Windows (<kbd className="px-1.5 py-0.5 bg-twk-surface border border-twk-border rounded text-[10px] text-twk-text font-mono">Win + X, i</kbd> ou abra o PowerShell) e dê <kbd className="px-1.5 py-0.5 bg-twk-surface border border-twk-border rounded text-[10px] text-twk-text font-mono">Enter</kbd>. Ele copia tudo sozinho para o seu clipboard.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-twk-surface border border-twk-border flex items-center justify-center text-[10px] font-bold text-twk-green">2</span>
                <span>Volte aqui e clique no botão verde <strong>"Colar Dados do Clipboard"</strong>. Pronto!</span>
              </div>
            </div>
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
                  <span className="text-twk-green font-bold">Comando Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Comando</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              disabled={isReadingClipboard}
              className="px-5 py-2.5 rounded-xl bg-twk-green hover:bg-twk-green-hover text-twk-bg font-bold text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 shadow-twk-glow-sm cursor-pointer transition-all"
            >
              <ClipboardPaste className="w-4 h-4" />
              <span>Colar Dados do Clipboard Agora</span>
            </button>

            <span className="text-[10px] text-twk-dim font-mono text-center sm:text-left">
              ou cole manualmente no campo abaixo:
            </span>
          </div>

          <textarea
            rows={2}
            value={psInput}
            onChange={(e) => handleParsePsInput(e.target.value)}
            placeholder="Se preferir, pressione Ctrl + V aqui para colar a saída do comando..."
            className="w-full px-3 py-2 rounded-xl bg-twk-surface border border-twk-border text-xs text-twk-text font-mono focus:outline-none focus:border-twk-green/60"
          />
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
                <span>Clique em <strong>"Salvar todas as informações..."</strong> e solte o arquivo <code className="text-cyan-400">DxDiag.txt</code> abaixo:</span>
              </div>
            </div>
          </div>

          <label className="border-2 border-dashed border-twk-border hover:border-cyan-400/60 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-twk-surface/30 hover:bg-twk-surface/60">
            <Upload className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-twk-text">
              Clique para selecionar ou arraste o DxDiag.txt aqui
            </span>
            <span className="text-[10px] text-twk-dim font-mono">
              Leitura 100% local no seu navegador • Nenhum arquivo é transmitido para servidores de terceiros
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

      {/* Tab 3: Browser Auto-Detection */}
      {activeTab === "browser" && (
        <div className="p-4 rounded-xl bg-twk-bg/60 border border-twk-border space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-twk-text flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Leitura Limitada via Navegador (Apenas WebGL / Threads)</span>
              </h4>
              <p className="text-[11px] text-twk-dim mt-0.5 leading-relaxed">
                O navegador só tem permissão de detectar a Placa de Vídeo e o número de núcleos lógicos (threads). Para preencher o nome do processador e o modelo da memória, use a <strong>Opção 1 (PowerShell)</strong> ou <strong>Opção 2 (DxDiag)</strong> acima.
              </p>
            </div>

            <button
              type="button"
              onClick={handleBrowserDetect}
              className="px-4 py-2 rounded-xl bg-twk-surface hover:bg-twk-card border border-twk-border hover:border-twk-green text-twk-text hover:text-twk-green font-bold text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-1.5 cursor-pointer transition-all flex-shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Detectar GPU pelo Navegador</span>
            </button>
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
        <div className="p-3.5 rounded-xl bg-twk-card border border-twk-green/40 text-xs font-mono space-y-2 shadow-twk-glow-sm">
          <div className="flex items-center justify-between text-[11px] text-twk-green font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Especificações Reconhecidas (Campos Preenchidos Automaticamente):
            </span>
            <span className="text-[10px] text-twk-dim uppercase px-1.5 py-0.5 rounded bg-twk-surface border border-twk-border">
              Origem: {detectedSummary.detectionMethod}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-twk-muted pt-1 border-t border-twk-border/50">
            {detectedSummary.cpu && (
              <div>
                <strong className="text-twk-text font-bold">Processador (CPU): </strong>
                <span className="text-twk-green font-semibold">{detectedSummary.cpu}</span>
              </div>
            )}
            {detectedSummary.gpu && (
              <div>
                <strong className="text-twk-text font-bold">Placa de Vídeo (GPU): </strong>
                <span className="text-twk-green font-semibold">{detectedSummary.gpu}</span>
              </div>
            )}
            {detectedSummary.ram && (
              <div>
                <strong className="text-twk-text font-bold">Memória RAM: </strong>
                <span className="text-twk-green font-semibold">{detectedSummary.ram}</span>
              </div>
            )}
            {detectedSummary.os && (
              <div>
                <strong className="text-twk-text font-bold">Sistema: </strong>
                <span>{detectedSummary.os}</span>
              </div>
            )}
            {detectedSummary.motherboard && (
              <div>
                <strong className="text-twk-text font-bold">Placa-mãe: </strong>
                <span>{detectedSummary.motherboard}</span>
              </div>
            )}
            {detectedSummary.storage && (
              <div>
                <strong className="text-twk-text font-bold">Armazenamento: </strong>
                <span>{detectedSummary.storage}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
