import type esExperience from "@/i18n/messages/es/experience";
import type { Translation } from "./shape";

/**
 * "Experience and location" section (#experiencia): marquee, cinematic terrace block,
 * "A day at Tixola" timeline, live status and location card with 3D map.
 * Placeholders like {brand} are filled with useFormat().
 */
const experience = {
  marquee: [
    "Grilled zamburiñas",
    "Octopus with grelos",
    "Wines from Ribeiro, Valdeorras and Rías Baixas",
    "Craft beer",
    "Terrace beside the Cathedral",
    "Homemade croquetas",
    "Iron skillets",
  ],
  marqueeAria: "House specialities",
  kicker: "The experience",
  title: "Tapas with a view of the",
  accent: "Cathedral",
  description:
    "Our terrace looks out onto San Martiño Cathedral and the church of Santa Eufemia, right in the old town: Ourense's “zona de viños”, the wine quarter where going from bar to bar for tapas is simply how the city lives.",
  storyTitle: "A day at Tixola",
  storyKicker: "From a midday caña to the last glass of the night",
  story: [
    { time: "13:00", title: "Midday on the terrace", text: "A caña (small draught beer) with a tapa and the grelo croquetas while the square fills up." },
    { time: "20:00", title: "Wine o'clock", text: "Godello, Ribeiro or Mencía by the glass, with grilled zamburiñas on the side." },
    { time: "22:00", title: "Skillet dinner", text: "Iron pans that reach the table still sizzling. Made for sharing." },
  ],
  photoCaption: "Our terrace on Rúa Juan de Austria, with the church of Santa Eufemia in the background",
  photoBadge: "Real photo",
  /** "Live status" card (status labels come from common.status). */
  status: {
    kicker: "Right now",
    liveAria: "Live opening status",
    today: "Today",
    restDay: "Today's our day off",
    hoursTitle: "Weekly opening hours",
    hoursCaption: "Weekly opening hours of {brand}",
    closed: "Closed",
    note: "Hours as listed on our Google profile · Closed on Sundays · Bank holidays: ask us",
    reserveHint: "Shall we save you a table?",
  },
  map: {
    kicker: "Where to find us",
    title: "Rúa Juan de Austria, 7",
    subtitle: "A one-minute walk from the Cathedral",
    distance: "One minute from the Cathedral",
    area: "Pedestrianised old town · wine quarter",
    dragHint: "Drag to rotate the map",
    dragHintTouch: "Swipe to rotate the map",
    view3d: "3D view",
    photo: "Real photo",
    realMap: "Show real map",
    hideMap: "Hide map",
    legend: "Map key",
    legendYou: "Tixola",
    legendCathedral: "San Martiño Cathedral",
    legendChurch: "Santa Eufemia",
    plusCode: "Plus code",
    mapAria: "Stylised 3D map of the Rúa Juan de Austria block showing San Martiño Cathedral, the church of Santa Eufemia and the location of Tixola Tapería",
    embedTitle: "Location of {brand} on Google Maps",
    askWaiter: "Ask the virtual waiter for directions",
    askWaiterPrefill: "How do I get to Tixola from Ourense Cathedral?",
  },
} satisfies Translation<typeof esExperience>;
export default experience;
