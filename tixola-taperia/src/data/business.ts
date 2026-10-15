/**
 * Datos maestros del negocio.
 * Fuente: ficha de Google Business (4,4 ★ · 858 reseñas · 10-20 €), TripAdvisor (4,2 · 233 opiniones,
 * nº 19 de 496 restaurantes de Ourense, Travellers' Choice) y toppingsandsalads.es.
 *
 * Horario tomado de la ficha de Google Business (coincide con Wanderlog y prensa local); TripAdvisor muestra
 * otro horario desactualizado. `hours` es lo único que alimenta el indicador "Abierto ahora" y el JSON-LD.
 */
import { SITE_URL } from "@/lib/siteUrl";

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface TimeRange {
  /** "HH:MM" en hora local de Ourense (Europe/Madrid) */
  open: string;
  close: string;
}

export const BUSINESS = {
  name: "Tixola Tapería",
  legalName: "Tixola Tapería Vinoteca",
  tagline: "El Arte del Tapeo en el Corazón de Ourense",
  subtitle:
    "Zamburiñas a la plancha, pulpo tradicional y vinos de la zona junto a la Catedral.",
  description:
    "Tapas típicas gallegas de alta calidad, cerveza artesanal y vinos de la zona en un bar vistoso con terraza, a escasos metros de la Catedral de Ourense.",
  address: {
    street: "Rúa Juan de Austria, 7",
    postalCode: "32005",
    city: "Ourense",
    region: "Galicia",
    country: "ES",
    full: "Rúa Juan de Austria, 7, 32005 Ourense",
    plusCode: "84PP+MM Ourense",
    landmark: "A 1 minuto a pie de la Catedral de San Martiño",
  },
  geo: { lat: 42.33668, lng: -7.863365 },
  phone: {
    display: "646 45 72 74",
    e164: "+34646457274",
    tel: "tel:+34646457274",
    /* El texto va dentro de la URL y sale ya escrito en WhatsApp de quien pulsa. Decía "quiero
       reservar mesa"; como no se reserva, ahora abre una consulta neutra que sirve para cualquier
       cosa (horario, grupos, alérgenos). */
    whatsapp: "https://wa.me/34646457274?text=Hola%2C%20tengo%20una%20consulta%20sobre%20Tixola%20Taper%C3%ADa",
  },
  website: SITE_URL,
  priceRange: "10 € – 20 €",
  priceRangeSchema: "€€",
  timezone: "Europe/Madrid",
  social: {
    googleMaps: "https://www.google.com/maps/search/?api=1&query=Tixola+taper%C3%ADa+Ourense",
    directions:
      "https://www.google.com/maps/dir/?api=1&destination=42.33668,-7.863365&travelmode=walking",
    tripadvisor:
      "https://www.tripadvisor.es/Restaurant_Review-g644337-d8358055-Reviews-Tixola_taperia_vinoteca-Ourense_Province_of_Ourense_Galicia.html",
    googleReviews: "https://www.google.com/maps/search/?api=1&query=Tixola+taper%C3%ADa+R%C3%BAa+Juan+de+Austria+7+Ourense",
  },
  ratings: {
    google: { value: 4.4, count: 858, label: "Google" },
    tripadvisor: { value: 4.2, count: 233, label: "TripAdvisor", rank: 19, total: 496, award: "Travellers' Choice" },
  },
  features: [
    "Terraza con vistas a la Catedral",
    /* DECÍA "Opciones veganas y vegetarianas" y era falso: de los 47 platos, doce están etiquetados
       "vegetariano" y NINGUNO "vegano". Anunciar una opción que no existe es presentación que induce
       a error (art. 18.2 TRLGDCU) y, además, quien es vegano se entera al sentarse. La propia web ya
       lo decía bien en las preguntas frecuentes. Si algún día hay un plato vegano de verdad, se
       etiqueta en `menu.ts` y esta línea vuelve a nombrarlo. */
    "Opciones vegetarianas",
    "Croquetas sin gluten",
    "Vinoteca con D.O. gallegas",
    "Cerveza artesanal",
    "Se aceptan tarjetas",
  ],
  /**
   * Horario. Cada día admite varios tramos (comida / cena).
   * Vacío = cerrado.
   */
  hours: {
    /* Fuente: Tatiana, 15-10-2026, en persona. Da la vuelta a lo que había: el día de cierre YA NO
       es el domingo sino el LUNES, el domingo se abre solo a mediodía, y las cenas rematan a las
       23:45 y no a medianoche. Sigue corrigiendo a la ficha de Google, que da las 12:00 de apertura.
       SÁBADO: se puso a 23:45 por prudencia, porque ella había dicho "entre semana" y el sábado no
       lo es. CONFIRMADO el 15-10-2026: el sábado también cierra a las 23:45. */
    mon: [],
    tue: [
      { open: "13:00", close: "16:00" },
      { open: "20:00", close: "23:45" },
    ],
    wed: [
      { open: "13:00", close: "16:00" },
      { open: "20:00", close: "23:45" },
    ],
    thu: [
      { open: "13:00", close: "16:00" },
      { open: "20:00", close: "23:45" },
    ],
    fri: [
      { open: "13:00", close: "16:00" },
      { open: "20:00", close: "23:45" },
    ],
    sat: [
      { open: "13:00", close: "16:00" },
      { open: "20:00", close: "23:45" },
    ],
    /* Solo mediodía, y remata a las 15:45. */
    sun: [{ open: "13:00", close: "15:45" }],
  } satisfies Record<DayKey, TimeRange[]>,
} as const;

export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Lunes",
  tue: "Martes",
  wed: "Miércoles",
  thu: "Jueves",
  fri: "Viernes",
  sat: "Sábado",
  sun: "Domingo",
};

export const NAV_LINKS = [
  { href: "/#platos", label: "Platos estrella" },
  { href: "/carta", label: "Carta" },
  { href: "/#experiencia", label: "Ubicación" },
  { href: "/#opiniones", label: "Opiniones" },
] as const;
