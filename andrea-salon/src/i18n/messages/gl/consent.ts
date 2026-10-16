import type { Traducion } from "./traducion";

/** Aviso de cookies e panel de preferencias (ver `messages/es/consent.ts`). */
const consent: Traducion<"consent"> = {
  title: "Cookies, só se ti queres",
  settingsTitle: "Configurar as cookies",
  text: "Aquí non hai cookies de analítica nin de publicidade. O único que as usa é o mapa de Google, e non se carga ata que o aceptes.",
  policy: "Política de cookies",
  accept: "Aceptar todas",
  reject: "Rexeitar",
  configure: "Configurar",
  save: "Gardar a miña selección",
  close: "Pechar sen cambiar nada",
  aria: "Aviso de cookies",
  necessary: {
    title: "Necesarias",
    always: "Sempre activas",
    text: "Gardan no teu navegador o que escolles aquí e o idioma, para non preguntarcho en cada páxina. Non saen do teu dispositivo.",
  },
  maps: {
    title: "Mapa de Google",
    text: "Carga Google Maps para ver como chegar sen saír da web. Ao cargalo, Google pode instalar as súas propias cookies.",
  },
  footerLink: "Configurar as cookies",
};
export default consent;
