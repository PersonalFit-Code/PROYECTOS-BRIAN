import type { CamareroId } from "@/data/camarero";
import type { DayKey } from "@/data/business";

/** El camarero virtual en español: la referencia de los otros idiomas (mismas claves). */
const es = {
  open: "Pregunta al camarero",
  title: "El camarero",
  subtitle: "Virtual · respuestas de la casa",
  close: "Cerrar el chat",
  greeting: "¡Boas! Soy el camarero virtual del Dos Puertas. Pregúntame lo que quieras de la casa o toca una de estas preguntas.",
  nowLine: "Ahora mismo: {label}{detail}.",
  more: "Ver todas las preguntas",
  placeholder: "Escribe tu pregunta…",
  send: "Enviar",
  typing: "El camarero está escribiendo…",
  fallback: "Eso no lo tengo apuntado en la libreta. Pregúntalo en la barra o llámanos al {phone} y te lo contamos.",
  note: "Respuestas ya escritas con la información de esta web. Lo que escribes no sale de tu móvil.",
  pending: "Pendiente de confirmar con la casa",
  log: "Conversación con el camarero",
  you: "Tú",
  groups: { lugar: "Horario y sitio", funciona: "Cómo funciona", pinchos: "Pinchos", beber: "Para beber", casa: "La casa" },
  status: {
    open: "Abierto ahora",
    closesAt: "hasta las {time}",
    closingSoon: "Cierra pronto",
    opensToday: "Abre hoy a las {time}",
    closedToday: "Hoy descansamos",
    opensOn: "Abrimos el {day} a las {time}",
    opensTomorrow: "Abrimos mañana a las {time}",
    closed: "Cerrado",
  },
  days: { mon: "lunes", tue: "martes", wed: "miércoles", thu: "jueves", fri: "viernes", sat: "sábado", sun: "domingo" } satisfies Record<DayKey, string>,
  actions: {
    call: "Llamar",
    maps: "Abrir en Google Maps",
    carta: "Ver la carta",
    vinos: "Ver los vinos",
    historia: "Leer la historia",
    visita: "Horario y mapa",
    preguntas: "Más preguntas",
  },
  items: {
    ahora: {
      q: "¿Estáis abiertos ahora?",
      a: "Abrimos de miércoles a domingo, de 19:30 a 00:00. Lunes y martes descansamos.",
      keys: ["abiert", "ahora", "hoy", "cerrad", "abris hoy"],
    },
    horario: {
      q: "¿Qué horario tenéis?",
      a: "De miércoles a domingo, de 19:30 a 00:00. Lunes y martes descansamos.",
      keys: ["horari", "hora", "abris", "abren", "cierra", "cerrais", "dias", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo", "fin de semana"],
    },
    donde: {
      q: "¿Dónde estáis?",
      a: "En la Rúa dos Fornos, 7, en pleno casco histórico de Ourense y a dos pasos de la catedral: la zona de Os Viños. Busca el rótulo verde de la fachada.",
      keys: ["donde", "direccion", "ubicacion", "llegar", "calle", "mapa", "fornos", "catedral", "zona"],
    },
    telefono: {
      q: "¿Cómo os llamo?",
      a: "Al {phone}, en horario de apertura.",
      keys: ["telefono", "llamar", "llamo", "contacto", "numero", "whatsapp", "movil de"],
    },
    reservar: {
      q: "¿Se puede reservar?",
      a: "No. Esto es un bar de barra: se llega, se pide y se tapea, por orden de llegada.",
      keys: ["reserv", "grupo", "cumple", "celebra"],
    },
    mesas: {
      q: "¿Hay mesas para sentarse?",
      a: "No: aquí se tapea de pie, en la barra, como desde 1974. Es parte de la gracia.",
      keys: ["mesa", "sentar", "silla", "taburete", "de pie"],
    },
    gente: {
      q: "¿Cuándo hay más gente?",
      a: "Según los clientes, en hora punta se pone hasta arriba, sobre todo las noches del fin de semana. Eso sí: hablan de una barra rápida y bien atendida.",
      keys: ["gente", "llen", "cola", "esperar", "espera", "hora punta", "tranquil", "ambiente"],
    },
    recomienda: {
      q: "¿Qué me recomiendas?",
      a: "Los cuatro de la casa: chicharrones, «calamares», tortilla y empanadillas. Si es tu primera vez, empieza por el de calamares y el de chicharrones, que son los que más nombran las reseñas. Y como dicen los clientes, con dos o tres pinchos vas cenado.",
      keys: ["recomiend", "pincho", "comer", "especialidad", "probar", "carta", "empanadill", "rixon", "montad", "bocadill", "racion", "cenar", "tapa"],
    },
    precio: {
      q: "¿Cuánto cuesta un pincho?",
      a: "Según la pizarra de la puerta, 2 € el pincho y 4 € el bocadillo.",
      keys: ["precio", "cuesta", "cuanto", "caro", "barato", "euro", "vale un", "valen"],
    },
    calamares: {
      q: "¿Los «calamares» son calamares?",
      a: "Casi: son chipirones. El pincho nació en los 80 de una confusión con un bollito de panceta tan crujiente que los turistas lo pedían como «el de calamares», y el nombre se quedó. La familia cuenta que a Amancio Ortega le encantaron.",
      keys: ["calamar", "chipiron", "bollito", "panceta"],
    },
    chicharrones: {
      q: "¿Cómo son los chicharrones?",
      a: "Crujientes, con la receta tradicional y el pincho más buscado de la barra. Llegaron en los 90 y se hacían en casa cada día. Una clienta lo resume así: «chicharrones ricos, nada aceitosos».",
      keys: ["chicharr"],
    },
    tortilla: {
      q: "¿La tortilla lleva cebolla?",
      a: "No. Al principio la llevaba, pero mucha gente protestaba y desde los años 90 se hace sin.",
      keys: ["tortill", "ceboll", "huevo", "patata"],
    },
    vinos: {
      q: "¿Qué vinos tenéis?",
      a: "Vino gallego por copas, de las denominaciones de origen de Galicia, para acompañar la ronda. Las referencias concretas están pendientes de confirmar con la casa.",
      keys: ["vino", "albarin", "godello", "mencia", "ribeiro", "ribeira", "valdeorras", "monterrei", "copa", "tinto", "blanco", "denominacion"],
    },
    canas: {
      q: "¿Hay cañas?",
      a: "¡Claro! La caña de siempre, bien tirada, para acompañar la ronda. Un cliente lo dice así: «cañas y pinchos buenísimos».",
      keys: ["cana", "cerveza", "birra", "beber", "bebida", "refresco"],
    },
    pagar: {
      q: "¿Se puede pagar con tarjeta?",
      a: "Sí: efectivo, tarjeta y pago con el móvil.",
      keys: ["tarjeta", "pagar", "pago", "efectivo", "bizum", "cobr"],
    },
    llevar: {
      q: "¿Se puede pedir para llevar?",
      a: "Las fichas del bar en internet dicen que sí. Mejor pregúntalo en la barra o llámanos.",
      keys: ["llevar", "domicilio", "encargo", "encargar", "glovo", "pedido"],
    },
    alergenos: {
      q: "¿Tenéis información de alérgenos?",
      a: "Pregunta en la barra antes de pedir y te decimos qué lleva cada pincho.",
      keys: ["alerg", "celiac", "gluten", "intoleran", "lactosa", "vegan", "vegetarian", "sin gluten"],
    },
    perro: {
      q: "¿Puedo ir con mi perro?",
      a: "Varios clientes cuentan en sus reseñas que entraron con su perro sin problema; a uno hasta le pusieron agua.",
      keys: ["perr", "mascota", "animal", "mi perro", "con mi perro", "llevar a mi perro", "llevar al perro"],
    },
    historia: {
      q: "¿Desde cuándo está el bar?",
      a: "Desde 1974. Lo abrieron Irene Fernández y José García al volver de Suiza, cuando en la rúa dos Fornos solo estaba O Campante. Hoy lo llevan las hermanas Marisol y Marisa López.",
      keys: ["historia", "desde cuando", "cuantos anos", "antiguo", "1974", "fundad", "abrio", "duen", "quien lleva", "familia", "marisa", "marisol"],
    },
    nombre: {
      q: "¿Por qué se llama Dos Puertas?",
      a: "Porque las tiene: Irene y José abrieron el local en 1974 con dos puertas para facilitar el paso, y así se entra por una y se sale por la otra sin parar la barra.",
      keys: ["por que se llama", "nombre", "puertas", "puerta"],
    },
    famosos: {
      q: "¿Ha venido alguien famoso?",
      a: "La familia recuerda que estuvo Amancio Ortega y que le encantaron los «calamares». También venían mucho Fran, el jugador del Deportivo, la cantante Cristina Pato y políticos como Feijóo o Santalices.",
      keys: ["famos", "amancio", "ortega", "conocid", "cristina pato", "feijoo", "futbol", "deportivo"],
    },
  } satisfies Record<CamareroId, { q: string; a: string; keys: string[] }>,
};

export type CamareroTexts = typeof es;
export default es;
