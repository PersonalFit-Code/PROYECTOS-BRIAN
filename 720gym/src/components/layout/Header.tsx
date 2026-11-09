"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X, ArrowUpRight } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { claseBoton } from "@/components/ui/Boton";
import { cn } from "@/lib/utils";
import { negocio, wa } from "@/data/negocio";
import { enlacesConceptos, navegacion, enlacePrueba } from "./navegacion";

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
        !transparente && "lg:pt-3",
      )}
    >
      {/* Barra de vidrio flotante al bajar (Liquid Glass); transparente sobre la portada. */}
      <div
        className={cn(
          "mx-auto flex h-[var(--header-h)] items-center justify-between gap-6 px-4 transition-[max-width,border-radius,background-color,box-shadow] duration-500 sm:px-6 lg:px-8",
          transparente ? "max-w-[84rem] lg:px-10" : "vidrio vidrio-denso max-w-full lg:max-w-[min(80rem,calc(100%-3rem))] lg:rounded-full",
        )}
      >
        <Link href="/" className="text-[19px]" aria-label="720 GYM CLUB, inicio">
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
              Conceptos <ChevronDown className={cn("size-4 transition-transform", conceptosAbierto && "rotate-180")} aria-hidden />
            </button>
          </div>
          {navegacion.map((e) => (
            <Link key={e.href} href={e.href} className="subtitular text-[14px] text-white/85 transition-colors hover:text-white">
              {e.nombre}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href={enlacePrueba} className={cn(claseBoton("contorno"), "h-11 rounded-full max-xl:!hidden")}>
            Clase gratis
          </Link>
          <Link href="/alta" className={cn(claseBoton("venta"), "h-11 rounded-full px-4 sm:px-5")}>
            Inscríbete
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
        <div className="grid grid-cols-3 gap-x-10 gap-y-1 px-10 py-8">
          {enlacesConceptos.map((c) => (
            <Link key={c.href} href={c.href} className="group flex items-start justify-between gap-4 border-b border-white/8 py-4">
              <span>
                <span className="etiqueta block text-acento">{c.marca}</span>
                <span className="titular mt-1 block text-[22px] text-white">{c.nombre}</span>
                <span className="mt-1 line-clamp-1 block text-[13px] text-white/55">{c.lineas}</span>
              </span>
              <ArrowUpRight className="mt-6 size-5 shrink-0 text-white/40 transition-[transform,color] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-acento" aria-hidden />
            </Link>
          ))}
          <Link href="/clubes" className="col-span-3 mt-3 text-[13px] text-white/60 hover:text-white">
            Y además: gimnasia acrobática, capoeira, jiu-jitsu brasileño y halterofilia con los clubes que entrenan en 720 →
          </Link>
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
              Conceptos <ChevronDown className="size-6 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <ul className="pb-4">
              {enlacesConceptos.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="flex items-center justify-between py-2.5 text-white/80">
                    <span className="subtitular text-[17px]">{c.nombre}</span>
                    <ArrowUpRight className="size-4 text-acento" aria-hidden />
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/clubes" className="block py-2.5 text-[14px] text-white/55">
                  Clubes: acrobacia, capoeira, BJJ…
                </Link>
              </li>
            </ul>
          </details>
          {navegacion.map((e) => (
            <Link key={e.href} href={e.href} className="titular border-b border-white/10 py-4 text-[28px]">
              {e.nombre}
            </Link>
          ))}
          <div className="mt-auto grid gap-3 pt-8">
            <Link href="/alta" className={claseBoton("venta", true)}>
              Inscríbete ahora
            </Link>
            <Link href={enlacePrueba} className={claseBoton("contorno", true)}>
              Clase gratis
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
