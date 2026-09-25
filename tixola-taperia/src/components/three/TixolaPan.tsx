"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { damp } from "maath/easing";
import type { PointerVec } from "@/hooks/usePointerParallax";
import { createScallopShellGeometry, createSeededRandom } from "./FloatingFood";

/* ──────────────────────────────────────────────────────────────
   Geometría procedural de la tixola (sartén de hierro fundido)
   ────────────────────────────────────────────────────────────── */

/**
 * Perfil de revolución [radio, altura] recorrido desde el centro de la base exterior,
 * subiendo por la pared exterior, cruzando el borde grueso y bajando por la pared interior
 * hasta el centro del fondo interior. Este sentido produce normales hacia fuera en LatheGeometry.
 */
const PAN_PROFILE: ReadonlyArray<readonly [number, number]> = [
  [0.0, 0.0],
  [1.3, 0.0],
  [1.42, 0.02], // bisel de la base
  [1.5, 0.06],
  [1.88, 0.58], // pared exterior inclinada
  [1.96, 0.66],
  [2.06, 0.7], // labio exterior
  [2.06, 0.76],
  [1.98, 0.8], // cara superior del borde
  [1.78, 0.8],
  [1.72, 0.76], // bisel interior
  [1.62, 0.66],
  [1.32, 0.16], // pared interior
  [1.24, 0.1],
  [1.1, 0.09],
  [0.0, 0.09], // fondo interior
];

const RIM_RADIUS = 2.02;
const RIM_Y = 0.78;
const INNER_FLOOR_Y = 0.09;
const SCALLOP_Y = 0.115;
const BASE_TILT = 0.46; // rad, inclinada hacia la cámara para ver el interior
const SPIN_SPEED = 0.14; // rad/s → una vuelta cada ~45 s

function createPanBodyGeometry(): THREE.LatheGeometry {
  const points = PAN_PROFILE.map(([r, y]) => new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(points, 96);
}

/* ──────────────────────────────────────────────────────────────
   Texturas generadas en tiempo de ejecución (sin assets externos)
   ────────────────────────────────────────────────────────────── */

/** Ruido de valor multi-octava, tileable (para bump/roughness y moteado de óxido). */
function createValueNoise(size: number, seed: number): Float32Array {
  const rnd = createSeededRandom(seed);
  const out = new Float32Array(size * size);
  const octaves: Array<{ cells: number; amp: number }> = [
    { cells: 8, amp: 0.5 },
    { cells: 24, amp: 0.3 },
    { cells: 64, amp: 0.2 },
  ];
  for (const { cells, amp } of octaves) {
    const lattice = new Float32Array(cells * cells);
    for (let i = 0; i < lattice.length; i++) lattice[i] = rnd();
    const step = size / cells;
    for (let y = 0; y < size; y++) {
      const gy = y / step;
      const y0 = Math.floor(gy) % cells;
      const y1 = (y0 + 1) % cells;
      const fy = gy - Math.floor(gy);
      const sy = fy * fy * (3 - 2 * fy);
      for (let x = 0; x < size; x++) {
        const gx = x / step;
        const x0 = Math.floor(gx) % cells;
        const x1 = (x0 + 1) % cells;
        const fx = gx - Math.floor(gx);
        const sx = fx * fx * (3 - 2 * fx);
        const a = lattice[y0 * cells + x0];
        const b = lattice[y0 * cells + x1];
        const c = lattice[y1 * cells + x0];
        const d = lattice[y1 * cells + x1];
        const v = (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
        out[y * size + x] += v * amp;
      }
    }
  }
  return out;
}

interface IronTextures {
  map: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
}

/**
 * Hierro fundido: mapa de color gris muy oscuro con motas de óxido rojizo + mapa de rugosidad/relieve
 * (gris medio con grano) generados en un <canvas> de 256 px.
 */
function createIronTextures(size = 256): IronTextures {
  const noise = createValueNoise(size, 4242);
  const speckle = createValueNoise(size, 9001);
  const rnd = createSeededRandom(77);

  const colorCanvas = document.createElement("canvas");
  const bumpCanvas = document.createElement("canvas");
  colorCanvas.width = colorCanvas.height = size;
  bumpCanvas.width = bumpCanvas.height = size;
  const cctx = colorCanvas.getContext("2d");
  const bctx = bumpCanvas.getContext("2d");

  if (cctx && bctx) {
    const cimg = cctx.createImageData(size, size);
    const bimg = bctx.createImageData(size, size);
    for (let i = 0; i < size * size; i++) {
      const n = noise[i];
      const grain = (rnd() - 0.5) * 0.12;
      // Relieve / rugosidad: gris medio con grano fino.
      const b = Math.round(Math.min(1, Math.max(0, 0.42 + (n - 0.5) * 0.7 + grain)) * 255);
      bimg.data[i * 4] = b;
      bimg.data[i * 4 + 1] = b;
      bimg.data[i * 4 + 2] = b;
      bimg.data[i * 4 + 3] = 255;
      // Color: #1c1c1c ± variación, con motas de óxido donde el segundo ruido es alto.
      const base = 26 + (n - 0.5) * 16 + grain * 60;
      const rust = Math.max(0, (speckle[i] - 0.66) / 0.34);
      cimg.data[i * 4] = Math.round(base + rust * 52);
      cimg.data[i * 4 + 1] = Math.round(base + rust * 14);
      cimg.data[i * 4 + 2] = Math.round(base + rust * 4);
      cimg.data[i * 4 + 3] = 255;
    }
    cctx.putImageData(cimg, 0, 0);
    bctx.putImageData(bimg, 0, 0);
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(3, 2);
  map.anisotropy = 4;

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.colorSpace = THREE.NoColorSpace;
  bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(5, 3);

  return { map, bump };
}

/** Sprite radial (naranja → transparente) para el halo de brasas bajo la sartén. */
function createGlowTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255, 120, 60, 0.95)");
    g.addColorStop(0.35, "rgba(216, 50, 60, 0.45)");
    g.addColorStop(1, "rgba(120, 10, 20, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ──────────────────────────────────────────────────────────────
   Zamburiñas chisporroteando dentro de la sartén
   ────────────────────────────────────────────────────────────── */

interface ScallopSlot {
  angle: number;
  radius: number;
  yaw: number;
  scale: number;
}

const SCALLOP_SLOTS: readonly ScallopSlot[] = [
  { angle: 0.75, radius: 0.62, yaw: 0.4, scale: 0.95 },
  { angle: 2.35, radius: 0.6, yaw: 2.1, scale: 0.88 },
  { angle: 3.9, radius: 0.64, yaw: 4.4, scale: 1 },
  { angle: 5.5, radius: 0.58, yaw: 0.9, scale: 0.9 },
];

interface SizzlingScallopProps {
  shell: THREE.BufferGeometry;
  slot: ScallopSlot;
  shadows: boolean;
}

/** Concha boca arriba con la carne (cilindro crema dorado por encima) y el coral naranja. */
function SizzlingScallop({ shell, slot, shadows }: SizzlingScallopProps) {
  const x = Math.cos(slot.angle) * slot.radius;
  const z = Math.sin(slot.angle) * slot.radius;
  return (
    <group position={[x, SCALLOP_Y, z]} rotation-y={slot.yaw} scale={slot.scale}>
      <mesh geometry={shell} rotation-x={Math.PI} castShadow={shadows} receiveShadow={shadows}>
        <meshPhysicalMaterial
          vertexColors
          roughness={0.45}
          metalness={0.05}
          sheen={0.4}
          sheenColor="#ffd9b8"
          clearcoat={0.35}
          clearcoatRoughness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Carne de la zamburiña */}
      <mesh position={[0, 0.11, 0]} castShadow={shadows}>
        <cylinderGeometry args={[0.2, 0.22, 0.13, 24]} />
        <meshStandardMaterial color="#f5e7d2" roughness={0.55} metalness={0} />
      </mesh>
      {/* Tostado de la plancha */}
      <mesh position={[0, 0.176, 0]}>
        <cylinderGeometry args={[0.19, 0.2, 0.012, 24]} />
        <meshStandardMaterial color="#d9a15f" roughness={0.7} metalness={0} />
      </mesh>
      {/* Coral */}
      <group rotation-y={0.9} position={[0, 0.09, 0]}>
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.19, 0.045, 8, 24, Math.PI * 0.95]} />
          <meshStandardMaterial color="#ff7a3d" roughness={0.5} metalness={0} emissive="#5a1a00" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────
   Componente principal
   ────────────────────────────────────────────────────────────── */

export interface TixolaPanProps {
  pointer: RefObject<PointerVec>;
  shadows: boolean;
}

/**
 * Tixola de hierro fundido construida con primitivas de three.js:
 * cuerpo por revolución (base plana, pared inclinada, borde grueso), labio toroidal, mango
 * cilíndrico con casquillo, remaches y anilla para colgar, película de aceite brillante y
 * cuatro zamburiñas chisporroteando. Flota (seno), gira despacio y se inclina hacia el puntero.
 */
export default function TixolaPan({ pointer, shadows }: TixolaPanProps) {
  const groupRef = useRef<THREE.Group>(null); // flotación + inclinación hacia el puntero
  const spinRef = useRef<THREE.Group>(null); // giro lento continuo
  const scallopsRef = useRef<THREE.Group>(null); // chisporroteo

  const body = useMemo(createPanBodyGeometry, []);
  const shell = useMemo(() => createScallopShellGeometry(0.46, 0.16, 15), []);
  const textures = useMemo(() => createIronTextures(256), []);
  const glow = useMemo(() => createGlowTexture(128), []);
  const iron = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d9d9d9", // multiplica el mapa (≈ #1c1c1c) → hierro casi negro
        map: textures.map,
        bumpMap: textures.bump,
        bumpScale: 0.6,
        roughnessMap: textures.bump,
        roughness: 0.85,
        metalness: 0.55,
      }),
    [textures],
  );

  useEffect(() => {
    return () => {
      body.dispose();
      shell.dispose();
      textures.map.dispose();
      textures.bump.dispose();
      glow.dispose();
      iron.dispose();
    };
  }, [body, shell, textures, glow, iron]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const spin = spinRef.current;
    if (!group || !spin) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const px = pointer.current.x;
    const py = pointer.current.y;

    // Flotación: dos senos desfasados para que no parezca un metrónomo.
    group.position.y = Math.sin(t * 0.9) * 0.08 + Math.sin(t * 0.37 + 1.3) * 0.04;
    // Inclinación amortiguada hacia el puntero / giroscopio.
    damp(group.rotation, "x", BASE_TILT - py * 0.22, 0.4, dt);
    damp(group.rotation, "z", px * 0.16, 0.4, dt);
    damp(group.position, "x", px * 0.12, 0.6, dt);
    // Giro lento continuo.
    spin.rotation.y = t * SPIN_SPEED;

    // Chisporroteo: vibración vertical minúscula y desfasada en cada zamburiña.
    const scallops = scallopsRef.current;
    if (scallops) {
      const children = scallops.children;
      for (let i = 0; i < children.length; i++) {
        children[i].position.y = SCALLOP_Y + Math.sin(t * 21 + i * 1.9) * 0.005 + Math.sin(t * 13.7 + i) * 0.004;
      }
    }
  });

  return (
    <group ref={groupRef} rotation-x={BASE_TILT}>
      <group ref={spinRef}>
        {/* Cuerpo */}
        <mesh geometry={body} material={iron} castShadow={shadows} receiveShadow={shadows} />

        {/* Labio del borde */}
        <mesh material={iron} position={[0, RIM_Y, 0]} rotation-x={Math.PI / 2} castShadow={shadows}>
          <torusGeometry args={[RIM_RADIUS, 0.06, 12, 96]} />
        </mesh>

        {/* Mango: casquillo, barra cónica, remaches, lengüeta plana y anilla para colgar */}
        <group position={[2.0, 0.62, 0]} rotation-z={0.2}>
          <mesh material={iron} position={[0.22, 0, 0]} rotation-z={-Math.PI / 2} castShadow={shadows}>
            <cylinderGeometry args={[0.16, 0.2, 0.55, 16]} />
          </mesh>
          <mesh material={iron} position={[1.35, 0, 0]} rotation-z={-Math.PI / 2} castShadow={shadows}>
            <cylinderGeometry args={[0.085, 0.105, 2.4, 20]} />
          </mesh>
          <mesh material={iron} position={[0.12, 0.17, 0.07]}>
            <sphereGeometry args={[0.035, 10, 8]} />
          </mesh>
          <mesh material={iron} position={[0.12, 0.17, -0.07]}>
            <sphereGeometry args={[0.035, 10, 8]} />
          </mesh>
          <mesh material={iron} position={[2.55, 0, 0]} castShadow={shadows}>
            <boxGeometry args={[0.5, 0.06, 0.32]} />
          </mesh>
          <mesh material={iron} position={[2.86, 0, 0]} rotation-x={Math.PI / 2} castShadow={shadows}>
            <torusGeometry args={[0.15, 0.04, 8, 24]} />
          </mesh>
        </group>

        {/* Película de aceite: disco ámbar con clearcoat para los reflejos del foco */}
        <mesh position={[0, INNER_FLOOR_Y + 0.015, 0]} rotation-x={-Math.PI / 2} receiveShadow={shadows}>
          <circleGeometry args={[1.22, 48]} />
          <meshPhysicalMaterial
            color="#5a3a12"
            roughness={0.12}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.08}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Zamburiñas */}
        <group ref={scallopsRef}>
          {SCALLOP_SLOTS.map((slot) => (
            <SizzlingScallop key={slot.angle} shell={shell} slot={slot} shadows={shadows} />
          ))}
        </group>
      </group>

      {/* Halo de brasas bajo la sartén (no gira con ella) */}
      <mesh position={[0, -0.42, 0]} rotation-x={-Math.PI / 2} renderOrder={-1}>
        <planeGeometry args={[5.2, 5.2]} />
        <meshBasicMaterial map={glow} transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
