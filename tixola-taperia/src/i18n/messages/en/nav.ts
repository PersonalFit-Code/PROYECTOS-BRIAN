import type esNav from "@/i18n/messages/es/nav";
import type { Translation } from "./shape";

/** Header, mobile menu and language switcher. */
const nav = {
  links: {
    dishes: "Signature dishes",
    menu: "Menu",
    location: "Find us",
    reviews: "Reviews",
  },
  /** Short labels for the desktop bar (wide-tracked Cinzel takes up a lot of room). */
  shortLinks: {
    dishes: "Dishes",
    menu: "Menu",
    location: "Find us",
    reviews: "Reviews",
  },
  openMenu: "Open menu",
  closeMenu: "Close menu",
  home: "Home",
  languageSwitcher: "Change language",
  /** aria-label of the brand link */
  homeAria: "Tixola Tapería — home",
  /** aria-label of the main <nav> */
  mainAria: "Main",
  /** aria-label of the mobile menu panel */
  mobileMenuAria: "Navigation menu",
  /** Kicker at the top of the mobile menu */
  kicker: "Tapas Bar · Wine Bar · Ourense",
  reserveTable: "Book a table",
  language: {
    label: "Language",
    current: "Current language: {language}",
    switchTo: "Switch to {language}",
  },
} satisfies Translation<typeof esNav>;
export default nav;
