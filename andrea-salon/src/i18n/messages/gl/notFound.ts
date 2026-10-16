import type { Traducion } from "./traducion";

/** Páxina 404 dentro do layout de idioma (ver `messages/es/notFound.ts`). */
const notFound: Traducion<"notFound"> = {
  kicker: "404",
  title: "Esta páxina non existe",
  text: "A ligazón que seguiches non leva a ningún sitio. Volve ao inicio ou reserva a túa cita directamente.",
  back: "Volver ao inicio",
  book: "Reservar cita",
};
export default notFound;
