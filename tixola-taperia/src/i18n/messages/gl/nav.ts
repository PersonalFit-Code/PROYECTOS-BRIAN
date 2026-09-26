import type { Section } from "./shape";

/** Cabeceira, menú móbil e selector de idioma. */
const nav: Section<"nav"> = {
  links: {
    dishes: "Pratos estrela",
    menu: "Carta",
    location: "Localización",
    reviews: "Opinións",
  },
  /** Etiquetas curtas para a barra de escritorio (Cinzel con tracking amplo ocupa moito). */
  shortLinks: {
    dishes: "Pratos",
    menu: "Carta",
    location: "Localización",
    reviews: "Opinións",
  },
  openMenu: "Abrir o menú",
  closeMenu: "Pechar o menú",
  home: "Inicio",
  languageSwitcher: "Cambiar de idioma",
  /** aria-label da ligazón da marca */
  homeAria: "Tixola Tapería — inicio",
  /** aria-label do <nav> principal */
  mainAria: "Principal",
  /** aria-label do panel de menú móbil */
  mobileMenuAria: "Menú de navegación",
  /** Kicker que encabeza o menú móbil */
  kicker: "Tapería · Vinoteca · Ourense",
  reserveTable: "Reservar mesa",
  language: {
    label: "Idioma",
    current: "Idioma actual: {language}",
    switchTo: "Cambiar a {language}",
  },
};
export default nav;
