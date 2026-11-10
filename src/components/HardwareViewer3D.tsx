"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  RotateCcw,
  Layers,
  Thermometer,
  Zap,
  Activity,
  Maximize2,
} from "lucide-react";

type ViewMode = "default" | "wireframe" | "thermal";

export default function HardwareViewer3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("default");
  const [isRotating, setIsRotating] = useState(true);
  const [activeMetric, setActiveMetric] = useState({
    clock: "4.85 GHz",
    temp: "54°C",
    dpc: "340 µs",
    frametime: "6.8 ms",
  });

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const coreGroupRef = useRef<THREE.Group | null>(null);
  const fanGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<{
    pcb: THREE.MeshStandardMaterial;
    chip: THREE.MeshStandardMaterial;
    ihs: THREE.MeshStandardMaterial;
    vram: THREE.MeshStandardMaterial;
    heatpipe: THREE.MeshStandardMaterial;
    neon: THREE.MeshBasicMaterial;
    fan: THREE.MeshStandardMaterial;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3.8, 6.2);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const greenPointLight = new THREE.PointLight(0x00ff88, 2.5, 12);
    greenPointLight.position.set(2, 3, 2);
    scene.add(greenPointLight);

    const cyanPointLight = new THREE.PointLight(0x00e5ff, 1.8, 10);
    cyanPointLight.position.set(-2, 2, -2);
    scene.add(cyanPointLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(4, 8, 4);
    scene.add(dirLight);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    coreGroupRef.current = rootGroup;

    // Materials
    const pcbMaterial = new THREE.MeshStandardMaterial({
      color: 0x090d09,
      metalness: 0.8,
      roughness: 0.3,
    });

    const chipMaterial = new THREE.MeshStandardMaterial({
      color: 0x121a12,
      metalness: 0.7,
      roughness: 0.25,
    });

    const ihsMaterial = new THREE.MeshStandardMaterial({
      color: 0x222a22,
      metalness: 0.9,
      roughness: 0.15,
    });

    const vramMaterial = new THREE.MeshStandardMaterial({
      color: 0x050705,
      metalness: 0.5,
      roughness: 0.4,
    });

    const heatpipeMaterial = new THREE.MeshStandardMaterial({
      color: 0xb87333,
      metalness: 0.95,
      roughness: 0.2,
    });

    const neonMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
    });

    const fanMaterial = new THREE.MeshStandardMaterial({
      color: 0x152215,
      transparent: true,
      opacity: 0.85,
      metalness: 0.6,
      roughness: 0.2,
    });

    materialsRef.current = {
      pcb: pcbMaterial,
      chip: chipMaterial,
      ihs: ihsMaterial,
      vram: vramMaterial,
      heatpipe: heatpipeMaterial,
      neon: neonMaterial,
      fan: fanMaterial,
    };

    // 1. PCB Base
    const pcbGeo = new THREE.BoxGeometry(4.4, 0.15, 4.4);
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMaterial);
    pcbMesh.position.y = -0.2;
    rootGroup.add(pcbMesh);

    // PCB Border Circuit Line
    const edgesGeo = new THREE.EdgesGeometry(pcbGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.4,
    });
    const edgesMesh = new THREE.LineSegments(edgesGeo, edgesMat);
    edgesMesh.position.y = -0.2;
    rootGroup.add(edgesMesh);

    // 2. Chip Interposer
    const interposerGeo = new THREE.BoxGeometry(2.6, 0.1, 2.6);
    const interposerMesh = new THREE.Mesh(interposerGeo, chipMaterial);
    interposerMesh.position.y = -0.06;
    rootGroup.add(interposerMesh);

    // 3. Central IHS (Integrated Heat Spreader / Core Die)
    const ihsGeo = new THREE.BoxGeometry(1.8, 0.2, 1.8);
    const ihsMesh = new THREE.Mesh(ihsGeo, ihsMaterial);
    ihsMesh.position.y = 0.08;
    rootGroup.add(ihsMesh);

    // Core Ring Neon
    const coreRingGeo = new THREE.RingGeometry(0.95, 1.05, 32);
    const coreRingMesh = new THREE.Mesh(coreRingGeo, neonMaterial);
    coreRingMesh.rotation.x = -Math.PI / 2;
    coreRingMesh.position.y = 0.19;
    rootGroup.add(coreRingMesh);

    // TWK Center Logo Plate (Green etched wafer)
    const logoPlateGeo = new THREE.BoxGeometry(0.9, 0.04, 0.9);
    const logoPlateMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x00aa55,
      emissiveIntensity: 0.4,
    });
    const logoPlate = new THREE.Mesh(logoPlateGeo, logoPlateMat);
    logoPlate.position.y = 0.2;
    rootGroup.add(logoPlate);

    // 4. Surrounding VRAM Memory Chips (8 modules around core)
    const vramGeo = new THREE.BoxGeometry(0.5, 0.08, 0.35);
    const vramPositions = [
      { x: -1.7, z: -0.9 },
      { x: -1.7, z: 0 },
      { x: -1.7, z: 0.9 },
      { x: 1.7, z: -0.9 },
      { x: 1.7, z: 0 },
      { x: 1.7, z: 0.9 },
      { x: -0.6, z: 1.7, rot: Math.PI / 2 },
      { x: 0.6, z: 1.7, rot: Math.PI / 2 },
    ];

    vramPositions.forEach((pos) => {
      const vramMesh = new THREE.Mesh(vramGeo, vramMaterial);
      vramMesh.position.set(pos.x, -0.05, pos.z);
      if (pos.rot) vramMesh.rotation.y = pos.rot;
      rootGroup.add(vramMesh);
    });

    // 5. Copper Heatpipes
    const pipeGeo = new THREE.CylinderGeometry(0.08, 0.08, 4.0, 16);
    const pipe1 = new THREE.Mesh(pipeGeo, heatpipeMaterial);
    pipe1.rotation.z = Math.PI / 2;
    pipe1.position.set(0, 0.26, -1.2);
    rootGroup.add(pipe1);

    const pipe2 = new THREE.Mesh(pipeGeo, heatpipeMaterial);
    pipe2.rotation.z = Math.PI / 2;
    pipe2.position.set(0, 0.26, 1.2);
    rootGroup.add(pipe2);

    // 6. Floating Holographic Diagnostic Fan / Tachometer
    const fanGroup = new THREE.Group();
    fanGroup.position.set(0, 0.45, 0);
    const bladeGeo = new THREE.BoxGeometry(0.12, 0.02, 0.95);
    for (let i = 0; i < 9; i++) {
      const blade = new THREE.Mesh(bladeGeo, fanMaterial);
      blade.rotation.y = (i * Math.PI) / 4.5;
      blade.position.y = 0.02;
      fanGroup.add(blade);
    }
    rootGroup.add(fanGroup);
    fanGroupRef.current = fanGroup;

    // 7. Ambient Particle Field
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 6;
      particlePos[i + 1] = Math.random() * 3 - 0.5;
      particlePos[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePos, 3)
    );
    const particleMat = new THREE.PointsMaterial({
      color: 0x00ff88,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Interaction / Drag rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !rootGroup) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      rootGroup.rotation.y += deltaX * 0.008;
      rootGroup.rotation.x += deltaY * 0.008;

      // clamp X rotation
      rootGroup.rotation.x = Math.max(
        -0.6,
        Math.min(0.8, rootGroup.rotation.x)
      );

      previousMousePosition = { x: e.clientX, y: e.clientY };
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

    // Initial slight tilt
    rootGroup.rotation.x = 0.35;
    rootGroup.rotation.y = -0.45;

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow ambient rotation if enabled and not dragging
      if (isRotating && !isDragging && rootGroup) {
        rootGroup.rotation.y += 0.004;
      }

      // Fan rotation
      if (fanGroupRef.current) {
        fanGroupRef.current.rotation.y += 0.035;
      }

      // Gentle floating
      if (rootGroup) {
        rootGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
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

  // Handle View Mode Switching (Default, Wireframe, Thermal)
  useEffect(() => {
    if (!materialsRef.current) return;
    const { pcb, chip, ihs, vram, heatpipe, fan } = materialsRef.current;

    if (viewMode === "wireframe") {
      pcb.wireframe = true;
      chip.wireframe = true;
      ihs.wireframe = true;
      vram.wireframe = true;
      heatpipe.wireframe = true;
      fan.wireframe = true;

      ihs.color.setHex(0x00ff88);
      pcb.color.setHex(0x005522);
      setActiveMetric({
        clock: "5.10 GHz",
        temp: "Malha Ativa",
        dpc: "180 µs",
        frametime: "4.2 ms",
      });
    } else if (viewMode === "thermal") {
      pcb.wireframe = false;
      chip.wireframe = false;
      ihs.wireframe = false;
      vram.wireframe = false;
      heatpipe.wireframe = false;
      fan.wireframe = false;

      // Thermal Heatmap Gradient: Hot core (Orange/Red), cool edges (Green/Cyan)
      ihs.color.setHex(0xff4400);
      chip.color.setHex(0xffaa00);
      pcb.color.setHex(0x00ff88);
      vram.color.setHex(0x00cc66);
      heatpipe.color.setHex(0xff6600);

      setActiveMetric({
        clock: "4.85 GHz",
        temp: "54°C (Normal)",
        dpc: "290 µs",
        frametime: "6.5 ms",
      });
    } else {
      // Default
      pcb.wireframe = false;
      chip.wireframe = false;
      ihs.wireframe = false;
      vram.wireframe = false;
      heatpipe.wireframe = false;
      fan.wireframe = false;

      pcb.color.setHex(0x090d09);
      chip.color.setHex(0x121a12);
      ihs.color.setHex(0x222a22);
      vram.color.setHex(0x050705);
      heatpipe.color.setHex(0xb87333);

      setActiveMetric({
        clock: "4.85 GHz",
        temp: "54°C",
        dpc: "340 µs",
        frametime: "6.8 ms",
      });
    }
  }, [viewMode]);

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[520px] rounded-2xl border border-twk-border bg-gradient-to-b from-[#0A0F0A]/95 to-[#050805]/95 backdrop-blur-xl overflow-hidden hud-corner shadow-2xl">
      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Top Header HUD overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-twk-surface/90 border border-twk-border/80 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-twk-green animate-pulse" />
          <span className="text-xs font-mono font-bold text-twk-text">
            TWK INTERACTIVE DIE
          </span>
          <span className="text-[10px] font-mono text-twk-dim hidden sm:inline">
            • 3D Hardware Telemetry
          </span>
        </div>

        <div className="text-[11px] font-mono text-twk-dim pointer-events-auto bg-twk-surface/80 px-2.5 py-1 rounded-lg border border-twk-border hidden sm:block">
          Arraste para girar em 3D
        </div>
      </div>

      {/* Real-time Telemetry Overlay Grid (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pointer-events-none text-xs font-mono">
        <div className="p-2 rounded-lg bg-twk-surface/85 border border-twk-border/80 backdrop-blur-md">
          <div className="text-[10px] text-twk-dim flex items-center gap-1">
            <Zap className="w-3 h-3 text-twk-green" /> CLOCK
          </div>
          <div className="font-bold text-twk-text">{activeMetric.clock}</div>
        </div>

        <div className="p-2 rounded-lg bg-twk-surface/85 border border-twk-border/80 backdrop-blur-md">
          <div className="text-[10px] text-twk-dim flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-orange-400" /> TEMP
          </div>
          <div className="font-bold text-orange-400">{activeMetric.temp}</div>
        </div>

        <div className="p-2 rounded-lg bg-twk-surface/85 border border-twk-border/80 backdrop-blur-md">
          <div className="text-[10px] text-twk-dim flex items-center gap-1">
            <Activity className="w-3 h-3 text-twk-green" /> DPC LATENCY
          </div>
          <div className="font-bold text-twk-green">{activeMetric.dpc}</div>
        </div>

        <div className="p-2 rounded-lg bg-twk-surface/85 border border-twk-border/80 backdrop-blur-md">
          <div className="text-[10px] text-twk-dim flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" /> FRAMETIME
          </div>
          <div className="font-bold text-cyan-400">{activeMetric.frametime}</div>
        </div>
      </div>

      {/* Floating Control Pills (Bottom-Right) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 pointer-events-auto">
        <button
          onClick={() => setViewMode("default")}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
            viewMode === "default"
              ? "bg-twk-green text-twk-bg font-bold border-twk-green shadow-twk-glow-sm"
              : "bg-twk-surface/90 text-twk-muted border-twk-border hover:text-twk-text"
          }`}
          title="Modo padrão com materiais e iluminação"
        >
          Sólido
        </button>

        <button
          onClick={() => setViewMode("wireframe")}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
            viewMode === "wireframe"
              ? "bg-twk-green text-twk-bg font-bold border-twk-green shadow-twk-glow-sm"
              : "bg-twk-surface/90 text-twk-muted border-twk-border hover:text-twk-text"
          }`}
          title="Modo malha poligonal para inspeção geométrica"
        >
          Wireframe
        </button>

        <button
          onClick={() => setViewMode("thermal")}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
            viewMode === "thermal"
              ? "bg-orange-500 text-twk-bg font-bold border-orange-500 shadow-sm"
              : "bg-twk-surface/90 text-twk-muted border-twk-border hover:text-twk-text"
          }`}
          title="Simulação de mapa térmico e dissipação"
        >
          Térmico
        </button>

        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`p-1.5 rounded-lg text-xs font-mono border transition-all ${
            isRotating
              ? "bg-twk-surface/90 text-twk-green border-twk-green/40"
              : "bg-twk-surface/90 text-twk-dim border-twk-border hover:text-twk-text"
          }`}
          title="Alternar rotação contínua"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

