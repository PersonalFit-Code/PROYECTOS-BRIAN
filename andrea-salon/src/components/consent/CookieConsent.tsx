"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { useConsent } from "@/hooks/useConsent";
import { onConsentSettingsRequest, openConsentSettings, readConsent, saveConsent } from "@/lib/consent";
import { cn } from "@/lib/utils";

/* «Aceptar» y «Rechazar» con el MISMO aspecto y en la misma capa: la AEPD no admite que rechazar
   cueste más que aceptar. */
const BOTON = "pulsable inline-flex min-h-12 items-center justify-center rounded-full bg-carmin px-4 text-[15px] font-semibold text-white hover:bg-carmin-oscuro";

/* ─────────────────────────────────────────────────────────────────────────────
   "¿ESTÁ EL AVISO A LA VISTA?" · almacén mínimo para los flotantes
   ─────────────────────────────────────────────────────────────────────────────
   El aviso es una capa fija que en el móvil cae justo sobre el botón de WhatsApp y la barra
   inferior. Los flotantes necesitan saber si está abierto para apartarse, y no basta con
   `useConsent() === null`: el panel también se abre a mano desde «Configurar cookies» con una
   elección ya guardada. Así que el propio aviso publica su visibilidad aquí y `useCookieBannerOpen`
   la lee con `useSyncExternalStore`; en el servidor contesta `false` (el HTML sale con los
   flotantes visibles y se corrige al hidratar). */
let bannerOpen = false;
const listeners = new Set<() => void>();

function publishBanner(open: boolean) {
  if (bannerOpen === open) return;
  bannerOpen = open;
  for (const l of listeners) l();
}

function subscribeBanner(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** `true` mientras el aviso de cookies está en pantalla (lo consume `FloatingWhatsApp`). */
export function useCookieBannerOpen(): boolean {
  return useSyncExternalStore(subscribeBanner, () => bannerOpen, () => false);
}

function Interruptor({ id, checked, onChange, describedBy }: { id: string; checked: boolean; onChange: (v: boolean) => void; describedBy: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      className={cn("pulsable relative inline-flex h-7 w-12 shrink-0 items-center rounded-full ring-1 transition-colors", checked ? "bg-carmin ring-carmin" : "bg-rosa ring-carmin/20")}
    >
      <span aria-hidden className={cn("ml-1 inline-block size-5 rounded-full bg-white shadow transition-transform duration-300", checked ? "translate-x-5" : "translate-x-0")} />
    </button>
  );
}

/**
 * Aviso de cookies. Sale al entrar mientras no haya elección y se vuelve a abrir con «Configurar
 * cookies». No es modal (la web se puede leer y reservar), pero hasta elegir no se carga nada de
 * terceros. Una sola categoría opcional: el mapa de Google.
 */
export default function CookieConsent() {
  const m = useMessages();
  const lp = useLocalePath();
  const t = m.consent;
  const consent = useConsent();
  const reduced = useReducedMotion() ?? false;
  const [reopened, setReopened] = useState(false);
  const [settings, setSettings] = useState(false);
  const [maps, setMaps] = useState(false);
  const titleId = useId();
  const textId = useId();
  const mapsId = useId();
  const mapsTextId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const visible = consent === null || reopened;

  useEffect(
    () =>
      onConsentSettingsRequest(() => {
        setMaps(readConsent()?.maps ?? false);
        setSettings(true);
        setReopened(true);
      }),
    [],
  );

  /* Al reabrirlo a mano, el foco va al panel; Escape lo cierra sin cambiar nada. */
  useEffect(() => {
    if (!reopened) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setReopened(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reopened]);

  /* Publica la visibilidad para los flotantes (ver arriba) y la deja en el <html> por si algún
     CSS quiere reaccionar sin JS de por medio. */
  useEffect(() => {
    publishBanner(visible);
    document.documentElement.toggleAttribute("data-aviso-cookies", visible);
    return () => {
      publishBanner(false);
      document.documentElement.removeAttribute("data-aviso-cookies");
    };
  }, [visible]);

  const choose = (value: boolean) => {
    saveConsent({ maps: value });
    setReopened(false);
    setSettings(false);
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="aviso"
          ref={panelRef}
          role="dialog"
          data-nosnippet
          aria-modal="false"
          aria-labelledby={titleId}
          aria-describedby={textId}
          tabIndex={-1}
          className="liquid-glass liquid-glass-strong fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-50 mx-auto max-h-[calc(100dvh-24px)] max-w-[540px] overflow-y-auto rounded-[28px] p-5 text-tinta outline-none sm:inset-x-6 sm:p-6 lg:right-auto lg:left-6 lg:mx-0"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 32 }}
          transition={{ duration: reduced ? 0.15 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-start gap-3.5">
            <span aria-hidden className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-rosa text-carmin ring-1 ring-carmin/15">
              <Cookie className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="font-display text-xl leading-tight font-semibold">
                {settings ? t.settingsTitle : t.title}
              </h2>
              <p id={textId} className="mt-1.5 text-[14px] leading-relaxed text-pretty text-gris">
                {t.text}{" "}
                <Link href={lp(`/legal/${m.legal.cookies.slug}`)} className="font-medium text-carmin underline underline-offset-2 hover:text-carmin-oscuro">
                  {t.policy}
                </Link>
              </p>
            </div>
            {reopened ? (
              <button
                type="button"
                onClick={() => setReopened(false)}
                aria-label={t.close}
                className="pulsable -mt-1 -mr-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-gris hover:bg-rosa hover:text-tinta"
              >
                <X aria-hidden className="size-5" />
              </button>
            ) : null}
          </div>

          {settings ? (
            <ul className="mt-4 space-y-2.5">
              <li className="rounded-2xl bg-white/70 p-4 ring-1 ring-carmin/10">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[15px] font-semibold">{t.necessary.title}</p>
                  <span className="text-xs font-medium text-carmin-suave">{t.necessary.always}</span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-gris">{t.necessary.text}</p>
              </li>
              <li className="rounded-2xl bg-white/70 p-4 ring-1 ring-carmin/10">
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor={mapsId} className="text-[15px] font-semibold">
                    {t.maps.title}
                  </label>
                  <Interruptor id={mapsId} checked={maps} onChange={setMaps} describedBy={mapsTextId} />
                </div>
                <p id={mapsTextId} className="mt-1 text-[13px] leading-relaxed text-gris">
                  {t.maps.text}
                </p>
              </li>
            </ul>
          ) : null}

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => choose(false)} className={BOTON}>
              {t.reject}
            </button>
            <button type="button" onClick={() => choose(true)} className={BOTON}>
              {t.accept}
            </button>
            {settings ? (
              <button
                type="button"
                onClick={() => choose(maps)}
                className="pulsable col-span-2 inline-flex min-h-12 items-center justify-center rounded-full border border-carmin/25 bg-white/70 px-4 text-[15px] font-medium text-carmin hover:border-carmin/50"
              >
                {t.save}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMaps(false);
                  setSettings(true);
                }}
                className="pulsable col-span-2 inline-flex min-h-11 items-center justify-center rounded-full text-sm font-medium text-gris underline underline-offset-4 hover:text-tinta"
              >
                {t.configure}
              </button>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** «Configurar cookies»: un botón con aspecto de enlace para el pie, el menú y la política. */
export function CookieSettingsLink({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      {children}
    </button>
  );
}
