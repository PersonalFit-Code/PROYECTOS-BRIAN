"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createSeededRandom } from "./FloatingFood";

/* ──────────────────────────────────────────────────────────────
   Shaders: todo el ciclo de vida se calcula en la GPU a partir de uTime
   (sin actualizar buffers desde la CPU en cada frame).
   ────────────────────────────────────────────────────────────── */

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uScale;
  uniform float uRise;
  uniform float uSpread;
  uniform float uSizeMul;

  attribute float aSeed;
  attribute float aSize;
  attribute float aLife;
  attribute float aPhase;

  varying float vLife;
  varying float vSeed;

  void main() {
    // Progreso de vida 0→1 en bucle: al llegar a 1 reaparece abajo (respawn implícito).
    float life = fract(uTime / aLife + aPhase);
    vLife = life;
    vSeed = aSeed;

    vec3 p = position;
    float h = life * uRise * (0.7 + 0.6 * aSeed);
    p.y += h;

    // Turbulencia: vaivén lateral que crece con la altura.
    float sw = uSpread * (0.3 + life);
    p.x += sin(uTime * (0.8 + aSeed) + aSeed * 31.4 + h * 1.7) * sw;
    p.z += cos(uTime * (0.7 + aSeed * 0.9) + aSeed * 17.3 + h * 1.3) * sw;

    // Deriva en espiral hacia fuera.
    p.xz += normalize(p.xz + 1e-4) * life * 0.35 * aSeed;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float fade = smoothstep(0.0, 0.15, life) * (1.0 - smoothstep(0.55, 1.0, life));
    gl_PointSize = aSize * uSizeMul * uScale * (0.6 + 0.6 * fade) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uOpacity;
  uniform float uSoftness;

  varying float vLife;
  varying float vSeed;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float alpha = 1.0 - smoothstep(uSoftness, 0.5, d);
    float fade = smoothstep(0.0, 0.12, vLife) * (1.0 - smoothstep(0.6, 1.0, vLife));

    vec3 col = mix(uColorA, uColorB, smoothstep(0.0, 0.45, vLife));
    col = mix(col, uColorC, smoothstep(0.45, 1.0, vLife));
    float flicker = 0.8 + 0.2 * sin(vLife * 60.0 + vSeed * 20.0);

    gl_FragColor = vec4(col * flicker, alpha * fade * uOpacity);
    #include <colorspace_fragment>
  }
`;

type ParticleUniforms = {
  uTime: THREE.IUniform<number>;
  uScale: THREE.IUniform<number>;
  uRise: THREE.IUniform<number>;
  uSpread: THREE.IUniform<number>;
  uSizeMul: THREE.IUniform<number>;
  uSoftness: THREE.IUniform<number>;
  uOpacity: THREE.IUniform<number>;
  uColorA: THREE.IUniform<THREE.Color>;
  uColorB: THREE.IUniform<THREE.Color>;
  uColorC: THREE.IUniform<THREE.Color>;
};

interface LayerConfig {
  rise: number;
  spread: number;
  sizeMul: number;
  softness: number;
  opacity: number;
  colors: [string, string, string];
}

/** Chispas: ámbar → naranja brasa → rojo pimentón, sprite nítido, aditivo. */
const EMBER: LayerConfig = {
  rise: 3.6,
  spread: 0.22,
  sizeMul: 1,
  softness: 0.12,
  opacity: 1,
  colors: ["#ffb347", "#ff5a2a", "#b21e27"],
};

/** Humo: gris oscuro, sprite muy suave, lento y casi transparente. */
const SMOKE: LayerConfig = {
  rise: 2.8,
  spread: 0.45,
  sizeMul: 1,
  softness: 0.02,
  opacity: 0.16,
  colors: ["#3a3a3a", "#4a4646", "#2a2a2a"],
};

function createUniforms(cfg: LayerConfig): ParticleUniforms {
  return {
    uTime: { value: 0 },
    uScale: { value: 1 },
    uRise: { value: cfg.rise },
    uSpread: { value: cfg.spread },
    uSizeMul: { value: cfg.sizeMul },
    uSoftness: { value: cfg.softness },
    uOpacity: { value: cfg.opacity },
    uColorA: { value: new THREE.Color(cfg.colors[0]) },
    uColorB: { value: new THREE.Color(cfg.colors[1]) },
    uColorC: { value: new THREE.Color(cfg.colors[2]) },
  };
}

/**
 * Geometría de puntos con atributos por partícula. Las posiciones son el punto de aparición:
 * ~72 % dentro de la tixola (nivel del aceite) y el resto en las brasas bajo la sartén.
 */
function createParticleGeometry(count: number, spawnRadius: number, seed: number, kind: "ember" | "smoke"): THREE.BufferGeometry {
  const rnd = createSeededRandom(seed);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  const lives = new Float32Array(count);
  const phases = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const fromBelow = rnd() >= 0.72;
    const r = Math.sqrt(rnd()) * spawnRadius * (fromBelow ? 1.9 : 1);
    const a = rnd() * Math.PI * 2;
    positions[i * 3] = Math.cos(a) * r;
    positions[i * 3 + 1] = fromBelow ? -0.9 + rnd() * 0.4 : 0.15 + rnd() * 0.35;
    positions[i * 3 + 2] = Math.sin(a) * r;
    seeds[i] = rnd();
    if (kind === "ember") {
      sizes[i] = 6 + rnd() * 14;
      lives[i] = 2.2 + rnd() * 3.2;
    } else {
      sizes[i] = 42 + rnd() * 48;
      lives[i] = 5 + rnd() * 5;
    }
    phases[i] = rnd();
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("aLife", new THREE.BufferAttribute(lives, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  return geo;
}

export interface EmberParticlesProps {
  /** Nº de chispas (profile.particles). La capa de humo usa ~1/6. */
  count: number;
  /** Radio del disco de aparición (≈ radio interior de la tixola). */
  spawnRadius?: number;
}

/**
 * Sistema de partículas WebGL: chispas de brasa (aditivas) + capa de humo (normal blending).
 * Coste CPU por frame: dos uniforms. Las partículas reaparecen abajo al terminar su vida.
 */
export default function EmberParticles({ count, spawnRadius = 1.35 }: EmberParticlesProps) {
  const emberMat = useRef<THREE.ShaderMaterial>(null);
  const smokeMat = useRef<THREE.ShaderMaterial>(null);

  const smokeCount = Math.max(12, Math.round(count / 6));
  const emberGeo = useMemo(() => createParticleGeometry(count, spawnRadius, 7, "ember"), [count, spawnRadius]);
  const smokeGeo = useMemo(() => createParticleGeometry(smokeCount, spawnRadius * 0.8, 11, "smoke"), [smokeCount, spawnRadius]);
  const emberUniforms = useMemo(() => createUniforms(EMBER), []);
  const smokeUniforms = useMemo(() => createUniforms(SMOKE), []);

  useEffect(() => {
    return () => {
      emberGeo.dispose();
      smokeGeo.dispose();
    };
  }, [emberGeo, smokeGeo]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Escala de tamaño en píxeles proporcional a la altura del canvas (y al DPR real).
    const scale = (state.size.height * state.viewport.dpr) / 900;
    const e = emberMat.current;
    if (e) {
      e.uniforms.uTime.value = t;
      e.uniforms.uScale.value = scale;
    }
    const s = smokeMat.current;
    if (s) {
      s.uniforms.uTime.value = t * 0.7;
      s.uniforms.uScale.value = scale;
    }
  });

  return (
    <group>
      <points geometry={smokeGeo} frustumCulled={false} renderOrder={1}>
        <shaderMaterial
          ref={smokeMat}
          uniforms={smokeUniforms}
          vertexShader={VERTEX}
          fragmentShader={FRAGMENT}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>
      <points geometry={emberGeo} frustumCulled={false} renderOrder={2}>
        <shaderMaterial
          ref={emberMat}
          uniforms={emberUniforms}
          vertexShader={VERTEX}
          fragmentShader={FRAGMENT}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
