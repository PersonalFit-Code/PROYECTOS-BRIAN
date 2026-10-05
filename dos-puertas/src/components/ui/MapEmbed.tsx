"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { MapPin } from "lucide-react";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { BUSINESS } from "@/data/business";
import { cn } from "@/lib/cn";

/*
 * Consentimiento del mapa: Google Maps instala cookies de terceros, así que el iframe NO se carga
 * hasta que la persona lo pide. La elección se recuerda en localStorage («dp-mapa»), envuelto en
 * try/catch porque en modo privado o con datos bloqueados puede fallar.
 */
const KEY = "dp-mapa";
const EVENT = "dp-mapa-change";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
function readConsent() {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
function grantConsent() {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    /* sin almacenamiento: el mapa se carga igual en esta visita */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Mapa de Google en tema oscuro, con fachada de consentimiento hasta que se pide cargarlo. */
export default function MapEmbed({ title, className }: { title: string; className?: string }) {
  const m = useMessages();
  const lp = useLocalePath();
  const consent = useSyncExternalStore(subscribe, readConsent, () => false);

  return (
    <div className={cn("relative overflow-hidden bg-botella-800", className)}>
      {consent ? (
        <iframe
          title={title}
          src={BUSINESS.mapEmbed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 size-full border-0 [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.55)_brightness(0.92)_contrast(0.95)]"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center">
          {/* Calles sugeridas de fondo: decorativas, no es un plano real. */}
          <svg aria-hidden className="absolute inset-0 size-full opacity-[0.18]" preserveAspectRatio="none" viewBox="0 0 400 240">
            <g fill="none" stroke="#f3ecdc" strokeWidth="1.2">
              <path d="M-10 70 C80 60 140 95 220 80 S360 40 410 55" />
              <path d="M-10 170 C70 150 160 185 250 160 S350 140 410 150" />
              <path d="M120 -10 C130 60 110 140 140 250" />
              <path d="M280 -10 C265 80 300 150 285 250" />
              <path d="M-10 120 L410 115" strokeDasharray="4 6" />
            </g>
          </svg>
          <span className="relative inline-flex size-12 items-center justify-center rounded-full bg-oro text-botella shadow-[0_0_0_8px_rgba(227,196,106,0.15)]">
            <MapPin aria-hidden className="size-5" />
          </span>
          <button
            type="button"
            onClick={grantConsent}
            className="pulsable relative inline-flex min-h-11 items-center rounded-full bg-cream/10 px-5 text-sm font-semibold text-cream ring-1 ring-cream/20 hover:bg-cream/15"
          >
            {m.common.loadMap}
          </button>
          <p className="relative max-w-xs text-[12px] leading-snug text-cream-faint">
            {m.common.loadMapNote}{" "}
            <Link href={lp("/legal/cookies")} className="underline underline-offset-2 hover:text-cream">
              {m.common.loadMapPolicy}
            </Link>
          </p>
        </div>
      )}
      <span aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(243,236,220,0.1),inset_0_0_40px_rgba(15,29,23,0.55)]" />
    </div>
  );
}
