"use client";

import { ArrowRight } from "lucide-react";
import Boton from "@/components/ui/Boton";
import FotoEditorial from "@/components/ui/FotoEditorial";
import StatusPill from "@/components/ui/StatusPill";
import { FOTO_PORTADA } from "@/data/fotos";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { urlFor } from "@/lib/hosts";

/**
 * Portada de la línea editorial: blanco limpio, la frase centrada en Bodoni mayúscula con la palabra
 * de acento en itálica («EL ARTE DE *cuidar* TUS MANOS»), dos botones y, debajo, la foto grande de un
 * trabajo (en el móvil vertical; en escritorio apaisada). El texto entra con CSS (`.hero-in`,
 * escalonado) y no con JS: es lo primero que se ve y lo que mide la velocidad (LCP).
 */
export default function Hero() {
  const m = useMessages();
  const lp = useLocalePath();
  const h = m.home.hero;

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative bg-white pt-[calc(var(--header-h)+2.5rem)] pb-14 sm:pt-[calc(var(--header-h)+4rem)] sm:pb-20">
      <div className="container-page text-center">
        <p className="hero-in etiqueta inline-flex items-center gap-3 text-carmin-suave" style={{ ["--i" as string]: 0 }}>
          <span aria-hidden className="h-px w-10 bg-nude" />
          {h.kicker}
          <span aria-hidden className="h-px w-10 bg-nude" />
        </p>
        <h1
          id="hero-title"
          className="hero-in titulo-editorial mx-auto mt-7 max-w-5xl text-[2.6rem] text-tinta text-balance sm:text-6xl lg:text-[5.5rem]"
          style={{ ["--i" as string]: 1 }}
        >
          {h.title} <em className="acento-editorial">{h.accent}</em> {h.titleEnd}
        </h1>
        <p className="hero-in mx-auto mt-7 max-w-xl text-base leading-relaxed text-gris text-pretty sm:text-lg" style={{ ["--i" as string]: 2 }}>
          {h.subtitle}
        </p>
        <div className="hero-in mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center" style={{ ["--i" as string]: 3 }}>
          <Boton href={urlFor("reservar", "/")} size="lg">
            {h.primary}
          </Boton>
          <Boton href={lp("/servicios")} variant="secundario" size="lg" iconRight={<ArrowRight aria-hidden />}>
            {h.secondary}
          </Boton>
        </div>
        <div className="hero-in mt-6 flex justify-center lg:hidden" style={{ ["--i" as string]: 4 }}>
          <StatusPill />
        </div>
      </div>

      <div className="hero-in container-page mt-12 sm:mt-16" style={{ ["--i" as string]: 3 }}>
        <FotoEditorial foto={FOTO_PORTADA} priority zoom sizes="(min-width: 1280px) 1200px, 100vw" className="aspect-[4/5] w-full sm:aspect-[16/9]" rotulo={h.fotoRotulo} />
      </div>
    </section>
  );
}
