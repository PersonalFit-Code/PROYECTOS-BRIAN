import { EXAMEN, PREGUNTAS_POR_TEST_DE_TEMA, TEMAS, TODAS_LAS_PREGUNTAS, temaPorId, type Pregunta } from "@/data/temario";
import { idsFalladas, idsFalladasAlgunaVez, type Modo, type Orden, type Progreso } from "@/lib/progreso";

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
 * a lo que pesa cada uno: no puede salir todo de un tema. Si el examen es de
 * todas las preguntas, salen todas.
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

/** Posición de cada pregunta en el temario, para el orden «por temario». */
const POSICION = new Map(TODAS_LAS_PREGUNTAS.map((p, i) => [p.id, i]));

function ordenar(preguntas: Pregunta[], orden: Orden): Pregunta[] {
  if (orden === "aleatorio") return preguntas;
  return [...preguntas].sort((a, b) => POSICION.get(a.id)! - POSICION.get(b.id)!);
}

/** Qué preguntas salen las decide el modo; en qué orden, el ajuste de Adrián (salteadas o por temario). */
/**
 * Test de errores: `pendientes` son las que falló la última vez; `todas`, las
 * que ha fallado alguna vez aunque ya las acierte (para asegurarlas).
 */
export type Errores = "pendientes" | "todas";

export function crearTest(modo: Modo, temaId: string | undefined, progreso: Progreso, errores: Errores = "pendientes"): Pregunta[] {
  const orden = progreso.ajustes.orden;
  if (modo === "examen") return ordenar(preguntasDeExamen(), orden);
  if (modo === "fallos") {
    const ids = new Set(errores === "todas" ? idsFalladasAlgunaVez(progreso) : idsFalladas(progreso));
    return ordenar(barajar(TODAS_LAS_PREGUNTAS.filter((p) => ids.has(p.id))), orden);
  }
  const tema = temaId ? temaPorId(temaId) : undefined;
  return tema ? ordenar(priorizar(tema.preguntas, progreso, PREGUNTAS_POR_TEST_DE_TEMA), orden) : [];
}

export const LETRAS = ["A", "B", "C", "D", "E", "F"];

export function formatoTiempo(segundos: number): string {
  const s = Math.max(0, Math.round(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
