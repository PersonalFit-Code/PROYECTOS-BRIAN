"use client";

import { useEffect } from "react";

/** Escribe `data-gpu="high"` en <html> solo en equipos que pueden pagar el desenfoque ancho. */
export function usePerformanceTier() {
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = nav.hardwareConcurrency ?? 4;
    const mem = nav.deviceMemory ?? 4;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced && cores >= 8 && mem >= 8 && fine) document.documentElement.dataset.gpu = "high";
  }, []);
}
