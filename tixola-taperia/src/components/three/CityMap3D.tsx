"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useEffect, useLayoutEffect, useMemo, useRef, type ComponentRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { PerfProfile } from "@/hooks/usePerformanceTier";

/**
 * CityMap3D — maqueta 3D low-poly de la manzana real de Tixola (Rúa Juan de Austria 7, Ourense).
 *
 * Geografía (aproximada, en metros; Tixola en el origen, x = este, z = sur):
 *  · Rúa Juan de Austria: calle peatonal estrecha de granito que discurre NNE–SSO (girada 20°).
 *    Tixola está en la acera oeste, con la terraza a pie de calle frente a la puerta.
 *  · Catedral de San Martiño (~60–90 m al NE): nave románica de 85×25 m orientada E–O, crucero,
 *    cimborrio octogonal sobre el crucero, ábside al este y torre de 40 m en el lado suroeste.
 *    Praza do Trigo entre el final de la calle y el flanco sur de la Catedral.
 *  · Iglesia de Santa Eufemia (~60 m al SO): barroca, dos torres con remates bulbosos y fachada
 *    cóncava mirando al NE, hacia la Praza da Magdalena (con su cruceiro) y la terraza de Tixola.
 *  · Casco histórico: ~45 manzanas de casas de granito de 3–4 plantas (10–14 m) en tonos hierro
 *    y burdeos, sobre zócalos que dejan las calles "rehundidas" y más claras.
 *
 * Render: suelo con textura procedural de granito (CanvasTexture), manzanas fusionadas en UNA
 * geometría con color por vértice + UNA geometría de aristas crema (EdgesGeometry); ídem para la
 * Catedral, Santa Eufemia, Tixola y la terraza. Ventanas instanciadas (doradas HDR en la Catedral
 * para el bloom). Chincheta roja animada con anillos que pulsan sobre el suelo. ≈ 24 draw calls.
 * En tier "low" no renderiza nada: el padre muestra la foto real.
 */

/* ────────────────────────────────────────────────────────────
   Paleta
   ──────────────────────────────────────────────────────────── */
const PALETTE = {
  background: "#0c0b0d",
  street: "#2c2927",
  plaza: "#332f2c",
  plinth: "#201e1d",
  cream: "#f9f6f0",
  stone: "#6b5b49",
  stoneRoof: "#4a3f34",
  slate: "#2a272b",
  church: "#8c8172",
  churchRoof: "#4d453d",
  tixola: "#5a1b21",
  tixolaRoof: "#3a1116",
  table: "#d9d0bf",
  iron: "#1b1b1d",
  parasol: "#b21e27",
  tones: ["#2b2a2e", "#323036", "#27262a", "#36333a", "#2e2b31", "#26242a", "#3a2b2e", "#332427"],
  roofs: ["#3a2622", "#2f2624", "#35292a", "#2b2222"],
} as const;

/** Colores HDR (> 1.0) para que el bloom los capte; `toneMapped={false}` en sus materiales. */
const GOLD_HDR = new THREE.Color("#e8c27a").multiplyScalar(1.9);
const PIMENTON_HDR = new THREE.Color("#d8323c").multiplyScalar(2.3);
const AMBER_WINDOW = new THREE.Color("#d9a15a");

/** Cámara isométrica (unidades = metros). */
const CAMERA_POSITION: [number, number, number] = [125, 115, 125];
const ORBIT_TARGET: [number, number, number] = [8, 6, -8];

/* ────────────────────────────────────────────────────────────
   Sistema de coordenadas de la calle
   u = a lo largo de Rúa Juan de Austria (positivo hacia el NNE), v = a través (positivo hacia el ESE).
   ──────────────────────────────────────────────────────────── */
const STREET_ANGLE = THREE.MathUtils.degToRad(20);
const SIN = Math.sin(STREET_ANGLE);
const COS = Math.cos(STREET_ANGLE);
/** Rotación Y que lleva las coordenadas (u, y, v) a mundo (x, y, z). */
const STREET_ROT_Y = Math.PI / 2 - STREET_ANGLE;

/** (u, v) en coordenadas de calle → (x, z) en mundo. */
function uv(u: number, v: number): [number, number] {
  return [u * SIN + v * COS, -u * COS + v * SIN];
}

/** Hash determinista en [0,1): mismas alturas/ventanas en cada render. */
function hash(a: number, b: number, c: number) {
  const x = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453;
  return x - Math.floor(x);
}

/* ────────────────────────────────────────────────────────────
   Utilidades de geometría
   ──────────────────────────────────────────────────────────── */
interface Part {
  geometry: THREE.BufferGeometry;
  color: string;
}

/** Traslada (y opcionalmente rota en Y) una geometría en coordenadas de mundo. */
function place(geometry: THREE.BufferGeometry, x: number, y: number, z: number, rotY = 0) {
  if (rotY) geometry.rotateY(rotY);
  geometry.translate(x, y, z);
  return geometry;
}

/** Coloca una geometría definida en coordenadas de calle (u, y, v) y la gira al mundo. */
function placeStreet(geometry: THREE.BufferGeometry, u: number, y: number, v: number) {
  geometry.translate(u, y, v);
  geometry.rotateY(STREET_ROT_Y);
  return geometry;
}

/** Prisma triangular (tejado a dos aguas): anchura en x, extruido a lo largo de +z desde z = 0. */
function gableRoof(width: number, height: number, length: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(0, height);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false });
}

/** Tejado a dos aguas con la cumbrera a lo largo de x (de x0 a x0 + length), centrado en z. */
function ridgeRoofX(width: number, height: number, length: number) {
  return gableRoof(width, height, length).rotateY(Math.PI / 2); // (x,y,z) → (z,y,-x): extrusión a +x
}

/** Fusiona piezas en UNA geometría con color por vértice (1 draw call). Las piezas originales se liberan. */
function mergeParts(parts: Part[]): THREE.BufferGeometry {
  const color = new THREE.Color();
  const pieces = parts.map((part) => {
    const g = part.geometry.index ? part.geometry.toNonIndexed() : part.geometry;
    if (g !== part.geometry) part.geometry.dispose();
    g.deleteAttribute("uv");
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
  return solid;
}

/** `mergeParts` + geometría de aristas (trazo crema) por encima de `edgeThreshold` grados. */
function buildMerged(parts: Part[], edgeThreshold = 32) {
  const solid = mergeParts(parts);
  const edges = new THREE.EdgesGeometry(solid, edgeThreshold);
  return { solid, edges };
}

/* ────────────────────────────────────────────────────────────
   Trazado urbano: manzanas
   ──────────────────────────────────────────────────────────── */
interface Block {
  /** marco de referencia: calle (u, v) o mundo (x, z) */
  frame: "street" | "world";
  u: number;
  v: number;
  w: number;
  d: number;
  h: number;
  tone: string;
  roof: string;
  /** lado (en v) que mira a la calle: ahí van las ventanas */
  face: 1 | -1;
}

interface RowSpec {
  v: number;
  d: number;
  face: 1 | -1;
  from: number;
  to: number;
  /** huecos [desde, hasta] en u: travesías, plazas, Tixola */
  gaps?: ReadonlyArray<readonly [number, number]>;
  width: readonly [number, number];
  height: readonly [number, number];
  seed: number;
  frame?: "street" | "world";
}

/** Rellena una hilera de fachadas con manzanas de anchura y altura variables (determinista). */
function fillRow(spec: RowSpec): Block[] {
  const blocks: Block[] = [];
  const frame = spec.frame ?? "street";
  let u = spec.from;
  let i = 0;
  const make = (start: number, w: number): Block => {
    const r = hash(spec.seed, i, 3);
    return {
      frame,
      u: start + w / 2,
      v: spec.v,
      w,
      d: spec.d,
      h: spec.height[0] + hash(spec.seed, i, 2) * (spec.height[1] - spec.height[0]),
      tone: PALETTE.tones[Math.floor(r * PALETTE.tones.length)],
      roof: PALETTE.roofs[Math.floor(hash(spec.seed, i, 4) * PALETTE.roofs.length)],
      face: spec.face,
    };
  };
  while (u < spec.to - 4) {
    let w = spec.width[0] + hash(spec.seed, i, 1) * (spec.width[1] - spec.width[0]);
    if (u + w > spec.to) w = spec.to - u;
    const end = u + w;
    const gap = spec.gaps?.find(([a, b]) => u < b && end > a);
    if (gap) {
      if (gap[0] - u >= 6) blocks.push(make(u, gap[0] - u));
      u = gap[1];
      i++;
      continue;
    }
    blocks.push(make(u, w));
    u = end;
    i++;
  }
  return blocks;
}

/** Travesías que cruzan la calle (en u) y hueco de la Praza da Magdalena al sur. */
const CROSS_SOUTH: readonly [number, number] = [-31, -25];
const CROSS_NORTH: readonly [number, number] = [27, 33];
const TIXOLA_GAP: readonly [number, number] = [-6, 6];

/** Tixola: acera oeste, fachada hacia +v (la calle), puerta en el origen. */
const TIXOLA: Block = { frame: "street", u: 0, v: -2.5, w: 11, d: 12, h: 11.5, tone: PALETTE.tixola, roof: PALETTE.tixolaRoof, face: 1 };

const ROWS: readonly RowSpec[] = [
  // Acera oeste (la de Tixola), desde la Praza da Magdalena hasta la Praza do Trigo
  { v: -2.5, d: 12, face: 1, from: -13, to: 42, gaps: [TIXOLA_GAP, CROSS_NORTH], width: [8, 13], height: [10, 14], seed: 1 },
  // Segunda y tercera hilera al oeste (calle trasera en v ≈ -23.5)
  { v: -15.5, d: 12, face: -1, from: -13, to: 42, gaps: [CROSS_NORTH], width: [9, 14], height: [10, 13], seed: 2 },
  { v: -32, d: 12, face: 1, from: -13, to: 42, gaps: [CROSS_NORTH], width: [12, 20], height: [10, 13], seed: 3 },
  // Sur, detrás de Santa Eufemia
  { v: -2.5, d: 12, face: 1, from: -104, to: -82, width: [10, 12], height: [10, 12], seed: 4 },
  { v: -15.5, d: 12, face: -1, from: -104, to: -82, width: [10, 12], height: [10, 13], seed: 5 },
  // Acera este de Rúa Juan de Austria
  { v: 14.25, d: 11.5, face: -1, from: -70, to: 40, gaps: [CROSS_SOUTH, CROSS_NORTH], width: [8, 13], height: [10, 14], seed: 6 },
  // Hileras hacia el este (calles en v ≈ 22.5 y 39)
  { v: 30.75, d: 11.5, face: -1, from: -70, to: 56, gaps: [CROSS_SOUTH, CROSS_NORTH], width: [11, 17], height: [10, 13], seed: 7 },
  { v: 47.25, d: 11.5, face: -1, from: -70, to: 56, gaps: [CROSS_SOUTH, CROSS_NORTH], width: [14, 22], height: [10, 13], seed: 8 },
  { v: 63, d: 12, face: -1, from: -70, to: 50, gaps: [CROSS_SOUTH, CROSS_NORTH], width: [16, 24], height: [10, 12], seed: 9 },
  // Norte de la Catedral (alineadas E–O, en coordenadas de mundo)
  { frame: "world", v: -97, d: 14, face: 1, from: 12, to: 112, width: [16, 24], height: [10, 13], seed: 10 },
  // Este del ábside
  { frame: "world", v: -66, d: 16, face: -1, from: 118, to: 150, width: [14, 18], height: [10, 12], seed: 11 },
];

const BLOCKS: readonly Block[] = ROWS.flatMap(fillRow);

/** Geometría (caja + zócalo + tejado) de una manzana, ya en coordenadas de mundo. */
function blockParts(b: Block): Part[] {
  const put = (g: THREE.BufferGeometry, y: number) => (b.frame === "street" ? placeStreet(g, b.u, y, b.v) : place(g, b.u, y, b.v));
  const roof = ridgeRoofX(b.d, 2.2, b.w).translate(-b.w / 2, 0, 0);
  return [
    { geometry: put(new THREE.BoxGeometry(b.w, b.h, b.d), b.h / 2), color: b.tone },
    { geometry: put(new THREE.BoxGeometry(b.w + 1.4, 0.5, b.d + 1.4), 0.25), color: PALETTE.plinth },
    { geometry: put(roof, b.h), color: b.roof },
  ];
}

/* ────────────────────────────────────────────────────────────
   Ventanas instanciadas
   ──────────────────────────────────────────────────────────── */
interface WindowSpec {
  position: [number, number, number];
  rotationY: number;
  /** multiplicador de brillo (0–1) */
  intensity: number;
  scale?: [number, number];
}

/** Ventanas ámbar en la fachada que da a la calle de cada manzana (≈ 55 % encendidas). */
function buildingWindows(blocks: readonly Block[], allLit = false): WindowSpec[] {
  const specs: WindowSpec[] = [];
  const step = 2.6;
  blocks.forEach((b, bi) => {
    const rows = b.h >= 12 ? [0.32, 0.56, 0.8] : [0.36, 0.7];
    const n = Math.max(1, Math.floor((b.w - 1.5) / step));
    const vFace = b.v + b.face * (b.d / 2 + 0.06);
    // normal de la fachada: +v → (cos θ, sin θ); un plano mira a +z, así que gira π/2 − θ (y π más para −v)
    const rotationY = b.frame === "street" ? STREET_ROT_Y + (b.face === 1 ? 0 : Math.PI) : b.face === 1 ? 0 : Math.PI;
    for (let k = 0; k < n; k++) {
      const offset = (k - (n - 1) / 2) * step;
      rows.forEach((row, ri) => {
        if (!allLit && hash(bi, k, ri) > 0.55) return;
        const y = b.h * row;
        const [x, z] = b.frame === "street" ? uv(b.u + offset, vFace) : [b.u + offset, vFace];
        specs.push({ position: [x, y, z], rotationY, intensity: 0.35 + hash(ri, bi, k) * 0.65 });
      });
    }
  });
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
   Suelo de granito (textura procedural) y calles
   ──────────────────────────────────────────────────────────── */
function makeGraniteTexture(anisotropy: number): THREE.CanvasTexture | null {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#151312";
  ctx.fillRect(0, 0, size, size);

  // losas de granito a matajunta (hiladas alternas desplazadas medio módulo)
  const cols = 9;
  const cell = size / cols;
  for (let j = 0; j < cols; j++) {
    const shift = j % 2 === 0 ? 0 : cell / 2;
    for (let i = -1; i <= cols; i++) {
      const tone = 27 + Math.floor(hash(i, j, 7) * 9);
      ctx.fillStyle = `rgb(${tone + 3}, ${tone + 1}, ${tone - 1})`;
      ctx.fillRect(i * cell + shift + 1.5, j * cell + 1.5, cell - 3, cell - 3);
    }
  }
  // moteado del granito
  for (let n = 0; n < 5000; n++) {
    const x = hash(n, 1, 11) * size;
    const y = hash(n, 2, 13) * size;
    const light = hash(n, 3, 17) > 0.5;
    ctx.fillStyle = light ? "rgba(249,246,240,0.09)" : "rgba(0,0,0,0.28)";
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10);
  texture.anisotropy = anisotropy;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Ground({ shadows }: { shadows: boolean }) {
  const gl = useThree((s) => s.gl);
  const texture = useMemo(() => makeGraniteTexture(Math.min(8, gl.capabilities.getMaxAnisotropy())), [gl]);

  useEffect(() => () => texture?.dispose(), [texture]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={shadows}>
      <circleGeometry args={[160, 72]} />
      {texture ? (
        <meshStandardMaterial map={texture} color="#d8d2c8" roughness={0.96} metalness={0.02} />
      ) : (
        <meshStandardMaterial color="#1c1a19" roughness={0.96} />
      )}
    </mesh>
  );
}

/** Calles y plazas: planos ligeramente elevados sobre el suelo, más claros (las manzanas van sobre zócalos). */
function Streets({ shadows }: { shadows: boolean }) {
  const solid = useMemo(() => {
    const plane = (w: number, d: number) => new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2);
    const parts: Part[] = [
      // Rúa Juan de Austria (5 m) de la Praza da Magdalena a la Praza do Trigo
      { geometry: placeStreet(plane(120, 5), -18, 0.05, 6), color: PALETTE.street },
      // travesías
      { geometry: placeStreet(plane(6, 66), -28, 0.05, 36), color: PALETTE.street },
      { geometry: placeStreet(plane(6, 110), 30, 0.05, 16), color: PALETTE.street },
      // calles paralelas
      { geometry: placeStreet(plane(60, 5), 14.5, 0.05, -23.5), color: PALETTE.street },
      { geometry: placeStreet(plane(130, 5), -7, 0.05, 22.5), color: PALETTE.street },
      { geometry: placeStreet(plane(130, 5), -7, 0.05, 39), color: PALETTE.street },
      { geometry: placeStreet(plane(126, 5), -10, 0.05, 55.5), color: PALETTE.street },
      // flanco sur y norte de la Catedral (alineados E–O)
      { geometry: place(plane(110, 6), 62, 0.05, -49.5), color: PALETTE.street },
      { geometry: place(plane(140, 6), 76, 0.05, -85), color: PALETTE.street },
      // Praza do Trigo (entre el final de la calle y la Catedral) con su fuente
      { geometry: placeStreet(plane(20, 32), 51, 0.07, 5), color: PALETTE.plaza },
      // Praza da Magdalena (círculo) y su unión con la calle
      { geometry: place(new THREE.CircleGeometry(12.5, 40).rotateX(-Math.PI / 2), -20, 0.07, 20), color: PALETTE.plaza },
      { geometry: placeStreet(plane(18, 12), -24, 0.07, 2), color: PALETTE.plaza },
    ];
    return mergeParts(parts);
  }, []);

  useEffect(() => () => solid.dispose(), [solid]);

  return (
    <mesh geometry={solid} receiveShadow={shadows}>
      <meshStandardMaterial vertexColors roughness={1} metalness={0} />
    </mesh>
  );
}

/** Cruceiro de la Praza da Magdalena y fuente de la Praza do Trigo. */
function Landmarks() {
  const { solid, edges } = useMemo(() => {
    const [fx, fz] = uv(51, 5);
    const parts: Part[] = [
      // cruceiro: gradas + fuste + cruz
      { geometry: place(new THREE.CylinderGeometry(2.4, 2.8, 0.9, 10), -20, 0.45, 20), color: PALETTE.stone },
      { geometry: place(new THREE.BoxGeometry(0.6, 5.2, 0.6), -20, 3.5, 20), color: PALETTE.stone },
      { geometry: place(new THREE.BoxGeometry(1.8, 0.4, 0.4), -20, 5.6, 20), color: PALETTE.stone },
      { geometry: place(new THREE.BoxGeometry(0.4, 1.6, 0.4), -20, 6.2, 20), color: PALETTE.stone },
      // fuente
      { geometry: place(new THREE.CylinderGeometry(3, 3.2, 0.8, 16), fx, 0.4, fz), color: PALETTE.stone },
      { geometry: place(new THREE.CylinderGeometry(0.5, 0.7, 2.4, 8), fx, 1.6, fz), color: PALETTE.stone },
    ];
    return buildMerged(parts, 40);
  }, []);

  useEffect(
    () => () => {
      solid.dispose();
      edges.dispose();
    },
    [solid, edges],
  );

  return (
    <group>
      <mesh geometry={solid}>
        <meshStandardMaterial vertexColors roughness={0.9} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={PALETTE.cream} transparent opacity={0.3} />
      </lineSegments>
    </group>
  );
}

/* ────────────────────────────────────────────────────────────
   Manzanas del casco histórico
   ──────────────────────────────────────────────────────────── */
function Buildings({ shadows }: { shadows: boolean }) {
  const { solid, edges } = useMemo(() => buildMerged(BLOCKS.flatMap(blockParts)), []);
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
        <meshStandardMaterial vertexColors roughness={0.86} metalness={0.16} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={PALETTE.cream} transparent opacity={0.34} />
      </lineSegments>
      <Windows specs={windows} size={[1.1, 1.7]} color={AMBER_WINDOW} />
    </group>
  );
}

/* ────────────────────────────────────────────────────────────
   Catedral de San Martiño (coordenadas de mundo, nave E–O)
   ──────────────────────────────────────────────────────────── */
const CATHEDRAL = {
  cx: 62,
  cz: -66,
  naveLength: 85,
  naveWidth: 25,
  naveHeight: 22,
  crossingX: 78,
  towerX: 14,
  towerZ: -59.5,
} as const;

function cathedralWindows(): WindowSpec[] {
  const { cx, cz, naveLength, naveWidth, crossingX, towerX, towerZ } = CATHEDRAL;
  const specs: WindowSpec[] = [];
  const south = cz + naveWidth / 2 + 0.08;
  const north = cz - naveWidth / 2 - 0.08;
  // ventanales de la nave (evitando el crucero)
  for (let x = cx - naveLength / 2 + 8; x < cx + naveLength / 2 - 6; x += 9) {
    if (Math.abs(x - crossingX) < 9) continue;
    specs.push({ position: [x, 13, south], rotationY: 0, intensity: 1 });
    specs.push({ position: [x, 13, north], rotationY: Math.PI, intensity: 1 });
  }
  // rosetones de los brazos del crucero
  specs.push({ position: [crossingX, 14, cz + 23.6], rotationY: 0, intensity: 1, scale: [3.2, 2.2] });
  specs.push({ position: [crossingX, 14, cz - 23.6], rotationY: Math.PI, intensity: 1, scale: [3.2, 2.2] });
  // vanos del campanario (dos hileras, cuatro caras)
  const half = 5.5 + 0.08;
  for (const y of [26, 33]) {
    specs.push({ position: [towerX, y, towerZ + half], rotationY: 0, intensity: 1, scale: [1.3, 1.6] });
    specs.push({ position: [towerX, y, towerZ - half], rotationY: Math.PI, intensity: 1, scale: [1.3, 1.6] });
    specs.push({ position: [towerX + half, y, towerZ], rotationY: Math.PI / 2, intensity: 1, scale: [1.3, 1.6] });
    specs.push({ position: [towerX - half, y, towerZ], rotationY: -Math.PI / 2, intensity: 1, scale: [1.3, 1.6] });
  }
  return specs;
}

function Cathedral({ shadows }: { shadows: boolean }) {
  const { solid, edges } = useMemo(() => {
    const { cx, cz, naveLength, naveWidth, naveHeight, crossingX, towerX, towerZ } = CATHEDRAL;
    const west = cx - naveLength / 2;
    const east = cx + naveLength / 2;
    const parts: Part[] = [
      // nave
      { geometry: place(new THREE.BoxGeometry(naveLength, naveHeight, naveWidth), cx, naveHeight / 2, cz), color: PALETTE.stone },
      { geometry: place(ridgeRoofX(naveWidth + 1, 6.5, naveLength), west, naveHeight, cz), color: PALETTE.stoneRoof },
      // crucero (N–S)
      { geometry: place(new THREE.BoxGeometry(14, 20, 47), crossingX, 10, cz), color: PALETTE.stone },
      { geometry: place(gableRoof(15, 4.5, 47), crossingX, 20, cz - 23.5), color: PALETTE.stoneRoof },
      // cimborrio octogonal sobre el crucero
      { geometry: place(new THREE.CylinderGeometry(7.2, 7.2, 9, 8), crossingX, naveHeight + 6.5 + 4.5, cz, Math.PI / 8), color: PALETTE.stone },
      { geometry: place(new THREE.ConeGeometry(7.8, 6, 8), crossingX, naveHeight + 6.5 + 9 + 3, cz, Math.PI / 8), color: PALETTE.slate },
      // ábside (medio cilindro hacia el este) con su cubierta
      { geometry: place(new THREE.CylinderGeometry(12.5, 12.5, 18, 16, 1, false, 0, Math.PI), east, 9, cz), color: PALETTE.stone },
      { geometry: place(new THREE.ConeGeometry(13, 5, 16, 1, false, 0, Math.PI), east, 20.5, cz), color: PALETTE.stoneRoof },
      // capillas absidales
      { geometry: place(new THREE.CylinderGeometry(4, 4, 9, 10, 1, false, 0, Math.PI), east + 9, 4.5, cz - 9), color: PALETTE.stone },
      { geometry: place(new THREE.CylinderGeometry(4, 4, 9, 10, 1, false, 0, Math.PI), east + 9, 4.5, cz + 9), color: PALETTE.stone },
      // torre de las campanas (s. XII), esquina suroeste, 40 m
      { geometry: place(new THREE.BoxGeometry(11, 40, 11), towerX, 20, towerZ), color: PALETTE.stone },
      { geometry: place(new THREE.ConeGeometry(7.9, 6, 4), towerX, 43, towerZ, Math.PI / 4), color: PALETTE.slate },
      // contrafuertes del flanco sur
      ...[-30, -15, 15, 30].map((dx) => ({
        geometry: place(new THREE.BoxGeometry(2, 14, 2.5), cx + dx, 7, cz + naveWidth / 2 + 1.2),
        color: PALETTE.stone,
      })),
    ];
    return buildMerged(parts, 32);
  }, []);
  const windows = useMemo(() => cathedralWindows(), []);

  useEffect(
    () => () => {
      solid.dispose();
      edges.dispose();
    },
    [solid, edges],
  );

  const { cx, cz, naveLength } = CATHEDRAL;
  const westFace = cx - naveLength / 2 - 0.1;
  /* La torre ocupa la mitad sur de la fachada oeste: rosetón y portada van en la mitad norte. */
  const portalZ = cz - 6;

  return (
    <group>
      <mesh geometry={solid} castShadow={shadows} receiveShadow={shadows}>
        <meshStandardMaterial vertexColors roughness={0.9} metalness={0.05} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={PALETTE.cream} transparent opacity={0.5} />
      </lineSegments>

      {/* rosetón de la fachada oeste (Pórtico del Paraíso): anillo dorado + vidriera */}
      <mesh position={[westFace, 15, portalZ]} rotation={[0, -Math.PI / 2, 0]}>
        <torusGeometry args={[3.4, 0.45, 10, 40]} />
        <meshBasicMaterial color={GOLD_HDR} toneMapped={false} />
      </mesh>
      <mesh position={[westFace + 0.05, 15, portalZ]} rotation={[0, -Math.PI / 2, 0]}>
        <circleGeometry args={[3, 32]} />
        <meshBasicMaterial color="#8a6a32" toneMapped={false} />
      </mesh>
      {/* portada oeste */}
      <mesh position={[westFace, 4, portalZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[5, 8]} />
        <meshStandardMaterial color="#2b1a12" roughness={0.9} />
      </mesh>

      <Windows specs={windows} size={[1.4, 4.5]} color={GOLD_HDR} />
      {/* resplandor dorado de la piedra (intensidad en candelas: la escena está en metros) */}
      <pointLight position={[cx - 20, 18, cz + 22]} color="#e8c27a" intensity={700} distance={80} decay={2} />
    </group>
  );
}

/* ────────────────────────────────────────────────────────────
   Santa Eufemia (barroca: dos torres, fachada cóncava mirando al NE)
   ──────────────────────────────────────────────────────────── */
const CHURCH_CENTER: [number, number] = [-44, 44];
const CHURCH_ROT_Y = (3 * Math.PI) / 4; // +z local → NE

function SantaEufemia({ shadows }: { shadows: boolean }) {
  const { solid, edges } = useMemo(() => {
    const [cx, cz] = CHURCH_CENTER;
    const local = (g: THREE.BufferGeometry, x: number, y: number, z: number) => place(g.translate(x, y, z), cx, 0, cz, CHURCH_ROT_Y);
    // fachada cóncava: arco de cilindro con el centro por delante de la iglesia (se ve su cara interior)
    const concaveRadius = 10.5;
    const halfSpan = Math.asin(8 / concaveRadius);
    const towers = [-8, 8].flatMap((x) => [
      { geometry: local(new THREE.BoxGeometry(7, 34, 7), x, 17, 20), color: PALETTE.church },
      { geometry: local(new THREE.CylinderGeometry(2.4, 2.8, 4, 8), x, 36, 20), color: PALETTE.church },
      { geometry: local(new THREE.SphereGeometry(2.6, 12, 10), x, 39.2, 20), color: PALETTE.churchRoof },
    ]);
    const parts: Part[] = [
      // cuerpo de la nave y tejado
      { geometry: local(new THREE.BoxGeometry(22, 20, 40), 0, 10, -2), color: PALETTE.church },
      { geometry: local(gableRoof(23, 5.5, 40), 0, 20, -22), color: PALETTE.churchRoof },
      // cúpula sobre el crucero
      { geometry: local(new THREE.CylinderGeometry(6, 6, 4, 10), 0, 24.5, -8), color: PALETTE.church },
      { geometry: local(new THREE.SphereGeometry(6, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0, 26.5, -8), color: PALETTE.churchRoof },
      // fachada cóncava entre las torres
      {
        geometry: local(
          new THREE.CylinderGeometry(concaveRadius, concaveRadius, 26, 14, 1, true, Math.PI - halfSpan, halfSpan * 2),
          0,
          13,
          20 + 8,
        ),
        color: PALETTE.church,
      },
      ...towers,
    ];
    return buildMerged(parts, 34);
  }, []);

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
        <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.9} metalness={0.04} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={PALETTE.cream} transparent opacity={0.48} />
      </lineSegments>
      {/* luz cálida sobre la fachada */}
      <pointLight position={[CHURCH_CENTER[0] + 18, 16, CHURCH_CENTER[1] - 18]} color="#f0d9a8" intensity={420} distance={60} decay={2} />
    </group>
  );
}

/* ────────────────────────────────────────────────────────────
   Tixola: edificio resaltado, toldo rojo brillante, rótulo neón y terraza
   ──────────────────────────────────────────────────────────── */
const DOOR = uv(0, TIXOLA.v + TIXOLA.d / 2); // puerta, en el origen
const AWNING = uv(0, TIXOLA.v + TIXOLA.d / 2 + 0.05);

function TixolaBuilding({ shadows }: { shadows: boolean }) {
  const { solid, edges } = useMemo(() => buildMerged(blockParts(TIXOLA), 32), []);
  const windows = useMemo(() => buildingWindows([TIXOLA], true), []);

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
        <meshStandardMaterial vertexColors emissive="#7d131a" emissiveIntensity={0.35} roughness={0.8} metalness={0.15} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#ffb3b8" transparent opacity={0.7} />
      </lineSegments>
      <Windows specs={windows} size={[1.1, 1.7]} color={AMBER_WINDOW} />

      {/* toldo rojo brillante inclinado sobre la puerta + rótulo neón en la fachada */}
      <group position={[AWNING[0], 3.4, AWNING[1]]} rotation={[0, STREET_ROT_Y, 0]}>
        <mesh position={[0, 0, 1.15]} rotation={[-0.3, 0, 0]} castShadow={shadows}>
          <boxGeometry args={[8.5, 0.14, 2.4]} />
          <meshStandardMaterial color="#b21e27" emissive="#d8323c" emissiveIntensity={1.4} roughness={0.55} />
        </mesh>
        <mesh position={[0, 1.4, 0.02]}>
          <planeGeometry args={[5.2, 0.6]} />
          <meshBasicMaterial color={PIMENTON_HDR} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 2.2, 1.6]} color="#ff7a45" intensity={70} distance={24} decay={2} />
      </group>
    </group>
  );
}

/** Terraza: tres mesitas redondas con sillas y sombrillas pimentón frente a la puerta. */
function Terrace({ shadows }: { shadows: boolean }) {
  const solid = useMemo(() => {
    const parts: Part[] = [];
    const v = TIXOLA.v + TIXOLA.d / 2 + 2.4;
    for (const u of [-3.2, 0, 3.2]) {
      parts.push({ geometry: placeStreet(new THREE.CylinderGeometry(0.6, 0.6, 0.06, 14), u, 0.78, v), color: PALETTE.table });
      parts.push({ geometry: placeStreet(new THREE.CylinderGeometry(0.05, 0.08, 0.75, 6), u, 0.4, v), color: PALETTE.iron });
      for (const dv of [-0.95, 0.95]) {
        parts.push({ geometry: placeStreet(new THREE.BoxGeometry(0.42, 0.44, 0.42), u, 0.45, v + dv), color: PALETTE.iron });
      }
      parts.push({ geometry: placeStreet(new THREE.CylinderGeometry(0.04, 0.04, 2.3, 6), u, 1.15, v), color: PALETTE.iron });
      parts.push({ geometry: placeStreet(new THREE.ConeGeometry(1.35, 0.45, 8), u, 2.35, v), color: PALETTE.parasol });
    }
    return mergeParts(parts);
  }, []);

  useEffect(() => () => solid.dispose(), [solid]);

  return (
    <mesh geometry={solid} castShadow={shadows}>
      <meshStandardMaterial vertexColors roughness={0.7} metalness={0.2} />
    </mesh>
  );
}

/* ────────────────────────────────────────────────────────────
   Chincheta animada sobre la puerta de Tixola
   ──────────────────────────────────────────────────────────── */
function pulseRing(mesh: THREE.Mesh | null, material: THREE.MeshBasicMaterial | null, phase: number) {
  if (!mesh || !material) return;
  const s = 0.35 + phase * 2.4;
  mesh.scale.set(s, s, 1);
  material.opacity = (1 - phase) * 0.85;
}

function Pin({ shadows, animate }: { shadows: boolean; animate: boolean }) {
  const body = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const matA = useRef<THREE.MeshBasicMaterial>(null);
  const matB = useRef<THREE.MeshBasicMaterial>(null);
  const light = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!animate) return;
    const t = clock.getElapsedTime();
    const g = body.current;
    if (g) {
      g.position.y = 15 + Math.sin(t * 2.1) * 0.8;
      g.rotation.y = t * 0.8;
    }
    pulseRing(ringA.current, matA.current, (t * 0.6) % 1);
    pulseRing(ringB.current, matB.current, (t * 0.6 + 0.5) % 1);
    if (light.current) light.current.intensity = 900 + Math.sin(t * 2.1) * 300;
  });

  return (
    <group position={[DOOR[0] + 1.2, 0, DOOR[1] + 1.2]}>
      <group ref={body} position={[0, 15, 0]}>
        {/* cono invertido (punta abajo) */}
        <mesh position={[0, 2.6, 0]} rotation={[Math.PI, 0, 0]} castShadow={shadows}>
          <coneGeometry args={[1.7, 5.2, 24]} />
          <meshStandardMaterial color="#d8323c" emissive="#b21e27" emissiveIntensity={0.9} roughness={0.35} metalness={0.1} />
        </mesh>
        <mesh position={[0, 6.2, 0]} castShadow={shadows}>
          <sphereGeometry args={[2.3, 32, 24]} />
          <meshStandardMaterial color="#d8323c" emissive="#b21e27" emissiveIntensity={0.9} roughness={0.35} metalness={0.1} />
        </mesh>
        {/* "ojo" crema que gira con la chincheta */}
        <mesh position={[0, 6.2, 1.85]}>
          <sphereGeometry args={[0.75, 16, 12]} />
          <meshBasicMaterial color={PALETTE.cream} toneMapped={false} />
        </mesh>
      </group>

      <pointLight ref={light} position={[0, 20, 0]} color="#ff3b3b" intensity={900} distance={50} decay={2} />

      {/* anillos que pulsan sobre el suelo */}
      <mesh ref={ringA} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
        <ringGeometry args={[3, 3.7, 48]} />
        <meshBasicMaterial ref={matA} color="#d8323c" transparent toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh ref={ringB} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
        <ringGeometry args={[3, 3.7, 48]} />
        <meshBasicMaterial ref={matB} color="#d8323c" transparent toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ────────────────────────────────────────────────────────────
   Etiquetas HTML ancladas a la escena
   ──────────────────────────────────────────────────────────── */
export interface MapLabels {
  tixola: string;
  cathedral: string;
  church: string;
}

const LABEL_CLASS = "whitespace-nowrap rounded-full border px-2.5 py-1 font-caps text-[9px] uppercase tracking-[0.2em] backdrop-blur-md";

function Labels({ labels }: { labels: MapLabels }) {
  return (
    <>
      <Html position={[DOOR[0] + 1.2, 26, DOOR[1] + 1.2]} center pointerEvents="none" zIndexRange={[30, 20]}>
        <div className={`${LABEL_CLASS} border-pimenton-light/60 bg-iron-900/85 text-cream shadow-neon`}>{labels.tixola}</div>
      </Html>
      <Html position={[CATHEDRAL.cx, 48, CATHEDRAL.cz]} center pointerEvents="none" zIndexRange={[30, 20]}>
        <div className={`${LABEL_CLASS} hidden border-gold/40 bg-iron-900/70 text-gold sm:block`}>{labels.cathedral}</div>
      </Html>
      <Html position={[CHURCH_CENTER[0], 44, CHURCH_CENTER[1]]} center pointerEvents="none" zIndexRange={[30, 20]}>
        <div className={`${LABEL_CLASS} hidden border-cream/30 bg-iron-900/70 text-cream-200 sm:block`}>{labels.church}</div>
      </Html>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   Luces, controles y escena
   ──────────────────────────────────────────────────────────── */
function Lights({ shadows }: { shadows: boolean }) {
  const sun = useRef<THREE.DirectionalLight>(null);

  useEffect(() => {
    const light = sun.current;
    if (!light || !shadows) return;
    light.shadow.mapSize.set(2048, 2048);
    const cam = light.shadow.camera;
    cam.left = -170;
    cam.right = 170;
    cam.top = 170;
    cam.bottom = -170;
    cam.near = 10;
    cam.far = 520;
    cam.updateProjectionMatrix();
    light.shadow.bias = -0.0006;
    light.shadow.normalBias = 0.6;
  }, [shadows]);

  return (
    <>
      <ambientLight intensity={0.5} color="#7a6656" />
      <hemisphereLight args={["#4a3038", "#050505", 0.7]} />
      {/* "sol" cálido de atardecer, bajo, desde el oeste */}
      <directionalLight ref={sun} position={[-140, 110, 70]} intensity={2.1} color="#ffd2a0" castShadow={shadows} />
    </>
  );
}

type OrbitControlsRef = ComponentRef<typeof OrbitControls>;

function Scene({ perf, labels }: { perf: PerfProfile; labels: MapLabels }) {
  const controls = useRef<OrbitControlsRef>(null);

  /**
   * OrbitControls fija `touch-action: none` en el canvas al conectar, lo que secuestraría el scroll
   * vertical en móvil. Lo sustituimos por `pan-y`: el navegador conserva el scroll vertical y los
   * arrastres horizontales llegan a los controles para girar el mapa.
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
      <fog attach="fog" args={[PALETTE.background, 250, 380]} />

      <Lights shadows={perf.shadows} />
      <Ground shadows={perf.shadows} />
      <Streets shadows={perf.shadows} />
      <Landmarks />
      <Buildings shadows={perf.shadows} />
      <Cathedral shadows={perf.shadows} />
      <SantaEufemia shadows={perf.shadows} />
      <TixolaBuilding shadows={perf.shadows} />
      <Terrace shadows={perf.shadows} />
      <Pin shadows={perf.shadows} animate={!perf.reducedMotion} />
      <Labels labels={labels} />

      <OrbitControls
        ref={controls}
        makeDefault
        target={ORBIT_TARGET}
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.5}
        autoRotate={!perf.reducedMotion}
        autoRotateSpeed={0.4}
        minPolarAngle={0.9}
        maxPolarAngle={1.25}
      />

      {perf.postprocessing && (
        <EffectComposer multisampling={4} enableNormalPass={false}>
          <Bloom mipmapBlur intensity={0.6} luminanceThreshold={0.78} luminanceSmoothing={0.2} radius={0.65} />
          {/* Los materiales del composer son `toneMapped: false`: sin este pase, la versión con bloom
              (escritorio) saldría sin el ACES de `onCreated` y con las luces doradas reventadas,
              distinta de la de tabletas y móviles. */}
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
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
  /** Textos de las etiquetas ancladas (ya localizados). */
  labels: MapLabels;
  /** Descripción accesible del mapa (ya localizada). */
  ariaLabel: string;
  className?: string;
}

export default function CityMap3D({ perf, active = true, onReady, labels, ariaLabel, className }: CityMap3DProps) {
  if (perf.tier === "low") return null;

  return (
    <div className={className} role="img" aria-label={ariaLabel} style={{ touchAction: "pan-y" }}>
      <Canvas
        dpr={perf.dpr}
        shadows={perf.shadows ? "soft" : false}
        frameloop={active ? "always" : "never"}
        camera={{ position: CAMERA_POSITION, fov: 30, near: 5, far: 700 }}
        /* Con composer la escena se pinta en su render target (que ya pide MSAA): el búfer
           multimuestreado del lienzo no se usaría y solo gastaría memoria. */
        gl={{ antialias: !perf.postprocessing, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          onReady?.();
        }}
        style={{ touchAction: "pan-y" }}
      >
        <Scene perf={perf} labels={labels} />
      </Canvas>
    </div>
  );
}
