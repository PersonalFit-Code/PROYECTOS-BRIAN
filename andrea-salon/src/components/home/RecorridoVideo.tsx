"use client";

import { useRef } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";
import { RECORRIDO_CARDS, RECORRIDO_VIDEO, RECORRIDO_VIDEO_READY } from "@/data/recorrido";

/**
 * HUECO del vídeo «walkthrough» controlado por scroll (plan §11). Mientras `RECORRIDO_VIDEO_READY`
 * sea false no renderiza NADA: ni sección, ni capítulo, ni hueco en blanco.
 *
 * Lo que hay debajo es el ESQUELETO de la versión final, para que cuando llegue el MP4 se vea
 * dónde va cada cosa: un carril alto (`trackVh`) con un viewport pegajoso dentro, el `<video>` que
 * se scrubea con `currentTime` desde un ScrollTrigger (NO con `play()`) y las tarjetas que aparecen
 * entre `start` y `end`. Falta el ScrollTrigger y el fallback a secuencia de imágenes para iOS, que
 * se escriben con el vídeo delante (receta FFmpeg y notas en `docs/recorrido-video.md`).
 *
 * Accesibilidad prevista: el vídeo es decorativo (`muted`, `playsInline`, sin audio), las tarjetas
 * son texto real y la sección se puede saltar con el teclado; con `prefers-reduced-motion` se
 * enseña el póster quieto y las tarjetas sin animación.
 */
export default function RecorridoVideo() {
  const m = useMessages();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const r = m.home.recorrido;

  if (!RECORRIDO_VIDEO_READY) return null;

  return (
    <section ref={ref} id="recorrido" aria-labelledby="recorrido-title" className="scroll-mt-24">
      <div className="container-page py-20 sm:py-28">
        <SectionHeading id="recorrido-title" kicker={r.kicker} title={r.title} accent={r.accent} description={r.description} />
      </div>
      <div className="scroll-track relative" style={{ height: `${RECORRIDO_VIDEO.trackVh}vh` }}>
        <div className="sticky-viewport sticky top-0 h-[100svh] overflow-hidden">
          <video muted playsInline preload="auto" poster={RECORRIDO_VIDEO.poster} className="size-full object-cover" aria-hidden>
            <source src={RECORRIDO_VIDEO.src} type="video/mp4" />
          </video>
          <ul className="pointer-events-none absolute inset-0">
            {RECORRIDO_CARDS.map((card) => (
              <li key={card.id} data-start={card.start} data-end={card.end} className="info-card liquid-glass liquid-glass-strong absolute bottom-24 left-6 max-w-sm rounded-3xl p-5 opacity-0">
                <h3 className="font-display text-2xl font-semibold text-tinta">{card.title}</h3>
                <p className="mt-2 text-sm text-gris">{card.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
