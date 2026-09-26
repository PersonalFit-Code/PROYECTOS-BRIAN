/**
 * Sección "Experiencia y ubicación" (#experiencia): marquesina, bloque cinematográfico de la
 * terraza, línea de tiempo "Un día en Tixola", estado en vivo y tarjeta de ubicación con mapa 3D.
 * Los marcadores {así} se rellenan con useFormat().
 */
const experience = {
  marquee: [
    "Zamburiñas a la plancha",
    "Pulpo con grelos",
    "Vinos de Ribeiro, Valdeorras y Rías Baixas",
    "Cerveza artesana",
    "Terraza junto a la Catedral",
    "Croquetas caseras",
    "Tixolas de hierro",
  ],
  marqueeAria: "Especialidades de la casa",
  marqueePause: "Pausar las especialidades",
  marqueePlay: "Reanudar las especialidades",
  kicker: "La experiencia",
  title: "Tapeo con vistas a la",
  accent: "Catedral",
  description:
    "Nuestra terraza mira a la Catedral de San Martiño y a la iglesia de Santa Eufemia, en pleno casco histórico: la \"zona de viños\" de Ourense, donde el tapeo es una forma de vivir la ciudad.",
  storyTitle: "Un día en Tixola",
  storyKicker: "De la caña del mediodía a la última copa",
  story: [
    { time: "13:00", title: "Mediodía en la terraza", text: "Una caña con tapa y las croquetas de grelo mientras la plaza se llena." },
    { time: "20:00", title: "La hora de los viños", text: "Godello, Ribeiro o Mencía por copas, acompañados de zamburiñas a la plancha." },
    { time: "22:00", title: "Cena de tixolas", text: "Sartenes de hierro que llegan chisporroteando a la mesa. Para compartir." },
  ],
  photoCaption: "Nuestra terraza en Rúa Juan de Austria, con la iglesia de Santa Eufemia al fondo",
  photoBadge: "Foto real",
  /** Tarjeta "estado en vivo" (las etiquetas de estado salen de common.status). */
  status: {
    kicker: "Ahora mismo",
    liveAria: "Estado de apertura en tiempo real",
    today: "Hoy",
    restDay: "Hoy descansamos",
    hoursTitle: "Horario semanal",
    hoursCaption: "Horario semanal de {brand}",
    closed: "Cerrado",
    note: "Horario según nuestra ficha de Google · Domingos cerrado · Festivos: consúltanos",
    reserveHint: "¿Te guardamos mesa?",
  },
  map: {
    kicker: "Dónde estamos",
    title: "Rúa Juan de Austria, 7",
    subtitle: "A un minuto a pie de la Catedral",
    distance: "A un minuto de la Catedral",
    area: "Casco histórico peatonal · zona de viños",
    dragHint: "Arrastra para girar el mapa",
    dragHintTouch: "Desliza para girar el mapa",
    view3d: "Vista 3D",
    photo: "Foto real",
    realMap: "Ver mapa real",
    hideMap: "Ocultar mapa",
    legend: "Leyenda del mapa",
    legendYou: "Tixola",
    legendCathedral: "Catedral de San Martiño",
    legendChurch: "Santa Eufemia",
    plusCode: "Plus code",
    mapAria: "Mapa 3D estilizado de la manzana de Rúa Juan de Austria con la Catedral de San Martiño, la iglesia de Santa Eufemia y la ubicación de Tixola Tapería",
    embedTitle: "Ubicación de {brand} en Google Maps",
    askWaiter: "Pregunta al camarero virtual cómo llegar",
    askWaiterPrefill: "¿Cómo llego a Tixola desde la Catedral de Ourense?",
    pauseRotation: "Pausar el giro del mapa",
    playRotation: "Reanudar el giro del mapa",
  },
} as const;
export default experience;
