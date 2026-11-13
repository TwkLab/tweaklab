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
 * Detects hardware available natively via browser Web APIs (WebGL, Navigator, Screen).
 * Completely zero-click, runs inside any modern browser (Chrome, Edge, Firefox, Brave, Opera).
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
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        let renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (typeof renderer === "string" && renderer.trim()) {
          // Clean common ANGLE wrappers:
          // e.g.: "ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Direct3D11 vs_5_0 ps_5_0, D3D11-31.0.15.5123)"
          // e.g.: "ANGLE (AMD, AMD Radeon RX 7800 XT Direct3D11 vs_5_0 ps_5_0, D3D11-...)"
          const angleMatch = renderer.match(/ANGLE\s*\([^,]+,\s*([^,]+?)(?:\s+Direct3D|\s*\))/i);
          if (angleMatch && angleMatch[1]) {
            renderer = angleMatch[1].trim();
          }
          result.gpu = renderer;
        }
      }
    }
  } catch {}

  // 2. CPU Threads (logical cores)
  if (typeof navigator !== "undefined" && navigator.hardwareConcurrency) {
    result.cpu = `${navigator.hardwareConcurrency} Cores / Threads Lógicas`;
  }

  // 3. RAM estimate
  const navAny = typeof navigator !== "undefined" ? (navigator as any) : null;
  if (navAny && navAny.deviceMemory) {
    result.ram = `${navAny.deviceMemory} GB+ RAM (Aprox. Navegador)`;
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
    result.cpu = cpuMatch[1].trim();
  }

  // Card name (GPU)
  const gpuMatch = content.match(/Card name:\s*([^\r\n]+)/i);
  if (gpuMatch) {
    result.gpu = gpuMatch[1].trim();
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
      result.ram = `${gb} GB RAM (${rawRam})`;
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
 * powershell -Command "Get-CimInstance Win32_Processor | % { 'CPU: ' + $_.Name }; Get-CimInstance Win32_VideoController | % { 'GPU: ' + $_.Name }; Get-CimInstance Win32_PhysicalMemory | % { 'RAM: ' + [math]::round($_.Capacity/1GB) + 'GB ' + $_.Speed + 'MHz ' + $_.PartNumber }; Get-CimInstance Win32_DiskDrive | % { 'DISK: ' + $_.Model + ' (' + [math]::round($_.Size/1GB) + 'GB)' }; Get-CimInstance Win32_BaseBoard | % { 'BOARD: ' + $_.Manufacturer + ' ' + $_.Product }"
 */
export function parsePowerShellSpecs(output: string): DetectedSpecs {
  const result: DetectedSpecs = {
    detectionMethod: "powershell",
  };

  const lines = output.split(/[\r\n]+/);
  const ramModules: string[] = [];
  const diskDrives: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.toUpperCase().startsWith("CPU:")) {
      result.cpu = line.substring(4).trim();
    } else if (line.toUpperCase().startsWith("GPU:")) {
      // If multiple GPUs, prefer dedicated (NVIDIA/AMD)
      const currentGpu = line.substring(4).trim();
      if (!result.gpu || currentGpu.toLowerCase().includes("nvidia") || currentGpu.toLowerCase().includes("radeon")) {
        result.gpu = currentGpu;
      }
    } else if (line.toUpperCase().startsWith("RAM:")) {
      ramModules.push(line.substring(4).trim());
    } else if (line.toUpperCase().startsWith("DISK:")) {
      diskDrives.push(line.substring(5).trim());
    } else if (line.toUpperCase().startsWith("BOARD:")) {
      result.motherboard = line.substring(6).trim();
    } else if (line.toUpperCase().startsWith("OS:")) {
      result.os = line.substring(3).trim();
    }
  }

  if (ramModules.length > 0) {
    result.ram = ramModules.join(" + ");
  }

  if (diskDrives.length > 0) {
    result.storage = diskDrives.join(", ");
  }

  return result;
}
