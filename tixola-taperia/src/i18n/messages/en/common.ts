import type esCommon from "@/i18n/messages/es/common";
import type { Translation } from "./shape";

/**
 * Copy shared across the whole site: brand, CTAs, days and opening status.
 * Placeholders like {phone} are filled with useFormat(): t(m.common.cta.callNumber, { phone }).
 */
const common = {
  brand: "Tixola Tapería",
  brandShort: "Tixola",
  tagline: "The Art of Tapas in the Heart of Ourense",
  /* Home meta description (layout.tsx appends the Google rating note): carries the brief's local
     intent pair — tapas + Ourense — and stays within 160 characters. */
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
    /* Short label for the mobile bottom bar: "Get directions" wraps onto two lines and gets clipped in a four-column grid at 390 px. */
    directionsShort: "Directions",
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
  notFound: {
    kicker: "404",
    title: "This table doesn't exist",
    text: "The page you're looking for isn't on the menu. Head back home or take a look at our dishes.",
    back: "Back to the homepage",
  },
} satisfies Translation<typeof esCommon>;
export default common;
