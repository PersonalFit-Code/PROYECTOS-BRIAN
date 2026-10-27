import { EXAMEN, PREGUNTAS_POR_TEST_DE_TEMA, TEMAS, TODAS_LAS_PREGUNTAS, temaPorId, type Pregunta } from "@/data/temario";
import { idsFalladas, type Modo, type Progreso } from "@/lib/progreso";

export function barajar<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * En un test de tema salen primero las preguntas que nunca ha visto o que
 * falló la última vez; las que ya domina rellenan si sobra hueco. Así cada
 * test nuevo enseña algo en vez de repetir lo que ya sabe.
 */
function priorizar(preguntas: Pregunta[], progreso: Progreso, cuantas: number): Pregunta[] {
  const pendientes = preguntas.filter((p) => !progreso.preguntas[p.id]?.ultimaBien);
  const sabidas = preguntas.filter((p) => progreso.preguntas[p.id]?.ultimaBien);
  return [...barajar(pendientes), ...barajar(sabidas)].slice(0, cuantas);
}

/**
 * El examen reparte las preguntas entre todos los temas de forma proporcional
 * a lo que pesa cada uno, como el teórico: no puede salir todo de un tema.
 */
function preguntasDeExamen(): Pregunta[] {
  const total = Math.min(EXAMEN.preguntas, TODAS_LAS_PREGUNTAS.length);
  const elegidas: Pregunta[] = [];
  const resto: Pregunta[] = [];
  for (const t of TEMAS) {
    const cupo = Math.floor((t.preguntas.length / TODAS_LAS_PREGUNTAS.length) * total);
    const mezcla = barajar(t.preguntas);
    elegidas.push(...mezcla.slice(0, cupo));
    resto.push(...mezcla.slice(cupo));
  }
  elegidas.push(...barajar(resto).slice(0, total - elegidas.length));
  return barajar(elegidas);
}

export function crearTest(modo: Modo, temaId: string | undefined, progreso: Progreso): Pregunta[] {
  if (modo === "examen") return preguntasDeExamen();
  if (modo === "fallos") {
    const ids = new Set(idsFalladas(progreso));
    return barajar(TODAS_LAS_PREGUNTAS.filter((p) => ids.has(p.id)));
  }
  const tema = temaId ? temaPorId(temaId) : undefined;
  return tema ? priorizar(tema.preguntas, progreso, PREGUNTAS_POR_TEST_DE_TEMA) : [];
}

export const LETRAS = ["A", "B", "C", "D", "E", "F"];

export function formatoTiempo(segundos: number): string {
  const s = Math.max(0, Math.round(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
