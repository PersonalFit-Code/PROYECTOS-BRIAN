"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import TarjetaProducto from "./TarjetaProducto";
import { SERIES, type Producto, type Serie } from "@/data/catalogo";
import { cn } from "@/lib/utils";

type Orden = "destacados" | "precio-asc" | "precio-desc" | "nombre";

/**
 * Rejilla de una categoría con filtros: serie, «solo con precio» y orden. Todo en el navegador
 * (en WooCommerce lo haría un plugin de filtros).
 */
export default function Catalogo({ productos, serieInicial }: { productos: Producto[]; serieInicial?: Serie }) {
  const seriesPresentes = useMemo(() => Array.from(new Set(productos.map((p) => p.serie).filter((s): s is Serie => !!s))), [productos]);
  const [series, setSeries] = useState<Serie[]>(serieInicial && seriesPresentes.includes(serieInicial) ? [serieInicial] : []);
  const [conPrecio, setConPrecio] = useState(false);
  const [orden, setOrden] = useState<Orden>("destacados");

  const visibles = useMemo(() => {
    let lista = productos.filter((p) => (series.length === 0 || (p.serie && series.includes(p.serie))) && (!conPrecio || p.precio));
    const precio = (p: Producto) => p.precio?.valor ?? Number.POSITIVE_INFINITY;
    lista = [...lista].sort((a, b) => {
      if (orden === "precio-asc") return precio(a) - precio(b);
      if (orden === "precio-desc") return (b.precio?.valor ?? -1) - (a.precio?.valor ?? -1);
      if (orden === "nombre") return a.nombre.localeCompare(b.nombre, "es");
      return Number(!!b.destacado) - Number(!!a.destacado);
    });
    return lista;
  }, [productos, series, conPrecio, orden]);

  const alternar = (s: Serie) => setSeries((act) => (act.includes(s) ? act.filter((x) => x !== s) : [...act, s]));
  const hayFiltros = series.length > 0 || conPrecio;

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_1fr]">
      <aside aria-label="Filtros" className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
        <p className="flex items-center gap-2 text-[12px] font-bold tracking-[0.16em] uppercase">
          <SlidersHorizontal aria-hidden className="size-4 text-rojo" /> Filtrar
        </p>

        {seriesPresentes.length > 0 ? (
          <fieldset className="mt-6">
            <legend className="etiqueta text-gris">Serie</legend>
            <div className="mt-3 flex flex-wrap gap-2 lg:flex-col">
              {seriesPresentes.map((s) => {
                const activo = series.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => alternar(s)}
                    className={cn(
                      "min-h-10 border px-3 text-left text-[13px] font-semibold transition-colors",
                      activo ? "border-negro bg-negro text-white" : "border-linea bg-white text-negro hover:border-negro",
                    )}
                  >
                    {SERIES[s].nombre}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        <fieldset className="mt-6">
          <legend className="etiqueta text-gris">Precio</legend>
          <label className="mt-3 flex min-h-10 cursor-pointer items-center gap-3 text-[14px]">
            <input type="checkbox" checked={conPrecio} onChange={(e) => setConPrecio(e.target.checked)} className="size-4 accent-rojo" />
            Solo con precio publicado
          </label>
        </fieldset>

        {hayFiltros ? (
          <button
            type="button"
            onClick={() => {
              setSeries([]);
              setConPrecio(false);
            }}
            className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-[13px] font-semibold text-rojo underline underline-offset-4"
          >
            <X aria-hidden className="size-3.5" /> Quitar filtros
          </button>
        ) : null}
      </aside>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-linea pb-4">
          <p className="text-sm text-gris" aria-live="polite">
            <strong className="text-negro">{visibles.length}</strong> {visibles.length === 1 ? "producto" : "productos"}
          </p>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-gris">Ordenar</span>
            <select value={orden} onChange={(e) => setOrden(e.target.value as Orden)} className="min-h-10 border border-linea bg-white px-3 text-sm font-semibold focus:border-negro">
              <option value="destacados">Más elegidos</option>
              <option value="precio-asc">Precio: de menor a mayor</option>
              <option value="precio-desc">Precio: de mayor a menor</option>
              <option value="nombre">Nombre</option>
            </select>
          </label>
        </div>
        {visibles.length > 0 ? (
          <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {visibles.map((p) => (
              <li key={p.slug} className="flex">
                <TarjetaProducto producto={p} className="w-full" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 text-gris">No hay productos con esos filtros.</p>
        )}
      </div>
    </div>
  );
}
