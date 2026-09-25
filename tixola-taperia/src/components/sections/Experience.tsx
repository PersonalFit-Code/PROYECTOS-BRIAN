"use client";

import { Diamond, Flame, Sun, Wine, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import MapCard from "@/components/ui/MapCard";
import OpenStatus from "@/components/ui/OpenStatus";
import SectionHeading from "@/components/ui/SectionHeading";
import { photoById } from "@/data/photos";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useMessages } from "@/i18n/LocaleProvider";

/**
 * Experience — "Experiencia y ubicación" (#experiencia).
 *
 *  1. Marquesina fina y elegante (Cormorant light, versalitas, rombos pimentón) con las
 *     especialidades de la casa; en bucle continuo, se pausa al pasar el ratón.
 *  2. Bloque cinematográfico a sangre: la foto real de la terraza con Santa Eufemia al fondo
 *     (parallax lento con `data-parallax`), velo oscuro y la cabecera de sección encima.
 *  3. Línea de tiempo "Un día en Tixola" en tres pasos (13:00 · 20:00 · 22:00) con iconos lucide
 *     y finos separadores de hierro.
 *  4. Fila de dos columnas: estado en vivo (OpenStatus) + ubicación con mapa 3D (MapCard).
 *
 *  Todos los textos salen de `m.experience` (+ `m.common` para estado/CTAs). Los reveals usan
 *  `data-reveal` (modo cinematográfico) y las capas `data-parallax` las mueve `useScrollReveal`.
 */

const STORY_ICONS: readonly LucideIcon[] = [Sun, Wine, Flame];
const TERRACE = photoById("terraza-catedral");

/* ────────────────────────────────────────────────────────────
   Marquesina
   ──────────────────────────────────────────────────────────── */
function Marquee({ items, label }: { items: readonly string[]; label: string }) {
  return (
    <div className="relative overflow-hidden border-y border-cream/10 bg-iron-900/80 py-4 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)] md:py-5">
      <p className="sr-only">
        {label}: {items.join(", ")}.
      </p>
      <div
        aria-hidden
        className="flex w-max animate-marquee will-change-transform hover:[animation-play-state:paused] motion-reduce:animate-none"
      >
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {items.map((phrase) => (
              <li
                key={`${copy}-${phrase}`}
                className="flex items-center gap-6 px-6 font-display text-lg font-light uppercase tracking-[0.3em] text-cream-muted md:gap-8 md:px-8 md:text-xl"
              >
                {phrase}
                <Diamond size={8} className="shrink-0 fill-pimenton-light text-pimenton-light" aria-hidden />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Sección
   ──────────────────────────────────────────────────────────── */
export default function Experience() {
  const m = useMessages();
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, { cinematic: true });

  const x = m.experience;

  return (
    <section id="experiencia" ref={sectionRef} className="noise after:noise-after relative isolate overflow-clip bg-iron">
      <Marquee items={x.marquee} label={x.marqueeAria} />

      {/* 1 · Bloque cinematográfico: terraza real con Santa Eufemia al fondo */}
      <div className="relative isolate min-h-[72svh] overflow-hidden md:min-h-[82vh]">
        <div data-parallax="-0.28" className="absolute inset-x-0 -top-[18%] -bottom-[18%] will-change-transform">
          <Image
            src={TERRACE?.src ?? "/images/terraza-catedral.jpg"}
            alt={TERRACE?.alt ?? x.photoCaption}
            fill
            sizes="100vw"
            quality={82}
            className="object-cover"
            style={{ objectPosition: TERRACE?.focus ?? "50% 45%" }}
          />
        </div>
        {/* velos: cabecera, pie (legibilidad del titular) y lateral izquierdo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,18,0.72)_0%,rgba(18,18,18,0.15)_28%,rgba(18,18,18,0.2)_50%,rgba(18,18,18,0.86)_78%,#121212_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(12,12,12,0.7)_0%,rgba(12,12,12,0.35)_40%,transparent_70%)] lg:block"
        />

        <div className="container-page relative z-10 flex min-h-[72svh] flex-col justify-end pb-14 pt-28 md:min-h-[82vh] md:pb-20 md:pt-36">
          <SectionHeading kicker={x.kicker} title={x.title} accent={x.accent} description={x.description} className="max-w-2xl" />
          <p data-reveal="fade" className="mt-8 inline-flex items-center gap-3 font-caps text-[10px] uppercase tracking-[0.3em] text-cream-faint">
            <span aria-hidden className="h-px w-8 bg-gold/60" />
            {x.photoBadge} · {x.photoCaption}
          </p>
        </div>
      </div>

      {/* 2 · Un día en Tixola */}
      <div className="container-page py-16 md:py-24">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h3 data-reveal className="font-display text-3xl leading-none text-cream md:text-4xl">
            {x.storyTitle}
          </h3>
          <p data-reveal="fade" className="font-caps text-[10px] uppercase tracking-[0.3em] text-cream-muted">
            {x.storyKicker}
          </p>
        </div>

        <div aria-hidden className="divider-iron mt-8" />
        <ol className="grid divide-y divide-cream/10 md:grid-cols-3 md:divide-x md:divide-y-0">
          {x.story.map((step, i) => {
            const Icon = STORY_ICONS[i] ?? Sun;
            return (
              <li key={step.time} data-reveal className="flex gap-5 py-8 md:flex-col md:gap-0 md:px-8 md:py-10 md:first:pl-0 md:last:pr-0">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 md:mt-7">
                  <p className="font-display text-5xl font-light leading-none text-cream tabular-nums md:text-6xl">{step.time}</p>
                  <h4 className="mt-3 font-caps text-xs uppercase tracking-[0.25em] text-gold">{step.title}</h4>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-cream-muted text-pretty md:text-base">{step.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <div aria-hidden className="divider-iron" />
      </div>

      {/* 3 · Estado en vivo + ubicación */}
      <div className="container-page pb-20 md:pb-28">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch lg:gap-8">
          <div data-reveal className="h-full">
            <OpenStatus className="h-full" />
          </div>
          <div data-reveal>
            <MapCard />
          </div>
        </div>
      </div>
    </section>
  );
}
