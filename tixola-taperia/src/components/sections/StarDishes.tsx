"use client";

import { MotionConfig, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import DishCarousel from "@/components/ui/DishCarousel";
import DishSpotlight from "@/components/ui/DishSpotlight";
import type { DishPhoto, DishSlide } from "@/components/ui/DishVisual";
import NeonButton from "@/components/ui/NeonButton";
import { useReservation } from "@/components/ui/ReservationProvider";
import SectionHeading from "@/components/ui/SectionHeading";
import { photosForDish } from "@/data/photos";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { localizeStarDishes } from "@/i18n/data";
import { useFormat, useLocale, useLocalePath, useMessages } from "@/i18n/LocaleProvider";

/**
 * StarDishes — sección "Platos estrella" (#platos) de la home.
 *
 *  · Carrusel de fotos reales (DishCarousel, Embla): los platos con foto en el manifiesto (`@/data/photos`)
 *    o en `StarDish.image` la muestran; los demás lucen la tixola compuesta (DishVisual, sin emojis).
 *  · Pulsar una tarjeta abre el detalle (DishSpotlight) en todos los tamaños, con la foto como elemento
 *    compartido. Mientras está abierto el carrusel se pausa.
 *  · Fondo de hierro fundido con brasa roja (capa `data-depth` para la profundidad del capítulo), cabecera
 *    y CTA final revelados con GSAP (`data-reveal`), carrusel con `whileInView`.
 *
 * Los efectos se escalan con usePerformanceTier(): en tier "low" o con `prefers-reduced-motion` no hay
 * vapor ni autoplay.
 */

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

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

  /* Platos localizados + su foto: primero el manifiesto (`photosForDish`), después `dish.image`.
     El `alt` descriptivo del manifiesto está en español; en otros idiomas usamos la plantilla localizada. */
  const slides = useMemo<DishSlide[]>(
    () =>
      localizeStarDishes(locale).map((dish) => {
        const fromManifest = photosForDish(dish.id)[0];
        let photo: DishPhoto | null = null;
        if (fromManifest) {
          photo = {
            src: fromManifest.src,
            alt: locale === "es" ? fromManifest.alt : t(m.dishes.photoOf, { name: dish.name }),
            focus: fromManifest.focus,
          };
        } else if (dish.image) {
          photo = { src: dish.image, alt: t(m.dishes.photoOf, { name: dish.name }), focus: "50% 50%" };
        }
        return { dish, photo };
      }),
    [locale, m.dishes.photoOf, t],
  );

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
      <div
        aria-hidden
        data-depth="0.35"
        className="absolute left-1/2 top-[55%] h-[80vw] max-h-[760px] w-[130vw] max-w-[1400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(178,30,39,0.34),rgba(178,30,39,0.1)_48%,transparent_100%)] blur-3xl"
      />
      <div aria-hidden className="divider-iron absolute inset-x-0 top-0" />
      <div aria-hidden className="divider-iron absolute inset-x-0 bottom-0" />

      <MotionConfig reducedMotion="user">
        <div className="container-page relative pt-20 md:pt-28 lg:pt-32">
          <SectionHeading
            align="center"
            kicker={m.dishes.kicker}
            title={m.dishes.title}
            accent={m.dishes.accent}
            description={m.dishes.description}
          />
        </div>

        {/* Carrusel a sangre (fuera del contenedor) para que las tarjetas vecinas asomen por los bordes */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
          className="relative mt-8 md:mt-12"
        >
          <DishCarousel slides={slides} onOpen={setSpotlight} steam={steam} autoplay={autoplay} paused={spotlight !== null} />
        </motion.div>

        {/* CTA inferior */}
        <div className="container-page relative pb-20 md:pb-28 lg:pb-32">
          <div data-reveal className="mt-10 flex flex-col items-center gap-4 text-center md:mt-14">
            <NeonButton href={lp("/carta")} variant="cream" size="lg" iconRight={<ArrowRight aria-hidden />}>
              {m.dishes.ctaMenu}
            </NeonButton>
            <p className="max-w-md text-xs leading-relaxed text-cream-faint">{m.dishes.ctaNote}</p>
          </div>
        </div>
      </MotionConfig>

      {/* Detalle del plato (portal en <body>) */}
      <DishSpotlight slide={spotlight} onClose={closeSpotlight} onReserve={openReservation} steam={steam} />
    </section>
  );
}
