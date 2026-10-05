import { REVIEWS } from "@/data/reviews";

/**
 * Los carteles negros de la pared. Brian cuenta que en el local cuelgan carteles negros con
 * mensajes de bar en positivo, pero aún no tenemos foto de lo que dicen. Mientras tanto, cada
 * cartel lleva una frase LITERAL de una reseña real: si la frase deja de estar en el texto de su
 * reseña, el cartel no se pinta. Cuando llegue la foto, se cambian por los mensajes de verdad.
 */
interface Cartel {
  review: string;
  phrase: string;
}

const SOURCE: readonly Cartel[] = [
  { review: "o-pequeno-axouxere", phrase: "¡El de toda la vida!" },
  { review: "carlos-carro", phrase: "Bueno, bonito y barato" },
  { review: "michel", phrase: "Con dos pinchos y un par de cañas te vas cenado" },
  { review: "jorge-rodriguez", phrase: "Como en los viejos tiempos" },
];

export const CARTELES: readonly { id: string; text: string }[] = SOURCE.filter((c) =>
  REVIEWS.find((r) => r.id === c.review)?.text.includes(c.phrase),
).map((c) => ({ id: c.review, text: c.phrase }));
