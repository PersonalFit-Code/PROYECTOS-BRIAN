import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Foto from "@/components/ui/Foto";
import { SERIES, precioTexto, type Producto } from "@/data/catalogo";
import { cn } from "@/lib/utils";

/** Tarjeta de producto: foto sobre blanco, serie, nombre corto, una frase entera y precio. */
export default function TarjetaProducto({ producto, className }: { producto: Producto; className?: string }) {
  return (
    <Link href={`/producto/${producto.slug}`} className={cn("group flex flex-col border border-linea bg-white transition-[border-color,box-shadow] duration-300 hover:border-negro hover:shadow-card", className)}>
      <div className="relative aspect-square overflow-hidden bg-white">
        <Foto src={producto.imagen} alt={producto.nombre} contener className="p-3 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-105" />
        {producto.serie ? <span className="absolute top-3 left-3 bg-negro px-2 py-1 text-[10px] font-bold tracking-[0.14em] text-white uppercase">{SERIES[producto.serie].nombre}</span> : null}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 border-t border-linea p-4">
        <h3 className="text-[15px] leading-snug font-semibold text-negro">{producto.nombre}</h3>
        <p className="text-[13px] leading-relaxed text-gris">{producto.resumen}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className={cn("text-[15px] font-bold", producto.precio ? "text-negro" : "text-gris")}>{precioTexto(producto.precio)}</span>
          <span aria-hidden className="grid size-9 place-items-center bg-negro text-white transition-colors duration-300 group-hover:bg-rojo">
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
          </span>
        </div>
      </div>
    </Link>
  );
}
