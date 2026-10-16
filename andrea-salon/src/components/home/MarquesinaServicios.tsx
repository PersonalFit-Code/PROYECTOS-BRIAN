"use client";

import Marquee from "@/components/ui/Marquee";
import { useMessages } from "@/i18n/LocaleProvider";

/**
 * Carril de servicios bajo la portada, en Bodoni mayúscula con un rombo fino entre palabra y
 * palabra. Es decoración: el lector de pantalla lo lee una sola vez (lo garantiza `Marquee`).
 */
export default function MarquesinaServicios() {
  const lista = useMessages().home.servicios.marquesina;
  return (
    <div className="border-y border-nude bg-nude-claro py-5 sm:py-6">
      <Marquee pauseOnHover repeat={3} className="[--duration:55s] [--gap:3rem]">
        {lista.map((t) => (
          <span key={t} className="flex items-center gap-12">
            <span className="titulo-editorial text-xl whitespace-nowrap text-tinta sm:text-2xl">{t}</span>
            <span aria-hidden className="size-1.5 rotate-45 bg-carmin-suave/60" />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
