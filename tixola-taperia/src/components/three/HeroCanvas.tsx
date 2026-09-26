"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useChat } from "@/components/chat/ChatProvider";
import type { PerfProfile } from "@/hooks/usePerformanceTier";
import type { PointerVec } from "@/hooks/usePointerParallax";
import type { HeroLayout } from "./HeroScene";
import { cn } from "@/lib/utils";

/* El Canvas de R3F solo existe en cliente: import dinámico sin SSR. */
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false, loading: () => null });

export interface HeroCanvasProps {
  profile: PerfProfile;
  pointer: RefObject<PointerVec>;
  layout: HeroLayout;
  className?: string;
}

/* ──────────────────────────────────────────────────────────────
   Fallback estático (SSR, carga, tier "low", reduced-motion o error WebGL)
   ────────────────────────────────────────────────────────────── */

interface EmberSpec {
  left: number;
  bottom: number;
  size: number;
  delay: number;
  duration: number;
}

/* Brasas CSS deterministas (posición en %, tamaño en px, tiempos en s). */
const CSS_EMBERS: readonly EmberSpec[] = [
  { left: 44, bottom: 42, size: 3, delay: 0, duration: 3.8 },
  { left: 49, bottom: 46, size: 2, delay: 0.7, duration: 4.4 },
  { left: 53, bottom: 44, size: 3, delay: 1.4, duration: 3.6 },
  { left: 57, bottom: 40, size: 2, delay: 2.1, duration: 4.8 },
  { left: 47, bottom: 38, size: 2, delay: 2.9, duration: 4.1 },
  { left: 51, bottom: 48, size: 4, delay: 0.4, duration: 5.2 },
  { left: 55, bottom: 47, size: 2, delay: 1.9, duration: 3.9 },
  { left: 42, bottom: 45, size: 2, delay: 3.3, duration: 4.6 },
];

/**
 * Versión sin WebGL: hierro fundido, glow radial rojo y una tixola dibujada con CSS
 * (elipse en perspectiva con aceite, zamburiñas y mango). Todo con clases Tailwind.
 */
function HeroFallback({ hidden }: { hidden: boolean }) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden bg-iron transition-opacity duration-1000 ease-out",
        hidden ? "opacity-0" : "opacity-100",
      )}
    >
      {/* Textura de hierro */}
      <div className="absolute inset-0 bg-[url('/textures/iron.webp')] bg-cover bg-center opacity-55" />
      {/* Glow radial rojo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_48%_at_50%_56%,rgba(178,30,39,0.6),transparent_70%)] lg:bg-[radial-gradient(ellipse_48%_52%_at_66%_50%,rgba(178,30,39,0.6),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_100%,rgba(58,14,19,0.75),transparent_65%)]" />

      {/* Tixola CSS */}
      <div className="absolute left-1/2 top-[34%] w-[min(70vw,340px)] -translate-x-1/2 -translate-y-1/2 lg:left-[66%] lg:top-[48%] lg:w-[430px]">
        <div className="animate-float [perspective:900px]">
          <div className="relative aspect-square [transform:rotateX(58deg)] [transform-style:preserve-3d]">
            {/* Cuerpo */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,#3a3a3a_0%,#1d1d1d_46%,#0e0e0e_62%,#2a2a2a_66%,#151515_72%,#0a0a0a_100%)] shadow-[0_60px_90px_-20px_rgba(0,0,0,0.85),inset_0_0_60px_rgba(0,0,0,0.9)]" />
            {/* Aceite */}
            <div className="absolute inset-[17%] rounded-full bg-[radial-gradient(circle_at_38%_32%,rgba(232,194,122,0.7)_0%,rgba(150,85,25,0.45)_35%,rgba(40,18,6,0.7)_75%)] shadow-[inset_0_10px_30px_rgba(0,0,0,0.6)]" />
            {/* Zamburiñas */}
            <span className="absolute left-[37%] top-[35%] h-[11%] w-[11%] rounded-full bg-[#f1e2cc] shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
            <span className="absolute left-[54%] top-[38%] h-[11%] w-[11%] rounded-full bg-[#efdcc2] shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
            <span className="absolute left-[45%] top-[54%] h-[11%] w-[11%] rounded-full bg-[#f3e6d0] shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
            {/* Mango con anilla */}
            <div className="absolute left-[92%] top-1/2 h-[7%] w-[62%] -translate-y-1/2 rounded-full bg-gradient-to-r from-[#2c2c2c] via-[#151515] to-[#0c0c0c] shadow-[0_20px_30px_rgba(0,0,0,0.6)]">
              <span className="absolute right-[3%] top-1/2 aspect-square h-[72%] -translate-y-1/2 rounded-full border-[3px] border-[#262626] bg-[#0a0a0a]" />
            </div>
          </div>
        </div>
      </div>

      {/* Brasas CSS */}
      {CSS_EMBERS.map((e, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-ember animate-ember-rise shadow-[0_0_8px_rgba(255,106,61,0.9)]"
          style={{
            left: `${e.left}%`,
            bottom: `${e.bottom}%`,
            width: e.size,
            height: e.size,
            animationDelay: `${e.delay}s`,
            animationDuration: `${e.duration}s`,
          }}
        />
      ))}

      {/* Viñeta */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Boundary: si WebGL falla (contexto perdido, GPU bloqueada…) volvemos al fallback
   ────────────────────────────────────────────────────────────── */

interface BoundaryProps {
  children: ReactNode;
  onError: () => void;
}

class CanvasErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/* ──────────────────────────────────────────────────────────────
   Actividad: ¿el hero está en pantalla, la pestaña visible y sin ningún panel encima?
   ────────────────────────────────────────────────────────────── */

/**
 * Capítulo opaco que se desliza SOBRE la portada anclada (`<Chapter overlapsHero>`): mientras lo
 * cubre, el hero sigue "intersecando" pero no se ve nada de él.
 */
/**
 * Fracción del viewport que dura el anclaje de la portada en `HeroTransition`
 * (desktop 1, móvil 0.7). Pasado ese recorrido el capítulo siguiente la tapa por completo.
 */
const PIN_DISTANCE_DESKTOP = 1;
const PIN_DISTANCE_MOBILE = 0.7;

/**
 * ¿Hay un panel modal abierto sobre la portada? Los overlays a pantalla completa (menú móvil,
 * modal de reserva, detalle de plato, leyenda de alérgenos, visor de la galería) bloquean el
 * `overflow` del body, igual que detecta `SmoothScrollProvider` para parar Lenis: mientras dure
 * el bloqueo la escena no se ve y no debe pintar (ni obligar a recalcular el `backdrop-filter`
 * de esos paneles en cada fotograma).
 */
function useBodyScrollLocked(): boolean {
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const sync = () => setLocked(getComputedStyle(document.body).overflowY === "hidden");
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
    sync();
    return () => observer.disconnect();
  }, []);

  return locked;
}

function useSceneActivity(): boolean {
  const [visible, setVisible] = useState(true);
  const [covered, setCovered] = useState(false);
  const overlayLocked = useBodyScrollLocked();
  /* El panel del chat se abre sobre la portada sin bloquear el scroll del documento. */
  const { isOpen: chatOpen } = useChat();

  useEffect(() => {
    /* ¿Sigue viéndose la portada?
       Se mide por recorrido de scroll, no con un IntersectionObserver sobre el lienzo ni sobre el
       capítulo siguiente: `HeroTransition` ancla la portada con `pinSpacing: false`, de modo que la
       saca del flujo y desplaza el capítulo siguiente al origen. Con ese reacomodo el observador
       informaba "fuera de vista"/"tapada" ya en el montaje y la escena se quedaba en `demand`
       tras un único fotograma —negro—, con el fallback ya retirado: la portada aparecía vacía.
       El anclaje define exactamente el tramo en que la portada se ve, así que se usa como medida. */
    const pinFraction = () => (window.matchMedia("(max-width: 767px)").matches ? PIN_DISTANCE_MOBILE : PIN_DISTANCE_DESKTOP);
    const sync = () => setCovered(window.scrollY >= window.innerHeight * pinFraction());
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    const onVisibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return visible && !covered && !overlayLocked && !chatOpen;
}

/* ──────────────────────────────────────────────────────────────
   Wrapper
   ────────────────────────────────────────────────────────────── */

/**
 * Fondo 3D del hero. Monta el Canvas solo cuando el perfil lo permite (tier mid/high y sin
 * reduced-motion); mientras carga, y en el resto de casos, muestra el fallback estático. El
 * fallback se funde cuando la escena pinta su primer frame y se desmonta al terminar el fundido,
 * para que sus animaciones CSS (la tixola flotando, ocho brasas) no sigan corriendo detrás de un
 * lienzo opaco: el `Backdrop` de la escena cubre el viewport con alfa 1.
 *
 * El último hijo es el velo que oscurece la capa durante el anclaje de la portada; lo anima
 * `HeroTransition` por su atributo `data-hero-dim`. Va aquí, y no en el hero, porque debe apagar la
 * escena sin tocar el texto, y dentro del wrapper porque así hereda su transform y su recorte.
 */
export default function HeroCanvas({ profile, pointer, layout, className }: HeroCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const active = useSceneActivity();
  const [ready, setReady] = useState(false);
  const [fallbackGone, setFallbackGone] = useState(false);
  const [failed, setFailed] = useState(false);

  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);

  // El perfil arranca en "low" durante SSR/hidratación y se resuelve en cliente.
  const use3D = !failed && profile.tier !== "low" && !profile.reducedMotion;

  // Desmonta el fallback (y sus animaciones CSS) una vez terminado el fundido.
  useEffect(() => {
    if (!ready || !use3D) return;
    const id = window.setTimeout(() => setFallbackGone(true), 1200);
    return () => window.clearTimeout(id);
  }, [ready, use3D]);

  return (
    <div ref={wrapRef} aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {!(fallbackGone && use3D) && <HeroFallback hidden={ready && use3D} />}
      {use3D && (
        <div className={cn("absolute inset-0 transition-opacity duration-1000 ease-out", ready ? "opacity-100" : "opacity-0")}>
          <CanvasErrorBoundary onError={onError}>
            <HeroScene profile={profile} pointer={pointer} layout={layout} active={active} onReady={onReady} />
          </CanvasErrorBoundary>
        </div>
      )}
      {/* Velo del pull-back. Reposo en 0: si nadie lo anima, la portada se ve entera. */}
      <div data-hero-dim aria-hidden className="absolute inset-0 bg-iron-900 opacity-0" />
    </div>
  );
}
