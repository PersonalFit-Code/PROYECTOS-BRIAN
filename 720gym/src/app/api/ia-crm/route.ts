import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

/**
 * IA para la gerencia, dentro del CRM:
 *  - «informe»: lee las conversaciones del asistente y devuelve temas, objeciones, conversaciones
 *    que no acabaron en alta y qué hacer (salida estructurada con esquema JSON). En producción se
 *    lanza cada noche con la API por lotes (Message Batches), que cuesta la mitad.
 *  - «pregunta»: responde en lenguaje normal con los datos del CRM que le pasa el panel.
 *  - «mensaje»: redacta un WhatsApp personal para recuperar a un cliente que no viene o debe cuota.
 * Sin ANTHROPIC_API_KEY responde { motor: "local" } y el panel usa sus respuestas de respaldo.
 */
const MODELO = "claude-opus-5-5";
const LIMITE = 60_000;

const esquemaInforme = {
  type: "object",
  additionalProperties: false,
  required: ["resumen", "temas", "objeciones", "perdidas", "recomendaciones"],
  properties: {
    resumen: { type: "string", description: "Dos frases con lo más importante." },
    temas: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["tema", "veces"], properties: { tema: { type: "string" }, veces: { type: "integer" } } },
    },
    objeciones: { type: "array", items: { type: "string" } },
    perdidas: {
      type: "array",
      description: "Conversaciones que no acabaron en reserva ni alta.",
      items: { type: "object", additionalProperties: false, required: ["resumen", "motivo", "accion"], properties: { resumen: { type: "string" }, motivo: { type: "string" }, accion: { type: "string" } } },
    },
    recomendaciones: { type: "array", items: { type: "string" } },
  },
};

export async function POST(req: Request) {
  let j: { tarea?: string; datos?: unknown; pregunta?: string; cliente?: Record<string, unknown> };
  try {
    j = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  }
  const datos = JSON.stringify(j.datos ?? j.cliente ?? {}).slice(0, LIMITE);
  if (!["informe", "pregunta", "mensaje"].includes(j.tarea ?? "")) return NextResponse.json({ error: "Tarea desconocida" }, { status: 400 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ motor: "local" });

  const client = new Anthropic();
  const base = {
    model: MODELO,
    max_tokens: 4000,
    output_config: { effort: "low" as const },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default" as const,
  };
  try {
    if (j.tarea === "informe") {
      const r = await client.beta.messages.create({
        ...base,
        output_config: { effort: "medium", format: { type: "json_schema", schema: esquemaInforme } },
        system: "Eres analista comercial de 720 GYM CLUB (gimnasio en Ourense). Lee las conversaciones del asistente de la web y saca conclusiones útiles para vender más. En español, concreto, sin inventar datos que no estén en las conversaciones.",
        messages: [{ role: "user", content: `Conversaciones de la semana (JSON):\n${datos}` }],
      });
      const texto = r.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")?.text;
      if (r.stop_reason !== "end_turn" || !texto) return NextResponse.json({ motor: "local" });
      return NextResponse.json({ motor: "claude", informe: JSON.parse(texto) });
    }

    if (j.tarea === "pregunta") {
      const pregunta = String(j.pregunta ?? "").slice(0, 500);
      if (!pregunta) return NextResponse.json({ error: "Sin pregunta" }, { status: 400 });
      const r = await client.beta.messages.create({
        ...base,
        system: "Eres el asistente de la gerencia de 720 GYM CLUB. Responde a la pregunta usando SOLO los datos del CRM que te pasan (JSON). Cifras exactas, en euros con formato español, en 1-4 frases. Si el dato no está, dilo. Son datos de demostración.",
        messages: [{ role: "user", content: [{ type: "text", text: `Datos del CRM:\n${datos}`, cache_control: { type: "ephemeral" } }, { type: "text", text: `Pregunta: ${pregunta}` }] }],
      });
      const texto = r.content.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text").map((b) => b.text).join("\n").trim();
      if (r.stop_reason === "refusal" || !texto) return NextResponse.json({ motor: "local" });
      return NextResponse.json({ motor: "claude", texto });
    }

    const r = await client.beta.messages.create({
      ...base,
      system: "Redactas mensajes de WhatsApp de 720 GYM CLUB (Ourense) para recuperar clientes. Cercano, tuteando, 2-3 frases, sin culpabilizar, con una propuesta concreta (volver esta semana, una clase, revisar su plan o regularizar la cuota con facilidades). Firma «Brais, 720». Solo el texto del mensaje.",
      messages: [{ role: "user", content: `Cliente (JSON): ${datos}` }],
    });
    const texto = r.content.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text").map((b) => b.text).join("\n").trim();
    if (r.stop_reason === "refusal" || !texto) return NextResponse.json({ motor: "local" });
    return NextResponse.json({ motor: "claude", texto });
  } catch (e) {
    if (e instanceof Anthropic.APIError) console.error("ia-crm: error de la API", e.status);
    return NextResponse.json({ motor: "local" });
  }
}
