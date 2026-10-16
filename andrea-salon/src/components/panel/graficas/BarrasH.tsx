import { Tooltip, VIZ } from "./comun";

/**
 * Barras horizontales de una serie (servicios, profesionales, métodos de cobro): la etiqueta a la
 * izquierda, la barra de ≤ 24 px y el valor en la punta, en tinta. Horizontales porque los nombres
 * de servicio son largos y en el móvil no caben bajo una columna.
 */
export interface Barra {
  clave: string;
  etiqueta: string;
  valor: number;
  texto: string;
  /** segunda línea del tooltip ("12 citas") */
  detalle?: string;
}

export default function BarrasH({ barras }: { barras: Barra[] }) {
  const maximo = Math.max(1, ...barras.map((b) => b.valor));
  if (barras.length === 0) return <p className="text-sm text-gris">Sin datos en este periodo.</p>;
  return (
    <ul className="space-y-2.5">
      {barras.map((b) => (
        <li key={b.clave} className="grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-3 sm:grid-cols-[minmax(0,12rem)_1fr]">
          <span className="truncate text-sm text-tinta" title={b.etiqueta}>
            {b.etiqueta}
          </span>
          <span role="img" tabIndex={0} className="group relative flex min-h-6 items-center gap-2 outline-none" aria-label={`${b.etiqueta}: ${b.texto}${b.detalle ? `, ${b.detalle}` : ""}`}>
            <span
              className="h-5 rounded-r-[4px] transition-opacity group-hover:opacity-80 group-focus-visible:opacity-80"
              style={{ width: `${Math.max(0.5, (Math.max(0, b.valor) / maximo) * 78)}%`, background: VIZ.acento }}
            />
            <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-tinta">{b.texto}</span>
            <Tooltip valor={b.texto} etiqueta={b.detalle ? `${b.etiqueta} · ${b.detalle}` : b.etiqueta} />
          </span>
        </li>
      ))}
    </ul>
  );
}
