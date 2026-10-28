import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Pagina } from "@/components/layout/Pagina";
import { FormRevision } from "@/components/revisiones/FormRevision";
import { Card, Kpi, Seccion, Titulo } from "@/components/ui/basicos";
import { fechaCorta, hoy, lunesDeSemanaIso, mesAnterior, mesDe, nombreMes, sumarDias } from "@/lib/fechas";
import { cx, euros } from "@/lib/formato";
import { periodoDe, PREGUNTAS, resumenPeriodo, type TipoRevision } from "@/lib/revisiones";
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
      <Titulo emoji="🧭" sub="Cada domingo y a fin de mes: mira los números, responde con honestidad y decide el siguiente paso.">
        Revisiones
      </Titulo>

      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <div className="flex rounded-md border border-line p-0.5">
          {(["semanal", "mensual"] as const).map((t) => (
            <Link key={t} href={`/revisiones?tipo=${t}`} className={cx("rounded px-3 py-1 capitalize", tipo === t ? "bg-hover font-medium" : "text-muted")}>
              {t}
            </Link>
          ))}
        </div>
        <Link href={`/revisiones?tipo=${tipo}&de=${prev}`} className="rounded px-2 py-1 text-muted hover:bg-hover">
          ← Anterior
        </Link>
        {periodo.hasta < dia && (
          <Link href={`/revisiones?tipo=${tipo}&de=${next}`} className="rounded px-2 py-1 text-muted hover:bg-hover">
            Siguiente →
          </Link>
        )}
        <Link href={`/?pregunta=${encodeURIComponent(tipo === "semanal" ? "Hagamos mi revisión semanal" : "Hagamos mi revisión mensual")}`} className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 hover:bg-hover">
          <MessageCircle className="size-4" /> Hacerla con el coach
        </Link>
      </div>

      <h2 className="mb-3 text-lg font-semibold capitalize">{titulo}</h2>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Kpi etiqueta="Hábitos cumplidos" valor={`${Math.round(resumen.habitosPct)} %`} detalle={`${resumen.diasPerfectos} días perfectos`} tono={resumen.habitosPct >= 70 ? "ok" : resumen.habitosPct < 50 ? "bad" : undefined} />
        <Kpi etiqueta="Gastos" valor={euros(resumen.gastos, false)} detalle={`ingresos ${euros(resumen.ingresos, false)}`} />
        <Kpi etiqueta="Tareas hechas" valor={resumen.tareasHechas} detalle={resumen.animoMedio != null ? `ánimo medio ${resumen.animoMedio.toFixed(1)}/5` : undefined} />
      </div>
      {(resumen.mejorHabito || resumen.peorHabito) && (
        <p className="mb-6 text-sm text-muted">
          {resumen.mejorHabito && <>Lo mejor: <b className="text-fg">{resumen.mejorHabito}</b>. </>}
          {resumen.peorHabito && <>A mejorar: <b className="text-fg">{resumen.peorHabito}</b>.</>}
          {tipo === "mensual" && (
            <>
              {" "}
              <Link href={`/habitos/informe?mes=${periodo.clave}`} className="text-accent underline">
                Ver el informe de hábitos del mes
              </Link>
            </>
          )}
        </p>
      )}

      <Card className="mb-8">
        <FormRevision tipo={tipo} clave={periodo.clave} preguntas={PREGUNTAS[tipo]} respuestas={revision?.answers ?? {}} />
      </Card>

      <Seccion titulo="Revisiones anteriores">
        <ul className="space-y-1 text-sm">
          {((anteriores ?? []) as Review[])
            .filter((r) => Object.values(r.answers ?? {}).some(Boolean))
            .map((r) => (
              <li key={r.id}>
                <Link href={`/revisiones?tipo=${r.kind}&de=${r.kind === "mensual" ? `${r.period}-15` : lunesDeSemanaIso(r.period)}`} className="flex gap-3 rounded-md px-2 py-1.5 hover:bg-hover">
                  <span className="w-20 text-muted">{r.kind}</span>
                  <span>{r.period}</span>
                </Link>
              </li>
            ))}
        </ul>
      </Seccion>
    </Pagina>
  );
}
