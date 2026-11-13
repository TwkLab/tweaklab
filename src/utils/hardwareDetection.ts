/**
 * Zero-install hardware detection utilities for TweakLab.
 * Enables clients to detect or upload PC specifications on the website without installing any app.
 */

export interface DetectedSpecs {
  cpu?: string;
  gpu?: string;
  ram?: string;
  os?: string;
  storage?: string;
  motherboard?: string;
  display?: string;
  vram?: string;
  driverVersion?: string;
  detectionMethod: "browser" | "dxdiag" | "powershell" | "manual";
}

/**
 * Resolves technical memory part numbers into their commercial marketing names
 * e.g.: "AX4U32008G16A-BT41" -> "ADATA XPG Spectrix D41 RGB"
 * e.g.: "KF432C16BB/8" -> "Kingston FURY Beast"
 */
export function resolveRamCommercialName(partNumber: string, speed?: string, capacity?: string): string {
  const p = partNumber.toUpperCase().trim();

  let brandModel = "";

  // ADATA XPG
  if (p.includes("BT41") || p.includes("DR41") || p.includes("D41")) {
    brandModel = "ADATA XPG Spectrix D41 RGB";
  } else if (p.includes("D60G") || p.includes("D60")) {
    brandModel = "ADATA XPG Spectrix D60G RGB";
  } else if (p.includes("D50")) {
    brandModel = "ADATA XPG Spectrix D50";
  } else if (p.startsWith("AX4U") || p.startsWith("AX4")) {
    brandModel = "ADATA XPG Spectrix / Gammix DDR4";
  } else if (p.startsWith("AX5U") || p.startsWith("AX5")) {
    brandModel = "ADATA XPG Lancer / Caster DDR5";
  }
  // Kingston / HyperX
  else if (p.startsWith("KF4") || p.startsWith("KF5") || p.includes("FURY")) {
    brandModel = "Kingston FURY Beast";
  } else if (p.startsWith("HX4") || p.includes("HYPERX")) {
    brandModel = "Kingston HyperX Fury";
  }
  // Corsair
  else if (p.startsWith("CMW")) {
    brandModel = "Corsair Vengeance RGB PRO";
  } else if (p.startsWith("CMH")) {
    brandModel = "Corsair Vengeance RGB RT/RS";
  } else if (p.startsWith("CMK")) {
    brandModel = "Corsair Vengeance LPX";
  }
  // G.Skill
  else if (p.includes("TZ5") || p.includes("TRIDENT")) {
    brandModel = "G.Skill Trident Z";
  } else if (p.startsWith("F4-") || p.startsWith("F5-")) {
    brandModel = "G.Skill Ripjaws / Trident";
  }
  // Crucial / Ballistix
  else if (p.startsWith("BL") && (p.includes("8G") || p.includes("16G") || p.includes("32G"))) {
    brandModel = "Crucial Ballistix";
  } else if (p.startsWith("CT")) {
    brandModel = "Crucial Basics";
  }
  // TeamGroup
  else if (p.startsWith("TLZ") || p.startsWith("TF3") || p.startsWith("TF4")) {
    brandModel = "TeamGroup T-Force";
  }
  // Asgard
  else if (p.includes("VMA") || p.includes("VALKYRIE") || p.includes("FREYR") || p.includes("LOKI")) {
    brandModel = "Asgard Gaming Memory";
  }

  const parts = [];
  if (capacity) parts.push(capacity);
  if (speed) parts.push(speed);
  if (brandModel) {
    parts.push(brandModel);
  }
  if (p && !brandModel) {
    parts.push(p);
  } else if (brandModel && p) {
    parts.push(`(${p})`);
  }

  return parts.join(" ");
}

/**
 * Cleans CPU name string by removing redundant text like "(R)", "(TM)", "with Radeon Graphics", "8-Core Processor"
 */
export function cleanCpuName(raw: string): string {
  let name = raw
    .replace(/\(R\)/gi, "")
    .replace(/\(TM\)/gi, "")
    .replace(/with Radeon Graphics/gi, "")
    .replace(/\d+-Core Processor/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // If there's a comma (e.g. from DxDiag: "AMD Ryzen 7 5700X, ~3.4GHz"), strip clock
  const commaIdx = name.indexOf(",");
  if (commaIdx !== -1) {
    name = name.substring(0, commaIdx).trim();
  }

  return name;
}

/**
 * Cleans GPU name string by removing ANGLE wrappers, driver strings, etc.
 */
export function cleanGpuName(raw: string): string {
  let gpu = raw.trim();

  // Handle ANGLE format: ANGLE (NVIDIA, NVIDIA GeForce RTX 3090 Direct3D11 vs_5_0 ps_5_0, ...)
  const angleMatch = gpu.match(/ANGLE\s*\([^,]+,\s*([^,]+?)(?:\s+Direct3D|\s*\))/i);
  if (angleMatch && angleMatch[1]) {
    gpu = angleMatch[1].trim();
  }

  gpu = gpu
    .replace(/\s+Direct3D.*$/i, "")
    .replace(/\s+vs_\d+_\d+.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return gpu;
}

/**
 * Detects hardware available natively via browser Web APIs (WebGL, Navigator, Screen).
 * Note: Browsers intentionally sandbox CPU and RAM model names for privacy/security.
 */
export function detectBrowserSpecs(): DetectedSpecs {
  const result: DetectedSpecs = {
    detectionMethod: "browser",
  };

  if (typeof window === "undefined") return result;

  // 1. GPU Detection via WebGL unmasked renderer
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl", { powerPreference: "high-performance" }) ||
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const rawRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (typeof rawRenderer === "string" && rawRenderer.trim()) {
          result.gpu = cleanGpuName(rawRenderer);
        }
      }
    }
  } catch {}

  // 2. CPU Threads (Logical Cores)
  if (typeof navigator !== "undefined" && navigator.hardwareConcurrency) {
    result.cpu = `${navigator.hardwareConcurrency} Núcleos Lógicos (Detectado pelo Navegador - use DxDiag ou PowerShell para nome exato)`;
  }

  // 3. RAM estimate
  const navAny = typeof navigator !== "undefined" ? (navigator as any) : null;
  if (navAny && navAny.deviceMemory) {
    result.ram = `${navAny.deviceMemory} GB+ RAM (Navegador)`;
  }

  // 4. Operating System from User Agent
  if (typeof navigator !== "undefined") {
    const ua = navigator.userAgent;
    if (ua.includes("Windows NT 10.0")) {
      result.os = "Windows 11 / Windows 10 (64-bit)";
    } else if (ua.includes("Windows NT 6.3")) {
      result.os = "Windows 8.1 (64-bit)";
    } else if (ua.includes("Windows NT 6.1")) {
      result.os = "Windows 7 (64-bit)";
    } else if (ua.includes("Macintosh")) {
      result.os = "macOS";
    } else if (ua.includes("Linux")) {
      result.os = "Linux";
    } else {
      result.os = "Windows (64-bit)";
    }
  }

  // 5. Display Resolution & Refresh Info
  if (window.screen) {
    const scale = Math.round((window.devicePixelRatio || 1) * 100);
    result.display = `${window.screen.width}x${window.screen.height} (${scale}% Escala)`;
  }

  return result;
}

/**
 * Parses a Windows DxDiag report (.txt).
 * DxDiag is natively built into all Windows installations (Win + R -> dxdiag -> Salvar).
 * Zero installation needed, 100% accurate system specs.
 */
export function parseDxDiag(content: string): DetectedSpecs {
  const result: DetectedSpecs = {
    detectionMethod: "dxdiag",
  };

  // Processor
  const cpuMatch = content.match(/Processor:\s*([^\r\n]+)/i);
  if (cpuMatch) {
    result.cpu = cleanCpuName(cpuMatch[1].trim());
  }

  // Card name (GPU)
  const gpuMatch = content.match(/Card name:\s*([^\r\n]+)/i);
  if (gpuMatch) {
    result.gpu = cleanGpuName(gpuMatch[1].trim());
  }

  // Dedicated Video Memory (VRAM)
  const vramMatch = content.match(/Dedicated Memory:\s*([^\r\n]+)/i);
  if (vramMatch) {
    result.vram = vramMatch[1].trim();
  }

  // System Memory (RAM)
  const ramMatch = content.match(/Memory:\s*([^\r\n]+)/i);
  if (ramMatch) {
    const rawRam = ramMatch[1].trim();
    const mbMatch = rawRam.match(/(\d+)\s*MB\s*RAM/i);
    if (mbMatch) {
      const gb = Math.round(parseInt(mbMatch[1], 10) / 1024);
      result.ram = `${gb} GB RAM`;
    } else {
      result.ram = rawRam;
    }
  }

  // Operating System
  const osMatch = content.match(/Operating System:\s*([^\r\n]+)/i);
  if (osMatch) {
    result.os = osMatch[1].trim();
  }

  // Motherboard / System Model
  const mfgMatch = content.match(/System Manufacturer:\s*([^\r\n]+)/i);
  const modelMatch = content.match(/System Model:\s*([^\r\n]+)/i);
  if (mfgMatch || modelMatch) {
    const mfg = mfgMatch ? mfgMatch[1].trim() : "";
    const model = modelMatch ? modelMatch[1].trim() : "";
    result.motherboard = `${mfg} ${model}`.trim();
  }

  // Display Mode (Resolution & Refresh Rate)
  const modeMatch = content.match(/Current Mode:\s*([^\r\n]+)/i);
  if (modeMatch) {
    result.display = modeMatch[1].trim();
  }

  // Driver Version
  const driverMatch = content.match(/Driver Version:\s*([^\r\n]+)/i);
  if (driverMatch) {
    result.driverVersion = driverMatch[1].trim();
  }

  return result;
}

/**
 * Parses output from PowerShell one-liner.
 * Users can run this single command in terminal without installing anything:
 * powershell -Command "$c=(Get-CimInstance Win32_Processor).Name; $g=(Get-CimInstance Win32_VideoController | Select -Expand Name -First 1); $r=(Get-CimInstance Win32_PhysicalMemory | ForEach { \"$([math]::Round($_.Capacity/1GB))GB $($_.Speed)MHz $($_.PartNumber.Trim())\" }) -join ' + '; $d=(Get-CimInstance Win32_DiskDrive | Select -Expand Model) -join ', '; $b=(Get-CimInstance Win32_BaseBoard | ForEach { $_.Manufacturer + ' ' + $_.Product }).Trim(); Set-Clipboard -Value \"CPU: $c`nGPU: $g`nRAM: $r`nDISK: $d`nBOARD: $b\""
 */
export function parsePowerShellSpecs(output: string): DetectedSpecs {
  const result: DetectedSpecs = {
    detectionMethod: "powershell",
  };

  const lines = output.split(/[\r\n]+/);
  const rawRamEntries: string[] = [];
  const diskDrives: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.toUpperCase().startsWith("CPU:")) {
      result.cpu = cleanCpuName(line.substring(4).trim());
    } else if (line.toUpperCase().startsWith("GPU:")) {
      const currentGpu = cleanGpuName(line.substring(4).trim());
      if (!result.gpu || currentGpu.toLowerCase().includes("nvidia") || currentGpu.toLowerCase().includes("radeon") || currentGpu.toLowerCase().includes("geforce") || currentGpu.toLowerCase().includes("rtx")) {
        result.gpu = currentGpu;
      }
    } else if (line.toUpperCase().startsWith("RAM:")) {
      const ramContent = line.substring(4).trim();
      // Can be split by +
      const modules = ramContent.split("+");
      for (const m of modules) {
        if (m.trim()) rawRamEntries.push(m.trim());
      }
    } else if (line.toUpperCase().startsWith("DISK:")) {
      diskDrives.push(line.substring(5).trim());
    } else if (line.toUpperCase().startsWith("BOARD:")) {
      result.motherboard = line.substring(6).trim();
    } else if (line.toUpperCase().startsWith("OS:")) {
      result.os = line.substring(3).trim();
    }
  }

  // Resolve RAM models
  if (rawRamEntries.length > 0) {
    const resolvedModules = rawRamEntries.map((mod) => {
      // mod is e.g. "8GB 3200MHz AX4U32008G16A-BT41"
      const match = mod.match(/^(\d+GB)\s+(\d+MHz)?\s*(.*)$/i);
      if (match) {
        const cap = match[1];
        const spd = match[2] || "";
        const part = match[3] || "";
        return resolveRamCommercialName(part, spd, cap);
      }
      return mod;
    });

    // If all modules are the same model, summarize nicely (e.g. "16GB (2x8GB) 3200MHz ADATA XPG Spectrix D41 RGB")
    if (resolvedModules.length >= 2 && resolvedModules.every((m) => m === resolvedModules[0])) {
      const first = resolvedModules[0];
      const match = first.match(/^(\d+)GB\s+(.*)$/i);
      if (match) {
        const singleCap = parseInt(match[1], 10);
        const totalCap = singleCap * resolvedModules.length;
        const rest = match[2];
        result.ram = `${totalCap}GB (${resolvedModules.length}x${singleCap}GB) ${rest}`;
      } else {
        result.ram = resolvedModules.join(" + ");
      }
    } else {
      result.ram = resolvedModules.join(" + ");
    }
  }

  if (diskDrives.length > 0) {
    result.storage = diskDrives.join(", ");
  }

  return result;
}
