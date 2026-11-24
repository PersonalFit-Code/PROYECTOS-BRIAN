"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CalendarClock, ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import { fotos } from "@/data/fotos";
import Logo from "@/components/ui/Logo";
import { claseBoton } from "@/components/ui/Boton";
import { cn } from "@/lib/utils";
import { negocio, wa, waVisita } from "@/data/negocio";
import { enlacesConceptos, navegacion } from "./navegacion";
import SelloConcepto from "@/components/ui/SelloConcepto";
import { repetirIntro } from "@/components/ui/Intro";

/** Cabecera: transparente sobre la portada, negra al bajar. Desplegable «Conceptos». */
export default function Header() {
  const ruta = usePathname();
  const [bajado, setBajado] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [conceptosAbierto, setConceptosAbierto] = useState(false);
  const cierre = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onScroll = () => setBajado(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Al cambiar de página se cierran los menús (patrón de React: comparar con la ruta anterior). */
  const [rutaPrevia, setRutaPrevia] = useState(ruta);
  if (ruta !== rutaPrevia) {
    setRutaPrevia(ruta);
    setAbierto(false);
    setConceptosAbierto(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = abierto ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && (setAbierto(false), setConceptosAbierto(false));
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [abierto]);

  /* Transparente solo arriba del todo y en páginas que empiezan en oscuro. */
  const empiezaOscura = ruta === "/" || ruta.startsWith("/conceptos") || ruta === "/clubes" || ruta === "/alta";
  const transparente = !bajado && !abierto && !conceptosAbierto && empiezaOscura;

  const abrirConceptos = () => {
    window.clearTimeout(cierre.current);
    setConceptosAbierto(true);
  };
  const cerrarConceptos = () => {
    cierre.current = window.setTimeout(() => setConceptosAbierto(false), 140);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[padding] duration-500",
        bajado && "lg:pt-3",
      )}
    >
      {/* Barra de vidrio flotante al bajar (Liquid Glass); transparente sobre la portada. */}
      <div
        className={cn(
          "mx-auto flex h-[var(--header-h)] items-center justify-between gap-6 px-4 transition-[max-width,border-radius,background-color,box-shadow] duration-500 sm:px-6 lg:px-8",
          /* La forma solo cambia al hacer scroll (si cambiara al abrir el menú, el ratón saldría y se cerraría). */
          bajado ? "max-w-full lg:max-w-[min(80rem,calc(100%-3rem))] lg:rounded-full" : "max-w-[84rem] lg:px-10 lg:rounded-b-3xl",
          !transparente && "vidrio vidrio-denso",
        )}
      >
        <Link
          href="/"
          className="text-[19px]"
          aria-label="720 GYM CLUB, inicio"
          onClick={(e) => {
            /* En la portada: vuelve arriba y repite la entrada del «720». Desde otra página, al llegar. */
            if (ruta === "/") {
              e.preventDefault();
              repetirIntro();
            } else window.setTimeout(repetirIntro, 350);
          }}
        >
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Principal">
          <div className="relative" onMouseEnter={abrirConceptos} onMouseLeave={cerrarConceptos}>
            <button
              type="button"
              className="subtitular flex items-center gap-1 text-[14px] text-white/85 transition-colors hover:text-white"
              aria-expanded={conceptosAbierto}
              aria-controls="menu-conceptos"
              onClick={() => setConceptosAbierto((v) => !v)}
            >
              Actividades <ChevronDown className={cn("size-4 transition-transform", conceptosAbierto && "rotate-180")} aria-hidden />
            </button>
          </div>
          {navegacion.map((e) => (
            <Link key={e.href} href={e.href} className="subtitular text-[14px] text-white/85 transition-colors hover:text-white">
              {e.nombre}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href={waVisita()} target="_blank" rel="noopener" className={cn(claseBoton("venta"), "h-11 rounded-full px-4 sm:px-5")}>
            <span className="sm:hidden">Conócenos</span>
            <span className="hidden sm:inline">Ven a conocer 720</span>
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center text-white lg:hidden"
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={abierto}
            aria-controls="menu-movil"
            onClick={() => setAbierto((v) => !v)}
          >
            {abierto ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Desplegable de escritorio */}
      <div
        id="menu-conceptos"
        onMouseEnter={abrirConceptos}
        onMouseLeave={cerrarConceptos}
        className={cn(
          "vidrio-fuerte absolute inset-x-6 top-[calc(100%+0.5rem)] mx-auto hidden max-w-[80rem] rounded-[2rem] transition-[opacity,transform] duration-300 lg:block",
          conceptosAbierto ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
        )}
      >
        <div className="grid grid-cols-12 gap-6 p-6">
          <ul className="col-span-8 grid grid-cols-2 gap-2">
            {enlacesConceptos.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="group flex items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-white/[0.07]">
                  <SelloConcepto logo={c.logo} nombre={c.nombre} className="size-16 rounded-2xl text-[52px] transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3" />
                  <span className="min-w-0 flex-1">
                    <span className="etiqueta block !text-[10px] text-white/45">{c.marca}</span>
                    <span className="titular mt-0.5 block text-[21px] text-white">{c.nombre}</span>
                    <span className="mt-0.5 block truncate text-[12.5px] text-white/55">{c.lineas}</span>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-white/30 transition-[transform,color] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <div className="col-span-4 flex flex-col gap-3">
            <Link href={waVisita()} target="_blank" rel="noopener" className="group relative isolate flex flex-1 flex-col justify-end overflow-hidden rounded-2xl p-5">
              <Image src={fotos.racks.src} alt="" fill sizes="26rem" className="-z-20 object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 -z-10 bg-gradient-to-t from-negro via-negro/50 to-transparent" aria-hidden />
              <span className="etiqueta !text-[10px] text-white/70">Ven a conocernos</span>
              <span className="titular mt-1 text-[24px] text-white">Concierta una visita</span>
              <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-white/85">
                Escríbenos por WhatsApp <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
            <Link href="/horario" className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-4 text-[14px] font-semibold ring-1 ring-white/10 transition hover:bg-white/[0.1]">
              <CalendarClock className="size-5 text-white/70" aria-hidden /> Ver el horario de clases
            </Link>
          </div>
        </div>
      </div>

      {/* Menú del móvil */}
      <div
        id="menu-movil"
        className={cn(
          "fixed inset-x-0 top-[var(--header-h)] bottom-0 overflow-y-auto bg-negro transition-[opacity,visibility] duration-300 lg:hidden",
          abierto ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <nav className="container-page flex min-h-full flex-col pt-4 pb-10" aria-label="Menú">
          <details className="group border-b border-white/10" open>
            <summary className="titular flex cursor-pointer items-center justify-between py-4 text-[28px]">
              Actividades <ChevronDown className="size-6 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <ul className="grid grid-cols-2 gap-2 pb-4">
              {enlacesConceptos.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="flex h-full items-center gap-3 rounded-2xl bg-white/[0.05] p-3 ring-1 ring-white/10">
                    <SelloConcepto logo={c.logo} nombre={c.nombre} className="size-11 rounded-xl text-[36px]" />
                    <span className="subtitular text-[14px] leading-tight">{c.nombre}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </details>
          {navegacion.map((e) => (
            <Link key={e.href} href={e.href} className="titular border-b border-white/10 py-4 text-[28px]">
              {e.nombre}
            </Link>
          ))}
          <div className="mt-auto grid gap-3 pt-8">
            <Link href={waVisita()} target="_blank" rel="noopener" className={claseBoton("venta", true)}>
              Ven a conocer 720
            </Link>
            <a href={wa("Hola, tengo una duda sobre 720 GYM CLUB.")} target="_blank" rel="noopener noreferrer" className={claseBoton("contorno", true)}>
              Escríbenos por WhatsApp
            </a>
            <p className="mt-2 text-center text-[13px] text-white/50">
              {negocio.horario.texto} · {negocio.direccion.calle}
            </p>
          </div>
        </nav>
      </div>
    </header>
  );
}
