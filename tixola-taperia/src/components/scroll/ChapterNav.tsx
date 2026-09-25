"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { getGsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useChapters } from "./Chapter";
import { focusScrollTarget, useSmoothScroll } from "./SmoothScrollProvider";

/** ids fijos que no pasan por `<Chapter>`: la portada (arriba) y el pie (abajo). */
const HERO_ID = "hero";
const FOOTER_ID = "footer";

/** Franja central del viewport que decide el capítulo activo (mismo criterio que la Navbar). */
const ACTIVE_ROOT_MARGIN = "-40% 0px -50% 0px";

interface NavItem {
  id: string;
  title: string;
}

/**
 * Navegación cinematográfica:
 *  - Barra de progreso de 2 px en el borde superior (degradado pimentón) movida por ScrollTrigger
 *    (transform: scaleX, sin layout). Es un `progressbar` accesible.
 *  - Puntos verticales fijos en el lateral derecho (solo lg+) con numeración y etiqueta que
 *    aparece al pasar el ratón / enfocar y se queda visible en el capítulo activo
 *    (IntersectionObserver). Clic → scroll suave con Lenis dejando hueco a la cabecera.
 *  - Colocada en `right-5 bottom-24` para no chocar con el botón flotante de WhatsApp
 *    (`right-4 top-1/2` en escritorio).
 */
export default function ChapterNav() {
  const m = useMessages();
  const t = useFormat();
  const { scrollTo, headerOffset } = useSmoothScroll();
  const chapters = useChapters();

  const items = useMemo<NavItem[]>(
    () => [
      { id: HERO_ID, title: m.scroll.chapters.hero },
      ...chapters.map((c) => ({ id: c.id, title: c.title })),
      { id: FOOTER_ID, title: m.scroll.chapters.footer },
    ],
    [chapters, m.scroll.chapters.hero, m.scroll.chapters.footer],
  );

  const [activeId, setActiveId] = useState<string>(HERO_ID);
  const barRef = useRef<HTMLDivElement>(null);

  /* Capítulo activo: el último (en orden de documento) que cruza la franja central. Así, cuando
     un capítulo se desliza sobre el hero anclado, gana el que está por encima. */
  useEffect(() => {
    const order = items.map((i) => i.id);
    const targets = order.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;

    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        let next: string | null = null;
        for (const id of order) if (visible.has(id)) next = id;
        if (next) setActiveId(next);
      },
      { rootMargin: ACTIVE_ROOT_MARGIN, threshold: 0 },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  /* Barra de progreso: scaleX = progreso del documento (0 → 1). Al llegar al final activamos el
     último capítulo aunque el pie sea más bajo que la franja central. */
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const lastId = items[items.length - 1]?.id ?? FOOTER_ID;
    const { gsap, ScrollTrigger } = getGsap();

    const ctx = gsap.context(() => {
      const setScale = gsap.quickSetter(bar, "scaleX");
      let lastPercent = -1;
      const paint = (progress: number) => {
        setScale(progress);
        const percent = Math.round(progress * 100);
        if (percent === lastPercent) return;
        lastPercent = percent;
        bar.setAttribute("aria-valuenow", String(percent));
        bar.setAttribute("aria-valuetext", t(m.scroll.progressValue, { percent }));
        if (percent >= 99) setActiveId(lastId);
      };
      ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: (self) => paint(self.progress),
        onRefresh: (self) => paint(self.progress),
      });
    });

    return () => ctx.revert();
  }, [items, m.scroll.progressValue, t]);

  const go = (id: string) => {
    if (id === HERO_ID) {
      scrollTo(0);
      return;
    }
    const el = document.getElementById(id);
    if (!el) return;
    scrollTo(el, { offset: -headerOffset(), onComplete: () => focusScrollTarget(el) });
  };

  return (
    <>
      {/* Barra de progreso superior */}
      <div
        ref={barRef}
        role="progressbar"
        aria-label={m.scroll.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        aria-valuetext={t(m.scroll.progressValue, { percent: 0 })}
        /* Estado inicial en `transform` (no en la propiedad `scale` de Tailwind v4): GSAP anima `transform`. */
        style={{ transform: "scaleX(0)" }}
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-[linear-gradient(90deg,var(--color-pimenton-dark),var(--color-pimenton-light)_55%,var(--color-ember))] shadow-[0_0_12px_rgba(216,50,60,0.55)]"
      />

      {/* Puntos laterales (lg+) */}
      <nav aria-label={m.scroll.nav.label} className="fixed right-5 bottom-24 z-40 hidden lg:block">
        <ol className="flex flex-col items-end gap-0.5">
          {items.map((item, index) => {
            const active = item.id === activeId;
            const number = String(index + 1).padStart(2, "0");
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(item.id)}
                  aria-label={t(m.scroll.nav.goTo, { chapter: item.title })}
                  aria-current={active ? "true" : undefined}
                  className="group flex h-9 items-center justify-end gap-2 rounded-full pl-3 pr-0.5 text-cream-muted transition-colors hover:text-cream focus-visible:text-cream"
                >
                  {/* Etiqueta: visible en hover/foco y fija en el capítulo activo */}
                  <span
                    className={cn(
                      "flex items-baseline gap-2 font-caps text-[10px] uppercase tracking-[0.3em] transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)]",
                      active
                        ? "translate-x-0 text-cream opacity-100"
                        : "translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                    )}
                  >
                    <span aria-hidden className="tabular-nums text-pimenton-a11y">
                      {number}
                    </span>
                    <span>{item.title}</span>
                    {active && <span className="sr-only"> ({m.scroll.nav.current})</span>}
                  </span>

                  {/* Punto */}
                  <span aria-hidden className="grid h-8 w-8 place-items-center">
                    <span
                      className={cn(
                        "block rounded-full transition-[width,height,background-color,box-shadow] duration-500 ease-[var(--ease-out-expo)]",
                        active ? "h-2.5 w-2.5 bg-pimenton-light shadow-neon" : "h-1.5 w-1.5 bg-cream/35 group-hover:bg-cream/70",
                      )}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        {/* Hilo vertical decorativo tras los puntos */}
        <span aria-hidden className="pointer-events-none absolute top-2 bottom-2 right-[15px] -z-10 w-px bg-cream/12" />
      </nav>
    </>
  );
}
