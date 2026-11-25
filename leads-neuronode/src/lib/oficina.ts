/** Los cinco puestos de la oficina. Las claves coinciden con el `check` de la tabla `actividad`. */

export const PUESTOS = ["captacion", "diagnostico", "guion", "oferta", "diseno"] as const;
export type Puesto = (typeof PUESTOS)[number];

export interface FichaPuesto {
  nombre: string;
  cargo: string;
  hace: string;
  /** Colores del personaje: camiseta, pelo y piel. */
  camiseta: string;
  pelo: string;
  piel: string;
  peinado: "corto" | "melena" | "mono" | "rizo" | "gorra";
  /** Lo que le puedes pedir o sacar de él, dicho en una frase y con dónde encontrarlo. */
  sacar: { txt: string; href: string }[];
}

export const PUESTO: Record<Puesto, FichaPuesto> = {
  captacion: {
    nombre: "Leo", cargo: "Captación", camiseta: "#2e8bff", pelo: "#3b2a20", piel: "#f1c9a5", peinado: "corto",
    hace: "Busca cada noche infoproductores y coaches que venden por mensajes: los que piden «comenta X», hacen anuncios a DM o buscan setter.",
    sacar: [
      { txt: "La lista de infoproductores y coaches a los que escribir", href: "/negocios?sector=infoproducto" },
      { txt: "Sus perfiles de Instagram y su web, sin repetir ninguno", href: "/negocios?sector=infoproducto" },
      { txt: "Cargar tú una lista que tengas en un CSV", href: "/importar" },
    ],
  },
  diagnostico: {
    nombre: "Dora", cargo: "Diagnóstico", camiseta: "#178a62", pelo: "#1d1a2b", piel: "#e2b08a", peinado: "melena",
    hace: "Mira el perfil y la web de cada uno y apunta dónde pierde ventas por los mensajes, con la prueba de dónde lo ha visto.",
    sacar: [
      { txt: "Por qué escribirle a cada uno: su problema, con la prueba", href: "/hoy" },
      { txt: "El detalle para abrir la conversación sin sonar a plantilla", href: "/hoy" },
    ],
  },
  guion: {
    nombre: "Gus", cargo: "Mensajes", camiseta: "#6447fa", pelo: "#a8552a", piel: "#f4d3b5", peinado: "rizo",
    hace: "Prepara la secuencia de mensajes de Instagram para cada uno: primer mensaje, respuestas y seguimientos, con tu forma de hablar.",
    sacar: [
      { txt: "Los mensajes listos para copiar y pegar en Instagram", href: "/hoy" },
      { txt: "Cuándo mandar cada seguimiento si no contesta", href: "/hoy" },
      { txt: "Qué decir si te pide una llamada", href: "/hoy" },
    ],
  },
  oferta: {
    nombre: "Olga", cargo: "Oferta", camiseta: "#c2283b", pelo: "#d9a441", piel: "#eec3a0", peinado: "mono",
    hace: "Cuando alguien dice que le interesa, le escribe la propuesta para entrar en la beta.",
    sacar: [
      { txt: "La propuesta escrita para los interesados", href: "/negocios?estado=interesado" },
      { txt: "Quién está esperando respuesta en el pipeline", href: "/pipeline" },
    ],
  },
  diseno: {
    nombre: "Dani", cargo: "Diseño", camiseta: "#9a5208", pelo: "#15131f", piel: "#c98f66", peinado: "gorra",
    hace: "Monta la propuesta visual para los interesados: lo que hemos visto en su cuenta y lo que el agente haría por ellos.",
    sacar: [
      { txt: "La propuesta visual para enseñar en la llamada", href: "/negocios?estado=interesado" },
    ],
  },
};

export interface EstadoPuesto {
  /** Con trabajo pendiente: el personaje teclea. Si no, espera. */
  activo: boolean;
  /** Frase corta del bocadillo. */
  frase: string;
  hechos: number;
  /** Sin total no hay barra: sólo la cifra. */
  total: number | null;
  /** Texto de la cifra: «300 de 1.000 negocios». */
  cifra: string;
}

export const esPuesto = (v: string | undefined): v is Puesto => PUESTOS.includes(v as Puesto);
