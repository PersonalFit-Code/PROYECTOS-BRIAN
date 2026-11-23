"use client";

import { useEffect } from "react";

/**
 * Introducción de la portada: pantalla negra con el «720» recortado; por las letras se ve la foto
 * real del hero (está debajo), las letras crecen hasta que la foto llena la pantalla y aparece el
 * hero sin corte. Técnica: capa negra con el texto en blanco y `mix-blend-mode: multiply` (lo blanco
 * deja ver lo de debajo) y zoom con transform de CSS. Funciona igual en Safari de iPhone, donde las
 * máscaras SVG animadas no se repintan bien. Una vez por sesión, nunca con «reducir movimiento», y se salta con un toque.
 * La decide el script de <head> (atributo data-intro) para que no haya parpadeo.
 */
function terminar() {
  document.documentElement.removeAttribute("data-intro");
  document.documentElement.removeAttribute("data-intro-ya");
}

/** Vuelve arriba y repite la entrada del «720» (al pulsar el logo de la cabecera). */
export function repetirIntro() {
  const r = document.documentElement;
  window.scrollTo({ top: 0, behavior: "instant" });
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  r.removeAttribute("data-intro-ya");
  r.setAttribute("data-intro", "");
  requestAnimationFrame(() => requestAnimationFrame(() => r.setAttribute("data-intro-ya", "")));
  window.setTimeout(terminar, 2600);
}

export default function Intro() {
  useEffect(() => {
    const r = document.documentElement;
    if (!r.hasAttribute("data-intro")) return;
    const fin = terminar;
    try {
      sessionStorage.setItem("720intro", "1");
    } catch {}
    const t = window.setTimeout(fin, 2600);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className="intro"
      aria-hidden
      onClick={terminar}
      onAnimationEnd={(e) => e.animationName === "intro-sale" && terminar()}
    >
      <span className="intro-texto marca">720</span>
    </div>
  );
}
