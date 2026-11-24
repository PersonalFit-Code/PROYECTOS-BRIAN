"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { fotos } from "@/data/fotos";
import { cn } from "@/lib/utils";

/**
 * «720 por dentro»: un recorrido por todos los espacios del centro, en el orden en que se ven al
 * entrar (entrada → vestuarios → Pilates → tatami → zona funcional → gimnasio). Cada foto lleva el
 * nombre de su zona. Las fotos saltan de un recuadro a otro (cada 2,4 s se intercambian dos, con
 * fundido); se para fuera de pantalla y con «reducir movimiento». Faltan fotos de la sala de yoga
 * y de la oficina.
 */
const espacios: { id: string; src: string; grande: string; alt: string; zona: string; texto: string; href: string; pos?: string; ancho?: boolean }[] = [
  { id: "entrada", ...fotos.fachada, zona: "Entrada", texto: "Bienvenido a 720", href: "/club" },
  { id: "vestuarios", ...fotos.vestuarioBancos, zona: "Vestuarios", texto: "Amplios, con duchas", href: "/club", pos: "object-[50%_60%]" },
  { id: "reformer", ...fotos.pilatesReformer, zona: "720 Pilates", texto: "Sala de Reformer", href: "/pilates", pos: "object-[50%_70%]" },
  { id: "wall-unit", ...fotos.pilatesWallUnit, zona: "720 Pilates", texto: "Sala de Mat y Wall Unit", href: "/pilates" },
  { id: "tatami", ...fotos.pistaPilates, zona: "Tatami", texto: "Artes marciales y capoeira", href: "/#clubes", pos: "object-[50%_38%]" },
  { id: "funcional", ...fotos.funcional, zona: "CrossGym", texto: "Zona funcional: cuerda, kettlebells y césped", href: "/crossgym" },
  { id: "pista", ...fotos.pistaVertical, zona: "Pista", texto: "Tapiz de gimnasia acrobática", href: "/gimnasia-acrobatica", pos: "object-[50%_42%]" },
  { id: "racks", ...fotos.racks, zona: "Gimnasio", texto: "Racks y peso libre", href: "/gimnasio" },
  { id: "maquinas", ...fotos.maquinas, zona: "Gimnasio", texto: "Máquinas guiadas y poleas", href: "/gimnasio" },
  { id: "sala", ...fotos.sala, zona: "Gimnasio", texto: "La sala de musculación", href: "/gimnasio" },
];

/* Los recuadros anchos son fijos (por posición); lo que cambia es la foto que hay dentro. */
const anchos = [2, 5];

export default function Galeria() {
  const caja = useRef<HTMLUListElement>(null);
  /* orden[posición] = índice de la foto que se ve ahí; previo = la que había antes (para el fundido). */
  const [{ orden, previo }, setEstado] = useState<{ orden: number[]; previo: (number | null)[] }>(() => ({ orden: espacios.map((_, i) => i), previo: espacios.map(() => null) }));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let id = 0;
    const arrancar = () => {
      if (id) return;
      id = window.setInterval(() => {
        const a = Math.floor(Math.random() * espacios.length);
        let b = Math.floor(Math.random() * (espacios.length - 1));
        if (b >= a) b++;
        setEstado(({ orden: o }) => {
          const n = [...o];
          [n[a], n[b]] = [n[b], n[a]];
          return { orden: n, previo: o.map((v, i) => (i === a || i === b ? v : null)) };
        });
      }, 2400);
    };
    const parar = () => {
      window.clearInterval(id);
      id = 0;
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? arrancar() : parar()), { threshold: 0.15 });
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
            <h2 id="titulo-galeria" data-reveal className="titular mt-3 text-titulo-3">
              720 por dentro
            </h2>
            <p data-reveal className="mt-2 max-w-xl text-[15px] text-white/60">Un recorrido por todos los espacios del centro, de la entrada a la sala.</p>
          </div>
          <Link href="/club" className="group hidden items-center gap-1 text-[14px] font-semibold text-white/75 hover:text-white sm:flex">
            Conoce el club <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
      <ul ref={caja} className="no-scrollbar mt-8 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 sm:px-6 lg:container-page lg:grid lg:auto-rows-[15rem] lg:grid-cols-4 lg:gap-4 lg:overflow-visible">
        {orden.map((indice, pos) => {
          const e = espacios[indice];
          const antes = previo[pos] === null ? null : espacios[previo[pos]!];
          const ancho = anchos.includes(pos);
          const sizes = ancho ? "(min-width:1024px) 50vw, 78vw" : "(min-width:1024px) 25vw, 78vw";
          return (
            <li key={pos} className={cn("relative w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-auto", ancho && "lg:col-span-2")}>
              <Link href={e.href} className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-suelo lg:aspect-auto lg:h-full">
                {antes && <Image key={`a-${antes.id}`} src={ancho ? antes.grande : antes.src} alt="" fill sizes={sizes} className={cn("object-cover", antes.pos)} />}
                <Image key={e.id} src={ancho ? e.grande : e.src} alt={e.alt} fill sizes={sizes} className={cn("object-cover", antes && "entra-foto", e.pos)} />
                <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" aria-hidden />
                <span key={`t-${e.id}`} className={cn("absolute right-4 bottom-4 left-4 flex items-end justify-between gap-3", antes && "entra-foto")}>
                  <span className="min-w-0">
                    <span className="subtitular block text-[19px] leading-tight">{e.zona}</span>
                    <span className="block truncate text-[13px] text-white/70">{e.texto}</span>
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
