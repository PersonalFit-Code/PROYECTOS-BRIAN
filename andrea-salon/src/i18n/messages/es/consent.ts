/** Aviso de cookies y panel de preferencias (una sola categoría opcional: el mapa de Google). */
const consent = {
  title: "Cookies, solo si tú quieres",
  settingsTitle: "Configurar cookies",
  text: "Aquí no hay cookies de analítica ni de publicidad. Lo único que las usa es el mapa de Google, y no se carga hasta que lo aceptes.",
  policy: "Política de cookies",
  accept: "Aceptar todas",
  reject: "Rechazar",
  configure: "Configurar",
  save: "Guardar mi selección",
  close: "Cerrar sin cambiar nada",
  aria: "Aviso de cookies",
  necessary: {
    title: "Necesarias",
    always: "Siempre activas",
    text: "Guardan en tu navegador lo que eliges aquí y el idioma, para no preguntártelo en cada página. No salen de tu dispositivo.",
  },
  maps: {
    title: "Mapa de Google",
    text: "Carga Google Maps para ver cómo llegar sin salir de la web. Al cargarlo, Google puede instalar sus propias cookies.",
  },
  footerLink: "Configurar cookies",
} as const;
export default consent;
