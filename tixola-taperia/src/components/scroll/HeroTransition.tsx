"use client";

import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import { getGsap } from "@/lib/gsap";
import { useCanAfford } from "@/hooks/usePerformanceTier";

/** `useLayoutEffect` en cliente (el pin se crea antes del primer pintado), `useEffect` en SSR. */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Recorrido del pin como fracción de la altura del viewport (más corto en móvil: menos pulgar).
 *
 * OJO — estos dos números están DUPLICADOS en `HeroCanvas.tsx` (allí se llaman igual), que calcula por
 * su cuenta si la portada ya está tapada para dejar de pintar la escena. Mientras sean dos copias, un
 * cambio aquí hay que replicarlo allí. El sitio natural para unificarlas es el almacén de este mismo
 * fichero (`useHeroStillVisible`): HeroCanvas podría leer de él en vez de volver a medir el scroll,
 * pero eso acopla el paquete 3D al de scroll y se deja para una segunda pasada.
 */
const PIN_DISTANCE_DESKTOP = 1;
const PIN_DISTANCE_MOBILE = 0.7;

/**
 * Opacidad del velo negro al final del anclaje. Sube de 0,65 a 0,72 porque hemos retirado el
 * desenfoque del lienzo (ver abajo): el "pull-back" necesita algo más de oscuridad para leerse igual.
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
 * Lo alimenta el ScrollTrigger del pin (un solo escritor) y lo consume la portada para PARAR sus
 * animaciones en bucle. Sin esto, el indicador de scroll y el pulso del CTA seguían corriendo con el
 * hero anclado, oscurecido al 72 % y tapado por el capítulo de platos: trabajo de compositor por
 * fotograma para algo que nadie ve. Va fuera de React (patrón `useSyncExternalStore` del repo) para
 * que el ScrollTrigger pueda publicar desde su callback sin provocar un render en cascada.
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
 * desliza por encima (ver `<Chapter overlapsHero>`), la escena hace un "pull-back":
 *  - la capa 3D (`#hero [data-hero-canvas]`) encoge 1 → 0.92 y sube un 3 %;
 *  - un velo negro dentro de esa capa (`[data-hero-dim]`) sube de 0 a 0.72 y la oscurece;
 *  - el copy (`#hero [data-hero-copy]`) sube más rápido que la escena y se funde (parallax a dos
 *    velocidades);
 *  - si el hero no expone esos atributos, solo se transforma `#hero`.
 *
 * SIN DESENFOQUE. Antes, en gama alta, el lienzo llevaba un `filter: blur(0 → 6px)` interpolado con
 * `scrub` en cada fotograma del anclaje: el navegador tenía que refiltrar un buffer del viewport
 * completo (≈8 Mpx a dpr 2) mientras Three.js pintaba debajo, Lenis interpolaba y el capítulo
 * siguiente se deslizaba encima. Era la superficie más cara de toda la web y el retroceso ya se lee
 * con `scale 0.92` + `yPercent -3` + el velo de opacidad. Si alguna vez se recupera, el único gate
 * admisible es la gama MEDIDA en alta (`can("postprocessing")`/`glass`), nunca un recuento de núcleos.
 *
 * El oscurecido va en un velo y no en un `filter: brightness()` de la capa. Motivo: el filtro se
 * escribía como `brightness(var(--hero-dim))` con la variable animada por GSAP, y el valor inicial
 * de esa variable no se capturaba como 1 sino como ~0 — la capa entera quedaba en
 * `brightness(0.000001)`, es decir, negra, y con ella la tixola 3D y el fondo estático. Un velo
 * opaco da el mismo resultado visual, se compone en GPU sin repintar el lienzo y no puede apagar la
 * portada: `opacity` está acotada a [0,1] y su valor de reposo (0) es justo el que deja verlo todo.
 * El velo vive dentro de la capa 3D, así que oscurece la escena sin tocar el texto de la portada.
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

    const canvas = hero.querySelector<HTMLElement>("[data-hero-canvas]");
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
          /* `will-change` solo mientras la transición está activa. Ya sin `filter`: solo se compone. */
          onToggle: (self) => {
            if (canvas) gsap.set(canvas, { willChange: self.isActive ? "transform" : "auto" });
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

      if (canvas) {
        tl.to(canvas, { scale: 0.92, yPercent: -3, transformOrigin: "50% 45%" }, 0);
      } else {
        /* Sin capa 3D identificable: encogemos la portada entera. */
        tl.to(hero, { scale: 0.94, transformOrigin: "50% 40%" }, 0);
      }

      if (copy) {
        /* El texto sube más deprisa que la escena y se ha fundido al 70 % del recorrido. */
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
