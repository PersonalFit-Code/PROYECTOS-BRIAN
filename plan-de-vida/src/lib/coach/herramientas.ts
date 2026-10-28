import "server-only";

import type Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { hoy, mesDe, rangoMes, sumarDias, sumarMeses } from "@/lib/fechas";
import { mensual, patrimonioNeto } from "@/lib/finanzas";
import { getMetas, getMovimientos, getRecurrentes } from "@/lib/datos/consultas";
import { cumplido, indexar, rachaActual, toca } from "@/lib/habitos/metricas";
import { aplicarAuto } from "@/lib/metas/auto";
import { periodoDe, PREGUNTAS, resumenPeriodo } from "@/lib/revisiones";
import type { Sesion } from "@/lib/sesion";
import {
  n,
  type Account,
  type Category,
  type Goal,
  type Habit,
  type HabitLog,
  type RecurringItem,
  type SavingsGoal,
  type Transaction,
} from "@/lib/tipos";
import { encontrarCategoria } from "./categorias";

/**
 * Herramientas del coach: lo que Claude puede consultar y apuntar en la app. Cada una valida lo que
 * recibe (el modelo puede equivocarse) y devuelve JSON pequeño: el modelo solo necesita los datos,
 * no las filas enteras.
 */

const FECHA = { type: "string", description: "Fecha YYYY-MM-DD. Por defecto, hoy." } as const;

export const HERRAMIENTAS: Anthropic.Tool[] = [
  {
    name: "resumen_finanzas",
    description: "Ingresos, gastos y ahorro de un periodo, con el gasto por categoría frente a su presupuesto. Úsala para preguntas tipo '¿cuánto llevo gastado?'.",
    input_schema: {
      type: "object",
      properties: {
        desde: { type: "string", description: "YYYY-MM-DD. Por defecto, día 1 del mes actual." },
        hasta: { type: "string", description: "YYYY-MM-DD. Por defecto, hoy." },
      },
    },
  },
  {
    name: "buscar_movimientos",
    description: "Lista de movimientos (gastos/ingresos) de un periodo, opcionalmente de una categoría o que contengan un texto en la nota. Máximo 60.",
    input_schema: {
      type: "object",
      properties: {
        desde: { type: "string" },
        hasta: { type: "string" },
        categoria: { type: "string" },
        texto: { type: "string" },
      },
    },
  },
  {
    name: "registrar_movimiento",
    description: "Apunta un gasto o un ingreso. Úsala cuando el usuario diga que ha gastado, pagado, cobrado o ingresado algo.",
    input_schema: {
      type: "object",
      properties: {
        importe: { type: "number", description: "En euros, positivo." },
        tipo: { type: "string", enum: ["gasto", "ingreso"] },
        categoria: { type: "string", description: "Nombre de la categoría (Comida, Restaurantes, Transporte, Casa, Ocio…). Si no encaja ninguna, déjala vacía." },
        nota: { type: "string", description: "Descripción corta: 'Gasolina', 'Cena con Ana'." },
        fecha: FECHA,
      },
      required: ["importe", "tipo"],
    },
  },
  {
    name: "estado_habitos",
    description: "Hábitos del día (cuáles tocan, cuáles están hechos, rachas) y % de cumplimiento del mes en curso.",
    input_schema: { type: "object", properties: { fecha: FECHA } },
  },
  {
    name: "marcar_habito",
    description: "Marca (o desmarca) un hábito como hecho en una fecha. Para hábitos con cantidad, pasa 'valor'.",
    input_schema: {
      type: "object",
      properties: {
        habito: { type: "string", description: "Nombre (o parte) del hábito." },
        hecho: { type: "boolean", description: "true para marcar, false para desmarcar. Por defecto true." },
        valor: { type: "number", description: "Solo hábitos con cantidad: vasos, minutos…" },
        fecha: FECHA,
      },
      required: ["habito"],
    },
  },
  {
    name: "ver_metas",
    description: "Metas del año por área (salud, dinero, crecimiento, relaciones) con su % de avance y tareas pendientes. Las metas de ingresos mensuales se miden solas: traen lo que entra este mes, el ritmo que debería llevar y lo que falta.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "crear_tarea",
    description: "Crea una tarea, opcionalmente para una fecha y ligada a una meta.",
    input_schema: {
      type: "object",
      properties: {
        titulo: { type: "string" },
        fecha: { type: "string", description: "YYYY-MM-DD, opcional." },
        meta: { type: "string", description: "Título (o parte) de la meta a la que pertenece, opcional." },
        prioridad: { type: "integer", enum: [1, 2, 3], description: "1 alta, 2 normal, 3 baja." },
      },
      required: ["titulo"],
    },
  },
  {
    name: "escribir_diario",
    description: "Añade texto al diario del día y/o guarda ánimo y energía (1–5).",
    input_schema: {
      type: "object",
      properties: {
        texto: { type: "string" },
        animo: { type: "integer", minimum: 1, maximum: 5 },
        energia: { type: "integer", minimum: 1, maximum: 5 },
        fecha: FECHA,
      },
    },
  },
  {
    name: "patrimonio",
    description: "Cuentas, inversiones, deudas, patrimonio neto, huchas de ahorro y suscripciones activas.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "mi_negocio",
    description:
      "Todo lo del negocio de una vez: sus notas de negocio (qué vende, a quién, precios, ideas previas), clientes con cuota fija, ventas e ingresos de los últimos 3 meses, lo que le deben, el stock por vender y cómo va la meta de ingresos mensuales. Úsala antes de dar ideas de negocio, monetización o mejoras.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "guardar_nota_negocio",
    description:
      "Apunta en sus notas de negocio (Ajustes → Tu negocio) algo que conviene recordar: un dato nuevo (cliente, precio, servicio), una idea que ha decidido probar o una conclusión. Una línea clara; no repitas lo que ya está.",
    input_schema: { type: "object", properties: { nota: { type: "string" } }, required: ["nota"] },
  },
  {
    name: "informe_inversion",
    description: "Último informe diario de inversión: recomendaciones vigentes, su historial de aciertos frente al benchmark y lo que ha aprendido el sistema.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "datos_revision",
    description: "Números de la semana o el mes (hábitos, gastos, tareas, ánimo) y las respuestas ya guardadas de la revisión. Úsala al guiar una revisión semanal o mensual.",
    input_schema: { type: "object", properties: { tipo: { type: "string", enum: ["semanal", "mensual"] } }, required: ["tipo"] },
  },
  {
    name: "guardar_revision",
    description: "Guarda las respuestas de la revisión (semanal: bien, mal, aprendi, prioridades; mensual: logro, habito, dinero, foco). Solo las que el usuario haya contestado.",
    input_schema: {
      type: "object",
      properties: {
        tipo: { type: "string", enum: ["semanal", "mensual"] },
        respuestas: { type: "object", additionalProperties: { type: "string" } },
      },
      required: ["tipo", "respuestas"],
    },
  },
];

type Entrada = Record<string, unknown>;

const esFecha = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Lo que ha cambiado, para refrescar las pantallas afectadas al terminar. */
export interface Efectos {
  rutas: Set<string>;
  acciones: string[];
}

export async function ejecutarHerramienta(s: Sesion, nombre: string, input: Entrada, efectos: Efectos): Promise<unknown> {
  const dia = hoy();
  switch (nombre) {
    case "resumen_finanzas": {
      const desde = esFecha(input.desde) ? input.desde : rangoMes(mesDe(dia)).desde;
      const hasta = esFecha(input.hasta) ? input.hasta : dia;
      const [{ data: movs }, { data: cats }] = await Promise.all([
        s.db.from("transactions").select("amount, kind, category_id").eq("user_id", s.userId).gte("day", desde).lte("day", hasta),
        s.db.from("categories").select("*").eq("user_id", s.userId),
      ]);
      const ms = (movs ?? []) as Transaction[];
      const categorias = (cats ?? []) as Category[];
      const porCat = new Map<string, number>();
      for (const m of ms) if (m.kind === "gasto") porCat.set(m.category_id ?? "", (porCat.get(m.category_id ?? "") ?? 0) + n(m.amount));
      const gastos = ms.filter((m) => m.kind === "gasto").reduce((a, m) => a + n(m.amount), 0);
      const ingresos = ms.filter((m) => m.kind === "ingreso").reduce((a, m) => a + n(m.amount), 0);
      return {
        desde,
        hasta,
        ingresos: redondear(ingresos),
        gastos: redondear(gastos),
        ahorro: redondear(ingresos - gastos),
        por_categoria: [...porCat]
          .map(([id, total]) => {
            const c = categorias.find((x) => x.id === id);
            return { categoria: c?.name ?? "Sin categoría", gastado: redondear(total), presupuesto_mensual: c?.monthly_budget != null ? n(c.monthly_budget) : null };
          })
          .sort((a, b) => b.gastado - a.gastado),
      };
    }

    case "buscar_movimientos": {
      const desde = esFecha(input.desde) ? input.desde : rangoMes(mesDe(dia)).desde;
      const hasta = esFecha(input.hasta) ? input.hasta : dia;
      const [{ data: movs }, { data: cats }] = await Promise.all([
        s.db.from("transactions").select("day, amount, kind, category_id, note").eq("user_id", s.userId).gte("day", desde).lte("day", hasta).order("day", { ascending: false }).limit(300),
        s.db.from("categories").select("id, name").eq("user_id", s.userId),
      ]);
      const nombreCat = new Map(((cats ?? []) as Category[]).map((c) => [c.id, c.name]));
      const cat = str(input.categoria);
      const texto = str(input.texto);
      return ((movs ?? []) as Transaction[])
        .map((m) => ({ fecha: m.day, importe: n(m.amount), tipo: m.kind, categoria: m.category_id ? nombreCat.get(m.category_id) : null, nota: m.note }))
        .filter((m) => !cat || norm(m.categoria ?? "").includes(norm(cat)))
        .filter((m) => !texto || norm(m.nota ?? "").includes(norm(texto)))
        .slice(0, 60);
    }

    case "registrar_movimiento": {
      const importe = Math.round(Math.abs(Number(input.importe)) * 100) / 100;
      if (!Number.isFinite(importe) || importe <= 0) return { error: "Importe no válido" };
      const tipo = input.tipo === "ingreso" ? "ingreso" : "gasto";
      const { data: cats } = await s.db.from("categories").select("*").eq("user_id", s.userId);
      const categoria = encontrarCategoria((cats ?? []) as Category[], tipo, str(input.categoria), str(input.nota));
      const fecha = esFecha(input.fecha) ? input.fecha : dia;
      const r = await s.db.from("transactions").insert({ user_id: s.userId, day: fecha, amount: importe, kind: tipo, category_id: categoria?.id ?? null, note: str(input.nota) || null });
      if (r.error) return { error: r.error.message };
      efectos.rutas.add("/finanzas").add("/hoy");
      efectos.acciones.push(`${tipo === "gasto" ? "−" : "+"}${importe} € · ${categoria?.name ?? "sin categoría"}`);
      return { ok: true, importe, tipo, categoria: categoria?.name ?? null, fecha };
    }

    case "estado_habitos": {
      const fecha = esFecha(input.fecha) ? input.fecha : dia;
      const mes = rangoMes(mesDe(fecha));
      const [{ data: habitos }, { data: logs }] = await Promise.all([
        s.db.from("habits").select("*").eq("user_id", s.userId).eq("active", true),
        s.db.from("habit_logs").select("habit_id, day, done, value").eq("user_id", s.userId).gte("day", sumarDias(fecha, -120)).lte("day", fecha),
      ]);
      const porHabito = indexar((logs ?? []) as HabitLog[]);
      return ((habitos ?? []) as Habit[]).map((h) => {
        const l = porHabito.get(h.id) ?? new Map();
        const tocaron = [...Array(Number(fecha.slice(8)))].map((_, i) => sumarDias(mes.desde, i)).filter((d) => toca(h, d));
        const hechos = tocaron.filter((d) => cumplido(h, l.get(d))).length;
        return {
          habito: h.name,
          tipo: h.kind,
          toca_hoy: toca(h, fecha),
          hecho_hoy: cumplido(h, l.get(fecha)),
          valor_hoy: l.get(fecha)?.value ?? null,
          objetivo: h.target != null ? n(h.target) : null,
          racha: rachaActual(h, l, fecha),
          cumplimiento_mes_pct: tocaron.length ? Math.round((100 * hechos) / (h.weekly_target ? Math.max(1, (tocaron.length * h.weekly_target) / 7) : tocaron.length)) : null,
        };
      });
    }

    case "marcar_habito": {
      const buscado = norm(str(input.habito, 80));
      if (!buscado) return { error: "Falta el nombre del hábito" };
      const { data } = await s.db.from("habits").select("*").eq("user_id", s.userId).eq("active", true);
      const habitos = (data ?? []) as Habit[];
      const h = habitos.find((x) => norm(x.name) === buscado) ?? habitos.find((x) => norm(x.name).includes(buscado) || buscado.includes(norm(x.name)));
      if (!h) return { error: `No encuentro el hábito "${input.habito}"`, habitos: habitos.map((x) => x.name) };
      const fecha = esFecha(input.fecha) ? input.fecha : dia;
      const fila: Record<string, unknown> = { habit_id: h.id, user_id: s.userId, day: fecha, updated_at: new Date().toISOString(), done: input.hecho !== false };
      if (typeof input.valor === "number" && Number.isFinite(input.valor)) {
        fila.value = input.valor;
        if (h.kind === "cantidad" && h.target != null) fila.done = input.valor >= n(h.target);
      }
      const r = await s.db.from("habit_logs").upsert(fila, { onConflict: "habit_id,day" });
      if (r.error) return { error: r.error.message };
      efectos.rutas.add("/hoy").add("/habitos");
      efectos.acciones.push(`${fila.done ? "Hecho" : "Desmarcado"}: ${h.name}`);
      return { ok: true, habito: h.name, fecha, hecho: fila.done, valor: fila.value ?? null };
    }

    case "ver_metas": {
      const mes = rangoMes(mesDe(dia));
      const [todas, movimientos, recurrentes, { data: areas }, { data: tareas }] = await Promise.all([
        getMetas(s, Number(dia.slice(0, 4))),
        getMovimientos(s, mes.desde, mes.hasta),
        getRecurrentes(s),
        s.db.from("areas").select("id, name").eq("user_id", s.userId),
        s.db.from("tasks").select("title, goal_id, due_date").eq("user_id", s.userId).eq("done", false).limit(50),
      ]);
      const area = new Map(((areas ?? []) as { id: string; name: string }[]).map((a) => [a.id, a.name]));
      const { metas, estados } = aplicarAuto(todas, movimientos, recurrentes, mesDe(dia));
      return {
        metas: metas.map((g) => ({
          meta: g.title,
          area: g.area_id ? area.get(g.area_id) : null,
          periodo: g.period,
          estado: g.status,
          avance_pct: Math.round(n(g.progress_pct)),
          actual: g.current_value != null ? n(g.current_value) : null,
          objetivo: g.target_value != null ? n(g.target_value) : null,
          unidad: g.unit,
          fecha_limite: g.due_date,
          ...(estados.has(g.id)
            ? {
                medida_sola: "ingresos del mes en curso (apuntados, o los fijos si aún son menos)",
                ritmo_este_mes: Math.round(estados.get(g.id)!.ritmo ?? 0),
                ingresos_fijos: Math.round(estados.get(g.id)!.fijos),
                ingresos_apuntados: Math.round(estados.get(g.id)!.apuntado),
                falta: Math.round(estados.get(g.id)!.falta),
              }
            : {}),
        })),
        tareas_pendientes: (tareas ?? []).map((t) => ({ tarea: t.title, fecha: t.due_date })),
      };
    }

    case "mi_negocio": {
      const desde = sumarMeses(`${mesDe(dia)}-01`, -2);
      const [ajustes, todas, movimientos, recurrentes, { data: cuentas }, { data: categorias }] = await Promise.all([
        s.db.from("settings").select("negocio").eq("user_id", s.userId).maybeSingle(),
        getMetas(s, Number(dia.slice(0, 4))),
        getMovimientos(s, desde, dia),
        getRecurrentes(s),
        s.db.from("accounts").select("name, kind, balance").eq("user_id", s.userId).eq("active", true).eq("kind", "otro"),
        s.db.from("categories").select("id, name").eq("user_id", s.userId),
      ]);
      const cat = new Map(((categorias ?? []) as Pick<Category, "id" | "name">[]).map((c) => [c.id, c.name]));
      const ingresos = movimientos.filter((m) => m.kind === "ingreso");
      const porMes = new Map<string, number>();
      for (const m of ingresos) porMes.set(mesDe(m.day), (porMes.get(mesDe(m.day)) ?? 0) + n(m.amount));
      const { metas, estados } = aplicarAuto(todas, movimientos.filter((m) => mesDe(m.day) === mesDe(dia)), recurrentes, mesDe(dia));
      return {
        notas_de_negocio: ajustes.data?.negocio || "(vacío: pregúntale qué vende, a quién y a qué precio, y guárdalo)",
        clientes_con_cuota: recurrentes
          .filter((r) => r.active && r.kind === "ingreso")
          .map((r) => ({ cliente: r.name, importe: n(r.amount), cada: r.frequency })),
        ingresos_por_mes: Object.fromEntries([...porMes].sort().map(([m, v]) => [m, redondear(v)])),
        ultimos_ingresos: ingresos.slice(0, 15).map((m) => ({ fecha: m.day, importe: n(m.amount), categoria: m.category_id ? cat.get(m.category_id) : null, nota: m.note })),
        le_deben_y_stock: ((cuentas ?? []) as Pick<Account, "name" | "balance">[]).map((c) => ({ concepto: c.name, valor: n(c.balance) })),
        metas_de_ingresos: metas
          .filter((g) => estados.has(g.id))
          .map((g) => ({ meta: g.title, objetivo_mes: n(g.target_value), este_mes: Math.round(estados.get(g.id)!.valor), ritmo_este_mes: Math.round(estados.get(g.id)!.ritmo ?? 0), falta: Math.round(estados.get(g.id)!.falta), fecha_limite: g.due_date })),
        otras_metas_de_dinero: metas.filter((g) => !estados.has(g.id) && g.status === "activa").map((g) => ({ meta: g.title, avance_pct: Math.round(n(g.progress_pct)) })),
      };
    }

    case "guardar_nota_negocio": {
      const nota = str(input.nota, 500);
      if (!nota) return { error: "Falta la nota" };
      const { data } = await s.db.from("settings").select("negocio").eq("user_id", s.userId).maybeSingle();
      const actual = (data?.negocio as string | null) ?? "";
      const r = await s.db
        .from("settings")
        .update({ negocio: [actual, `- ${dia}: ${nota}`].filter(Boolean).join("\n").slice(-8000), updated_at: new Date().toISOString() })
        .eq("user_id", s.userId);
      if (r.error) return { error: r.error.message };
      efectos.rutas.add("/ajustes");
      efectos.acciones.push("Nota de negocio guardada");
      return { ok: true };
    }

    case "crear_tarea": {
      const titulo = str(input.titulo, 200);
      if (!titulo) return { error: "Falta el título" };
      let goal_id: string | null = null;
      if (str(input.meta)) {
        const { data } = await s.db.from("goals").select("id, title").eq("user_id", s.userId).eq("status", "activa");
        goal_id = ((data ?? []) as Goal[]).find((g) => norm(g.title).includes(norm(str(input.meta))))?.id ?? null;
      }
      const prioridad = [1, 2, 3].includes(Number(input.prioridad)) ? Number(input.prioridad) : 2;
      const r = await s.db.from("tasks").insert({ user_id: s.userId, title: titulo, due_date: esFecha(input.fecha) ? input.fecha : null, goal_id, priority: prioridad });
      if (r.error) return { error: r.error.message };
      efectos.rutas.add("/hoy").add("/metas");
      efectos.acciones.push(`Tarea: ${titulo}`);
      return { ok: true, titulo, ligada_a_meta: Boolean(goal_id) };
    }

    case "escribir_diario": {
      const fecha = esFecha(input.fecha) ? input.fecha : dia;
      const { data: actual } = await s.db.from("journal_entries").select("body, mood, energy").eq("user_id", s.userId).eq("day", fecha).maybeSingle();
      const escala = (v: unknown) => (Number.isInteger(v) && Number(v) >= 1 && Number(v) <= 5 ? Number(v) : null);
      const texto = str(input.texto, 4000);
      const r = await s.db.from("journal_entries").upsert(
        {
          user_id: s.userId,
          day: fecha,
          body: texto ? [actual?.body, texto].filter(Boolean).join("\n") : (actual?.body ?? null),
          mood: escala(input.animo) ?? actual?.mood ?? null,
          energy: escala(input.energia) ?? actual?.energy ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,day" },
      );
      if (r.error) return { error: r.error.message };
      efectos.rutas.add("/diario").add("/hoy");
      efectos.acciones.push("Diario actualizado");
      return { ok: true, fecha };
    }

    case "patrimonio": {
      const [{ data: cuentas }, { data: huchas }, { data: recurrentes }] = await Promise.all([
        s.db.from("accounts").select("*").eq("user_id", s.userId).eq("active", true),
        s.db.from("savings_goals").select("*").eq("user_id", s.userId),
        s.db.from("recurring_items").select("*").eq("user_id", s.userId).eq("active", true),
      ]);
      const cs = (cuentas ?? []) as Account[];
      const subs = ((recurrentes ?? []) as RecurringItem[]).filter((r) => r.is_subscription);
      return {
        patrimonio_neto: redondear(patrimonioNeto(cs)),
        cuentas: cs.map((c) => ({ cuenta: c.name, tipo: c.kind, saldo: n(c.balance), ticker: c.symbol })),
        huchas: ((huchas ?? []) as SavingsGoal[]).map((h) => ({ hucha: h.name, ahorrado: n(h.saved), objetivo: n(h.target), fecha: h.target_date })),
        suscripciones: subs.map((r) => ({ nombre: r.name, importe: n(r.amount), cada: r.frequency })),
        suscripciones_al_mes: redondear(subs.reduce((a, r) => a + mensual(r.amount, r.frequency), 0)),
      };
    }

    case "informe_inversion": {
      const [{ data: informe }, { data: recs }, { data: resultados }, { data: nota }] = await Promise.all([
        s.db.from("investment_reports").select("day, summary, mode").eq("user_id", s.userId).order("day", { ascending: false }).limit(1).maybeSingle(),
        s.db.from("recommendations").select("day, symbol, action, sleeve, signal, thesis, confidence").eq("user_id", s.userId).order("day", { ascending: false }).limit(8),
        s.db.from("recommendation_outcomes").select("horizon_days, hit, return_pct, benchmark_pct").eq("user_id", s.userId),
        s.db.from("strategy_notes").select("week, summary").eq("user_id", s.userId).order("week", { ascending: false }).limit(1).maybeSingle(),
      ]);
      const rs = (resultados ?? []) as { hit: boolean }[];
      return {
        informe: informe ?? "Aún no hay informe (se genera cada día laborable).",
        recomendaciones_recientes: recs ?? [],
        aciertos: rs.length ? { evaluadas: rs.length, acierto_pct: Math.round((100 * rs.filter((r) => r.hit).length) / rs.length) } : "sin evaluar todavía",
        aprendizaje: nota?.summary ?? null,
        aviso: "Análisis informativo. La decisión y la ejecución son del usuario.",
      };
    }

    case "datos_revision": {
      const tipo = input.tipo === "mensual" ? "mensual" : "semanal";
      const p = periodoDe(tipo, dia);
      const [resumen, { data: rev }] = await Promise.all([
        resumenPeriodo(s, p.desde, p.hasta < dia ? p.hasta : dia),
        s.db.from("reviews").select("answers").eq("user_id", s.userId).eq("kind", tipo).eq("period", p.clave).maybeSingle(),
      ]);
      return { periodo: p.clave, desde: p.desde, hasta: p.hasta, numeros: resumen, preguntas: PREGUNTAS[tipo], respuestas_guardadas: rev?.answers ?? {} };
    }

    case "guardar_revision": {
      const tipo = input.tipo === "mensual" ? "mensual" : "semanal";
      const p = periodoDe(tipo, dia);
      const { data: rev } = await s.db.from("reviews").select("answers").eq("user_id", s.userId).eq("kind", tipo).eq("period", p.clave).maybeSingle();
      const validas = new Set(PREGUNTAS[tipo].map((q) => q.id));
      const nuevas = Object.fromEntries(
        Object.entries((input.respuestas as Record<string, unknown>) ?? {})
          .filter(([k, v]) => validas.has(k) && typeof v === "string" && v.trim())
          .map(([k, v]) => [k, String(v).trim().slice(0, 4000)]),
      );
      const r = await s.db
        .from("reviews")
        .upsert({ user_id: s.userId, kind: tipo, period: p.clave, answers: { ...(rev?.answers ?? {}), ...nuevas }, updated_at: new Date().toISOString() }, { onConflict: "user_id,kind,period" });
      if (r.error) return { error: r.error.message };
      efectos.rutas.add("/revisiones");
      efectos.acciones.push(`Revisión ${tipo} guardada`);
      return { ok: true, guardadas: Object.keys(nuevas) };
    }

    default:
      return { error: `Herramienta desconocida: ${nombre}` };
  }
}

function redondear(v: number): number {
  return Math.round(v * 100) / 100;
}

export function aplicarEfectos(efectos: Efectos): void {
  for (const r of efectos.rutas) revalidatePath(r);
}
