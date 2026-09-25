/**
 * Datos maestros del negocio.
 * Fuente: ficha de Google Business (4,4 ★ · 858 reseñas · 10-20 €), TripAdvisor (4,2 · 233 opiniones,
 * nº 19 de 496 restaurantes de Ourense, Travellers' Choice) y toppingsandsalads.es.
 *
 * Horario tomado de la ficha de Google Business (coincide con Wanderlog y prensa local); TripAdvisor muestra
 * otro horario desactualizado. `hours` es lo único que alimenta el indicador "Abierto ahora" y el JSON-LD.
 */

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
    "Zamburiñas a la plancha, pulpo tradicional y los mejores vinos junto a la Catedral.",
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
    whatsapp: "https://wa.me/34646457274?text=Hola%2C%20quiero%20reservar%20mesa%20en%20Tixola%20Taper%C3%ADa",
  },
  website: "https://tixola.restaurantesourense.com",
  priceRange: "10 € – 20 €",
  priceRangeSchema: "€€",
  timezone: "Europe/Madrid",
  social: {
    googleMaps: "https://www.google.com/maps/search/?api=1&query=Tixola+taper%C3%ADa+Ourense&query_place_id=",
    directions:
      "https://www.google.com/maps/dir/?api=1&destination=42.33668,-7.863365&destination_place_id=&travelmode=walking",
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
    "Opciones veganas y vegetarianas",
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
    // Fuente: ficha de Google Business (sept. 2026). Lunes solo cenas; domingo cerrado.
    mon: [{ open: "19:30", close: "00:00" }],
    tue: [
      { open: "12:00", close: "16:00" },
      { open: "20:00", close: "00:00" },
    ],
    wed: [
      { open: "12:00", close: "16:00" },
      { open: "20:00", close: "00:00" },
    ],
    thu: [
      { open: "12:00", close: "16:00" },
      { open: "20:00", close: "00:00" },
    ],
    fri: [
      { open: "12:00", close: "16:00" },
      { open: "20:00", close: "00:00" },
    ],
    sat: [
      { open: "12:00", close: "16:00" },
      { open: "20:00", close: "00:00" },
    ],
    sun: [],
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
