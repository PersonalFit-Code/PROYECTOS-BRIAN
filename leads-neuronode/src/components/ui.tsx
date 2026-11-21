import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/formato";
import { ESTADO_TONO, ESTADO_TXT, type Estado } from "@/lib/tipos";

/** Piezas pequeñas de interfaz con la marca neuro·node. */

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("rounded-2xl border border-line bg-bg p-4", className)} {...props} />;
}

export function Titulo({ children, sub, acciones }: { children: ReactNode; sub?: ReactNode; acciones?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{children}</h1>
        {sub && <p className="mt-1 text-muted">{sub}</p>}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </header>
  );
}

type Variante = "primario" | "suave" | "fantasma";
const VARIANTES: Record<Variante, string> = {
  primario: "bg-brand text-white hover:brightness-110",
  suave: "border border-line bg-bg text-fg hover:bg-soft",
  fantasma: "text-muted hover:bg-soft hover:text-fg",
};
const BASE_BOTON = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition disabled:opacity-50";

export function Boton({ variante = "suave", className, ...props }: ComponentProps<"button"> & { variante?: Variante }) {
  return <button className={cx(BASE_BOTON, VARIANTES[variante], className)} {...props} />;
}

/** Clases de botón para usarlas en un enlace. */
export function claseBoton(variante: Variante = "suave", extra?: string) {
  return cx(BASE_BOTON, VARIANTES[variante], extra);
}

const CAMPO = "w-full min-h-11 rounded-xl border border-line bg-bg px-3 py-2 text-base text-fg placeholder:text-muted/70";

/** Campo con su etiqueta visible. */
export function Campo({ etiqueta, className, id, name, ...props }: ComponentProps<"input"> & { etiqueta: string }) {
  const elId = id ?? `campo-${name}`;
  return (
    <label htmlFor={elId} className="block">
      <span className="mb-1 block text-sm font-bold">{etiqueta}</span>
      <input id={elId} name={name} className={cx(CAMPO, className)} {...props} />
    </label>
  );
}

export function Selector({ etiqueta, className, id, name, children, ...props }: ComponentProps<"select"> & { etiqueta: string }) {
  const elId = id ?? `campo-${name}`;
  return (
    <label htmlFor={elId} className="block">
      <span className="mb-1 block text-sm font-bold">{etiqueta}</span>
      <select id={elId} name={name} className={cx(CAMPO, className)} {...props}>
        {children}
      </select>
    </label>
  );
}

export function AreaTexto({ etiqueta, className, id, name, ...props }: ComponentProps<"textarea"> & { etiqueta: string }) {
  const elId = id ?? `campo-${name}`;
  return (
    <label htmlFor={elId} className="block">
      <span className="mb-1 block text-sm font-bold">{etiqueta}</span>
      <textarea id={elId} name={name} className={cx(CAMPO, "min-h-24", className)} {...props} />
    </label>
  );
}

export function EtiquetaEstado({ estado }: { estado: Estado }) {
  return <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap", ESTADO_TONO[estado])}>{ESTADO_TXT[estado]}</span>;
}

/** Barra de progreso con su texto: «37 de 100». */
export function Progreso({ valor, total, etiqueta }: { valor: number; total: number; etiqueta: string }) {
  const pct = total > 0 ? Math.min(100, Math.round((valor / total) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span className="font-bold">{etiqueta}</span>
        <span className="text-muted tabular-nums">
          {valor} de {total}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-soft" role="progressbar" aria-valuenow={valor} aria-valuemin={0} aria-valuemax={total} aria-label={etiqueta}>
        <div className="degradado h-full rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-line bg-side p-6 text-center text-muted">{children}</p>;
}
