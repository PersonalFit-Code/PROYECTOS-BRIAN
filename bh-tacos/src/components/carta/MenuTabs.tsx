"use client";

import { useEffect, useRef, useState } from "react";
import { MENU } from "@/data/menu";
import { cn } from "@/lib/format";
import MenuCard from "@/components/carta/MenuCard";

/**
 * Pestañas fijas (sticky) que llevan a cada categoría; todas las categorías están en la página
 * (mejor para buscar con Ctrl+F y para el SEO). La pestaña activa sigue al scroll.
 * Navegación de teclado en la barra: flechas izquierda/derecha, Inicio y Fin.
 */
export default function MenuTabs() {
  const [active, setActive] = useState(MENU.categories[0]?.id);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = MENU.categories.map((c) => document.getElementById(c.id)).filter((n): n is HTMLElement => Boolean(n));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-140px 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Mantiene visible la pestaña activa en la barra horizontal del móvil.
  useEffect(() => {
    tabsRef.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [active]);

  const go = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = MENU.categories.length;
    const map: Record<string, number> = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = MENU.categories[map[e.key]];
    tabsRef.current?.querySelector<HTMLElement>(`[data-tab="${next.id}"]`)?.focus();
    go(next.id);
  };

  return (
    <>
      <nav aria-label="Categorías de la carta" className="sticky top-16 z-20 border-y border-line bg-[var(--header-bg)] backdrop-blur-xl sm:top-20">
        <div ref={tabsRef} role="tablist" aria-orientation="horizontal" className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {MENU.categories.map((c, i) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              data-tab={c.id}
              aria-selected={active === c.id}
              aria-controls={c.id}
              tabIndex={active === c.id ? 0 : -1}
              onClick={() => go(c.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                "press shrink-0 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap",
                active === c.id ? "bg-brand text-ink" : "bg-surface text-fg-muted hover:text-fg",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {MENU.categories.map((c) => (
          <section key={c.id} id={c.id} role="tabpanel" aria-label={c.name} className="scroll-mt-40 py-12">
            <h2 className="font-display text-4xl uppercase sm:text-5xl">{c.name}</h2>
            <p className="mt-2 max-w-2xl text-fg-muted">{c.description}</p>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {c.items.map((item) => (
                <li key={item.id}>
                  <MenuCard item={item} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
