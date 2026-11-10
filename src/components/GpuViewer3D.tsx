"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  RotateCcw,
  Zap,
  Gauge,
  Thermometer,
  Activity,
  Sliders,
  Wind,
} from "lucide-react";

export default function GpuViewer3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [fanSpeed, setFanSpeed] = useState<"normal" | "turbo" | "silent">("normal");
  const [isRotating, setIsRotating] = useState(true);

  const fanMeshesRef = useRef<THREE.Group[]>([]);
  const rootGroupRef = useRef<THREE.Group | null>(null);

  // Live telemetry based on profile
  const metrics = {
    normal: {
      mode: "Modo Jogo Equilibrado",
      temp: "58°C",
      clock: "2580 MHz",
      fanRpm: "1450 RPM",
      dpc: "310 µs",
      frametime: "6.9 ms",
    },
    turbo: {
      mode: "Desempenho Competitivo",
      temp: "52°C",
      clock: "2685 MHz",
      fanRpm: "2100 RPM",
      dpc: "190 µs",
      frametime: "4.8 ms",
    },
    silent: {
      mode: "Modo Silencioso / Ocioso",
      temp: "42°C",
      clock: "1200 MHz",
      fanRpm: "800 RPM",
      dpc: "280 µs",
      frametime: "8.2 ms",
    },
  }[fanSpeed];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Clean any prior canvas
    container.innerHTML = "";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.8, 7.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(5, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight2.position.set(-5, -4, -4);
    scene.add(dirLight2);

    const greenAccentLight = new THREE.PointLight(0x00ff88, 3.5, 15);
    greenAccentLight.position.set(0, 1.5, 2.5);
    scene.add(greenAccentLight);

    const cyanRimLight = new THREE.PointLight(0x00e5ff, 2.0, 15);
    cyanRimLight.position.set(-3, -1, 2);
    scene.add(cyanRimLight);

    // Root GPU Model Container
    const gpu = new THREE.Group();
    scene.add(gpu);
    rootGroupRef.current = gpu;

    // Materials
    const shroudMat = new THREE.MeshStandardMaterial({
      color: 0x141814,
      metalness: 0.85,
      roughness: 0.25,
    });

    const darkAccentMat = new THREE.MeshStandardMaterial({
      color: 0x090c09,
      metalness: 0.9,
      roughness: 0.35,
    });

    const heatsinkMat = new THREE.MeshStandardMaterial({
      color: 0x8a928a,
      metalness: 0.95,
      roughness: 0.2,
    });

    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xcc6633,
      metalness: 0.9,
      roughness: 0.15,
    });

    const pcieGoldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.1,
    });

    const bracketMat = new THREE.MeshStandardMaterial({
      color: 0xb0b8b0,
      metalness: 0.9,
      roughness: 0.2,
    });

    const neonGreenMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
    });

    const fanBladeMat = new THREE.MeshStandardMaterial({
      color: 0x101710,
      metalness: 0.7,
      roughness: 0.25,
      transparent: true,
      opacity: 0.92,
    });

    // ==========================================
    // 1. MAIN HEATSINK RADIATOR BLOCK (ALUMINUM FINS)
    // ==========================================
    const heatsinkGeo = new THREE.BoxGeometry(4.8, 1.8, 0.45);
    const heatsinkMesh = new THREE.Mesh(heatsinkGeo, heatsinkMat);
    heatsinkMesh.position.set(0.1, 0, -0.05);
    gpu.add(heatsinkMesh);

    // Fins ridges lines on the heatsink
    for (let x = -2.2; x <= 2.2; x += 0.25) {
      const finLineGeo = new THREE.BoxGeometry(0.04, 1.78, 0.46);
      const finLine = new THREE.Mesh(finLineGeo, darkAccentMat);
      finLine.position.set(x + 0.1, 0, -0.05);
      gpu.add(finLine);
    }

    // ==========================================
    // 2. COPPER HEATPIPES
    // ==========================================
    const pipeGeo = new THREE.CylinderGeometry(0.065, 0.065, 4.6, 16);
    const pipe1 = new THREE.Mesh(pipeGeo, copperMat);
    pipe1.rotation.z = Math.PI / 2;
    pipe1.position.set(0.1, 0.4, 0.1);
    gpu.add(pipe1);

    const pipe2 = new THREE.Mesh(pipeGeo, copperMat);
    pipe2.rotation.z = Math.PI / 2;
    pipe2.position.set(0.1, -0.4, 0.1);
    gpu.add(pipe2);

    // ==========================================
    // 3. FRONT SHROUD (ARMOR / CARCAÇA)
    // ==========================================
    const shroudGeo = new THREE.BoxGeometry(5.2, 2.2, 0.35);
    const shroudMesh = new THREE.Mesh(shroudGeo, shroudMat);
    shroudMesh.position.set(0.1, 0, 0.25);
    gpu.add(shroudMesh);

    // Diagonal geometric tech cuts on shroud
    const cutPlateGeo = new THREE.BoxGeometry(5.0, 0.12, 0.37);
    const cutPlateTop = new THREE.Mesh(cutPlateGeo, darkAccentMat);
    cutPlateTop.position.set(0.1, 0.95, 0.25);
    gpu.add(cutPlateTop);

    const cutPlateBottom = new THREE.Mesh(cutPlateGeo, darkAccentMat);
    cutPlateBottom.position.set(0.1, -0.95, 0.25);
    gpu.add(cutPlateBottom);

    // Center divider with neon accent
    const dividerGeo = new THREE.BoxGeometry(0.15, 1.8, 0.38);
    const dividerMesh = new THREE.Mesh(dividerGeo, neonGreenMat);
    dividerMesh.position.set(0.1, 0, 0.25);
    gpu.add(dividerMesh);

    // ==========================================
    // 4. DUAL AXIAL COOLING FANS (VENTOINHAS GÊMEAS)
    // ==========================================
    const fanCenters = [-1.15, 1.35];
    const fans: THREE.Group[] = [];

    fanCenters.forEach((centerX) => {
      // Fan circular housing ring
      const ringGeo = new THREE.RingGeometry(0.78, 0.88, 36);
      const ringMesh = new THREE.Mesh(ringGeo, neonGreenMat);
      ringMesh.position.set(centerX, 0, 0.43);
      gpu.add(ringMesh);

      // Rotating Fan Blades Group
      const fanGroup = new THREE.Group();
      fanGroup.position.set(centerX, 0, 0.45);

      // Center Hub
      const hubGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 24);
      const hubMesh = new THREE.Mesh(hubGeo, darkAccentMat);
      hubMesh.rotation.x = Math.PI / 2;
      fanGroup.add(hubMesh);

      // Center green TWK badge
      const badgeGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.09, 20);
      const badgeMesh = new THREE.Mesh(badgeGeo, neonGreenMat);
      badgeMesh.rotation.x = Math.PI / 2;
      fanGroup.add(badgeMesh);

      // 9 Curved aerodynamic blades
      const bladeGeo = new THREE.BoxGeometry(0.12, 0.58, 0.03);
      for (let i = 0; i < 9; i++) {
        const blade = new THREE.Mesh(bladeGeo, fanBladeMat);
        const angle = (i * Math.PI * 2) / 9;
        blade.position.x = Math.cos(angle) * 0.45;
        blade.position.y = Math.sin(angle) * 0.45;
        blade.rotation.z = angle + 0.35;
        blade.rotation.y = 0.25; // pitch
        fanGroup.add(blade);
      }

      gpu.add(fanGroup);
      fans.push(fanGroup);
    });

    fanMeshesRef.current = fans;

    // ==========================================
    // 5. METAL BACKPLATE (PLACA TRASEIRA)
    // ==========================================
    const backplateGeo = new THREE.BoxGeometry(5.2, 2.2, 0.06);
    const backplateMesh = new THREE.Mesh(backplateGeo, darkAccentMat);
    backplateMesh.position.set(0.1, 0, -0.32);
    gpu.add(backplateMesh);

    // Honeycomb / tech vent cuts on backplate
    for (let bx = 0.6; bx <= 2.2; bx += 0.45) {
      const ventGeo = new THREE.BoxGeometry(0.25, 0.7, 0.08);
      const ventMesh = new THREE.Mesh(ventGeo, heatsinkMat);
      ventMesh.position.set(bx, 0.2, -0.32);
      gpu.add(ventMesh);
    }

    // ==========================================
    // 6. GOLDEN PCIE x16 CONNECTOR (CONECTOR DA PLACA-MÃE)
    // ==========================================
    // PCB tongue
    const pciePcbGeo = new THREE.BoxGeometry(2.8, 0.35, 0.04);
    const pciePcb = new THREE.Mesh(pciePcbGeo, darkAccentMat);
    pciePcb.position.set(0.2, -1.25, 0);
    gpu.add(pciePcb);

    // Gold contact fingers
    const goldFingersGeo = new THREE.BoxGeometry(2.6, 0.2, 0.06);
    const goldFingers = new THREE.Mesh(goldFingersGeo, pcieGoldMat);
    goldFingers.position.set(0.2, -1.32, 0);
    gpu.add(goldFingers);

    // ==========================================
    // 7. REAR METAL I/O BRACKET (ESPELHO TRASEIRO)
    // ==========================================
    const bracketGeo = new THREE.BoxGeometry(0.12, 3.2, 0.8);
    const bracket = new THREE.Mesh(bracketGeo, bracketMat);
    bracket.position.set(-2.55, -0.2, 0);
    gpu.add(bracket);

    // Port holes (HDMI & DisplayPort)
    const portGeo = new THREE.BoxGeometry(0.14, 0.16, 0.3);
    for (let py = 0.5; py >= -0.7; py -= 0.4) {
      const port = new THREE.Mesh(portGeo, darkAccentMat);
      port.position.set(-2.55, py, 0);
      gpu.add(port);
    }

    // ==========================================
    // 8. TOP RGB STRIP & POWER CONNECTORS
    // ==========================================
    // Top RGB illuminated bar
    const topBarGeo = new THREE.BoxGeometry(3.6, 0.12, 0.4);
    const topBar = new THREE.Mesh(topBarGeo, neonGreenMat);
    topBar.position.set(0.1, 1.12, 0.05);
    gpu.add(topBar);

    // Dual 8-Pin Power connectors
    const powerGeo = new THREE.BoxGeometry(0.55, 0.2, 0.3);
    const power1 = new THREE.Mesh(powerGeo, darkAccentMat);
    power1.position.set(1.7, 1.12, 0.05);
    gpu.add(power1);

    const power2 = new THREE.Mesh(powerGeo, darkAccentMat);
    power2.position.set(2.35, 1.12, 0.05);
    gpu.add(power2);

    // Initial slight isometric 3D tilt
    gpu.rotation.x = 0.22;
    gpu.rotation.y = -0.42;

    // Mouse Drag Rotation
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !gpu) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;

      gpu.rotation.y += dx * 0.008;
      gpu.rotation.x += dy * 0.008;

      // Limit vertical tilt
      gpu.rotation.x = Math.max(-0.6, Math.min(0.6, gpu.rotation.x));
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // Resize Handler
    const onResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Fan speed mapping
      const spinSpeed =
        fanSpeed === "turbo" ? 0.12 : fanSpeed === "silent" ? 0.025 : 0.06;

      // Rotate fans
      fans.forEach((f) => {
        f.rotation.z -= spinSpeed;
      });

      // Subtle ambient float & slow idle rotation
      if (isRotating && !isDragging) {
        gpu.rotation.y += 0.0035;
      }
      gpu.position.y = Math.sin(elapsed * 1.5) * 0.06;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [fanSpeed, isRotating]);

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[520px] rounded-3xl border border-twk-border bg-gradient-to-b from-[#0A100A]/95 via-[#070B07]/95 to-[#040604]/95 backdrop-blur-2xl overflow-hidden hud-corner shadow-2xl">
      {/* 3D Canvas */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Top Header Overlay: Clear Identification */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-twk-surface/90 border border-twk-border/90 backdrop-blur-md shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-twk-green animate-pulse" />
          <span className="text-xs font-mono font-bold text-twk-text">
            PLACA DE VÍDEO (GPU) • CALIBRAÇÃO TÉCNICA
          </span>
          <span className="text-[10px] font-mono text-twk-green hidden sm:inline font-semibold">
            • {metrics.mode}
          </span>
        </div>

        <div className="text-[11px] font-mono text-twk-dim pointer-events-auto bg-twk-surface/80 px-2.5 py-1 rounded-lg border border-twk-border hidden sm:block">
          Gire a placa em 360° com o mouse
        </div>
      </div>

      {/* Real Hardware Telemetry Grid (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pointer-events-none text-xs font-mono">
        <div className="p-2.5 rounded-xl bg-twk-surface/90 border border-twk-border/80 backdrop-blur-md space-y-0.5">
          <div className="text-[10px] text-twk-dim flex items-center gap-1 font-semibold">
            <Zap className="w-3 h-3 text-twk-green" /> CLOCK BOOST
          </div>
          <div className="font-bold text-twk-text text-xs sm:text-sm">
            {metrics.clock}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-twk-surface/90 border border-twk-border/80 backdrop-blur-md space-y-0.5">
          <div className="text-[10px] text-twk-dim flex items-center gap-1 font-semibold">
            <Thermometer className="w-3 h-3 text-orange-400" /> TEMPERATURA
          </div>
          <div className="font-bold text-orange-400 text-xs sm:text-sm">
            {metrics.temp}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-twk-surface/90 border border-twk-border/80 backdrop-blur-md space-y-0.5">
          <div className="text-[10px] text-twk-dim flex items-center gap-1 font-semibold">
            <Wind className="w-3 h-3 text-twk-green" /> VENTOINHAS
          </div>
          <div className="font-bold text-twk-green text-xs sm:text-sm">
            {metrics.fanRpm}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-twk-surface/90 border border-twk-border/80 backdrop-blur-md space-y-0.5">
          <div className="text-[10px] text-twk-dim flex items-center gap-1 font-semibold">
            <Activity className="w-3 h-3 text-cyan-400" /> DPC LATENCY
          </div>
          <div className="font-bold text-cyan-400 text-xs sm:text-sm">
            {metrics.dpc}
          </div>
        </div>
      </div>

      {/* GPU Interactive Mode Controls (Bottom-Right) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 pointer-events-auto">
        <button
          onClick={() => setFanSpeed("silent")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
            fanSpeed === "silent"
              ? "bg-twk-surface border-cyan-400 text-cyan-400 font-bold shadow-sm"
              : "bg-twk-surface/90 text-twk-muted border-twk-border hover:text-twk-text"
          }`}
          title="Modo silencioso e de baixo consumo"
        >
          Silencioso
        </button>

        <button
          onClick={() => setFanSpeed("normal")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
            fanSpeed === "normal"
              ? "bg-twk-green text-twk-bg font-bold border-twk-green shadow-twk-glow-sm"
              : "bg-twk-surface/90 text-twk-muted border-twk-border hover:text-twk-text"
          }`}
          title="Modo padrão de jogo com curva de fans estável"
        >
          Equilibrado
        </button>

        <button
          onClick={() => setFanSpeed("turbo")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
            fanSpeed === "turbo"
              ? "bg-orange-500 text-twk-bg font-bold border-orange-500 shadow-sm"
              : "bg-twk-surface/90 text-twk-muted border-twk-border hover:text-twk-text"
          }`}
          title="Modo overclock e rotação máxima para testes de estresse"
        >
          Competitivo
        </button>

        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`p-2 rounded-lg text-xs font-mono border transition-all ${
            isRotating
              ? "bg-twk-surface/90 text-twk-green border-twk-green/40"
              : "bg-twk-surface/90 text-twk-dim border-twk-border hover:text-twk-text"
          }`}
          title="Pausar ou retomar rotação automática"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
