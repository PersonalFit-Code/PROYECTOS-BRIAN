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
  peinado: "corto" | "melena" | "mono" | "rizo" | "barba";
  /** Lo que le puedes pedir o sacar de él, dicho en una frase y con dónde encontrarlo. */
  sacar: { txt: string; href: string }[];
}

export const PUESTO: Record<Puesto, FichaPuesto> = {
  captacion: {
    nombre: "Leo", cargo: "Captación", camiseta: "#2c4a78", pelo: "#3b2a20", piel: "#e8bf9c", peinado: "corto",
    hace: "Busca cada noche infoproductores y coaches que venden por mensajes de Instagram (los que piden «comenta X», hacen anuncios a DM o buscan setter) y les encuentra su cuenta.",
    sacar: [
      { txt: "La lista de infoproductores y coaches a los que escribir", href: "#trabajo" },
      { txt: "Su cuenta de Instagram comprobada, sin repetir ninguno", href: "#trabajo" },
      { txt: "Cargar tú una lista que tengas en un CSV", href: "/importar" },
    ],
  },
  diagnostico: {
    nombre: "Dora", cargo: "Diagnóstico", camiseta: "#2e5a4e", pelo: "#231d2e", piel: "#d9a77f", peinado: "melena",
    hace: "Mira el Instagram de cada uno (sus reels, sus comentarios y su bio) y apunta dónde pierde ventas por los mensajes, con la publicación como prueba.",
    sacar: [
      { txt: "Por qué escribirle a cada uno: su problema, con la prueba", href: "#trabajo" },
      { txt: "El detalle para abrir la conversación sin sonar a plantilla", href: "#trabajo" },
    ],
  },
  guion: {
    nombre: "Gus", cargo: "Mensajes", camiseta: "#4a3aa6", pelo: "#7a4122", piel: "#f0cdb0", peinado: "rizo",
    hace: "Prepara la secuencia de mensajes de Instagram para cada uno: primer mensaje, respuestas y seguimientos, con tu forma de hablar.",
    sacar: [
      { txt: "Los mensajes listos para copiar y pegar en Instagram", href: "#escribir" },
      { txt: "Cuándo mandar cada seguimiento si no contesta", href: "#escribir" },
      { txt: "Qué decir si te pide una llamada", href: "#escribir" },
    ],
  },
  oferta: {
    nombre: "Olga", cargo: "Oferta", camiseta: "#76303d", pelo: "#b98a3e", piel: "#e9bf9d", peinado: "mono",
    hace: "Cuando alguien dice que le interesa, le escribe la propuesta para entrar en la beta.",
    sacar: [
      { txt: "La propuesta escrita para los interesados", href: "#trabajo" },
      { txt: "Quién está esperando respuesta en el pipeline", href: "/pipeline" },
    ],
  },
  diseno: {
    nombre: "Dani", cargo: "Diseño", camiseta: "#3a3a46", pelo: "#1b1820", piel: "#b98463", peinado: "barba",
    hace: "Monta la propuesta visual para los interesados: lo que hemos visto en su cuenta y lo que el agente haría por ellos.",
    sacar: [
      { txt: "La propuesta visual para enseñar en la llamada", href: "#trabajo" },
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
