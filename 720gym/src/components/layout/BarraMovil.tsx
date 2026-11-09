"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarClock, Euro, Grid2x2, Home, HelpCircle, MapPin, MessageCircle, Plus, Users, X } from "lucide-react";
import IconoConcepto from "@/components/ui/IconoConcepto";
import { cn } from "@/lib/utils";
import { conceptos } from "@/data/conceptos";
import { wa } from "@/data/negocio";

/**
 * Barra de pestañas del móvil (tipo app), siempre a mano: Inicio · Clases · Inscríbete · Tarifas ·
 * Más. «Más» abre un panel con todos los conceptos y el resto de la web. Vidrio (Liquid Glass).
 */
export default function BarraMovil() {
  const ruta = usePathname();
  const [mas, setMas] = useState(false);
  const [rutaPrevia, setRutaPrevia] = useState(ruta);
  if (ruta !== rutaPrevia) {
    setRutaPrevia(ruta);
    setMas(false);
  }
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMas(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);
  if (ruta.startsWith("/alta") || ruta.startsWith("/panel")) return null;

  const pestana = (href: string, etiqueta: string, Icono: typeof Home) => {
    const activa = href === "/" ? ruta === "/" : ruta.startsWith(href);
    return (
      <Link href={href} className={cn("flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10.5px] font-semibold transition", activa ? "text-white" : "text-white/55")} aria-current={activa ? "page" : undefined}>
        <Icono className="size-5" aria-hidden />
        {etiqueta}
      </Link>
    );
  };

  return (
    <>
      {/* Panel «Más» */}
      <div className={cn("fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden", mas ? "opacity-100" : "pointer-events-none opacity-0")} onClick={() => setMas(false)} aria-hidden />
      <div
        id="panel-mas"
        role="dialog"
        aria-label="Más secciones"
        className={cn(
          "vidrio-fuerte fixed inset-x-3 bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+4.75rem)] z-50 max-h-[70svh] overflow-y-auto rounded-[1.75rem] p-4 transition-[transform,opacity] duration-300 lg:hidden",
          mas ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
        )}
      >
        <p className="etiqueta px-1 text-white/50">Conceptos</p>
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {conceptos.map((c) => (
            <li key={c.slug}>
              <Link href={c.href} className="flex h-full flex-col items-center gap-2 rounded-2xl bg-white/[0.06] px-2 py-3 text-center ring-1 ring-white/10">
                <IconoConcepto icono={c.icono} className="size-5" />
                <span className="text-[12px] leading-tight font-semibold">{c.nombre.replace(/^720 /, "")}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="etiqueta mt-5 px-1 text-white/50">El club</p>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {[
            ["/club", "El club", Users],
            ["/clubes", "Clubes y 720P", Users],
            ["/preguntas", "Preguntas", HelpCircle],
            ["/contacto", "Cómo llegar", MapPin],
          ].map(([href, t, I]) => {
            const Icono = I as typeof Home;
            return (
              <li key={href as string}>
                <Link href={href as string} className="flex items-center gap-2 rounded-2xl bg-white/[0.06] px-3 py-3 text-[13px] font-semibold ring-1 ring-white/10">
                  <Icono className="size-4 text-white/70" aria-hidden /> {t as string}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => (setMas(false), window.dispatchEvent(new Event("abrir-asistente")))} className="flex items-center justify-center gap-2 rounded-full bg-white px-3 py-3 text-[13px] font-semibold text-negro">
            <MessageCircle className="size-4" aria-hidden /> Pregunta al asistente
          </button>
          <a href={wa("Hola, quiero información sobre 720 GYM CLUB.")} target="_blank" rel="noopener noreferrer" className="vidrio-verde flex items-center justify-center gap-2 rounded-full px-3 py-3 text-[13px] font-semibold text-white">
            WhatsApp
          </a>
        </div>
      </div>

      {/* Pestañas */}
      <nav aria-label="Navegación del móvil" className="vidrio vidrio-denso fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 rounded-[1.75rem] px-2 py-1.5 lg:hidden">
        <ul className="grid grid-cols-5 items-center">
          <li>{pestana("/", "Inicio", Home)}</li>
          <li>{pestana("/horario", "Clases", CalendarClock)}</li>
          <li className="flex justify-center">
            <Link href="/alta" className="boton-venta sin-flecha grid size-13 -translate-y-3 place-items-center rounded-full shadow-[0_12px_30px_-8px_rgb(0_0_0/0.7)]" aria-label="Inscríbete">
              <Plus className="size-6" aria-hidden />
            </Link>
          </li>
          <li>{pestana("/tarifas", "Tarifas", Euro)}</li>
          <li>
            <button type="button" onClick={() => setMas((v) => !v)} aria-expanded={mas} aria-controls="panel-mas" className={cn("flex w-full flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10.5px] font-semibold transition", mas ? "text-white" : "text-white/55")}>
              {mas ? <X className="size-5" aria-hidden /> : <Grid2x2 className="size-5" aria-hidden />}
              Más
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
