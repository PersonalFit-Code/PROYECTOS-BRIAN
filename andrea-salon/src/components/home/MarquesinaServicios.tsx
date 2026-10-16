"use client";

import { Droplet, Eye, Flower2, Gem, HandHeart, Paintbrush, Sparkles, type LucideIcon } from "lucide-react";
import Marquee from "@/components/ui/Marquee";
import { useMessages } from "@/i18n/LocaleProvider";

/**
 * Carril de servicios bajo la portada: una línea fina y discreta, texto pequeño en mayúscula muy
 * espaciada (como la fila de secciones de la cabecera) y, entre servicio y servicio, un icono de
 * estética distinto cada vez (mano, destellos, gota, ojo, flor, pincel, gema) para que vaya variando.
 * Es decoración: el lector de pantalla lo lee una sola vez (lo garantiza `Marquee`).
 */
const ICONOS: LucideIcon[] = [HandHeart, Sparkles, Droplet, Eye, Flower2, Paintbrush, Gem];

export default function MarquesinaServicios() {
  const lista = useMessages().home.servicios.marquesina;
  return (
    <div className="border-y border-nude bg-white py-3.5 sm:py-4">
      <Marquee pauseOnHover repeat={3} className="[--duration:50s] [--gap:1.75rem] sm:[--gap:2.25rem]">
        {lista.map((t, i) => {
          const Icono = ICONOS[i % ICONOS.length]!;
          return (
            <span key={t} className="flex items-center gap-7 sm:gap-9">
              <span className="font-sans text-[12px] font-normal tracking-[0.28em] whitespace-nowrap text-tinta uppercase sm:text-[13px]">{t}</span>
              <Icono aria-hidden strokeWidth={1.25} className="size-4 shrink-0 text-carmin-suave" />
            </span>
          );
        })}
      </Marquee>
    </div>
  );
}
