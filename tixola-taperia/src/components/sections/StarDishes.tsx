"use client";

import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ComponentType } from "react";
import DishCarousel from "@/components/ui/DishCarousel";
/* Solo el TIPO se importa de forma estática (se borra al compilar): el módulo del cilindro se pide en
   tiempo de ejecución y únicamente cuando toca. Ver `wants3D` más abajo. */
import type { DishCarousel3DProps } from "@/components/ui/DishCarousel3D";
import DishSpotlight from "@/components/ui/DishSpotlight";
import type { DishPhoto, DishSlide } from "@/components/ui/DishVisual";
import NeonButton from "@/components/ui/NeonButton";
import SectionHeading from "@/components/ui/SectionHeading";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { MENU_ITEMS } from "@/data/menu";
import { localizePhotos, localizeStarDishes } from "@/i18n/data";
import { useFormat, useLocale, useLocalePath, useMessages } from "@/i18n/LocaleProvider";

/**
 * StarDishes — sección "Platos estrella" (#platos) de la home.
 *
 *  · CON EL DEDO (teléfono y tableta) va el carrusel plano de Embla (DishCarousel); CON EL RATÓN, el
 *    cilindro en 3D (DishCarousel3D). El contenido y el detalle al pulsar son los mismos en los dos.
 *  · Los platos con foto en el manifiesto (`@/data/photos`) o en `StarDish.image` la muestran; los
 *    demás lucen la tixola compuesta (DishVisual, sin emojis).
 *  · Pulsar una tarjeta (o la cara de delante del cilindro) abre el detalle (DishSpotlight) con la
 *    foto como elemento compartido. Mientras el detalle está abierto el carrusel se pausa.
 *  · Fondo de hierro fundido con brasa roja PREHORNEADA (capa `data-depth` para la profundidad del
 *    capítulo), cabecera, carrusel y CTA final revelados con `data-reveal` (CSS + IntersectionObserver).
 *
 * Los efectos se escalan con usePerformanceTier(): en tier "low" o con `prefers-reduced-motion` no hay
 * vapor ni autoplay.
 */

/**
 * "¿Esto se maneja con el dedo?" — la pregunta que decide qué carrusel se monta.
 *
 * Se mira el puntero, no el ancho: una tableta de 1024 px se toca igual que un móvil. El segundo
 * término cubre la ventana estrecha de escritorio, donde la maqueta ya es la de móvil y el cilindro
 * no cabe con holgura.
 *
 * Va por `useSyncExternalStore` y no por un `useEffect` + `useState` para que el HTML del servidor y
 * el primer render del cliente coincidan sin parpadeo: el valor de reposo es `true` (el móvil manda,
 * así que a ciegas se sirve el carrusel plano) y coincide con el `usePerformanceTier`, que también
 * arranca en "low" durante la hidratación. En escritorio el cambio al cilindro ocurre en el primer
 * commit, igual que ya ocurría antes con la gama.
 */
const FINGER_QUERY = "(hover: none) and (pointer: coarse), (max-width: 767px)";

function subscribeFinger(onChange: () => void): () => void {
  const mql = window.matchMedia(FINGER_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

const getFingerSnapshot = (): boolean => window.matchMedia(FINGER_QUERY).matches;
const getFingerServerSnapshot = (): boolean => true;

function useFingerFirst(): boolean {
  return useSyncExternalStore(subscribeFinger, getFingerSnapshot, getFingerServerSnapshot);
}

export default function StarDishes() {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();
  const lp = useLocalePath();
  const { tier, reducedMotion } = usePerformanceTier();
  const fingerFirst = useFingerFirst();

  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef);

  const [spotlight, setSpotlight] = useState<DishSlide | null>(null);

  const steam = tier !== "low" && !reducedMotion;
  const autoplay = !reducedMotion;
  /*
   * EL CILINDRO NO SE SIRVE A UN DEDO. Es la respuesta al aviso del cliente sobre su iPhone ("el
   * scroll, sin tocar los botones de los laterales, no es muy cómodo, se traba un poco").
   *
   * Primero, a quién le pasaba: `usePerformanceTier` da tier "mid" en un iPhone (móvil y táctil no
   * suben de ahí) y `reducedMotion` es false, así que la condición de antes —`tier !== "low"`— le
   * servía el CILINDRO. Verificado a 390 × 664 con el HUD `?perf=1`: "tier mid / flags mobile touch",
   * y en la página, ocho `[data-dish-face]` y ningún `[data-dish-slide]`. No era una suposición.
   *
   * Después, qué se trababa. NO son los fotogramas: con eventos táctiles reales y la CPU frenada ×4
   * (lo que acerca este contenedor a un teléfono de gama media) los dos carruseles dan lo mismo
   * durante el gesto —mediana 33 ms, p90 33 ms—, así que la primera hipótesis ("el cilindro pinta
   * demasiado") se cayó al medirla. La primera medida que parecía darle la razón estaba hecha con
   * `prefers-reduced-motion`, que además apaga el vapor y los capítulos: comparaba dos páginas
   * distintas, no dos carruseles.
   *
   * Lo que se traba es EL ENCAJE AL SOLTAR. Golpes rectos, en tarjetas de ancho casi igual (Embla
   * 273 px, cilindro 248 px), midiendo si el plato llega a cambiar:
   *
   *     golpe de…        40 px   60 px   90 px   120 px   170 px
   *     Embla            vuelve  CAMBIA     ·    CAMBIA   CAMBIA
   *     cilindro         vuelve  vuelve  vuelve  vuelve   CAMBIA
   *
   * El cilindro necesita ~170 px —dos tercios de la tarjeta— para comprometerse; por debajo de eso
   * gira, y al levantar el dedo VUELVE al mismo plato. Un golpe de pulgar normal en un teléfono no
   * llega. Eso es exactamente "se traba un poco": el usuario desliza y el carrusel se le deshace el
   * gesto. Y sale de la aritmética de `onPanEnd`: encaja en la cara más cercana (hay que pasar de
   * media cara, o sea de medio ancho de tarjeta) y la inercia solo proyecta un 12 % de la velocidad,
   * que casi nunca alcanza. Embla usa el modelo de momento de la librería y se compromete con un
   * golpe corto, que es lo que hace el pulgar.
   *
   * Por qué no se retoca ese umbral y ya: el cilindro seguiría siendo un gesto hecho a mano contra
   * una librería que ya hace esto bien y que YA ESTÁ en el proyecto, y el ajuste habría que afinarlo
   * a ciegas para cada ancho de tarjeta. Con ratón el umbral duele mucho menos (hay flechas y puntos
   * al lado, y el ratón recorre 170 px sin despeinarse), así que allí se deja como está.
   *
   * Lo que sí se arregló dentro del cilindro —cortar el muelle de encaje al empezar el arrastre para
   * que no pise al dedo— se queda: ayuda igual con el ratón.
   *
   * Y el efecto no se pierde: con ratón —que es donde el cliente dijo que ya se veía bien— sigue
   * saliendo el cilindro. "Tiene que ser sobre todo cómodo para el usuario".
   */
  const wants3D = !fingerFirst && tier !== "low" && !reducedMotion;

  /* EL TELÉFONO NO SE BAJA EL CILINDRO. Con los dos carruseles importados de forma estática y la
     elección hecha en tiempo de ejecución, un iPhone descargaba el módulo entero del cilindro
     —geometría, `onPan`/`onPanEnd`, muelles de framer-motion— para no renderizarlo jamás. Antes al
     menos lo usaba; desde que el reparto va por puntero es peso muerto garantizado en el 100 % de los
     móviles, que es justo el público que manda. En un proyecto que echó Three.js por peso y descartó
     `streamdown` por 143 kB, esto no se deja pasar.
     Se hace con un `import()` a mano y no con `next/dynamic` porque así el carrusel plano SIGUE
     MONTADO mientras llega el chunk: con el `loading` de `next/dynamic` el escritorio enseñaría un
     hueco vacío entre el primer render (que siempre es el plano, porque `useFingerFirst` arranca en
     "dedo" para que servidor y cliente coincidan) y la llegada del módulo. */
  const [Cylinder, setCylinder] = useState<ComponentType<DishCarousel3DProps> | null>(null);
  useEffect(() => {
    if (!wants3D || Cylinder) return;
    let alive = true;
    void import("@/components/ui/DishCarousel3D").then((mod) => {
      /* La función va envuelta en otra: `setState` llama a lo que se le pasa si es una función, y sin
         el envoltorio React intentaría usar el componente como actualizador. */
      if (alive) setCylinder(() => mod.default);
    });
    return () => {
      alive = false;
    };
  }, [wants3D, Cylinder]);

  const use3D = wants3D && Cylinder !== null;

  /* Platos localizados + su foto: primero el manifiesto, después `dish.image`.
     El manifiesto se lee YA LOCALIZADO (`localizePhotos`), así que el `alt` descriptivo de cada foto
     viaja en los cuatro idiomas — es la imagen principal de la sección y del spotlight. La plantilla
     genérica `m.dishes.photoOf` queda solo para el caso sin entrada en el manifiesto. */
  const slides = useMemo<DishSlide[]>(() => {
    const photos = localizePhotos(locale);
    return localizeStarDishes(locale).map((dish) => {
      /* El manifiesto enlaza sus fotos con ids de platos estrella y/o de la carta, así que se prueban
         los dos: varios platos estrella nacen de un ítem de la carta y solo tienen foto por ese id. */
      const fromManifest = photos.find((p) => p.dishIds?.includes(dish.id) || p.dishIds?.includes(dish.menuId));
      let photo: DishPhoto | null = null;
      if (fromManifest) {
        photo = { src: fromManifest.src, srcTall: fromManifest.srcTall, alt: fromManifest.alt, focus: fromManifest.focus };
      } else if (dish.image) {
        photo = { src: dish.image, alt: t(m.dishes.photoOf, { name: dish.name }), focus: "50% 50%" };
      }
      return { dish, photo };
    });
  }, [locale, m.dishes.photoOf, t]);

  const closeSpotlight = useCallback(() => setSpotlight(null), []);

  return (
    <section
      ref={sectionRef}
      id="platos"
      className="noise after:noise-after relative overflow-hidden bg-granate bg-[url('/textures/iron.webp')] bg-cover bg-center"
    >
      {/* Capas de fondo: velo oscuro para legibilidad + brasa roja tras el carrusel (con profundidad) */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-granate)_0%,rgba(59,22,19,0.88)_18%,rgba(59,22,19,0.86)_82%,var(--color-granate)_100%)]"
      />
      {/* La brasa más grande de la web: hasta 1400×760 px. Llevaba `blur-3xl` (64 px de radio) encima de
          un degradado radial que ya era suave, y además se desplaza con el scroll (`data-depth`) dentro
          de un contenedor que en gama alta se escala: cada fotograma invalidaba su caché de rasterizado.
          Con la brasa horneada (`ember-glow`) se ve prácticamente igual y el desplazamiento sale gratis. */}
      <div
        aria-hidden
        data-depth="0.35"
        className="ember-glow absolute left-1/2 top-[55%] h-[80vw] max-h-[760px] w-[130vw] max-w-[1400px] -translate-x-1/2 -translate-y-1/2 rounded-full [--ember-a1:0.34]"
      />
      <div aria-hidden className="divider-granate absolute inset-x-0 top-0" />
      <div aria-hidden className="divider-granate absolute inset-x-0 bottom-0" />

      <div className="container-page relative pt-20 md:pt-28 lg:pt-32">
        <SectionHeading
          align="center"
          kicker={m.dishes.kicker}
          title={m.dishes.title}
          accent={m.dishes.accent}
          description={m.dishes.description}
        />
      </div>

      {/* Carrusel a sangre (fuera del contenedor) para que las tarjetas vecinas asomen por los bordes.
          Antes entraba con `whileInView` de Framer, que escribe `opacity` y `transform` en el nodo en
          cada fotograma del scroll de la portada, justo cuando compiten la portada y el cilindro.
          Ahora es `data-reveal`: la transición la lleva el compositor y el JS solo pone una clase. */}
      <div data-reveal className="relative mt-8 md:mt-12">
        {use3D && Cylinder ? (
          <Cylinder slides={slides} onOpen={setSpotlight} steam={steam} autoplay={autoplay} paused={spotlight !== null} />
        ) : (
          <DishCarousel slides={slides} onOpen={setSpotlight} steam={steam} autoplay={autoplay} paused={spotlight !== null} />
        )}
      </div>

      {/* CTA inferior */}
      <div className="container-page relative pb-20 md:pb-28 lg:pb-32">
        <div data-reveal className="mt-10 flex flex-col items-center gap-4 text-center [--reveal-delay:80ms] md:mt-14">
          <NeonButton href={lp("/carta")} variant="cream" size="lg" iconRight={<ArrowRight aria-hidden />}>
            {m.dishes.ctaMenu}
          </NeonButton>
          {/* El número de platos sale de la carta, no escrito a mano: esta frase decía "más de 80
              tapas" cuando la carta real tiene 47, porque era copy de la carta inventada que
              sobrevivió al cambio. Con el dato enchufado, el día que la carta crezca o encoja la
              frase se corrige sola. */}
          <p className="max-w-md text-xs leading-relaxed text-cream-faint">
            {t(m.dishes.ctaNote, { count: MENU_ITEMS.length })}
          </p>
        </div>
      </div>

      {/* Detalle del plato (portal en <body>) */}
      <DishSpotlight slide={spotlight} onClose={closeSpotlight} steam={steam} />
    </section>
  );
}
