/** Cabecera, menú móvil y selector de idioma. */
const nav = {
  links: {
    dishes: "Platos estrella",
    menu: "Carta",
    location: "Ubicación",
    reviews: "Opiniones",
  },
  /** Etiquetas cortas para la barra de escritorio (Cinzel con tracking amplio ocupa mucho). */
  shortLinks: {
    dishes: "Platos",
    menu: "Carta",
    location: "Ubicación",
    reviews: "Opiniones",
  },
  openMenu: "Abrir menú",
  closeMenu: "Cerrar menú",
  home: "Inicio",
  languageSwitcher: "Cambiar idioma",
  /** aria-label del enlace de la marca */
  homeAria: "Tixola Tapería — inicio",
  /** aria-label del <nav> principal */
  mainAria: "Principal",
  /** aria-label del panel de menú móvil */
  mobileMenuAria: "Menú de navegación",
  /** Kicker que encabeza el menú móvil */
  kicker: "Tapería · Vinoteca · Ourense",
  reserveTable: "Reservar mesa",
  language: {
    label: "Idioma",
    current: "Idioma actual: {language}",
    switchTo: "Cambiar a {language}",
  },
} as const;
export default nav;
