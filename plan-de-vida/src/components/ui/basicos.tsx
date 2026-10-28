import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/formato";

/** Piezas pequeñas de interfaz con el aire de Notion: bordes finos, grises cálidos, sin sombras duras. */

/** Panel de cristal (liquid glass). */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("glass rounded-2xl p-4", className)} {...props} />;
}

/** Cabecera de página: icono en cristal, título, subtítulo y acciones a la derecha. */
export function Titulo({ icono, children, sub, acciones, color = "purple" }: { icono?: ReactNode; children: ReactNode; sub?: ReactNode; acciones?: ReactNode; color?: string }) {
  return (
    <header className="entrar mb-6 flex flex-wrap items-start gap-4">
      {icono && (
        <span className="glass grid size-12 shrink-0 place-items-center rounded-2xl [&_svg]:size-6" style={{ color: `var(--tag-${color}-fg)` }}>
          {icono}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{children}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </header>
  );
}

export function Seccion({ titulo, accion, children, className }: { titulo: ReactNode; accion?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx("mb-8", className)}>
      <div className="mb-2 flex items-center justify-between gap-2 border-b border-line pb-1">
        <h2 className="text-sm font-semibold text-muted">{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  );
}

type Variante = "primario" | "suave" | "fantasma" | "peligro";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-accent text-accent-fg shadow-sm shadow-accent/30 hover:brightness-110",
  suave: "glass hover:bg-hover",
  fantasma: "text-muted hover:bg-hover hover:text-fg",
  peligro: "text-bad hover:bg-hover",
};

export function Boton({ variante = "suave", className, ...props }: ComponentProps<"button"> & { variante?: Variante }) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition duration-200 active:scale-[0.97] disabled:opacity-50",
        VARIANTES[variante],
        className,
      )}
      {...props}
    />
  );
}

export function Campo({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cx(
        "w-full rounded-xl border border-line bg-bg/70 px-3 py-2 text-sm outline-none transition placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/20",
        className,
      )}
      {...props}
    />
  );
}

export function Selector({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cx("w-full rounded-xl border border-line bg-bg/70 px-2.5 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20", className)}
      {...props}
    />
  );
}

export function Texto({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cx(
        "w-full rounded-xl border border-line bg-bg/70 px-3 py-2 text-sm outline-none transition placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/20",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Etiqueta de campo. `grupo` la pinta como <div> en vez de <label>: para controles que son varios
 * botones (selector de iconos, escala de ánimo), que si no heredarían todos el nombre de la etiqueta.
 */
export function Etiqueta({ texto, label, children, grupo }: { texto?: string; label?: string; children?: ReactNode; grupo?: boolean }) {
  const Tag = grupo ? "div" : "label";
  return (
    <Tag className="block text-xs font-medium text-muted">
      {label ?? texto}
      {children && <div className="mt-1">{children}</div>}
    </Tag>
  );
}

export type ColorTag = "gray" | "green" | "yellow" | "blue" | "pink" | "red" | "purple" | "orange";

export function Tag({ color = "gray", children, className }: { color?: string; children: ReactNode; className?: string }) {
  return (
    <span
      className={cx("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium", className)}
      style={{ background: `var(--tag-${color}-bg)`, color: `var(--tag-${color}-fg)` }}
    >
      {children}
    </span>
  );
}

export function Progreso({ valor, color = "var(--accent)", className }: { valor: number; color?: string; className?: string }) {
  const v = Math.max(0, Math.min(100, valor));
  return (
    <div className={cx("h-2 w-full overflow-hidden rounded-full bg-hover", className)} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${v}%`, background: color }} />
    </div>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">{children}</p>;
}

export function Kpi({ etiqueta, valor, detalle, tono, icono, i = 0 }: { etiqueta: string; valor: ReactNode; detalle?: ReactNode; tono?: "ok" | "bad"; icono?: ReactNode; i?: number }) {
  return (
    <Card className="entrar p-3" style={{ ["--i" as string]: i }}>
      <div className="flex items-center gap-1.5 text-xs text-muted">
        {icono && <span className="[&_svg]:size-3.5">{icono}</span>}
        {etiqueta}
      </div>
      <div className={cx("mt-1 text-xl font-semibold tabular-nums", tono === "ok" && "text-ok", tono === "bad" && "text-bad")}>{valor}</div>
      {detalle && <div className="mt-0.5 text-xs text-muted">{detalle}</div>}
    </Card>
  );
}
