import type { CategoryId, PinchoId } from "@/data/menu";
import type { DayKey } from "@/data/business";
import type { DoId } from "@/data/denominaciones";
import type { PhotoId } from "@/data/photos";

const common = {
  tagline: "El sabor auténtico de Los Vinos desde 1974",
  description:
    "Bar de pinchos en la rúa dos Fornos, zona de Os Viños de Ourense, desde 1974. Chicharrones, calamares, tortilla y empanadillas de siempre, de pie y en barra.",
  skipToContent: "Saltar al contenido",
  area: "Casco histórico · Zona de Os Viños",
  language: "Idioma",
  call: "Llamar",
  directions: "Cómo llegar",
  openInMaps: "Abrir en Google Maps",
  loadMap: "Cargar mapa",
  loadMapNote: "El mapa lo sirve Google, que puede usar sus cookies.",
  loadMapPolicy: "Política de cookies",
  pending: "Pendiente de confirmar",
  photoPending: "Foto real próximamente",
  close: "Cerrar",
  readMore: "Ver más",
  source: "Fuente",
  days: {
    mon: "Lunes",
    tue: "Martes",
    wed: "Miércoles",
    thu: "Jueves",
    fri: "Viernes",
    sat: "Sábado",
    sun: "Domingo",
  } satisfies Record<DayKey, string>,
  daysShort: { mon: "Lu", tue: "Ma", wed: "Mi", thu: "Ju", fri: "Vi", sat: "Sá", sun: "Do" } satisfies Record<DayKey, string>,
  status: {
    open: "Abierto ahora",
    closesAt: "hasta las {time}",
    closingSoon: "Cierra pronto",
    opensToday: "Abre hoy a las {time}",
    closedToday: "Hoy descansamos",
    opensOn: "Abrimos el {day} a las {time}",
    opensTomorrow: "Abrimos mañana a las {time}",
    closed: "Cerrado",
  },
  today: "Hoy",
  closedDay: "Cerrado",
};

const nav = {
  items: {
    home: "Inicio",
    carta: "Carta",
    vinos: "Vinos",
    historia: "Historia",
    visita: "Visítanos",
    preguntas: "Preguntas",
  },
  subheadings: {
    home: "La portada",
    carta: "Pinchos, montados, bocadillos y raciones",
    vinos: "Las denominaciones gallegas",
    historia: "Quiénes somos, desde 1974",
    visita: "Horario, mapa y cómo funciona la barra",
    preguntas: "Reservas, precios, perros, alérgenos…",
  },
  menu: { label: "Menú", open: "Abrir el menú", close: "Cerrar el menú", heading: "Navegación" },
  hoursShort: "Miércoles a domingo, 19:30 – 00:00",
};

const cover = {
  label: "Café Bar Dos Puertas",
  tagline: "Ourense · Desde 1974",
  scroll: "Desliza",
};

const puertas = {
  kicker: "Dos puertas",
  titleBefore: "¿Por cuál",
  titleAccent: "entras?",
  lead: "Fuera, el rótulo de 1974. Dentro, una barra al día.",
  hint: "Desliza para abrirlas o toca una puerta",
  open: "Abrir la puerta {n}: {name}",
  doors: {
    siempre: {
      n: "1",
      label: "Puerta 1",
      name: "La de siempre",
      text: "Pinchos de siempre y medio siglo de historia.",
      links: [
        { path: "/carta", label: "La carta" },
        { path: "/historia", label: "La historia" },
      ],
    },
    hoy: {
      n: "2",
      label: "Puerta 2",
      name: "La de hoy",
      text: "Vino gallego, cañas bien tiradas y el local renovado.",
      links: [
        { path: "/vinos", label: "Los vinos" },
        { path: "/#por-dentro", label: "Por dentro" },
      ],
    },
  },
};

const hero = {
  kicker: "Rúa dos Fornos, 7 · Desde 1974",
  titleBefore: "El corazón de",
  titleAccent: "Los Vinos",
  titleAfter: "de Ourense",
  subtitle: "Tradición, autenticidad y los pinchos de siempre en la rúa dos Fornos desde 1974.",
  ctaPrimary: "Ver la Barra de Pinchos",
  ctaSecondary: "Cómo llegar",
  press: {
    outlet: "La Voz de Galicia",
    aria: "Leer el reportaje de La Voz de Galicia sobre el Dos Puertas",
    items: ["Hasta Amancio Ortega se dejó conquistar por sus «calamares»", "Más de 50 años de barra en la rúa dos Fornos", "Un mítico de la zona de Os Viños"],
  },
  showcase: {
    label: "Los de la casa",
    boardPrices: "Pinchos a 2 €",
    seeCarta: "Ver la carta",
  },
};

const manifesto = {
  kicker: "Cómo funciona",
  titleBefore: "Se entra por una puerta,",
  titleAccent: "se sale",
  titleAfter: "por la otra",
  lead:
    "Las dos puertas no son un nombre bonito: Irene y José las pusieron en 1974 para que la gente pudiera entrar y salir sin parar la barra. Medio siglo después, sigue siendo así de sencillo.",
  rules: [
    { title: "Sin reservas", text: "Aquí no se reserva: se llega, se pide y se comparte barra." },
    { title: "De pie, en barra", text: "Tapeo de los de antes, hombro con hombro con quien venga." },
    { title: "Pinchos a 2 €", text: "Precio de barra de toda la vida, que también es parte de la receta." },
  ],
};

const barra = {
  kicker: "La barra",
  titleBefore: "Los pinchos",
  titleAccent: "de siempre",
  titleAfter: "",
  lead: "Expuestos en la barra para pedir al momento, como desde el primer día. Estos son los cuatro que no fallan.",
  seeAll: "Ver la carta completa",
  openDetail: "Ver la historia de {name}",
  pageTitle: "Carta",
  pageLead:
    "Lo que se pide en el Dos Puertas, de pie y sin prisa. Se cambia según el día: lo que ves en la barra es lo que hay.",
  priceNote: "Según la pizarra de la fachada: pinchos a 2 € y bocadillos a 4 €. Precios de raciones pendientes de confirmar con la casa.",
  allergensNote: "Información de alérgenos pendiente: pregunta en barra.",
  storyLabel: "La historia",
  filterLabel: "Filtrar la barra",
  all: "Todo",
  results: "{count} en la barra",
  categories: {
    casa: "De la casa",
    montados: "Montados",
    raciones: "Bocadillos y raciones",
    beber: "Para beber",
  } satisfies Record<CategoryId, string>,
  items: {
    chicharrones: {
      name: "Los famosos chicharrones",
      tag: "El favorito de la casa",
      text: "Crujientes, sabrosos y hechos con la receta tradicional. El pincho más aclamado y buscado de la barra.",
      story:
        "Llegaron en los años 90 y se cocinaban en casa cada día. Hubo un matrimonio ourensano que vivía en Suiza y venía en avión algunos fines de semana solo por los chicharrones y los chipirones.",
    },
    calamares: {
      name: "Pincho de calamares",
      tag: "Imprescindible",
      text: "Un icono de la rúa dos Fornos. Calamares tiernos en su punto justo de fritura, en bollito de pan.",
      story:
        "Nació de una confusión: en los 80 había un bollito de panceta tan crujiente y rizada que los turistas lo pedían como «el de calamares». Así que se sumaron a la barra: chipirones, en realidad, pero se quedaron con el nombre. La familia cuenta que hasta Amancio Ortega quedó conquistado.",
    },
    tortilla: {
      name: "Tortilla jugosa",
      tag: "Casera",
      text: "Jugosa, recién hecha y sin cebolla, como la pidieron los clientes.",
      story:
        "Al principio llevaba cebolla, pero mucha gente protestaba, así que se hizo sin y listo. Desde los 90 es famosa por su jugosidad.",
    },
    empanadillas: {
      name: "Empanadillas tradicionales",
      tag: "Receta de 1974",
      text: "Masa crujiente rellena de sofrito clásico. Perfectas para empezar la ronda.",
      story:
        "Están en la barra desde el primer año. Algunos colegios de la zona las encargaban para sus fiestas: hubo noches enteras haciendo mil empanadillas y más.",
    },
    rixones: {
      name: "Rixones",
      tag: "Gallego",
      text: "Rixones gallegos tradicionales, como en las tabernas de antes.",
      story: "",
    },
    "lomo-queso": { name: "Lomo con queso", tag: "Montado", text: "Montado de lomo con queso.", story: "" },
    "jamon-queso": { name: "Jamón y queso", tag: "Montado", text: "Montado de jamón y queso.", story: "" },
    "atun-tomate": { name: "Atún con tomate", tag: "Montado", text: "Montado de atún con tomate.", story: "" },
    bocadillos: {
      name: "Bocadillos",
      tag: "4 €",
      text: "Los pinchos de la casa en formato bocadillo, para quien viene con hambre.",
      story: "",
    },
    raciones: {
      name: "Raciones",
      tag: "Para compartir",
      text: "Calamares, jamón serrano, queso fresco y tortilla, según la pizarra de la puerta.",
      story: "",
    },
    vinos: {
      name: "Vinos gallegos",
      tag: "D.O. de Galicia",
      text: "Selección de vinos de las denominaciones de origen gallegas. Referencias pendientes de confirmar.",
      story: "",
    },
    cerveza: { name: "Cerveza bien tirada", tag: "Caña", text: "La caña de siempre para acompañar la ronda.", story: "" },
  } satisfies Record<PinchoId, { name: string; tag: string; text: string; story: string }>,
};

const historia = {
  kicker: "Historia",
  titleBefore: "Más de 50 años",
  titleAccent: "de historia",
  titleAfter: "viva",
  pageTitle: "Historia",
  pageLead:
    "El Dos Puertas abrió en 1974, cuando en la rúa dos Fornos solo estaba O Campante. Esta es su historia, contada por la familia que lo fundó.",
  timeline: [
    {
      year: "Años 50",
      title: "De Laza a Basilea",
      text: "Irene Fernández y José García emigran de Laza a Basilea, en Suiza. Allí aprenden de hostelería «todo lo que luego pusimos en práctica en Ourense».",
    },
    {
      year: "1974",
      title: "Se abren las dos puertas",
      text: "Vuelven para estar cerca de su hija Rosa y abren el bar en la rúa dos Fornos, con dos puertas para facilitar el paso y una novedad: todos los pinchos expuestos en la barra para pedir al momento. José en los fogones, Irene en la barra.",
    },
    {
      year: "Los 70",
      title: "El moruno de la casa",
      text: "El pincho más popular de los primeros años: ganchos de acero traídos de Suiza, una salsa que José nunca reveló y un precio de cerca de 25 pesetas. Fueron también los primeros en servir bollitos de pan, hechos a mano por un panadero.",
      photo: "anos70" as PhotoId,
    },
    {
      year: "1984",
      title: "Llegan los «calamares»",
      text: "Se incorpora Luis Aguiar, marido de Rosa. De una confusión con un bollito de panceta tan crujiente que los turistas lo pedían como «el de calamares» nace el pincho más famoso. Los viernes y sábados salían más de 1.200 bollitos al día.",
    },
    {
      year: "Años 90",
      title: "Tortilla y chicharrones",
      text: "Llega la tortilla de patata, sin cebolla porque así lo pedían los clientes, y los chicharrones hechos en casa cada día, que pronto se convierten en uno de los pinchos más vendidos.",
    },
    {
      year: "Años 2000",
      title: "El relevo en casa",
      text: "Se jubilan José e Irene y coge el relevo Luis, que mantiene el negocio intacto. Con la llegada del euro, el pincho pasa de 80 pesetas a 65 céntimos.",
    },
    {
      year: "Hoy",
      title: "Marisol y Marisa",
      text: "Desde la pandemia llevan el bar las hermanas Marisol y Marisa López, con amplia experiencia en la hostelería de Ourense, que han querido mantener intacta la esencia del Dos Puertas.",
      photo: "hoy" as PhotoId,
    },
  ],
  photos: {
    anos70: {
      alt: "Fotografía en blanco y negro: Irene detrás de la barra del Dos Puertas, con clientes al otro lado, a finales de los años setenta.",
      caption: "Irene, dentro de la barra del Dos Puertas, a finales de los años setenta.",
      credit: "Foto: La Voz de Galicia",
    },
    hoy: {
      alt: "El equipo de hoy detrás de la barra de granito, con los pinchos del día.",
      caption: "La barra, hoy.",
      credit: "Foto: Faro de Vigo",
    },
  } satisfies Record<PhotoId, { alt: string; caption: string; credit: string }>,
  sourceLabel: "Fuente",
  source: "La Voz de Galicia, “Hasta Amancio Ortega se dejó conquistar por los «calamares» del Dos Puertas de Ourense”, 2 de marzo de 2024.",
  quote: "Lo nuestro eran los pinchos a buen precio.",
  quoteAuthor: "Luis Aguiar, a La Voz de Galicia",
  famousKicker: "Por la barra pasaron",
  famousTitle: "Hasta Amancio Ortega",
  famousText:
    "La familia recuerda con orgullo que Amancio Ortega estuvo en el bar y que le encantaron los «calamares». También venían mucho Fran, el jugador del Deportivo, la cantante Cristina Pato y políticos como Feijóo o Santalices.",
  pressLink: "Leer el reportaje en La Voz de Galicia",
};


const vinos = {
  kicker: "Vinos",
  titleBefore: "Vinos de",
  titleAccent: "la tierra",
  pageLead:
    "En Os Viños se viene a pinchar y a beber vino gallego. Cuatro de las cinco denominaciones de origen de Galicia tienen viñedo en la provincia de Ourense.",
  houseKicker: "En la barra",
  houseTitle: "La selección de la casa",
  houseText: "Vinos de las denominaciones gallegas, por copas, para acompañar la ronda de pinchos.",
  houseFacts: ["Por copas", "Denominaciones gallegas"],
  housePending: "Referencias concretas pendientes de confirmar con la casa.",
  quoteLabel: "Lo que dicen del vino",
  doKicker: "Las denominaciones",
  doTitle: "Cinco orígenes, un mismo país",
  doLead: "Pulsa una para desplegarla. En el mapa, cada número está donde está su denominación, y todos los caminos llevan a la rúa dos Fornos.",
  doNote: "Esto enseña de dónde sale el vino gallego, no la carta de la casa: las referencias del Dos Puertas están pendientes de confirmar.",
  doPrefix: "D.O.",
  since: "D.O. desde {year}",
  ourenseBadge: "Provincia de Ourense",
  mostly: { blanco: "Sobre todo blanco", tinto: "Sobre todo tinto" },
  whites: "Blancas",
  reds: "Tintas",
  mapAria: "Mapa de Galicia con las cinco denominaciones de origen de vino.",
  mapFlow: "Desde cada una sale un camino hasta Ourense, donde está el Dos Puertas.",
  mapCredit: "Contorno de Galicia: datos de OpenStreetMap, licencia ODbL.",
  mapAtlantic: "Atlántico",
  mapPortugal: "Portugal",
  mapHere: "Estamos aquí",
  regionAria: "Denominación de origen {name}",
  items: {
    "rias-baixas": {
      zone: "Costa atlántica de Pontevedra y sur de A Coruña",
      text: "La única de las cinco fuera de Ourense: el reino del Albariño, el blanco atlántico.",
    },
    ribeiro: {
      zone: "Valles del Miño, el Avia y el Arnoia, al oeste de la ciudad",
      text: "Una de las denominaciones más antiguas de España. Blancos aromáticos de Treixadura y tintos de variedades autóctonas.",
    },
    "ribeira-sacra": {
      zone: "Cañones del Sil y del Miño, entre Ourense y Lugo",
      text: "Viñedo en bancales sobre laderas imposibles: la llamada viticultura heroica. Tierra de tintos de Mencía.",
    },
    valdeorras: {
      zone: "Valle del Sil, en el extremo oriental de la provincia",
      text: "La casa del Godello, el gran blanco gallego de interior, y de tintos de Mencía.",
    },
    monterrei: {
      zone: "Valle de Monterrei, en torno a Verín, junto a Portugal",
      text: "Blancos de Godello y Treixadura y tintos de Mencía, en la más al sur de las cinco, ya junto a Portugal.",
    },
  } satisfies Record<DoId, { zone: string; text: string }>,
};

const social = {
  kicker: "Lo que dicen",
  titleBefore: "Una parada",
  titleAccent: "obligada",
  titleAfter: "",
  lead: "{count} reseñas reales de 4 y 5 estrellas en Google y TripAdvisor, copiadas tal cual y con su nombre.",
  ratingLabel: "Nota de calidad-precio",
  ratingCount: "{count} opiniones en TripAdvisor",
  readOn: "Leer más en TripAdvisor",
  readOnGoogle: "Ver todas en Google",
  stars: "{n} de 5",
};

const interior = {
  kicker: "Por dentro",
  titleBefore: "Así es",
  titleAccent: "por dentro",
  lead:
    "Paredes blancas, estanterías llenas de vino con su luz azul, las copas colgadas boca abajo sobre la barra y carteles negros con mensajes de bar de los de siempre, en positivo.",
  signsLabel: "Carteles de la pared",
  note: "Ilustración del local. En los carteles van frases de clientes en Google y TripAdvisor hasta que tengamos foto de los carteles de verdad.",
  photos: {
    kicker: "En la barra, de verdad",
    captions: {
      ronda: "Una ronda de pinchos",
      canaBocadillos: "Caña y bocadillos en la barra",
      pinchoCerca: "Pincho recién hecho",
      tortillaEmpanada: "Tortilla y empanada",
      canaEmpanadilla: "Caña y empanadilla",
    },
  },
};

const visita = {
  kicker: "Visítanos",
  titleBefore: "En pleno",
  titleAccent: "casco histórico",
  titleAfter: "",
  lead: "A dos pasos de la catedral, en la calle con más tradición de pinchos de Ourense.",
  hoursTitle: "Horario",
  addressTitle: "Dónde",
  paymentTitle: "Pago",
  payments: { cash: "Efectivo", card: "Tarjeta", mobile: "Pago móvil" },
  noReservations: "No aceptamos reservas: tapeo de barra, por orden de llegada.",
  pageTitle: "Visítanos",
  pageLead: "Todo lo que hace falta saber antes de cruzar cualquiera de las dos puertas.",
  mapLabel: "Mapa de la zona de Os Viños con la ubicación del Dos Puertas",
  faqLink: "Preguntas frecuentes",
};

const faq = {
  kicker: "Preguntas",
  titleBefore: "Antes de",
  titleAccent: "cruzar la puerta",
  pageLead: "Lo que más nos preguntan: reservas, horarios, precios y todo lo demás. Si te queda alguna duda, llámanos.",
  pendingBadge: "Pendiente de confirmar",
  ctaTitle: "¿Te queda alguna duda?",
  ctaText: "Llámanos en horario de apertura y te lo contamos.",
  groups: [
    {
      title: "Antes de venir",
      items: [
        { q: "¿Se puede reservar?", a: "No. El Dos Puertas es un bar de barra: se llega, se pide y se tapea, por orden de llegada." },
        { q: "¿Hay mesas para sentarse?", a: "No. Aquí se tapea de pie, en la barra, como desde 1974. Es parte de la gracia." },
        { q: "¿Qué días y a qué hora abrís?", a: "De miércoles a domingo, de 19:30 a 00:00. Lunes y martes descansamos." },
        { q: "¿Cuándo hay más gente?", a: "Según cuentan los clientes, las noches del fin de semana la barra se llena hasta arriba. Buena señal." },
        { q: "¿Dónde estáis?", a: "En la Rúa dos Fornos, 7, en pleno casco histórico de Ourense y a dos pasos de la catedral: la zona de Os Viños.", link: { path: "/visita", label: "Ver el mapa" } },
      ],
    },
    {
      title: "En la barra",
      items: [
        { q: "¿Cuánto cuesta un pincho?", a: "Según la pizarra de la puerta, 2 € el pincho y 4 € el bocadillo.", pending: true },
        { q: "¿Cuáles son los pinchos de la casa?", a: "Los chicharrones, el de calamares, la tortilla y las empanadillas. También hay rixones y montados.", link: { path: "/carta", label: "Ver la carta" } },
        { q: "¿Los «calamares» son calamares?", a: "El pincho nació en los 80 de una confusión con un bollito de panceta crujiente que los turistas pedían como «el de calamares». Lo que se sirve son chipirones, pero el nombre se quedó." },
        { q: "¿La tortilla lleva cebolla?", a: "No. Al principio la llevaba, pero mucha gente protestaba y desde los años 90 se hace sin." },
        { q: "¿Qué vinos tenéis?", a: "Vinos de las denominaciones gallegas, por copas, para acompañar la ronda.", link: { path: "/vinos", label: "Ver los vinos" } },
        { q: "¿Se puede pedir para llevar?", a: "Las fichas del bar en internet indican que sí. Pregunta en la barra.", pending: true },
        { q: "¿Tenéis información sobre alérgenos?", a: "Pregunta en la barra antes de pedir y te indicamos qué lleva cada pincho.", pending: true },
      ],
    },
    {
      title: "Otras dudas",
      items: [
        { q: "¿Se puede pagar con tarjeta?", a: "Sí: efectivo, tarjeta y pago con el móvil." },
        { q: "¿Puedo entrar con mi perro?", a: "Varios clientes cuentan en sus reseñas que entraron con su perro sin problema; a uno hasta le pusieron agua.", pending: true },
      ],
    },
  ],
};

const footer = {
  about: "Bar de pinchos en la zona de Os Viños de Ourense desde 1974.",
  hours: "Horario",
  location: "Ubicación",
  links: "La casa",
  rights: "© {year} Café Bar Dos Puertas",
  legal: "Aviso legal",
  credits: "Propuesta de web · fotos e información pendientes de validar con la casa",
};

const consent = {
  title: "Cookies, solo si tú quieres",
  settingsTitle: "Configurar cookies",
  text: "Aquí no hay cookies de analítica ni de publicidad. Lo único que las usa es el mapa de Google, y no se carga hasta que lo aceptes.",
  policy: "Política de cookies",
  accept: "Aceptar todas",
  reject: "Rechazar",
  configure: "Configurar",
  save: "Guardar mi selección",
  close: "Cerrar sin cambiar nada",
  necessary: {
    title: "Necesarias",
    always: "Siempre activas",
    text: "Guardan en tu navegador lo que eliges aquí, para no preguntártelo en cada página. No salen de tu dispositivo.",
  },
  maps: {
    title: "Mapa de Google",
    text: "Carga Google Maps para ver cómo llegar sin salir de la web. Al cargarlo, Google puede instalar sus propias cookies.",
  },
  footerLink: "Configurar cookies",
  mapsOn: "Mapa de Google cargado con tu permiso.",
  change: "Cambiar",
};

/* Títulos y descripciones para buscadores: lo que sale en Google. Títulos ≤ 60 caracteres. */
const seo = {
  home: {
    title: "Dos Puertas · Bar de pinchos en la zona de vinos de Ourense",
    description: "Bar de pinchos en la rúa dos Fornos, en Os Viños (la zona de vinos de Ourense), desde 1974: calamares, chicharrones, tortilla y vino gallego. Sin reservas.",
},
  carta: {
    title: "Carta de pinchos en Ourense · Dos Puertas",
    description: "Pinchos de calamares, chicharrones, tortilla y empanadillas, montados, bocadillos y raciones en la zona de vinos de Ourense. De pie y en barra, como desde 1974.",
},
  vinos: {
    title: "Vinos gallegos por copas en Os Viños, Ourense · Dos Puertas",
    description: "Vino gallego por copas en la zona de vinos de Ourense y las cinco D.O. de Galicia en un mapa: Ribeiro, Ribeira Sacra, Valdeorras, Monterrei y Rías Baixas.",
},
  historia: {
    title: "Historia del Dos Puertas, bar de Ourense desde 1974",
    description: "De Laza a Basilea y a la rúa dos Fornos: cómo nació en 1974 el Dos Puertas, el pincho de «calamares» y los chicharrones de la zona de vinos de Ourense.",
},
  visita: {
    title: "Horario y dirección · Dos Puertas, Rúa dos Fornos 7, Ourense",
    description: "De miércoles a domingo, de 19:30 a 00:00, en la rúa dos Fornos 7 (calle Hornos), junto a la catedral de Ourense. Sin reservas: tapeo de pie en barra.",
},
  preguntas: {
    title: "Preguntas frecuentes · Dos Puertas, bar de pinchos en Ourense",
    description: "¿Se puede reservar? ¿Cuánto cuesta un pincho? ¿Puedo ir con perro? Respuestas sobre el Dos Puertas, bar de pinchos de la zona de vinos de Ourense.",
},
  ogAlt: "Café Bar Dos Puertas, bar de pinchos en Ourense desde 1974",
};

const legal = {
  kicker: "Legal",
  draftNotice:
    "Borrador: faltan los datos del titular del negocio (marcados en dorado) y conviene que un profesional lo revise antes de publicar la web definitiva.",
  updated: "Última actualización: 5 de octubre de 2026",
  tocLabel: "En esta página",
  otherDocs: "Otros textos legales",
  /* Solo en los otros idiomas: los textos legales se publican en español. */
  onlySpanish: "",
  pending: {
    holder: "pendiente: nombre o razón social del titular",
    taxId: "pendiente: NIF/CIF",
    fiscalAddress: "pendiente: domicilio del titular",
    email: "pendiente: correo electrónico de contacto",
    registry: "pendiente: datos registrales, si es una sociedad",
  },
  docs: {
    "aviso-legal": {
      title: "Aviso legal",
      lead: "Quién está detrás de esta web y en qué condiciones se usa, conforme a la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).",
      sections: [
        {
          title: "Titular de la web",
          body: ["En cumplimiento del artículo 10 de la LSSI-CE, estos son los datos del titular:"],
          list: [
            "Titular: {holder}",
            "NIF/CIF: {taxId}",
            "Domicilio: {fiscalAddress}",
            "Establecimiento: Café Bar Dos Puertas, Rúa dos Fornos, 7, 32005 Ourense",
            "Teléfono: {phone}",
            "Correo electrónico: {email}",
            "Datos registrales: {registry}",
          ],
        },
        {
          title: "Objeto de la web",
          body: [
            "Esta web informa sobre el Café Bar Dos Puertas: su historia, su barra, su horario y cómo llegar. A través de ella no se venden productos ni servicios y no se aceptan reservas.",
          ],
        },
        {
          title: "Condiciones de uso",
          body: [
            "El acceso es libre y gratuito. Quien la visita se compromete a hacer un uso adecuado de sus contenidos y a no utilizarlos para actividades ilícitas o contrarias a la buena fe.",
          ],
        },
        {
          title: "Precios, horarios y carta",
          body: [
            "Los precios, horarios y productos que aparecen en la web son orientativos y pueden cambiar sin previo aviso. Los que valen son los que se indican en el propio establecimiento.",
          ],
        },
        {
          title: "Propiedad intelectual e industrial",
          body: [
            "Los textos, el diseño, las ilustraciones y la marca de esta web pertenecen a su titular o se utilizan con permiso. No se permite reproducirlos con fines comerciales sin autorización.",
            "Las reseñas de clientes pertenecen a sus autores y se citan con su nombre y la plataforma de origen (Google o TripAdvisor). El reportaje enlazado pertenece a La Voz de Galicia.",
          ],
        },
        {
          title: "Enlaces a otras webs",
          body: [
            "Esta web enlaza a servicios de terceros (Google Maps, TripAdvisor, Facebook y La Voz de Galicia). Sus contenidos y sus condiciones son responsabilidad de esos terceros.",
          ],
        },
        {
          title: "Responsabilidad",
          body: [
            "El titular procura que la información esté actualizada y sea correcta, pero no responde de interrupciones del servicio, de errores en servicios de terceros ni de los daños derivados de un uso indebido de la web.",
          ],
        },
        {
          title: "Ley aplicable y jurisdicción",
          body: [
            "Estas condiciones se rigen por la legislación española. Las controversias se someterán a los juzgados y tribunales que correspondan conforme a la ley; si quien reclama actúa como consumidor, a los de su domicilio.",
          ],
        },
      ],
    },
    privacidad: {
      title: "Privacidad",
      lead: "Cómo se tratan los datos personales en esta web, conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018 de Protección de Datos (LOPDGDD).",
      sections: [
        {
          title: "Responsable del tratamiento",
          body: [],
          list: ["Responsable: {holder}", "NIF/CIF: {taxId}", "Domicilio: {fiscalAddress}", "Teléfono: {phone}", "Correo electrónico: {email}"],
        },
        {
          title: "Qué datos recogemos",
          body: [
            "Esta web no tiene formularios, registro de usuarios ni herramientas de analítica o de publicidad: no recogemos datos personales a través de ella.",
            "Si nos llamas por teléfono, los datos que nos des se usarán solo para atender tu consulta y no se guardarán más allá de lo necesario.",
          ],
        },
        {
          title: "El camarero virtual",
          body: [
            "El camarero virtual funciona entero en tu navegador, con respuestas ya escritas. Lo que escribes no se envía a ningún servidor ni se guarda: desaparece al cerrar la página.",
          ],
        },
        {
          title: "Datos técnicos del alojamiento",
          body: [
            "La web está alojada en Vercel Inc. Como cualquier servidor, registra datos técnicos de cada visita (dirección IP, navegador, página solicitada y hora) para que la web funcione y sea segura. La base legal es el interés legítimo (artículo 6.1.f del RGPD) y esos registros se conservan el tiempo mínimo que fija el proveedor.",
            "Vercel puede tratar estos datos en Estados Unidos con las garantías que prevé el RGPD (Marco de Privacidad de Datos UE-EE. UU. o cláusulas contractuales tipo).",
          ],
        },
        {
          title: "El mapa de Google",
          body: [
            "El mapa solo se carga si lo aceptas: en el aviso de cookies, en «Configurar cookies» o con el botón «Cargar mapa». Entonces tu navegador se conecta con Google, que actúa como responsable independiente y puede usar cookies (política de Google: policies.google.com/privacy). Si no lo aceptas, no se envía nada a Google.",
          ],
        },
        {
          title: "Enlaces externos",
          body: [
            "Al abrir un enlace a Google Maps, TripAdvisor, Facebook o La Voz de Galicia sales de esta web y se aplican las políticas de privacidad de esos servicios.",
          ],
        },
        {
          title: "Tus derechos",
          body: [
            "Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad escribiendo a {email}, con una copia de un documento que acredite tu identidad.",
            "Si crees que no hemos atendido bien tu solicitud, puedes presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).",
          ],
        },
        {
          title: "Menores y cambios",
          body: [
            "Esta web no está dirigida a menores de 14 años. Esta política puede actualizarse; la fecha de la última versión aparece arriba.",
          ],
        },
      ],
    },
    cookies: {
      title: "Cookies",
      lead: "Qué cookies y tecnologías parecidas usa esta web, conforme al artículo 22.2 de la LSSI-CE y a la guía sobre cookies de la AEPD.",
      sections: [
        {
          title: "En resumen",
          body: [
            "Al entrar te preguntamos con un aviso. Hasta que eliges, la web no carga nada que instale cookies, ni propias ni de terceros. Si rechazas, todo funciona igual salvo el mapa incrustado: tienes la dirección y el enlace para abrirla en Google Maps.",
            "No usamos cookies de analítica ni de publicidad. Las tipografías se sirven desde la propia web, sin conectar con Google Fonts.",
          ],
        },
        {
          title: "Tu elección",
          body: [
            "Lo que eliges en el aviso se guarda en tu navegador (almacenamiento local, clave «dp-consent»): si aceptas o no el mapa y la fecha. Es un dato técnico, necesario para respetar tu decisión, que no sale de tu dispositivo. Te lo volvemos a preguntar al cabo de un año.",
            "Puedes cambiar de opinión cuando quieras con «Configurar cookies», al pie de cada página o en el botón de aquí abajo.",
          ],
        },
        {
          title: "Cookies de Google Maps",
          body: [
            "Solo si aceptas el mapa (en el aviso, en «Configurar cookies» o con el botón «Cargar mapa»), tu navegador se conecta con Google, que puede instalar sus propias cookies, por ejemplo para recordar preferencias o medir el uso del mapa. Google actúa como responsable independiente: policies.google.com/technologies/cookies.",
          ],
        },
        {
          title: "Qué se guarda",
          body: [],
          list: [
            "dp-consent · esta web · tu elección sobre las cookies · 12 meses",
            "Cookies de Google · Google LLC · funcionamiento del mapa · las que indique Google · solo si aceptas el mapa",
          ],
        },
        {
          title: "Cómo retirar el permiso y borrarlas",
          body: [
            "Para retirar el permiso, entra en «Configurar cookies» y desactiva el mapa: deja de cargarse al momento. Las cookies que Google ya hubiera instalado se borran desde los ajustes de tu navegador (Chrome, Safari, Firefox o Edge).",
          ],
        },
      ],
    },
  },
};

const notFound = {
  title: "Esta puerta no lleva a ningún sitio",
  text: "Pero hay otras dos que sí.",
  back: "Volver a la barra",
};

const es = { common, nav, cover, puertas, hero, manifesto, barra, vinos, historia, social, interior, visita, faq, footer, consent, seo, legal, notFound };
export default es;
