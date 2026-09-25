const legal = {
  privacy: { title: "Política de privacidad", slug: "privacidad" },
  legalNotice: { title: "Aviso legal", slug: "aviso-legal" },
  cookies: { title: "Política de cookies", slug: "cookies" },
  updated: "Última actualización",
  banner: {
    title: "Usamos cookies",
    text: "Utilizamos cookies propias necesarias para el funcionamiento del sitio y, si lo aceptas, cookies de análisis para mejorar la experiencia.",
    accept: "Aceptar todas",
    reject: "Solo necesarias",
    settings: "Configurar",
    save: "Guardar preferencias",
    necessary: "Necesarias",
    necessaryDesc: "Imprescindibles para que la web funcione (idioma, consentimiento).",
    analytics: "Analítica",
    analyticsDesc: "Nos ayudan a entender cómo se usa la web. Solo con tu consentimiento.",
    more: "Más información",
  },
} as const;
export default legal;
