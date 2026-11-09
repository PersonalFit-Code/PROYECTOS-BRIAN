import Anthropic from "@anthropic-ai/sdk";
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { SISTEMA } from "@/lib/asistente-sistema";

/**
 * EL MISMO ASISTENTE EN WHATSAPP (API de WhatsApp Business de Meta). PENDIENTE DE CONECTAR: hace
 * falta la cuenta de WhatsApp Business de 720 y estas variables en Vercel (nunca en el código):
 *   WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, WHATSAPP_VERIFY_TOKEN, WHATSAPP_APP_SECRET, ANTHROPIC_API_KEY
 *   (opcional) AVISO_WEBHOOK_URL para los avisos a la gerencia.
 * Webhook en Meta: https://<dominio>/api/whatsapp
 * Para reservar o pagar manda a la web (enlaces directos); en producción, con base de datos, las
 * herramientas de la web (reservar, alta, ficha) funcionan aquí igual y recuerda la conversación.
 */
const VERSION = process.env.WHATSAPP_API_VERSION ?? "v21.0";

/** Verificación del webhook (Meta llama con GET al configurarlo). */
export function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const token = process.env.WHATSAPP_VERIFY_TOKEN;
  if (token && p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === token) {
    return new Response(p.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

function firmaValida(cuerpo: string, firma: string | null) {
  const secreto = process.env.WHATSAPP_APP_SECRET;
  if (!secreto || !firma?.startsWith("sha256=")) return false;
  const esperada = Buffer.from(createHmac("sha256", secreto).update(cuerpo).digest("hex"));
  const recibida = Buffer.from(firma.slice(7));
  return esperada.length === recibida.length && timingSafeEqual(esperada, recibida);
}

const avisarGerente: Anthropic.Beta.BetaTool = {
  name: "avisar_gerente",
  description: "Avisa a la gerencia de 720 con un resumen: quejas, dudas que no puedes resolver, salud o lesiones, ventas grandes.",
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["motivo", "resumen"],
    properties: {
      motivo: { type: "string", enum: ["venta_grande", "queja", "duda_compleja", "lesion_o_salud", "otro"] },
      resumen: { type: "string", description: "Qué quiere el cliente y qué hay que hacer, en 2-3 frases." },
    },
  },
};

async function enviar(para: string, texto: string) {
  await fetch(`https://graph.facebook.com/${VERSION}/${process.env.WHATSAPP_PHONE_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: para, type: "text", text: { body: texto.slice(0, 4000) } }),
    signal: AbortSignal.timeout(8000),
  });
}

export async function POST(req: Request) {
  const cuerpo = await req.text();
  if (!firmaValida(cuerpo, req.headers.get("x-hub-signature-256"))) return new Response("Forbidden", { status: 403 });
  if (!process.env.ANTHROPIC_API_KEY || !process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_ID) return NextResponse.json({ ok: true, configurado: false });

  type Entrante = { from?: string; type?: string; text?: { body?: string } };
  let msg: Entrante | undefined;
  try {
    msg = JSON.parse(cuerpo)?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  } catch {}
  // Estados de entrega, lecturas, etc.: no hay nada que responder.
  if (!msg?.from) return NextResponse.json({ ok: true });
  if (msg.type !== "text" || !msg.text?.body) {
    await enviar(msg.from, "¡Gracias! De momento por aquí solo leo texto. Cuéntame qué necesitas y te ayudo.");
    return NextResponse.json({ ok: true });
  }

  const web = new URL(req.url).origin;
  const client = new Anthropic();
  const mensajes: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: msg.text.body.slice(0, 1500) }];
  try {
    for (let vuelta = 0; vuelta < 3; vuelta++) {
      const r = await client.beta.messages.create({
        model: "claude-opus-5-5",
        max_tokens: 2000,
        output_config: { effort: "low" },
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        tools: [avisarGerente],
        system: [
          { type: "text", text: SISTEMA },
          {
            type: "text",
            text: `CANAL: WhatsApp. Mensajes cortos, sin markdown. Para reservar plaza manda a ${web}/horario, para darse de alta a ${web}/alta, para la clase gratis a ${web}/clase-gratis. Usa avisar_gerente cuando toque y di que le escribirán pronto.`,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: mensajes,
      });
      const usos = r.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
      if (r.stop_reason !== "tool_use" || !usos.length) {
        const texto = r.content.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text").map((b) => b.text).join("\n").trim();
        await enviar(msg.from, r.stop_reason === "refusal" || !texto ? "Te paso con el equipo de 720 y te escriben enseguida." : texto);
        break;
      }
      mensajes.push({ role: "assistant", content: r.content });
      const resultados: Anthropic.Beta.BetaToolResultBlockParam[] = [];
      for (const u of usos) {
        const entrada = u.input as { motivo?: string; resumen?: string };
        if (process.env.AVISO_WEBHOOK_URL) {
          await fetch(process.env.AVISO_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tipo: "alerta", plan: entrada.motivo, comentario: entrada.resumen, telefono: msg.from, origen: "whatsapp 720gym", recibido: new Date().toISOString() }),
            signal: AbortSignal.timeout(6000),
          }).catch(() => {});
        }
        resultados.push({ type: "tool_result", tool_use_id: u.id, content: "Aviso enviado a la gerencia." });
      }
      mensajes.push({ role: "user", content: resultados });
    }
  } catch (e) {
    if (e instanceof Anthropic.APIError) console.error("whatsapp: error de la API", e.status);
    await enviar(msg.from, "Ahora mismo no puedo responder. Te escribe el equipo de 720 en un momento.").catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
