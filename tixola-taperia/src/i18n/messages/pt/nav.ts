import type esNav from "@/i18n/messages/es/nav";
import type { Translation } from "./shape";

/** Cabeçalho, menu móvel e seletor de idioma. */
const nav = {
  links: {
    dishes: "Pratos estrela",
    menu: "Ementa",
    location: "Localização",
    reviews: "Opiniões",
  },
  /** Etiquetas curtas para a barra de secretária (Cinzel com tracking amplo ocupa muito). */
  shortLinks: {
    dishes: "Pratos",
    menu: "Ementa",
    location: "Localização",
    reviews: "Opiniões",
  },
  openMenu: "Abrir menu",
  closeMenu: "Fechar menu",
  home: "Início",
  languageSwitcher: "Mudar de idioma",
  /** aria-label da ligação da marca */
  homeAria: "Tixola Tapería — início",
  /** aria-label do <nav> principal */
  mainAria: "Principal",
  /** aria-label do painel do menu móvel */
  mobileMenuAria: "Menu de navegação",
  /** Kicker que encabeça o menu móvel */
  kicker: "Tapería · Vinoteca · Ourense",
  reserveTable: "Reservar mesa",
  language: {
    label: "Idioma",
    current: "Idioma atual: {language}",
    switchTo: "Mudar para {language}",
  },
} satisfies Translation<typeof esNav>;
export default nav;
