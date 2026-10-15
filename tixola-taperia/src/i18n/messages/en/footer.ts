import type esFooter from "@/i18n/messages/es/footer";
import type { Translation } from "./shape";

/** Footer: columns, opening hours, legal links and bottom bar. */
const footer = {
  about:
    "Quality Galician tapas, craft beer and local wines in a good-looking bar with a terrace, just metres from Ourense Cathedral.",
  tixolaMeaning: "“Tixola” is Galician for frying pan: the iron one that reaches your table still sizzling.",
  contact: "Contact",
  /* It is also the fourth chip in the mobile bottom bar (MobileStickyBar): "Opening hours" wraps
     onto two lines at 390 px and leaves that column taller than the other three. "Hours" is what
     half the hospitality trade in Britain puts at the head of that column, and it fits. */
  hours: "Hours",
  links: "Menu & links",
  legal: "Legal",
  privacy: "Privacy policy",
  legalNotice: "Legal notice",
  cookies: "Cookie policy",
  cookieSettings: "Cookie settings",
  backToTop: "Back to top",
  rights: "All rights reserved.",
  menuWithAllergens: "Menu with allergens",
  ratingsAria: "Ratings",
  hoursCaption: "Weekly opening hours for {name}",
  todaySr: "(today)",
  closedDay: "Closed",
  kitchenNote: "Kitchen open throughout each service.",
} satisfies Translation<typeof esFooter>;
export default footer;
