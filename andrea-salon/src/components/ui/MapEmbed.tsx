"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { BUSINESS } from "@/data/business";
import { useConsent } from "@/hooks/useConsent";
import { saveConsent } from "@/lib/consent";
import { cn } from "@/lib/utils";

/*
 * Google Maps instala cookies de terceros: el iframe NO se carga hasta que hay consentimiento para
 * el mapa (aviso de cookies, «Configurar cookies» o el botón «Cargar mapa» de aquí). Ni siquiera
 * «Cómo llegar» se lo salta: sin permiso, enseña esta misma fachada con la dirección y el enlace.
 */

/* Calles sugeridas: fondo decorativo mientras no hay mapa (no es un plano real). */
function Calles() {
  return (
    <svg aria-hidden className="absolute inset-0 size-full opacity-[0.22]" preserveAspectRatio="none" viewBox="0 0 400 240">
      <g fill="none" stroke="#8e0e33" strokeWidth="1.2">
        <path d="M-10 70 C80 60 140 95 220 80 S360 40 410 55" />
        <path d="M-10 170 C70 150 160 185 250 160 S350 140 410 150" />
        <path d="M120 -10 C130 60 110 140 140 250" />
        <path d="M280 -10 C265 80 300 150 285 250" />
        <path d="M-10 120 L410 115" strokeDasharray="4 6" />
      </g>
    </svg>
  );
}

/** El mapa, con su entrada: se abre en círculo, cae el pin y el mapa funde al cargar. */
function MapaVivo({ title }: { title: string }) {
  const reduced = useReducedMotion() ?? false;
  const [loaded, setLoaded] = useState(false);
  return (
    <motion.div
      className="absolute inset-0"
      initial={reduced ? false : { clipPath: "circle(0% at 50% 50%)" }}
      animate={{ clipPath: "circle(80% at 50% 50%)" }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
    >
      <Calles />
      {/* Sin filtro de color: el tema de la web es claro y el mapa de Google ya lo es. */}
      <iframe
        title={title}
        src={BUSINESS.mapEmbed}
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={() => setLoaded(true)}
        className={cn("absolute inset-0 size-full border-0 transition-opacity duration-700", loaded ? "opacity-100" : "opacity-0")}
      />
      {/* El pin de la casa: cae, late y se aparta cuando el mapa ya tiene el suyo. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -mt-10 -ml-5 flex size-10 items-center justify-center"
        initial={reduced ? false : { y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: loaded ? 0 : 1 }}
        transition={{ y: { type: "spring", damping: 12, stiffness: 180, delay: 0.7 }, opacity: { duration: 0.6, delay: loaded ? 1.6 : 0.7 } }}
      >
        <span className="pulso-anillo absolute inset-1 rounded-full bg-carmin/50" />
        <span className="relative inline-flex size-10 items-center justify-center rounded-full bg-carmin text-white shadow-[0_8px_20px_-6px_rgba(142,14,51,0.6)]">
          <MapPin className="size-5" />
        </span>
      </motion.span>
    </motion.div>
  );
}

/** Mapa de Google con fachada de consentimiento hasta que se acepta el mapa. */
export default function MapEmbed({ title, className }: { title: string; className?: string }) {
  const m = useMessages();
  const lp = useLocalePath();
  const consent = useConsent()?.maps === true;

  return (
    <div className={cn("relative overflow-hidden bg-rosa-niebla", className)}>
      {consent ? (
        <MapaVivo title={title} />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center">
          <Calles />
          <span className="relative inline-flex size-12 items-center justify-center rounded-full bg-carmin text-white shadow-[0_0_0_8px_rgba(142,14,51,0.12)]">
            <MapPin aria-hidden className="size-5" />
          </span>
          <button
            type="button"
            onClick={() => saveConsent({ maps: true })}
            className="pulsable relative inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-carmin ring-1 ring-carmin/25 hover:ring-carmin/50"
          >
            {m.common.misc.loadMap}
          </button>
          <p className="relative max-w-xs text-[12px] leading-snug text-gris">
            {m.common.misc.loadMapNote}{" "}
            <Link href={lp(`/legal/${m.legal.cookies.slug}`)} className="underline underline-offset-2 hover:text-tinta">
              {m.common.misc.loadMapPolicy}
            </Link>
          </p>
        </div>
      )}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(142,14,51,0.1)]" />
    </div>
  );
}
