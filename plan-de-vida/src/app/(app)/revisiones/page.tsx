import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CalendarRange, ChevronLeft, ChevronRight, Compass, History, ListChecks, ListTodo, PenLine, Sparkles, TrendingDown, Trophy, Wallet } from "lucide-react";
import { Pagina } from "@/components/layout/Pagina";
import { FormRevision } from "@/components/revisiones/FormRevision";
import { Kpi, Titulo } from "@/components/ui/basicos";
import { Desplegable } from "@/components/ui/Desplegable";
import { Segmentado } from "@/components/ui/Segmentado";
import { fechaCorta, hoy, lunesDeSemanaIso, mesAnterior, mesDe, nombreMes, sumarDias } from "@/lib/fechas";
import { euros } from "@/lib/formato";
import { periodoDe, PREGUNTAS, resumenPeriodo, type TipoRevision } from "@/lib/revisiones";
import { getCoach } from "@/lib/coach/nombre";
import { getSesion } from "@/lib/sesion";
import type { Review } from "@/lib/tipos";

export const metadata: Metadata = { title: "Revisiones" };

export default async function RevisionesPage({ searchParams }: { searchParams: Promise<{ tipo?: string; de?: string }> }) {
  const sp = await searchParams;
  const tipo: TipoRevision = sp.tipo === "mensual" ? "mensual" : "semanal";
  const dia = hoy();
  // Por defecto: la semana en curso (domingo) o el mes anterior si estamos a primeros de mes.
  const referencia = /^\d{4}-\d{2}-\d{2}$/.test(sp.de ?? "") ? sp.de! : tipo === "mensual" && Number(dia.slice(8)) <= 7 ? `${mesAnterior(mesDe(dia))}-15` : dia;
  const periodo = periodoDe(tipo, referencia);

  const s = await getSesion();
  const [resumen, { data: actual }, { data: anteriores }] = await Promise.all([
    resumenPeriodo(s, periodo.desde, periodo.hasta < dia ? periodo.hasta : dia),
    s.db.from("reviews").select("*").eq("user_id", s.userId).eq("kind", tipo).eq("period", periodo.clave).maybeSingle(),
    s.db.from("reviews").select("id, kind, period, answers, created_at").eq("user_id", s.userId).order("period", { ascending: false }).limit(24),
  ]);
  const revision = actual as Review | null;
  const titulo = tipo === "semanal" ? `Semana del ${fechaCorta(periodo.desde)} al ${fechaCorta(periodo.hasta)}` : nombreMes(periodo.clave);
  const prev = tipo === "semanal" ? sumarDias(periodo.desde, -7) : `${mesAnterior(periodo.clave)}-15`;
  const next = tipo === "semanal" ? sumarDias(periodo.desde, 7) : `${mesDe(sumarDias(periodo.hasta, 1))}-15`;

  return (
    <Pagina>
      <Titulo
        icono={<Compass />}
        color="red"
        sub="Cada domingo y a fin de mes: mira los números, responde con honestidad y decide el siguiente paso."
        acciones={
          <Link
            href={`/coach?pregunta=${encodeURIComponent(tipo === "semanal" ? "Hagamos mi revisión semanal" : "Hagamos mi revisión mensual")}`}
            className="glass inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition hover:bg-hover active:scale-[0.97]"
          >
            <Sparkles className="size-4" /> Hacerla con {await getCoach()}
          </Link>
        }
      >
        Revisiones
      </Titulo>

      <Segmentado
        className="mb-4"
        valor={tipo}
        opciones={[
          { valor: "semanal", etiqueta: "Semanal", icono: <CalendarDays />, href: "/revisiones?tipo=semanal" },
          { valor: "mensual", etiqueta: "Mensual", icono: <CalendarRange />, href: "/revisiones?tipo=mensual" },
        ]}
      />

      <div className="glass entrar mb-4 flex items-center justify-between rounded-2xl px-2 py-1.5 text-sm">
        <Link aria-label="Anterior" href={`/revisiones?tipo=${tipo}&de=${prev}`} className="rounded-xl p-2 transition hover:bg-hover">
          <ChevronLeft className="size-4" />
        </Link>
        <span className="font-medium first-letter:uppercase">{titulo}</span>
        {periodo.hasta < dia ? (
          <Link aria-label="Siguiente" href={`/revisiones?tipo=${tipo}&de=${next}`} className="rounded-xl p-2 transition hover:bg-hover">
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span className="size-8" />
        )}
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <Kpi i={0} icono={<ListChecks />} etiqueta="Hábitos" valor={`${Math.round(resumen.habitosPct)} %`} detalle={`${resumen.diasPerfectos} días perfectos`} tono={resumen.habitosPct >= 70 ? "ok" : resumen.habitosPct < 50 ? "bad" : undefined} />
        <Kpi i={1} icono={<Wallet />} etiqueta="Gastos" valor={euros(resumen.gastos, false)} detalle={`ingresos ${euros(resumen.ingresos, false)}`} />
        <Kpi i={2} icono={<ListTodo />} etiqueta="Tareas" valor={resumen.tareasHechas} detalle={resumen.animoMedio != null ? `ánimo ${resumen.animoMedio.toFixed(1)}/5` : undefined} />
      </div>

      {(resumen.mejorHabito || resumen.peorHabito) && (
        <div className="glass entrar mb-4 space-y-1 rounded-2xl px-4 py-3 text-sm">
          {resumen.mejorHabito && (
            <p className="flex items-center gap-2">
              <Trophy className="size-4 text-ok" /> Lo mejor: <b>{resumen.mejorHabito}</b>
            </p>
          )}
          {resumen.peorHabito && (
            <p className="flex items-center gap-2">
              <TrendingDown className="size-4 text-bad" /> A mejorar: <b>{resumen.peorHabito}</b>
            </p>
          )}
          {tipo === "mensual" && (
            <Link href={`/habitos/informe?mes=${periodo.clave}`} className="inline-flex items-center gap-1 text-accent">
              Ver el informe de hábitos del mes <ChevronRight className="size-4" />
            </Link>
          )}
        </div>
      )}

      <Desplegable icono={<PenLine />} color="red" titulo="Tus respuestas" resumen={PREGUNTAS[tipo].some((p) => revision?.answers?.[p.id]) ? "Guardada" : "Pendiente"} abierto i={3}>
        <FormRevision tipo={tipo} clave={periodo.clave} preguntas={PREGUNTAS[tipo]} respuestas={revision?.answers ?? {}} />
      </Desplegable>

      <Desplegable icono={<History />} color="gray" titulo="Revisiones anteriores" i={4}>
        <ul className="space-y-1 text-sm">
          {((anteriores ?? []) as Review[])
            .filter((r) => PREGUNTAS[r.kind].some((p) => r.answers?.[p.id]))
            .map((r) => (
              <li key={r.id}>
                <Link href={`/revisiones?tipo=${r.kind}&de=${r.kind === "mensual" ? `${r.period}-15` : lunesDeSemanaIso(r.period)}`} className="flex gap-3 rounded-xl px-2 py-2 transition hover:bg-hover">
                  <span className="w-20 capitalize text-muted">{r.kind}</span>
                  <span>{r.period}</span>
                </Link>
              </li>
            ))}
        </ul>
      </Desplegable>
    </Pagina>
  );
}
