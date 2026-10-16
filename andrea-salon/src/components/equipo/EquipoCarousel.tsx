"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import Boton from "@/components/ui/Boton";
import { InstagramGlyph } from "@/components/ui/SocialGlyphs";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";
import { urlFor } from "@/lib/hosts";
import { cn } from "@/lib/utils";
import type { Profesional } from "./types";

/**
 * Carrusel del equipo: tarjetas con foto, nombre, rol, especialidades, Instagram y «Reservar con
 * ella» (`reservar.<dominio>/?con=<slug>`, el mismo enlace que irá en su bio de Instagram).
 *
 * Es un carril nativo con `scroll-snap`: el dedo lo arrastra, las flechas lo mueven una tarjeta y
 * el teclado tabula por los botones de dentro. Sin librería y sin 3D (la `profile-card-carousel` de
 * 21st.dev que cita el plan se adapta cuando haya fotos reales; con dos marcadores no aporta nada).
 * El índice se lee del scroll con un IntersectionObserver, nunca del evento de scroll.
 */
export default function EquipoCarousel({ equipo }: { equipo: readonly Profesional[] }) {
  const m = useMessages();
  const t = useFormat();
  const e = m.equipo;
  const ref = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  useReveal(ref);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const cards = Array.from(rail.children);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) setIndex(cards.indexOf(entry.target));
        }
      },
      { root: rail, threshold: [0.6] },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [equipo.length]);

  const go = useCallback(
    (delta: number) => {
      const rail = railRef.current;
      if (!rail) return;
      const next = Math.min(equipo.length - 1, Math.max(0, index + delta));
      const card = rail.children[next] as HTMLElement | undefined;
      card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    },
    [equipo.length, index],
  );

  return (
    <div ref={ref} className="relative">
      <ul ref={railRef} aria-label={e.carouselAria} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 lg:grid lg:snap-none lg:grid-cols-2 lg:overflow-visible xl:grid-cols-3">
        {equipo.map((p, i) => (
          <li key={p.id} data-reveal className="glass-alta flex w-[85vw] max-w-[380px] shrink-0 snap-center flex-col overflow-hidden rounded-[2rem] lg:w-auto lg:max-w-none" aria-label={t(e.slideOf, { index: i + 1, total: equipo.length })}>
            <div className="relative aspect-[4/5] bg-rosa-niebla">
              <Image src={p.foto.src} alt={p.foto.alt} fill unoptimized={p.foto.src.endsWith(".svg")} sizes="(min-width: 1280px) 400px, (min-width: 1024px) 50vw, 85vw" className="object-cover" />
              {p.pendiente ? (
                <span className="absolute top-4 left-4 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-carmin ring-1 ring-carmin/15">{m.common.misc.photoPending}</span>
              ) : null}
            </div>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <p className="font-sans text-[11px] font-semibold tracking-[0.28em] text-carmin-suave uppercase">{p.rol}</p>
              <h3 className="mt-1 font-display text-2xl font-semibold text-tinta">{p.nombre}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gris text-pretty">{p.bio}</p>
              <p className="sr-only">{e.specialties}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {p.especialidades.map((x) => (
                  <li key={x} className="rounded-full bg-rosa px-3 py-1 text-[12px] font-medium text-tinta">
                    {x}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                {p.reservableOnline ? (
                  <Boton href={urlFor("reservar", `/?con=${p.slug}`)} size="sm" icon={<CalendarCheck aria-hidden />}>
                    {t(e.bookWith, { name: p.nombre })}
                  </Boton>
                ) : null}
                {p.instagram ? (
                  <a href={p.instagram} target="_blank" rel="noopener noreferrer" aria-label={t(e.instagram, { name: p.nombre })} className="pulsable inline-flex size-11 items-center justify-center rounded-full text-carmin-suave hover:bg-rosa hover:text-carmin">
                    <InstagramGlyph className="size-5" />
                  </a>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Flechas: solo donde el carril se desplaza (< lg). */}
      <div className="mt-2 flex items-center justify-between lg:hidden">
        <p className="text-sm text-gris" aria-live="polite">
          {t(e.slideOf, { index: index + 1, total: equipo.length })}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => go(-1)} disabled={index === 0} aria-label={e.prev} className={cn("pulsable inline-flex size-11 items-center justify-center rounded-full border border-carmin/20 bg-white/70 text-carmin disabled:opacity-40")}>
            <ChevronLeft aria-hidden className="size-5" />
          </button>
          <button type="button" onClick={() => go(1)} disabled={index >= equipo.length - 1} aria-label={e.next} className={cn("pulsable inline-flex size-11 items-center justify-center rounded-full border border-carmin/20 bg-white/70 text-carmin disabled:opacity-40")}>
            <ChevronRight aria-hidden className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
