"use client";

import { useMemo, useSyncExternalStore } from "react";

export type PerformanceTier = "low" | "mid" | "high";

export interface PerfProfile {
  tier: PerformanceTier;
  isMobile: boolean;
  isTouch: boolean;
  reducedMotion: boolean;
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
}

const PROFILES: Record<PerformanceTier, Omit<PerfProfile, "tier" | "isMobile" | "isTouch" | "reducedMotion">> = {
  low: { dpr: [1, 1], particles: 250, shadows: false, postprocessing: false, floaters: 6 },
  mid: { dpr: [1, 1.5], particles: 700, shadows: false, postprocessing: false, floaters: 10 },
  high: { dpr: [1, 2], particles: 1600, shadows: true, postprocessing: true, floaters: 16 },
};

/**
 * Instantánea serializada `tier|isMobile|isTouch|reducedMotion` (0/1). Se usa un string
 * porque `useSyncExternalStore` compara snapshots por identidad: un string es estable y
 * el objeto de perfil se deriva de él con `useMemo`.
 */
type Snapshot = string;

/** Perfil "low" durante SSR/hidratación para no hidratar con efectos pesados. */
const SERVER_SNAPSHOT: Snapshot = "low|0|0|0";

/** La capacidad del dispositivo se detecta una sola vez por sesión (igual que antes). */
let clientSnapshot: Snapshot | null = null;

function detectSnapshot(): Snapshot {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const saveData = nav.connection?.saveData ?? false;

  let tier: PerformanceTier = "high";
  if (isMobile || isTouch) tier = "mid";
  if (cores <= 4 || memory <= 2 || saveData) tier = tier === "high" ? "mid" : "low";
  if (reducedMotion) tier = "low";

  return `${tier}|${isMobile ? 1 : 0}|${isTouch ? 1 : 0}|${reducedMotion ? 1 : 0}`;
}

function getSnapshot(): Snapshot {
  if (clientSnapshot === null) clientSnapshot = detectSnapshot();
  return clientSnapshot;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

/** El perfil no cambia tras detectarse, así que no hay nada a lo que suscribirse. */
function subscribe(): () => void {
  return () => {};
}

function parseSnapshot(snapshot: Snapshot): PerfProfile {
  const [tier, isMobile, isTouch, reducedMotion] = snapshot.split("|");
  const resolved: PerformanceTier = tier === "high" || tier === "mid" ? tier : "low";
  return {
    tier: resolved,
    isMobile: isMobile === "1",
    isTouch: isTouch === "1",
    reducedMotion: reducedMotion === "1",
    ...PROFILES[resolved],
  };
}

/**
 * Detecta la capacidad del dispositivo para mantener 60 FPS:
 *  - móvil / táctil → mid (o low si pocos núcleos, poca memoria o "ahorro de datos")
 *  - escritorio → high (o mid si prefiere menos movimiento)
 * Devuelve un perfil "low" durante SSR/hidratación (snapshot de servidor) y el perfil real
 * justo después, sin `setState` dentro de efectos.
 */
export function usePerformanceTier(): PerfProfile {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => parseSnapshot(snapshot), [snapshot]);
}
