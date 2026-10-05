/**
 * Reseñas REALES, copiadas literalmente (con sus erratas corregidas solo en tildes y mayúsculas).
 * Fuente: TripAdvisor, consultado el 05/10/2026. Solo se citan, con autor y enlace a la plataforma.
 */
export interface Review {
  id: string;
  author: string;
  platform: "TripAdvisor";
  /** "AAAA-MM"; null si la plataforma no deja ver la fecha en el extracto. */
  date: string | null;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  text: string;
}

export const REVIEWS: readonly Review[] = [
  {
    id: "maria-a-2025",
    author: "María A.",
    platform: "TripAdvisor",
    date: "2025-05",
    rating: 5,
    title: "Muy buen servicio, limpio",
    text: "Muy buena atención, fuimos con un perro y nos dejaron entrar dentro y nos dieron bebida para el perro y una chuchería. La atención exquisita y los pinchos de lujo, un diez para todas.",
  },
  {
    id: "don-juan-2019",
    author: "Don Juan",
    platform: "TripAdvisor",
    date: "2019-11",
    rating: 5,
    title: "Parada obligada",
    text: "Sus pinchos de calamares son un auténtico «bocatto di cardinale», sus chicharrones una exquisitez y sus empanadillas me pirran. La calle de los Hornos no sería lo mismo sin este histórico que le lleva alegrando la vida a orensanos y visitantes desde 1974.",
  },
  {
    id: "lili-2023",
    author: "Lili CH",
    platform: "TripAdvisor",
    date: "2023-04",
    rating: 5,
    title: "Calidad precio genial",
    text: "Pinchos de calamar y tortilla a 1,50 €. Rápidos, bien de sabor, en el centro. Calidad-precio, ¡perfecto!",
  },
  {
    id: "michel-2019",
    author: "michel5338",
    platform: "TripAdvisor",
    date: "2019-12",
    rating: 5,
    title: "Qué rico y bien atendido",
    text: "Un sitio bien atendido, rápido y todo muy bueno. En hora punta se pone hasta arriba. Por algo será… Con dos pinchos y un par de cañas te vas cenado. Volveré.",
  },
  {
    id: "lecelaa",
    author: "Lecelaa",
    platform: "TripAdvisor",
    date: null,
    rating: 5,
    title: "¿Los mejores chicharrones?",
    text: "Son muy atentos y rápidos en el servicio, además de tener muy buena calidad y a un precio excelente.",
  },
  {
    id: "pirry-2018",
    author: "Pirry",
    platform: "TripAdvisor",
    date: "2018-12",
    rating: 5,
    title: "Fabuloso",
    text: "Local perfecto para hacer una parada y tomar unos buenos pinchos en la zona de los vinos. Mucha variedad de pinchos y para toda la familia. Parada obligada en las tardes de paseo.",
  },
  {
    id: "matilde-2018",
    author: "MatildeVP",
    platform: "TripAdvisor",
    date: "2018-10",
    rating: 4,
    title: "¡El instinto no falla!",
    text: "Confirmado, como en el bar de toda la vida no se come en ningún sitio. ¡Fabuloso el pincho de calamares!",
  },
  {
    id: "patricia-2019",
    author: "Patricia Pazos",
    platform: "TripAdvisor",
    date: "2019-03",
    rating: 4,
    title: "La tortilla y los chicharrones",
    text: "Uno de mis sitios habituales de la ruta de tapeo ourensana. Soy fiel al pincho de tortilla y son también muy buenos los chicharrones y el bocata de calamares.",
  },
];
