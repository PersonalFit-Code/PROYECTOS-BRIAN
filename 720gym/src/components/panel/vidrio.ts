"use client";

/** Ajuste del vidrio del panel, guardado en este navegador. */
import { useSyncExternalStore } from "react";
import { normalizarVidrio, vidrioInicial, type Vidrio } from "@/components/ui/adjustable-glass";

const CLAVE = "720panel:vidrio";
const EVENTO = "720panel-vidrio";
let cacheCrudo: string | null | undefined;
let cacheValor: Vidrio = vidrioInicial;

function leer(): Vidrio {
  let crudo: string | null = null;
  try {
    crudo = localStorage.getItem(CLAVE);
  } catch {}
  if (crudo === cacheCrudo) return cacheValor;
  cacheCrudo = crudo;
  try {
    cacheValor = crudo ? normalizarVidrio(JSON.parse(crudo) as Partial<Vidrio>) : vidrioInicial;
  } catch {
    cacheValor = vidrioInicial;
  }
  return cacheValor;
}

function suscribir(aviso: () => void) {
  window.addEventListener(EVENTO, aviso);
  return () => window.removeEventListener(EVENTO, aviso);
}

export function useVidrio(): Vidrio {
  return useSyncExternalStore(suscribir, leer, () => vidrioInicial);
}

export function guardarVidrio(v: Vidrio) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(v));
  } catch {}
  window.dispatchEvent(new Event(EVENTO));
}
