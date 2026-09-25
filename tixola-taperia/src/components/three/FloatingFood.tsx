"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PerformanceTier } from "@/hooks/usePerformanceTier";
import type { PointerVec } from "@/hooks/usePointerParallax";

/* ──────────────────────────────────────────────────────────────
   Utilidades procedurales compartidas por la escena del hero
   ────────────────────────────────────────────────────────────── */

/** PRNG determinista (mulberry32): misma escena en cada montaje, sin Math.random en render. */
export function createSeededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Concha de zamburiña procedural: cúpula de revolución (LatheGeometry) con estrías radiales,
 * charnela recta y colores por vértice (crema en el centro → naranja tostado en el borde).
 * Normales apuntando hacia el lado convexo; usa `side: DoubleSide` en el material.
 */
export function createScallopShellGeometry(radius = 0.5, height = 0.17, ridges = 15): THREE.BufferGeometry {
  const steps = 9;
  const profile: THREE.Vector2[] = [];
  for (let k = 0; k <= steps; k++) {
    const r = radius * (1 - k / steps);
    const y = height * (1 - Math.pow(r / radius, 1.7));
    profile.push(new THREE.Vector2(r, y));
  }
  const segments = 56;
  const geo = new THREE.LatheGeometry(profile, segments);
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const cream = new THREE.Color("#f6e7d2");
  const orange = new THREE.Color("#e28a3f");
  const tmp = new THREE.Color();
  const hinge = -0.62 * radius;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const rr = Math.min(1, Math.hypot(x, z) / radius);
    const angle = Math.atan2(z, x);
    const ridge = Math.cos(ridges * angle);
    const bulge = 1 + 0.04 * ridge * rr;
    const nx = x * bulge;
    let nz = z * bulge;
    const ny = y + 0.028 * ridge * rr * rr; // estrías más marcadas hacia el borde
    if (nz < hinge) nz = hinge + (nz - hinge) * 0.18; // charnela recta
    pos.setXYZ(i, nx, ny, nz);

    tmp.copy(cream).lerp(orange, Math.pow(rr, 1.35));
    const shade = 1 - 0.14 * Math.max(0, -ridge) * rr;
    colors[i * 3] = tmp.r * shade;
    colors[i * 3 + 1] = tmp.g * shade;
    colors[i * 3 + 2] = tmp.b * shade;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  // Promedia las normales de la costura (i = 0 y i = segments comparten posición).
  const nrm = geo.getAttribute("normal") as THREE.BufferAttribute;
  const per = profile.length;
  for (let j = 0; j < per; j++) {
    const a = j;
    const b = segments * per + j;
    const x = nrm.getX(a) + nrm.getX(b);
    const y = nrm.getY(a) + nrm.getY(b);
    const z = nrm.getZ(a) + nrm.getZ(b);
    const len = Math.hypot(x, y, z) || 1;
    nrm.setXYZ(a, x / len, y / len, z / len);
    nrm.setXYZ(b, x / len, y / len, z / len);
  }
  geo.computeBoundingSphere();
  return geo;
}

/** Hoja de perejil: plano deformado (silueta serrada, tres lóbulos, ligera curvatura) con color por vértice. */
function createParsleyLeafGeometry(): THREE.BufferGeometry {
  const width = 0.34;
  const length = 0.5;
  const geo = new THREE.PlaneGeometry(1, 1, 8, 14);
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const dark = new THREE.Color("#2b6a2a");
  const light = new THREE.Color("#7cc850");
  const tmp = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i); // [-0.5, 0.5] ancho
    const v = pos.getY(i) + 0.5; // [0, 1] base → punta
    const silhouette = Math.pow(Math.sin(v * Math.PI), 0.6) * (1 + 0.14 * Math.sin(v * Math.PI * 7));
    const lobes = 1 + 0.25 * Math.exp(-Math.pow((v - 0.55) / 0.18, 2));
    const x = u * width * silhouette * lobes;
    const y = (v - 0.5) * length;
    const z = 0.05 * Math.pow(2 * u, 2) * silhouette + 0.06 * Math.sin(v * Math.PI) - 0.035 * v;
    pos.setXYZ(i, x, y, z);

    tmp.copy(dark).lerp(light, Math.min(1, 0.25 + 0.6 * v + 0.15 * Math.abs(2 * u)));
    const rib = Math.abs(u) < 0.07 ? 0.82 : 1; // nervio central más oscuro
    colors[i * 3] = tmp.r * rib;
    colors[i * 3 + 1] = tmp.g * rib;
    colors[i * 3 + 2] = tmp.b * rib;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Gota de aceite: esfera ligeramente alargada. */
function createOilDropGeometry(): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.11, 18, 14);
  geo.scale(1, 1.2, 1);
  return geo;
}

/* ──────────────────────────────────────────────────────────────
   Parámetros de cada objeto flotante
   ────────────────────────────────────────────────────────────── */

type FloaterKind = "shell" | "leaf" | "drop";

interface Floater {
  radius: number; // radio de la órbita
  squash: number; // achata la órbita en Z → sensación de profundidad
  height: number; // altura media
  speed: number; // rad/s (puede ser negativa)
  phase: number;
  bob: number; // amplitud del vaivén vertical
  bobSpeed: number;
  tiltX: number;
  tiltZ: number;
  spinX: number;
  spinY: number;
  spinZ: number;
  scale: number;
}

function buildFloaters(count: number, kind: FloaterKind, seed: number): Floater[] {
  const rnd = createSeededRandom(seed);
  const list: Floater[] = [];
  for (let i = 0; i < count; i++) {
    const dir = rnd() < 0.5 ? -1 : 1;
    const base: Floater = {
      radius: 2.4 + rnd() * 1.6,
      squash: 0.55 + rnd() * 0.35,
      height: -1.2 + rnd() * 2.8,
      speed: dir * (0.06 + rnd() * 0.1),
      phase: (i / count) * Math.PI * 2 + rnd() * 0.6,
      bob: 0.12 + rnd() * 0.22,
      bobSpeed: 0.5 + rnd() * 0.7,
      tiltX: (rnd() - 0.5) * 1.2,
      tiltZ: (rnd() - 0.5) * 1.2,
      spinX: (rnd() - 0.5) * 0.6,
      spinY: (rnd() - 0.5) * 0.8,
      spinZ: (rnd() - 0.5) * 0.5,
      scale: 1,
    };
    if (kind === "shell") {
      base.scale = 0.55 + rnd() * 0.4;
      base.height -= 0.3;
    } else if (kind === "leaf") {
      base.scale = 0.8 + rnd() * 0.5;
      base.height += 0.4;
      base.spinX *= 1.6;
    } else {
      base.scale = 0.7 + rnd() * 0.5;
      base.radius -= 0.4;
    }
    list.push(base);
  }
  return list;
}

/* Objetos de trabajo a nivel de módulo: cero asignaciones dentro de useFrame. */
const _dummy = new THREE.Object3D();

function updateInstances(
  mesh: THREE.InstancedMesh | null,
  list: Floater[],
  kind: FloaterKind,
  t: number,
  px: number,
  py: number,
) {
  if (!mesh) return;
  for (let i = 0; i < list.length; i++) {
    const f = list[i];
    const a = f.phase + t * f.speed;
    const z = Math.sin(a) * f.radius * f.squash;
    // Los objetos más cercanos a la cámara (z > 0) se desplazan más con el parallax.
    const depth = 0.15 + 0.35 * ((z + f.radius) / (2 * f.radius));
    const x = Math.cos(a) * f.radius + px * depth * 0.9;
    const y = f.height + Math.sin(t * f.bobSpeed + f.phase) * f.bob + py * depth * 0.6;

    _dummy.position.set(x, y, z);
    if (kind === "leaf") {
      // Las hojas revolotean: giro suave + aleteo.
      _dummy.rotation.set(f.tiltX + Math.sin(t * 1.6 + f.phase) * 0.35, f.phase + t * f.spinY, f.tiltZ + t * f.spinZ);
      _dummy.scale.setScalar(f.scale);
    } else if (kind === "drop") {
      _dummy.rotation.set(0, f.phase, 0);
      const pulse = 1 + Math.sin(t * 2.2 + f.phase) * 0.06;
      _dummy.scale.set(f.scale, f.scale * pulse, f.scale);
    } else {
      _dummy.rotation.set(f.tiltX + t * f.spinX, f.phase + t * f.spinY, f.tiltZ + t * f.spinZ);
      _dummy.scale.setScalar(f.scale);
    }
    _dummy.updateMatrix();
    mesh.setMatrixAt(i, _dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
}

/* ──────────────────────────────────────────────────────────────
   Componente
   ────────────────────────────────────────────────────────────── */

export interface FloatingFoodProps {
  /** Nº total de objetos (profile.floaters) */
  count: number;
  pointer: RefObject<PointerVec>;
  tier: PerformanceTier;
  shadows: boolean;
}

/**
 * Conchas de zamburiña, hojas de perejil y gotas de aceite orbitando la tixola.
 * Tres InstancedMesh (uno por tipo) → 3 draw calls independientemente del nº de objetos.
 */
export default function FloatingFood({ count, pointer, tier, shadows }: FloatingFoodProps) {
  const shellRef = useRef<THREE.InstancedMesh>(null);
  const leafRef = useRef<THREE.InstancedMesh>(null);
  const dropRef = useRef<THREE.InstancedMesh>(null);

  const shellCount = Math.max(1, Math.round(count * 0.4));
  const leafCount = Math.max(1, Math.round(count * 0.35));
  const dropCount = Math.max(1, count - shellCount - leafCount);

  const shells = useMemo(() => buildFloaters(shellCount, "shell", 101), [shellCount]);
  const leaves = useMemo(() => buildFloaters(leafCount, "leaf", 202), [leafCount]);
  const drops = useMemo(() => buildFloaters(dropCount, "drop", 303), [dropCount]);

  const shellGeo = useMemo(() => createScallopShellGeometry(), []);
  const leafGeo = useMemo(() => createParsleyLeafGeometry(), []);
  const dropGeo = useMemo(() => createOilDropGeometry(), []);

  useEffect(() => {
    return () => {
      shellGeo.dispose();
      leafGeo.dispose();
      dropGeo.dispose();
    };
  }, [shellGeo, leafGeo, dropGeo]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const px = pointer.current.x;
    const py = pointer.current.y;
    updateInstances(shellRef.current, shells, "shell", t, px, py);
    updateInstances(leafRef.current, leaves, "leaf", t, px, py);
    updateInstances(dropRef.current, drops, "drop", t, px, py);
  });

  const transmissive = tier === "high";

  return (
    <group>
      <instancedMesh ref={shellRef} args={[shellGeo, undefined, shells.length]} frustumCulled={false} castShadow={shadows}>
        <meshPhysicalMaterial
          vertexColors
          roughness={0.5}
          metalness={0.05}
          sheen={0.5}
          sheenColor="#ffd9b8"
          sheenRoughness={0.6}
          clearcoat={0.25}
          clearcoatRoughness={0.4}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      <instancedMesh ref={leafRef} args={[leafGeo, undefined, leaves.length]} frustumCulled={false} castShadow={shadows}>
        <meshStandardMaterial vertexColors roughness={0.65} metalness={0} side={THREE.DoubleSide} />
      </instancedMesh>

      <instancedMesh ref={dropRef} args={[dropGeo, undefined, drops.length]} frustumCulled={false}>
        <meshPhysicalMaterial
          color="#ffcf6e"
          roughness={0.05}
          metalness={0}
          transmission={transmissive ? 0.9 : 0}
          thickness={0.35}
          ior={1.47}
          attenuationColor="#ff9a3d"
          attenuationDistance={0.5}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transparent
          opacity={transmissive ? 1 : 0.82}
          emissive="#7a3a00"
          emissiveIntensity={0.25}
        />
      </instancedMesh>
    </group>
  );
}
