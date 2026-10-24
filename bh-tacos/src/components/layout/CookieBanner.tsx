"use client";

import Link from "next/link";
import useConsent from "@/hooks/useConsent";
import { setConsent } from "@/lib/consent";

/*
 * ¿Hace falta banner? La web en sí solo guarda datos técnicos en localStorage (tema, borrador del
 * taco y esta elección), que la normativa exime de consentimiento. Pero el mapa de Google Maps de
 * /contacto instala cookies de terceros, así que sí se pregunta, y el mapa no se carga hasta que
 * se acepta. Si se quitara el mapa, este banner podría eliminarse.
 * Esquina inferior derecha (lejos de los botones del hero), sin bloquear la web, y aparece con @starting-style (sin JS de animación).
 */
export default function CookieBanner() {
  const consent = useConsent();
  if (consent !== null) return null; // undefined = aún hidratando; un valor = ya eligió
  return (
    <section
      aria-label="Aviso de cookies"
      className="enter-up card fixed bottom-3 left-3 right-3 z-[60] p-3 shadow-2xl sm:bottom-5 sm:left-auto sm:right-5 sm:max-w-sm sm:p-4"
    >
      <p className="text-xs leading-relaxed text-fg-muted sm:text-sm">
        Usamos almacenamiento técnico para que la web funcione. El mapa de Google solo se carga si aceptas sus cookies.
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" className="press btn btn-primary min-h-11 flex-1 py-2 text-sm" onClick={() => setConsent("accepted")}>
          Aceptar
        </button>
        <button type="button" className="press btn btn-ghost min-h-11 py-2 text-sm" onClick={() => setConsent("rejected")}>
          Rechazar
        </button>
        <Link href="/cookies" className="press btn btn-ghost min-h-11 py-2 text-sm">
          Más info
        </Link>
      </div>
    </section>
  );
}
