"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { useConsent } from "@/hooks/useConsent";
import { onConsentSettingsRequest, openConsentSettings, readConsent, saveConsent } from "@/lib/consent";
import { cn } from "@/lib/cn";

/* «Aceptar» y «Rechazar» con el MISMO aspecto y en la misma capa: la AEPD no admite que rechazar
   cueste más que aceptar. */
const BOTON = "pulsable inline-flex min-h-12 items-center justify-center rounded-full bg-oro px-4 text-[15px] font-semibold text-botella hover:bg-oro-light";

function Interruptor({ id, checked, onChange, describedBy }: { id: string; checked: boolean; onChange: (v: boolean) => void; describedBy: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      className={cn("pulsable relative inline-flex h-7 w-12 shrink-0 items-center rounded-full ring-1 transition-colors", checked ? "bg-oro ring-oro" : "bg-cream/10 ring-cream/25")}
    >
      <span aria-hidden className={cn("ml-1 inline-block size-5 rounded-full shadow transition-transform duration-300", checked ? "translate-x-5 bg-botella" : "translate-x-0 bg-cream")} />
    </button>
  );
}

/**
 * Aviso de cookies. Sale al entrar mientras no haya elección y se vuelve a abrir con «Configurar
 * cookies». No es modal (la web se puede leer), pero hasta elegir no se carga nada de terceros.
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

  /* Para que los botones flotantes (el camarero) se aparten mientras está el aviso. */
  useEffect(() => {
    document.documentElement.toggleAttribute("data-aviso-cookies", visible);
    return () => document.documentElement.removeAttribute("data-aviso-cookies");
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
          className="liquid-glass liquid-glass-strong fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-50 mx-auto max-h-[calc(100dvh-24px)] max-w-[540px] overflow-y-auto rounded-[28px] p-5 outline-none sm:inset-x-6 sm:p-6 lg:right-auto lg:left-6 lg:mx-0"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 32 }}
          transition={{ duration: reduced ? 0.15 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-start gap-3.5">
            <span aria-hidden className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-oro/15 text-oro-light ring-1 ring-oro/30">
              <Cookie className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="font-display text-xl leading-tight font-medium">
                {settings ? t.settingsTitle : t.title}
              </h2>
              <p id={textId} className="mt-1.5 text-[14px] leading-relaxed text-pretty text-cream-muted">
                {t.text}{" "}
                <Link href={lp("/legal/cookies")} className="font-medium text-oro-a11y underline underline-offset-2 hover:text-cream">
                  {t.policy}
                </Link>
              </p>
            </div>
            {reopened ? (
              <button
                type="button"
                onClick={() => setReopened(false)}
                aria-label={t.close}
                className="pulsable -mt-1 -mr-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-cream-muted hover:bg-cream/10 hover:text-cream"
              >
                <X aria-hidden className="size-5" />
              </button>
            ) : null}
          </div>

          {settings ? (
            <ul className="mt-4 space-y-2.5">
              <li className="rounded-2xl bg-cream/[0.05] p-4 ring-1 ring-cream/10">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[15px] font-semibold">{t.necessary.title}</p>
                  <span className="text-xs font-medium text-oro-a11y">{t.necessary.always}</span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-cream-muted">{t.necessary.text}</p>
              </li>
              <li className="rounded-2xl bg-cream/[0.05] p-4 ring-1 ring-cream/10">
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor={mapsId} className="text-[15px] font-semibold">
                    {t.maps.title}
                  </label>
                  <Interruptor id={mapsId} checked={maps} onChange={setMaps} describedBy={mapsTextId} />
                </div>
                <p id={mapsTextId} className="mt-1 text-[13px] leading-relaxed text-cream-muted">
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
                className="pulsable col-span-2 inline-flex min-h-12 items-center justify-center rounded-full border border-cream/20 bg-cream/[0.06] px-4 text-[15px] font-medium hover:border-oro/45"
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
                className="pulsable col-span-2 inline-flex min-h-11 items-center justify-center rounded-full text-sm font-medium text-cream-muted underline underline-offset-4 hover:text-cream"
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
