import { escalon, type Mapa } from "@/lib/analytics/calcular";
import { Tooltip, VIZ } from "./comun";

/**
 * Cuándo se llena el salón: filas = días, columnas = horas, color = citas que empiezan ahí, en una
 * rampa de un solo tono (más oscuro = más citas). Las celdas vacías van en un rosa casi blanco,
 * fuera de la rampa, para que «nada» no se confunda con «poco». Celdas separadas por 2 px de aire.
 */
const DIAS = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const DIAS_LARGO = ["", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

export default function MapaCalor({ mapa }: { mapa: Mapa }) {
  if (mapa.dias.length === 0) return <p className="text-sm text-gris">Sin horario ni citas en este periodo.</p>;
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-[2px] text-[11px]">
          <thead>
            <tr>
              <th />
              {mapa.horas.map((h) => (
                <th key={h} scope="col" className="w-8 min-w-8 text-center font-normal tabular-nums text-gris">
                  {h}h
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mapa.dias.map((d, di) => (
              <tr key={d}>
                <th scope="row" className="pr-2 text-right font-normal text-gris">
                  {DIAS[d]}
                </th>
                {mapa.horas.map((h, hi) => {
                  const n = mapa.celdas[di]?.[hi] ?? 0;
                  const paso = escalon(n, mapa.maximo);
                  const texto = `${n} ${n === 1 ? "cita" : "citas"}`;
                  const etiqueta = `${DIAS_LARGO[d]} de ${h}:00 a ${h + 1}:00`;
                  return (
                    <td key={h} className="p-0">
                      <span
                        role="img"
                        tabIndex={0}
                        aria-label={`${etiqueta}: ${texto}`}
                        className="group relative block h-8 w-8 rounded-[4px] outline-none ring-carmin focus-visible:ring-2"
                        style={{ background: paso < 0 ? VIZ.vacio : VIZ.rampa[paso] }}
                      >
                        <Tooltip valor={texto} etiqueta={etiqueta} />
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gris" aria-hidden>
        <span className="inline-flex items-center gap-1">
          <span className="size-3 rounded-[3px]" style={{ background: VIZ.vacio }} /> sin citas
        </span>
        <span className="ml-2">menos</span>
        {VIZ.rampa.map((c) => (
          <span key={c} className="size-3 rounded-[3px]" style={{ background: c }} />
        ))}
        <span>más (máx. {mapa.maximo})</span>
      </div>
    </div>
  );
}
