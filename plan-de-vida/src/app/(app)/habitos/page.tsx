import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CalendarRange, ChartColumn, ChevronLeft, ChevronRight, ListChecks, Plus, Settings2 } from "lucide-react";
import { FormHabito } from "@/components/habitos/FormHabito";
import { GestionHabito } from "@/components/habitos/GestionHabito";
import { VistaHabitos, type FilaHabito } from "@/components/habitos/VistaHabitos";
import { Pagina } from "@/components/layout/Pagina";
import { Titulo, Vacio } from "@/components/ui/basicos";
import { Hoja } from "@/components/ui/Hoja";
import { Segmentado } from "@/components/ui/Segmentado";
import { getAreas, getHabitos, getLogs } from "@/lib/datos/consultas";
import { diasDelRango, fechaCorta, hoy as hoyMadrid, lunesDe, mesAnterior, mesDe, nombreMes, rangoMes, sumarDias, sumarMeses } from "@/lib/fechas";
import { cumplido, indexar, rachaActual, toca } from "@/lib/habitos/metricas";
import { getSesion } from "@/lib/sesion";
import { crearHabito } from "./acciones";

export const metadata: Metadata = { title: "Hábitos" };

type Vista = "semana" | "mes" | "gestionar";

export default async function HabitosPage({ searchParams }: { searchParams: Promise<{ vista?: string; mes?: string; semana?: string }> }) {
  const sp = await searchParams;
  const vista: Vista = sp.vista === "mes" || sp.vista === "gestionar" ? sp.vista : "semana";
  const hoy = hoyMadrid();
  const mes = /^\d{4}-\d{2}$/.test(sp.mes ?? "") ? sp.mes! : mesDe(hoy);
  const lunes = /^\d{4}-\d{2}-\d{2}$/.test(sp.semana ?? "") ? lunesDe(sp.semana!) : lunesDe(hoy);
  const { desde, hasta } = vista === "mes" ? rangoMes(mes) : { desde: lunes, hasta: sumarDias(lunes, 6) };

  const sesion = await getSesion();
  const [habitos, todos, areas] = await Promise.all([getHabitos(sesion), getHabitos(sesion, false), getAreas(sesion)]);
  const logs = await getLogs(sesion, sumarDias(hoy, -400) < desde ? sumarDias(hoy, -400) : desde, hasta > hoy ? hasta : hoy);
  const porHabito = indexar(logs);
  const dias = diasDelRango(desde, hasta);

  const filas: FilaHabito[] = habitos.map((h) => {
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

  const nuevo = (
    <Hoja titulo="Nuevo hábito" boton="Nuevo hábito" icono={<Plus />}>
      <FormHabito accion={crearHabito} areas={areas} />
    </Hoja>
  );

  return (
    <Pagina>
      <Titulo icono={<ListChecks />} color="green" sub="Marca cada día lo que cumples. A fin de mes verás qué se te da mejor." acciones={nuevo}>
        Hábitos
      </Titulo>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Segmentado
          valor={vista}
          opciones={[
            { valor: "semana", etiqueta: "Semana", icono: <CalendarDays />, href: "/habitos?vista=semana" },
            { valor: "mes", etiqueta: "Mes", icono: <CalendarRange />, href: "/habitos?vista=mes" },
            { valor: "gestionar", etiqueta: "Mis hábitos", icono: <Settings2 />, href: "/habitos?vista=gestionar" },
          ]}
        />
        <Link href={`/habitos/informe?mes=${vista === "mes" ? mes : mesDe(hoy)}`} className="glass inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm transition hover:bg-hover active:scale-[0.97]">
          <ChartColumn className="size-4" /> Informe del mes
        </Link>
      </div>

      {vista !== "gestionar" && (
        <div className="glass entrar mb-4 flex items-center justify-between rounded-2xl px-2 py-1.5 text-sm">
          <Link
            aria-label="Anterior"
            href={vista === "mes" ? `/habitos?vista=mes&mes=${mesAnterior(mes)}` : `/habitos?vista=semana&semana=${sumarDias(lunes, -7)}`}
            className="rounded-xl p-2 transition hover:bg-hover"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <span className="font-medium first-letter:uppercase">{vista === "mes" ? nombreMes(mes) : `Semana del ${fechaCorta(lunes)} al ${fechaCorta(sumarDias(lunes, 6))}`}</span>
          <Link
            aria-label="Siguiente"
            href={vista === "mes" ? `/habitos?vista=mes&mes=${mesDe(sumarMeses(`${mes}-01`, 1))}` : `/habitos?vista=semana&semana=${sumarDias(lunes, 7)}`}
            className="rounded-xl p-2 transition hover:bg-hover"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      )}

      {vista === "gestionar" ? (
        todos.length ? (
          <ul className="space-y-3">
            {todos.map((h, i) => (
              <GestionHabito key={h.id} habito={h} areas={areas} racha={h.active ? rachaActual(h, porHabito.get(h.id) ?? new Map(), hoy) : 0} i={i} />
            ))}
          </ul>
        ) : (
          <Vacio>Aún no tienes hábitos. Pulsa «Nuevo hábito» para crear el primero.</Vacio>
        )
      ) : filas.length ? (
        <VistaHabitos filas={filas} dias={dias} hoy={hoy} modo={vista} />
      ) : (
        <Vacio>Aún no tienes hábitos. Pulsa «Nuevo hábito» para crear el primero.</Vacio>
      )}
    </Pagina>
  );
}
