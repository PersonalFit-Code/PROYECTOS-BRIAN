"use client";

import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import { getGsap } from "@/lib/gsap";
import { useCanAfford } from "@/hooks/usePerformanceTier";

/** `useLayoutEffect` en cliente (el pin se crea antes del primer pintado), `useEffect` en SSR. */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Recorrido del pin: la portada se queda quieta EXACTAMENTE mientras se la ve, ni un píxel más.
 *
 * El capítulo que se superpone sube a 1 px por píxel de scroll (con `pinSpacing: false` el anclaje no
 * le reserva hueco), así que su borde superior llega al borde de arriba de la pantalla —y tapa la
 * portada del todo— cuando el scroll alcanza el pie del documento de la portada. Desde donde empieza
 * el anclaje (`bottom bottom` si la portada es más alta que la pantalla, `top top` si no) eso son
 * siempre `min(alto de la portada, alto de la pantalla)` píxeles.
 *
 * Aquí había DOS constantes: 1 × vh en escritorio y 0,7 × vh en móvil, con el argumento de "menos
 * pulgar". El 1 de escritorio ES esta fórmula (allí la portada mide un viewport, así que `min` da vh)
 * y por eso en ordenador la transición ya se veía bien. El 0,7 de móvil soltaba el pin antes de
 * tiempo. Medido en un viewport de teléfono REAL (390 × 664, que es lo que deja Safari con sus dos
 * barras; con 390 × 844 emulados esto no se reproduce): la portada mide 869 px, el anclaje empieza en
 * el scroll 205 y recorría 0,7 × 664 = 465 px, o sea soltaba en el 670 con 199 px de portada TODAVÍA
 * a la vista. En ese único fotograma la portada pasaba de estar clavada a subir a 1 px por píxel:
 * velocidad 0 → 1 de golpe. Eso es el "brusco corte" que reportó el cliente.
 *
 * Alargarlo no cuesta scroll: con `pinSpacing: false` el anclaje no añade altura al documento (medido
 * antes y después: 9281 px en los dos casos), solo decide cuánto rato se queda quieta la portada. El
 * 0,7 no ahorraba pulgar, solo soltaba pronto.
 *
 * Sigue sin haber copia de este número en ningún otro sitio: `HeroCanvas` lo duplicaba para decidir
 * por su cuenta si la portada estaba tapada (necesitaba parar el lienzo WebGL) y ahora lee el almacén
 * `useHeroStillVisible` de este mismo fichero, que es el único que conoce el anclaje de verdad.
 */
const pinDistance = (hero: HTMLElement): number => Math.round(Math.min(hero.offsetHeight, window.innerHeight));

/**
 * Retardo del `scrub`, en segundos. Se EXPORTA porque el capítulo que se superpone (`<Chapter
 * overlapsHero>`) se ve a la vez que la portada durante todo el anclaje y tiene que arrastrar el mismo
 * retardo: sus capas `data-depth` iban con `scrub: true` (sin retardo ninguno) mientras el fondo de la
 * portada iba 0,6 s por detrás, así que en un golpe de pulgar —que en un teléfono es el gesto normal—
 * las dos capas visibles a la vez se movían en momentos distintos. Un solo número para las dos.
 */
export const OVERLAP_SCRUB = 0.6;

/**
 * Recorrido vertical del copy durante el anclaje, en píxeles (el punto de llegada no cambia: sigue
 * terminando 160 px más arriba, así que nada del bloque se mete debajo de la cabecera fija que no se
 * metiera ya antes).
 */
const COPY_RISE = 160;

/**
 * Coreografía del bloque de copy, que es la respuesta al segundo aviso del cliente ("no se llega a
 * ver bien el tema de ir a la carta"): el CTA "Ir a la Carta" vive en ese bloque.
 *
 * EL DIAGNÓSTICO, medido a 390 × 664 (un iPhone real en Safari; el botón mide 56 px de alto). No
 * entra entero sobre el pliegue hasta el scroll ~76 — a scroll 0 su borde inferior cae 69 px por
 * debajo, o sea que en la primera pantalla NO se ve. A partir de ahí lo que le pone fecha de
 * caducidad NO es el fundido sino la geometría: el capítulo de platos sube a 1 px por píxel de scroll
 * y su borde superior le tocaba el pie en el scroll 352 y lo tapaba entero en el 430. Encima se le
 * penalizaba dos veces, porque el fundido arrancaba a la vez que el anclaje (scroll 205) y para
 * cuando el capítulo lo alcanzaba ya estaba en 0,90 de opacidad, y en 0,77 al desaparecer.
 *
 * LA COREOGRAFÍA. Primero se retiene el bloque quieto y opaco (`COPY_HOLD`) hasta justo antes de que
 * el capítulo lo alcance, y después se sube a la MISMA velocidad a la que sube el capítulo, de modo
 * que el botón se mantiene por delante de su borde en vez de dejarse comer. Medido después: el borde
 * le llega en el 336 pero ya a opacidad 1,00, conserva ≥90 % de su alto a la vista hasta el 444
 * (opacidad 0,96) y no desaparece del todo hasta el 552 (opacidad 0,85). La ventana con el botón
 * prácticamente entero pasa de 276 px de scroll a 360 (+30 %), y hasta desaparecer, de 354 a 468
 * (+32 %). (Las cifras de "antes" salen interpoladas de la pasada de instrumentación previa, que iba
 * en saltos de 40 px; las de "después", de una pasada de 12 px. Las dos con el scrub ya asentado.)
 *
 * POR QUÉ 0,20 Y 0,25 Y NO UNA CUENTA EN TIEMPO DE EJECUCIÓN. La retención es "hasta el scroll 338 de
 * un anclaje 205 → 869", o sea 0,20 del recorrido; la subida son los 160 px de `COPY_RISE` a 1 px por
 * píxel, o sea 160/664 = 0,24 del recorrido. Se probó calcular la duración con la altura real de la
 * ventana (`COPY_RISE / distancia`) para que el 1:1 fuera exacto en cualquier pantalla, y no vale: la
 * duración de un tween se fija al crearlo e `invalidateOnRefresh` vuelve a leer los VALORES, no las
 * duraciones, así que al girar el teléfono se quedaría desfasada y encima de forma invisible. Con la
 * fracción fija, en el rango de alturas de teléfono que hay que aguantar (de los 568 px del 320 × 568
 * a unos 700) la subida va entre 1,13 y 0,91 px por píxel: el borde del capítulo con un margen de un
 * 10 %, de sobra para lo que se busca aquí.
 *
 * Y el arranque de la subida no da tirón aunque la velocidad pase de 0 a ~1 px/px: al contrario que
 * la posición del pin, que ScrollTrigger escribe sin suavizar, esta `y` va por el `scrub`, que
 * convierte ese escalón en una rampa de ~0,6 s.
 */
const COPY_HOLD = 0.2;
const COPY_LIFT = 0.25;

/**
 * Opacidad del velo al final del anclaje. El velo no es negro plano sino un radial que cierra el
 * encuadre por los bordes y deja el centro más limpio (`[data-hero-dim]`, dentro de `HeroCanvas`): así
 * el gesto se lee como una pérdida de foco y no solo como "se apaga la luz". Sustituye al
 * `filter: blur()` que llevaba esta misma capa, de ahí que llegue a 0,72 y no a 0,65.
 */
const DIM_MAX = 0.72;

/**
 * Progreso del pin a partir del cual damos la portada por TAPADA. No es 1: en el 0,85 al capítulo le
 * falta un 15 % del alto de la pantalla para taparla del todo (una tira de 100 px en un 390 × 664) y
 * ahí el velo ya va por 0,61 de los 0,72, así que no compensa seguir componiendo brasas, vaho y
 * pulsos del CTA por esa franja. (La justificación de antes —"el capítulo cubre el viewport antes de
 * que el recorrido termine"— dejó de ser cierta al atar el final del anclaje a la cobertura completa:
 * ahora las dos cosas ocurren en el mismo scroll. El valor sigue siendo bueno, y de hecho deja MENOS
 * portada viva que antes: 100 px de franja frente a los 269 px que quedaban con el recorrido corto.)
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
 *  - el copy (`#hero [data-hero-copy]`) aguanta quieto un tramo y después sube y se funde;
 *  - si el hero no expone esos atributos, solo se transforma `#hero`.
 *
 * Las tres cosas terminan EN EL MISMO SCROLL, que es además donde el pin suelta la portada y donde el
 * capítulo de platos acaba de taparla del todo: un solo remate en vez de tres tiempos sueltos.
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
        /* `duration: 1` en los defaults para que la línea de tiempo mida exactamente 1 y cada duración
           y posición de abajo sea DIRECTAMENTE una fracción del recorrido del anclaje.
           Sin esto, GSAP daba a cada tween su duración por defecto (0,5) y la línea medía 0,7 —lo que
           durase el tween más largo, el del copy—, así que el retroceso del fondo y el velo terminaban
           en el 0,714 del recorrido. Medido a 390 × 664 (anclaje 205 → 670): `scale` y velo llegaban a
           su valor final en el scroll 537 y los 133 px siguientes no movían NADA; la portada se quedaba
           congelada casi un tercio del gesto antes de que el pin la soltara, y justo después llegaba el
           tirón del suelte. El comentario que había decía lo contrario de lo que pasaba ("el texto se
           ha fundido al 70 % del recorrido"): era el FONDO el que acababa en el 70 % y el texto el que
           ocupaba el 100 %. */
        defaults: { ease: "none", duration: 1 },
        scrollTrigger: {
          trigger: hero,
          /* Si la portada es MÁS ALTA que la pantalla (teléfono bajo: la foto de la tixola tiene su
             banda y el copy no cabe debajo en 100svh) se ancla cuando su PIE llega al pie de la pantalla,
             no cuando su cabeza toca arriba. Anclada por arriba desde el primer píxel, lo que asoma por
             debajo del viewport (CTAs, valoración) no se vería nunca: el capítulo siguiente le pasa por
             encima y, al soltarse, la portada queda detrás. Así primero se recorre entera y luego se
             ancla, con el mismo recorrido y el mismo oscurecido. Se resuelve en cada `refresh`
             (`invalidateOnRefresh`), igual que `end`, por si cambia la altura al girar el móvil. */
          start: () => (hero.offsetHeight > window.innerHeight + 1 ? "bottom bottom" : "top top"),
          /* Se resuelve en cada `refresh`: al girar el móvil o cambiar de tamaño la ventana el
             recorrido se recalcula sin recrear el pin (antes venía de una dependencia del efecto).
             Que `start` cambie de rama al recalcular ya no puede dar un salto: las dos ramas se cruzan
             cuando la portada mide justo lo que la pantalla, y ahí `min(portada, pantalla)` vale lo
             mismo para las dos, así que el final del anclaje se mueve de forma continua con la altura.
             Tampoco depende ya del ancho: el `matchMedia("(max-width: 767px)")` de antes hacía saltar
             el recorrido 0,3 × vh de golpe al cruzar los 768 px al girar una tableta. */
          end: () => `+=${pinDistance(hero)}`,
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

      /* TODOS los tweens de esta línea de tiempo van con `fromTo` EXPLÍCITO, y no es estilo: es la
         única forma de que el estado de reposo siga siendo el de reposo después de un `refresh`.
         Con `invalidateOnRefresh: true`, un `to()` vuelve a capturar su punto de PARTIDA leyendo el
         valor que la propiedad tenga en ese instante; si el refresh cae con el anclaje a medias, ese
         valor es el animado (scale 0,95, opacity 0,4) y la portada ya no puede volver a `scale: 1` /
         `opacity: 1` al subir: se queda encogida y quieta. No es teórico en un teléfono — `pinDistance`
         depende de `window.innerHeight` y, al plegarse la barra de direcciones de Safari (664 → ~745),
         salta un `resize` y con él un `ScrollTrigger.refresh()` justo en mitad del anclaje, que ahora
         además dura un 43 % más. Este proyecto ya ha tenido tres veces el fallo de "portada encogida y
         quieta"; el velo ya se protegía así y los otros dos tweens no, que era el hueco que quedaba. */
      if (dim) tl.fromTo(dim, { opacity: 0 }, { opacity: DIM_MAX }, 0);

      if (art) {
        tl.fromTo(art, { scale: 1, yPercent: 0 }, { scale: 0.92, yPercent: -3, transformOrigin: "50% 45%" }, 0);
      } else {
        /* Sin capa de fondo identificable: encogemos la portada entera. */
        tl.fromTo(hero, { scale: 1 }, { scale: 0.94, transformOrigin: "50% 40%" }, 0);
      }

      if (copy) {
        /* Subida y fundido van en DOS tweens porque necesitan curvas distintas, no por capricho: la
           subida tiene que ser lineal para copiar la velocidad del borde del capítulo (cualquier ease
           la haría ir más lenta justo en el tramo en que la carrera se decide) y el fundido tiene que
           entrar plano para no apagar el botón mientras todavía se le ve. GSAP no admite una curva por
           propiedad dentro de un mismo `to`, y son propiedades distintas, así que no hay dos escritores
           peleándose por lo mismo. */
        tl.fromTo(copy, { y: 0 }, { y: -COPY_RISE, duration: COPY_LIFT }, COPY_HOLD);
        /* El fundido sí llega hasta el final del anclaje: cuando el capítulo ya ha tapado el botón, la
           parte alta del bloque (kicker y titular) sigue asomando por encima de su borde y es la que
           termina de irse. */
        tl.fromTo(copy, { opacity: 1 }, { opacity: 0, ease: "power1.in", duration: 1 - COPY_HOLD }, COPY_HOLD);
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
