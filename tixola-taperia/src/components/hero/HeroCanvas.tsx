"use client";

import Image from "next/image";
import { useMemo } from "react";
import { localizePhotoById } from "@/i18n/data";
import { useLocale, useMessages } from "@/i18n/LocaleProvider";

/* ──────────────────────────────────────────────────────────────
   La foto de la portada
   ────────────────────────────────────────────────────────────── */

/**
 * LA TERRAZA, a sangre y teñida al granate de la casa.
 *
 * Por aquí han pasado, en este orden: un lienzo WebGL, una tixola dibujada entera en CSS, una foto
 * de un plato RECORTADA del fondo y el isotipo de la marca en grande. Las dos últimas las tumbó el
 * cliente por el mismo motivo de fondo:
 *  · la foto recortada "rompía el color y quedaba pegada, prensada" — el gris del aro y el negro del
 *    mango no son de una paleta granate, y un recorte sobre un degradado siempre se nota;
 *  · el logotipo en grande dejaba la portada vacía, y con razón: la marca YA está en la cabecera,
 *    tres centímetros más arriba. Repetirla enorme es marca sobre marca, no contenido, y encima
 *    competía con el titular en el mismo registro (trazo crema fino contra tipografía crema fina).
 *
 * Esta foto resuelve las dos cosas a la vez. Al ir A SANGRE no tiene borde, así que no puede quedar
 * "pegada"; y el velo granate de abajo se la lleva a la paleta en vez de dejarla con su luz de día.
 * Enseña de golpe lo que dicen el titular y el subtítulo —comida, vino y el casco viejo de Ourense—,
 * que es el trabajo de una portada de tapería: dar hambre.
 *
 * EL ENCUADRE NO ES EL DE `photos.ts`. Allí la misma foto lleva `focus: "50% 45%"`, que es el bueno
 * para el recorte ALTO de la sección de experiencia. Aquí el recorte es ANCHO (1440×900 sobre un
 * cuadrado de 1000×1000 deja ver solo el 62 % del alto), y al 45 % se quedaba fuera justo lo que hay
 * que enseñar: la tixola, las croquetas y las copas. Al 82 % entran la mesa y la calle. En vertical
 * no hay desbordamiento que posicionar —la foto es cuadrada y la pantalla más alta que ancha—, así
 * que en el móvil se ve entera y manda la fachada de Santa Eufemia al fondo de la calle.
 *
 * OJO CON EL PIE DE FOTO: el edificio del fondo es la iglesia de SANTA EUFEMIA, no la Catedral (lo
 * dice el `alt` que ya estaba escrito en `photos.ts`). La Catedral está a un minuto andando, que es
 * lo que dice el subtítulo, pero no es lo que sale en la foto.
 */
const FOTO_ID = "terraza-catedral";
const FOTO_RESPALDO = "/images/terraza-catedral.jpg";

/**
 * Encuadre horizontal al 50 % y vertical al 82 %: ver arriba. Va como clase y no como `style` para
 * que viaje en el HTML del servidor sin un segundo pintado.
 */
const ENCUADRE = "object-[50%_82%]";

/* ──────────────────────────────────────────────────────────────
   Portada
   ────────────────────────────────────────────────────────────── */

/**
 * Fondo de la portada.
 *
 * YA NO HAY NADA ANIMADO AQUÍ, y eso es deliberado. Con el dibujo y con la foto recortada vivían en
 * este fichero un halo de calor que respiraba, chispas que subían y un vigía (`useHeroIdle`) que las
 * pausaba cuando nadie miraba la portada. Con una foto a sangre no hay nada que pausar: el único
 * movimiento de la portada es el alejamiento al hacer scroll, y ese lo lleva `HeroTransition` por
 * fuera, con GSAP, sobre el atributo `data-hero-canvas`. Añadir aquí un zoom lento tipo Ken Burns
 * sería pelearse con él sobre la superficie más grande de toda la web.
 *
 * COSTE. La foto es el LCP de la página: va con `priority` y `sizes="100vw"`. Los cinco velos son
 * capas de color que el compositor mezcla; ni un filtro, ni un `backdrop-filter`, ni un `blur`.
 *
 * ACCESIBILIDAD. La foto lleva su texto alternativo de verdad, el que ya estaba escrito en
 * `photos.ts` y traducido a los cuatro idiomas: es contenido, no adorno, y describe lo que se ve.
 *
 * El atributo `data-hero-canvas` del contenedor (que lo pone `<Hero />`) es el ancla del módulo de
 * scroll y de la QA visual: no cambiarlo sin mirar `HeroTransition`. El último hijo es el velo del
 * alejamiento, que anima ese módulo por `data-hero-dim`.
 */
export default function HeroCanvas() {
  const locale = useLocale();
  const m = useMessages();
  const foto = useMemo(() => localizePhotoById(locale, FOTO_ID), [locale]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-granate">
      <Image
        src={foto?.src ?? FOTO_RESPALDO}
        alt={foto?.alt ?? m.experience.photoCaption}
        fill
        priority
        sizes="100vw"
        quality={82}
        className={`object-cover ${ENCUADRE}`}
      />

      {/* ── Los velos, de abajo arriba ─────────────────────────────────────────────────
          1. Tinte granate plano: es lo que lleva la piedra dorada y el blanco del mantel a la paleta
             de la casa. Sin él la foto se ve de otra web.
          2. Brasa donde cae la mirada, para que el centro caliente siga estando donde estaba.
          3. Oscurecido vertical: la cabecera arriba, y abajo el fundido con la sección siguiente
             (termina en #3b1613 exacto, que es `--color-granate`, para que no se vea la costura).
          4. Lado del copy, SOLO escritorio: ahí el texto manda en la mitad izquierda.
          5. Velo de móvil: ahí el copy se pinta sobre la foto entera y hace falta más. Es `lg:hidden`
             porque en escritorio lo hace el anterior y sumarlos apagaría la foto. */}
      <div aria-hidden className="absolute inset-0 bg-[rgba(74,15,16,0.46)]" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_62%_40%,rgba(172,32,34,0.34)_0%,transparent_70%)]" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(42,15,13,0.82)_0%,rgba(42,15,13,0.3)_26%,rgba(42,15,13,0.45)_52%,rgba(42,15,13,0.9)_84%,#3b1613_100%)]" />
      <div aria-hidden className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(26,8,8,0.92)_0%,rgba(26,8,8,0.72)_32%,rgba(26,8,8,0.28)_56%,transparent_76%)] lg:block" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(26,8,8,0.55)_42%,rgba(26,8,8,0.88)_72%,#3b1613_100%)] lg:hidden" />

      {/* Viñeta: cierra el encuadre y manda la mirada al centro */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.52)_100%)]" />

      {/*
        Velo del alejamiento. Reposo en 0: si nadie lo anima, la portada se ve entera. No es negro
        plano sino un radial que oscurece mucho más los bordes que el centro, para que el alejamiento
        se lea como una pérdida de foco y no como "se apaga la luz". Cuesta lo que un color plano.
        Aquí hubo un `filter: blur(0 → 6px)` interpolado por fotograma sobre esta misma superficie,
        la más cara de toda la web; no vuelve.
      */}
      <div
        data-hero-dim
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_45%,rgba(42,15,13,0.45)_0%,rgba(42,15,13,0.78)_48%,rgba(42,15,13,1)_100%)] opacity-0"
      />
    </div>
  );
}
