/**
 * Opiniones reales publicadas en TripAdvisor y Google (extractos).
 * Se muestran con nombre de usuario público y ciudad, tal y como aparecen en la plataforma.
 */
export interface Review {
  id: string;
  author: string;
  location?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  text: string;
  date: string;
  source: "TripAdvisor" | "Google";
  highlight?: string;
}

export const REVIEWS: Review[] = [
  {
    id: "r1",
    author: "KlausGF",
    location: "Madrid",
    rating: 5,
    title: "Servicio estupendo, ambiente mejor y comida rica",
    text: "Un clásico de la noche de tapeo en la ciudad. Sus tixolas rebosan calidad cuando estás acostumbrado a pagar el doble por unos huevos rotos en Madrid.",
    date: "2026-07",
    source: "TripAdvisor",
    highlight: "tixolas",
  },
  {
    id: "r2",
    author: "Fernando R.",
    location: "Valencia",
    rating: 5,
    title: "Comida espectacular junto a la catedral",
    text: "El entorno es magnífico, en pleno casco histórico. La comida muy sabrosa; los calamares increíbles y el raxo de primera, había tanta cantidad que fue imposible terminarlo. Un buen vino y un precio razonable.",
    date: "2026-07",
    source: "TripAdvisor",
    highlight: "calamares",
  },
  {
    id: "r3",
    author: "Joan B.",
    rating: 4,
    title: "Acierto gastronómico",
    text: "Vino de godello, pulpo con grelos y pan de Cea hicieron en mi persona un momento de agradable disfrute. Trato amable por parte de los dueños.",
    date: "2026-05",
    source: "TripAdvisor",
    highlight: "pulpo con grelos",
  },
  {
    id: "r4",
    author: "PacoSarria",
    location: "Ourense",
    rating: 4,
    title: "Zona viños",
    text: "Cocina honesta. Bien elaborada. Buena vinoteca. Buen servicio. En el casco histórico de la ciudad.",
    date: "2026-09",
    source: "TripAdvisor",
    highlight: "vinoteca",
  },
  {
    id: "r5",
    author: "Balbino P.",
    rating: 5,
    title: "Comida estupenda, local súper agradable y buenos vinos",
    text: "El producto es fresco y local en muchos casos. Tiene una buena variedad de vinos y de gran calidad. El vino godello que nos recomendó la dueña estaba buenísimo. Los pinchos que ella nos propuso también.",
    date: "2024-05",
    source: "TripAdvisor",
    highlight: "godello",
  },
  {
    id: "r6",
    author: "Egoitz S.",
    rating: 4,
    title: "Muy recomendable, un acierto",
    text: "Unas tapas de 10, todo muy rico, un trato amable. La especialidad de la casa (la tixola) plato muy recomendable. Fuimos a la terraza y fue un acierto, está en medio del casco histórico y es precioso.",
    date: "2023-07",
    source: "TripAdvisor",
    highlight: "terraza",
  },
  {
    id: "r7",
    author: "Naroic",
    location: "Madrid",
    rating: 5,
    title: "De lujo",
    text: "Pulpo a la plancha con grelos, fingers de pollo casero con salsa de miel y unas bravas con una salsa fuera de lo común. Todo ello regado con unos caldos de la tierra.",
    date: "2022-08",
    source: "TripAdvisor",
    highlight: "bravas",
  },
  {
    id: "r8",
    author: "Cliente de Google",
    rating: 5,
    text: "Fingers de pollo, tixola de chistorra, calamares, postres y bebidas. Bar de tapas animado con terraza.",
    date: "2026",
    source: "Google",
    highlight: "tixola de chistorra",
  },
];

export const SOCIAL_STATS = [
  { id: "reviews", value: 850, suffix: "+", label: "Reseñas de clientes", sub: "en Google" },
  { id: "rating", value: 4.4, suffix: " / 5", label: "Valoración media", sub: "Google · 858 opiniones", decimals: 1 },
  { id: "rank", value: 1, prefix: "Nº ", suffix: "", label: "En zamburiñas de la zona", sub: "según nuestros clientes" },
  { id: "years", value: 19, suffix: "º", label: "Restaurante de Ourense", sub: "TripAdvisor · Travellers' Choice" },
] as const;
