import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { Cuadricula, type FilaCuadricula } from "@/components/habitos/Cuadricula";
import { FormHabito } from "@/components/habitos/FormHabito";
import { GestionHabito } from "@/components/habitos/GestionHabito";
import { Pagina } from "@/components/layout/Pagina";
import { Card, Seccion, Titulo, Vacio } from "@/components/ui/basicos";
import { getAreas, getHabitos, getLogs } from "@/lib/datos/consultas";
import { diasDelRango, hoy as hoyMadrid, lunesDe, mesAnterior, mesDe, nombreMes, rangoMes, sumarDias, sumarMeses } from "@/lib/fechas";
import { cx } from "@/lib/formato";
import { cumplido, indexar, rachaActual, toca } from "@/lib/habitos/metricas";
import { getSesion } from "@/lib/sesion";
import { crearHabito } from "./acciones";

export const metadata: Metadata = { title: "Hábitos" };

export default async function HabitosPage({ searchParams }: { searchParams: Promise<{ vista?: string; mes?: string }> }) {
  const sp = await searchParams;
  const vista = sp.vista === "semana" ? "semana" : "mes";
  const hoy = hoyMadrid();
  const mes = /^\d{4}-\d{2}$/.test(sp.mes ?? "") ? sp.mes! : mesDe(hoy);
  const { desde, hasta } = vista === "semana" ? { desde: lunesDe(hoy), hasta: sumarDias(lunesDe(hoy), 6) } : rangoMes(mes);

  const sesion = await getSesion();
  const [habitos, todos, areas] = await Promise.all([getHabitos(sesion), getHabitos(sesion, false), getAreas(sesion)]);
  // Para las rachas hace falta mirar atrás; un año da de sobra.
  const logs = await getLogs(sesion, sumarDias(hoy, -400) < desde ? sumarDias(hoy, -400) : desde, hasta > hoy ? hasta : hoy);
  const porHabito = indexar(logs);
  const dias = diasDelRango(desde, hasta);

  const filas: FilaCuadricula[] = habitos.map((h) => {
    const l = porHabito.get(h.id) ?? new Map();
    const tocaDias = dias.filter((d) => toca(h, d));
    const hechos = dias.filter((d) => cumplido(h, l.get(d)));
    const pasados = tocaDias.filter((d) => d <= hoy);
    const esperados = h.weekly_target ? Math.max(1, Math.round((pasados.length * h.weekly_target) / 7)) : pasados.length;
    return {
      id: h.id,
      name: h.name,
      emoji: h.emoji,
      kind: h.kind,
      tocaDias,
      hechos,
      pct: esperados ? Math.min(100, (100 * hechos.filter((d) => d <= hoy).length) / esperados) : 0,
    };
  });

  const mesPrevio = mesAnterior(mes);
  const mesSiguiente = mesDe(sumarMeses(`${mes}-01`, 1));

  return (
    <Pagina ancha>
      <Titulo emoji="✅" sub="Marca cada día lo que cumples. A fin de mes verás qué se te da mejor y dónde fallas.">
        Hábitos y rutinas
      </Titulo>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border border-line p-0.5 text-sm">
          {(["semana", "mes"] as const).map((v) => (
            <Link key={v} href={`/habitos?vista=${v}`} className={cx("rounded px-3 py-1", vista === v ? "bg-hover font-medium" : "text-muted")}>
              {v === "semana" ? "Semana" : "Mes"}
            </Link>
          ))}
        </div>
        {vista === "mes" && (
          <div className="flex items-center gap-1 text-sm">
            <Link aria-label="Mes anterior" href={`/habitos?mes=${mesPrevio}`} className="rounded p-1 hover:bg-hover">
              <ChevronLeft className="size-4" />
            </Link>
            <span className="min-w-28 text-center font-medium capitalize">{nombreMes(mes)}</span>
            <Link aria-label="Mes siguiente" href={`/habitos?mes=${mesSiguiente}`} className="rounded p-1 hover:bg-hover">
              <ChevronRight className="size-4" />
            </Link>
          </div>
        )}
        <Link href={`/habitos/informe?mes=${vista === "mes" ? mes : mesDe(hoy)}`} className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm hover:bg-hover">
          <BarChart3 className="size-4" /> Informe del mes
        </Link>
      </div>

      <Card className="mb-8">{filas.length ? <Cuadricula filas={filas} dias={dias} hoy={hoy} /> : <Vacio>Crea tu primer hábito aquí abajo.</Vacio>}</Card>

      <Seccion titulo="Nuevo hábito">
        <FormHabito accion={crearHabito} areas={areas} />
      </Seccion>

      <Seccion titulo="Tus hábitos">
        {todos.length ? (
          <ul>
            {todos.map((h) => (
              <GestionHabito key={h.id} habito={h} areas={areas} racha={h.active ? rachaActual(h, porHabito.get(h.id) ?? new Map(), hoy) : 0} />
            ))}
          </ul>
        ) : (
          <Vacio>Ninguno todavía.</Vacio>
        )}
      </Seccion>
    </Pagina>
  );
}
