import type esDishes from "@/i18n/messages/es/dishes";
import type { Translation } from "./shape";

/**
 * "Signature dishes" section (#platos): real-photo carousel + detail view (DishSpotlight).
 * Placeholders like {index} are filled with useFormat(): t(m.dishes.slide, { index, total }).
 */
const dishes = {
  kicker: "Signature dishes",
  title: "What nobody leaves without trying",
  accent: "at Tixola",
  description:
    "Galician produce from the rías and the countryside, seared in our iron skillets to that ember-kissed point only hot iron can give.",
  hint: "Tap for details",
  ingredients: "Ingredients",
  allergens: "Allergens",
  noAllergens: "No declared allergens",
  allergensNote: "If you have any allergy or intolerance, let us know when ordering: we'll prepare it with care.",
  pairing: "Recommended pairing",
  pairingWhy: "Why it works",
  seeInMenu: "See on the menu",
  ctaMenu: "See the full menu with allergens",
  ctaNote: "Over 80 tapas, sharing plates and Galician wines, with all 14 EU allergens flagged dish by dish.",
  photoOf: "Photo of {name} at Tixola Tapería, Ourense",
  slide: "Dish {index} of {total}",
  /** Carousel (DishCarousel) */
  carousel: {
    label: "Signature dishes carousel",
    prev: "Previous dish",
    next: "Next dish",
    goTo: "Go to {name}",
    current: "current",
    hint: "Tap a dish to see its ingredients, allergens and wine pairing",
    swipe: "Explore the dishes",
    open: "See details of {name}",
    pause: "Pause the carousel",
    play: "Resume the carousel",
    /** Screen-reader announcement when the dish changes (only while the carousel is paused). */
    status: "{name}, dish {index} of {total}",
  },
  /** Dish detail (DishSpotlight) */
  spotlight: {
    dialogLabel: "Details of {name}",
    close: "Close dish details",
    closeOverlay: "Close",
    dragHandle: "Drag down to close",
    perUnit: "/ {unit}",
    askWaiter: "Any questions? Ask the virtual waiter",
    askWaiterPrefill: "Tell me more about {name}: how do you prepare it, and which wine would you recommend with it?",
    allergenContains: "Contains {label}",
    /** Allergen list as text, already localised: "Contains: gluten, eggs" */
    contains: "Contains: {list}",
    priceLabel: "Price",
  },
  /** Composite visual (iron skillet + icon) when the dish has no photo yet */
  visual: {
    label: "Illustration of {name} on an iron skillet",
  },
} satisfies Translation<typeof esDishes>;
export default dishes;
