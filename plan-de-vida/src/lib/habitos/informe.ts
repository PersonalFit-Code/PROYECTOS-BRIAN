import "server-only";

import { getClaude, logErrorClaude, textoDe } from "@/lib/coach/claude";
import { MODELO_COACH, personalidad } from "@/lib/coach/personalidad";
import { mesAnterior, nombreMes, rangoMes } from "@/lib/fechas";
import type { Sesion } from "@/lib/sesion";
import type { Habit, HabitLog, JournalEntry, Settings } from "@/lib/tipos";
import { ideasPorReglas, indexar, informeMensual, type InformeHabitos } from "./metricas";

export interface InformeGuardado {
  habitos: InformeHabitos;
  ideas: string[];
  ideasModo: "claude" | "reglas";
  generadoEl: string;
}

/** Calcula el informe de hábitos de un mes (sin guardarlo). */
export async function calcularInforme(s: Sesion, mes: string): Promise<InformeHabitos> {
  const { desde, hasta } = rangoMes(mes);
  const anterior = rangoMes(mesAnterior(mes));
  const [{ data: habitos }, { data: logs }, { data: diario }] = await Promise.all([
    // también los archivados: si existían ese mes, cuentan
    s.db.from("habits").select("*").eq("user_id", s.userId).lte("start_date", hasta),
    s.db.from("habit_logs").select("habit_id, day, done, value").eq("user_id", s.userId).gte("day", anterior.desde).lte("day", hasta),
    s.db.from("journal_entries").select("day, mood").eq("user_id", s.userId).gte("day", desde).lte("day", hasta),
  ]);
  const animoPorDia = new Map<string, number>();
  for (const e of (diario ?? []) as Pick<JournalEntry, "day" | "mood">[]) if (e.mood != null) animoPorDia.set(e.day, e.mood);
  // Un archivado solo cuenta si tuvo actividad ese mes (si no, ensuciaría el informe con 0 %).
  const conActividad = new Set(((logs ?? []) as HabitLog[]).filter((l) => l.day >= desde).map((l) => l.habit_id));
  const lista = ((habitos ?? []) as Habit[]).filter((h) => h.active || conActividad.has(h.id));
  return informeMensual({
    mes,
    desde,
    hasta,
    desdeAnterior: anterior.desde,
    hastaAnterior: anterior.hasta,
    habitos: lista,
    logs: indexar((logs ?? []) as HabitLog[]),
    animoPorDia,
  });
}

/**
 * Ideas de mejora. Con clave de Anthropic las escribe el coach a partir de las métricas (y las ideas
 * por reglas como base); sin clave, las de reglas.
 */
export async function generarIdeas(inf: InformeHabitos, ajustes: Pick<Settings, "coach_prompt" | "display_name" | "coach_name">): Promise<{ ideas: string[]; modo: "claude" | "reglas" }> {
  const base = ideasPorReglas(inf);
  const claude = getClaude();
  if (!claude || !inf.habitos.length) return { ideas: base, modo: "reglas" };

  const datos = {
    mes: nombreMes(inf.mes),
    cumplimiento_global: Math.round(inf.pctGlobal),
    mes_anterior: inf.pctGlobalAnterior == null ? null : Math.round(inf.pctGlobalAnterior),
    dias_perfectos: inf.diasPerfectos,
    mejor_dia: inf.mejorDiaSemana,
    peor_dia: inf.peorDiaSemana,
    animo_dias_buenos: inf.animo.diasBuenos,
    animo_dias_flojos: inf.animo.diasFlojos,
    habitos: inf.habitos.map((h) => ({
      nombre: h.nombre,
      cumplimiento: Math.round(h.pct),
      mes_anterior: h.pctAnterior == null ? null : Math.round(h.pctAnterior),
      mejor_racha: h.mejorRacha,
      peor_dia: h.peorDia,
    })),
  };

  try {
    const msg = await claude.messages.create({
      model: MODELO_COACH,
      max_tokens: 1200,
      system: personalidad(ajustes),
      messages: [
        {
          role: "user",
          content:
            `Este es el informe de hábitos de ${ajustes.display_name} del mes de ${datos.mes}:\n\n${JSON.stringify(datos, null, 2)}\n\n` +
            `Ideas que ya salen de las reglas automáticas (puedes mejorarlas o descartarlas):\n- ${base.join("\n- ")}\n\n` +
            `Escribe entre 4 y 7 ideas concretas para el mes que viene: qué mantener, qué corregir y cómo (con el sistema exacto: cuándo, dónde, tras qué). ` +
            `Empieza por lo que más falla. Cada idea en UNA línea que empiece por "- ". Al final, una línea que empiece por "> " con una afirmación en presente para el mes. Nada más.`,
        },
      ],
    });
    const lineas = textoDe(msg)
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("- ") || l.startsWith("> "))
      .map((l) => (l.startsWith("- ") ? l.slice(2) : l));
    return lineas.length ? { ideas: lineas, modo: "claude" } : { ideas: base, modo: "reglas" };
  } catch (err) {
    logErrorClaude("informe-habitos", err);
    return { ideas: base, modo: "reglas" };
  }
}

/** Calcula, pide ideas y guarda el informe en la revisión mensual (reviews.report.habitos). */
export async function generarYGuardarInforme(s: Sesion, mes: string, ajustes: Pick<Settings, "coach_prompt" | "display_name" | "coach_name">): Promise<InformeGuardado> {
  const habitos = await calcularInforme(s, mes);
  const { ideas, modo } = await generarIdeas(habitos, ajustes);
  const informe: InformeGuardado = { habitos, ideas, ideasModo: modo, generadoEl: new Date().toISOString() };

  const { data: previa } = await s.db.from("reviews").select("report").eq("user_id", s.userId).eq("kind", "mensual").eq("period", mes).maybeSingle();
  const report = { ...((previa?.report as Record<string, unknown>) ?? {}), habitos: informe };
  const r = await s.db
    .from("reviews")
    .upsert({ user_id: s.userId, kind: "mensual", period: mes, report, updated_at: new Date().toISOString() }, { onConflict: "user_id,kind,period" });
  if (r.error) throw new Error(`No se pudo guardar el informe: ${r.error.message}`);
  return informe;
}

export async function leerInforme(s: Sesion, mes: string): Promise<InformeGuardado | null> {
  const { data } = await s.db.from("reviews").select("report").eq("user_id", s.userId).eq("kind", "mensual").eq("period", mes).maybeSingle();
  const rep = data?.report as { habitos?: InformeGuardado } | null;
  return rep?.habitos ?? null;
}
