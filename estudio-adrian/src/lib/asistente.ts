import { TEMAS, TEMA_DE_PREGUNTA, TODAS_LAS_PREGUNTAS, type Pregunta } from "@/data/temario";

/* ─────────────────────────────────────────────────────────────
   ASISTENTE · lo que comparten el chat y la ruta /api/asistente
   ───────────────────────────────────────────────────────────── */

export const LIMITES = {
  /** Mensajes de la conversación que se mandan en cada pregunta (los más recientes). */
  maxMensajes: 20,
  /** Caracteres por mensaje. */
  maxCaracteres: 2000,
};

/** Modelo por defecto; se cambia con la variable ASISTENTE_MODEL en Vercel. */
export const MODELO_POR_DEFECTO = "claude-sonnet-5";

function respuesta(p: Pregunta): string {
  return p.opciones[p.correcta];
}

/** Una pregunta del temario como texto, para dársela al modelo. */
export function preguntaComoTexto(p: Pregunta): string {
  const tema = TEMA_DE_PREGUNTA[p.id];
  const lineas = [
    `[${p.id}] Tema ${tema?.numero}: ${tema?.titulo}`,
    `Enunciado: ${p.enunciado}`,
    p.opciones.length > 2 ? `Opciones: ${p.opciones.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join(" | ")}` : null,
    `Solución del curso: ${respuesta(p)}`,
    p.explicacion ? `Explicación: ${p.explicacion}` : null,
  ];
  return lineas.filter(Boolean).join("\n");
}

/**
 * El prompt del sistema. Es FIJO (no lleva fecha ni nada que cambie) para que
 * la caché de prompts acierte en cada pregunta: el temario entero va dentro.
 */
export function promptDelSistema(): string {
  return `Eres el asistente de estudio de Adrián para su curso de protección contra incendios (PCI). El curso tiene ${TEMAS.length} temas: ${TEMAS.map((t) => t.titulo).join(", ")}. Adrián estudia con una app de test tipo autoescuela y te pregunta las dudas que le surgen.

Cómo responder:
- En español, cercano y claro, como un buen profesor. Por defecto, corto: de 2 a 6 frases o una lista breve. Amplía solo si te lo pide.
- Texto plano. Puedes usar **negrita** para lo clave y listas con guiones. Nada de tablas, encabezados ni emojis.
- Se lee en el móvil: frases cortas y párrafos de 1 a 3 líneas.
- El marco es la normativa española de PCI: RIPCI (RD 513/2017), CTE DB-SI, RSCIEI (RD 2267/2004) y las normas UNE / UNE-EN (UNE-EN 3 extintores, UNE-EN 671 BIE, UNE-EN 54 y UNE 23007-14 detección). Da cifras y números de norma solo si estás seguro; si no lo estás, dilo y recomienda comprobarlo en la norma o con el profesor. No inventes.
- Abajo tienes las preguntas del examen del curso con su solución. Si la duda es sobre una de ellas, la solución del curso es lo que cuenta para el examen: explica por qué es así. Si crees que la solución del curso no encaja con la normativa, dilo con prudencia, deja claro qué hay que contestar en el examen y recomienda consultarlo con el profesor.
- Ayúdale a entender, no solo a memorizar: da el porqué, un truco para recordarlo o un ejemplo práctico cuando sirva.
- Si te pregunta algo que no tiene que ver con incendios ni con el curso, díselo con amabilidad y reconduce la conversación.
- Si hay un bloque «Pregunta que está mirando Adrián», es la pregunta del test desde la que ha abierto el chat: cuando diga «esta pregunta» o «por qué», se refiere a esa.

Preguntas del examen del curso, con su solución:

${TODAS_LAS_PREGUNTAS.map(preguntaComoTexto).join("\n\n")}`;
}

/** Respuesta sin modelo (no hay clave o se ha agotado el presupuesto): busca en el temario lo más parecido. */
export function respuestaSinConexion(texto: string, motivo: "sin-clave" | "sin-presupuesto" | "error"): string {
  const palabras = normalizar(texto)
    .split(/\W+/)
    .filter((w) => w.length > 3 && !VACIAS.has(w));
  const puntuadas = TODAS_LAS_PREGUNTAS.map((p) => {
    const hay = normalizar(`${p.enunciado} ${p.explicacion ?? ""} ${TEMA_DE_PREGUNTA[p.id]?.titulo ?? ""}`);
    return { p, puntos: palabras.filter((w) => hay.includes(w)).length };
  })
    .filter((x) => x.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, 3);

  const aviso =
    motivo === "sin-clave"
      ? "El asistente con IA todavía no está conectado (falta la clave de Anthropic en el servidor)."
      : motivo === "sin-presupuesto"
        ? "El asistente con IA ha llegado a su límite de uso por ahora. Prueba dentro de un rato."
        : "No he podido contactar con el asistente con IA. Prueba otra vez en un momento.";
  if (!puntuadas.length) return `${aviso}\n\nNo he encontrado nada en el temario que se parezca a tu pregunta.`;
  return `${aviso}\n\nMientras tanto, esto es lo que dice el temario sobre lo que preguntas:\n\n${puntuadas
    .map(({ p }) => `- ${p.enunciado.split("\n")[0]}\n  **${respuesta(p)}**${p.explicacion ? `. ${p.explicacion}` : ""}`)
    .join("\n\n")}`;
}

function normalizar(t: string): string {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const VACIAS = new Set(["para", "como", "cual", "cuales", "porque", "esta", "este", "esto", "donde", "cuando", "tiene", "tienen", "puede", "pueden", "debe", "deben", "sobre", "entre", "desde", "hasta", "segun", "pregunta", "verdadero", "falso", "explica", "explicame"]);
