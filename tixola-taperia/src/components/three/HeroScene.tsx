"use client";

import { useMemo, useRef, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { damp, damp3 } from "maath/easing";
import type { PerfProfile } from "@/hooks/usePerformanceTier";
import type { PointerVec } from "@/hooks/usePointerParallax";
import SceneLights from "./SceneLights";
import TixolaPan from "./TixolaPan";
import FloatingFood from "./FloatingFood";
import EmberParticles from "./EmberParticles";
import Effects from "./Effects";

/** "split": copy a la izquierda, sartén a la derecha (≥ lg). "stacked": sartén arriba, copy abajo. */
export type HeroLayout = "stacked" | "split";

export interface HeroSceneProps {
  profile: PerfProfile;
  pointer: RefObject<PointerVec>;
  layout: HeroLayout;
  /** false cuando el hero no está en pantalla o la pestaña está oculta → frameloop "demand" */
  active: boolean;
  /** Se llama en el primer frame renderizado (para fundir el fallback estático). */
  onReady: () => void;
}

interface LayoutSpec {
  anchor: [number, number, number];
  scale: number;
  camera: [number, number, number];
  look: [number, number, number];
  glowCenter: [number, number];
}

/*
 * "split" (portada editorial): la sartén ocupa el 55 % derecho del viewport y asoma ligeramente
 * por detrás del titular anclado abajo a la izquierda (el Hero pinta un degradado lateral para la
 * legibilidad). "stacked" (móvil): sartén en el 45 % superior, copy debajo.
 */
const LAYOUTS: Record<HeroLayout, LayoutSpec> = {
  split: { anchor: [1.45, -0.05, 0], scale: 1.06, camera: [0, 1.7, 8.4], look: [0.4, 0.2, 0], glowCenter: [0.62, 0.44] },
  stacked: { anchor: [0, 1.1, 0], scale: 0.78, camera: [0, 2.0, 9.4], look: [0, 0.9, 0], glowCenter: [0.5, 0.55] },
};

/* Objetos de trabajo a nivel de módulo (cero asignaciones en useFrame). */
const _camTarget = new THREE.Vector3();
const _lookTarget = new THREE.Vector3(0.4, 0.2, 0);

/* ──────────────────────────────────────────────────────────────
   Fondo: plano lejano con degradado radial rojo (shader) + dithering anti-banding
   ────────────────────────────────────────────────────────────── */

const BACKDROP_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const BACKDROP_FRAGMENT = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uGlow;
  uniform vec3 uGlowDeep;
  uniform vec2 uCenter;
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 d = (vUv - uCenter) * vec2(1.6, 1.0);
    float r = length(d);
    float pulse = 0.94 + 0.06 * sin(uTime * 0.9);
    vec3 col = mix(uGlow, uGlowDeep, smoothstep(0.0, 0.22 * pulse, r));
    col = mix(col, uBase, smoothstep(0.12, 0.62 * pulse, r));
    col = mix(col, uBase * 0.6, smoothstep(0.55, 1.0, vUv.y));
    col += (hash(vUv * 1024.0) - 0.5) * (1.5 / 255.0);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

type BackdropUniforms = {
  uBase: THREE.IUniform<THREE.Color>;
  uGlow: THREE.IUniform<THREE.Color>;
  uGlowDeep: THREE.IUniform<THREE.Color>;
  uCenter: THREE.IUniform<THREE.Vector2>;
  uTime: THREE.IUniform<number>;
};

function Backdrop({ pointer, layout }: { pointer: RefObject<PointerVec>; layout: HeroLayout }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo<BackdropUniforms>(
    () => ({
      uBase: { value: new THREE.Color("#0c0c0c") },
      uGlow: { value: new THREE.Color("#7d131a") },
      uGlowDeep: { value: new THREE.Color("#3a0e13") },
      uCenter: { value: new THREE.Vector2(0.6, 0.42) },
      uTime: { value: 0 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (mesh) {
      // El fondo se mueve en sentido contrario al puntero: profundidad.
      damp(mesh.position, "x", -pointer.current.x * 1.2, 0.8, dt);
      damp(mesh.position, "y", 0.5 - pointer.current.y * 0.8, 0.8, dt);
    }
    if (mat) {
      const spec = LAYOUTS[layout];
      mat.uniforms.uTime.value = state.clock.elapsedTime;
      damp(mat.uniforms.uCenter.value, "x", spec.glowCenter[0], 0.8, dt);
      damp(mat.uniforms.uCenter.value, "y", spec.glowCenter[1], 0.8, dt);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, -16]} scale={[80, 50, 1]} renderOrder={-10}>
      <planeGeometry />
      <shaderMaterial ref={matRef} uniforms={uniforms} vertexShader={BACKDROP_VERTEX} fragmentShader={BACKDROP_FRAGMENT} depthWrite={false} />
    </mesh>
  );
}

/* ──────────────────────────────────────────────────────────────
   Cámara con parallax y grupo de anclaje según layout
   ────────────────────────────────────────────────────────────── */

function CameraRig({ pointer, layout }: { pointer: RefObject<PointerVec>; layout: HeroLayout }) {
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const spec = LAYOUTS[layout];
    _camTarget.set(spec.camera[0] + pointer.current.x * 0.45, spec.camera[1] + pointer.current.y * 0.3, spec.camera[2]);
    damp3(state.camera.position, _camTarget, 0.7, dt);
    damp(_lookTarget, "x", spec.look[0], 0.7, dt);
    damp(_lookTarget, "y", spec.look[1], 0.7, dt);
    state.camera.lookAt(_lookTarget);
  });
  return null;
}

function LayoutRig({ layout, children }: { layout: HeroLayout; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const spec = LAYOUTS[layout];
    damp(g.position, "x", spec.anchor[0], 0.7, dt);
    damp(g.position, "y", spec.anchor[1], 0.7, dt);
    damp(g.scale, "x", spec.scale, 0.7, dt);
    damp(g.scale, "y", spec.scale, 0.7, dt);
    damp(g.scale, "z", spec.scale, 0.7, dt);
  });
  const spec = LAYOUTS[layout];
  return (
    <group ref={ref} position={spec.anchor} scale={spec.scale}>
      {children}
    </group>
  );
}

/** Avisa al contenedor en el primer frame pintado (fundido del fallback). */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    onReady();
  });
  return null;
}

/* ──────────────────────────────────────────────────────────────
   Escena
   ────────────────────────────────────────────────────────────── */

/**
 * Canvas R3F del hero. Se importa con next/dynamic (ssr:false) desde HeroCanvas.
 * - dpr / antialias / sombras / post-procesado según el perfil de rendimiento.
 * - frameloop "demand" cuando `active` es false: los useFrame dejan de ejecutarse.
 */
export default function HeroScene({ profile, pointer, layout, active, onReady }: HeroSceneProps) {
  const spec = LAYOUTS[layout];
  return (
    <Canvas
      dpr={profile.dpr}
      gl={{ antialias: profile.tier !== "low", powerPreference: "high-performance", alpha: true, stencil: false }}
      camera={{ fov: 35, near: 0.1, far: 60, position: spec.camera }}
      shadows={profile.shadows}
      frameloop={active ? "always" : "demand"}
      onCreated={(state) => {
        state.gl.toneMappingExposure = 1.05;
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ReadySignal onReady={onReady} />
      <fog attach="fog" args={["#0c0c0c", 11, 26]} />
      <Backdrop pointer={pointer} layout={layout} />
      <CameraRig pointer={pointer} layout={layout} />
      <LayoutRig layout={layout}>
        <SceneLights profile={profile} />
        <TixolaPan pointer={pointer} shadows={profile.shadows} />
        <FloatingFood count={profile.floaters} pointer={pointer} tier={profile.tier} shadows={profile.shadows} />
        <EmberParticles count={profile.particles} />
      </LayoutRig>
      <Effects enabled={profile.postprocessing} />
    </Canvas>
  );
}
