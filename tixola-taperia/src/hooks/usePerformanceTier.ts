"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";

/**
 * Presupuesto de rendimiento del sitio.
 *
 * El modelo es: heurística optimista al arrancar + medición real que SOLO puede bajar la gama.
 * Nunca sube sola, porque una gama que oscila obliga a montar y desmontar escena, desenfoques y
 * animaciones a mitad de scroll, y eso se ve peor que cualquier efecto que nos ahorremos.
 */

export type PerformanceTier = "low" | "mid" | "high";

/**
 * Catálogo de cosas caras. La pregunta que se hace un componente no es "¿qué gama soy?" sino
 * "¿me puedo permitir esto?": si el día de mañana el cristal baja a gama media, se cambia aquí
 * y no en los treinta y tantos ficheros que lo consultan.
 */
export type PerfFeature =
  /** Montar el Canvas de R3F (la portada 3D). */
  | "scene3d"
  /** Post-procesado: bloom. */
  | "postprocessing"
  /** Sombras en tiempo real. */
  | "shadows"
  /** Cristal real: `backdrop-filter`, que recompone todo lo que hay detrás. */
  | "glass"
  /** Desenfoques grandes (`blur-2xl` / `blur-3xl`) sobre capas amplias. */
  | "heavyBlur"
  /** Grano/ruido animado sobre el viewport. */
  | "grain"
  /** Scroll suavizado con Lenis. */
  | "smoothScroll"
  /** Capítulos cinematográficos: pin + scrub de GSAP. */
  | "scrollCinema"
  /** Parallax por puntero, giroscopio o scroll. */
  | "parallax"
  /** Bucles decorativos infinitos (marquesinas, flotaciones, brasas). */
  | "ambientMotion"
  /** Animaciones de entrada puntuales, que empiezan y terminan. */
  | "entranceMotion"
  /** Carrusel con transformaciones 3D y profundidad. */
  | "carousel3d";

export interface PerfProfile {
  tier: PerformanceTier;
  isMobile: boolean;
  isTouch: boolean;
  reducedMotion: boolean;
  /** El navegador pide ahorro de datos: gama baja sin discusión. */
  saveData: boolean;
  /** `true` cuando la gama ya viene de una medición real y no de la heurística inicial. */
  measured: boolean;
  /** Device pixel ratio máximo a usar en el Canvas */
  dpr: [number, number];
  /** Nº de partículas de brasa/humo */
  particles: number;
  /** Sombras en tiempo real */
  shadows: boolean;
  /** Post-procesado (bloom) */
  postprocessing: boolean;
  /** Nº de objetos flotantes (zamburiñas, perejil, gotas) */
  floaters: number;
  /** Atajo de `can("glass")`: cristal real frente a degradado prehorneado. */
  glass: boolean;
  /** Atajo de `can("heavyBlur")`. */
  heavyBlur: boolean;
  /** ¿La gama activa llega al menos a `min`? */
  atLeast: (min: PerformanceTier) => boolean;
  /** ¿Me puedo permitir esta característica con la gama activa? */
  can: (feature: PerfFeature) => boolean;
}

type TierBudget = Pick<PerfProfile, "dpr" | "particles" | "shadows" | "postprocessing" | "floaters">;

/**
 * Presupuestos por gama. Bajan respecto a la versión anterior (250 / 700 / 1600 partículas, dpr hasta
 * 2) porque el objetivo pasó a ser el portátil con gráfica integrada y el móvil de gama media: el coste
 * del dpr es cuadrático en píxeles, y de 2 a 1,75 se pintan un 23 % menos de fragmentos sin que en
 * pantalla se note.
 *
 * Las partículas NO se recortan tanto como en el primer intento (380 / 1100): ahí la columna de brasas
 * perdía densidad justo en la gama que este encargo viene a rescatar, y la brasa es el elemento de marca
 * de la portada. El recorte agresivo dejó de ser necesario cuando la sonda de fotogramas pasó a medir la
 * escena real: si estas cifras no caben en el equipo, la sonda baja de gama sola en los primeros dos
 * segundos, que es exactamente lo que el cliente pidió.
 * La gama "low" conserva cifras aunque no monte la escena: si algún día se reutiliza el presupuesto
 * en un fondo ligero, que no salga de cero.
 */
const PROFILES: Record<PerformanceTier, TierBudget> = {
  low: { dpr: [1, 1], particles: 140, shadows: false, postprocessing: false, floaters: 4 },
  mid: { dpr: [1, 1.25], particles: 520, shadows: false, postprocessing: false, floaters: 8 },
  high: { dpr: [1, 1.75], particles: 1280, shadows: true, postprocessing: true, floaters: 14 },
};

/** Gama mínima que exige cada característica. */
const FEATURE_MIN_TIER: Record<PerfFeature, PerformanceTier> = {
  scene3d: "mid",
  postprocessing: "high",
  shadows: "high",
  glass: "high",
  heavyBlur: "high",
  grain: "mid",
  smoothScroll: "mid",
  scrollCinema: "mid",
  parallax: "mid",
  ambientMotion: "mid",
  entranceMotion: "low",
  carousel3d: "mid",
};

/**
 * Características que son movimiento y, por tanto, `prefers-reduced-motion` apaga aunque la gama
 * diera de sobra. El cristal, el desenfoque y el grano NO están aquí: son caros, no son movimiento,
 * y quitarlos por accesibilidad cambiaría el diseño sin motivo.
 */
const MOTION_FEATURES: ReadonlySet<PerfFeature> = new Set<PerfFeature>([
  "scene3d",
  "smoothScroll",
  "scrollCinema",
  "parallax",
  "ambientMotion",
  "entranceMotion",
  "carousel3d",
]);

/** Por debajo de esto el dispositivo no sostiene la escena 3D: se apaga y queda el fallback. */
const FPS_FLOOR_3D = 30;
/** Por debajo de esto hay escena, pero sin sombras, sin bloom y sin cristal real. */
const FPS_FLOOR_HIGH = 48;

/* ──────────────────────────────────────────────────────────────
   Almacén (fuera de React: la gama es una sola por pestaña)
   ────────────────────────────────────────────────────────────── */

/**
 * Instantánea serializada `tier|isMobile|isTouch|reducedMotion|saveData|source` (0/1, y `h`/`m`
 * para heurística o medición). Se usa un string porque `useSyncExternalStore` compara snapshots
 * por identidad: un string es estable y el objeto de perfil se deriva de él con `useMemo`.
 */
type Snapshot = string;

/** Perfil "low" durante SSR/hidratación para no hidratar con efectos pesados. */
const SERVER_SNAPSHOT: Snapshot = "low|0|0|0|0|h";

interface DeviceFlags {
  isMobile: boolean;
  isTouch: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  /** Gama de partida antes de medir nada. */
  heuristic: PerformanceTier;
  /** `true` cuando la gama la fija una preferencia del usuario y medir no procede. */
  locked: boolean;
}

let device: DeviceFlags | null = null;
let activeTier: PerformanceTier = "low";
let measured = false;
let lastFps: number | null = null;
let snapshot: Snapshot = SERVER_SNAPSHOT;
let detected = false;
const listeners = new Set<() => void>();

const RANK: Record<PerformanceTier, number> = { low: 0, mid: 1, high: 2 };
/** Un escalón por debajo. Se usa para el ahorro de datos, que baja una gama y no hasta el suelo. */
const LOWER: Record<PerformanceTier, PerformanceTier> = { high: "mid", mid: "low", low: "low" };

function detectDevice(): DeviceFlags {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const saveData = nav.connection?.saveData ?? false;

  /* Movimiento reducido: preferencia explícita del usuario, manda sobre todo lo demás y ni se mide. */
  if (reducedMotion) {
    return { isMobile, isTouch, reducedMotion, saveData, heuristic: "low", locked: true };
  }

  /* Suelo duro: con 2 GB o 2 núcleos no hace falta medir nada, y montar la escena para medirla
     costaría más que el fallback entero. */
  if (memory <= 2 || cores <= 2) {
    return { isMobile, isTouch, reducedMotion, saveData, heuristic: "low", locked: true };
  }

  /* Heurística de partida DELIBERADAMENTE optimista: ya no tiene que acertar, solo no pasarse.
     Antes esta función era la única decisión y por eso llevaba excepciones para que los iPhone
     (que publican 4 núcleos y ninguna memoria) no se quedaran sin escena; el efecto lateral era
     que cualquier móvil flojo entraba también en "mid" y se quedaba ahí. Ahora la sonda corrige.
     Móvil arranca en "mid" y no en "high" porque el segundo de medición se pintaría con sombras
     y bloom: se notaría el tirón justo en la entrada, que es lo que se enseña al cliente. */
  const base: PerformanceTier = isMobile || isTouch ? "mid" : "high";

  /* Ahorro de datos: UN escalón, no el modo mínimo. Fijarlo en "low" con candado convertía una
     preferencia de RED en una sentencia sobre la POTENCIA del equipo y le servía la web plana —sin
     portada 3D, sin grano, sin parallax, sin capítulos— a un visitante de móvil cuyo único problema es
     el plan de datos. Un escalón abajo es lo que había antes de esta iteración y ya ahorra lo caro de
     descargar (el chunk del post-procesado y las texturas de gama alta). Sin candado: la sonda sigue
     pudiendo bajarlo más si de verdad el equipo no llega. */
  const heuristic: PerformanceTier = saveData ? LOWER[base] : base;
  return { isMobile, isTouch, reducedMotion, saveData, heuristic, locked: false };
}

function buildSnapshot(): Snapshot {
  const d = device;
  if (!d) return SERVER_SNAPSHOT;
  return [
    activeTier,
    d.isMobile ? 1 : 0,
    d.isTouch ? 1 : 0,
    d.reducedMotion ? 1 : 0,
    d.saveData ? 1 : 0,
    measured ? "m" : "h",
  ].join("|");
}

/**
 * Interruptor ÚNICO del cristal real: escribe `data-gpu="high"` en <html> y con él se reactivan los
 * `backdrop-filter` de `.glass`, `.glass-smoke`, `.glass-red` y de la banda de la cabecera
 * (`src/app/globals.css`). Sin esta línea el selector de la hoja era CSS muerto y el cristal no volvía
 * NUNCA, en ningún equipo: la decisión 2 del cliente ("el cristal real se reserva a gama alta") se
 * convertía en "el cristal real se elimina".
 *
 * Se exige gama alta Y MEDIDA. No basta la heurística optimista: mientras la sonda mide (los primeros
 * ~2 s, con la escena 3D a pleno rendimiento) es justo el peor momento para añadir una recomposición
 * del viewport por cada superficie de cristal, y en un portátil flojo el cristal se encendería para
 * apagarse acto seguido. Así solo lo ve el equipo que ha DEMOSTRADO que le sobra GPU, y lo ve una sola
 * vez: el almacén es un trinquete y la gama ya no vuelve a subir.
 */
function syncGlassSwitch(): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (measured && activeTier === "high") root.dataset.gpu = "high";
  else if (root.dataset.gpu) delete root.dataset.gpu;
}

/** Reconstruye la instantánea y avisa a React. Idempotente: si nada cambió, no notifica. */
function commit(): void {
  const next = buildSnapshot();
  syncGlassSwitch();
  renderDiagnostics();
  if (next === snapshot) return;
  snapshot = next;
  for (const listener of listeners) listener();
}

function ensureDetected(): void {
  if (detected) return;
  detected = true;
  device = detectDevice();
  activeTier = device.heuristic;
  snapshot = buildSnapshot();
}

function getSnapshot(): Snapshot {
  ensureDetected();
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/* ──────────────────────────────────────────────────────────────
   API imperativa (degradación en vivo)
   ────────────────────────────────────────────────────────────── */

/**
 * Baja la gama activa. Es un trinquete: si `tier` es igual o mejor que la actual no hace nada.
 * Devuelve la gama resultante. Útil también fuera de React (helpers de GSAP, callbacks de Three).
 */
export function demotePerformanceTier(tier: PerformanceTier): PerformanceTier {
  if (typeof window === "undefined") return tier;
  ensureDetected();
  if (RANK[tier] < RANK[activeTier]) {
    activeTier = tier;
    commit();
  }
  return activeTier;
}

/** Traduce unos FPS medidos al techo de gama que ese dispositivo se puede permitir. */
function tierForFrameRate(fps: number): PerformanceTier {
  if (fps < FPS_FLOOR_3D) return "low";
  if (fps < FPS_FLOOR_HIGH) return "mid";
  return "high";
}

/**
 * Entrega el resultado de una medición real: marca el perfil como medido y aplica el techo.
 * Devuelve la gama resultante.
 */
export function reportMeasuredFrameRate(fps: number): PerformanceTier {
  if (typeof window === "undefined") return activeTier;
  ensureDetected();
  lastFps = fps;
  measured = true;
  const cap = tierForFrameRate(fps);
  if (RANK[cap] < RANK[activeTier]) activeTier = cap;
  commit();
  return activeTier;
}

/* ──────────────────────────────────────────────────────────────
   Perfil derivado
   ────────────────────────────────────────────────────────────── */

function parseSnapshot(value: Snapshot): PerfProfile {
  const [rawTier, isMobile, isTouch, reducedMotion, saveData, source] = value.split("|");
  const tier: PerformanceTier = rawTier === "high" || rawTier === "mid" ? rawTier : "low";
  const reduced = reducedMotion === "1";

  const can = (feature: PerfFeature): boolean => {
    if (reduced && MOTION_FEATURES.has(feature)) return false;
    return RANK[tier] >= RANK[FEATURE_MIN_TIER[feature]];
  };

  return {
    tier,
    isMobile: isMobile === "1",
    isTouch: isTouch === "1",
    reducedMotion: reduced,
    saveData: saveData === "1",
    measured: source === "m",
    ...PROFILES[tier],
    glass: can("glass"),
    heavyBlur: can("heavyBlur"),
    atLeast: (min) => RANK[tier] >= RANK[min],
    can,
  };
}

/**
 * Perfil de rendimiento activo.
 *
 * Arranca con una heurística optimista (escritorio "high", móvil/táctil "mid") y se degrada solo
 * cuando la sonda de fotogramas de la escena 3D (`FrameProbe`, en `HeroScene`) mide que el dispositivo
 * no llega, o cuando alguien llama a `demotePerformanceTier`. `prefers-reduced-motion` fija "low" de
 * entrada y el ahorro de datos baja un escalón.
 * Devuelve un perfil "low" durante SSR/hidratación (snapshot de servidor) y el perfil real justo
 * después, sin `setState` dentro de efectos.
 */
export function usePerformanceTier(): PerfProfile {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  /* El HUD se monta desde un efecto y no desde `getSnapshot`, porque tocar el DOM durante el
     render rompería la hidratación. Es idempotente: solo el primer consumidor crea el nodo. */
  useEffect(renderDiagnostics, [value]);
  return useMemo(() => parseSnapshot(value), [value]);
}

/** Azúcar para el caso más común: "¿puedo permitirme esto?" en una línea. */
export function useCanAfford(feature: PerfFeature): boolean {
  return usePerformanceTier().can(feature);
}

/* ──────────────────────────────────────────────────────────────
   Interruptor de diagnóstico
   ────────────────────────────────────────────────────────────── */

/**
 * HUD de desarrollo: FPS medidos y gama activa en pantalla, para poder verificar la mejora en un
 * equipo real (aquí dentro solo hay WebGL por software, así que la única medida válida se toma en
 * el portátil o el móvil de verdad). Es la ÚNICA vía de diagnóstico que queda: el gobernador y la
 * sonda genérica se han borrado porque nadie las ejercitaba y la medición vive dentro del Canvas.
 *
 * Se enciende con `?perf=1` en la URL y se apaga con `?perf=0`; la elección queda en
 * `sessionStorage` para que sobreviva a la navegación entre idiomas y secciones. Un visitante
 * normal nunca lo ve: sin el parámetro no existe ni el nodo.
 *
 * Se pinta con DOM imperativo y no con un componente React a propósito: así no entra en el árbol
 * que se hidrata (nada que comparar con el HTML del servidor) y no añade un render más a cada
 * cambio de gama.
 */
const DIAGNOSTICS_PARAM = "perf";
const DIAGNOSTICS_KEY = "tixola:perf-hud";

let hud: HTMLElement | null = null;
let hudChecked = false;

function diagnosticsEnabled(): boolean {
  try {
    const raw = new URLSearchParams(window.location.search).get(DIAGNOSTICS_PARAM);
    if (raw !== null) {
      const on = raw === "1" || raw === "on" || raw === "true";
      if (on) window.sessionStorage.setItem(DIAGNOSTICS_KEY, "1");
      else window.sessionStorage.removeItem(DIAGNOSTICS_KEY);
      return on;
    }
    return window.sessionStorage.getItem(DIAGNOSTICS_KEY) === "1";
  } catch {
    /* Safari en privado lanza al tocar sessionStorage; sin HUD se sigue igual de bien. */
    return false;
  }
}

function renderDiagnostics(): void {
  if (typeof document === "undefined") return;
  if (!hudChecked) {
    hudChecked = true;
    if (!diagnosticsEnabled()) return;
    hud = document.createElement("div");
    hud.dataset.perfHud = "";
    hud.setAttribute("aria-hidden", "true");
    hud.style.cssText = [
      "position:fixed",
      "left:8px",
      "bottom:8px",
      "z-index:2147483647",
      "pointer-events:none",
      "padding:6px 10px",
      "border-radius:6px",
      "background:rgba(10,10,10,0.82)",
      "color:#f1e2cc",
      "font:11px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace",
      "letter-spacing:0.02em",
      "white-space:pre",
    ].join(";");
    document.body.appendChild(hud);
  }
  if (!hud) return;
  const d = device;
  const fps = lastFps === null ? "—" : `${Math.round(lastFps)}`;
  hud.textContent = [
    `tier  ${activeTier}${measured ? " (medido)" : " (heurística)"}`,
    `fps   ${fps}`,
    `dpr   ≤${PROFILES[activeTier].dpr[1]}  part ${PROFILES[activeTier].particles}`,
    `flags ${d?.isMobile ? "mobile " : ""}${d?.isTouch ? "touch " : ""}${d?.reducedMotion ? "rm " : ""}${d?.saveData ? "savedata" : ""}`.trimEnd(),
  ].join("\n");
}
