import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { SISTEMA, SISTEMA_HERRAMIENTAS } from "@/lib/asistente-sistema";
import { herramientas } from "@/lib/asistente-herramientas";

/**
 * ASISTENTE 720 con herramientas. El navegador manda la conversación en formato de la API; aquí
 * se llama a Claude con las herramientas (reservar, alta, ficha, aviso, plan…) y se devuelve su
 * respuesta tal cual. Si pide herramientas, el navegador las ejecuta y vuelve con los resultados
 * (bucle de tool use). Sin ANTHROPIC_API_KEY responde { motor: "local" } y el navegador usa el
 * motor local. La clave va en las variables de entorno de Vercel, nunca en el código.
 */
type Mensaje = Anthropic.Beta.BetaMessageParam;

const MAX_MENSAJES = 48;
const MAX_IMAGEN = 1_600_000; // caracteres base64 (~1,2 MB)
const MAX_IMAGENES = 4;
const TIPOS_USUARIO = new Set(["text", "image", "tool_result"]);

/** Valida lo que llega del navegador: roles, tipos de bloque, tamaños. */
function validar(entrada: unknown): Mensaje[] | null {
  if (!Array.isArray(entrada) || !entrada.length || entrada.length > MAX_MENSAJES) return null;
  let imagenes = 0;
  for (const m of entrada) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content === "string") {
      if (content.length > 2000) return null;
      continue;
    }
    if (!Array.isArray(content) || !content.length) return null;
    for (const b of content) {
      const tipo = (b as { type?: unknown })?.type;
      if (typeof tipo !== "string") return null;
      if (role === "user" && !TIPOS_USUARIO.has(tipo)) return null;
      if (tipo === "text" && String((b as { text?: unknown }).text ?? "").length > 2000 && role === "user") return null;
      if (tipo === "image") {
        const src = (b as { source?: { type?: string; media_type?: string; data?: string } }).source;
        if (src?.type !== "base64" || !["image/jpeg", "image/png", "image/webp"].includes(src.media_type ?? "") || (src.data ?? "").length > MAX_IMAGEN) return null;
        if (++imagenes > MAX_IMAGENES) return null;
      }
    }
  }
  if ((entrada[0] as { role: string }).role !== "user") return null;
  return entrada as Mensaje[];
}

export async function POST(req: Request) {
  let mensajes: Mensaje[] | null = null;
  try {
    const j = (await req.json()) as { mensajes?: unknown };
    mensajes = validar(j.mensajes);
  } catch {}
  if (!mensajes) return NextResponse.json({ error: "Petición no válida" }, { status: 400 });

  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ motor: "local" });

  const client = new Anthropic();
  try {
    const r = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 8000,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      // Herramientas + instrucciones: prefijo estable, en caché (la marca va en el último bloque).
      tools: herramientas,
      system: [
        { type: "text", text: SISTEMA },
        { type: "text", text: SISTEMA_HERRAMIENTAS, cache_control: { type: "ephemeral" } },
      ],
      messages: mensajes,
    });

    if (r.stop_reason === "refusal") return NextResponse.json({ motor: "local" });
    const texto = r.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    const usos = r.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    return NextResponse.json({
      motor: "claude",
      contenido: r.content,
      texto,
      herramientas: r.stop_reason === "tool_use" ? usos.map((u) => ({ id: u.id, nombre: u.name, entrada: u.input })) : [],
      // Si se cortó a mitad de una herramienta, el siguiente turno empieza conversación nueva.
      reiniciar: r.stop_reason !== "tool_use" && usos.length > 0,
    });
  } catch (e) {
    if (e instanceof Anthropic.APIError) console.error("asistente: error de la API", e.status);
    return NextResponse.json({ motor: "local" });
  }
}
