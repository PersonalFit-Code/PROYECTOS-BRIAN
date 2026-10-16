import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

/**
 * Cifra de cabecera: etiqueta, valor y variación frente al periodo anterior. El color de la
 * variación es dirección × «subir es bueno» (más faltas es malo aunque suba), y siempre lleva
 * flecha y signo: nunca solo color.
 */
export default function Kpi({
  etiqueta,
  valor,
  variacion,
  subeEsBueno = true,
  detalle,
}: {
  etiqueta: string;
  valor: string;
  /** relativa: 0,12 = +12 %; null = sin base para comparar */
  variacion?: number | null;
  subeEsBueno?: boolean;
  detalle?: string;
}) {
  const v = variacion ?? null;
  const plano = v !== null && Math.abs(v) < 0.005;
  const bueno = v !== null && !plano && (v > 0) === subeEsBueno;
  const Icono = v === null || plano ? Minus : v > 0 ? ArrowUpRight : ArrowDownRight;
  const texto =
    v === null ? "sin datos del periodo anterior" : plano ? "igual que el periodo anterior" : `${v > 0 ? "+" : "−"}${Math.round(Math.abs(v) * 100)} % vs. periodo anterior`;
  return (
    // Va dentro de un <dl>: cada cifra es un grupo <div> con su <dt> y sus <dd>.
    <div className="rounded-3xl border border-[var(--capa-borde)] bg-white p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-gris">{etiqueta}</dt>
      <dd className="mt-1 font-sans text-2xl font-semibold text-tinta sm:text-3xl">{valor}</dd>
      {variacion !== undefined && (
        <dd className={"mt-1 flex items-center gap-1 text-xs font-semibold " + (v === null || plano ? "text-gris" : bueno ? "text-emerald-700" : "text-red-700")}>
          <Icono aria-hidden className="size-3.5" />
          {texto}
        </dd>
      )}
      {detalle && <dd className="mt-1 text-xs text-gris">{detalle}</dd>}
    </div>
  );
}
