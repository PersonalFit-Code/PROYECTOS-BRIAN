import Link from "next/link";
import Foto from "@/components/ui/Foto";
import { CATEGORIAS, SERIES, precioTexto, type Producto } from "@/data/catalogo";
import { cn } from "@/lib/utils";

/**
 * Tarjeta de producto al estilo Gymshark: foto grande sobre gris claro (el blanco de las fotos se
 * funde con `mix-blend-multiply`), etiqueta pequeña en blanco en la esquina, y debajo, sin caja:
 * nombre, una línea en gris y el precio.
 */
export default function TarjetaProducto({ producto, className }: { producto: Producto; className?: string }) {
  const linea = producto.serie ? SERIES[producto.serie].nombre : (CATEGORIAS.find((c) => c.slug === producto.categoria)?.nombre ?? "");
  return (
    <Link href={`/producto/${producto.slug}`} className={cn("group flex flex-col", className)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-hueso">
        <Foto src={producto.imagen} alt={producto.nombre} contener className="p-6 mix-blend-multiply transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]" />
        {producto.serie ? <span className="absolute bottom-3 left-3 bg-white px-2 py-1 text-[10px] font-medium text-negro">{SERIES[producto.serie].nombre}</span> : null}
      </div>
      <div className="flex flex-1 flex-col pt-3">
        <h3 className="text-[13px] leading-snug font-semibold text-negro group-hover:underline group-hover:underline-offset-2">{producto.nombre}</h3>
        <p className="mt-0.5 text-[12px] leading-snug text-gris">{producto.resumen || linea}</p>
        <p className={cn("mt-2 text-[13px] font-semibold", producto.precio ? "text-negro" : "text-gris")}>{precioTexto(producto.precio)}</p>
      </div>
    </Link>
  );
}
