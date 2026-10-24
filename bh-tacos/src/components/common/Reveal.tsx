"use client";

import useReveal from "@/hooks/useReveal";

/** Activa las apariciones `.reveal` de la página en la que se monta. */
export default function Reveal() {
  useReveal();
  return null;
}
