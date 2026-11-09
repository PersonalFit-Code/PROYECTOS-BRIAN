import Link from "next/link";
import { ArrowUpRight, CalendarDays, Ruler, Star, Users } from "lucide-react";
import Contador from "@/components/ui/Contador";
import { negocio } from "@/data/negocio";

/** «Por qué 720»: cifras que cuentan al aparecer, con su icono y un enlace (como en Burdin). */
const tarjetas = [
  { Icono: Ruler, cifra: <Contador hasta={1000} prefijo="+" />, unidad: "m²", titulo: "Todo el material", texto: "Máquinas, peso libre, powerlifting, cardio, funcional, Pilates y yoga.", href: "/club", enlace: "Ver el club" },
  { Icono: CalendarDays, cifra: <Contador hasta={365} />, unidad: "días", titulo: "Abierto cuando entrenas tú", texto: `${negocio.horario.texto}, festivos incluidos.`, href: "/horario", enlace: "Ver horario" },
  { Icono: Users, cifra: "Aforo", unidad: "limitado", titulo: "Nunca masificado", texto: "Los socios justos para que tu máquina esté libre. Sin colas ni postureo.", href: "/tarifas", enlace: "Ver tarifas" },
  { Icono: Star, cifra: <Contador hasta={5} decimales={1} />, unidad: "★ Google", titulo: `${negocio.google.resenas} reseñas`, texto: "Ambiente familiar, grupos reducidos y atención personalizada.", href: "/club#comunidad", enlace: "Ver comunidad" },
];

export default function PorQue() {
  return (
    <section id="por-que" className="relative scroll-mt-20 bg-negro py-16 sm:py-24" aria-labelledby="titulo-porque">
      <div className="container-page">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p data-reveal className="etiqueta text-white/50">Por qué 720</p>
            <h2 id="titulo-porque" data-reveal className="titular mt-3 text-[clamp(1.9rem,3.2vw,2.6rem)]">
              Un club, no un gimnasio más
            </h2>
          </div>
          <p data-reveal className="max-w-sm text-[14px] leading-relaxed text-white/60">
            Entrenas a tu ritmo, rodeado de gente como tú.
          </p>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 lg:grid-cols-4 lg:gap-4">
          {tarjetas.map(({ Icono, cifra, unidad, titulo, texto, href, enlace }) => (
            <li key={titulo} data-reveal>
              <Link href={href} className="tarjeta-vidrio group flex h-full flex-col rounded-2xl p-4 sm:p-6">
                <Icono className="size-5 text-white/70" aria-hidden />
                <p className="mt-4 flex items-baseline gap-1.5 sm:mt-6">
                  <span className="titular text-[34px] leading-none sm:text-[44px]">{cifra}</span>
                  <span className="text-[12px] font-semibold text-white/60 sm:text-[13px]">{unidad}</span>
                </p>
                <p className="subtitular mt-3 text-[14px] sm:text-[16px]">{titulo}</p>
                <p className="mt-1 hidden text-[13px] leading-relaxed text-white/55 sm:block">{texto}</p>
                <span className="mt-auto flex items-center gap-1 pt-4 text-[12px] font-semibold text-white/70 transition group-hover:text-white sm:text-[13px]">
                  {enlace} <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
