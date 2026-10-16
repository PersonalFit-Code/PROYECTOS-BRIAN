"use client";

import { usePerformanceTier } from "@/hooks/usePerformanceTier";

/**
 * Arranca la sonda de gama (`usePerformanceTier`) una vez por página: escribe `data-gpu` en el
 * <html>, que es el interruptor del desenfoque real en las superficies anchas de cristal. No pinta
 * nada.
 */
export default function ClientBoot() {
  usePerformanceTier();
  return null;
}
