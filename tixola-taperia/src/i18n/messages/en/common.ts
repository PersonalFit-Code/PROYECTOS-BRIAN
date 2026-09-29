import type esCommon from "@/i18n/messages/es/common";
import type { Translation } from "./shape";

/**
 * Copy shared across the whole site: brand, CTAs, days, opening status, reservation modal.
 * Placeholders like {phone} are filled with useFormat(): t(m.common.cta.callNumber, { phone }).
 */
const common = {
  brand: "Tixola Tapería",
  brandShort: "Tixola",
  tagline: "The Art of Tapas in the Heart of Ourense",
  /* Meta description de la portada (layout.tsx la completa con la nota de Google): lleva la
     pareja de intención local del brief —tapas + Ourense— y se queda en ≤ 160 caracteres. */
  subtitle:
    "Tapas and sizzling iron tixolas, homemade croquetas, octopus and zamburiñas by Ourense Cathedral.",
  /* Home `keywords` (layout.tsx), one list per locale. */
  seoKeywords: [
    "tapas bar Ourense",
    "tapas Ourense",
    "Ourense Cathedral tapas",
    "Galician scallops Ourense",
    "Galician octopus Ourense",
    "Tixola",
    "Galician wines",
    "craft beer Ourense",
    "where to eat Ourense old town",
  ],
  cta: {
    menu: "See the Menu",
    menuShort: "View Menu",
    call: "Call",
    callNumber: "Call {phone}",
    directions: "Get directions",
    directionsAria: "Get directions (opens Google Maps)",
    /* Etiqueta corta para la barra inferior de móvil: "Get directions" parte en dos líneas y se corta en una rejilla de cuatro columnas a 390 px. */
    directionsShort: "Route",
    whatsapp: "WhatsApp",
    whatsappAria: "Message us on WhatsApp",
    chat: "Virtual waiter",
    openMaps: "Open in Google Maps",
  },
  misc: {
    close: "Close",
    open: "Open",
    back: "Back",
    loading: "Loading…",
    seeAll: "See all",
    seeMore: "See more",
    next: "Next",
    prev: "Previous",
    skipToContent: "Skip to content",
    language: "Language",
    perPerson: "per person",
    reviews: "reviews",
    onGoogle: "on Google",
    today: "today",
    ratingLabel: "{value} out of 5 on Google from {count} reviews",
    quickActions: "Quick actions",
    optional: "optional",
    newTab: "opens in a new tab",
    noBooking: "We don't take bookings — tables are first come, first served.",
  },
  days: {
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",
  },
  status: {
    openNow: "Open now",
    closingSoon: "Closing soon",
    closedNow: "Closed now",
    closed: "Closed",
    opensIn: "Opens in {minutes} min",
    closesAt: "Closes at {time}",
    opensTodayAt: "Opens today at {time}",
    opensTomorrowAt: "Opens tomorrow at {time}",
    opensOnAt: "Opens on {day} at {time}",
    checkHours: "Check opening hours",
    checking: "Checking opening hours…",
    moodLunch: "Perfect for lunch",
    moodDinner: "Perfect for dinner",
    moodWine: "Perfect for a glass of wine",
    hours: "Opening hours",
  },
  /** "Book your table" modal (call, WhatsApp and form → WhatsApp message). */
  notFound: {
    kicker: "404",
    title: "This table does not exist",
    text: "The page you are looking for is not on the menu. Head back home or take a look at our dishes.",
    back: "Back to the home page",
  },
} satisfies Translation<typeof esCommon>;
export default common;
