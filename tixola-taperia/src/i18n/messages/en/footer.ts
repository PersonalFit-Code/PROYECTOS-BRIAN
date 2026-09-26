import type esFooter from "@/i18n/messages/es/footer";
import type { Translation } from "./shape";

/** Footer: columns, opening hours, legal links and bottom bar. */
const footer = {
  about:
    "Quality Galician tapas, craft beer and local wines in a lively bar with a terrace, just metres from Ourense Cathedral.",
  tixolaMeaning: "“Tixola” is Galician for frying pan: the iron one that reaches your table still sizzling.",
  contact: "Contact",
  hours: "Opening hours",
  links: "Menu & links",
  legal: "Legal",
  privacy: "Privacy policy",
  legalNotice: "Legal notice",
  cookies: "Cookie policy",
  cookieSettings: "Cookie settings",
  backToTop: "Back to top",
  rights: "All rights reserved.",
  credit: "Web design",
  creditBy: "Your studio",
  menuWithAllergens: "Menu with allergens",
  ratingsAria: "Ratings",
  hoursCaption: "Weekly opening hours of {name}",
  todaySr: "(today)",
  closedDay: "Closed",
  kitchenNote: "Kitchen open throughout each service.",
} satisfies Translation<typeof esFooter>;
export default footer;
