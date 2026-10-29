"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Banknote, Check, CreditCard, Plus, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, useTransition } from "react";
import { crearMovimiento, crearTraspaso } from "@/app/(app)/finanzas/acciones";
import { Boton, Campo, Selector } from "@/components/ui/basicos";
import { Icono } from "@/components/ui/iconos";
import { cx } from "@/lib/formato";
import type { Account, Category, PayMethod, TxKind } from "@/lib/tipos";

export type CuentaRapida = Pick<Account, "id" | "name" | "pago">;

/**
 * Botón "+" flotante: apuntar un gasto o ingreso en tres toques (importe → categoría → listo), uno
 * pendiente (dinero en camino) o un traspaso entre tus cuentas (efectivo → banco).
 * Se abre también con ?nuevo=1 (atajo "Apuntar gasto" del icono de la app).
 */
export function BotonRapido({ categorias, cuentas }: { categorias: Category[]; cuentas: CuentaRapida[] }) {
  // En el coach no hace falta (apunta gastos hablando) y el botón taparía el de enviar.
  if (usePathname() === "/coach") return null;
  return (
    <Suspense>
      <BotonRapidoInterno categorias={categorias} cuentas={cuentas} />
    </Suspense>
  );
}

function BotonRapidoInterno({ categorias, cuentas }: { categorias: Category[]; cuentas: CuentaRapida[] }) {
  const params = useSearchParams();
  // ?nuevo=1: el atajo "Apuntar gasto" del icono de la app abre directamente el formulario
  const [abierto, setAbierto] = useState(() => params.get("nuevo") === "1");
  const [kind, setKind] = useState<TxKind | "traspaso">("gasto");
  const [enCamino, setEnCamino] = useState(false);
  const [metodo, setMetodo] = useState<PayMethod>("tarjeta");
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
        className="fixed right-5 bottom-24 z-30 grid size-14 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-sky-500 text-white shadow-xl shadow-violet-500/30 ring-1 ring-white/30 transition duration-300 hover:scale-105 active:scale-95 md:right-8 md:bottom-8"
      >
        <Plus className="size-7" />
      </button>

      <AnimatePresence>
      {abierto && (
        <motion.div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30 backdrop-blur-[2px] md:items-center" onClick={() => setAbierto(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="glass-strong pb-safe w-full max-w-md rounded-t-3xl p-5 md:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex rounded-xl border border-line p-0.5 text-sm">
                {(["gasto", "ingreso", "traspaso"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setKind(k);
                      setCategoria("");
                    }}
                    className={cx("rounded-lg px-3 py-1 capitalize transition", kind === k ? "bg-bg font-medium shadow-sm" : "text-muted")}
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
                    await (kind === "traspaso" ? crearTraspaso(f) : crearMovimiento(f));
                    setHecho(true);
                    setEnCamino(false);
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
              <input type="hidden" name="method" value={metodo} />
              {enCamino && kind !== "traspaso" && <input type="hidden" name="pending" value="on" />}
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
              {kind === "traspaso" ? (
                <Traspaso cuentas={cuentas} />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Cómo se pagó">
                    {(
                      [
                        ["tarjeta", "Tarjeta", CreditCard],
                        ["efectivo", "Efectivo", Banknote],
                      ] as const
                    ).map(([m, etiqueta, Icon]) => (
                      <button
                        key={m}
                        type="button"
                        role="radio"
                        aria-checked={metodo === m}
                        onClick={() => setMetodo(m)}
                        className={cx(
                          "flex items-center justify-center gap-2 rounded-xl border py-2 text-sm transition active:scale-95",
                          metodo === m ? "border-accent bg-accent/12 font-medium text-accent" : "border-line text-muted hover:bg-hover",
                        )}
                      >
                        <Icon className="size-4" /> {etiqueta}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {lista.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategoria(c.id === categoria ? "" : c.id)}
                        className={cx("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition active:scale-95", categoria === c.id ? "border-accent bg-accent text-accent-fg" : "border-line text-muted hover:bg-hover")}
                      >
                        <Icono nombre={c.emoji} className="size-3.5" />
                        {c.name}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 text-sm text-muted">
                    <input type="checkbox" checked={enCamino} onChange={(e) => setEnCamino(e.target.checked)} className="size-4 accent-[var(--accent)]" />
                    {kind === "ingreso" ? "Aún no ha llegado (pendiente)" : "Aún no se ha cobrado (pendiente)"}
                  </label>
                </>
              )}
              <Campo name="note" placeholder="Nota (opcional)" />
              <Campo name="day" type="date" defaultValue={new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Madrid" })} />
              {error && <p className="text-sm text-bad">{error}</p>}
              <Boton variante="primario" className="w-full py-2.5" disabled={pendiente}>
                {hecho ? (
                  <>
                    <Check className="size-4" /> Apuntado
                  </>
                ) : pendiente ? (
                  "Guardando…"
                ) : kind === "traspaso" ? (
                  "Pasar el dinero"
                ) : enCamino ? (
                  `Apuntar ${kind} pendiente`
                ) : (
                  `Apuntar ${kind} · ${metodo}`
                )}
              </Boton>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}

/** Origen y destino de un traspaso. Por defecto, del efectivo a la cuenta de la tarjeta. */
function Traspaso({ cuentas }: { cuentas: CuentaRapida[] }) {
  if (cuentas.length < 2) return <p className="text-sm text-muted">Necesitas al menos dos cuentas de dinero (Finanzas → Patrimonio) para pasar dinero entre ellas.</p>;
  const desde = cuentas.find((c) => c.pago === "efectivo") ?? cuentas[0];
  const hacia = cuentas.find((c) => c.pago === "tarjeta" && c.id !== desde.id) ?? cuentas.find((c) => c.id !== desde.id)!;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
      <label className="grid gap-1 text-xs text-muted">
        Sale de
        <Selector name="from_account_id" defaultValue={desde.id} aria-label="Cuenta de la que sale">
          {cuentas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Selector>
      </label>
      <ArrowRight className="mb-2.5 size-4 text-muted" />
      <label className="grid gap-1 text-xs text-muted">
        Entra en
        <Selector name="to_account_id" defaultValue={hacia.id} aria-label="Cuenta a la que entra">
          {cuentas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Selector>
      </label>
    </div>
  );
}
