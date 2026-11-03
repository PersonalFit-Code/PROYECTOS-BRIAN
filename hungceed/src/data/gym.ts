/**
 * Hungceed GYM (La Pobla Llarga, Valencia). Tarifas tal cual están hoy en su tienda de Virtuagym
 * (hungceed.es/gym, revisada el 3/11/2026).
 *
 * «Apúntate» lleva a la webshop de Virtuagym del club. PENDIENTE con Jose: el enlace directo de cada
 * tarifa (Virtuagym lo da por membresía), el horario y la dirección exacta.
 */
export const GYM = {
  nombre: "Hungceed GYM",
  localidad: "La Pobla Llarga (Valencia)",
  telefono: { display: "621 22 18 20", tel: "tel:+34621221820" },
  virtuagym: "https://hungceedgym.virtuagym.com/webshop/?club=MHZIc3BVejY3TXl5OWFjWEFwbVo4dz09",
  contacto: "https://hungceedgym.virtuagym.com/club/hungceed-gym/contact",
  /* Fotos de atletas de su web. */
  fotos: {
    portada: "https://hungceed.es/wp-content/uploads/2026/04/Rodri-Hungceed-9-1024x683.jpg",
    secundaria: "https://hungceed.es/wp-content/uploads/2026/03/Pau-Hungceed-49-683x1024.jpg",
  },
} as const;

export const ZONAS = [
  { titulo: "Sala de musculación", texto: "Material de fuerza para entrenar a tu ritmo, con acceso libre." },
  { titulo: "Entrenamiento funcional", texto: "Clases en grupo para ganar fuerza, resistencia y movilidad." },
  { titulo: "Grupos semipersonales", texto: "Grupos reducidos con entrenador: atención casi individual a menos precio." },
  { titulo: "Entrenador personal", texto: "Sesiones 1:1 con un plan hecho para ti." },
] as const;

export interface Tarifa {
  nombre: string;
  precio: number;
  /** Lo que se ve debajo del precio. */
  periodo: string;
  /** La más barata por mes o por sesión del grupo (dato, no opinión). */
  ahorro?: boolean;
}

export interface GrupoTarifas {
  id: string;
  titulo: string;
  descripcion: string;
  tarifas: Tarifa[];
}

export const TARIFAS: GrupoTarifas[] = [
  {
    id: "musculacion",
    titulo: "Musculación",
    descripcion: "Acceso libre a la sala de musculación.",
    tarifas: [
      { nombre: "1 mes", precio: 40, periodo: "al mes" },
      { nombre: "3 meses", precio: 112, periodo: "37,33 €/mes" },
      { nombre: "6 meses", precio: 210, periodo: "35 €/mes" },
      { nombre: "1 año", precio: 390, periodo: "32,50 €/mes", ahorro: true },
    ],
  },
  {
    id: "pases",
    titulo: "Pases y bonos",
    descripcion: "Para entrenar sin cuota mensual.",
    tarifas: [
      { nombre: "Pase de 1 día", precio: 8, periodo: "un día" },
      { nombre: "Bono fin de semana", precio: 28, periodo: "8 días" },
      { nombre: "Bono 10 días", precio: 40, periodo: "10 días de musculación" },
    ],
  },
  {
    id: "funcional",
    titulo: "Funcional",
    descripcion: "Clases de entrenamiento funcional.",
    tarifas: [
      { nombre: "4 sesiones", precio: 30, periodo: "al mes" },
      { nombre: "12 sesiones", precio: 55, periodo: "al mes", ahorro: true },
    ],
  },
  {
    id: "semipersonal",
    titulo: "Semipersonal",
    descripcion: "Grupos reducidos con entrenador.",
    tarifas: [
      { nombre: "4 sesiones", precio: 36, periodo: "al mes" },
      { nombre: "8 sesiones", precio: 64, periodo: "al mes" },
      { nombre: "12 sesiones", precio: 84, periodo: "al mes", ahorro: true },
    ],
  },
  {
    id: "personal",
    titulo: "Entrenador personal",
    descripcion: "Sesiones individuales 1:1.",
    tarifas: [
      { nombre: "1 sesión", precio: 30, periodo: "por sesión" },
      { nombre: "4 sesiones", precio: 95, periodo: "23,75 €/sesión" },
      { nombre: "8 sesiones", precio: 180, periodo: "22,50 €/sesión", ahorro: true },
    ],
  },
];
