"use client";

import { ChevronDown, ExternalLink, Footprints, Map, MapPin, Navigation, RotateCw } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useCallback, useEffect, useId, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import NeonButton from "@/components/ui/NeonButton";
import { BUSINESS } from "@/data/business";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { cn } from "@/lib/utils";

/**
 * MapCard — tarjeta de ubicación.
 *
 *  · Carga el mapa 3D (R3F) con `next/dynamic` y `ssr: false`, solo cuando la tarjeta se acerca
 *    al viewport y el dispositivo no es de gama baja. Mientras tanto (y como fallback definitivo)
 *    muestra la foto real de la fachada con un velo de cristal.
 *  · Panel con dirección, plus code, distancia a la Catedral y CTAs "Cómo llegar" / "Abrir en Google Maps".
 *  · Disclosure "Ver mapa real": el <iframe> de Google Maps NO se renderiza hasta que el usuario lo abre.
 */

const CityMap3D = dynamic(() => import("@/components/three/CityMap3D"), { ssr: false, loading: () => null });

const EMBED_URL = `https://www.google.com/maps?q=${BUSINESS.geo.lat},${BUSINESS.geo.lng}&z=17&output=embed`;

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
   Fallback estático (foto real + cristal)
   ──────────────────────────────────────────────────────────── */
function StaticFallback({ hidden }: { hidden: boolean }) {
  return (
    <div
      aria-hidden={hidden}
      className={cn(
        "absolute inset-0 transition-opacity duration-700 ease-[var(--ease-out-expo)]",
        hidden ? "pointer-events-none opacity-0" : "opacity-100",
      )}
    >
      <Image
        src="/images/fachada.jpg"
        alt="Fachada de Tixola Tapería en la Rúa Juan de Austria, con la terraza a pie de calle"
        fill
        sizes="(min-width: 1024px) 44vw, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,12,12,0.12)_0%,rgba(12,12,12,0.3)_45%,rgba(12,12,12,0.9)_100%)]" />
      {/* resplandor rojo que sugiere la chincheta */}
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(216,50,60,0.35),transparent)] blur-2xl" />
      <div className="glass absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl px-4 py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pimenton text-cream shadow-neon">
          <MapPin className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-cream">{BUSINESS.address.street}</p>
          <p className="truncate text-xs text-cream-muted">Junto a la Catedral · {BUSINESS.address.city}</p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Tarjeta
   ──────────────────────────────────────────────────────────── */
export interface MapCardProps {
  className?: string;
}

export default function MapCard({ className }: MapCardProps) {
  const perf = usePerformanceTier();
  const frameRef = useRef<HTMLDivElement>(null);

  const [near, setNear] = useState(false); // ¿se ha acercado alguna vez al viewport? → montar Canvas
  const [active, setActive] = useState(false); // ¿está (casi) visible ahora? → bucle de render
  const [ready, setReady] = useState(false); // WebGL listo → desvanecer la foto
  const [failed, setFailed] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
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

  const show3D = perf.tier !== "low" && near && !failed;
  const hint = perf.isTouch ? "Desliza para girar" : "Arrastra para girar";

  return (
    <div className={cn("relative", className)}>
      <div ref={frameRef} className="glass-smoke relative overflow-hidden rounded-[28px] p-2 shadow-card">
        {/* Visor: aspecto fijo 4:3, táctil (pan-y deja el scroll vertical al navegador) */}
        <div
          className="relative aspect-[4/3] touch-pan-y select-none overflow-hidden rounded-[20px] bg-iron-900"
          onPointerDown={() => setHintDismissed(true)}
        >
          <StaticFallback hidden={ready} />

          {show3D && (
            <MapErrorBoundary onError={handleError}>
              <CityMap3D perf={perf} active={active} onReady={handleReady} className="absolute inset-0" />
            </MapErrorBoundary>
          )}

          {/* viñeta + grano por encima del canvas (no bloquea el arrastre) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(12,12,12,0.6)_100%)]"
          />

          <span className="glass absolute left-3 top-3 z-[6] rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cream/85">
            {ready ? "Vista 3D" : "Foto real"}
          </span>

          {ready && !hintDismissed && (
            <span
              aria-hidden
              className="absolute bottom-3 right-3 z-[6] inline-flex items-center gap-1.5 rounded-full bg-iron-900/70 px-3 py-1.5 text-[11px] text-cream/80 backdrop-blur"
            >
              <RotateCw className="h-3.5 w-3.5" aria-hidden />
              {hint}
            </span>
          )}
        </div>

        {/* Panel de información */}
        <div className="px-3 pb-3 pt-4 md:px-4 md:pb-4 md:pt-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pimenton/20 text-pimenton-light">
              <MapPin className="h-5 w-5" aria-hidden />
            </span>
            <address className="min-w-0 not-italic">
              <p className="font-display text-lg leading-tight text-cream md:text-xl">{BUSINESS.address.street}</p>
              <p className="mt-1 text-sm text-cream-muted">
                {BUSINESS.address.postalCode} {BUSINESS.address.city} · Plus code{" "}
                <span className="font-mono text-cream-200 tabular-nums">{BUSINESS.address.plusCode}</span>
              </p>
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-gold">
                <Footprints className="h-4 w-4" aria-hidden />A 1 min de la Catedral
              </p>
            </address>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <NeonButton
              href={BUSINESS.social.directions}
              target="_blank"
              variant="primary"
              icon={<Navigation aria-hidden />}
              className="w-full sm:flex-1"
            >
              Cómo llegar
            </NeonButton>
            <NeonButton
              href={BUSINESS.social.googleMaps}
              target="_blank"
              variant="outline"
              iconRight={<ExternalLink aria-hidden />}
              className="w-full sm:flex-1"
            >
              Abrir en Google Maps
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
          className="flex min-h-11 w-full items-center justify-between rounded-2xl border border-cream/10 bg-iron-900/50 px-4 py-2.5 text-sm text-cream-200 transition-colors hover:border-cream/25 hover:bg-iron-800/70"
        >
          <span className="inline-flex items-center gap-2">
            <Map className="h-4 w-4 text-cream-muted" aria-hidden />
            {showEmbed ? "Ocultar mapa real" : "Ver mapa real"}
          </span>
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", showEmbed && "rotate-180")} aria-hidden />
        </button>

        {showEmbed && (
          <div id={embedId} className="mt-3 overflow-hidden rounded-2xl border border-cream/10 shadow-card">
            <iframe
              src={EMBED_URL}
              title={`Ubicación de ${BUSINESS.name} en Google Maps`}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-64 w-full bg-iron-900 md:h-80"
            />
          </div>
        )}
      </div>
    </div>
  );
}
