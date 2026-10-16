/** Cabecera, menú lateral curvo y pie: etiquetas de las secciones. */
const nav = {
  items: {
    home: "Inicio",
    servicios: "Servicios",
    equipo: "Equipo",
    galeria: "Galería",
    resenas: "Reseñas",
    bonos: "Bonos",
    contacto: "Contacto",
  },
  /** Línea pequeña bajo cada entrada del menú lateral. */
  subheadings: {
    home: "La portada",
    servicios: "Manicura, pedicura, nail art y mirada",
    equipo: "Quién te atiende",
    galeria: "Trabajos recientes",
    resenas: "Lo que dicen nuestras clientas",
    bonos: "Bonos y tarjetas regalo",
    contacto: "Dónde estamos y horario",
  },
  menu: { label: "Menú", open: "Abrir el menú", close: "Cerrar el menú", heading: "Navegación" },
  /** aria-label del enlace de la marca en la cabecera */
  homeAria: "Andrea Salón — inicio",
  /** aria-label del <nav> principal */
  mainAria: "Principal",
  languageSwitcher: "Cambiar idioma",
  language: {
    label: "Idioma",
    current: "Idioma actual: {language}",
    switchTo: "Cambiar a {language}",
  },
  footer: {
    about: "Salón de uñas y belleza en Ourense. Manicura rusa, pedicura, nail art y diseño de mirada, con cita online.",
    contact: "Contacto",
    hours: "Horario",
    location: "Dónde estamos",
    links: "El salón",
    legal: "Legal",
    cookieSettings: "Configurar cookies",
    rights: "© {year} Andrea Salón · Ourense",
    backToTop: "Volver arriba",
    /* Mientras la web viva en el enlace privado de Vercel: lo ve Andrea, no las clientas. */
    preview: "Versión en construcción · fotos y textos pendientes de validar con el salón",
  },
} as const;
export default nav;
