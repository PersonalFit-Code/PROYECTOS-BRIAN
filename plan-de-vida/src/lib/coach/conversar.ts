import "server-only";

import type Anthropic from "@anthropic-ai/sdk";
import { getAjustes } from "@/lib/datos/consultas";
import { fechaLarga, hoy } from "@/lib/fechas";
import type { Sesion } from "@/lib/sesion";
import { getClaude, logErrorClaude, textoDe } from "./claude";
import { aplicarEfectos, ejecutarHerramienta, HERRAMIENTAS, type Efectos } from "./herramientas";
import { responderSinIA } from "./offline";
import { GUIA_NEGOCIO, MODELO_COACH, personalidad } from "./personalidad";

export interface RespuestaCoach {
  texto: string;
  acciones: string[];
  modo: "claude" | "basico";
}

const MAX_VUELTAS = 6;
const HISTORIAL = 16;
const MAX_TOKENS = 4000;
const SIN_TEXTO = "…";

/**
 * Una vuelta de conversación: guarda el mensaje, deja a Claude usar las herramientas que necesite
 * (hasta 6 rondas) y guarda la respuesta. Sin clave, o si la API falla, responde el modo básico.
 */
export async function conversar(s: Sesion, mensaje: string): Promise<RespuestaCoach> {
  const efectos: Efectos = { rutas: new Set(), acciones: [] };
  await s.db.from("chat_messages").insert({ user_id: s.userId, role: "user", content: mensaje });

  const claude = getClaude();
  let respuesta: RespuestaCoach | null = null;
  if (claude) {
    try {
      respuesta = { texto: await conClaude(s, claude, efectos), acciones: efectos.acciones, modo: "claude" };
    } catch (err) {
      logErrorClaude("coach", err);
    }
  }
  if (!respuesta) respuesta = { texto: await responderSinIA(s, mensaje, efectos), acciones: efectos.acciones, modo: "basico" };

  await s.db.from("chat_messages").insert({ user_id: s.userId, role: "assistant", content: respuesta.texto || SIN_TEXTO });
  aplicarEfectos(efectos);
  return respuesta;
}

async function conClaude(s: Sesion, claude: Anthropic, efectos: Efectos): Promise<string> {
  const ajustes = await getAjustes(s);
  const { data: historial } = await s.db
    .from("chat_messages")
    .select("role, content")
    .eq("user_id", s.userId)
    .order("created_at", { ascending: false })
    .limit(HISTORIAL);

  const mensajes: Anthropic.MessageParam[] = [];
  for (const m of (historial ?? []).reverse()) {
    // las respuestas vacías de antes no se le enseñan: invitan a repetirlas
    if (m.role === "assistant" && m.content.trim() === SIN_TEXTO) continue;
    // la API exige alternar papeles: se juntan los seguidos del mismo
    const ultimo = mensajes[mensajes.length - 1];
    if (ultimo && ultimo.role === m.role) ultimo.content = `${ultimo.content as string}\n\n${m.content}`;
    else mensajes.push({ role: m.role as "user" | "assistant", content: m.content });
  }
  while (mensajes.length && mensajes[0].role !== "user") mensajes.shift();

  const dia = hoy();
  const system: Anthropic.TextBlockParam[] = [
    { type: "text", text: `${personalidad(ajustes)}\n\n${GUIA_NEGOCIO}`, cache_control: { type: "ephemeral" } },
    { type: "text", text: `Hoy es ${fechaLarga(dia)} (${dia}), zona horaria de Madrid. Moneda: euros.` },
  ];

  for (let vuelta = 0; vuelta < MAX_VUELTAS; vuelta++) {
    const res = await claude.messages.create({ model: MODELO_COACH, max_tokens: MAX_TOKENS, system, tools: HERRAMIENTAS, messages: mensajes });
    if (res.stop_reason !== "tool_use") {
      const texto = textoDe(res);
      if (texto) return texto;
      console.warn(`[coach] respuesta sin texto (stop_reason: ${res.stop_reason}; bloques: ${res.content.map((b) => b.type).join(", ") || "ninguno"})`);
      break;
    }

    mensajes.push({ role: "assistant", content: res.content });
    const resultados: Anthropic.ToolResultBlockParam[] = [];
    for (const bloque of res.content) {
      if (bloque.type !== "tool_use") continue;
      let salida: unknown;
      try {
        salida = await ejecutarHerramienta(s, bloque.name, (bloque.input ?? {}) as Record<string, unknown>, efectos);
      } catch (err) {
        salida = { error: err instanceof Error ? err.message : "Error inesperado" };
      }
      resultados.push({ type: "tool_result", tool_use_id: bloque.id, content: JSON.stringify(salida) });
    }
    mensajes.push({ role: "user", content: resultados });
  }
  return respuestaFinal(claude, system, mensajes);
}

/**
 * Si Claude acaba sin escribir nada (o se le acaban las vueltas), se le pide la respuesta con lo que ya
 * tiene, sin dejarle usar más herramientas.
 */
async function respuestaFinal(claude: Anthropic, system: Anthropic.TextBlockParam[], mensajes: Anthropic.MessageParam[]): Promise<string> {
  const aviso: Anthropic.TextBlockParam = {
    type: "text",
    text: "Ahora contéstame por escrito con lo que ya sabes, sin consultar nada más. Concreto y en pocas líneas.",
  };
  const ultimo = mensajes[mensajes.length - 1];
  const pedido: Anthropic.MessageParam[] =
    ultimo?.role === "user"
      ? [...mensajes.slice(0, -1), { role: "user", content: typeof ultimo.content === "string" ? [{ type: "text", text: ultimo.content }, aviso] : [...ultimo.content, aviso] }]
      : [...mensajes, { role: "user", content: [aviso] }];
  const res = await claude.messages.create({
    model: MODELO_COACH,
    max_tokens: MAX_TOKENS,
    system,
    tools: HERRAMIENTAS,
    tool_choice: { type: "none" },
    messages: pedido,
  });
  return textoDe(res) || "No me ha salido la respuesta. ¿Me lo preguntas otra vez, quizá un poco más concreto?";
}
