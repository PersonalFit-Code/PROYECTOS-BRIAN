import { ejeLimpio, Tooltip, VIZ } from "./comun";

/**
 * Columnas de una sola serie (facturado por día o por semana). Barras de ≤ 24 px con la punta
 * redondeada y la base recta, 2 px de aire entre ellas, rejilla de un pelo y solo el máximo
 * etiquetado sobre su barra: el resto está en el eje, en el tooltip y en la tabla.
 */
export interface Columna {
  clave: string;
  /** texto corto bajo la barra ("19") */
  corta: string;
  /** para el tooltip ("lunes 19 de octubre") */
  larga: string;
  valor: number;
  /** valor formateado ("125 €") */
  texto: string;
}

const ALTO = 180;

export default function Columnas({ columnas, formatoEje }: { columnas: Columna[]; formatoEje: (v: number) => string }) {
  const maximo = Math.max(0, ...columnas.map((c) => c.valor));
  const marcas = ejeLimpio(maximo);
  const tope = marcas[marcas.length - 1] || 1;
  const iMax = columnas.findIndex((c) => c.valor === maximo && maximo > 0);
  // Con muchas columnas, solo una etiqueta del eje X de cada N para que no se pisen.
  const cadaN = Math.max(1, Math.ceil(columnas.length / 10));

  return (
    <div className="flex gap-2">
      <div className="relative w-10 shrink-0 text-right text-[11px] tabular-nums text-gris" style={{ height: ALTO }} aria-hidden>
        {marcas.map((m) => (
          <span key={m} className="absolute right-0 -translate-y-1/2" style={{ top: ALTO - (m / tope) * ALTO }}>
            {formatoEje(m)}
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1 overflow-x-auto">
        <div className="relative" style={{ height: ALTO, minWidth: columnas.length * 14 }}>
          {marcas.map((m) => (
            <div key={m} aria-hidden className="absolute inset-x-0 h-px" style={{ top: ALTO - (m / tope) * ALTO, background: VIZ.rejilla }} />
          ))}
          <ul className="absolute inset-0 flex items-end gap-[2px]" aria-label="Facturado por periodo">
            {columnas.map((c, i) => {
              const h = Math.max(0, (Math.max(0, c.valor) / tope) * ALTO);
              return (
                <li key={c.clave} className="flex h-full flex-1 justify-center">
                  <span tabIndex={0} className="group relative flex h-full w-full max-w-6 flex-col items-center justify-end outline-none" aria-label={`${c.larga}: ${c.texto}`}>
                    {i === iMax && <span className="mb-1 whitespace-nowrap text-[11px] font-semibold tabular-nums text-tinta">{c.texto}</span>}
                    <span
                      className="w-full rounded-t-[4px] transition-opacity group-hover:opacity-80 group-focus-visible:opacity-80"
                      style={{ height: h, background: VIZ.acento, minHeight: c.valor > 0 ? 2 : 0 }}
                    />
                    <Tooltip valor={c.texto} etiqueta={c.larga} />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="mt-1 flex gap-[2px] text-[11px] text-gris" aria-hidden style={{ minWidth: columnas.length * 14 }}>
          {columnas.map((c, i) => (
            <span key={c.clave} className="flex-1 text-center tabular-nums">
              {i % cadaN === 0 ? c.corta : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
