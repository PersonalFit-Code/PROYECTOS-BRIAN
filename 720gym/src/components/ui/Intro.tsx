"use client";

import { useEffect } from "react";

/**
 * Introducción de la portada: pantalla negra con el «720» recortado; por las letras se ve la foto
 * real del hero (está debajo), las letras crecen hasta que la foto llena la pantalla y aparece el
 * hero sin corte. Una vez por sesión, nunca con «reducir movimiento», y se salta con un toque.
 * La decide el script de <head> (atributo data-intro) para que no haya parpadeo.
 */
export default function Intro() {
  useEffect(() => {
    const r = document.documentElement;
    if (!r.hasAttribute("data-intro")) return;
    try {
      sessionStorage.setItem("720intro", "1");
    } catch {}
    const t = window.setTimeout(() => r.removeAttribute("data-intro"), 2800);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className="intro"
      aria-hidden
      onClick={() => document.documentElement.removeAttribute("data-intro")}
      onAnimationEnd={(e) => e.animationName === "intro-sale" && document.documentElement.removeAttribute("data-intro")}
    >
      <svg className="block size-full">
        <defs>
          <mask id="intro-mascara" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
            <rect width="100%" height="100%" fill="white" />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="black" className="intro-texto marca">
              720
            </text>
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="#0e0e0f" mask="url(#intro-mascara)" />
      </svg>
    </div>
  );
}
