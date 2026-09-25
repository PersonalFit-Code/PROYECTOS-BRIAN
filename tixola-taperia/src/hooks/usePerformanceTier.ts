"use client";

import { useEffect, useState } from "react";

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
 * Detecta la capacidad del dispositivo para mantener 60 FPS:
 *  - móvil / táctil → mid (o low si pocos núcleos, poca memoria o "ahorro de datos")
 *  - escritorio → high (o mid si prefiere menos movimiento)
 * Devuelve un perfil "low" durante SSR para no hidratar con efectos pesados.
 */
export function usePerformanceTier(): PerfProfile {
  const [profile, setProfile] = useState<PerfProfile>({
    tier: "low",
    isMobile: false,
    isTouch: false,
    reducedMotion: false,
    ...PROFILES.low,
  });

  useEffect(() => {
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

    setProfile({ tier, isMobile, isTouch, reducedMotion, ...PROFILES[tier] });
  }, []);

  return profile;
}
