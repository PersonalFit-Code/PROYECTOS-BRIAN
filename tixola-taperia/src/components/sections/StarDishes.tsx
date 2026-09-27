"use client";

import { ArrowRight } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import DishCarousel from "@/components/ui/DishCarousel";
import DishCarousel3D from "@/components/ui/DishCarousel3D";
import DishSpotlight from "@/components/ui/DishSpotlight";
import type { DishPhoto, DishSlide } from "@/components/ui/DishVisual";
import NeonButton from "@/components/ui/NeonButton";
import { useReservation } from "@/components/ui/ReservationProvider";
import SectionHeading from "@/components/ui/SectionHeading";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { localizePhotos, localizeStarDishes } from "@/i18n/data";
import { useFormat, useLocale, useLocalePath, useMessages } from "@/i18n/LocaleProvider";

/**
 * StarDishes — sección "Platos estrella" (#platos) de la home.
 *
 *  · Carrusel cilíndrico en 3D (DishCarousel3D): los platos ocupan las caras de un cilindro que se
 *    arrastra para girar. Los que tienen foto en el manifiesto (`@/data/photos`) o en `StarDish.image`
 *    la muestran; los demás lucen la tixola compuesta (DishVisual, sin emojis).
 *  · Pulsar la cara de delante abre el detalle (DishSpotlight) con la foto como elemento compartido;
 *    pulsar una lateral la trae al frente. Mientras el detalle está abierto el giro se pausa.
 *  · En gama baja o con `prefers-reduced-motion` se sirve el carrusel plano (DishCarousel, Embla): sin
 *    perspectiva ni giro continuo, mismo contenido y mismo detalle al pulsar.
 *  · Fondo de hierro fundido con brasa roja PREHORNEADA (capa `data-depth` para la profundidad del
 *    capítulo), cabecera, carrusel y CTA final revelados con `data-reveal` (CSS + IntersectionObserver).
 *
 * Los efectos se escalan con usePerformanceTier(): en tier "low" o con `prefers-reduced-motion` no hay
 * vapor ni autoplay.
 */

export default function StarDishes() {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();
  const lp = useLocalePath();
  const { tier, reducedMotion } = usePerformanceTier();
  const { open: openReservation } = useReservation();

  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef);

  const [spotlight, setSpotlight] = useState<DishSlide | null>(null);

  const steam = tier !== "low" && !reducedMotion;
  const autoplay = !reducedMotion;
  /* El cilindro pide perspectiva, `preserve-3d` y un giro continuo: en gama baja y con movimiento
     reducido se sirve el carrusel plano, que cuenta lo mismo sin nada de eso. */
  const use3D = tier !== "low" && !reducedMotion;

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
        photo = { src: fromManifest.src, alt: fromManifest.alt, focus: fromManifest.focus };
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
      className="noise after:noise-after relative overflow-hidden bg-iron bg-[url('/textures/iron.webp')] bg-cover bg-center"
    >
      {/* Capas de fondo: velo oscuro para legibilidad + brasa roja tras el carrusel (con profundidad) */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-iron)_0%,rgba(18,18,18,0.88)_18%,rgba(18,18,18,0.86)_82%,var(--color-iron)_100%)]"
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
      <div aria-hidden className="divider-iron absolute inset-x-0 top-0" />
      <div aria-hidden className="divider-iron absolute inset-x-0 bottom-0" />

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
        {use3D ? (
          <DishCarousel3D slides={slides} onOpen={setSpotlight} steam={steam} autoplay={autoplay} paused={spotlight !== null} />
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
          <p className="max-w-md text-xs leading-relaxed text-cream-faint">{m.dishes.ctaNote}</p>
        </div>
      </div>

      {/* Detalle del plato (portal en <body>) */}
      <DishSpotlight slide={spotlight} onClose={closeSpotlight} onReserve={openReservation} steam={steam} />
    </section>
  );
}
