"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import Boton from "@/components/ui/Boton";
import FotoEditorial from "@/components/ui/FotoEditorial";
import SectionHeading from "@/components/ui/SectionHeading";
import { FOTOS_SERVICIO } from "@/data/fotos";
import { useReveal } from "@/hooks/useReveal";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * Servicios de la portada, en lista editorial numerada (01 / 02 / 03 / 04) separada por filetes, en
 * vez de tarjetas. En escritorio, a la derecha, la foto del servicio que se tiene encima (ratón o
 * foco de teclado); en el móvil cada fila lleva su miniatura. Los precios viven en /servicios, que
 * es donde se pueden comparar; aquí se cuenta qué se hace.
 */
export default function ServiciosEditorial() {
  const m = useMessages();
  const lp = useLocalePath();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const s = m.home.servicios;
  const [activo, setActivo] = useState<string>(s.lista[0]?.clave ?? "");

  return (
    <section ref={ref} id="servicios" aria-labelledby="servicios-title" className="scroll-mt-24 bg-white">
      <div className="container-page py-20 sm:py-28">
        <SectionHeading id="servicios-title" kicker={s.kicker} title={s.title} accent={s.accent} description={s.description} />

        <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <ol className="border-b border-nude">
            {s.lista.map((it, i) => (
              <li key={it.clave} data-reveal className="border-t border-nude">
                <Link
                  href={lp(`/servicios#${it.ancla}`)}
                  onMouseEnter={() => setActivo(it.clave)}
                  onFocus={() => setActivo(it.clave)}
                  className="group grid grid-cols-[2.5rem_1fr_auto] items-start gap-4 py-7 sm:grid-cols-[3.5rem_1fr_auto] sm:py-9"
                >
                  <span className="etiqueta pt-2 text-carmin-suave">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className={cn("titulo-editorial block text-2xl text-tinta transition-colors sm:text-[2rem]", activo === it.clave && "lg:text-carmin")}>
                      {it.nombre}
                    </span>
                    <span className="mt-3 block max-w-md text-[15px] leading-relaxed text-gris">{it.texto}</span>
                    <span className="etiqueta mt-4 inline-flex items-center gap-2 text-tinta underline decoration-nude underline-offset-[6px] group-hover:decoration-grafito">
                      {s.verMas}
                      <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </span>
                  <FotoEditorial foto={FOTOS_SERVICIO[it.clave]!} sizes="96px" className="aspect-[4/5] w-20 sm:w-24 lg:hidden" />
                </Link>
              </li>
            ))}
          </ol>

          <div className="hidden lg:block">
            <div className="sticky top-28">
              {s.lista.map((it) => (
                <FotoEditorial
                  key={it.clave}
                  foto={FOTOS_SERVICIO[it.clave]!}
                  sizes="(min-width: 1280px) 520px, 40vw"
                  rotulo={it.nombre}
                  className={cn("aspect-[4/5] w-full transition-opacity duration-500", activo === it.clave ? "relative opacity-100" : "absolute inset-0 opacity-0")}
                />
              ))}
            </div>
          </div>
        </div>

        <div data-reveal className="mt-12 flex justify-center lg:justify-start">
          <Boton href={lp("/servicios")} variant="secundario" iconRight={<ArrowRight aria-hidden />}>
            {s.seeAll}
          </Boton>
        </div>
      </div>
    </section>
  );
}
