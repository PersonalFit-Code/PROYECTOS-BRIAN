import type { Section } from "./shape";

/**
 * Sección "Experiencia e localización" (#experiencia): marquesiña, bloque cinematográfico da
 * terraza, liña do tempo "Un día en Tixola", estado en vivo e tarxeta de localización con mapa 3D.
 * Os marcadores {así} énchense con useFormat().
 */
const experience: Section<"experience"> = {
  marquee: [
    "Zamburiñas á prancha",
    "Polbo con grelos",
    "Viños do Ribeiro, Valdeorras e Rías Baixas",
    "Cervexa artesá",
    "Terraza á beira da Catedral",
    "Croquetas caseiras",
    "Tixolas de ferro",
  ],
  marqueeAria: "Especialidades da casa",
  marqueePause: "Pausar as especialidades",
  marqueePlay: "Retomar as especialidades",
  kicker: "A experiencia",
  title: "Tapeo con vistas á",
  accent: "Catedral",
  description:
    "A nosa terraza mira á Catedral de San Martiño e á igrexa de Santa Eufemia, en pleno casco histórico: a «zona dos viños» de Ourense, onde o tapeo é unha forma de vivir a cidade.",
  storyTitle: "Un día en Tixola",
  storyKicker: "Da caña do mediodía á última copa",
  story: [
    { time: "13:00", title: "Mediodía na terraza", text: "Unha caña con tapa e as croquetas de grelo mentres a praza se enche." },
    { time: "20:00", title: "A hora dos viños", text: "Godello, Ribeiro ou Mencía por copas, acompañados de zamburiñas á prancha." },
    { time: "22:00", title: "Cea de tixolas", text: "Tixolas de ferro que chegan á mesa aínda chiando. Para compartir." },
  ],
  photoCaption: "A nosa terraza na Rúa Juan de Austria, coa igrexa de Santa Eufemia ao fondo",
  photoBadge: "Foto real",
  /** Tarxeta "estado en vivo" (as etiquetas de estado saen de common.status). */
  status: {
    kicker: "Agora mesmo",
    liveAria: "Estado de apertura en tempo real",
    today: "Hoxe",
    restDay: "Hoxe descansamos",
    hoursTitle: "Horario semanal",
    hoursCaption: "Horario semanal de {brand}",
    closed: "Pechado",
    note: "Horario segundo a nosa ficha de Google · Domingos pechado · Festivos: consúltanos",
    reserveHint: "Gardámosche mesa?",
  },
  map: {
    kicker: "Onde estamos",
    title: "Rúa Juan de Austria, 7",
    subtitle: "A un minuto a pé da Catedral",
    distance: "A un minuto da Catedral",
    area: "Casco histórico peonil · zona dos viños",
    dragHint: "Arrastra para xirar o mapa",
    dragHintTouch: "Despraza para xirar o mapa",
    view3d: "Vista 3D",
    photo: "Foto real",
    realMap: "Ver o mapa real",
    hideMap: "Ocultar o mapa",
    legend: "Lenda do mapa",
    legendYou: "Tixola",
    legendCathedral: "Catedral de San Martiño",
    legendChurch: "Santa Eufemia",
    plusCode: "Plus code",
    mapAria: "Mapa 3D estilizado da mazá da Rúa Juan de Austria coa Catedral de San Martiño, a igrexa de Santa Eufemia e a localización de Tixola Tapería",
    embedTitle: "Localización de {brand} en Google Maps",
    askWaiter: "Pregúntalle ao camareiro virtual como chegar",
    askWaiterPrefill: "Como chego a Tixola desde a Catedral de Ourense?",
    pauseRotation: "Pausar o xiro do mapa",
    playRotation: "Retomar o xiro do mapa",
  },
};
export default experience;
