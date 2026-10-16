import type { Traducion } from "./traducion";

/** Páxina /servicios e lista de servizos (ver `messages/es/servicios.ts`). */
const servicios: Traducion<"servicios"> = {
  seo: {
    title: "Servizos e prezos · Manicura, pedicura e mirada en Ourense",
    description:
      "Manicura completa e personalizada, manicura rusa, nivelación, xel e acrylgel, pedicura, nail art, deseño de cellas, laminado e lifting de pestanas en Ourense.",
  },
  kicker: "Servizos",
  title: "Mans, pés",
  accent: "e mirada",
  description:
    "Isto é o que facemos e o que custa. Se non sabes que escoller, reserva unha manicura completa e asesorámoste no salón: ti tes sempre a última palabra.",
  count: "{count} servizos",
  categories: {
    manos: "Mans",
    pies: "Pés",
    mirada: "Mirada",
  },
  card: {
    duration: "{minutes} min",
    from: "desde {price}",
    pending: "Prezo pendente de confirmar",
    book: "Reservar",
    bookAria: "Reservar {name}",
    notOnline: "Pídeo no salón",
  },
  pendingNote:
    "Lista provisional: prezos e duracións pendentes de confirmar co salón. Os que valen son os que se indican no propio establecemento.",
  footnote: "Os prezos inclúen IVE. Se un traballo leva máis do previsto, dicímoscho antes de comezar.",
};
export default servicios;
