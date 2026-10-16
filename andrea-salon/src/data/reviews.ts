/**
 * Reseñas REALES de Google, capturadas por Brian el 15/10/2026 de la ficha del salón. Texto
 * literal; las que Google corta con «Más» se citan hasta el corte, con «…», como hace
 * `dos-puertas/src/data/reviews.ts`.
 *
 * De las 23 entradas capturadas quedan 22: «motoval ourense» tenía exactamente el mismo texto que
 * Monica (misma persona con dos cuentas, o un copiado) y se omite. La única que no es de 5 estrellas
 * (Maria Carneiro, 2★) se GUARDA con `shown: false`: no se esconde del repositorio —la web enlaza
 * «ver todas en Google» y allí está— pero no se publica como testimonio, igual que ningún salón pone
 * una queja en el escaparate. El contador de la portada cuenta solo las publicadas.
 *
 * `when` es la fecha RELATIVA tal cual la enseña Google («hace 7 meses») el día de la captura: no
 * hay fecha exacta y no se inventa. Si se recapturan, se actualizan todas a la vez.
 */
export interface Review {
  id: string;
  author: string;
  platform: "Google";
  rating: 1 | 2 | 3 | 4 | 5;
  /** Fecha relativa que mostraba Google el 15/10/2026. */
  when: string;
  text: string;
  /** `false` = se conserva pero no se publica como testimonio. */
  shown: boolean;
}

export const REVIEWS: readonly Review[] = [
  {
    id: "monica",
    author: "Monica",
    platform: "Google",
    rating: 5,
    when: "hace 2 meses",
    text: "Cómo puedo explicar lo maravillosas que son? Porque no hay estrellas suficientes que puedan plasmarlo. Para empezar el centro es bonito no; lo siguiente: lleno…",
    shown: true,
  },
  {
    id: "lola-rv",
    author: "Lola RV",
    platform: "Google",
    rating: 5,
    when: "hace 2 meses",
    text: "El mejor salón de uñas de todo Ourense! Y sus chicas las mejores! Siempre con una sonrisa y súper profesionales! Cada vez que salgo de allí salgo encantada con…",
    shown: true,
  },
  {
    id: "noemi-ar",
    author: "Noemi AR",
    platform: "Google",
    rating: 5,
    when: "hace 6 meses",
    text: "Si fuera posible poner más estrellas, se las pondría. Me encontré el centro buscando en Google porque, literal, no tenía uñas, estaban completamente rotas. El…",
    shown: true,
  },
  {
    id: "cristina-fa",
    author: "Cristina F.a",
    platform: "Google",
    rating: 5,
    when: "hace 2 meses",
    text: "Una experiencia de 10 desde el primer día. ❤️ Profesionalidad y trato cercano que hace que te sientas muy a gusto. Siempre salgo encantada con el resultado y con…",
    shown: true,
  },
  {
    id: "maria-jose-castillo",
    author: "Maria Jose Castillo Herrera",
    platform: "Google",
    rating: 5,
    when: "hace 4 meses",
    text: "Llevo más de 2 años y medio acudiendo a este maravilloso local y lo voy a seguir haciendo.…",
    shown: true,
  },
  {
    id: "susana-iglesias",
    author: "Susana Iglesias",
    platform: "Google",
    rating: 5,
    when: "hace 7 meses",
    text: "Buenas noches!! 🤗 Soy clienta de Andrea Salón desde hace 6 años y puedo decir con total seguridad que no lo cambio por nada. Son un equipo estupendo, muy…",
    shown: true,
  },
  {
    id: "judit",
    author: "Judit",
    platform: "Google",
    rating: 5,
    when: "hace 7 meses",
    text: "Se respira muy buen ambiente en cuanto entras. Las manicuristas son muy amables y atentas.…",
    shown: true,
  },
  {
    id: "soraya-rodriguez",
    author: "Soraya Rodriguez Prado",
    platform: "Google",
    rating: 5,
    when: "hace 6 meses",
    text: "Una experiencia más que recomendable. El nivel de detalle y delicadeza que ponen en cada manicura es de otro mundo. El…",
    shown: true,
  },
  {
    id: "xeii-ir",
    author: "Xeii IR",
    platform: "Google",
    rating: 5,
    when: "hace 7 meses",
    text: "Estoy encantada con el centro y el equipo! 💅✨ Desde el primer momento, el trato es súper cercano y cariñoso, te hacen sentir como en casa. Se nota muchísimo la…",
    shown: true,
  },
  {
    id: "ana-dolores-lopez",
    author: "Ana dolores Lopez sieiro",
    platform: "Google",
    rating: 5,
    when: "hace 7 meses",
    text: "Un equipo increíblemente profesional… Si no sabes qué hacerte ellas te asesoran pero tú siempre tienes la última palabra. Les encanta su trabajo y eso se nota…",
    shown: true,
  },
  {
    id: "maria-carneiro",
    author: "Maria Carneiro",
    platform: "Google",
    rating: 2,
    when: "hace 7 meses",
    text: "mi experiencia al principio fue bastante buena, pero desde hace 1 año aproximadamente cambió, calidad/precio para mi forma de pensar bastante bajo… en…",
    shown: false,
  },
  {
    id: "sara-lino",
    author: "Sara Lino",
    platform: "Google",
    rating: 5,
    when: "hace un año",
    text: "No solo me voy contentísima con el gran trabajo de Andrea y Carolina, sino que con las manos y pies completamente renovados.…",
    shown: true,
  },
  {
    id: "emma-carcacia",
    author: "Emma Carcacía",
    platform: "Google",
    rating: 5,
    when: "hace 2 años",
    text: "El mejor salón en todo Ourense, súper bonito y acogedor. Tanto Andrea como su equipo son fantásticas, son artistas de verdad, personas maravillosas que a la vez…",
    shown: true,
  },
  {
    id: "gabrigallego",
    author: "Gabrigallego",
    platform: "Google",
    rating: 5,
    when: "hace 7 meses",
    text: "Recomendado 100%, yo me voy a hacer las cejas y me quedan perfectas, aparte de la atención de las chicas, que es muy profesional y súper amables. No dudéis en venir.…",
    shown: true,
  },
  {
    id: "iria-dominguez",
    author: "Iria Domínguez",
    platform: "Google",
    rating: 5,
    when: "hace 7 meses",
    text: "Las chicas son unas profesionales! Me quedaron las uñas preciosas y me duran tres semanas o más. Yo ya no me cambio 💖…",
    shown: true,
  },
  {
    id: "sandra-delgado",
    author: "Sandra Delgado",
    platform: "Google",
    rating: 5,
    when: "hace 7 meses",
    text: "Fui un par de veces y tanto el trato como la calidad, el centro, la atención de todas, es un 10. No voy más porque no vivo en la ciudad, pero súper recomendado…",
    shown: true,
  },
  {
    id: "meli-meli",
    author: "Meli Meli",
    platform: "Google",
    rating: 5,
    when: "hace un año",
    text: "Acudí a este centro por recomendación. Llevo meses yendo y haciendo uso de sus diferentes servicios, por ello puedo hacer una valoración más meditada.…",
    shown: true,
  },
  {
    id: "noelia-garcia",
    author: "Noelia García Pérez",
    platform: "Google",
    rating: 5,
    when: "hace 2 años",
    text: "De todos los sitios de uñas que he probado, para mí es el mejor. Siempre salgo encantada con las manicuras que me he hecho, y el personal es majísimo. Además, puedes pedirle consejos sobre qué hacerte y quedarás encantadx con lo que te hagas.",
    shown: true,
  },
  {
    id: "mavi-lopez",
    author: "Mavi Lopez",
    platform: "Google",
    rating: 5,
    when: "hace 7 meses",
    text: "La mejor atención. Buenos productos. Y siempre uñas impecables.",
    shown: true,
  },
  {
    id: "taty",
    author: "Taty",
    platform: "Google",
    rating: 5,
    when: "hace un año",
    text: "Era la primera vez que me hicieron una extensión de uñas y salí encantada. Tanto la pedicura como la extensión de uñas genial. Un trato excelente, calidad y buen gusto. Recomendable 100×100…",
    shown: true,
  },
  {
    id: "maria-mosquera",
    author: "Maria Mosquera Rivera",
    platform: "Google",
    rating: 5,
    when: "hace 2 años",
    text: "Soy clienta desde hace más de 3 años y nunca dejan de sorprenderme con su talento y profesionalidad. El salón impecable, limpio, los servicios ofrecidos…",
    shown: true,
  },
  {
    id: "sabela",
    author: "Sabela",
    platform: "Google",
    rating: 5,
    when: "hace un año",
    text: "Primera vez que me hago los pies en mi vida porque tengo muchas cosquillas, y la chica que me atendió fue súper cuidadosa, agradable y muy profesional, como…",
    shown: true,
  },
];

/** Las que se publican como testimonio (hoy, 21 de 5 estrellas). */
export const REVIEWS_SHOWN: readonly Review[] = REVIEWS.filter((r) => r.shown);
