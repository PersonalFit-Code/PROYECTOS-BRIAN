"use client";

import Lenis from "lenis";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { getGsap } from "@/lib/gsap";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { ChapterRegistryProvider } from "./Chapter";

/* ──────────────────────────────────────────────────────────────
   Tipos públicos
   ────────────────────────────────────────────────────────────── */

/** Objetivo de un scroll: píxeles desde arriba, selector CSS (`"#platos"`) o el propio elemento. */
export type ScrollTarget = number | string | HTMLElement;

export interface SmoothScrollToOptions {
  /** Desplazamiento en px respecto al objetivo. Negativo = deja hueco arriba (p. ej. la cabecera fija). */
  offset?: number;
  /** Salta sin animación (útil al cargar con `#hash`). */
  immediate?: boolean;
  /** Duración en segundos; por defecto la curva exponencial de Lenis. */
  duration?: number;
  /** Bloquea el scroll del usuario hasta llegar al destino. */
  lock?: boolean;
  /** Se llama al terminar (también en el modo nativo, tras el desplazamiento). */
  onComplete?: () => void;
}

export interface SmoothScrollContextValue {
  /** `true` cuando Lenis está activo (sin `prefers-reduced-motion` y tier ≠ "low"). */
  enabled: boolean;
  /** Instancia viva de Lenis, o `null` (SSR, reduced motion, tier low o aún sin montar). Solo en handlers/efectos. */
  getLenis: () => Lenis | null;
  /** Scroll suave a un objetivo. Sin Lenis cae a `window.scrollTo` (con `scroll-behavior` nativo). */
  scrollTo: (target: ScrollTarget, options?: SmoothScrollToOptions) => void;
  /** Altura actual de la cabecera fija en px (variable CSS `--header-h`). */
  headerOffset: () => number;
}

/* ──────────────────────────────────────────────────────────────
   Utilidades
   ────────────────────────────────────────────────────────────── */

const DEFAULT_HEADER_H = 72;

/** Lee `--header-h` del :root (72 px por defecto). */
export function readHeaderHeight(): number {
  if (typeof window === "undefined") return DEFAULT_HEADER_H;
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--header-h").trim();
  const px = Number.parseFloat(raw);
  return Number.isFinite(px) ? px : DEFAULT_HEADER_H;
}

/** Resuelve selector/elemento/px a algo que Lenis y `window.scrollTo` entienden. */
function resolveTarget(target: ScrollTarget): number | HTMLElement | null {
  if (typeof target === "number") return target;
  if (target instanceof HTMLElement) return target;
  if (target === "top" || target === "#" || target === "") return 0;
  if (target.startsWith("#")) return document.getElementById(target.slice(1));
  return document.querySelector<HTMLElement>(target);
}

/** Posición absoluta (documento) del objetivo, para el modo nativo. */
function targetTop(target: number | HTMLElement): number {
  return typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY;
}

/** Scroll nativo (sin Lenis): respeta `prefers-reduced-motion` y avisa al terminar. */
function nativeScrollTo(target: number | HTMLElement, options: SmoothScrollToOptions = {}): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = Math.max(0, targetTop(target) + (options.offset ?? 0));
  const instant = options.immediate || reduced;
  window.scrollTo({ top, behavior: instant ? "auto" : "smooth" });
  if (!options.onComplete) return;
  if (instant) {
    options.onComplete();
    return;
  }
  /* `scrollend` no está en todos los navegadores: usamos un temporizador de respaldo. */
  const done = options.onComplete;
  let timer = 0;
  const finish = () => {
    window.removeEventListener("scrollend", finish);
    window.clearTimeout(timer);
    done();
  };
  window.addEventListener("scrollend", finish, { once: true });
  timer = window.setTimeout(finish, 900);
}

/** "/es/" → "/es" para comparar rutas con y sin barra final. */
function trimSlash(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

/**
 * Lleva el foco al destino de un ancla (lectores de pantalla y teclado continúan desde la sección),
 * sin provocar un segundo scroll. Si el destino no es enfocable se le da `tabindex="-1"` temporal.
 */
export function focusScrollTarget(el: HTMLElement): void {
  const hadTabIndex = el.hasAttribute("tabindex");
  if (!hadTabIndex) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  if (!hadTabIndex) el.addEventListener("blur", () => el.removeAttribute("tabindex"), { once: true });
}

/** Espera sin bloquear a `ms` y llama una sola vez por ráfaga (para observers que disparan en cascada). */
function debounce(fn: () => void, ms: number): () => void {
  let timer = 0;
  return () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(fn, ms);
  };
}

/**
 * CSS mínimo de Lenis (no podemos tocar globals.css): altura automática del html/body mientras
 * Lenis controla el scroll, contención del overscroll en zonas con scroll propio e iframes sin
 * puntero durante el desplazamiento (la rueda sobre el mapa no "atasca" el scroll). No aplicamos
 * `overflow: clip` al pararlo: los modales ya bloquean el overflow del body y `clip` en el raíz
 * puede reiniciar la posición de scroll en algunos navegadores.
 */
const LENIS_CSS = `
html.lenis, html.lenis body { height: auto; }
.lenis [data-lenis-prevent], .lenis [data-lenis-prevent-wheel], .lenis [data-lenis-prevent-touch] { overscroll-behavior: contain; }
.lenis.lenis-smooth iframe { pointer-events: none; }
`;

/* ──────────────────────────────────────────────────────────────
   Contexto
   ────────────────────────────────────────────────────────────── */

/**
 * Valor por defecto (fuera del provider, p. ej. en /carta): scroll nativo con la misma API,
 * así los componentes compartidos (Navbar, botones flotantes) no dependen de estar en la home.
 */
const FALLBACK_CONTEXT: SmoothScrollContextValue = {
  enabled: false,
  getLenis: () => null,
  scrollTo: (target, options) => {
    if (typeof window === "undefined") return;
    const resolved = resolveTarget(target);
    if (resolved !== null) nativeScrollTo(resolved, options);
  },
  headerOffset: readHeaderHeight,
};

const SmoothScrollContext = createContext<SmoothScrollContextValue>(FALLBACK_CONTEXT);

/** Acceso al scroll suave: `const { scrollTo, headerOffset } = useSmoothScroll(); scrollTo("#platos", { offset: -headerOffset() })`. */
export function useSmoothScroll(): SmoothScrollContextValue {
  return useContext(SmoothScrollContext);
}

/** Alias con el nombre de la librería: `useLenis().scrollTo(target, { offset })`. */
export const useLenis = useSmoothScroll;

/* ──────────────────────────────────────────────────────────────
   Provider
   ────────────────────────────────────────────────────────────── */

/**
 * Scroll cinematográfico de la home:
 *  - Lenis (lerp 0.09) sobre el scroll nativo de `window`, sincronizado con GSAP: `gsap.ticker`
 *    mueve a Lenis y cada frame de Lenis actualiza ScrollTrigger (`ScrollTrigger.update`).
 *  - En táctil no se toca el scroll nativo (`syncTouch: false`): el móvil conserva su inercia.
 *  - Desactivado (scroll normal) con `prefers-reduced-motion` o en dispositivos de tier "low".
 *  - Se para solo mientras un modal bloquea el `overflow` del body (menú móvil, reserva, chat) y
 *    permite el scroll interno de esos paneles (`allowNestedScroll`).
 *  - Intercepta los enlaces `a[href*="#"]` de la misma página para desplazarse con Lenis dejando
 *    hueco a la cabecera fija, actualiza el hash y lleva el foco a la sección. Al cargar con
 *    `#hash` corrige la posición con el mismo hueco.
 *  - `ScrollTrigger.refresh()` tras montar Lenis, cuando cargan las fuentes y cuando cambia la
 *    altura del documento (imágenes, contenido diferido).
 */
export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const { tier, reducedMotion } = usePerformanceTier();
  const enabled = !reducedMotion && tier !== "low";
  const lenisRef = useRef<Lenis | null>(null);

  const getLenis = useCallback(() => lenisRef.current, []);

  const scrollTo = useCallback((target: ScrollTarget, options: SmoothScrollToOptions = {}) => {
    if (typeof window === "undefined") return;
    const resolved = resolveTarget(target);
    if (resolved === null) return;
    const lenis = lenisRef.current;
    if (!lenis) {
      nativeScrollTo(resolved, options);
      return;
    }
    lenis.scrollTo(resolved, {
      offset: options.offset ?? 0,
      immediate: options.immediate,
      duration: options.duration,
      lock: options.lock,
      /* `force` permite el scroll programático aunque un modal acabe de cerrarse (Lenis parado). */
      force: true,
      onComplete: options.onComplete ? () => options.onComplete?.() : undefined,
    });
  }, []);

  /* 1 · Lenis + GSAP (solo cuando procede). */
  useEffect(() => {
    if (!enabled) return;

    const { gsap, ScrollTrigger } = getGsap();
    /* En móvil, la barra de direcciones cambia la altura del viewport al hacer scroll:
       no recalculamos (evita saltos en pins y triggers). */
    ScrollTrigger.config({ ignoreMobileResize: true });

    const html = document.documentElement;
    /* globals.css declara `scroll-behavior: smooth`; Lenis escribe scrollTop cada frame y el
       suavizado nativo lo convertiría en un tirón. Lo anulamos solo mientras Lenis vive. */
    const previousScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    const style = document.createElement("style");
    style.setAttribute("data-lenis-style", "");
    style.textContent = LENIS_CSS;
    document.head.appendChild(style);

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
      anchors: false,
      autoResize: true,
      allowNestedScroll: true,
    });
    lenisRef.current = lenis;

    /* Lenis → ScrollTrigger: cada frame de scroll suavizado actualiza los triggers. */
    const unsubscribeScroll = lenis.on("scroll", () => ScrollTrigger.update());
    /* GSAP → Lenis: un único reloj para todo (sin rAF duplicados). */
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    /* Modales: cuando bloquean el overflow del body paramos Lenis (y lo reanudamos al cerrar). */
    const syncLock = () => {
      const locked = getComputedStyle(document.body).overflowY === "hidden";
      if (locked && !lenis.isStopped) lenis.stop();
      else if (!locked && lenis.isStopped) lenis.start();
    };
    const lockObserver = new MutationObserver(syncLock);
    lockObserver.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
    syncLock();

    /* Recalcular posiciones: al montar, con las fuentes cargadas y cuando cambia la altura del documento. */
    let disposed = false;
    const refresh = () => {
      if (!disposed) ScrollTrigger.refresh();
    };
    refresh();
    if ("fonts" in document) {
      void document.fonts.ready.then(refresh);
    }
    const debouncedRefresh = debounce(refresh, 180);
    let firstResize = true;
    const sizeObserver = new ResizeObserver(() => {
      /* La primera notificación llega al observar: ya hemos refrescado. */
      if (firstResize) {
        firstResize = false;
        return;
      }
      debouncedRefresh();
    });
    sizeObserver.observe(document.body);

    return () => {
      disposed = true;
      sizeObserver.disconnect();
      lockObserver.disconnect();
      unsubscribeScroll();
      gsap.ticker.remove(tick);
      /* Valores por defecto de GSAP (500 ms, 33 ms). */
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
      style.remove();
      html.style.scrollBehavior = previousScrollBehavior;
    };
  }, [enabled]);

  /* 2 · Anclas de la misma página y hash inicial (con o sin Lenis, para respetar la cabecera fija). */
  useEffect(() => {
    const goToHash = (hash: string, immediate: boolean) => {
      const id = decodeURIComponent(hash.replace(/^#/, ""));
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      scrollTo(el, { offset: -readHeaderHeight(), immediate, onComplete: () => focusScrollTarget(el) });
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const origin = event.target;
      if (!(origin instanceof Element)) return;
      const anchor = origin.closest("a[href*='#']");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download") || anchor.hasAttribute("data-lenis-ignore")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      /* Otra ruta (p. ej. /es/carta#croquetas desde la home): navegación normal de Next. */
      if (trimSlash(url.pathname) !== trimSlash(window.location.pathname)) return;

      const id = decodeURIComponent(url.hash.slice(1));
      const el = id ? document.getElementById(id) : null;
      if (id && !el) return;

      event.preventDefault();
      if (el) scrollTo(el, { offset: -readHeaderHeight(), onComplete: () => focusScrollTarget(el) });
      else scrollTo(0);

      const nextHash = id ? `#${id}` : "";
      if (window.location.hash !== nextHash) {
        window.history.pushState(null, "", `${window.location.pathname}${window.location.search}${nextHash}`);
      }
    };

    /* Atrás/adelante entre anclas. */
    const onHashChange = () => goToHash(window.location.hash, false);

    /* Fase de captura: se ejecuta antes que el onClick de <Link>, que respeta `defaultPrevented`. */
    document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", onHashChange);

    /* Hash inicial: el navegador ya saltó, corregimos el hueco de la cabecera tras el primer frame. */
    const raf = window.requestAnimationFrame(() => goToHash(window.location.hash, true));

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", onHashChange);
      window.cancelAnimationFrame(raf);
    };
  }, [scrollTo]);

  const value = useMemo<SmoothScrollContextValue>(
    () => ({ enabled, getLenis, scrollTo, headerOffset: readHeaderHeight }),
    [enabled, getLenis, scrollTo],
  );

  return (
    <SmoothScrollContext.Provider value={value}>
      <ChapterRegistryProvider>{children}</ChapterRegistryProvider>
    </SmoothScrollContext.Provider>
  );
}
