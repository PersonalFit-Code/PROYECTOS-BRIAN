"use client";

import Lenis from "lenis";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { getGsap } from "@/lib/gsap";
import { useCanAfford, usePerformanceTier } from "@/hooks/usePerformanceTier";
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
  /** `true` cuando Lenis está activo (gama alta, sin `prefers-reduced-motion`). */
  enabled: boolean;
  /** Instancia viva de Lenis, o `null` (SSR, reduced motion, gama no alta o aún sin montar). Solo en handlers/efectos. */
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
 *  - Lenis en MODO TEMPORAL (`duration` + `easing`) sobre el scroll nativo de `window`, sincronizado
 *    con GSAP: `gsap.ticker` mueve a Lenis y cada frame de Lenis actualiza ScrollTrigger
 *    (`ScrollTrigger.update`).
 *  - En táctil no se toca el scroll nativo (`syncTouch: false`): el móvil conserva su inercia.
 *  - SOLO EN GAMA ALTA. El `lerp` de Lenis se aplica POR FOTOGRAMA: con `lerp: 0.09` un portátil a
 *    35-45 fps acumulaba 220-290 ms de retraso entre la rueda y el movimiento — y el retraso crecía
 *    justo cuando el equipo iba más apretado. En gama media el scroll NATIVO responde al instante y el
 *    aire cinematográfico lo sostienen igual GSAP y ScrollTrigger, que no necesitan Lenis para nada.
 *    Como la gama solo baja (trinquete), si la sonda degrada el equipo a media Lenis se destruye y el
 *    scroll pasa a nativo: la degradación siempre va hacia "responde más rápido".
 *  - Se para solo mientras un modal bloquea el `overflow` del body (menú móvil, reserva, chat) y
 *    permite el scroll interno de esos paneles (`allowNestedScroll`).
 *  - Intercepta los enlaces `a[href*="#"]` de la misma página para desplazarse con Lenis dejando
 *    hueco a la cabecera fija, actualiza el hash y lleva el foco a la sección. Al cargar con
 *    `#hash` corrige la posición con el mismo hueco.
 *  - `ScrollTrigger.refresh()` tras montar Lenis, cuando cargan las fuentes y cuando cambia la
 *    altura del documento (imágenes, contenido diferido).
 */
export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  /* `can("smoothScroll")` ya contempla `prefers-reduced-motion` y el suelo de gama; encima exigimos
     gama ALTA porque el suavizado por interpolación se paga en latencia de entrada (ver el doc). */
  const smoothAllowed = useCanAfford("smoothScroll");
  const { tier, measured } = usePerformanceTier();
  /*
   * Gama alta Y MEDIDA. La condición anterior (`tier === "high"` a secas) partía de la heurística
   * optimista, que en cualquier escritorio dice "high": Lenis se montaba en el primer render, la sonda
   * medía la portada CON la escena 3D encendida y, si el portátil no llegaba, ~2 s después de cargar la
   * home el provider se desmontaba, destruía Lenis y el TACTO DEL SCROLL cambiaba en vivo delante del
   * cliente. El recorte está aprobado; que se vea como un fallo a mitad de demo, no.
   * Exigiendo la medición el interruptor se acciona UNA sola vez y siempre hacia arriba: hasta el
   * veredicto el scroll es el nativo (que responde al instante) y después se suaviza solo si el equipo lo
   * ha demostrado. Como el almacén es un trinquete, una vez medido en alta ya no puede bajar sola.
   * Si no hay veredicto (WebGL bloqueado, renderizador por software, la portada fuera de pantalla durante
   * la medición) se queda en nativo: es el lado seguro.
   */
  const enabled = smoothAllowed && tier === "high" && measured;
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
      /* Modo TEMPORAL en vez de `lerp`: la duración es un tiempo real (0,8 s hasta el destino) y no
         una fracción por fotograma, así que la latencia percibida NO escala con la tasa de fotogramas.
         Con `lerp: 0.09` el mismo gesto tardaba ~90 ms a 120 fps y ~290 ms a 35 fps. */
      duration: 0.8,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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
    /* A VERIFICAR EN HARDWARE REAL (aquí no se puede medir: el contenedor solo tiene WebGL por
       software). Con `lagSmoothing(0)` GSAP nunca recorta un `delta` grande: un fotograma perdido
       llegaba entero al `scrub: 0.6` del pin de la portada y se veía como un salto. Con el umbral
       activo, un parón de más de 200 ms se contabiliza como 25 ms y el scrub se recupera suavemente.
       Si en el portátil real se notara deriva entre Lenis y los triggers, volver a `lagSmoothing(0)`. */
    gsap.ticker.lagSmoothing(200, 25);

    /* Recalcular posiciones: al montar, con las fuentes cargadas y cuando cambia la altura del documento. */
    let disposed = false;
    const refresh = () => {
      if (!disposed) ScrollTrigger.refresh();
    };
    const debouncedRefresh = debounce(refresh, 180);

    /* Modales: cuando bloquean el overflow del body paramos Lenis (y lo reanudamos al cerrar).
       El atributo `data-scroll-lock` del `<html>` se comprueba PRIMERO porque `getComputedStyle` fuerza
       un recálculo de estilo síncrono, y esto se ejecuta en la MISMA tarea que el clic que abre el
       modal: justo donde más se nota el retardo. El respaldo por estilo computado se mantiene para no
       depender del orden en que cada modal escriba una cosa y la otra. */
    const syncLock = () => {
      const locked = html.hasAttribute("data-scroll-lock") || getComputedStyle(document.body).overflowY === "hidden";
      if (locked && !lenis.isStopped) lenis.stop();
      else if (!locked && lenis.isStopped) {
        lenis.start();
        /* Al reanudar se refresca SIEMPRE: mientras Lenis estaba parado el ResizeObserver de abajo ignora
           los cambios de altura, y un panel que añade contenido al documento (o un `details` que se abre
           detrás del velo) dejaría las posiciones de los triggers obsoletas sin que nada volviera a
           notificarlo. Está antirrebotado, así que abrir y cerrar modales no acumula refrescos. */
        debouncedRefresh();
      }
    };
    const lockObserver = new MutationObserver(syncLock);
    lockObserver.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
    lockObserver.observe(html, { attributes: true, attributeFilter: ["data-scroll-lock"] });
    syncLock();

    refresh();
    if ("fonts" in document) {
      void document.fonts.ready.then(refresh);
    }
    /* Solo la ALTURA del documento invalida de verdad las posiciones de los triggers. El ancho cambiaba
       ~15 px cada vez que un modal escribía `overflow: hidden` en el body y desaparecía la barra de
       scroll, y eso disparaba un `ScrollTrigger.refresh()` COMPLETO 180 ms después de abrirlo: todos
       los triggers recalculados en medio de la animación de apertura. Tampoco se refresca con Lenis
       parado (modal abierto); al cerrarlo, cualquier cambio real de altura vuelve a notificarse. */
    const WIDTH_NOISE = 20;
    let lastHeight = document.body.offsetHeight;
    let lastWidth = document.body.offsetWidth;
    let firstResize = true;
    const sizeObserver = new ResizeObserver(() => {
      const height = document.body.offsetHeight;
      const width = document.body.offsetWidth;
      const heightChanged = height !== lastHeight;
      const widthChanged = Math.abs(width - lastWidth) > WIDTH_NOISE;
      /* La primera notificación llega al observar: ya hemos refrescado. */
      if (firstResize) {
        firstResize = false;
        lastHeight = height;
        lastWidth = width;
        return;
      }
      if (!heightChanged && !widthChanged) return;
      /* Con Lenis parado NO se marca el tamaño como visto: si se actualizara aquí, un cambio REAL de
         altura mientras un modal está abierto se consumiría y se descartaría —no hay otro evento de
         tamaño al cerrar el modal— y los ScrollTrigger se quedarían con posiciones obsoletas para
         siempre. Dejando `lastHeight` sin tocar, la siguiente notificación vuelve a verlo; y `syncLock`
         refresca además al reanudar, que cubre el caso sin más notificaciones. */
      if (lenis.isStopped) return;
      lastHeight = height;
      lastWidth = width;
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
