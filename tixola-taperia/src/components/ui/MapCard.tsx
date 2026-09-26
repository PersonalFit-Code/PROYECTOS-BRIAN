"use client";

import { ChevronDown, ExternalLink, Footprints, Map, MapPin, MessageCircle, Navigation, Pause, Play, RotateCw } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useCallback, useEffect, useId, useMemo, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import { useChat } from "@/components/chat/ChatProvider";
import NeonButton from "@/components/ui/NeonButton";
import { BUSINESS } from "@/data/business";
import { localizePhotoById } from "@/i18n/data";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * MapCard — tarjeta de ubicación.
 *
 *  · Visor 4:3 con el mapa 3D fiel a la manzana real (R3F, `next/dynamic` + `ssr: false`), montado
 *    solo cuando la tarjeta se acerca al viewport y el dispositivo lo permite (tier ≠ low y sin
 *    `prefers-reduced-motion`). Mientras tanto, y como fallback definitivo, la foto real de la fachada.
 *  · Leyenda con puntos de color (Tixola · Catedral · Santa Eufemia) sobre el visor.
 *  · Panel con dirección (BUSINESS.address), plus code, "A un minuto de la Catedral" y CTAs
 *    "Cómo llegar" / "Abrir en Google Maps".
 *  · Disclosure "Ver mapa real": el <iframe> de Google Maps NO existe hasta que el usuario lo abre.
 *  · Enlace al camarero virtual con la pregunta "¿Cómo llego…?" precargada.
 */

const CityMap3D = dynamic(() => import("@/components/three/CityMap3D"), { ssr: false, loading: () => null });

const EMBED_URL = `https://www.google.com/maps?q=${BUSINESS.geo.lat},${BUSINESS.geo.lng}&z=17&output=embed`;
const FACHADA_ID = "fachada";

/* ────────────────────────────────────────────────────────────
   Error boundary: si WebGL falla (contexto no disponible, driver bloqueado…) volvemos a la foto.
   ──────────────────────────────────────────────────────────── */
interface BoundaryProps {
  onError: () => void;
  children: ReactNode;
}

class MapErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError();
    if (process.env.NODE_ENV !== "production") {
      console.warn("[MapCard] El mapa 3D no pudo iniciarse; se muestra la foto de la fachada.", error, info.componentStack);
    }
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/* ────────────────────────────────────────────────────────────
   Fallback estático (foto real de la fachada + cristal)
   ──────────────────────────────────────────────────────────── */
function StaticFallback({ hidden, caption }: { hidden: boolean; caption: string }) {
  const locale = useLocale();
  /* `alt` en el idioma de la página (photos.ts está en español). */
  const fachada = useMemo(() => localizePhotoById(locale, FACHADA_ID), [locale]);
  return (
    <div
      aria-hidden={hidden}
      className={cn(
        "absolute inset-0 transition-opacity duration-700 ease-[var(--ease-out-expo)]",
        hidden ? "pointer-events-none opacity-0" : "opacity-100",
      )}
    >
      <Image
        src={fachada?.src ?? "/images/fachada.jpg"}
        alt={fachada?.alt ?? BUSINESS.name}
        fill
        sizes="(min-width: 1024px) 52vw, 100vw"
        className="object-cover"
        style={{ objectPosition: fachada?.focus ?? "50% 40%" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,12,12,0.12)_0%,rgba(12,12,12,0.3)_45%,rgba(12,12,12,0.9)_100%)]" />
      {/* resplandor rojo que sugiere la chincheta */}
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(216,50,60,0.35),transparent)] blur-2xl" />
      <div className="glass absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl px-4 py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pimenton text-cream shadow-neon">
          <MapPin className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate font-sans text-sm font-semibold text-cream">{BUSINESS.address.street}</p>
          <p className="truncate text-xs text-cream-muted">{caption}</p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Leyenda del mapa 3D
   ──────────────────────────────────────────────────────────── */
function Legend({ items, label }: { items: ReadonlyArray<{ text: string; dot: string }>; label: string }) {
  return (
    <ul
      aria-label={label}
      /* Fondo opaco, sin `backdrop-filter`: estos adornos están DENTRO del visor, así que su fondo
         es el canvas de CityMap3D, que repinta en continuo mientras el mapa gira. */
      className="absolute bottom-3 left-3 z-[6] flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-cream/10 bg-iron-900/90 px-3 py-1.5 font-caps text-[9px] uppercase tracking-[0.18em] text-cream-200 shadow-glass"
    >
      {items.map((item) => (
        <li key={item.text} className="inline-flex items-center gap-1.5">
          <span aria-hidden className={cn("h-2 w-2 shrink-0 rounded-full", item.dot)} />
          {item.text}
        </li>
      ))}
    </ul>
  );
}

/* ────────────────────────────────────────────────────────────
   Tarjeta
   ──────────────────────────────────────────────────────────── */
export interface MapCardProps {
  className?: string;
}

export default function MapCard({ className }: MapCardProps) {
  const m = useMessages();
  const t = useFormat();
  const { open: openChat } = useChat();
  const perf = usePerformanceTier();
  const frameRef = useRef<HTMLDivElement>(null);

  const [near, setNear] = useState(false); // ¿se ha acercado alguna vez al viewport? → montar Canvas
  const [active, setActive] = useState(false); // ¿está (casi) visible ahora? → bucle de render
  const [ready, setReady] = useState(false); // WebGL listo → desvanecer la foto
  const [failed, setFailed] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  /* Giro automático del mapa: WCAG 2.1 SC 2.2.2 (nivel A) exige un mecanismo de pausa para el
     movimiento automático de más de 5 s junto a otro contenido. Se para con el botón y también al
     primer arrastre (quien reposiciona el mapa a mano no quiere que se le vuelva a mover solo). */
  const [autoRotate, setAutoRotate] = useState(true);
  const [showEmbed, setShowEmbed] = useState(false);
  const embedId = useId();

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setActive(entry.isIntersecting);
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "260px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleReady = useCallback(() => setReady(true), []);
  const handleError = useCallback(() => {
    setFailed(true);
    setReady(false);
  }, []);

  const x = m.experience.map;
  const c = m.common;
  const show3D = perf.tier !== "low" && !perf.reducedMotion && near && !failed;
  const hint = perf.isTouch ? x.dragHintTouch : x.dragHint;

  const labels = useMemo(() => ({ tixola: x.legendYou, cathedral: x.legendCathedral, church: x.legendChurch }), [x]);
  const legend = useMemo(
    () => [
      { text: x.legendYou, dot: "bg-pimenton-light shadow-[0_0_8px_rgba(216,50,60,0.9)]" },
      { text: x.legendCathedral, dot: "bg-gold shadow-[0_0_8px_rgba(232,194,122,0.8)]" },
      { text: x.legendChurch, dot: "bg-cream-400" },
    ],
    [x],
  );

  const askWaiter = useCallback(() => openChat({ prefill: x.askWaiterPrefill, page: "home" }), [openChat, x.askWaiterPrefill]);

  return (
    <div className={cn("flex flex-col", className)}>
      <div ref={frameRef} className="glass-smoke relative overflow-hidden rounded-[28px] p-2 shadow-card">
        {/* Visor: aspecto fijo 4:3, táctil (pan-y deja el scroll vertical al navegador) */}
        <div
          className="relative aspect-[4/3] touch-pan-y select-none overflow-hidden rounded-[20px] bg-iron-900"
          onPointerDown={() => {
            setHintDismissed(true);
            setAutoRotate(false);
          }}
        >
          <StaticFallback hidden={ready} caption={x.subtitle} />

          {show3D && (
            <MapErrorBoundary onError={handleError}>
              <CityMap3D
                perf={perf}
                active={active}
                autoRotate={autoRotate}
                onReady={handleReady}
                labels={labels}
                ariaLabel={x.mapAria}
                className="absolute inset-0"
              />
            </MapErrorBoundary>
          )}

          {/* viñeta por encima del canvas (no bloquea el arrastre) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(12,12,12,0.6)_100%)]"
          />

          <div className="absolute left-3 top-3 z-[6] flex items-center gap-2">
            <span className="rounded-full border border-cream/10 bg-iron-900/90 px-3 py-1 font-caps text-[9px] uppercase tracking-[0.22em] text-cream/85">
              {ready ? x.view3d : x.photo}
            </span>
            {ready && !perf.reducedMotion && (
              <button
                type="button"
                /* Sin `stopPropagation` el `onPointerDown` del visor ya habría puesto autoRotate a
                   false y el clic lo volvería a encender: el botón haría lo contrario de su etiqueta. */
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setAutoRotate((v) => !v)}
                aria-pressed={!autoRotate}
                aria-label={autoRotate ? x.pauseRotation : x.playRotation}
                title={autoRotate ? x.pauseRotation : x.playRotation}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/10 bg-iron-900/90 text-cream-muted transition-colors duration-300 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pimenton-light"
              >
                {autoRotate ? <Pause className="h-3.5 w-3.5" aria-hidden /> : <Play className="h-3.5 w-3.5" aria-hidden />}
              </button>
            )}
          </div>

          {ready && <Legend items={legend} label={x.legend} />}

          {ready && !hintDismissed && (
            <span
              aria-hidden
              className="absolute right-3 top-3 z-[6] inline-flex items-center gap-1.5 rounded-full border border-cream/10 bg-iron-900/90 px-3 py-1.5 font-sans text-[11px] text-cream/80"
            >
              <RotateCw className="h-3.5 w-3.5" aria-hidden />
              {hint}
            </span>
          )}
        </div>

        {/* Panel de información */}
        <div className="px-3 pb-3 pt-4 md:px-4 md:pb-4 md:pt-5">
          <p className="mb-3 font-caps text-[10px] uppercase tracking-[0.3em] text-cream-muted">{x.kicker}</p>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pimenton/20 text-pimenton-light">
              <MapPin className="h-5 w-5" aria-hidden />
            </span>
            <address className="min-w-0 not-italic">
              <p className="font-display text-2xl leading-tight text-cream md:text-3xl">{BUSINESS.address.street}</p>
              <p className="mt-1 font-sans text-sm text-cream-muted">
                {BUSINESS.address.postalCode} {BUSINESS.address.city} · {x.plusCode}{" "}
                <span className="font-mono text-cream-200 tabular-nums">{BUSINESS.address.plusCode}</span>
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 font-sans text-sm font-medium text-gold">
                <Footprints className="h-4 w-4" aria-hidden />
                {x.distance}
              </p>
              <p className="mt-1 font-caps text-[10px] uppercase tracking-[0.22em] text-cream-faint">{x.area}</p>
            </address>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <NeonButton
              href={BUSINESS.social.directions}
              target="_blank"
              variant="primary"
              icon={<Navigation aria-hidden />}
              aria-label={c.cta.directionsAria}
              className="w-full sm:flex-1"
            >
              {c.cta.directions}
            </NeonButton>
            <NeonButton
              href={BUSINESS.social.googleMaps}
              target="_blank"
              variant="outline"
              iconRight={<ExternalLink aria-hidden />}
              className="w-full sm:flex-1"
            >
              {c.cta.openMaps}
            </NeonButton>
          </div>
        </div>
      </div>

      {/* Disclosure: mapa real de Google (el iframe solo existe cuando está abierto) */}
      <div className="mt-3">
        <button
          type="button"
          aria-expanded={showEmbed}
          aria-controls={embedId}
          onClick={() => setShowEmbed((v) => !v)}
          className="flex min-h-11 w-full items-center justify-between rounded-2xl border border-cream/10 bg-iron-900/50 px-4 py-2.5 font-sans text-sm text-cream-200 transition-colors hover:border-cream/25 hover:bg-iron-800/70"
        >
          <span className="inline-flex items-center gap-2">
            <Map className="h-4 w-4 text-cream-muted" aria-hidden />
            {showEmbed ? x.hideMap : x.realMap}
          </span>
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", showEmbed && "rotate-180")} aria-hidden />
        </button>

        {showEmbed && (
          <div id={embedId} className="mt-3 overflow-hidden rounded-2xl border border-cream/10 shadow-card">
            <iframe
              src={EMBED_URL}
              title={t(x.embedTitle, { brand: BUSINESS.name })}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-64 w-full bg-iron-900 md:h-80"
            />
          </div>
        )}
      </div>

      {/* Camarero virtual: "¿Cómo llego?" precargado */}
      <button
        type="button"
        onClick={askWaiter}
        className="mt-3 inline-flex min-h-11 items-center gap-2 self-start rounded-full px-2 font-sans text-sm text-cream-muted transition-colors hover:text-cream"
      >
        <MessageCircle className="h-4 w-4 text-pimenton-light" aria-hidden />
        <span className="underline decoration-cream/30 underline-offset-4">{x.askWaiter}</span>
      </button>
    </div>
  );
}
