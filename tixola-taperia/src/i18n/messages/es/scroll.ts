/**
 * Textos del módulo de scroll cinematográfico: navegación lateral por capítulos,
 * barra de progreso y accesibilidad de los saltos entre secciones.
 */
const scroll = {
  /** Etiquetas de los capítulos (por id de sección: hero, platos, experiencia, opiniones, footer) */
  chapters: {
    hero: "Inicio",
    dishes: "Platos",
    experience: "Ubicación",
    social: "Opiniones",
    footer: "Contacto",
  },
  nav: {
    /** aria-label del <nav> lateral con los puntos */
    label: "Capítulos de la página",
    /** aria-label de cada punto */
    goTo: "Ir al capítulo {chapter}",
    /** Sufijo solo para lectores de pantalla en el capítulo activo */
    current: "capítulo actual",
    /** Numeración pequeña junto al nombre del capítulo */
    chapter: "Capítulo {index}",
  },
  /** aria-label de la barra de progreso superior */
  progress: "Progreso de la página",
  /** aria-valuetext de la barra de progreso */
  progressValue: "{percent} % de la página",
  /** Texto del salto oculto al final de la navegación lateral */
  backToTop: "Volver al principio",
} as const;
export default scroll;
