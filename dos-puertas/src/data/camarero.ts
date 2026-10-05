/**
 * El camarero virtual: preguntas fijas con respuestas ya escritas a partir de lo que cuenta la
 * propia web (horario, carta, vinos, historia, preguntas frecuentes y reseñas). Sin IA y sin
 * servidor: todo pasa en el navegador. Los textos, en cuatro idiomas, están en `src/i18n/camarero/`;
 * aquí, el orden, los grupos, los botones de cada respuesta y qué preguntas se sugieren después.
 *
 * Lo que no está confirmado con la casa lleva `pending` y el chat lo marca, igual que en la web.
 */
export const CAMARERO_IDS = [
  "ahora",
  "horario",
  "donde",
  "telefono",
  "reservar",
  "mesas",
  "gente",
  "recomienda",
  "precio",
  "calamares",
  "chicharrones",
  "tortilla",
  "vinos",
  "canas",
  "pagar",
  "llevar",
  "alergenos",
  "perro",
  "historia",
  "nombre",
  "famosos",
] as const;
export type CamareroId = (typeof CAMARERO_IDS)[number];

/* Los botones que puede llevar una respuesta. */
export type CamareroAccion = "call" | "maps" | "carta" | "vinos" | "historia" | "visita" | "preguntas";

export const CAMARERO: Record<CamareroId, { acciones?: CamareroAccion[]; pending?: boolean; luego: CamareroId[] }> = {
  ahora: { acciones: ["visita"], luego: ["donde", "recomienda", "gente"] },
  horario: { acciones: ["visita"], luego: ["ahora", "reservar", "gente"] },
  donde: { acciones: ["maps", "visita"], luego: ["horario", "reservar", "recomienda"] },
  telefono: { acciones: ["call"], luego: ["horario", "donde", "reservar"] },
  reservar: { luego: ["mesas", "gente", "horario"] },
  mesas: { luego: ["reservar", "recomienda", "canas"] },
  gente: { luego: ["horario", "reservar", "recomienda"] },
  recomienda: { acciones: ["carta"], luego: ["calamares", "chicharrones", "precio"] },
  precio: { acciones: ["carta"], pending: true, luego: ["recomienda", "pagar", "canas"] },
  calamares: { acciones: ["historia"], luego: ["chicharrones", "tortilla", "famosos"] },
  chicharrones: { acciones: ["carta"], luego: ["calamares", "tortilla", "precio"] },
  tortilla: { acciones: ["carta"], luego: ["calamares", "chicharrones", "alergenos"] },
  vinos: { acciones: ["vinos"], pending: true, luego: ["canas", "recomienda", "precio"] },
  canas: { acciones: ["carta"], luego: ["vinos", "recomienda", "precio"] },
  pagar: { luego: ["precio", "llevar", "reservar"] },
  llevar: { acciones: ["call"], pending: true, luego: ["pagar", "alergenos", "recomienda"] },
  alergenos: { acciones: ["call"], pending: true, luego: ["tortilla", "llevar", "recomienda"] },
  perro: { pending: true, luego: ["mesas", "gente", "donde"] },
  historia: { acciones: ["historia"], luego: ["nombre", "famosos", "calamares"] },
  nombre: { acciones: ["historia"], luego: ["historia", "famosos", "mesas"] },
  famosos: { acciones: ["historia"], luego: ["calamares", "historia", "recomienda"] },
};

/* Las que se ofrecen nada más abrir el chat. */
export const CAMARERO_INICIO: readonly CamareroId[] = ["ahora", "recomienda", "donde", "precio", "reservar", "vinos"];

/* «Ver todas las preguntas», por temas. Entre todos los grupos están todas las preguntas. */
export type CamareroGrupo = "lugar" | "funciona" | "pinchos" | "beber" | "casa";
export const CAMARERO_GRUPOS: readonly { id: CamareroGrupo; items: readonly CamareroId[] }[] = [
  { id: "lugar", items: ["ahora", "horario", "donde", "telefono"] },
  { id: "funciona", items: ["reservar", "mesas", "gente", "pagar", "llevar", "perro"] },
  { id: "pinchos", items: ["recomienda", "precio", "calamares", "chicharrones", "tortilla", "alergenos"] },
  { id: "beber", items: ["vinos", "canas"] },
  { id: "casa", items: ["historia", "nombre", "famosos"] },
];

/** Minúsculas, sin tildes ni signos: para comparar lo que se escribe con las palabras clave. */
export function normaliza(text: string) {
  return ` ${text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

/**
 * La pregunta que mejor encaja con lo escrito. Cada clave cuenta si aparece al principio de una
 * palabra («reserv» vale para reserva, reservar, reservamos…); las de tres letras o menos, solo
 * como palabra entera («can» no es «canto»). Las claves largas pesan más. `null` si no encaja.
 */
export function buscaPregunta(text: string, claves: Record<CamareroId, readonly string[]>): CamareroId | null {
  const t = normaliza(text);
  let best: CamareroId | null = null;
  let bestScore = 0;
  for (const id of CAMARERO_IDS) {
    let score = 0;
    for (const k of claves[id]) {
      const n = normaliza(k).trim();
      if (t.includes(n.length <= 3 ? ` ${n} ` : ` ${n}`)) score += n.length;
    }
    if (score > bestScore) {
      best = id;
      bestScore = score;
    }
  }
  return best;
}
