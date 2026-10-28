"use client";

import { Plus, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, useTransition } from "react";
import { crearMovimiento } from "@/app/(app)/finanzas/acciones";
import { Boton, Campo } from "@/components/ui/basicos";
import { cx } from "@/lib/formato";
import type { Category, TxKind } from "@/lib/tipos";

/**
 * Botón "+" flotante: apuntar un gasto o ingreso en tres toques (importe → categoría → listo).
 * Se abre también con ?nuevo=1 (atajo "Apuntar gasto" del icono de la app).
 */
export function BotonRapido({ categorias }: { categorias: Category[] }) {
  // En el Inicio no hace falta: el coach apunta gastos hablando, y el botón taparía el de enviar.
  if (usePathname() === "/") return null;
  return (
    <Suspense>
      <BotonRapidoInterno categorias={categorias} />
    </Suspense>
  );
}

function BotonRapidoInterno({ categorias }: { categorias: Category[] }) {
  const params = useSearchParams();
  // ?nuevo=1: el atajo "Apuntar gasto" del icono de la app abre directamente el formulario
  const [abierto, setAbierto] = useState(() => params.get("nuevo") === "1");
  const [kind, setKind] = useState<TxKind>("gasto");
  const [categoria, setCategoria] = useState<string>("");
  const [hecho, setHecho] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, start] = useTransition();
  const importe = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (abierto) setTimeout(() => importe.current?.focus(), 50);
  }, [abierto]);

  const lista = categorias.filter((c) => c.kind === kind);

  return (
    <>
      <button
        aria-label="Apuntar gasto o ingreso"
        onClick={() => {
          setAbierto(true);
          setHecho(false);
        }}
        className="fixed right-4 bottom-20 z-30 grid size-14 place-items-center rounded-full bg-accent text-accent-fg shadow-lg transition hover:scale-105 md:right-8 md:bottom-8"
      >
        <Plus className="size-7" />
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center" onClick={() => setAbierto(false)}>
          <div className="pb-safe w-full max-w-md rounded-t-2xl border border-line bg-bg p-4 md:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex rounded-md border border-line p-0.5 text-sm">
                {(["gasto", "ingreso"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setKind(k);
                      setCategoria("");
                    }}
                    className={cx("rounded px-3 py-1 capitalize", kind === k ? "bg-hover font-medium" : "text-muted")}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <button aria-label="Cerrar" onClick={() => setAbierto(false)} className="rounded p-1 hover:bg-hover">
                <X className="size-5" />
              </button>
            </div>
            <form
              action={(f) =>
                start(async () => {
                  setError(null);
                  try {
                    await crearMovimiento(f);
                    setHecho(true);
                    setCategoria("");
                    if (importe.current) importe.current.value = "";
                    setTimeout(() => setAbierto(false), 700);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "No se pudo guardar");
                  }
                })
              }
              className="space-y-3"
            >
              <input type="hidden" name="kind" value={kind} />
              <input type="hidden" name="category_id" value={categoria} />
              <div className="flex items-baseline gap-2">
                <input
                  ref={importe}
                  name="amount"
                  inputMode="decimal"
                  required
                  placeholder="0,00"
                  className="w-full bg-transparent text-4xl font-semibold tabular-nums outline-none placeholder:text-faint"
                />
                <span className="text-2xl text-muted">€</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {lista.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoria(c.id === categoria ? "" : c.id)}
                    className={cx("rounded-full border px-2.5 py-1 text-sm", categoria === c.id ? "border-accent bg-hover font-medium" : "border-line text-muted")}
                  >
                    {c.emoji} {c.name}
                  </button>
                ))}
              </div>
              <Campo name="note" placeholder="Nota (opcional)" />
              <Campo name="day" type="date" defaultValue={new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Madrid" })} />
              {error && <p className="text-sm text-bad">{error}</p>}
              <Boton variante="primario" className="w-full py-2.5" disabled={pendiente}>
                {hecho ? "✓ Apuntado" : pendiente ? "Guardando…" : `Apuntar ${kind}`}
              </Boton>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
