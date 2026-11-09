import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { accionesPara, responderLocal } from "@/lib/asistente-local";
import { negocio, pilates } from "@/data/negocio";

/**
 * ASISTENTE 720. Con ANTHROPIC_API_KEY en las variables de entorno de Vercel responde Claude con
 * los datos del negocio; sin clave (o si falla), el motor local con las mismas respuestas.
 * La clave nunca va en el código: el repositorio es público.
 */
const SISTEMA = `Eres el asistente de la web de 720 GYM CLUB, un gimnasio de Ourense. Hablas en español de España, tuteas, con frases cortas, cercanas y motivadoras, sin postureo ni culto al cuerpo. Responde en 2-4 frases como mucho, sin listas largas ni markdown.

Tu objetivo: resolver la duda y, cuando encaje, invitar a dar el siguiente paso (clase de prueba gratis, darse de alta online o escribir por WhatsApp). Nunca inventes datos: si no sabes algo (precio no publicado, horario concreto de una clase, nombres), dilo y sugiere escribir por WhatsApp al ${negocio.whatsappVisible}.

DATOS (dosier oficial 2025-26):
- Dirección: ${negocio.direccion.completa}. Varias líneas de autobús y aparcamiento fácil.
- Horario: ${negocio.horario.texto}, 365 días, festivos incluidos. Aforo limitado y acceso controlado. Más de 1.000 m².
- Teléfono ${negocio.telefonoVisible}, WhatsApp ${negocio.whatsappVisible}, email ${negocio.email}, Instagram ${negocio.instagramUsuario}. 5,0 en Google (64 reseñas).
- Zonas: máquinas, peso libre, powerlifting (material de competición), cardio, funcional, estiramiento, Pilates y yoga.
- Gimnasio libre 35 €/mes (oferta de apertura). Entrada de un día 5 €. Supervisión en grupo 45 €/mes (acceso + 1 h/mes supervisada, máx. 10). Paquete Inicio 75 € (valoración, plan, 1 sesión personal de 1 h y 1 mes de acceso; solo 10 plazas). Pases temporales: precio no publicado.
- Entrenamiento personal: 1 sesión + valoración 35 €. Bonos individuales: 2 por 65 €, 5 por 150 €, 10 por 270 € (recomendado), 15 por 375 €. Pareja: bono 10 a 21,5 €/atleta; trío 19 €/atleta; grupo de 4 16,5 €/atleta. Bonos no caducan, aviso de 24 h para cambiar, cuota incluida en las sesiones, material online y dudas por WhatsApp.
- 720 Pilates (WhatsApp ${pilates.whatsappVisible}): Reformer 55/95/127 €/mes (1/2/3 días), Mat Integral 40/57/87 €/mes, Mixto desde 78 €/mes, Hipopresivos 35 €/mes (1 día) o 55 € (2 días), sesión suelta 15 €. Sin matrícula, primera clase gratis, grupos reducidos por niveles, clases recuperables en el mes. Sesiones de 50 min (Hipopresivos 30 min).
- 720 Yoga, CrossGym 720 y 720 Powerlifting: precio no publicado.
- Clubes que entrenan dentro: Clube Ximnasia Burgas (acrobacia), Capoeira Ourense Andaruê, BJJ Mambises, Halterofilia.
- 720P: alquiler de espacios para profesionales (cursos, talleres, eventos, clinics).
- Pagos: online con tarjeta, Apple Pay o Google Pay; las cuotas se cobran del 1 al 7.
- Equipo: Brais (gerente y entrenador principal), Bea (instructora de Pilates), Pablo (entrenador).
- Normas de la casa: «Si puedes levantarlo, puedes bajarlo», «Busca mejorar tu versión y evita las comparaciones», «Deja los problemas y el ego fuera», «Recuerda que somos una familia».`;

interface Entrada {
  rol: "usuario" | "asistente";
  texto: string;
}

export async function POST(req: Request) {
  let mensajes: Entrada[] = [];
  try {
    const j = (await req.json()) as { mensajes?: Entrada[] };
    mensajes = (j.mensajes ?? []).slice(-10).map((m) => ({ rol: m.rol === "asistente" ? "asistente" : "usuario", texto: String(m.texto ?? "").slice(0, 800) }));
  } catch {
    return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  }
  const ultima = [...mensajes].reverse().find((m) => m.rol === "usuario")?.texto ?? "";
  if (!ultima) return NextResponse.json({ error: "Sin pregunta" }, { status: 400 });

  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ ...responderLocal(ultima), motor: "local" });

  // El historial debe empezar por el usuario.
  while (mensajes.length && mensajes[0].rol !== "usuario") mensajes.shift();
  const client = new Anthropic();
  try {
    const r = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 1024,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } }],
      messages: mensajes.map((m) => ({ role: m.rol === "usuario" ? "user" : "assistant", content: m.texto })),
    });
    if (r.stop_reason === "refusal") return NextResponse.json({ ...responderLocal(ultima), motor: "local" });
    const texto = r.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (!texto) return NextResponse.json({ ...responderLocal(ultima), motor: "local" });
    return NextResponse.json({ texto, acciones: accionesPara(ultima), motor: "claude" });
  } catch (e) {
    if (e instanceof Anthropic.APIError) console.error("asistente: error de la API", e.status);
    return NextResponse.json({ ...responderLocal(ultima), motor: "local" });
  }
}
