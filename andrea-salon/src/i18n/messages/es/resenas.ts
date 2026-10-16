/** Página /resenas y sección de reseñas de la portada (cascada). */
const resenas = {
  seo: {
    title: "Reseñas · Opiniones de clientas de Andrea Salón, Ourense",
    description:
      "Lo que dicen las clientas de Andrea Salón en Google: trato cercano, manicuras que duran semanas y un equipo que asesora. Reseñas reales, con nombre y fecha.",
  },
  kicker: "Reseñas",
  title: "Lo que dicen",
  accent: "nuestras clientas",
  description: "{count} reseñas de 5 estrellas en Google, copiadas tal cual y con el nombre de quien las escribió.",
  /* Cuando se confirme la nota real de Google, se enseña al lado del enlace. */
  ratingLabel: "{value} de 5 en Google · {count} reseñas",
  readOnGoogle: "Ver todas en Google",
  stars: "{n} de 5 estrellas",
  platform: "Reseña de {platform}",
  /* Las que Google corta con «Más» se citan hasta el corte. */
  truncatedNote: "Las reseñas largas se citan hasta donde Google las muestra; enteras, en su ficha.",
} as const;
export default resenas;
