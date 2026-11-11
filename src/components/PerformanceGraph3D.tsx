"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Activity,
  BarChart3,
  TrendingUp,
  Clock,
  RotateCcw,
  Sparkles,
  Layers,
} from "lucide-react";

interface BenchmarkScenario {
  id: string;
  game: string;
  scenario: string;
  before: {
    avgFps: number;
    low1Percent: number;
    frametimeMs: number;
  };
  after: {
    avgFps: number;
    low1Percent: number;
    frametimeMs: number;
  };
  highlight: string;
}

const scenarios: BenchmarkScenario[] = [
  {
    id: "warzone",
    game: "Warzone (1080p Competitivo)",
    scenario: "Urzikstan • Ryzen 7 5700X + RTX 3070",
    before: { avgFps: 148, low1Percent: 78, frametimeMs: 13.5 },
    after: { avgFps: 188, low1Percent: 142, frametimeMs: 5.3 },
    highlight: "+82% no 1% Low (78 → 142 FPS) • Média sobe de 148 para 188 FPS",
  },
  {
    id: "cs2",
    game: "Counter-Strike 2 (1080p Nativo)",
    scenario: "Mirage 10v10 • i5-12400F + RTX 4060",
    before: { avgFps: 240, low1Percent: 110, frametimeMs: 9.2 },
    after: { avgFps: 295, low1Percent: 210, frametimeMs: 3.4 },
    highlight: "+91% no 1% Low (110 → 210 FPS) • Média atinge 295 FPS",
  },
  {
    id: "finals",
    game: "The Finals (UE5 Destruction)",
    scenario: "Monaco 1080p • Ryzen 5 5600 + RX 6700 XT",
    before: { avgFps: 115, low1Percent: 52, frametimeMs: 17.5 },
    after: { avgFps: 152, low1Percent: 112, frametimeMs: 6.6 },
    highlight: "+115% no 1% Low (52 → 112 FPS) • Fim dos micro-congelamentos",
  },
];

export default function PerformanceGraph3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const currentScenario = scenarios[selectedIdx];

  // Target values ref for smooth animation interpolation
  const targetHeightsRef = useRef({
    beforeLow1: currentScenario.before.low1Percent,
    afterLow1: currentScenario.after.low1Percent,
    beforeAvg: currentScenario.before.avgFps,
    afterAvg: currentScenario.after.avgFps,
  });

  const currentHeightsRef = useRef({
    beforeLow1: currentScenario.before.low1Percent,
    afterLow1: currentScenario.after.low1Percent,
    beforeAvg: currentScenario.before.avgFps,
    afterAvg: currentScenario.after.avgFps,
  });

  useEffect(() => {
    targetHeightsRef.current = {
      beforeLow1: currentScenario.before.low1Percent,
      afterLow1: currentScenario.after.low1Percent,
      beforeAvg: currentScenario.before.avgFps,
      afterAvg: currentScenario.after.avgFps,
    };
  }, [selectedIdx, currentScenario]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    container.innerHTML = "";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3.8, 8.2);
    camera.lookAt(0, 0.4, 0);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const greenLight = new THREE.PointLight(0x00ff88, 3.0, 15);
    greenLight.position.set(2, 4, 3);
    scene.add(greenLight);

    const roseLight = new THREE.PointLight(0xff3366, 2.0, 12);
    roseLight.position.set(-3, 3, 2);
    scene.add(roseLight);

    const topDirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    topDirLight.position.set(4, 9, 5);
    scene.add(topDirLight);

    // Root Group
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    // 1. Holographic Floor Grid
    const gridHelper = new THREE.GridHelper(10, 20, 0x00ff88, 0x162416);
    gridHelper.position.y = -1.2;
    stageGroup.add(gridHelper);

    // Floor Base Disc
    const basePlateGeo = new THREE.CylinderGeometry(5.2, 5.2, 0.1, 48);
    const basePlateMat = new THREE.MeshStandardMaterial({
      color: 0x070c07,
      metalness: 0.8,
      roughness: 0.3,
    });
    const basePlate = new THREE.Mesh(basePlateGeo, basePlateMat);
    basePlate.position.y = -1.25;
    stageGroup.add(basePlate);

    // Outer Neon Ring
    const ringGeo = new THREE.RingGeometry(4.9, 5.05, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      side: THREE.DoubleSide,
    });
    const outerRing = new THREE.Mesh(ringGeo, ringMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = -1.19;
    stageGroup.add(outerRing);

    // ==========================================
    // 3D COMPARATIVE BARS
    // ==========================================
    const barWidth = 0.65;
    const barDepth = 0.65;

    // Materials
    // Red/Orange for "Antes" (Low & Stutter)
    const beforeMat = new THREE.MeshStandardMaterial({
      color: 0xee3355,
      metalness: 0.6,
      roughness: 0.2,
      emissive: 0x881122,
      emissiveIntensity: 0.45,
    });

    // Matrix Green for "Depois" (High & Smooth)
    const afterMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      metalness: 0.7,
      roughness: 0.15,
      emissive: 0x00aa55,
      emissiveIntensity: 0.55,
    });

    // Muted tech material for averages
    const avgBeforeMat = new THREE.MeshStandardMaterial({
      color: 0x556677,
      metalness: 0.6,
      roughness: 0.3,
    });

    const avgAfterMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      metalness: 0.6,
      roughness: 0.25,
      emissive: 0x15803d,
      emissiveIntensity: 0.3,
    });

    // Unit geometry (scaled dynamically along Y)
    const unitBox = new THREE.BoxGeometry(barWidth, 1, barDepth);

    // Bar 1: 1% Low Antes (X = -2.0)
    const barBeforeLow1 = new THREE.Mesh(unitBox, beforeMat);
    barBeforeLow1.position.set(-2.0, -1.2, 0.4);
    stageGroup.add(barBeforeLow1);

    // Bar 2: 1% Low Depois (X = -1.0)
    const barAfterLow1 = new THREE.Mesh(unitBox, afterMat);
    barAfterLow1.position.set(-1.0, -1.2, 0.4);
    stageGroup.add(barAfterLow1);

    // Bar 3: Média FPS Antes (X = 1.0)
    const barBeforeAvg = new THREE.Mesh(unitBox, avgBeforeMat);
    barBeforeAvg.position.set(1.0, -1.2, 0.4);
    stageGroup.add(barBeforeAvg);

    // Bar 4: Média FPS Depois (X = 2.0)
    const barAfterAvg = new THREE.Mesh(unitBox, avgAfterMat);
    barAfterAvg.position.set(2.0, -1.2, 0.4);
    stageGroup.add(barAfterAvg);

    // Glowing wireframe cages around 3D bars
    const edgesBox = new THREE.EdgesGeometry(unitBox);
    const cageBeforeLow1 = new THREE.LineSegments(
      edgesBox,
      new THREE.LineBasicMaterial({ color: 0xff6688 })
    );
    barBeforeLow1.add(cageBeforeLow1);

    const cageAfterLow1 = new THREE.LineSegments(
      edgesBox,
      new THREE.LineBasicMaterial({ color: 0x55ffaa })
    );
    barAfterLow1.add(cageAfterLow1);

    const cageBeforeAvg = new THREE.LineSegments(
      edgesBox,
      new THREE.LineBasicMaterial({ color: 0x8899aa })
    );
    barBeforeAvg.add(cageBeforeAvg);

    const cageAfterAvg = new THREE.LineSegments(
      edgesBox,
      new THREE.LineBasicMaterial({ color: 0x86efac })
    );
    barAfterAvg.add(cageAfterAvg);

    // ==========================================
    // 3D WAVE / FRAMETIME RIBBON (IN BACKGROUND)
    // ==========================================
    // Spiky Red line (before) vs Flat Green line (after)
    const wavePointsCount = 28;
    const erraticLineGeo = new THREE.BufferGeometry();
    const smoothLineGeo = new THREE.BufferGeometry();

    const erraticPts = [];
    const smoothPts = [];

    for (let i = 0; i < wavePointsCount; i++) {
      const x = (i / (wavePointsCount - 1)) * 5.6 - 2.8;
      // Erratic spikes simulating stuttering
      const spike = Math.sin(i * 1.8) * 0.5 + ((i % 3 === 0) ? 0.7 : -0.2);
      erraticPts.push(new THREE.Vector3(x, spike + 0.6, -1.3));

      // Ultra-smooth line
      const smooth = Math.sin(i * 0.4) * 0.08;
      smoothPts.push(new THREE.Vector3(x, smooth - 0.2, -0.8));
    }

    erraticLineGeo.setFromPoints(erraticPts);
    smoothLineGeo.setFromPoints(smoothPts);

    const erraticLine = new THREE.Line(
      erraticLineGeo,
      new THREE.LineBasicMaterial({
        color: 0xff3355,
        linewidth: 2,
        transparent: true,
        opacity: 0.6,
      })
    );
    stageGroup.add(erraticLine);

    const smoothLine = new THREE.Line(
      smoothLineGeo,
      new THREE.LineBasicMaterial({
        color: 0x00ff88,
        linewidth: 3,
        transparent: true,
        opacity: 0.9,
      })
    );
    stageGroup.add(smoothLine);

    // Floating telemetry dust particles
    const particleCount = 40;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 8;
      pPos[i + 1] = Math.random() * 4 - 0.5;
      pPos[i + 2] = (Math.random() - 0.5) * 6;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00ff88,
      size: 0.06,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(pGeo, pMat);
    stageGroup.add(particles);

    // Initial slight angle
    stageGroup.rotation.x = 0.22;
    stageGroup.rotation.y = -0.32;

    // Mouse Interaction
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !stageGroup) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;

      stageGroup.rotation.y += dx * 0.008;
      stageGroup.rotation.x += dy * 0.008;

      // Clamp vertical tilt
      stageGroup.rotation.x = Math.max(-0.2, Math.min(0.65, stageGroup.rotation.x));
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

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

      // Smoothly interpolate heights towards targets
      const current = currentHeightsRef.current;
      const target = targetHeightsRef.current;

      const lerpSpeed = 0.08;
      current.beforeLow1 += (target.beforeLow1 - current.beforeLow1) * lerpSpeed;
      current.afterLow1 += (target.afterLow1 - current.afterLow1) * lerpSpeed;
      current.beforeAvg += (target.beforeAvg - current.beforeAvg) * lerpSpeed;
      current.afterAvg += (target.afterAvg - current.afterAvg) * lerpSpeed;

      // Normalization scale for 3D bar height (e.g. 200 FPS = ~3.2 units)
      const scaleFactor = 0.016;

      // Update Bar 1: Before 1% Low
      const h1 = Math.max(0.2, current.beforeLow1 * scaleFactor);
      barBeforeLow1.scale.y = h1;
      barBeforeLow1.position.y = -1.2 + h1 / 2;

      // Update Bar 2: After 1% Low
      const h2 = Math.max(0.2, current.afterLow1 * scaleFactor);
      barAfterLow1.scale.y = h2;
      barAfterLow1.position.y = -1.2 + h2 / 2;

      // Update Bar 3: Before Avg FPS
      const h3 = Math.max(0.2, current.beforeAvg * scaleFactor);
      barBeforeAvg.scale.y = h3;
      barBeforeAvg.position.y = -1.2 + h3 / 2;

      // Update Bar 4: After Avg FPS
      const h4 = Math.max(0.2, current.afterAvg * scaleFactor);
      barAfterAvg.scale.y = h4;
      barAfterAvg.position.y = -1.2 + h4 / 2;

      // Animate wave lines subtly
      erraticLine.position.y = Math.sin(elapsed * 2.5) * 0.05;
      smoothLine.position.y = Math.sin(elapsed * 1.2) * 0.02;

      // Idle Rotation
      if (isRotating && !isDragging) {
        stageGroup.rotation.y += 0.003;
      }
      stageGroup.position.y = Math.sin(elapsed * 1.5) * 0.05;

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
  }, [isRotating]);

  const low1Gain = Math.round(
    ((currentScenario.after.low1Percent - currentScenario.before.low1Percent) /
      currentScenario.before.low1Percent) *
      100
  );

  return (
    <div className="relative w-full h-[430px] sm:h-[490px] lg:h-[530px] rounded-3xl border border-twk-border bg-gradient-to-b from-[#0A120A]/95 via-[#070D07]/95 to-[#040604]/95 backdrop-blur-2xl overflow-hidden hud-corner shadow-2xl">
      {/* 3D Canvas */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Top Header Overlay */}
      <div className="absolute top-4 left-4 right-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-twk-surface/90 border border-twk-border/90 backdrop-blur-md shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-twk-green animate-pulse" />
          <span className="text-xs font-mono font-bold text-twk-text">
            BENCHMARK 3D • ANTES VS. DEPOIS
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-twk-green/20 text-twk-green font-bold border border-twk-green/30">
            +{low1Gain}% 1% LOW
          </span>
        </div>

        <div className="text-[11px] font-mono text-twk-dim pointer-events-auto bg-twk-surface/80 px-2.5 py-1 rounded-lg border border-twk-border self-start sm:self-auto">
          Gire o gráfico 3D em 360°
        </div>
      </div>

      {/* Floating 3D Metric Labels Overlay (Overlaying the Left/Right bar pairs) */}
      <div className="absolute top-20 left-4 right-4 pointer-events-none hidden sm:flex justify-around text-xs font-mono">
        {/* Left Column: 1% Low Focus */}
        <div className="p-2.5 rounded-xl bg-twk-surface/90 border border-twk-green/40 backdrop-blur-md space-y-1 text-center shadow-twk-glow-sm">
          <div className="text-[10px] font-bold text-twk-green uppercase tracking-wider flex items-center justify-center gap-1">
            <Activity className="w-3 h-3" />
            1% Low (Sem Travamentos)
          </div>
          <div className="flex items-center justify-center gap-3 text-xs">
            <span className="text-rose-400 font-bold">
              Antes: {currentScenario.before.low1Percent} FPS
            </span>
            <span className="text-twk-dim">→</span>
            <span className="text-twk-green font-extrabold text-sm">
              Depois: {currentScenario.after.low1Percent} FPS
            </span>
          </div>
        </div>

        {/* Right Column: Average FPS Focus */}
        <div className="p-2.5 rounded-xl bg-twk-surface/90 border border-twk-border backdrop-blur-md space-y-1 text-center">
          <div className="text-[10px] font-bold text-twk-muted uppercase tracking-wider flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Taxa Média de FPS
          </div>
          <div className="flex items-center justify-center gap-3 text-xs">
            <span className="text-twk-dim">
              Antes: {currentScenario.before.avgFps} FPS
            </span>
            <span className="text-twk-dim">→</span>
            <span className="text-twk-text font-bold text-sm">
              Depois: {currentScenario.after.avgFps} FPS
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Scenario Highlight & Waveform Indicator */}
      <div className="absolute bottom-16 left-4 right-4 pointer-events-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
        <div className="p-2 rounded-xl bg-twk-surface/85 border border-twk-border/70 backdrop-blur-md flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-twk-green" />
          <span className="text-twk-dim text-[11px]">
            Linha Vermelha = Spikes de latência • Linha Verde = Estabilidade TWK
          </span>
        </div>

        <div className="p-2 rounded-xl bg-twk-surface/85 border border-twk-green/30 backdrop-blur-md text-[11px] text-twk-green font-semibold">
          {currentScenario.highlight}
        </div>
      </div>

      {/* Interactive Game Switcher Tabs (Bottom Bar) */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {scenarios.map((sc, i) => (
            <button
              key={sc.id}
              onClick={() => setSelectedIdx(i)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border whitespace-nowrap ${
                selectedIdx === i
                  ? "bg-twk-green text-twk-bg font-bold border-twk-green shadow-twk-glow-sm"
                  : "bg-twk-surface/90 text-twk-muted hover:text-twk-text border-twk-border"
              }`}
            >
              {sc.game.split(" (")[0]}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`p-2 rounded-xl text-xs font-mono border transition-all flex-shrink-0 ${
            isRotating
              ? "bg-twk-surface/90 text-twk-green border-twk-green/40 shadow-twk-glow-sm"
              : "bg-twk-surface/90 text-twk-dim border-twk-border hover:text-twk-text"
          }`}
          title="Pausar ou retomar rotação contínua"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
