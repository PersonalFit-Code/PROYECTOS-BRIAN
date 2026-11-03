"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import type { Producto } from "@/data/catalogo";

/**
 * Fila de productos que se desliza, como las de Gymshark: titular estrecho a la izquierda, «Ver todo»
 * subrayado y dos flechas a la derecha. En el móvil se arrastra con el dedo (scroll-snap).
 */
export default function Carrusel({ titulo, verTodo, productos }: { titulo: string; verTodo?: string; productos: Producto[] }) {
  const pista = useRef<HTMLUListElement>(null);
  const mover = (dir: 1 | -1) => {
    const el = pista.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <section className="py-12 sm:py-16" aria-label={titulo}>
      <div className="container-page flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-4">
          <h2 className="titular text-[28px] sm:text-[34px]">{titulo}</h2>
          {verTodo ? (
            <Link href={verTodo} className="text-[12px] text-gris underline underline-offset-4 hover:text-negro">
              Ver todo
            </Link>
          ) : null}
        </div>
        <div className="hidden gap-1 sm:flex">
          <button type="button" onClick={() => mover(-1)} aria-label="Anteriores" className="grid size-10 place-items-center transition-colors hover:bg-hueso">
            <ChevronLeft aria-hidden className="size-5" strokeWidth={1.75} />
          </button>
          <button type="button" onClick={() => mover(1)} aria-label="Siguientes" className="grid size-10 place-items-center transition-colors hover:bg-hueso">
            <ChevronRight aria-hidden className="size-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
      <ul ref={pista} className="no-scrollbar container-page mt-6 flex snap-x snap-mandatory gap-1.5 overflow-x-auto scroll-smooth">
        {productos.map((p) => (
          <li key={p.slug} className="w-[68%] shrink-0 snap-start sm:w-[38%] lg:w-[calc((100%-4*0.375rem)/5)]">
            <TarjetaProducto producto={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
