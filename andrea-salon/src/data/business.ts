/**
 * Datos maestros del negocio. Fuente: buscadores y directorios (la web actual de Elitek no se
 * puede abrir desde el entorno) y lo que contó Brian el 15/10/2026. LO NO CONFIRMADO LLEVA
 * `pendiente` y la interfaz lo enseña así: mejor un «pendiente de confirmar» a la vista que un
 * horario inventado que una clienta se crea.
 *
 * Lo que Andrea edita desde el panel (servicios, precios, equipo, horarios) vivirá en la base de
 * datos; `hours` de aquí es el RESPALDO mientras `settings.salon_hours` no exista.
 */
export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface TimeRange {
  /** "HH:MM" en hora local de Ourense (Europe/Madrid) */
  open: string;
  close: string;
}

export const DAY_ORDER_WEEK: readonly DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/* El texto que sale ya escrito en WhatsApp al pulsar el botón. Neutro a propósito: sirve para una
   duda, un cambio de cita o preguntar por un bono. Se codifica en `whatsapp.url`. */
const WHATSAPP_MESSAGE = "Hola, tengo una consulta sobre Andrea Salón";

export const BUSINESS = {
  name: "Andrea Salón",
  legalName: "Andrea Salón · Uñas y Belleza",
  /* Con las dos grafías que circulan por directorios y redes (ayuda a Google a juntarlas). */
  alternateNames: ["Andrea Salon", "Andrea Salón Nails", "Andrea Salon Nails"],
  address: {
    street: "Rúa Río Mao, 23, bajo",
    postalCode: "32001",
    city: "Ourense",
    region: "Galicia",
    country: "ES",
    full: "Rúa Río Mao, 23, bajo, 32001 Ourense",
  },
  /* PENDIENTE: coordenadas aproximadas de la zona (Río Mao, Ourense). Fijar con la ficha de Google
     Business antes del lanzamiento; alimentan el JSON-LD y el enlace de «Cómo llegar». */
  geo: { lat: 42.34, lng: -7.86, pendiente: true },
  phone: { display: "646 77 13 56", e164: "+34646771356", tel: "tel:+34646771356" },
  whatsapp: {
    display: "646 77 13 56",
    e164: "+34646771356",
    message: WHATSAPP_MESSAGE,
    url: `https://wa.me/34646771356?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`,
  },
  email: null as string | null,
  timezone: "Europe/Madrid",
  /**
   * Horario. Cada día admite varios tramos (mañana / tarde). Vacío = cerrado.
   * FUENTE: un directorio, SIN CONFIRMAR con Andrea (`hoursPending`). Mientras siga en true, el pie
   * y la página de contacto enseñan el aviso «pendiente de confirmar» al lado del horario.
   */
  hoursPending: true,
  hours: {
    mon: [
      { open: "09:30", close: "13:30" },
      { open: "15:30", close: "19:30" },
    ],
    tue: [
      { open: "09:30", close: "13:30" },
      { open: "15:30", close: "19:30" },
    ],
    wed: [
      { open: "09:30", close: "13:30" },
      { open: "15:30", close: "19:30" },
    ],
    thu: [
      { open: "09:30", close: "13:30" },
      { open: "15:30", close: "19:30" },
    ],
    fri: [{ open: "09:30", close: "19:30" }],
    sat: [],
    sun: [],
  } satisfies Record<DayKey, TimeRange[]>,
  social: {
    instagram: "https://www.instagram.com/andrea_salonnails/",
    instagramHandle: "@andrea_salonnails",
    facebook: "https://www.facebook.com/andreasalonnails/",
  },
  /* Búsqueda por nombre y dirección: no depende de un place id ni de coordenadas sin confirmar. */
  maps: "https://www.google.com/maps/search/?api=1&query=Andrea+Sal%C3%B3n%2C+R%C3%BAa+R%C3%ADo+Mao+23%2C+32001+Ourense",
  directions: "https://www.google.com/maps/dir/?api=1&destination=Andrea+Sal%C3%B3n%2C+R%C3%BAa+R%C3%ADo+Mao+23%2C+32001+Ourense",
  /* Mapa incrustable de Google sin clave de API (búsqueda por nombre y dirección). */
  mapEmbed: "https://maps.google.com/maps?q=Andrea%20Sal%C3%B3n%2C%20R%C3%BAa%20R%C3%ADo%20Mao%2023%2C%2032001%20Ourense&z=17&hl=es&output=embed",
  /* Enlace a las reseñas: la misma búsqueda; Google abre la ficha con la pestaña de opiniones. */
  googleReviews: "https://www.google.com/maps/search/?api=1&query=Andrea+Sal%C3%B3n+Nails+Ourense",
  /**
   * Nota pública de Google. PENDIENTE: Brian capturó las reseñas pero no la media ni el recuento
   * total de la ficha. Con `value` en null la web no enseña ninguna nota (y NUNCA la mete en el
   * JSON-LD como AggregateRating: lección de tixola).
   */
  ratings: {
    google: { value: null as number | null, count: null as number | null },
  },
  /**
   * Datos del titular para el aviso legal y la privacidad (LSSI art. 10, RGPD art. 13).
   * El NIF, el domicilio fiscal y el correo están PENDIENTES de que Andrea los dé: mientras alguno
   * sea null, las páginas legales van con `noindex` y fuera del sitemap (ver `data/legal.ts`).
   */
  legal: {
    holder: "Andrea Gil Iglesias" as string | null,
    taxId: null as string | null,
    fiscalAddress: null as string | null,
    email: null as string | null,
  },
} as const;
