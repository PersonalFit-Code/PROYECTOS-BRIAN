/**
 * Datos del negocio. Fuente: su dosier oficial INFORMACION_720GYM_2025-26, el PDF de 720 Pilates
 * 2025, su Beacons y su ficha de Google (ver comercial/720gym/DATOS.md).
 *
 * PENDIENTE DE CONFIRMAR EL LUNES (todo se cambia solo aquí):
 *  - Horario: el dosier dice 06:00–00:00; Google e Instagram, 08:00–22:30. Se usa el de Google.
 *  - Teléfono: Google da el 672 00 94 51; el dosier, el 661 16 35 89 y el 687 83 12 86 (WhatsApp).
 */
export const negocio = {
  nombre: "720 GYM CLUB",
  lema: "Un nuevo concepto de gimnasio",
  direccion: {
    calle: "Calle Río Bibei, 16, bajo",
    cp: "32001",
    ciudad: "Ourense",
    completa: "Calle Río Bibei, 16, bajo · 32001 Ourense",
    lat: 42.3409,
    lng: -7.8644,
  },
  horario: {
    apertura: "08:00",
    cierre: "22:30",
    texto: "Todos los días, de 08:00 a 22:30",
    detalle: "Abierto los 365 días del año, festivos incluidos",
  },
  /** Teléfono de la ficha de Google. */
  telefono: "+34672009451",
  telefonoVisible: "672 00 94 51",
  /** WhatsApp de dudas del dosier: aquí llegan los avisos de inscripción y clase de prueba. */
  whatsapp: "34687831286",
  whatsappVisible: "687 83 12 86",
  telefonosDosier: ["661 16 35 89", "687 83 12 86"],
  email: "720gym@gmail.com",
  instagram: "https://www.instagram.com/720gym/",
  instagramUsuario: "@720gym",
  facebook: "https://www.facebook.com/720gym",
  google: {
    nota: "5,0",
    resenas: 64,
    /** Revisar nota y número antes de publicar: cambian. */
    url: "https://www.google.com/maps/search/?api=1&query=720+GYM+CLUB+Calle+R%C3%ADo+Bibei+16+Ourense",
  },
  mapaEmbed:
    "https://www.google.com/maps?q=720+GYM+CLUB,+Calle+R%C3%ADo+Bibei+16,+32001+Ourense&z=16&output=embed",
  comoLlegar: "https://www.google.com/maps/dir/?api=1&destination=Calle+R%C3%ADo+Bibei+16%2C+32001+Ourense",
  metros: "+1.000 m²",
} as const;

export const pilates = {
  nombre: "720 PILATES",
  whatsapp: "34671313162",
  whatsappVisible: "671 31 31 62",
  email: "720pilates@gmail.com",
  instagram: "https://www.instagram.com/720pilates/",
  instagramUsuario: "@720pilates",
} as const;

/** Enlace de WhatsApp con el mensaje ya escrito. */
export function wa(texto: string, numero: string = negocio.whatsapp): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}
