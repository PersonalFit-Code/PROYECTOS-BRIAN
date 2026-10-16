import type { Traducion } from "./traducion";

/** Cabeceira, menú lateral e pé: etiquetas das seccións (ver `messages/es/nav.ts`). */
const nav: Traducion<"nav"> = {
  items: {
    home: "Inicio",
    servicios: "Servizos",
    equipo: "Equipo",
    galeria: "Galería",
    resenas: "Opinións",
    bonos: "Bonos",
    contacto: "Contacto",
  },
  subheadings: {
    home: "A portada",
    servicios: "Manicura, pedicura, nail art e mirada",
    equipo: "Quen te atende",
    galeria: "Traballos recentes",
    resenas: "O que din as nosas clientas",
    bonos: "Bonos e tarxetas agasallo",
    contacto: "Onde estamos e horario",
  },
  menu: { label: "Menú", open: "Abrir o menú", close: "Pechar o menú", heading: "Navegación" },
  homeAria: "Andrea Salón — inicio",
  mainAria: "Principal",
  languageSwitcher: "Cambiar de idioma",
  language: {
    label: "Idioma",
    current: "Idioma actual: {language}",
    switchTo: "Cambiar a {language}",
  },
  footer: {
    about: "Salón de unllas e beleza en Ourense. Manicura rusa, pedicura, nail art e deseño de mirada, con cita en liña.",
    contact: "Contacto",
    hours: "Horario",
    location: "Onde estamos",
    links: "O salón",
    legal: "Legal",
    cookieSettings: "Configurar as cookies",
    rights: "© {year} Andrea Salón · Ourense",
    backToTop: "Volver arriba",
    preview: "Versión en construción · fotos e textos pendentes de validar co salón",
  },
};
export default nav;
