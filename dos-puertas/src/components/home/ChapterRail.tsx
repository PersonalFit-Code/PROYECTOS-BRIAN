"use client";

import { useEffect, useState } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/cn";

/** Riel lateral de capítulos (escritorio): puntos de cristal con el capítulo activo. */
export default function ChapterRail() {
  const m = useMessages();
  const chapters = [
    { id: "inicio", label: m.nav.home },
    { id: "barra", label: m.nav.barra },
    { id: "historia", label: m.nav.historia },
    { id: "resenas", label: m.social.kicker },
    { id: "visita", label: m.nav.visita },
  ];
  const [active, setActive] = useState("inicio");

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of ["inicio", "barra", "historia", "resenas", "visita"]) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return (
    <nav aria-label="Capítulos" className="fixed top-1/2 right-4 z-30 hidden -translate-y-1/2 xl:block">
      <ul className="liquid-glass flex flex-col gap-1 rounded-full p-1.5">
        {chapters.map((c) => (
          <li key={c.id}>
            <a
              href={`#${c.id}`}
              aria-current={active === c.id ? "true" : undefined}
              className="group relative flex size-8 items-center justify-center rounded-full"
            >
              <span className={cn("rounded-full transition-all duration-300", active === c.id ? "size-2.5 bg-oro" : "size-1.5 bg-cream/40 group-hover:bg-cream")} />
              <span className="pointer-events-none absolute right-10 rounded-full bg-tinta-800 px-3 py-1 text-xs whitespace-nowrap opacity-0 ring-1 ring-cream/10 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {c.label}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
