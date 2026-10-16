/**
 * Validación de franjas horarias («de 09:30 a 13:30»), compartida por el editor (para avisar antes
 * de enviar) y por las Server Actions (que son las que mandan: lo del navegador se puede saltar).
 */
export interface Franja {
  inicio: string;
  fin: string;
}

export const HORA_HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export function aMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(":");
  return Number(h) * 60 + Number(m);
}

/**
 * Devuelve el primer problema de las franjas de UN día, o `null` si están bien. Que dos franjas se
 * toquen (13:30–13:30) vale; que se pisen, no: el motor de huecos las uniría y Andrea no vería
 * el error que tecleó.
 */
export function problemaFranjas(franjas: Franja[], nombreDia: string): string | null {
  for (const f of franjas) {
    if (!HORA_HHMM.test(f.inicio) || !HORA_HHMM.test(f.fin)) {
      return `${nombreDia}: falta alguna hora o no tiene el formato HH:MM.`;
    }
    if (aMinutos(f.fin) <= aMinutos(f.inicio)) {
      return `${nombreDia}: la hora de fin (${f.fin}) tiene que ser posterior a la de inicio (${f.inicio}).`;
    }
  }
  const ordenadas = [...franjas].sort((a, b) => aMinutos(a.inicio) - aMinutos(b.inicio));
  for (let i = 1; i < ordenadas.length; i++) {
    const previa = ordenadas[i - 1]!;
    const actual = ordenadas[i]!;
    if (aMinutos(actual.inicio) < aMinutos(previa.fin)) {
      return `${nombreDia}: las franjas ${previa.inicio}–${previa.fin} y ${actual.inicio}–${actual.fin} se pisan.`;
    }
  }
  return null;
}

/** Ordena las franjas por hora de inicio, que es como se leen. */
export function ordenarFranjas(franjas: Franja[]): Franja[] {
  return [...franjas].sort((a, b) => aMinutos(a.inicio) - aMinutos(b.inicio));
}
