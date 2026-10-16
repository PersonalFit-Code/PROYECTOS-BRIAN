/** Página /servicios y lista de servicios (también la usa la portada). */
const servicios = {
  seo: {
    title: "Servicios y precios · Manicura, pedicura y mirada en Ourense",
    description:
      "Manicura completa y personalizada, manicura rusa, nivelación, gel y acrylgel, pedicura, nail art, diseño de cejas, laminado y lifting de pestañas en Andrea Salón, Ourense.",
  },
  kicker: "Servicios",
  title: "Manos, pies",
  accent: "y mirada",
  description:
    "Esto es lo que hacemos y lo que cuesta. Si no sabes qué elegir, reserva una manicura completa y te asesoramos en el salón: tú tienes siempre la última palabra.",
  count: "{count} servicios",
  /** Nombre visible de cada categoría del catálogo. */
  categories: {
    manos: "Manos",
    pies: "Pies",
    mirada: "Mirada",
  },
  card: {
    duration: "{minutes} min",
    from: "desde {price}",
    pending: "Precio pendiente de confirmar",
    book: "Reservar",
    bookAria: "Reservar {name}",
    notOnline: "Pídelo en el salón",
  },
  /* Lista alimentada por un fixture hasta conectar la base de datos (fase 1b). */
  pendingNote:
    "Lista provisional: precios y duraciones pendientes de confirmar con el salón. Los que valen son los que se indican en el propio establecimiento.",
  footnote: "Los precios incluyen IVA. Si un trabajo lleva más de lo previsto, te lo decimos antes de empezar.",
} as const;
export default servicios;
