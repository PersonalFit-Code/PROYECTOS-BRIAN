import type { ReactNode } from "react";

/**
 * Piezas comunes de las gráficas del panel. Reglas de la casa (skill `dataviz`):
 * - Marcas en `--viz-acento` (#B8365A, carmín suave): el carmín de marca (#8E0E33) es demasiado
 *   oscuro para una barra —se lee como negro— y el validador lo saca de la banda de luminosidad.
 * - El texto nunca va en el color de la serie: valores y etiquetas en tinta/gris.
 * - Cada gráfica tiene su tabla («Ver como tabla»): el tooltip ayuda, nunca es el único camino.
 * - Tooltips solo con CSS (hover y foco de teclado): son componentes de servidor, sin JS.
 */
export const VIZ = {
  acento: "#b8365a",
  /** Rampa de 5 pasos para el mapa de calor (validada como ordinal sobre blanco). */
  rampa: ["#dd8ea9", "#c9587c", "#b8365a", "#8e0e33", "#5e0822"],
  vacio: "#f6eef1",
  rejilla: "#efe6ea",
} as const;

export function Tarjeta({ titulo, subtitulo, children, tabla }: { titulo: string; subtitulo?: string; children: ReactNode; tabla?: ReactNode }) {
  return (
    <section className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5">
      <h2 className="font-display text-xl font-semibold text-tinta">{titulo}</h2>
      {subtitulo && <p className="mt-0.5 text-sm text-gris">{subtitulo}</p>}
      <div className="mt-4">{children}</div>
      {tabla && (
        <details className="mt-4 text-sm">
          <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-carmin">Ver como tabla</summary>
          <div className="mt-2 overflow-x-auto">{tabla}</div>
        </details>
      )}
    </section>
  );
}

/**
 * Tooltip de una marca: valor delante y fuerte, etiqueta detrás (el lector ya sabe la serie).
 * La marca que lo contiene es `role="img"` con su `aria-label`: el lector de pantalla lee esa
 * etiqueta y no el tooltip (los hijos de un `img` no se leen), así que no se dice dos veces.
 */
export function Tooltip({ valor, etiqueta, lado = "arriba" }: { valor: string; etiqueta: string; lado?: "arriba" | "derecha" }) {
  return (
    <span
      role="tooltip"
      className={
        "pointer-events-none absolute z-20 hidden whitespace-nowrap rounded-xl bg-tinta px-3 py-2 text-left text-white shadow-lg group-hover:block group-focus-visible:block " +
        (lado === "arriba" ? "bottom-full left-1/2 mb-2 -translate-x-1/2" : "left-full top-1/2 ml-2 -translate-y-1/2")
      }
    >
      <span className="block text-sm font-semibold tabular-nums">{valor}</span>
      <span className="block text-xs text-white/75">{etiqueta}</span>
    </span>
  );
}

export function TablaSimple({ cabeceras, filas }: { cabeceras: string[]; filas: (string | number)[][] }) {
  return (
    <table className="w-full min-w-[320px] border-collapse text-left">
      <thead>
        <tr>
          {cabeceras.map((c, i) => (
            <th key={c} className={"border-b border-[var(--capa-borde)] py-2 pr-3 text-xs font-semibold uppercase tracking-[0.1em] text-gris " + (i > 0 ? "text-right" : "")}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filas.map((f, i) => (
          <tr key={i} className="border-b border-[var(--capa-borde)] last:border-0">
            {f.map((v, j) => (
              <td key={j} className={"py-2 pr-3 " + (j > 0 ? "text-right tabular-nums" : "")}>
                {v}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Máximo "redondo" del eje (1, 2, 2,5 o 5 × 10ⁿ) y sus marcas. */
export function ejeLimpio(maximo: number, marcas = 4): number[] {
  if (maximo <= 0) return [0];
  const bruto = maximo / marcas;
  const pot = 10 ** Math.floor(Math.log10(bruto));
  const paso = [1, 2, 2.5, 5, 10].map((m) => m * pot).find((p) => p >= bruto) ?? 10 * pot;
  const tope = Math.ceil(maximo / paso) * paso;
  return Array.from({ length: Math.round(tope / paso) + 1 }, (_, i) => i * paso);
}
