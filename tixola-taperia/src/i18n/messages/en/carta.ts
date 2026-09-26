import type esCarta from "@/i18n/messages/es/carta";
import type { Translation } from "./shape";

/**
 * Copy for the /carta page (menu explorer, filters, allergen key, virtual waiter and final CTA).
 * Placeholders like {count} are filled with useFormat().
 */
const carta = {
  /* ── Heading ── */
  kicker: "Digital menu",
  title: "The Menu",
  accent: "at Tixola",
  description:
    "The whole menu at a glance: filter by category, search for a dish or ask the virtual waiter. Prices are a guide and include VAT.",
  dailyBoard: "Today's board",
  physicalMenu: "Printed menu",
  dailyBoardAlt: "Tixola Tapería's chalkboard of the day, with the specials from the fish market and the produce market",
  physicalMenuAlt: "Printed menu of Tixola Tapería in Ourense",
  polaroidsAria: "Photos of the chalkboard and the printed menu",

  /* ── Category chips ── */
  all: "Whole menu",
  categories: "Categories",
  categoriesAria: "Menu categories",
  chipCount: "{count} dishes",
  onlyThis: "Only this one",
  sectionCount: "{shown} of {total} dishes",

  /* ── Search and results ── */
  search: "Search for a dish: zamburiñas, croquetas, godello…",
  searchLabel: "Search the menu",
  searchClear: "Clear search",
  results: "{count} dishes",
  resultOne: "1 dish",
  resultsUnit: "dishes",
  resultsUnitOne: "dish",
  resultsLive: "{count} dishes found",
  resultsRegion: "Menu dishes",
  priceNote: "Prices are a guide and include VAT. Ask about today's board.",

  /* ── Filter panel ── */
  filters: "Filters",
  filtersAria: "Menu filters",
  filtersActive: "{count} active filters",
  filtersOpen: "Show filters",
  filtersClose: "Hide filters",
  showResults: "Show {count} dishes",
  preferences: "Preferences",
  preferencesAria: "Dietary tags",
  excludeAllergens: "Exclude allergens",
  excludeAllergensHint: "Tick an allergen and every dish containing it disappears from the menu.",
  excludeAllergensAria: "Allergens to exclude",
  excludeOne: "Hide dishes containing {name}",
  includeOne: "Show dishes containing {name} again",
  hidingAllergens: "Hiding {count} allergens",
  clear: "Clear filters",

  /* ── Empty state ── */
  empty: "No results with these filters",
  emptyHint: "Try removing a filter or ask the virtual waiter.",
  emptyAsk: "I can't find what I'm looking for on the menu. What do you recommend?",
  emptyAskQuery: "I'm looking for “{query}” on the menu and can't find it. What do you recommend?",

  /* ── Allergen key (modal) ── */
  legend: "Allergen key",
  legendSub: "The 14 EU allergens, dish by dish",
  legendKicker: "Allergens",
  legendLink: "See allergen key",
  legendFooter: "Unsure about an allergen?",
  legendClose: "Close key",
  legendCode: "Code {code}",
  legendNote:
    "Allergen information in accordance with Regulation (EU) No 1169/2011. If in any doubt, ask our staff: our kitchen handles all the allergens.",
  noAllergens: "No declared allergens",
  allergensAria: "Allergens",

  /* ── Dish card ── */
  tagsAria: "Features",
  pairing: "Pairs with",
  variants: "Options",
  photoOf: "{name}, a dish from Tixola Tapería in Ourense",
  askAboutDish: "What can you tell me about {name}? Does it contain any allergens, and which wine should I pair it with?",
  askAboutDishCta: "Ask the waiter",
  askAboutDishAria: "Ask the virtual waiter about {name}",

  /* ── Virtual waiter ── */
  askWaiter: "Ask the virtual waiter",
  askWaiterKicker: "Virtual waiter",
  askWaiterSub: "Gluten-free? Which wine goes with the octopus? Anything vegan? Get an answer on the spot.",
  askWaiterHint: "Try asking",
  askWaiterCta: "Open the chat",
  askWaiterNote: "Answers are based on the menu and today's opening hours. For serious allergies, always check with our staff.",

  /* ── Final CTA ── */
  ctaKicker: "Beside the Cathedral",
  ctaTitle: "Feeling hungry?",
  ctaLead: "Feeling",
  ctaAccent: "hungry?",
  ctaText: "Book a table or drop by for a few glasses of wine beside the Cathedral.",
} satisfies Translation<typeof esCarta>;
export default carta;
