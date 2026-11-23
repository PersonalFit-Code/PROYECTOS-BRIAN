"use client";

import { AtSign, Phone } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { cx, telefonoBonito } from "@/lib/formato";
import { COLUMNAS, ESTADO_TONO, ESTADO_TXT, columnaDe, type ColumnaId, type Estado } from "@/lib/tipos";
import { moverNegocio } from "./acciones";

export interface Tarjeta {
  id: string;
  nombre: string;
  subsector: string | null;
  localidad: string | null;
  comunidad: string;
  telefono: string | null;
  instagram: string | null;
  estado: Estado;
}

const MAX_POR_CONTACTAR = 30;
/** Tipo propio en el arrastre: así se ignora cualquier otra cosa que se suelte encima (un enlace, un texto). */
const TIPO = "application/x-negocio";

/**
 * El tablero: en el ordenador las tarjetas se arrastran; en el móvil y con teclado se usa el
 * selector «Mover a» de cada tarjeta, que hace lo mismo.
 */
export function Tablero({ tarjetas, porContactarTotal, verTodas, enlaceTodas }: { tarjetas: Tarjeta[]; porContactarTotal: number; verTodas: boolean; enlaceTodas: string }) {
  const [lista, mover] = useOptimistic(tarjetas, (estado: Tarjeta[], cambio: { id: string; a: Estado }) =>
    estado.map((t) => (t.id === cambio.id ? { ...t, estado: cambio.a } : t)),
  );
  const [, empezar] = useTransition();
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<ColumnaId | null>(null);
  const [aviso, setAviso] = useState("");

  function aColumna(id: string, columna: ColumnaId) {
    const col = COLUMNAS.find((c) => c.id === columna)!;
    const t = lista.find((x) => x.id === id);
    if (!t || columnaDe(t.estado) === columna) return;
    empezar(async () => {
      mover({ id, a: col.destino });
      try {
        await moverNegocio(id, columna);
        setAviso(`${t.nombre}: movido a «${col.titulo}».`);
      } catch {
        setAviso(`No se ha podido mover ${t.nombre}. Prueba otra vez.`);
      }
    });
  }

  return (
    <>
      <p aria-live="polite" className="sr-only">
        {aviso}
      </p>
      <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-4 md:w-max md:flex-row md:items-start">
          {COLUMNAS.map((c) => {
            let suyas = lista.filter((t) => columnaDe(t.estado) === c.id);
            const total = c.id === "por_contactar" ? porContactarTotal - tarjetas.filter((t) => t.estado === "pendiente").length + suyas.length : suyas.length;
            if (c.id === "por_contactar" && !verTodas) suyas = suyas.slice(0, MAX_POR_CONTACTAR);
            return (
              <section
                key={c.id}
                aria-labelledby={`col-${c.id}`}
                onDragOver={(e) => {
                  if (!e.dataTransfer.types.includes(TIPO)) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setSobre(c.id);
                }}
                onDragLeave={() => setSobre((s) => (s === c.id ? null : s))}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData(TIPO);
                  if (id) aColumna(id, c.id);
                  setArrastrando(null);
                  setSobre(null);
                }}
                // En el móvil las columnas van una debajo de otra: «Por contactar» al final, para ver primero lo que está en marcha.
                className={cx("flex flex-col rounded-2xl border bg-side p-3 transition-colors md:order-none md:w-72", c.id === "por_contactar" && "order-last", sobre === c.id ? "border-brand bg-soft" : "border-line")}
              >
                <h2 id={`col-${c.id}`} className="mb-3 flex items-baseline justify-between gap-2 px-1 text-base font-bold">
                  {c.titulo}
                  <span className="rounded-full bg-bg px-2 py-0.5 text-xs font-bold text-muted tabular-nums">{total}</span>
                </h2>
                {suyas.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">Arrastra aquí</p>
                ) : (
                  <ul className="space-y-2 md:max-h-[65dvh] md:overflow-y-auto">
                    {suyas.map((t) => (
                      <li
                        key={t.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(TIPO, t.id);
                          e.dataTransfer.effectAllowed = "move";
                          setArrastrando(t.id);
                        }}
                        onDragEnd={() => {
                          setArrastrando(null);
                          setSobre(null);
                        }}
                        className={cx("tarjeta-kanban rounded-xl border border-line bg-bg p-3 md:cursor-grab", arrastrando === t.id && "opacity-50")}
                      >
                        <Link href={`/negocios/${t.id}`} className="block font-[family-name:var(--font-titulo)] text-sm font-bold break-words hover:text-brand">
                          {t.nombre}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted">{[t.subsector, t.localidad ?? t.comunidad].filter(Boolean).join(" · ")}</p>
                        {(c.id === "esperando" || c.id === "descartado") && (
                          <span className={cx("mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold", ESTADO_TONO[t.estado])}>{ESTADO_TXT[t.estado]}</span>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold">
                          {t.telefono && (
                            <a href={`tel:+34${t.telefono}`} className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-soft px-2 text-brand">
                              <Phone className="size-3.5" aria-hidden />
                              {telefonoBonito(t.telefono)}
                            </a>
                          )}
                          {t.instagram && (
                            <a href={t.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-line px-2">
                              <AtSign className="size-3.5" aria-hidden />
                              Instagram
                            </a>
                          )}
                        </div>
                        <label className="mt-2 block">
                          <span className="sr-only">Mover {t.nombre} a</span>
                          <select
                            value={c.id}
                            onChange={(e) => aColumna(t.id, e.target.value as ColumnaId)}
                            className="min-h-9 w-full rounded-lg border border-line bg-bg px-2 text-xs font-bold text-muted"
                          >
                            {COLUMNAS.map((o) => (
                              <option key={o.id} value={o.id}>
                                {o.id === c.id ? `En «${o.titulo}»` : `Mover a «${o.titulo}»`}
                              </option>
                            ))}
                          </select>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
                {c.id === "por_contactar" && !verTodas && total > MAX_POR_CONTACTAR && (
                  <Link href={enlaceTodas} className="mt-3 text-center text-sm font-bold text-brand underline">
                    Ver los {total} negocios
                  </Link>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
