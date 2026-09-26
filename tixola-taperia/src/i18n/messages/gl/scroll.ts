import type { Section } from "./shape";

/**
 * Textos do módulo de scroll cinematográfico: navegación lateral por capítulos,
 * barra de progreso e accesibilidade dos saltos entre seccións.
 */
const scroll: Section<"scroll"> = {
  /** Etiquetas dos capítulos (por id de sección: hero, platos, experiencia, opiniones, footer) */
  chapters: {
    hero: "Inicio",
    dishes: "Pratos",
    experience: "Localización",
    social: "Opinións",
    footer: "Contacto",
  },
  nav: {
    /** aria-label do <nav> lateral cos puntos */
    label: "Capítulos da páxina",
    /** aria-label de cada punto */
    goTo: "Ir ao capítulo {chapter}",
    /** Sufixo só para lectores de pantalla no capítulo activo */
    current: "capítulo actual",
  },
  /** aria-label da barra de progreso superior */
  progress: "Progreso da páxina",
  /** aria-valuetext da barra de progreso */
  progressValue: "{percent} % da páxina",
};
export default scroll;
