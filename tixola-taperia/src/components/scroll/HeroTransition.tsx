"use client";

import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import { getGsap } from "@/lib/gsap";
import { useCanAfford } from "@/hooks/usePerformanceTier";

/** `useLayoutEffect` en cliente (el pin se crea antes del primer pintado), `useEffect` en SSR. */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Recorrido del pin como fracción de la altura del viewport (más corto en móvil: menos pulgar).
 *
 * Ya no hay copia de estos números en ningún otro sitio: `HeroCanvas` los duplicaba para decidir por su
 * cuenta si la portada estaba tapada (necesitaba parar el lienzo WebGL) y ahora lee el almacén
 * `useHeroStillVisible` de este mismo fichero, que es el único que conoce el anclaje de verdad.
 */
const PIN_DISTANCE_DESKTOP = 1;
const PIN_DISTANCE_MOBILE = 0.7;

/**
 * Opacidad del velo al final del anclaje. El velo no es negro plano sino un radial que cierra el
 * encuadre por los bordes y deja el centro más limpio (`[data-hero-dim]`, dentro de `HeroCanvas`): así
 * el gesto se lee como una pérdida de foco y no solo como "se apaga la luz". Sustituye al
 * `filter: blur()` que llevaba esta misma capa, de ahí que llegue a 0,72 y no a 0,65.
 */
const DIM_MAX = 0.72;

/**
 * Progreso del pin a partir del cual damos la portada por TAPADA. No es 1: con `scrub` el capítulo
 * que se superpone cubre el viewport antes de que el recorrido termine, y lo que nos interesa es
 * dejar de animar en cuanto ya no se ve nada.
 */
const COVERED_AT = 0.85;

/* ──────────────────────────────────────────────────────────────
   Almacén: "¿sigue viéndose la portada?"
   ────────────────────────────────────────────────────────────── */

/**
 * Lo alimenta el ScrollTrigger del pin (un solo escritor) y lo consumen la portada y su fondo para
 * PARAR sus animaciones en bucle. Sin esto, el indicador de scroll, el pulso del CTA y las brasas de la
 * tixola seguían corriendo con el hero anclado, oscurecido al 72 % y tapado por el capítulo de platos:
 * trabajo de compositor por fotograma para algo que nadie ve. Va fuera de React (patrón
 * `useSyncExternalStore` del repo) para que el ScrollTrigger pueda publicar desde su callback sin
 * provocar un render en cascada.
 */
let heroStillVisible = true;
const heroListeners = new Set<() => void>();

function publishHeroVisible(next: boolean): void {
  if (heroStillVisible === next) return;
  heroStillVisible = next;
  for (const notify of heroListeners) notify();
}

function subscribeHeroVisible(listener: () => void): () => void {
  heroListeners.add(listener);
  return () => {
    heroListeners.delete(listener);
  };
}

const getHeroVisibleSnapshot = () => heroStillVisible;
/* En servidor la portada se pinta entera: el valor de reposo es "sí, se ve". */
const getHeroVisibleServerSnapshot = () => true;

/**
 * `true` mientras la portada sigue a la vista (o no hay pin que diga lo contrario). Pensado para
 * apagar animaciones ambientales del hero, no para ocultar contenido: cuando no hay transición
 * (gama baja, `prefers-reduced-motion`) nunca pasa a `false`, así que el consumidor debe combinarlo
 * con su propia visibilidad en pantalla si quiere cubrir también ese caso.
 */
export function useHeroStillVisible(): boolean {
  return useSyncExternalStore(subscribeHeroVisible, getHeroVisibleSnapshot, getHeroVisibleServerSnapshot);
}

/* ──────────────────────────────────────────────────────────────
   Transición
   ────────────────────────────────────────────────────────────── */

/**
 * Transición cinematográfica de la portada. Se monta justo después de `<Hero />` y no renderiza
 * nada: ancla `#hero` durante el primer viewport de scroll y, mientras el siguiente capítulo se
 * desliza por encima (ver `<Chapter overlapsHero>`), la portada hace un "pull-back":
 *  - la capa del fondo (`#hero [data-hero-canvas]`) encoge 1 → 0.92 y sube un 3 %;
 *  - un velo radial dentro de esa capa (`[data-hero-dim]`) sube de 0 a 0.72 y cierra el encuadre;
 *  - el copy (`#hero [data-hero-copy]`) sube más rápido que el fondo y se funde (parallax a dos
 *    velocidades);
 *  - si el hero no expone esos atributos, solo se transforma `#hero`.
 *
 * El anclaje sobrevive a la retirada del 3D sin tocarse: el atributo `data-hero-canvas` sigue siendo el
 * ancla de este efecto, solo que ahora la capa que encoge es el dibujo en CSS (tixola, aceite, brasas)
 * en vez de un lienzo WebGL. Es el primer gesto cinematográfico que ve el cliente al bajar y se conserva
 * tal cual.
 *
 * SIN DESENFOQUE, PERO CON CIERRE DE ENCUADRE. Esta capa llevó un `filter: blur(0 → 6px)` interpolado
 * con `scrub` en cada fotograma del anclaje: el navegador tenía que refiltrar un buffer del viewport
 * completo (≈8 Mpx a dpr 2) mientras Lenis interpolaba y el capítulo siguiente se deslizaba encima. Era
 * la superficie más cara de toda la web y no vuelve. Sustituirlo por "más velo negro" NO era
 * equivalente —donde la cámara cambiaba de plano, la portada simplemente se apagaba—, así que el velo
 * pasó a ser un radial con caída hacia los bordes: el retroceso se lee con `scale 0.92` + `yPercent -3`
 * + un encuadre que se cierra, y el coste sigue siendo una capa compuesta sin filtro.
 *
 * El oscurecido va en un velo y no en un `filter: brightness()` de la capa. Motivo: el filtro se
 * escribía como `brightness(var(--hero-dim))` con la variable animada por GSAP, y el valor inicial
 * de esa variable no se capturaba como 1 sino como ~0 — la capa entera quedaba en
 * `brightness(0.000001)`, es decir, negra, y con ella la tixola y el fondo. Un velo opaco da el mismo
 * resultado visual, se compone en GPU sin repintar nada y no puede apagar la portada: `opacity` está
 * acotada a [0,1] y su valor de reposo (0) es justo el que deja verlo todo. El velo vive dentro de la
 * capa del fondo, así que oscurece el dibujo sin tocar el texto de la portada.
 *
 * Todo en un `gsap.context` revertido al desmontar. Sin pin con `prefers-reduced-motion` o gama baja
 * (`can("scrollCinema")` ya contempla ambas cosas).
 */
export default function HeroTransition() {
  const enabled = useCanAfford("scrollCinema");

  useIsomorphicLayoutEffect(() => {
    /* Sin pin no hay quien publique el estado: la portada se considera visible (se ve y se va con el
       scroll normal, así que quien quiera pausar debe mirar además si la tiene en pantalla). */
    if (!enabled) {
      publishHeroVisible(true);
      return;
    }
    const hero = document.getElementById("hero");
    if (!hero) return;

    /* `data-hero-canvas` se mantiene como nombre del ancla (lo pone `<Hero />` y lo mira la QA visual)
       aunque lo que hay dentro ya no sea un lienzo, sino el dibujo en CSS de la portada. */
    const art = hero.querySelector<HTMLElement>("[data-hero-canvas]");
    const dim = hero.querySelector<HTMLElement>("[data-hero-dim]");
    const copy = hero.querySelector<HTMLElement>("[data-hero-copy]");
    const { gsap } = getGsap();

    const ctx = gsap.context(() => {
      /* Por debajo del capítulo que se le superpone (z-10). */
      gsap.set(hero, { zIndex: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          /* Se resuelve en cada `refresh`: al girar el móvil o cambiar de tamaño la ventana el
             recorrido se recalcula sin recrear el pin (antes venía de una dependencia del efecto). */
          end: () => {
            const mobile = window.matchMedia("(max-width: 767px)").matches;
            return `+=${Math.round(window.innerHeight * (mobile ? PIN_DISTANCE_MOBILE : PIN_DISTANCE_DESKTOP))}`;
          },
          pin: true,
          /* Sin espaciado: el siguiente capítulo avanza sobre el hero fijo en vez de esperar. */
          pinSpacing: false,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 1,
          /* `will-change` solo mientras la transición está activa. Sin `filter`: solo se compone. */
          onToggle: (self) => {
            if (art) gsap.set(art, { willChange: self.isActive ? "transform" : "auto" });
            if (dim) gsap.set(dim, { willChange: self.isActive ? "opacity" : "auto" });
            publishHeroVisible(self.progress < COVERED_AT);
          },
          onUpdate: (self) => publishHeroVisible(self.progress < COVERED_AT),
          onRefresh: (self) => publishHeroVisible(self.progress < COVERED_AT),
        },
      });

      /* Oscurecido. `fromTo` explícito: el estado de reposo queda fijado en 0 aunque un refresh de
         ScrollTrigger vuelva a leer los valores iniciales a mitad del recorrido. */
      if (dim) tl.fromTo(dim, { opacity: 0 }, { opacity: DIM_MAX }, 0);

      if (art) {
        tl.to(art, { scale: 0.92, yPercent: -3, transformOrigin: "50% 45%" }, 0);
      } else {
        /* Sin capa de fondo identificable: encogemos la portada entera. */
        tl.to(hero, { scale: 0.94, transformOrigin: "50% 40%" }, 0);
      }

      if (copy) {
        /* El texto sube más deprisa que el fondo y se ha fundido al 70 % del recorrido. */
        tl.to(copy, { y: -160, opacity: 0, ease: "power1.in", duration: 0.7 }, 0);
      }
    }, hero);

    return () => {
      ctx.revert();
      /* Al desmontar el pin nadie publica: volvemos al valor de reposo. */
      publishHeroVisible(true);
    };
  }, [enabled]);

  return null;
}
