/**
 * Datos del negocio. Fuente: brief del cliente (Brian, octubre 2026) salvo donde se indica.
 * Lo que no está confirmado lleva `pendiente` y la interfaz lo marca así.
 */
export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export interface TimeRange {
  open: string;
  close: string;
}

export const DAY_ORDER_WEEK: readonly DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const BUSINESS = {
  name: "Dos Puertas",
  legalName: "Café Bar Dos Puertas",
  founded: 1974,
  address: {
    street: "Rúa dos Fornos, 7",
    area: "Casco histórico · Zona de Os Viños",
    postalCode: "32005",
    city: "Ourense",
    region: "Galicia",
    country: "ES",
  },
  /* Aproximadas (rúa dos Fornos, junto a la catedral). PENDIENTE: fijar con la ficha de Google. */
  geo: { lat: 42.33705, lng: -7.86395 },
  phone: { display: "638 11 74 91", e164: "+34638117491" },
  /* TripAdvisor publica otro número (988 22 11 16) y horario desde las 18:00: el brief manda,
     pero conviene que Marisa confirme y que se corrija la ficha pública. */
  hours: {
    mon: [],
    tue: [],
    wed: [{ open: "19:30", close: "00:00" }],
    thu: [{ open: "19:30", close: "00:00" }],
    fri: [{ open: "19:30", close: "00:00" }],
    sat: [{ open: "19:30", close: "00:00" }],
    sun: [{ open: "19:30", close: "00:00" }],
  } satisfies Record<DayKey, TimeRange[]>,
  timezone: "Europe/Madrid",
  /* Pizarra de la fachada (foto pública de Google, 2025): «PINCHOS 2€ · BOCADILLOS 4€». El brief
     decía 1,50–2,50 € y La Voz (2024) 1,50 €: manda la pizarra, PENDIENTE de confirmar con Marisa. */
  prices: { pincho: 2, bocadillo: 4 },
  priceRangeSchema: "€",
  payments: ["cash", "card", "mobile"] as const,
  reservations: false,
  managers: "Marisol y Marisa López",
  maps: "https://www.google.com/maps/search/?api=1&query=Bar+Dos+Puertas%2C+R%C3%BAa+dos+Fornos+7%2C+32005+Ourense",
  /* Mapa incrustable de Google sin clave de API (búsqueda por nombre y dirección). */
  mapEmbed: "https://maps.google.com/maps?q=Bar%20Dos%20Puertas%2C%20R%C3%BAa%20dos%20Fornos%207%2C%2032005%20Ourense&z=17&hl=es&output=embed",
  social: {
    tripadvisor: "https://www.tripadvisor.es/Restaurant_Review-g644337-d3173430-Reviews-Dos_Puertas-Ourense_Province_of_Ourense_Galicia.html",
    facebook: "https://www.facebook.com/p/Bar-Dos-Puertas-100054258110551/",
  },
  press: {
    vozGalicia: {
      outlet: "La Voz de Galicia",
      date: "2024-03-02",
      title: "Hasta Amancio Ortega se dejó conquistar por los «calamares» del Dos Puertas de Ourense",
      url: "https://www.lavozdegalicia.es/noticia/ourense/ourense/2024/03/01/amancio-ortega-dejo-conquistar-calamares-dos-puertas-ourense/00031709305710141411475.htm",
    },
  },
  ratings: {
    /* Medias públicas de TripAdvisor (99 opiniones), consultadas el 05/10/2026. */
    tripadvisor: { value: 3.9, count: 99, valueForMoney: 4.3 },
  },
} as const;
