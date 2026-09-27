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
/* OJO: estas dos constantes están DUPLICADAS respecto a HeroTransition.tsx:11-12, que es quien de
   verdad ancla la portada. No se importan a propósito: unificarlas obligaría a que este componente
   dependiera del módulo de scroll cinematográfico (que solo existe en gama media y alta) o al
   contrario, y ninguna de las dos direcciones es sana. Otro paquete expondrá el estado del anclaje
   como fuente única; hasta entonces, si cambian allí hay que cambiarlas aquí. */
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
    /* Se lee un atributo y no `getComputedStyle(document.body).overflowY`: consultar el estilo
       calculado fuerza un recálculo síncrono de estilo del documento entero, y esto se dispara en
       cada apertura y cierre de modal —el momento exacto en que el usuario espera que el panel
       aparezca al instante—. `data-scroll-lock` en <html> es una comparación de cadena.
       El `getComputedStyle` se conserva como respaldo mientras el paquete de modales no marque el
       atributo: sin él, la escena seguiría pintando detrás de un panel a pantalla completa. */
    const sync = () =>
      setLocked(
        document.documentElement.hasAttribute("data-scroll-lock") ||
          getComputedStyle(document.body).overflowY === "hidden",
      );
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-scroll-lock"] });
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

    /* El MediaQueryList se crea UNA vez y se guarda aquí. Antes `pinFraction()` llamaba a
       `window.matchMedia` dentro del manejador de scroll: 120 objetos MediaQueryList por segundo en
       un panel de 120 Hz, cada uno con su lista de listeners, todos para leer un booleano que solo
       cambia al girar el móvil. Ahora se consulta `.matches` y se escucha su propio evento. */
    const mobile = window.matchMedia("(max-width: 767px)");
    let pin = mobile.matches ? PIN_DISTANCE_MOBILE : PIN_DISTANCE_DESKTOP;

    const read = () => setCovered(window.scrollY >= window.innerHeight * pin);

    /* Throttle con rAF, como ya hace Navbar: el scroll puede disparar más veces que fotogramas hay,
       y todo lo que este manejador decide es un booleano que se consume al pintar. */
    let raf = 0;
    const sync = () => {
      if (raf !== 0) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        read();
      });
    };

    const onBreakpoint = () => {
      pin = mobile.matches ? PIN_DISTANCE_MOBILE : PIN_DISTANCE_DESKTOP;
      read();
    };

    read();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    mobile.addEventListener("change", onBreakpoint);

    const onVisibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (raf !== 0) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      mobile.removeEventListener("change", onBreakpoint);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return visible && !covered && !overlayLocked && !chatOpen;
}

/* ──────────────────────────────────────────────────────────────
   Wrapper
   ────────────────────────────────────────────────────────────── */

/* ──────────────────────────────────────────────────────────────
   Fundido bidireccional
   ────────────────────────────────────────────────────────────── */

/** Mismo fundido que la clase `duration-1000` del fallback: si cambia uno, cambia el otro. */
const FADE_MS = 1000;
/**
 * Tope para soltar el fallback aunque la sonda no haya cerrado su veredicto. Ocurre cuando la
 * portada se sale de pantalla durante la medición: con `frameloop: "demand"` los `useFrame` dejan de
 * ejecutarse y la sonda se queda a medias, legítimamente. Soltarlo no pierde nada, porque el camino
 * de vuelta lo vuelve a montar.
 */
const VERDICT_TIMEOUT_MS = 6000;

/**
 * Fases del fundido de salida. Existe `primed` porque una capa que se monta ya con `opacity-100` no
 * puede hacer transición: el navegador necesita haber visto el 0 en un fotograma anterior para poder
 * animar hasta el 1.
 *  · `primed` — fallback remontado a opacidad 0 (un solo fotograma).
 *  · `fading` — fallback subiendo a 1; el lienzo SIGUE pintando debajo.
 *  · `done`   — fundido terminado; ya se puede soltar el lienzo.
 *
 * Que el apagado esté EN MARCHA no es un estado: se deriva en el render de que la gama haya caído
 * con el lienzo ya pedido. Así el fallback se remonta en el mismo render en que desaparece la escena,
 * sin un `setState` dentro de un efecto que provocaría un fotograma intermedio con el hueco visible.
 */
type RetirementPhase = "primed" | "fading" | "done";

/**
 * Fondo 3D del hero. Monta el Canvas solo cuando el perfil lo permite (tier mid/high y sin
 * reduced-motion); mientras carga, y en el resto de casos, muestra el fallback estático. El
 * fallback se funde cuando la escena pinta su primer frame y se desmonta al terminar el fundido,
 * para que sus animaciones CSS (la tixola flotando, ocho brasas) no sigan corriendo detrás de un
 * lienzo opaco: el `Backdrop` de la escena cubre el viewport con alfa 1.
 *
 * El fundido va en LOS DOS SENTIDOS. Si la sonda de fotogramas de HeroScene decide que el equipo no
 * sostiene la escena, la gama cae a "low" y el lienzo tiene que desaparecer: en lugar de cortarlo en
 * seco —que es lo único que sabía hacer el error boundary— el fallback vuelve a montarse en opacidad
 * 0, sube a 1 con el mismo segundo de fundido y solo entonces se suelta el Canvas. Delante del
 * cliente, el apagado tiene que leerse como una decisión de dirección de arte y no como un fallo.
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
  const [retirement, setRetirement] = useState<RetirementPhase>("primed");
  /* ¿Ha llegado a pedirse el chunk de la escena? Solo entonces hay algo que retirar con fundido. */
  const [armed, setArmed] = useState(false);

  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);

  // El perfil arranca en "low" durante SSR/hidratación y se resuelve en cliente.
  const wants3D = !failed && profile.tier !== "low" && !profile.reducedMotion;
  /* Apagado en curso: la gama ha caído (sonda o error de WebGL) con el lienzo ya en marcha. */
  const retiring = armed && !wants3D;

  /*
   * Arranque diferido del chunk 3D.
   *
   * Antes `use3D` se resolvía en el PRIMER render de cliente, así que la petición del megachunk de
   * three.js salía a la vez que la hidratación de los ~26 componentes de cliente de la portada y
   * competía con ella por red y por hilo principal: los primeros clics llegaban tarde. El
   * HeroFallback estático ya viaja dentro del HTML del servidor, así que ese hueco está cubierto y
   * se puede esperar a que el hilo respire. `requestIdleCallback` con `timeout` para que no se
   * aplace indefinidamente en una pestaña ocupada, y `setTimeout` de respaldo en Safari, que
   * todavía no lo implementa.
   */
  useEffect(() => {
    if (!wants3D || armed) return;
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback;
    if (idle) {
      const handle = idle(() => setArmed(true), { timeout: 600 });
      const cancel = (window as Window & { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback;
      return () => cancel?.(handle);
    }
    const id = window.setTimeout(() => setArmed(true), 200);
    return () => window.clearTimeout(id);
  }, [wants3D, armed]);

  /*
   * Desmonta el fallback (y sus animaciones CSS) una vez terminado el fundido de entrada, pero NO
   * antes de que la sonda haya dado su veredicto: si va a degradar, mejor que el fallback siga ahí
   * y el cambio sea un fundido en vez de un remontaje. `VERDICT_TIMEOUT_MS` cubre el caso en que la
   * sonda se queda a medias porque la portada salió de pantalla (con `frameloop: "demand"` los
   * `useFrame` dejan de correr, y eso es lo correcto: no se mide una escena congelada).
   */
  useEffect(() => {
    if (!ready || !wants3D) return;
    const delay = profile.measured ? FADE_MS : VERDICT_TIMEOUT_MS;
    const id = window.setTimeout(() => setFallbackGone(true), delay);
    return () => window.clearTimeout(id);
  }, [ready, wants3D, profile.measured]);

  /* Un fotograma con el fallback a opacidad 0 antes de pedir el 1: sin él no hay nada que animar. */
  useEffect(() => {
    if (!retiring || retirement !== "primed") return;
    const raf = window.requestAnimationFrame(() => setRetirement("fading"));
    return () => window.cancelAnimationFrame(raf);
  }, [retiring, retirement]);

  /* Terminado el fundido, y solo entonces, se suelta el lienzo. */
  useEffect(() => {
    if (!retiring || retirement !== "fading") return;
    const id = window.setTimeout(() => setRetirement("done"), FADE_MS);
    return () => window.clearTimeout(id);
  }, [retiring, retirement]);

  /* El lienzo sobrevive al fundido de salida: se suelta cuando el fallback ya está opaco encima. */
  const showScene = armed && (wants3D || retirement !== "done");
  /* Durante `primed` el fallback está montado pero transparente; a partir de `fading`, opaco. */
  const fallbackHidden = retiring ? retirement === "primed" : ready && wants3D;
  const fallbackMounted = !(fallbackGone && wants3D);

  return (
    <div ref={wrapRef} aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {fallbackMounted && <HeroFallback hidden={fallbackHidden} />}
      {showScene && (
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
