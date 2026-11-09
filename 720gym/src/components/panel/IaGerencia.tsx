"use client";

import { useState, type FormEvent } from "react";
import { ArrowUp, Copy, HeartHandshake, MessageCircle, ScrollText, Sparkles } from "lucide-react";
import { Tarjeta, TituloBloque, botonClaro, botonNegro, euros } from "./ui";
import { cuentas, useDatosVivos } from "./datos";
import { usePanelCtx } from "./contexto";
import { conversacionesSemilla, gastosMes, historico, ingresosMes, porEntrenador, preguntasFrecuentes, socios, totales } from "@/data/panel-demo";
import { cn } from "@/lib/utils";

/**
 * IA para la gerencia: informe de las conversaciones del asistente, preguntas en lenguaje normal
 * sobre los datos del CRM y mensajes para recuperar clientes. Con clave de la API responde Claude;
 * sin ella, respuestas de respaldo calculadas con los mismos datos.
 */
interface Informe {
  resumen: string;
  temas: { tema: string; veces: number }[];
  objeciones: string[];
  perdidas: { resumen: string; motivo: string; accion: string }[];
  recomendaciones: string[];
}

async function pedir<T>(cuerpo: Record<string, unknown>): Promise<(T & { motor: "claude" }) | null> {
  try {
    const r = await fetch("/api/ia-crm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) });
    const j = await r.json();
    return j.motor === "claude" ? j : null;
  } catch {
    return null;
  }
}

const enRiesgo = socios
  .filter((s) => s.ultimoAcceso >= 7 || s.estado !== "Al día")
  .sort((a, b) => b.ultimoAcceso - a.ultimoAcceso)
  .slice(0, 6);

function mensajeLocal(s: (typeof socios)[number]) {
  const n = s.nombre.split(" ")[0];
  if (s.estado !== "Al día") return `¡Hola ${n}! Soy Brais, de 720. He visto que tu cuota de ${s.plan} está pendiente; si te viene mejor, lo regularizamos en dos veces sin problema. ¡Te echamos de menos en la sala! Brais, 720`;
  return `¡Hola ${n}! Soy Brais, de 720. Hace ${s.ultimoAcceso} días que no te vemos y queremos que sigas con tu progreso. ¿Te reservo una sesión esta semana y revisamos juntos tu plan? Brais, 720`;
}

export default function IaGerencia() {
  const { avisar } = usePanelCtx();
  const { chats, pagos, solicitudes, fichas } = useDatosVivos();
  const [informe, setInforme] = useState<{ datos: Informe; ia: boolean } | null>(null);
  const [cargando, setCargando] = useState<string | null>(null);
  const [pregunta, setPregunta] = useState("");
  const [respuestas, setRespuestas] = useState<{ q: string; a: string; ia: boolean }[]>([]);
  const [mensajes, setMensajes] = useState<Record<string, { texto: string; ia: boolean }>>({});

  const c = cuentas(pagos);
  const conversaciones = [...conversacionesSemilla.map((x) => ({ resultado: x.resultado, mensajes: x.mensajes })), ...chats.map((x) => ({ resultado: "web", mensajes: x.mensajes }))];

  async function generarInforme() {
    setCargando("informe");
    const r = await pedir<{ informe: Informe }>({ tarea: "informe", datos: conversaciones });
    if (r) setInforme({ datos: r.informe, ia: true });
    else {
      const textos = conversaciones.flatMap((x) => x.mensajes.filter((m) => m.rol === "usuario").map((m) => m.texto.toLowerCase()));
      const objeciones = [
        textos.some((t) => /cuesta|precio|cuanto/.test(t)) && "Preguntan el precio antes de decidirse",
        textos.some((t) => /aparc|donde|llegar/.test(t)) && "Dudas sobre cómo llegar y aparcar",
        textos.some((t) => /vacacion|de paso|semana/.test(t)) && "Gente de paso que pregunta por pases (precio pendiente)",
      ].filter(Boolean) as string[];
      setInforme({
        ia: false,
        datos: {
          resumen: `${conversaciones.length} conversaciones analizadas. Lo más preguntado: ${preguntasFrecuentes[0].tema.toLowerCase()} y ${preguntasFrecuentes[1].tema.toLowerCase()}.`,
          temas: preguntasFrecuentes,
          objeciones,
          perdidas: conversacionesSemilla
            .filter((x) => x.resultado === "Información")
            .map((x) => ({ resumen: x.mensajes[0].texto, motivo: "Solo pedía información", accion: "Escribirle ofreciendo una clase de prueba gratis" })),
          recomendaciones: ["Publicar el precio de los pases temporales", "Ofrecer la clase gratis en cuanto alguien pregunte el precio", "Recordar el aparcamiento y los autobuses en la web y el chat"],
        },
      });
    }
    setCargando(null);
    avisar("Informe de conversaciones listo");
  }

  async function preguntar(e: FormEvent) {
    e.preventDefault();
    const q = pregunta.trim();
    if (!q) return;
    setPregunta("");
    setCargando("pregunta");
    const datos = {
      mes_en_curso: { ingresos: c.ingresos, gastos: c.gastos, beneficio: c.beneficio, pagos_online: c.online, ingresos_por_categoria: ingresosMes, gastos_por_categoria: gastosMes },
      historico_12_meses: c.serie,
      totales,
      entrenadores: porEntrenador,
      socios_muestra: socios.map(({ nombre, plan, cuota, estado, ultimoAcceso, asistencias, alta }) => ({ nombre, plan, cuota, estado, dias_sin_venir: ultimoAcceso, asistencias_mes: asistencias, alta })),
      solicitudes_web: solicitudes.length,
      fichas_asistente: fichas.map(({ nombre, objetivo, temperatura, plan_recomendado }) => ({ nombre, objetivo, temperatura, plan_recomendado })),
    };
    const r = await pedir<{ texto: string }>({ tarea: "pregunta", pregunta: q, datos });
    let a = r?.texto;
    if (!a) {
      const t = q.toLowerCase();
      const pend = socios.filter((s) => s.estado !== "Al día");
      if (/factur|ingres|gan|benefic/.test(t)) a = `Este mes llevas ${euros(c.ingresos)} de ingresos y ${euros(c.gastos)} de gastos: ${euros(c.beneficio)} de beneficio. El mes pasado ingresaste ${euros(historico[historico.length - 2].ingresos)}.`;
      else if (/pilates/.test(t)) a = `720 Pilates factura ${euros(ingresosMes.find((x) => x.concepto === "720 Pilates")?.importe ?? 0)} este mes (${ingresosMes.find((x) => x.concepto === "720 Pilates")?.detalle}).`;
      else if (/debe|deuda|impag|pendiente|cobr/.test(t)) a = `En la muestra hay ${pend.length} clientes sin estar al día: ${pend.map((s) => `${s.nombre} (${s.estado.toLowerCase()}, ${s.plan})`).join(", ")}.`;
      else if (/no viene|sin venir|inactiv|baja/.test(t)) a = `Llevan 7 días o más sin venir: ${enRiesgo.map((s) => `${s.nombre} (${s.ultimoAcceso} días)`).join(", ")}.`;
      else if (/socio|cliente|alta/.test(t)) a = `Tienes ${totales.sociosActivos} socios activos; este mes ${totales.altasMes} altas y ${totales.bajasMes} bajas.`;
      else a = "Sin la IA conectada puedo responder sobre facturación, Pilates, deudas, socios sin venir y altas. Con la clave de la API respondo cualquier pregunta sobre tus datos.";
    }
    setRespuestas((x) => [{ q, a: a!, ia: Boolean(r) }, ...x]);
    setCargando(null);
  }

  async function redactar(s: (typeof socios)[number]) {
    setCargando(s.id);
    const r = await pedir<{ texto: string }>({ tarea: "mensaje", cliente: { nombre: s.nombre, plan: s.plan, cuota: s.cuota, estado_pago: s.estado, dias_sin_venir: s.ultimoAcceso, cliente_desde: s.alta } });
    setMensajes((m) => ({ ...m, [s.id]: { texto: r?.texto ?? mensajeLocal(s), ia: Boolean(r) } }));
    setCargando(null);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Tarjeta oscura className="xl:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.14em] text-white/55 uppercase">
              <Sparkles className="size-4" aria-hidden /> IA para la gerencia
            </p>
            <p className="subtitular mt-2 text-[22px]">Pregúntale a tus datos</p>
          </div>
          <p className="max-w-md text-[13px] text-white/60">Facturación, deudas, quién no viene, qué entrenador factura más… en lenguaje normal.</p>
        </div>
        <form onSubmit={preguntar} className="mt-5 flex gap-2">
          <input
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            placeholder="¿Cuánto llevamos facturado este mes? ¿Quién debe la cuota?"
            className="h-12 min-w-0 flex-1 rounded-full bg-white/10 px-5 text-[15px] text-white ring-1 ring-white/15 outline-none placeholder:text-white/40 focus:ring-white"
          />
          <button type="submit" disabled={cargando === "pregunta"} className="grid size-12 place-items-center rounded-full bg-white text-negro transition disabled:opacity-50" aria-label="Preguntar">
            <ArrowUp className={cn("size-5", cargando === "pregunta" && "animate-bounce")} />
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {["¿Cuánto llevamos facturado?", "¿Quién debe la cuota?", "¿Quién lleva días sin venir?", "¿Cuánto factura Pilates?"].map((s) => (
            <button key={s} type="button" onClick={() => setPregunta(s)} className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] ring-1 ring-white/10 hover:bg-white/20">
              {s}
            </button>
          ))}
        </div>
        {respuestas.length > 0 && (
          <ul className="mt-5 grid gap-3">
            {respuestas.map((r, i) => (
              <li key={i} className="pop-entra rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
                <p className="text-[12px] text-white/55">{r.q}</p>
                <p className="mt-1 text-[14.5px] leading-relaxed">{r.a}</p>
                {!r.ia && <p className="mt-2 text-[11px] text-white/40">Respuesta de respaldo (IA sin conectar)</p>}
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      <Tarjeta>
        <TituloBloque
          accion={
            <button type="button" onClick={generarInforme} disabled={cargando === "informe"} className={botonNegro}>
              <ScrollText className="size-4" aria-hidden /> {cargando === "informe" ? "Analizando…" : "Generar informe"}
            </button>
          }
        >
          Informe de conversaciones
        </TituloBloque>
        <p className="text-[13px] text-negro/60">Qué pregunta la gente, qué les frena y qué conversaciones se perdieron. En producción puede llegar solo cada lunes: se procesa de noche con la API por lotes, a mitad de precio.</p>
        {informe && (
          <div className="pop-entra mt-5 grid gap-4 text-[13.5px]">
            <p className="rounded-2xl bg-black/[0.04] p-4 font-semibold">{informe.datos.resumen}</p>
            <div>
              <p className="etiqueta text-negro/50">Lo que más preguntan</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {informe.datos.temas.map((t) => (
                  <li key={t.tema} className="rounded-full bg-black/[0.06] px-3 py-1 text-[12.5px]">
                    {t.tema} · <strong>{t.veces}</strong>
                  </li>
                ))}
              </ul>
            </div>
            {informe.datos.objeciones.length > 0 && (
              <div>
                <p className="etiqueta text-negro/50">Lo que les frena</p>
                <ul className="mt-2 grid gap-1">
                  {informe.datos.objeciones.map((o) => (
                    <li key={o}>· {o}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <p className="etiqueta text-negro/50">Conversaciones perdidas</p>
              <ul className="mt-2 grid gap-2">
                {informe.datos.perdidas.map((p) => (
                  <li key={p.resumen} className="rounded-xl bg-black/[0.035] p-3">
                    «{p.resumen}» · <span className="text-negro/60">{p.motivo}</span>
                    <p className="mt-1 font-semibold">→ {p.accion}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="etiqueta text-negro/50">Qué hacer esta semana</p>
              <ul className="mt-2 grid gap-1">
                {informe.datos.recomendaciones.map((r) => (
                  <li key={r}>✓ {r}</li>
                ))}
              </ul>
            </div>
            {!informe.ia && <p className="text-[11px] text-negro/45">Informe básico calculado sin IA (falta la clave de la API).</p>}
          </div>
        )}
      </Tarjeta>

      <Tarjeta>
        <TituloBloque>
          <span className="flex items-center gap-2">
            <HeartHandshake className="size-5" aria-hidden /> Recuperar clientes
          </span>
        </TituloBloque>
        <p className="text-[13px] text-negro/60">Quien lleva 7 días o más sin venir o tiene la cuota pendiente. La IA redacta un mensaje personal y lo envías con un toque.</p>
        <ul className="mt-4 grid gap-3">
          {enRiesgo.map((s) => {
            const m = mensajes[s.id];
            return (
              <li key={s.id} className="rounded-2xl bg-black/[0.035] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[14px] font-semibold">
                    {s.nombre} <span className="font-normal text-negro/55">· {s.plan}</span>
                  </p>
                  <span className="text-[12px] text-negro/55">{s.estado !== "Al día" ? `Cuota ${s.estado.toLowerCase()}` : `${s.ultimoAcceso} días sin venir`}</span>
                </div>
                {m ? (
                  <div className="pop-entra mt-2">
                    <p className="rounded-xl bg-white p-3 text-[13px] leading-relaxed">{m.texto}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(m.texto).catch(() => {});
                          avisar("Mensaje copiado");
                        }}
                        className={cn(botonClaro, "h-8 px-3 text-[12px]")}
                      >
                        <Copy className="size-3.5" aria-hidden /> Copiar
                      </button>
                      <a href={`https://wa.me/?text=${encodeURIComponent(m.texto)}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#25d366] px-3 text-[12px] font-semibold text-white">
                        <MessageCircle className="size-3.5" aria-hidden /> Enviar por WhatsApp
                      </a>
                      {!m.ia && <span className="self-center text-[11px] text-negro/45">plantilla (IA sin conectar)</span>}
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => redactar(s)} disabled={cargando === s.id} className={cn(botonClaro, "mt-2 h-8 px-3 text-[12px]")}>
                    <Sparkles className="size-3.5" aria-hidden /> {cargando === s.id ? "Redactando…" : "Redactar mensaje"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </Tarjeta>
    </div>
  );
}
