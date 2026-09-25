"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { ArrowLeft, ChartNoAxesColumn, Cookie, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import {
  COOKIE_SETTINGS_EVENT,
  getConsent,
  getConsentSnapshot,
  getServerConsentSnapshot,
  setConsent,
  subscribeConsent,
  type ConsentState,
} from "@/lib/consent";
import { cn } from "@/lib/utils";

/**
 * Decisión guardada como "almacén externo": `undefined` en el servidor y durante la hidratación
 * (no se pinta nada), `null` sin decisión vigente, o el estado. Se actualiza con `tixola:consent`
 * (misma pestaña) y `storage` (otras pestañas). Reutilizable desde cualquier componente cliente.
 */
export function useConsent(): ConsentState | null | undefined {
  return useSyncExternalStore<ConsentState | null | undefined>(subscribeConsent, getConsentSnapshot, getServerConsentSnapshot);
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/* ──────────────────────────────────────────────────────────────
   Gancho de analítica
   ────────────────────────────────────────────────────────────── */

let analyticsLoaded = false;

/**
 * ÚNICO punto donde debe cargarse cualquier herramienta de analítica.
 * Se ejecuta solo cuando `consent.analytics === true` (decisión vigente) y una vez por carga.
 *
 * Hoy no hay ninguna herramienta instalada (así lo dice la política de cookies). Cuando se
 * incorpore una, añádela aquí y actualiza la tabla de `m.legal.docs.cookies`. Ejemplo:
 *
 *   const s = document.createElement("script");
 *   s.src = "https://plausible.io/js/script.js";
 *   s.defer = true;
 *   s.dataset.domain = "tixola.restaurantesourense.com";
 *   document.head.appendChild(s);
 *
 * Si el usuario retira el consentimiento más tarde, la herramienta deja de cargarse en la
 * siguiente visita (y aquí puede añadirse su desactivación en caliente si la ofrece).
 */
function loadAnalytics(): void {
  if (analyticsLoaded) return;
  analyticsLoaded = true;
  /* Sin herramienta instalada: no se carga nada. */
}

/* ──────────────────────────────────────────────────────────────
   Interruptor accesible
   ────────────────────────────────────────────────────────────── */

interface ToggleProps {
  id: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (next: boolean) => void;
  label: string;
  description: string;
  badge?: string;
  icon: ReactNode;
}

function ConsentToggle({ id, checked, locked = false, onChange, label, description, badge, icon }: ToggleProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-cream/10 bg-cream/[0.03] p-4">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pimenton/15 text-pimenton-a11y [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <label htmlFor={id} className="font-semibold text-cream">
            {label}
          </label>
          {badge && <span className="rounded-full border border-cream/15 px-2 py-0.5 font-caps text-[10px] uppercase tracking-[0.2em] text-cream-faint">{badge}</span>}
        </div>
        <p id={`${id}-desc`} className="mt-1 text-sm leading-relaxed text-cream-muted">
          {description}
        </p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={`${id}-desc`}
        disabled={locked}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative mt-0.5 grid h-11 w-14 shrink-0 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pimenton-light focus-visible:ring-offset-2 focus-visible:ring-offset-iron",
          locked && "cursor-not-allowed",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "relative block h-7 w-12 rounded-full border transition-colors duration-300",
            checked ? "border-pimenton-light/70 bg-pimenton" : "border-cream/20 bg-cream/10",
            locked && "opacity-70",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 h-[22px] w-[22px] rounded-full bg-cream shadow transition-transform duration-300 ease-[var(--ease-out-expo)]",
              checked && "translate-x-5",
            )}
          />
        </span>
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Banner
   ────────────────────────────────────────────────────────────── */

/**
 * Aviso de cookies (cristal ahumado, abajo; sobre la barra móvil):
 *  - Aparece solo si no hay decisión vigente (localStorage `tixola_consent`, 12 meses).
 *  - Aceptar todas · Solo necesarias · Configurar (panel con interruptores: necesarias
 *    bloqueadas + analítica).
 *  - Se reabre con el evento `tixola:cookie-settings` (botón «Configurar cookies» del pie y
 *    de la política de cookies).
 *  - No es modal: no bloquea la navegación. `aria-live="polite"` anuncia su aparición.
 *  - Nada se pinta hasta montar en cliente (evita desajustes de hidratación).
 *  - `loadAnalytics()` es el único gancho para cargar analítica cuando hay consentimiento.
 */
export default function CookieConsent() {
  const m = useMessages();
  const lp = useLocalePath();
  const b = m.legal.banner;

  const consent = useConsent();
  /* Reabierto desde «Configurar cookies» (pie / política de cookies) aunque ya haya decisión. */
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [panel, setPanel] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  /* Visible si no hay decisión vigente o si se ha pedido reabrir; nunca antes de hidratar. */
  const open = consent !== undefined && (consent === null || settingsOpen);

  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;

  /* Reapertura desde el pie: recordamos el foco, cargamos la decisión actual y abrimos el panel. */
  useEffect(() => {
    const onSettings = () => {
      restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setAnalytics(getConsent()?.analytics ?? false);
      setPanel(true);
      setSettingsOpen(true);
    };
    window.addEventListener(COOKIE_SETTINGS_EVENT, onSettings);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, onSettings);
  }, []);

  /* Gancho de analítica: solo con consentimiento vigente. */
  useEffect(() => {
    if (consent?.analytics) loadAnalytics();
  }, [consent]);

  /* Al reabrir desde el pie movemos el foco al panel; al cerrar lo devolvemos al botón. */
  useEffect(() => {
    if (!open || !panel) return undefined;
    const id = window.setTimeout(() => dialogRef.current?.querySelector<HTMLElement>("[role=switch]:not([disabled])")?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [open, panel]);

  const close = useCallback(() => {
    setSettingsOpen(false);
    setPanel(false);
    const target = restoreFocusRef.current;
    restoreFocusRef.current = null;
    if (target?.isConnected) target.focus();
  }, []);

  /* Guarda la decisión: `setConsent` emite `tixola:consent` y el almacén externo cierra el aviso. */
  const decide = useCallback(
    (allowAnalytics: boolean) => {
      const state = setConsent({ analytics: allowAnalytics });
      setAnalytics(state.analytics);
      setAnnouncement(b.saved);
      close();
    },
    [b.saved, close],
  );

  /* Escape cierra el panel solo si ya existe una decisión (si no, hay que elegir). */
  useEffect(() => {
    if (!open || !consent) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, consent, close]);

  const privacyHref = lp(`/legal/${m.legal.privacy.slug}`);
  const cookiesHref = lp(`/legal/${m.legal.cookies.slug}`);

  return (
    <MotionConfig reducedMotion="user">
      {/* Región viva siempre montada: anuncia la aparición del aviso y el guardado. */}
      <div aria-live="polite">
        <p className="sr-only">{announcement}</p>

        <AnimatePresence>
          {open && (
            <div
              className={cn(
                "fixed inset-x-3 z-[44]",
                "bottom-[calc(var(--mobile-bar-h)+env(safe-area-inset-bottom)+12px)]",
                "md:inset-x-auto md:bottom-6 md:left-1/2 md:w-[min(42rem,calc(100vw-3rem))] md:-translate-x-1/2",
              )}
            >
              <motion.div
                key="cookie-consent"
                ref={dialogRef}
                role="dialog"
                aria-labelledby={titleId}
                aria-describedby={descId}
                initial={{ y: 48, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 32, opacity: 0, scale: 0.98, transition: { duration: 0.3, ease: "easeIn" } }}
                transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
                className="glass-smoke noise after:noise-after relative overflow-hidden rounded-3xl p-5 shadow-card md:p-6"
              >
                {/* Brasa decorativa */}
                <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-pimenton/25 blur-3xl" />

                <div className="relative flex items-start gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-pimenton-light/40 bg-pimenton/20 text-pimenton-a11y">
                    <Cookie className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 id={titleId} className="font-display text-2xl leading-none text-cream">
                      {panel ? b.panelTitle : b.title}
                    </h2>
                    <p id={descId} className="mt-2 text-sm leading-relaxed text-cream-muted text-pretty">
                      {panel ? b.panelText : b.text}{" "}
                      <Link href={cookiesHref} className="text-cream underline decoration-pimenton-light/70 underline-offset-4 hover:text-pimenton-a11y">
                        {b.more}
                      </Link>
                    </p>
                  </div>
                  {panel && consent && (
                    <button
                      type="button"
                      onClick={close}
                      aria-label={m.common.misc.close}
                      className="-mr-2 -mt-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-cream-muted transition-colors hover:bg-cream/10 hover:text-cream"
                    >
                      <X className="h-5 w-5" aria-hidden />
                    </button>
                  )}
                </div>

                <AnimatePresence initial={false} mode="wait">
                  {panel ? (
                    <motion.div
                      key="panel"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                      className="relative mt-5"
                    >
                      <div className="flex flex-col gap-3">
                        <ConsentToggle
                          id={`${uid}-necessary`}
                          checked
                          locked
                          label={b.necessary}
                          description={b.necessaryDesc}
                          badge={b.alwaysOn}
                          icon={<ShieldCheck aria-hidden />}
                        />
                        <ConsentToggle
                          id={`${uid}-analytics`}
                          checked={analytics}
                          onChange={setAnalytics}
                          label={b.analytics}
                          description={b.analyticsDesc}
                          icon={<ChartNoAxesColumn aria-hidden />}
                        />
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-cream-faint">{b.noAnalyticsYet}</p>

                      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                        <NeonButton size="md" onClick={() => decide(analytics)} className="w-full sm:w-auto">
                          {b.save}
                        </NeonButton>
                        <NeonButton size="md" variant="outline" onClick={() => decide(true)} className="w-full sm:w-auto">
                          {b.accept}
                        </NeonButton>
                        <button
                          type="button"
                          onClick={() => setPanel(false)}
                          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold text-cream-muted transition-colors hover:text-cream sm:ml-auto"
                        >
                          <ArrowLeft className="h-4 w-4" aria-hidden />
                          {b.back}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="choices"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                      className="relative mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center"
                    >
                      <NeonButton size="md" onClick={() => decide(true)} className="w-full sm:w-auto">
                        {b.accept}
                      </NeonButton>
                      <NeonButton size="md" variant="outline" onClick={() => decide(false)} className="w-full sm:w-auto">
                        {b.reject}
                      </NeonButton>
                      <button
                        type="button"
                        onClick={() => setPanel(true)}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold text-cream-200 transition-colors hover:text-cream sm:ml-auto"
                      >
                        <SlidersHorizontal className="h-4 w-4 text-pimenton-light" aria-hidden />
                        {b.settings}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="relative mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-cream-faint">
                  <Link href={privacyHref} className="inline-flex min-h-8 items-center underline-offset-4 transition-colors hover:text-cream hover:underline">
                    {b.privacyLink}
                  </Link>
                  <Link href={cookiesHref} className="inline-flex min-h-8 items-center underline-offset-4 transition-colors hover:text-cream hover:underline">
                    {b.cookiesLink}
                  </Link>
                </p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
