"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

/**
 * Selector de acento para decidir con ellos el lunes. Por defecto, blanco y negro (Brian: «full
 * blanco y negro, con toques de gris»); como alternativas, el naranja de su dosier o el rojo de sus
 * máquinas. El estado vive en <html data-acento>; se recuerda en el navegador (solo comodidad) y
 * también se fuerza con ?acento=bn|naranja|rojo en la URL (lo aplica el script del layout).
 */
type Acento = "bn" | "naranja" | "rojo";

function suscribir(aviso: () => void) {
  const mo = new MutationObserver(aviso);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-acento"] });
  return () => mo.disconnect();
}
const leer = (): Acento => {
  const a = document.documentElement.getAttribute("data-acento");
  return a === "rojo" || a === "naranja" ? a : "bn";
};

function aplicar(a: Acento) {
  if (a === "bn") document.documentElement.removeAttribute("data-acento");
  else document.documentElement.setAttribute("data-acento", a);
  try {
    localStorage.setItem("acento-720", a);
  } catch {}
}

const opciones = [
  ["bn", "linear-gradient(135deg, #ffffff 50%, #0e0e0f 50%)", "Blanco y negro"],
  ["naranja", "#F7941D", "Naranja del dosier"],
  ["rojo", "#D7232B", "Rojo de las máquinas"],
] as const;

export default function SelectorAcento() {
  const acento = useSyncExternalStore<Acento>(suscribir, leer, () => "bn");
  return (
    <div className="flex items-center gap-3 text-[12px] text-white/50">
      <span>Color</span>
      <div className="flex gap-1.5" role="radiogroup" aria-label="Color de acento">
        {opciones.map(([id, fondo, nombre]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={acento === id}
            title={nombre}
            aria-label={nombre}
            onClick={() => aplicar(id)}
            className={cn("size-5 rounded-full ring-offset-2 ring-offset-negro transition", acento === id ? "ring-2 ring-white" : "ring-1 ring-white/25")}
            style={{ background: fondo }}
          />
        ))}
      </div>
    </div>
  );
}
