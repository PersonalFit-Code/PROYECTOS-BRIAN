import type { Traducion } from "./traducion";

/**
 * Páxina /resenas e sección de opinións da portada (ver `messages/es/resenas.ts`). «Reseña» trádese
 * por «opinión», que é como se di na fala; as reseñas en si son citas literais e quedan como están.
 */
const resenas: Traducion<"resenas"> = {
  seo: {
    title: "Opinións · O que din as clientas de Andrea Salón, Ourense",
    description:
      "O que din as clientas de Andrea Salón en Google: trato próximo, manicuras que duran semanas e un equipo que asesora. Opinións reais, con nome e data.",
  },
  kicker: "Opinións",
  title: "O que din",
  accent: "as nosas clientas",
  description: "{count} opinións de 5 estrelas en Google, copiadas tal cal e co nome de quen as escribiu.",
  ratingLabel: "{value} de 5 en Google · {count} opinións",
  readOnGoogle: "Ver todas en Google",
  stars: "{n} de 5 estrelas",
  platform: "Opinión en {platform}",
  truncatedNote: "As opinións longas cítanse ata onde as amosa Google; enteiras, na súa ficha.",
};
export default resenas;
