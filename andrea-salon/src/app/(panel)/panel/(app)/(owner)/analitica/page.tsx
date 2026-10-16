import { Download } from "lucide-react";
import Link from "next/link";
import BarrasH from "@/components/panel/graficas/BarrasH";
import Columnas from "@/components/panel/graficas/Columnas";
import { TablaSimple, Tarjeta } from "@/components/panel/graficas/comun";
import Kpi from "@/components/panel/graficas/Kpi";
import MapaCalor from "@/components/panel/graficas/MapaCalor";
import { kpis, mapaCalor, periodoAnterior, porMetodo, porProfesional, serieFacturado, topServicios, variacion, type Periodo } from "@/lib/analytics/calcular";
import { cargarEntrada } from "@/lib/analytics/cargar";
import { descomponerFechaLocal, desplazarFechaLocal, diaSemanaIso } from "@/lib/booking";
import { formatCents } from "@/lib/format";
import { hoyLocal } from "@/lib/panel/columnas";
import { requireOwner } from "@/lib/panel/sesion";
import { cn } from "@/lib/utils";

/**
 * Analítica (solo la dueña). Un filtro de periodo arriba que manda sobre todo lo de abajo; cifras
 * de cabecera con su variación frente al periodo anterior de la misma longitud; y las gráficas,
 * cada una con su tabla. Las cuentas están en `lib/analytics/calcular.ts` (con tests).
 *
 * Es registro de gestión: no sustituye a la contabilidad ni a las facturas de la gestoría.
 */
export const dynamic = "force-dynamic";
export const metadata = { title: "Analítica" };

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS = ["", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const METODO: Record<string, string> = { card: "Tarjeta", cash: "Efectivo", bizum: "Bizum", voucher: "Con bono", stripe: "Online (Stripe)" };

const PRESETS = [
  { clave: "7", texto: "7 días" },
  { clave: "30", texto: "30 días" },
  { clave: "90", texto: "90 días" },
  { clave: "mes", texto: "Este mes" },
  { clave: "mes-anterior", texto: "Mes anterior" },
] as const;

function periodoDe(clave: string | undefined, hoy: string): { periodo: Periodo; nombre: string } {
  const { anio, mes } = descomponerFechaLocal(hoy);
  if (clave === "mes" || clave === "mes-anterior") {
    const m = clave === "mes" ? mes : mes === 1 ? 12 : mes - 1;
    const a = clave === "mes" || mes !== 1 ? anio : anio - 1;
    const desde = `${a}-${String(m).padStart(2, "0")}-01`;
    const dias = new Date(Date.UTC(a, m, 0)).getUTCDate();
    // «Este mes» llega hasta hoy: los días que faltan no son ceros, todavía no han pasado.
    const hasta = clave === "mes" ? Number(hoy.slice(8)) : dias;
    return { periodo: { desde, dias: hasta }, nombre: `${MESES[m - 1]} ${a}` };
  }
  const n = clave === "7" ? 7 : clave === "90" ? 90 : 30;
  return { periodo: { desde: desplazarFechaLocal(hoy, 1 - n), dias: n }, nombre: `últimos ${n} días` };
}

const pct = (v: number | null) => (v === null ? "—" : `${Math.round(v * 100)} %`);
const fechaCorta = (f: string) => `${Number(f.slice(8))} ${MESES[Number(f.slice(5, 7)) - 1]?.slice(0, 3)}`;

export default async function AnaliticaPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireOwner();
  const { periodo: clave } = await searchParams;
  const hoy = hoyLocal();
  const { periodo, nombre } = periodoDe(clave, hoy);
  const actualClave = PRESETS.some((p) => p.clave === clave) ? clave : "30";

  let datos;
  try {
    const [actual, anterior] = await Promise.all([cargarEntrada(periodo), cargarEntrada(periodoAnterior(periodo))]);
    datos = { actual, anterior };
  } catch (e) {
    console.error("[analitica]", e);
    return <p className="rounded-3xl bg-white p-6 text-carmin">No se pudo cargar la analítica. Prueba otra vez en un momento.</p>;
  }
  const { actual, anterior } = datos;
  const k = kpis(actual);
  const kAnt = kpis(anterior);
  const serie = serieFacturado(actual);
  const profesionales = porProfesional(actual);
  const servicios = topServicios(actual);
  const metodos = porMetodo(actual);
  const mapa = mapaCalor(actual);

  const columnas = serie.puntos.map((p) => ({
    clave: p.fecha,
    corta: serie.agrupado === "dia" ? String(Number(p.fecha.slice(8))) : fechaCorta(p.fecha),
    larga: serie.agrupado === "dia" ? `${DIAS[diaSemanaIso(p.fecha)]} ${fechaCorta(p.fecha)}` : `semana del ${fechaCorta(p.fecha)}`,
    valor: p.cents,
    texto: formatCents(p.cents),
  }));
  const totalMetodos = metodos.reduce((t, m) => t + m.cents, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Analítica</h1>
          <p className="text-sm text-gris">
            {nombre} · registro de gestión del salón, no contabilidad oficial
          </p>
        </div>
        <Link
          href={`/api/panel/exportar?tipo=cobros&desde=${periodo.desde}&dias=${periodo.dias}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-carmin ring-1 ring-carmin/20"
          prefetch={false}
        >
          <Download aria-hidden className="size-4" /> Exportar cobros (CSV)
        </Link>
      </div>

      {/* Un solo filtro, arriba, que manda sobre todo lo de abajo. */}
      <nav aria-label="Periodo" className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Link
            key={p.clave}
            href={`/panel/analitica?periodo=${p.clave}`}
            aria-current={actualClave === p.clave ? "page" : undefined}
            className={cn("min-h-11 rounded-full px-4 py-2.5 text-sm font-semibold ring-1", actualClave === p.clave ? "bg-tinta text-white ring-tinta" : "bg-white ring-carmin/15")}
          >
            {p.texto}
          </Link>
        ))}
      </nav>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi etiqueta="Facturado" valor={formatCents(k.facturadoCents)} variacion={variacion(k.facturadoCents, kAnt.facturadoCents)} detalle={k.propinasCents ? `+ ${formatCents(k.propinasCents)} de propinas` : undefined} />
        <Kpi etiqueta="Citas hechas" valor={String(k.citasHechas)} variacion={variacion(k.citasHechas, kAnt.citasHechas)} />
        <Kpi etiqueta="Ticket medio" valor={formatCents(k.ticketMedioCents)} variacion={variacion(k.ticketMedioCents, kAnt.ticketMedioCents)} />
        <Kpi etiqueta="Ocupación" valor={pct(k.ocupacion)} variacion={k.ocupacion !== null && kAnt.ocupacion !== null ? variacion(k.ocupacion, kAnt.ocupacion) : null} />
        <Kpi etiqueta="Faltas" valor={pct(k.tasaFaltas)} variacion={k.tasaFaltas !== null && kAnt.tasaFaltas !== null ? variacion(k.tasaFaltas, kAnt.tasaFaltas) : null} subeEsBueno={false} detalle={`${k.faltas} sin avisar · ${k.canceladas} canceladas`} />
        <Kpi etiqueta="Bonos vendidos" valor={formatCents(k.ventaBonosCents)} variacion={variacion(k.ventaBonosCents, kAnt.ventaBonosCents)} detalle={k.cobradoConBonoCents ? `${formatCents(k.cobradoConBonoCents)} canjeados en citas` : undefined} />
      </dl>

      <Tarjeta
        titulo="Facturado"
        subtitulo={serie.agrupado === "dia" ? "Por día. Pasa el dedo o el ratón por una barra para ver el importe." : "Por semana (lunes a domingo)."}
        tabla={<TablaSimple cabeceras={[serie.agrupado === "dia" ? "Día" : "Semana", "Facturado"]} filas={columnas.map((c) => [c.larga, c.texto])} />}
      >
        <Columnas columnas={columnas} formatoEje={(v) => (v >= 100000 ? `${Math.round(v / 100000)}K` : `${Math.round(v / 100)}`)} />
      </Tarjeta>

      <div className="grid gap-5 lg:grid-cols-2">
        <Tarjeta
          titulo="Por profesional"
          subtitulo="Facturado por sus citas. Solo lo ves tú."
          tabla={
            <TablaSimple
              cabeceras={["Profesional", "Facturado", "Propinas", "Citas", "Faltas", "Ocupación"]}
              filas={profesionales.map((p) => [p.nombre, formatCents(p.facturadoCents), formatCents(p.propinasCents), p.citas, p.faltas, pct(p.ocupacion)])}
            />
          }
        >
          <BarrasH
            barras={profesionales.map((p) => ({
              clave: p.staffId,
              etiqueta: p.nombre,
              valor: p.facturadoCents,
              texto: formatCents(p.facturadoCents),
              detalle: `${p.citas} citas · ocupación ${pct(p.ocupacion)}`,
            }))}
          />
        </Tarjeta>

        <Tarjeta
          titulo="Servicios más pedidos"
          subtitulo="Veces que se hicieron en el periodo."
          tabla={
            <TablaSimple
              cabeceras={["Servicio", "Veces", "Importe"]}
              filas={[...servicios.filas, ...(servicios.resto ? [servicios.resto] : [])].map((s) => [s.nombre, s.veces, formatCents(s.cents)])}
            />
          }
        >
          <BarrasH
            barras={[...servicios.filas, ...(servicios.resto ? [servicios.resto] : [])].map((s) => ({
              clave: s.nombre,
              etiqueta: s.nombre,
              valor: s.veces,
              texto: String(s.veces),
              detalle: formatCents(s.cents),
            }))}
          />
        </Tarjeta>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Tarjeta
          titulo="Cuándo se llena el salón"
          subtitulo="Citas por día de la semana y hora de comienzo. Útil para decidir horarios y promociones."
          tabla={
            <TablaSimple
              cabeceras={["Día", ...mapa.horas.map((h) => `${h}h`)]}
              filas={mapa.dias.map((d, di) => [DIAS[d] ?? "", ...(mapa.celdas[di] ?? [])])}
            />
          }
        >
          <MapaCalor mapa={mapa} />
        </Tarjeta>

        <Tarjeta
          titulo="Cómo se cobra"
          subtitulo="Citas y venta de bonos, sin devoluciones."
          tabla={
            <TablaSimple
              cabeceras={["Método", "Importe", "Cobros", "%"]}
              filas={metodos.map((m) => [METODO[m.metodo] ?? m.metodo, formatCents(m.cents), m.cobros, totalMetodos ? `${Math.round((m.cents / totalMetodos) * 100)} %` : "—"])}
            />
          }
        >
          <BarrasH
            barras={metodos.map((m) => ({
              clave: m.metodo,
              etiqueta: METODO[m.metodo] ?? m.metodo,
              valor: m.cents,
              texto: formatCents(m.cents),
              detalle: `${m.cobros} cobros · ${totalMetodos ? Math.round((m.cents / totalMetodos) * 100) : 0} %`,
            }))}
          />
        </Tarjeta>
      </div>
    </div>
  );
}
