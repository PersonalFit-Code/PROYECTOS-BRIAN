/** Tipos y etiquetas compartidos. Los valores coinciden con los `check` de la base de datos. */

export const SECTORES = ["fitness", "clinica", "hosteleria", "infoproducto", "otro"] as const;
export type Sector = (typeof SECTORES)[number];
export const SECTOR_TXT: Record<Sector, string> = {
  fitness: "Fitness",
  clinica: "Clínica",
  hosteleria: "Hostelería",
  infoproducto: "Infoproducto y coaching",
  otro: "Otro",
};

export const ESTADOS = [
  "pendiente",
  "sin_respuesta",
  "volver",
  "interesado",
  "quiere_propuesta",
  "reunion",
  "no_interesa",
  "no_contactar",
] as const;
export type Estado = (typeof ESTADOS)[number];
export const ESTADO_TXT: Record<Estado, string> = {
  pendiente: "Pendiente",
  sin_respuesta: "Sin respuesta",
  volver: "Volver a llamar",
  interesado: "Interesado",
  quiere_propuesta: "Quiere propuesta",
  reunion: "Reunión",
  no_interesa: "No le interesa",
  no_contactar: "No contactar",
};
/** Color de la etiqueta de cada estado (clases definidas en globals.css). */
export const ESTADO_TONO: Record<Estado, string> = {
  pendiente: "tono-gris",
  sin_respuesta: "tono-gris",
  volver: "tono-ambar",
  interesado: "tono-verde",
  quiere_propuesta: "tono-marca",
  reunion: "tono-marca",
  no_interesa: "tono-rojo",
  no_contactar: "tono-rojo",
};

/** Resultados que se pueden apuntar al registrar un contacto (todos los estados menos «pendiente»). */
export const RESULTADOS = ESTADOS.filter((e) => e !== "pendiente") as Exclude<Estado, "pendiente">[];

export const CANALES = ["llamada", "formulario", "instagram", "whatsapp", "correo", "visita"] as const;
export type Canal = (typeof CANALES)[number];
export const CANAL_TXT: Record<Canal, string> = {
  llamada: "Llamada",
  formulario: "Formulario web",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  correo: "Correo",
  visita: "Visita",
};

/** «Toda España» es para quien vende por internet y no depende de una zona (infoproductores y coaches). */
export const COMUNIDADES = ["Galicia", "Andalucía", "Castilla y León", "Extremadura", "Toda España"] as const;

/** Un negocio cuenta como «contactado» cuando ya no está pendiente. */
export const esContactado = (e: Estado) => e !== "pendiente";
/** Estados que cuentan como respuesta positiva. */
export const esPositivo = (e: Estado) => e === "interesado" || e === "quiere_propuesta" || e === "reunion";

export interface Negocio {
  id: string;
  nombre: string;
  sector: Sector;
  subsector: string | null;
  comunidad: string;
  provincia: string | null;
  localidad: string | null;
  direccion: string | null;
  telefono: string | null;
  web: string | null;
  instagram: string | null;
  email_generico: string | null;
  fuente_url: string | null;
  notas: string | null;
  lote: number;
  dia: number | null;
  estado: Estado;
  creado: string;
  actualizado: string;
}

export interface Diagnostico {
  id: string;
  negocio_id: string;
  dolor: string;
  prueba: string;
  prueba_url: string | null;
}

export interface Propuesta {
  negocio_id: string;
  guion_llamada: string | null;
  /** Guion a medida, por partes (ver lib/guion.ts). */
  guion: Record<string, unknown> | null;
  mensaje_corto: string | null;
  correo_asunto: string | null;
  correo_cuerpo: string | null;
  url_visual: string | null;
  estado: "borrador" | "lista" | "enviada";
}

export interface Contacto {
  id: string;
  negocio_id: string;
  canal: Canal;
  resultado: Exclude<Estado, "pendiente">;
  nota: string | null;
  proxima_fecha: string | null;
  creado: string;
}

export const DIAS_RETO = 10;
export const POR_DIA = 100;
export const OBJETIVO = DIAS_RETO * POR_DIA;
