"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useFrameRateProbe, type FrameRateProbeStatus } from "./useFrameRateProbe";

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
 * Presupuestos por gama. Se han bajado respecto a la versión anterior (250 / 700 / 1600 partículas,
 * dpr hasta 2) porque el objetivo pasó a ser el portátil con gráfica integrada y el móvil de gama
 * media: el coste de las partículas y del dpr es cuadrático en píxeles, y de 1,5 a 1,25 de dpr se
 * pintan un 30 % menos de fragmentos sin que en pantalla se note la diferencia.
 * La gama "low" conserva cifras aunque no monte la escena: si algún día se reutiliza el presupuesto
 * en un fondo ligero, que no salga de cero.
 */
const PROFILES: Record<PerformanceTier, TierBudget> = {
  low: { dpr: [1, 1], particles: 140, shadows: false, postprocessing: false, floaters: 4 },
  mid: { dpr: [1, 1.25], particles: 380, shadows: false, postprocessing: false, floaters: 8 },
  high: { dpr: [1, 1.75], particles: 1100, shadows: true, postprocessing: true, floaters: 14 },
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
export const FPS_FLOOR_3D = 30;
/** Por debajo de esto hay escena, pero sin sombras, sin bloom y sin cristal real. */
export const FPS_FLOOR_HIGH = 48;

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
/** Gobernadores montados a la vez. Solo sirve para avisar en desarrollo si hay más de uno. */
let governors = 0;
const listeners = new Set<() => void>();

const RANK: Record<PerformanceTier, number> = { low: 0, mid: 1, high: 2 };

function detectDevice(): DeviceFlags {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const saveData = nav.connection?.saveData ?? false;

  /* Preferencia explícita del usuario: manda sobre todo lo demás y ni se mide. Reducir movimiento
     y ahorrar datos son decisiones suyas, no diagnósticos de potencia que una sonda pueda rebatir. */
  if (reducedMotion || saveData) {
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
  const heuristic: PerformanceTier = isMobile || isTouch ? "mid" : "high";
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

/** Reconstruye la instantánea y avisa a React. Idempotente: si nada cambió, no notifica. */
function commit(): void {
  const next = buildSnapshot();
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
export function tierForFrameRate(fps: number): PerformanceTier {
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

/**
 * Marca el perfil como "sin medir" para que el gobernador vuelva a tomar una muestra. NO devuelve
 * la gama a su valor original: el trinquete se mantiene, así que una remedida solo puede confirmar
 * la gama actual o bajarla más.
 */
export function rearmMeasurement(): void {
  if (typeof window === "undefined" || !measured) return;
  measured = false;
  lastFps = null;
  commit();
}

/** Lectura imperativa de la gama activa (código no-React). En servidor devuelve "low". */
export function getPerformanceTier(): PerformanceTier {
  if (typeof window === "undefined") return "low";
  ensureDetected();
  return activeTier;
}

/** Suscripción imperativa a los cambios de gama (código no-React). */
export function subscribePerformanceTier(listener: () => void): () => void {
  return subscribe(listener);
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
 * cuando `usePerformanceGovernor` mide que el dispositivo no llega, o cuando alguien llama a
 * `demotePerformanceTier`. `prefers-reduced-motion` y el ahorro de datos fijan "low" de entrada.
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
   Gobernador: mide y degrada
   ────────────────────────────────────────────────────────────── */

export interface PerformanceGovernorOptions {
  /** Con `false` no se mide (p. ej. mientras la escena aún no ha montado). */
  enabled?: boolean;
  /** Ventana de medida en ms. Por defecto ~1 s. */
  sampleMs?: number;
}

export interface PerformanceGovernorState {
  /** FPS medidos, o `null` si todavía no hay medición. */
  fps: number | null;
  status: FrameRateProbeStatus;
  /** Gama activa tras aplicar la medición. */
  tier: PerformanceTier;
  /** Vuelve a medir y, si procede, vuelve a degradar. */
  remeasure: () => void;
}

/**
 * Mide una vez por sesión y degrada la gama si hace falta. Se monta DONDE ESTÁ EL TRABAJO —es
 * decir, junto a la escena 3D—, porque medir la portada sin escena diría que todo va a 60 FPS.
 *
 * Se monta UNA SOLA VEZ en toda la aplicación. Dos gobernadores a la vez no romperían nada —la
 * degradación es un trinquete y la peor de las dos medidas gana— pero serían dos bucles de
 * `requestAnimationFrame` compitiendo justo mientras se juzga el rendimiento, que es precisamente
 * lo que falsea la medida. En desarrollo se avisa por consola si ocurre.
 */
export function usePerformanceGovernor(options: PerformanceGovernorOptions = {}): PerformanceGovernorState {
  const { enabled = true, sampleMs } = options;
  const profile = usePerformanceTier();

  useEffect(() => {
    governors += 1;
    if (process.env.NODE_ENV !== "production" && governors > 1) {
      console.warn("[perf] usePerformanceGovernor montado más de una vez: la medición se falsea. Déjalo solo junto a la escena 3D.");
    }
    return () => {
      governors -= 1;
    };
  }, []);

  /* No se mide cuando el usuario ya decidió por nosotros (reduced-motion / ahorro de datos) ni
     cuando el dispositivo ya cayó a "low": no queda nada que degradar. */
  const locked = device?.locked ?? false;
  const shouldMeasure = enabled && !locked && !profile.measured && profile.tier !== "low";

  const { fps, status, restart } = useFrameRateProbe({
    enabled: shouldMeasure,
    sampleMs,
    onResult: reportMeasuredFrameRate,
  });

  /* Remedir exige soltar antes la marca de "ya medido": si no, `shouldMeasure` sigue en falso y la
     sonda rearmada no llegaría a montarse nunca. */
  const remeasure = useCallback(() => {
    rearmMeasurement();
    restart();
  }, [restart]);

  return { fps: fps ?? lastFps, status, tier: profile.tier, remeasure };
}

/* ──────────────────────────────────────────────────────────────
   Interruptor de diagnóstico
   ────────────────────────────────────────────────────────────── */

/**
 * HUD de desarrollo: FPS medidos y gama activa en pantalla, para poder verificar la mejora en un
 * equipo real (aquí dentro solo hay WebGL por software, así que la única medida válida se toma en
 * el portátil o el móvil de verdad).
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

/**
 * Escotilla programática para encender el HUD sin recargar con el parámetro (por ejemplo desde un
 * atajo de teclado de desarrollo). La vía normal sigue siendo `?perf=1`. No lo llama nadie.
 */
export function showPerformanceDiagnostics(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DIAGNOSTICS_KEY, "1");
  } catch {
    /* Sin almacenamiento el HUD vive solo hasta la próxima navegación. */
  }
  hudChecked = false;
  ensureDetected();
  renderDiagnostics();
}
