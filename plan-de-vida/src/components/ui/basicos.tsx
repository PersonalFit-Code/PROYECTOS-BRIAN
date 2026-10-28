import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/formato";

/** Piezas pequeñas de interfaz con el aire de Notion: bordes finos, grises cálidos, sin sombras duras. */

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("rounded-lg border border-line bg-card p-4", className)} {...props} />;
}

export function Titulo({ emoji, children, sub }: { emoji?: string; children: ReactNode; sub?: ReactNode }) {
  return (
    <header className="mb-6">
      {emoji && <div className="mb-2 text-5xl leading-none">{emoji}</div>}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{children}</h1>
      {sub && <p className="mt-2 text-muted">{sub}</p>}
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
  primario: "bg-accent text-accent-fg hover:opacity-90",
  suave: "border border-line bg-card hover:bg-hover",
  fantasma: "text-muted hover:bg-hover hover:text-fg",
  peligro: "text-bad hover:bg-hover",
};

export function Boton({ variante = "suave", className, ...props }: ComponentProps<"button"> & { variante?: Variante }) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition disabled:opacity-50",
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
        "w-full rounded-md border border-line bg-bg px-2.5 py-1.5 text-sm outline-none placeholder:text-faint focus:border-accent",
        className,
      )}
      {...props}
    />
  );
}

export function Selector({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cx("w-full rounded-md border border-line bg-bg px-2 py-1.5 text-sm outline-none focus:border-accent", className)}
      {...props}
    />
  );
}

export function Texto({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cx(
        "w-full rounded-md border border-line bg-bg px-2.5 py-2 text-sm outline-none placeholder:text-faint focus:border-accent",
        className,
      )}
      {...props}
    />
  );
}

export function Etiqueta({ texto, label, children }: { texto?: string; label?: string; children?: ReactNode }) {
  return <label className="block text-xs font-medium text-muted">{label ?? texto}{children && <div className="mt-1">{children}</div>}</label>;
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
    <div className={cx("h-1.5 w-full overflow-hidden rounded-full bg-hover", className)} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full transition-all" style={{ width: `${v}%`, background: color }} />
    </div>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return <p className="rounded-md border border-dashed border-line px-4 py-6 text-center text-sm text-muted">{children}</p>;
}

export function Kpi({ etiqueta, valor, detalle, tono }: { etiqueta: string; valor: ReactNode; detalle?: ReactNode; tono?: "ok" | "bad" }) {
  return (
    <Card className="p-3">
      <div className="text-xs text-muted">{etiqueta}</div>
      <div className={cx("mt-1 text-xl font-semibold tabular-nums", tono === "ok" && "text-ok", tono === "bad" && "text-bad")}>{valor}</div>
      {detalle && <div className="mt-0.5 text-xs text-muted">{detalle}</div>}
    </Card>
  );
}
