"use client";

import { useLinkStatus } from "next/link";

/**
 * Va dentro de un <Link>: mientras se abre la pantalla nueva, una barra de luz recorre el botón
 * pulsado. Así hay respuesta inmediata aunque la pantalla de carga aún no haya llegado.
 */
export function IndicadorEnlace() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <span className="absolute inset-0 bg-accent/10" />
      <span className="barra-carga absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </span>
  );
}
