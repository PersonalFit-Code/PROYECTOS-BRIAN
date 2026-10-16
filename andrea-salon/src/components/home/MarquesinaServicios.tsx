"use client";

import Marquee from "@/components/ui/Marquee";
import { useMessages } from "@/i18n/LocaleProvider";

/**
 * Carril de servicios bajo la portada, trabajado como una línea de portada de revista: Bodoni grande
 * en mayúscula, alternando redonda e itálica, con una estrella fina de cuatro puntas entre servicio
 * y servicio. Sin banda de color: dos filetes y aire. Es decoración: el lector de pantalla lo lee una
 * sola vez (lo garantiza `Marquee`).
 */
export default function MarquesinaServicios() {
  const lista = useMessages().home.servicios.marquesina;
  return (
    <div className="border-y border-nude bg-white py-6 sm:py-8">
      <Marquee pauseOnHover repeat={3} className="[--duration:60s] [--gap:2.25rem] sm:[--gap:3rem]">
        {lista.map((t, i) => (
          <span key={t} className="flex items-center gap-9 sm:gap-12">
            <span
              className={
                i % 2 === 0
                  ? "titulo-didot text-[1.9rem] whitespace-nowrap text-tinta sm:text-[2.75rem]"
                  : "acento-editorial text-[1.9rem] whitespace-nowrap text-carmin-suave sm:text-[2.75rem]"
              }
            >
              {t}
            </span>
            <svg aria-hidden viewBox="0 0 16 16" className="size-3 shrink-0 text-nude sm:size-4" fill="currentColor">
              <path d="M8 0c.4 4.2 3.8 7.6 8 8-4.2.4-7.6 3.8-8 8-.4-4.2-3.8-7.6-8-8 4.2-.4 7.6-3.8 8-8Z" />
            </svg>
          </span>
        ))}
      </Marquee>
    </div>
  );
}
