"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import Boton from "@/components/ui/Boton";
import SectionHeading from "@/components/ui/SectionHeading";
import ServiciosLista from "@/components/servicios/ServiciosLista";
import type { Servicio } from "@/components/servicios/types";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";

/**
 * Los servicios destacados de la portada: los marcados `destacado` del catálogo (máximo seis), en
 * las mismas tarjetas que /servicios, y el enlace a la lista completa. Recibe los datos por props:
 * hoy del fixture, en la fase 1b de la base de datos.
 */
export default function ServiciosDestacados({ servicios }: { servicios: readonly Servicio[] }) {
  const m = useMessages();
  const lp = useLocalePath();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const s = m.home.servicios;
  const destacados = servicios.filter((x) => x.destacado).slice(0, 6);
  const pendiente = destacados.some((x) => x.pendiente);

  return (
    <section ref={ref} id="servicios" aria-labelledby="servicios-title" className="scroll-mt-24">
      <div className="container-page py-20 sm:py-28">
        <SectionHeading id="servicios-title" kicker={s.kicker} title={s.title} accent={s.accent} description={s.description} />
        <div className="mt-10 md:mt-14">
          <ServiciosLista servicios={destacados} grouped={false} />
        </div>
        <div data-reveal className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Boton href={lp("/servicios")} variant="secundario" iconRight={<ArrowRight aria-hidden />}>
            {s.seeAll}
          </Boton>
          {pendiente ? <p className="text-xs text-gris">{s.pendingNote}</p> : null}
        </div>
      </div>
    </section>
  );
}
