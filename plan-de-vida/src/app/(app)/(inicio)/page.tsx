import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  ListChecks,
  PiggyBank,
  Sparkles,
  Landmark,
  Sun,
  Target,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { IndicadorEnlace } from "@/components/layout/IndicadorEnlace";
import ShaderBackground from "@/components/ui/shader-background";
import { Progreso } from "@/components/ui/basicos";
import { getAjustes, getCategorias, getCuentas, getDiario, getHabitos, getLogs, getMetas, getMovimientos, getRecurrentes, getTareas } from "@/lib/datos/consultas";
import { fechaLarga, hoy as hoyMadrid, mesDe, rangoMes, sumarDias } from "@/lib/fechas";
import { patrimonioNeto } from "@/lib/finanzas";
import { euros } from "@/lib/formato";
import { cumplido, indexar, rachaActual, toca } from "@/lib/habitos/metricas";
import { aplicarAuto } from "@/lib/metas/auto";
import { nombreCoach } from "@/lib/marca";
import { getSesion } from "@/lib/sesion";
import { n } from "@/lib/tipos";

export const metadata: Metadata = { title: "Inicio" };

function saludo(): string {
  const h = Number(new Intl.DateTimeFormat("es-ES", { hour: "numeric", hour12: false, timeZone: "Europe/Madrid" }).format(new Date()));
  return h < 6 ? "Buenas noches" : h < 14 ? "Buenos días" : h < 21 ? "Buenas tardes" : "Buenas noches";
}

interface Apartado {
  href: string;
  titulo: string;
  icono: LucideIcon;
  color: string;
  resumen: string;
  detalle?: string;
  progreso?: number;
}

/**
 * Inicio: un panel para elegir a dónde ir. Cada tarjeta es un apartado con su dato más útil del día,
 * para saber de un vistazo qué necesita atención. El coach tiene su propia página.
 */
export default async function InicioPage() {
  const hoy = hoyMadrid();
  const s = await getSesion();
  const mes = rangoMes(mesDe(hoy));
  const [ajustes, habitos, logs, movimientos, categorias, todasMetas, tareas, diario, { data: rec }, cuentas, recurrentes] = await Promise.all([
    getAjustes(s),
    getHabitos(s),
    getLogs(s, sumarDias(hoy, -400), hoy),
    getMovimientos(s, mes.desde, mes.hasta),
    getCategorias(s),
    getMetas(s, Number(hoy.slice(0, 4))),
    getTareas(s, { pendientes: true, hasta: hoy }),
    getDiario(s, hoy, hoy),
    s.db.from("recommendations").select("action, symbol").eq("user_id", s.userId).order("day", { ascending: false }).order("confidence", { ascending: false }).limit(1).maybeSingle(),
    getCuentas(s),
    getRecurrentes(s),
  ]);
  const { metas, estados } = aplicarAuto(todasMetas, movimientos, recurrentes, mesDe(hoy));
  const metaIngresos = metas.find((m) => m.auto === "ingreso_mensual" && m.status === "activa");
  const ingresoMeta = metaIngresos ? estados.get(metaIngresos.id) : undefined;
  const proximosFijos = recurrentes.filter((r) => r.active && r.next_date >= hoy && r.next_date <= sumarDias(hoy, 7)).length;
  const activasCuentas = cuentas.filter((c) => c.active);
  const disponible = activasCuentas.filter((c) => c.kind === "liquidez").reduce((a, c) => a + n(c.balance), 0);
  const neto = patrimonioNeto(activasCuentas);

  const porHabito = indexar(logs);
  const deHoy = habitos.filter((h) => toca(h, hoy) && !h.weekly_target);
  const hechos = deHoy.filter((h) => cumplido(h, porHabito.get(h.id)?.get(hoy))).length;
  const mejorRacha = Math.max(0, ...habitos.map((h) => rachaActual(h, porHabito.get(h.id) ?? new Map(), hoy)));
  const gastado = movimientos.filter((m) => m.kind === "gasto").reduce((a, m) => a + n(m.amount), 0);
  const presupuesto = categorias.filter((c) => c.kind === "gasto").reduce((a, c) => a + n(c.monthly_budget), 0);
  const activas = metas.filter((m) => m.status === "activa" || m.status === "hecha");
  const avance = activas.length ? activas.reduce((a, m) => a + n(m.progress_pct), 0) / activas.length : 0;

  const apartados: Apartado[] = [
    {
      href: "/hoy",
      titulo: "Hoy",
      icono: Sun,
      color: "yellow",
      resumen: deHoy.length ? `${hechos} de ${deHoy.length} hábitos hechos` : "Empieza tu día",
      detalle: tareas.length ? `${tareas.length} ${tareas.length === 1 ? "tarea pendiente" : "tareas pendientes"}` : "Sin tareas pendientes",
      progreso: deHoy.length ? (100 * hechos) / deHoy.length : undefined,
    },
    {
      href: "/calendario",
      titulo: "Calendario",
      icono: CalendarDays,
      color: "blue",
      resumen: proximosFijos ? `${proximosFijos} ${proximosFijos === 1 ? "pago o cobro" : "pagos y cobros"} esta semana` : "Lo que toca cada día",
      detalle: "Tareas, pagos, fechas límite y revisiones",
    },
    {
      href: "/habitos",
      titulo: "Hábitos",
      icono: ListChecks,
      color: "green",
      resumen: habitos.length ? `${habitos.length} hábitos activos` : "Crea tu primera rutina",
      detalle: mejorRacha > 1 ? `Mejor racha: ${mejorRacha} días` : "Marca cada día y crea racha",
    },
    {
      href: "/metas",
      titulo: "Metas",
      icono: Target,
      color: "purple",
      resumen: activas.length ? `${activas.length} metas este año` : "Define tus metas del año",
      detalle: activas.length ? `${Math.round(avance)} % de avance medio` : "Visión por áreas de vida",
      progreso: activas.length ? avance : undefined,
    },
    {
      href: "/finanzas",
      titulo: "Finanzas",
      icono: Wallet,
      color: "blue",
      resumen:
        metaIngresos && ingresoMeta
          ? `${euros(ingresoMeta.valor, false)} de ${euros(n(metaIngresos.target_value), false)} este mes`
          : `${euros(gastado, false)} gastados este mes`,
      detalle:
        metaIngresos && ingresoMeta
          ? `${euros(gastado, false)} gastados este mes`
          : presupuesto
            ? `de ${euros(presupuesto, false)} de presupuesto`
            : "Movimientos, fijos y presupuesto",
      progreso: metaIngresos && ingresoMeta ? n(metaIngresos.progress_pct) : presupuesto ? (100 * gastado) / presupuesto : undefined,
    },
    {
      href: "/finanzas/patrimonio",
      titulo: "Tu dinero",
      icono: Landmark,
      color: "blue",
      resumen: activasCuentas.length ? `${euros(disponible)} disponibles` : "Apunta tus cuentas",
      detalle: activasCuentas.length ? `Patrimonio total: ${euros(neto)}` : "Efectivo, banco, inversiones y deudas",
    },
    {
      href: "/finanzas/inversion",
      titulo: "Inversión",
      icono: TrendingUp,
      color: "orange",
      resumen: rec ? `Última: ${rec.action} ${rec.symbol}` : "Informe cada día laborable",
      detalle: "Recomendaciones que aprenden",
    },
    {
      href: "/finanzas/huchas",
      titulo: "Huchas",
      icono: PiggyBank,
      color: "pink",
      resumen: "Metas de ahorro",
      detalle: "Cuánto llevas y a qué ritmo",
    },
    {
      href: "/diario",
      titulo: "Diario",
      icono: BookOpen,
      color: "gray",
      resumen: diario[0] ? "Ya has escrito hoy" : "Aún no has escrito hoy",
      detalle: "Ánimo, energía y gratitud",
    },
    {
      href: "/revisiones",
      titulo: "Revisiones",
      icono: ClipboardCheck,
      color: "red",
      resumen: "Semanal y mensual",
      detalle: "Números y siguientes pasos",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-4 pb-32 sm:px-8 md:pt-6 md:pb-16">
      {/* Cabecera con el fondo animado */}
      <section className="entrar relative isolate mb-6 overflow-hidden rounded-3xl shadow-xl">
        <ShaderBackground className="-z-10" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div className="px-5 pt-10 pb-5 text-white sm:px-8 sm:pt-14">
          <p className="text-sm text-white/70">{fechaLarga(hoy)}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight drop-shadow sm:text-4xl">
            {saludo()}, {ajustes.display_name}
          </h1>
          <p className="mt-1 text-white/75">¿A dónde quieres ir hoy?</p>
          <Link
            href="/coach"
            className="relative mt-5 flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 ring-1 ring-white/25 backdrop-blur-xl transition hover:bg-white/25 active:scale-[0.99]"
          >
            <Sparkles className="size-5 shrink-0" />
            <span className="flex-1 text-sm text-white/90">Habla con {nombreCoach(ajustes)}: ideas, dudas, apuntar o planificar…</span>
            <ChevronRight className="size-5 text-white/70" />
            <IndicadorEnlace />
          </Link>
        </div>
      </section>

      {/* Apartados */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {apartados.map((a, i) => (
          <Link
            key={a.href}
            href={a.href}
            style={{ ["--i" as string]: i + 1 }}
            className="glass entrar group relative flex flex-col rounded-2xl p-3.5 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] sm:p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl" style={{ background: `var(--tag-${a.color}-bg)`, color: `var(--tag-${a.color}-fg)` }}>
                <a.icono className="size-5" />
              </span>
              <ChevronRight className="size-5 text-faint transition group-hover:translate-x-0.5 group-hover:text-fg" />
            </div>
            <h2 className="font-semibold">{a.titulo}</h2>
            <p className="mt-0.5 text-[13px] leading-snug sm:text-sm">{a.resumen}</p>
            {a.detalle && <p className="mt-0.5 hidden text-xs text-muted sm:block">{a.detalle}</p>}
            {a.progreso != null && <Progreso valor={a.progreso} className="mt-3" color={a.progreso > 100 ? "var(--bad)" : `var(--tag-${a.color}-fg)`} />}
            <IndicadorEnlace />
          </Link>
        ))}
      </div>
    </div>
  );
}
