"use client";

import { useSyncExternalStore } from "react";

/* ─────────────────────────────────────────────────────────────
   PROGRESO · lo que Adrián lleva hecho, guardado en su navegador

   No hay servidor ni cuentas: todo va a localStorage. Es suficiente para que
   una persona estudie en su móvil, y no hay datos personales que proteger.
   Si borra los datos del navegador o cambia de móvil, empieza de cero.
   ───────────────────────────────────────────────────────────── */

const CLAVE = "estudio-adrian:v1";
const MAX_HISTORIAL = 100;

export type EstadoPregunta = {
  aciertos: number;
  fallos: number;
  /** Si la última vez que salió la acertó. Lo que manda para el repaso de fallos. */
  ultimaBien: boolean;
};

export type Modo = "tema" | "examen" | "fallos";
/** Examen con corrección al final y reloj, o en modo estudio (corrección al momento). */
export type Correccion = "examen" | "estudio";
/** Preguntas salteadas o en el orden del temario. */
export type Orden = "aleatorio" | "temario";

export type TestHecho = {
  fecha: number;
  modo: Modo;
  temaId?: string;
  aciertos: number;
  total: number;
  /** Solo en examen. */
  correccion?: Correccion;
  /** Solo en examen. */
  aprobado?: boolean;
  segundos: number;
};

export type Progreso = {
  preguntas: Record<string, EstadoPregunta>;
  historial: TestHecho[];
  ajustes: { orden: Orden };
};

const VACIO: Progreso = { preguntas: {}, historial: [], ajustes: { orden: "aleatorio" } };

let cacheTexto: string | null = null;
let cacheValor: Progreso = VACIO;
const oyentes = new Set<() => void>();

function leer(): Progreso {
  let texto: string | null = null;
  try {
    texto = localStorage.getItem(CLAVE);
  } catch {
    return cacheValor;
  }
  if (texto === cacheTexto) return cacheValor;
  cacheTexto = texto;
  try {
    const p = texto ? (JSON.parse(texto) as Partial<Progreso>) : {};
    cacheValor = { preguntas: p.preguntas ?? {}, historial: p.historial ?? [], ajustes: { ...VACIO.ajustes, ...p.ajustes } };
  } catch {
    cacheValor = VACIO;
  }
  return cacheValor;
}

function escribir(p: Progreso) {
  cacheValor = p;
  try {
    cacheTexto = JSON.stringify(p);
    localStorage.setItem(CLAVE, cacheTexto);
  } catch {
    /* Navegación privada o almacenamiento lleno: se sigue en memoria. */
  }
  oyentes.forEach((f) => f());
}

function suscribir(f: () => void) {
  oyentes.add(f);
  const enStorage = (e: StorageEvent) => e.key === CLAVE && f();
  window.addEventListener("storage", enStorage);
  return () => {
    oyentes.delete(f);
    window.removeEventListener("storage", enStorage);
  };
}

/** El progreso de ahora mismo, fuera de React (para montar un test). */
export const leerProgreso = leer;

export function useProgreso(): Progreso {
  return useSyncExternalStore(suscribir, leer, () => VACIO);
}

export function registrarRespuesta(preguntaId: string, bien: boolean) {
  const p = leer();
  const antes = p.preguntas[preguntaId] ?? { aciertos: 0, fallos: 0, ultimaBien: false };
  escribir({
    ...p,
    preguntas: {
      ...p.preguntas,
      [preguntaId]: {
        aciertos: antes.aciertos + (bien ? 1 : 0),
        fallos: antes.fallos + (bien ? 0 : 1),
        ultimaBien: bien,
      },
    },
  });
}

export function registrarTest(t: TestHecho) {
  const p = leer();
  escribir({ ...p, historial: [t, ...p.historial].slice(0, MAX_HISTORIAL) });
}

export function guardarOrden(orden: Orden) {
  const p = leer();
  escribir({ ...p, ajustes: { ...p.ajustes, orden } });
}

/** Borra respuestas e historial; los ajustes se quedan. */
export function borrarProgreso() {
  escribir({ ...VACIO, ajustes: leer().ajustes });
}

/** Ids de las preguntas que ha fallado alguna vez, aunque luego las acertara. */
export function idsFalladasAlgunaVez(p: Progreso): string[] {
  return Object.entries(p.preguntas)
    .filter(([, e]) => e.fallos > 0)
    .map(([id]) => id);
}

/** Ids de las preguntas cuya última respuesta fue un fallo. */
export function idsFalladas(p: Progreso): string[] {
  return Object.entries(p.preguntas)
    .filter(([, e]) => !e.ultimaBien)
    .map(([id]) => id);
}
