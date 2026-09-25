"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useLayoutEffect, useMemo, useRef, type ComponentRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { PerfProfile } from "@/hooks/usePerformanceTier";

/**
 * CityMap3D — mapa 3D estilizado de la manzana Rúa Juan de Austria / Catedral de Ourense.
 *
 *  · Cámara "isométrica" con auto-órbita lenta + arrastre para girar (sin zoom ni pan).
 *  · Manzanas low-poly fusionadas en UNA geometría con colores por vértice (1 draw call) +
 *    UNA geometría de aristas crema (1 draw call). Ídem para la Catedral.
 *  · Ventanas = instancedMesh (1 draw call), doradas y HDR para que el bloom las haga brillar.
 *  · Chincheta roja flotante (cono + esfera) sobre la puerta de Tixola con anillos que pulsan en el suelo.
 *  · Sombras y bloom solo si el perfil de rendimiento lo permite; en tier "low" no renderiza nada
 *    (el padre muestra el fallback estático).
 *
 * Total ≈ 18 draw calls; sin texturas ni assets externos.
 */

/* ────────────────────────────────────────────────────────────
   Paleta y constantes de escena
   ──────────────────────────────────────────────────────────── */
const PALETTE = {
  background: "#0d0d10",
  ground: "#141517",
  pavement: "#1b1b1f",
  plaza: "#212125",
  street: "#27282d",
  cream: "#f9f6f0",
  stone: "#5b4b3d",
  stoneRoof: "#3d322d",
  slateRoof: "#2a282e",
  door: "#2b1a12",
  tixola: "#3d2226",
  ironTones: ["#2a2a2e", "#303035", "#26262a", "#35353a", "#2d2c31", "#232327"],
} as const;

/** Colores HDR (> 1.0) para que el bloom los capte; `toneMapped={false}` en sus materiales. */
const GOLD_HDR = new THREE.Color("#e8c27a").multiplyScalar(1.8);
const PIMENTON_HDR = new THREE.Color("#d8323c").multiplyScalar(2.2);
const AMBER_WINDOW = new THREE.Color("#d9a15a");

/** Cámara y órbita (unidades ≈ 10 m). */
const CAMERA_POSITION: [number, number, number] = [-1.4, 7.4, 11.4];
const ORBIT_TARGET: [number, number, number] = [0.2, 0.5, 0.4];

/* ────────────────────────────────────────────────────────────
   Trazado urbano (estilizado, no a escala). La fachada de la Catedral mira a +z
   (hacia la cámara inicial) y la Rúa Juan de Austria discurre a lo largo de z en x ≈ 1.3.
   ──────────────────────────────────────────────────────────── */
interface Block {
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
  color: string;
}

const TIXOLA: Block = { x: 3.0, z: 0.6, w: 1.5, h: 0.95, d: 1.3, color: PALETTE.tixola };

const BLOCKS: readonly Block[] = [
  TIXOLA,
  // Acera este de la Rúa Juan de Austria
  { x: 3.05, z: -1.15, w: 1.6, h: 1.25, d: 1.6, color: PALETTE.ironTones[0] },
  { x: 3.0, z: 2.35, w: 1.5, h: 1.1, d: 1.6, color: PALETTE.ironTones[1] },
  { x: 3.2, z: 4.0, w: 1.7, h: 0.9, d: 1.2, color: PALETTE.ironTones[2] },
  { x: 4.7, z: -0.2, w: 1.4, h: 1.5, d: 2.2, color: PALETTE.ironTones[3] },
  { x: 4.7, z: 2.4, w: 1.4, h: 1.0, d: 1.8, color: PALETTE.ironTones[4] },
  { x: 4.7, z: 4.4, w: 1.3, h: 1.2, d: 1.3, color: PALETTE.ironTones[5] },
  // Sur (tras la travesía)
  { x: 3.0, z: -5.05, w: 1.6, h: 1.05, d: 1.5, color: PALETTE.ironTones[1] },
  { x: 4.7, z: -5.0, w: 1.3, h: 1.4, d: 1.4, color: PALETTE.ironTones[2] },
  { x: -0.2, z: -5.05, w: 1.6, h: 1.2, d: 1.4, color: PALETTE.ironTones[0] },
  { x: -2.3, z: -5.0, w: 2.0, h: 0.95, d: 1.3, color: PALETTE.ironTones[3] },
  { x: -4.6, z: -5.05, w: 1.6, h: 1.1, d: 1.4, color: PALETTE.ironTones[4] },
  { x: -6.3, z: -2.0, w: 1.2, h: 0.9, d: 2.0, color: PALETTE.ironTones[5] },
  // Norte (tras la plaza)
  { x: 3.0, z: 6.9, w: 1.8, h: 1.2, d: 1.4, color: PALETTE.ironTones[2] },
  { x: -0.3, z: 6.9, w: 1.7, h: 1.1, d: 1.5, color: PALETTE.ironTones[0] },
  { x: -2.4, z: 7.0, w: 2.0, h: 1.35, d: 1.6, color: PALETTE.ironTones[3] },
  { x: -4.6, z: 6.8, w: 1.6, h: 0.9, d: 1.4, color: PALETTE.ironTones[1] },
  // Oeste de la Catedral
  { x: -5.1, z: 1.4, w: 1.5, h: 1.0, d: 1.8, color: PALETTE.ironTones[4] },
  { x: -5.2, z: -1.2, w: 1.6, h: 1.3, d: 2.0, color: PALETTE.ironTones[5] },
  { x: -5.0, z: 3.9, w: 1.5, h: 0.85, d: 1.6, color: PALETTE.ironTones[2] },
];

/** La chincheta marca la puerta de Tixola: esquina de la fachada que da a la calle. */
const PIN_POSITION: [number, number, number] = [TIXOLA.x - TIXOLA.w / 2 - 0.3, 0, TIXOLA.z + TIXOLA.d / 2 + 0.15];

/* ────────────────────────────────────────────────────────────
   Utilidades de geometría
   ──────────────────────────────────────────────────────────── */
interface Part {
  geometry: THREE.BufferGeometry;
  color: string;
}

/** Coloca una geometría en coordenadas de mundo (rotación Y opcional + traslación). */
function place(geometry: THREE.BufferGeometry, x: number, y: number, z: number, rotY = 0) {
  if (rotY) geometry.rotateY(rotY);
  geometry.translate(x, y, z);
  return geometry;
}

/** Prisma triangular (tejado a dos aguas) extruido a lo largo de +z desde z = 0. */
function gableRoof(width: number, height: number, length: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(0, height);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false });
}

/**
 * Fusiona varias piezas en una sola geometría con color por vértice y genera además
 * la geometría de aristas (EdgesGeometry) para el trazo crema. Las piezas originales se liberan.
 */
function buildMerged(parts: Part[], edgeThreshold = 35) {
  const color = new THREE.Color();
  const pieces = parts.map((part) => {
    const g = part.geometry.index ? part.geometry.toNonIndexed() : part.geometry;
    if (g !== part.geometry) part.geometry.dispose();
    g.deleteAttribute("uv"); // atributos homogéneos para poder fusionar
    color.set(part.color);
    const count = g.getAttribute("position").count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  });
  const solid = mergeGeometries(pieces, false);
  pieces.forEach((g) => g.dispose());
  solid.computeBoundingSphere();
  const edges = new THREE.EdgesGeometry(solid, edgeThreshold);
  return { solid, edges };
}

/* ────────────────────────────────────────────────────────────
   Ventanas instanciadas
   ──────────────────────────────────────────────────────────── */
interface WindowSpec {
  position: [number, number, number];
  rotationY: number;
  /** multiplicador de brillo (0–1) */
  intensity: number;
  /** escala opcional del plano */
  scale?: [number, number];
}

/** Hash determinista en [0,1) para encender/apagar ventanas sin aleatoriedad entre renders. */
function hash(a: number, b: number, c: number) {
  const x = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453;
  return x - Math.floor(x);
}

const FACES = [
  { rotY: 0, along: "x", sign: 1 }, // cara +z
  { rotY: Math.PI, along: "x", sign: -1 }, // cara −z
  { rotY: Math.PI / 2, along: "z", sign: 1 }, // cara +x
  { rotY: -Math.PI / 2, along: "z", sign: -1 }, // cara −x
] as const;

/** Ventanas ámbar tenues repartidas por las fachadas de las manzanas (≈ 45 % encendidas). */
function buildingWindows(blocks: readonly Block[]): WindowSpec[] {
  const specs: WindowSpec[] = [];
  const step = 0.42;
  const inset = 0.012;
  blocks.forEach((b, bi) => {
    const rows = b.h >= 1.15 ? [0.36, 0.7] : [0.55];
    FACES.forEach((face, fi) => {
      const faceWidth = face.along === "x" ? b.w : b.d;
      const n = Math.max(1, Math.floor(faceWidth / step));
      for (let k = 0; k < n; k++) {
        const offset = (k - (n - 1) / 2) * step;
        rows.forEach((row, ri) => {
          const lit = hash(bi, fi * 10 + k, ri) > 0.55;
          if (!lit) return;
          const y = b.h * row;
          const position: [number, number, number] =
            face.along === "x"
              ? [b.x + offset, y, b.z + face.sign * (b.d / 2 + inset)]
              : [b.x + face.sign * (b.w / 2 + inset), y, b.z + offset];
          specs.push({ position, rotationY: face.rotY, intensity: 0.35 + hash(ri, bi, fi + k) * 0.65 });
        });
      }
    });
  });
  return specs;
}

/** Ventanales dorados de la Catedral (nave, crucero y torre). */
function cathedralWindows(): WindowSpec[] {
  const specs: WindowSpec[] = [];
  // lado este (calle): libre en toda su longitud; lado oeste: la torre ocupa z ≈ 1.6…2.7
  for (const z of [-2.0, -1.55, 0.75, 1.45, 2.15]) {
    specs.push({ position: [-1.09, 1.0, z], rotationY: Math.PI / 2, intensity: 1 });
  }
  for (const z of [-2.0, -1.55, 0.75, 1.3]) {
    specs.push({ position: [-3.31, 1.0, z], rotationY: -Math.PI / 2, intensity: 1 });
  }
  // extremos del crucero
  specs.push({ position: [-0.19, 0.85, -0.5], rotationY: Math.PI / 2, intensity: 1, scale: [1.2, 1.15] });
  specs.push({ position: [-4.21, 0.85, -0.5], rotationY: -Math.PI / 2, intensity: 1, scale: [1.2, 1.15] });
  // torre: dos hileras en las cuatro caras
  const tx = -3.15;
  const tz = 2.15;
  const half = 0.55 + 0.012;
  for (const y of [2.25, 2.95]) {
    specs.push({ position: [tx, y, tz + half], rotationY: 0, intensity: 1, scale: [0.85, 0.8] });
    specs.push({ position: [tx, y, tz - half], rotationY: Math.PI, intensity: 1, scale: [0.85, 0.8] });
    specs.push({ position: [tx + half, y, tz], rotationY: Math.PI / 2, intensity: 1, scale: [0.85, 0.8] });
    specs.push({ position: [tx - half, y, tz], rotationY: -Math.PI / 2, intensity: 1, scale: [0.85, 0.8] });
  }
  return specs;
}

interface WindowsProps {
  specs: WindowSpec[];
  size: [number, number];
  color: THREE.Color;
}

function Windows({ specs, size, color }: WindowsProps) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const tint = new THREE.Color();
    specs.forEach((w, i) => {
      dummy.position.set(w.position[0], w.position[1], w.position[2]);
      dummy.rotation.set(0, w.rotationY, 0);
      dummy.scale.set(w.scale?.[0] ?? 1, w.scale?.[1] ?? 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, tint.copy(color).multiplyScalar(w.intensity));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [specs, color]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, specs.length]} frustumCulled={false}>
      <planeGeometry args={size} />
      <meshBasicMaterial color="#ffffff" toneMapped={false} />
    </instancedMesh>
  );
}

/* ────────────────────────────────────────────────────────────
   Escenario: suelo, calles, manzanas y Catedral
   ──────────────────────────────────────────────────────────── */
function Ground({ shadows }: { shadows: boolean }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={shadows}>
        <circleGeometry args={[17, 64]} />
        <meshStandardMaterial color={PALETTE.ground} roughness={0.95} metalness={0.05} />
      </mesh>
      {/* rejilla tenue tipo plano urbano */}
      <gridHelper args={[40, 40, "#1e1e23", "#19191d"]} position={[0, 0.003, 0]} />
      {/* explanada pavimentada alrededor de la Catedral */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.65, 0.006, 0.05]} receiveShadow={shadows}>
        <planeGeometry args={[4.9, 6.6]} />
        <meshStandardMaterial color={PALETTE.pavement} roughness={1} />
      </mesh>
      {/* plaza frente a la fachada */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.2, 0.012, 3.9]} receiveShadow={shadows}>
        <circleGeometry args={[1.4, 40]} />
        <meshStandardMaterial color={PALETTE.plaza} roughness={1} />
      </mesh>
    </group>
  );
}

function Streets() {
  return (
    <group>
      {/* Rúa Juan de Austria (eje z) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.3, 0.018, 0]}>
        <planeGeometry args={[1.1, 18]} />
        <meshStandardMaterial color={PALETTE.street} roughness={1} />
      </mesh>
      {/* travesías (eje x) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, -3.8]}>
        <planeGeometry args={[18, 0.9]} />
        <meshStandardMaterial color={PALETTE.street} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 5.7]}>
        <planeGeometry args={[18, 0.9]} />
        <meshStandardMaterial color={PALETTE.street} roughness={1} />
      </mesh>
    </group>
  );
}

function Buildings({ shadows }: { shadows: boolean }) {
  const { solid, edges } = useMemo(
    () => buildMerged(BLOCKS.map((b) => ({ geometry: place(new THREE.BoxGeometry(b.w, b.h, b.d), b.x, b.h / 2, b.z), color: b.color }))),
    [],
  );
  const windows = useMemo(() => buildingWindows(BLOCKS), []);

  useEffect(
    () => () => {
      solid.dispose();
      edges.dispose();
    },
    [solid, edges],
  );

  return (
    <group>
      <mesh geometry={solid} castShadow={shadows} receiveShadow={shadows}>
        <meshStandardMaterial vertexColors roughness={0.85} metalness={0.18} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={PALETTE.cream} transparent opacity={0.38} />
      </lineSegments>
      <Windows specs={windows} size={[0.14, 0.2]} color={AMBER_WINDOW} />
    </group>
  );
}

function Cathedral({ shadows }: { shadows: boolean }) {
  const { solid, edges } = useMemo(() => {
    const parts: Part[] = [
      // nave
      { geometry: place(new THREE.BoxGeometry(2.2, 1.7, 5.2), -2.2, 0.85, 0), color: PALETTE.stone },
      { geometry: place(gableRoof(2.3, 0.75, 5.2), -2.2, 1.7, -2.6), color: PALETTE.stoneRoof },
      // crucero
      { geometry: place(new THREE.BoxGeometry(4.0, 1.5, 1.5), -2.2, 0.75, -0.5), color: PALETTE.stone },
      { geometry: place(gableRoof(1.6, 0.55, 4.0), -4.2, 1.5, -0.5, Math.PI / 2), color: PALETTE.stoneRoof },
      // cimborrio octogonal sobre el crucero
      { geometry: place(new THREE.CylinderGeometry(0.8, 0.8, 0.9, 8), -2.2, 2.9, -0.5, Math.PI / 8), color: PALETTE.stone },
      { geometry: place(new THREE.ConeGeometry(0.86, 0.7, 8), -2.2, 3.7, -0.5, Math.PI / 8), color: PALETTE.slateRoof },
      // ábside (medio cilindro hacia −z)
      {
        geometry: place(new THREE.CylinderGeometry(0.8, 0.8, 1.6, 12, 1, false, Math.PI / 2, Math.PI), -2.2, 0.8, -2.6),
        color: PALETTE.stone,
      },
      // torre campanario en la esquina oeste de la fachada, con chapitel
      { geometry: place(new THREE.BoxGeometry(1.1, 3.6, 1.1), -3.15, 1.8, 2.15), color: PALETTE.stone },
      { geometry: place(new THREE.ConeGeometry(0.86, 1.4, 4), -3.15, 4.3, 2.15, Math.PI / 4), color: PALETTE.slateRoof },
    ];
    return buildMerged(parts, 35);
  }, []);
  const windows = useMemo(() => cathedralWindows(), []);

  useEffect(
    () => () => {
      solid.dispose();
      edges.dispose();
    },
    [solid, edges],
  );

  return (
    <group>
      <mesh geometry={solid} castShadow={shadows} receiveShadow={shadows}>
        <meshStandardMaterial vertexColors roughness={0.9} metalness={0.05} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={PALETTE.cream} transparent opacity={0.55} />
      </lineSegments>

      {/* rosetón: anillo dorado + vidriera tenue */}
      <mesh position={[-1.85, 1.5, 2.612]}>
        <torusGeometry args={[0.4, 0.05, 12, 40]} />
        <meshBasicMaterial color={GOLD_HDR} toneMapped={false} />
      </mesh>
      <mesh position={[-1.85, 1.5, 2.605]}>
        <circleGeometry args={[0.36, 32]} />
        <meshBasicMaterial color="#8a6a32" toneMapped={false} />
      </mesh>
      {/* portada */}
      <mesh position={[-1.85, 0.33, 2.606]}>
        <planeGeometry args={[0.42, 0.66]} />
        <meshStandardMaterial color={PALETTE.door} roughness={0.9} />
      </mesh>

      <Windows specs={windows} size={[0.16, 0.5]} color={GOLD_HDR} />
    </group>
  );
}

/** Rótulo neón de Tixola en la fachada que da a la calle y en la esquina. */
function TixolaSign() {
  const faceX = TIXOLA.x - TIXOLA.w / 2 - 0.006;
  const faceZ = TIXOLA.z + TIXOLA.d / 2 + 0.006;
  return (
    <group>
      <mesh position={[faceX, TIXOLA.h * 0.7, TIXOLA.z]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[TIXOLA.d * 0.72, 0.13]} />
        <meshBasicMaterial color={PIMENTON_HDR} toneMapped={false} />
      </mesh>
      <mesh position={[TIXOLA.x, TIXOLA.h * 0.7, faceZ]}>
        <planeGeometry args={[TIXOLA.w * 0.7, 0.13]} />
        <meshBasicMaterial color={PIMENTON_HDR} toneMapped={false} />
      </mesh>
      {/* luz cálida de la terraza */}
      <pointLight position={[faceX - 0.6, 0.7, TIXOLA.z]} color="#ff7a45" intensity={3.5} distance={4.5} decay={2} />
    </group>
  );
}

/* ────────────────────────────────────────────────────────────
   Chincheta animada
   ──────────────────────────────────────────────────────────── */
function pulseRing(mesh: THREE.Mesh | null, material: THREE.MeshBasicMaterial | null, phase: number) {
  if (!mesh || !material) return;
  const s = 0.45 + phase * 2.6;
  mesh.scale.set(s, s, 1);
  material.opacity = (1 - phase) * 0.85;
}

function Pin({ position, shadows }: { position: [number, number, number]; shadows: boolean }) {
  const body = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const matA = useRef<THREE.MeshBasicMaterial>(null);
  const matB = useRef<THREE.MeshBasicMaterial>(null);
  const light = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const g = body.current;
    if (g) {
      g.position.y = 0.55 + Math.sin(t * 2.2) * 0.09;
      g.rotation.y = t * 0.8;
    }
    pulseRing(ringA.current, matA.current, (t * 0.65) % 1);
    pulseRing(ringB.current, matB.current, (t * 0.65 + 0.5) % 1);
    if (light.current) light.current.intensity = 5 + Math.sin(t * 2.2) * 1.6;
  });

  return (
    <group position={position}>
      <group ref={body} position={[0, 0.55, 0]}>
        {/* cono invertido (punta abajo) */}
        <mesh position={[0, 0.32, 0]} rotation={[Math.PI, 0, 0]} castShadow={shadows}>
          <coneGeometry args={[0.19, 0.62, 24]} />
          <meshStandardMaterial color="#d8323c" emissive="#b21e27" emissiveIntensity={0.9} roughness={0.35} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.74, 0]} castShadow={shadows}>
          <sphereGeometry args={[0.27, 32, 24]} />
          <meshStandardMaterial color="#d8323c" emissive="#b21e27" emissiveIntensity={0.9} roughness={0.35} metalness={0.1} />
        </mesh>
        {/* "ojo" crema que gira con la chincheta */}
        <mesh position={[0, 0.74, 0.21]}>
          <sphereGeometry args={[0.09, 16, 12]} />
          <meshBasicMaterial color={PALETTE.cream} toneMapped={false} />
        </mesh>
      </group>

      <pointLight ref={light} position={[0, 1.25, 0]} color="#ff3b3b" intensity={5} distance={6} decay={2} />

      {/* anillos que pulsan sobre el suelo */}
      <mesh ref={ringA} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.34, 0.42, 48]} />
        <meshBasicMaterial ref={matA} color="#d8323c" transparent toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh ref={ringB} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.34, 0.42, 48]} />
        <meshBasicMaterial ref={matB} color="#d8323c" transparent toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ────────────────────────────────────────────────────────────
   Etiquetas HTML ancladas a la escena
   ──────────────────────────────────────────────────────────── */
const LABEL_CLASS =
  "whitespace-nowrap rounded-full border px-3 py-1 font-sans text-[11px] font-bold uppercase tracking-[0.18em] backdrop-blur-md";

function Labels() {
  return (
    <>
      <Html position={[PIN_POSITION[0], 2.05, PIN_POSITION[2]]} center pointerEvents="none" zIndexRange={[30, 20]}>
        <div className={`${LABEL_CLASS} border-pimenton-light/60 bg-iron-900/85 text-cream shadow-neon`}>Tixola Tapería</div>
      </Html>
      <Html position={[-2.2, 4.7, -0.5]} center pointerEvents="none" zIndexRange={[30, 20]}>
        <div className={`${LABEL_CLASS} border-gold/40 bg-iron-900/70 text-gold`}>Catedral de Ourense</div>
      </Html>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   Luces, controles y ayudas
   ──────────────────────────────────────────────────────────── */
function Lights({ shadows }: { shadows: boolean }) {
  const sun = useRef<THREE.DirectionalLight>(null);

  useEffect(() => {
    const light = sun.current;
    if (!light || !shadows) return;
    light.shadow.mapSize.set(1024, 1024);
    const cam = light.shadow.camera;
    cam.left = -9;
    cam.right = 9;
    cam.top = 9;
    cam.bottom = -9;
    cam.near = 1;
    cam.far = 40;
    cam.updateProjectionMatrix();
    light.shadow.bias = -0.0005;
    light.shadow.normalBias = 0.02;
  }, [shadows]);

  return (
    <>
      <ambientLight intensity={0.55} color="#7a6656" />
      <hemisphereLight args={["#4a3038", "#050505", 0.6]} />
      {/* "sol" cálido de atardecer */}
      <directionalLight ref={sun} position={[-6, 11, 7]} intensity={1.9} color="#ffd6a3" castShadow={shadows} />
      {/* resplandor dorado de la fachada */}
      <pointLight position={[-1.85, 1.6, 3.6]} color="#e8c27a" intensity={4} distance={6} decay={2} />
    </>
  );
}

type OrbitControlsRef = ComponentRef<typeof OrbitControls>;

function Scene({ perf }: { perf: PerfProfile }) {
  const controls = useRef<OrbitControlsRef>(null);

  /**
   * OrbitControls fija `touch-action: none` en el canvas al conectar, lo que secuestraría el scroll
   * vertical en móvil. Lo sustituimos por `pan-y`: el navegador conserva el scroll vertical y los
   * arrastres horizontales llegan a los controles para girar el mapa. Este efecto vive en el padre
   * de <OrbitControls>, así que corre DESPUÉS de que los controles se conecten.
   */
  useEffect(() => {
    const apply = () => {
      const el = controls.current?.domElement;
      if (el instanceof HTMLElement) el.style.touchAction = "pan-y";
    };
    apply();
    const raf = window.requestAnimationFrame(apply);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <color attach="background" args={[PALETTE.background]} />
      <fog attach="fog" args={[PALETTE.background, 11, 23]} />

      <Lights shadows={perf.shadows} />
      <Ground shadows={perf.shadows} />
      <Streets />
      <Buildings shadows={perf.shadows} />
      <Cathedral shadows={perf.shadows} />
      <TixolaSign />
      <Pin position={PIN_POSITION} shadows={perf.shadows} />
      <Labels />

      <OrbitControls
        ref={controls}
        makeDefault
        target={ORBIT_TARGET}
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.55}
        autoRotate={!perf.reducedMotion}
        autoRotateSpeed={0.7}
        minPolarAngle={0.8}
        maxPolarAngle={1.22}
      />

      {perf.postprocessing && (
        <EffectComposer multisampling={4} enableNormalPass={false}>
          <Bloom mipmapBlur intensity={0.65} luminanceThreshold={0.72} luminanceSmoothing={0.25} radius={0.7} />
        </EffectComposer>
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   Componente público
   ──────────────────────────────────────────────────────────── */
export interface CityMap3DProps {
  /** Perfil de rendimiento (decide DPR, sombras y bloom). En tier "low" no se renderiza nada. */
  perf: PerfProfile;
  /** `false` congela el bucle de render (tarjeta fuera de pantalla). */
  active?: boolean;
  /** Se llama cuando el contexto WebGL está listo (el padre desvanece su fallback). */
  onReady?: () => void;
  className?: string;
}

export default function CityMap3D({ perf, active = true, onReady, className }: CityMap3DProps) {
  if (perf.tier === "low") return null;

  return (
    <div
      className={className}
      role="img"
      aria-label="Mapa 3D estilizado de la Rúa Juan de Austria con la Catedral de Ourense y la ubicación de Tixola Tapería"
    >
      <Canvas
        dpr={perf.dpr}
        shadows={perf.shadows ? "soft" : false}
        frameloop={active ? "always" : "never"}
        camera={{ position: CAMERA_POSITION, fov: 30, near: 0.5, far: 60 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
          onReady?.();
        }}
        style={{ touchAction: "pan-y" }}
      >
        <Scene perf={perf} />
      </Canvas>
    </div>
  );
}
