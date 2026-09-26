import type esChat from "@/i18n/messages/es/chat";
import type { Translation } from "./shape";

/**
 * Virtual waiter copy: launcher, widget and templates for the offline engine (`offline.*`).
 * Placeholders like {dish} are filled with useFormat() / format().
 */
const chat = {
  launcher: "Virtual waiter",
  launcherAria: "Open Tixola's virtual waiter",
  closeAria: "Close the virtual waiter",
  title: "Virtual waiter",
  subtitle: "Here to help with the menu, allergens, opening hours and bookings",
  placeholder: "Type your question…",
  inputLabel: "Your question for the virtual waiter",
  inputHint: "Enter to send · Shift + Enter for a new line",
  send: "Send",
  stop: "Stop the reply",
  thinking: "Typing…",
  welcome:
    "Hi! I'm Tixola's virtual waiter. Ask me about the menu, allergens, which wine goes with each dish, or how to find us.",
  quickReplies: [
    "Which dishes are gluten-free?",
    "What do you recommend for sharing?",
    "Which wine goes with the octopus?",
    "What time do you open today?",
    "Do you have vegan options?",
  ],
  quickRepliesLabel: "Frequently asked questions",
  messagesLabel: "Conversation with the virtual waiter",
  you: "You",
  waiter: "Virtual waiter",
  offlineNote: "Offline mode: I'm answering with the menu and opening-hours information.",
  fallbackNote: "The AI assistant isn't available right now; I'm answering with the menu and opening-hours information.",
  error: "I couldn't answer just now. Please try again or give us a call.",
  rateLimited: "You've sent a lot of questions in a row. Wait a minute, or call us and we'll help you straight away.",
  retry: "Retry",
  disclaimer: "Answers are for guidance only. For serious allergies, always check with our staff.",
  reserveCta: "Book a table",
  callCta: "Call",
  clear: "New conversation",
  cleared: "Conversation reset.",
  poweredBy: "AI assistant",
  /** Templates for the deterministic engine (no API key, or when the model fails). */
  offline: {
    greeting:
      "Hi! I'm Tixola's virtual waiter. I can tell you what's in each dish, what's gluten-free or dairy-free, which wine goes with what, our opening hours and how to find us. Where shall we start?",
    thanks: "My pleasure! I'm here whenever you need me. And if you fancy coming by, we're one minute from the Cathedral.",
    allergenFree: "According to our menu, these dishes are **free from {allergen}**:",
    allergenFreeEmpty:
      "I can't find any dishes without {allergen} on the menu right now. Ask our staff: the kitchen can often adapt a dish.",
    diet: "Here are our **{diet}** options:",
    dietEmpty: "I don't have any dishes marked as {diet} on the menu, but ask our staff: the kitchen will be happy to help.",
    /** plural form for the phrase "{diet} options" */
    dietLabels: {
      vegano: "vegan",
      vegetariano: "vegetarian",
      picante: "spicy",
    },
    category: "In **{category}** ({kicker}) we have:",
    categoryEmpty: "I can't find that category on the menu.",
    recommend: "For sharing, these are the crowd favourites at Tixola:",
    recommendOutro: "With two or three of these plates, two people eat very well indeed. Shall I tell you which wines go with them?",
    pairingDish: "With **{dish}** I'd recommend **{wine}**: {why}",
    pairingDishSimple: "With **{dish}** I'd recommend **{wine}**, a Galician wine from our cellar.",
    pairingWine: "**{wine}** goes beautifully with:",
    pairingIntro: "Our house pairings, with Galician wines from our cellar:",
    hoursIntro: "Our opening hours (Ourense local time):",
    hoursNow: "Right now: {status}.",
    location: "We're at **{address}**, {landmark}. [Get directions]({url})",
    locationExtra:
      "We have a terrace with views of the Cathedral. The old town is pedestrianised, so it's best to park nearby and stroll over.",
    booking:
      "We take bookings by phone or WhatsApp so we can confirm straight away: [Call {phone}]({tel}) · [Message us on WhatsApp]({whatsapp}).",
    bookingExtra: "Let us know how many of you there are, the day and time, and whether you'd prefer the terrace.",
    prices: "Our price range is **{range} per person**, with plates designed for sharing. A few examples:",
    pricesExtra: "Prices are a guide and include VAT. We accept cards.",
    dishInfo: "**{name}** — {price}. {description}",
    dishAllergens: "Allergens: {allergens}.",
    dishNoAllergens: "No declared allergens.",
    dishPairing: "Pairs with **{wine}**.",
    safety: "For allergies or intolerances, always double-check with our staff: our kitchen handles all the allergens.",
    fallback: "I'm not sure I understood. I can help you with:",
    fallbackItems: [
      "Gluten-free, dairy-free, vegan or vegetarian dishes",
      "What's in each category: croquetas, skillets, from the sea, desserts…",
      "Which wine goes with each dish",
      "Opening hours, directions and bookings",
    ],
    fullMenu: "You'll find the full menu, with allergens dish by dish, on [the digital menu]({url}).",
    line: "**{name}** — {price}",
    lineUnit: "**{name}** — {price} · {unit}",
    lineVariants: "**{name}** — {variants}",
    linePairing: "**{name}** → {wine}",
    andMore: "…and {count} more on [the digital menu]({url}).",
    andMoreCarta: "…and {count} more right here on the menu.",
    more: "Anything else? I can help with the menu, allergens, wines, opening hours or directions.",
  },
} satisfies Translation<typeof esChat>;
export default chat;
