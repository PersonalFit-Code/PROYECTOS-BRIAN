"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Dumbbell, Flame, Ruler } from "lucide-react";
import { Kettlebell } from "@/components/ui/IconosMarca";
import type { ComponentType, SVGProps } from "react";
import { BarraDiscos } from "@/components/ui/IconosMarca";
import { fotos } from "@/data/fotos";
import { cn } from "@/lib/utils";

/**
 * «La sala por dentro» v2: cada recuadro rota entre las fotos con fundido y avance de cámara,
 * escalonados (no cambian todos a la vez). Se para fuera de pantalla y con «reducir movimiento».
 */
type Icono = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;
/* Ocho piezas para cuatro recuadros (dos son encuadres de detalle): así nunca se repite una a la vista. */
const piezas: { id: string; src: string; grande: string; alt: string; titulo: string; texto: string; href: string; Icono: Icono; encuadre?: string; pos?: string }[] = [
  { id: "sala", ...fotos.sala, titulo: "La sala", texto: "+1.000 m² sin agobios", href: "/gimnasio", Icono: Ruler as Icono },
  { id: "maquinas", ...fotos.maquinas, titulo: "Máquinas guiadas", texto: "Multiestación y poleas", href: "/gimnasio", Icono: Dumbbell as Icono },
  { id: "entrada", ...fotos.entrada, titulo: "Bienvenido a 720", texto: "Sala de peso libre", href: "/club", Icono: Dumbbell as Icono, pos: "object-[50%_18%]" },
  { id: "racks", ...fotos.racks, titulo: "Racks y peso libre", texto: "Material de competición", href: "/powerlifting", Icono: BarraDiscos },
  { id: "pista", ...fotos.pista, titulo: "La pista", texto: "Tartán, césped y espacio de sobra", href: "/crossgym", Icono: Flame as Icono },
  { id: "funcional", ...fotos.funcional, titulo: "Zona funcional", texto: "CrossGym y acrobacia", href: "/crossgym", Icono: Flame as Icono },
  { id: "kettlebells", ...fotos.funcional, alt: "Kettlebells y cuerda en la zona funcional", titulo: "Kettlebells y cuerda", texto: "Entreno funcional", href: "/crossgym", Icono: Kettlebell, encuadre: "scale-[1.7] origin-[14%_68%]" },
  { id: "racks-sala", ...fotos.sala, alt: "Racks de la sala principal", titulo: "Racks de la sala", texto: "Sentadilla, banca y peso muerto", href: "/powerlifting", Icono: BarraDiscos, encuadre: "scale-[1.6] origin-[92%_45%]" },
];
const casillas = ["lg:col-span-2 lg:row-span-2", "", "", "lg:col-span-2"];

export default function Galeria() {
  const caja = useRef<HTMLUListElement>(null);
  const [indices, setIndices] = useState([0, 1, 2, 3]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tick = 0;
    let id = 0;
    const arrancar = () => {
      if (id) return;
      id = window.setInterval(() => {
        const casilla = tick % casillas.length;
        tick++;
        setIndices((prev) => {
          /* La siguiente pieza que no esté ya a la vista en otro recuadro. */
          let siguiente = prev[casilla];
          do siguiente = (siguiente + 1) % piezas.length;
          while (prev.some((v, i) => i !== casilla && v === siguiente));
          return prev.map((v, i) => (i === casilla ? siguiente : v));
        });
      }, 1600);
    };
    const parar = () => {
      window.clearInterval(id);
      id = 0;
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? arrancar() : parar()), { threshold: 0.2 });
    if (caja.current) io.observe(caja.current);
    return () => {
      io.disconnect();
      parar();
    };
  }, []);

  return (
    <section className="bg-negro py-16 sm:py-24" aria-labelledby="titulo-galeria">
      <div className="container-page">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p data-reveal className="etiqueta text-white/50">Calle Río Bibei 16 · Ourense</p>
            <h2 id="titulo-galeria" data-reveal className="titular mt-3 text-[clamp(1.9rem,3.2vw,2.6rem)]">
              La sala por dentro
            </h2>
          </div>
          <Link href="/club" className="group hidden items-center gap-1 text-[14px] font-semibold text-white/75 hover:text-white sm:flex">
            Conoce el club <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
      <ul ref={caja} className="no-scrollbar mt-8 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 sm:px-6 lg:container-page lg:grid lg:auto-rows-[15rem] lg:grid-cols-4 lg:gap-4 lg:overflow-visible">
        {casillas.map((clase, c) => {
          const actual = piezas[indices[c]];
          return (
            <li key={c} data-reveal className={cn("relative w-[82vw] shrink-0 snap-start sm:w-[60vw] lg:w-auto", clase)}>
              <Link href={actual.href} className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-suelo lg:aspect-auto lg:h-full">
                {piezas.map((p, i) => (
                  <div key={p.id} className="rota-foto absolute inset-0 overflow-hidden" data-activa={i === indices[c]} aria-hidden={i !== indices[c]}>
                    <div className={cn("absolute inset-0", p.encuadre)}>
                      <Image src={c === 0 || p.encuadre ? p.grande : p.src} alt={i === indices[c] ? p.alt : ""} fill sizes={c === 0 ? "(min-width:1024px) 50vw, 82vw" : "(min-width:1024px) 25vw, 82vw"} className={cn("object-cover", p.pos)} />
                    </div>
                  </div>
                ))}
                <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden />
                <span className="tarjeta-vidrio absolute right-3 bottom-3 left-3 flex items-center gap-3 rounded-2xl px-4 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10">
                    <actual.Icono className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1" aria-live="off">
                    <span className="subtitular block truncate text-[15px]">{actual.titulo}</span>
                    <span className="block truncate text-[12px] text-white/70">{actual.texto}</span>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-white/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
