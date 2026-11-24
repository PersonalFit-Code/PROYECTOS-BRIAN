import { normalizar } from "@/lib/formato";
import type { Negocio, Sector } from "@/lib/tipos";

/**
 * Guion de llamada en frío de cada negocio.
 *
 * Sigue el orden que funciona con desconocidos: entrada personalizada (se nota que has mirado su
 * negocio), una sola pregunta sobre su problema, un caso real como prueba, algo de valor GRATIS y un
 * cierre con dos opciones. Lo que se pide es poco (15 minutos) y lo que se da es concreto.
 *
 * Se monta con lo que sabemos del negocio. Si el puesto de Guion ha escrito uno a medida
 * (`propuestas.guion`), sus partes mandan sobre las de aquí.
 */

export interface Objecion {
  dicen: string;
  contestas: string;
}

/** Un paso de la secuencia de mensajes por Instagram. `texto` null si es una acción, no un mensaje para copiar. */
export interface PasoDM {
  cuando: string;
  titulo: string;
  texto: string | null;
  nota?: string;
}

export interface Guion {
  /** Lo que hemos visto y por qué le llamamos. Null si no sabemos nada concreto. */
  senal: string | null;
  /** Qué decir a quien coge, que casi nunca es quien decide. */
  centralita: string;
  entrada: string;
  pregunta: string;
  prueba: string;
  regalo: string;
  cierre: string;
  objeciones: Objecion[];
  /** Mensaje para escribirle por Instagram, si es por donde se le contacta. */
  mensaje: string | null;
  /** Secuencia de mensajes por Instagram paso a paso. Solo infoproductores y coaches. */
  secuenciaDM: PasoDM[];
  /** Preguntas para saber si encaja y para validar el precio. Solo las lleva el setter con IA. */
  cualificar: string[];
  precios: string[];
  /** Si no cogen o piden que llames luego. */
  seguimiento: string;
  /** Verdadero si lo ha escrito el puesto de Guion para este negocio. */
  aMedida: boolean;
}

export type Senal = "web_caida" | "sin_web" | "solo_instagram" | "reservas_a_mano" | "herramienta_externa" | "carta_pdf" | "encargos" | "nada";

export type DatosNegocio = Pick<Negocio, "nombre" | "sector" | "subsector" | "localidad" | "web" | "instagram" | "notas">;

/** Qué problema concreto vemos, por orden de fuerza: el primero que encaje. */
export function detectarSenal(n: DatosNegocio, dolores: string[] = []): Senal {
  const t = normalizar([n.notas ?? "", ...dolores].join(" "));
  const tiene = (...palabras: string[]) => palabras.some((p) => t.includes(p));

  if (n.web && tiene("no carga", "no resuelve", "caida", "no funciona")) return "web_caida";
  if (!n.web && n.instagram) return "solo_instagram";
  if (!n.web) return "sin_web";
  if (tiene("pdf", "en fotos", "en imagen", "foto de la carta")) return "carta_pdf";
  if (n.sector === "hosteleria" && tiene("encargo", "tartas por", "pedidos por")) return "encargos";
  if (tiene("herramienta externa", "app externa", "plataforma externa")) return "herramienta_externa";
  if (tiene("whatsapp", "por telefono", "por formulario", "formulario", "no enlaza", "sin reservas", "no se vio agenda", "pagina de contacto")) return "reservas_a_mano";
  return "nada";
}

/** Clínicas de usted; el resto de tú, que es como se habla en un gimnasio o en un bar. */
const deUsted = (s: Sector) => s === "clinica";

const QUE_ES: Record<Sector, string> = {
  fitness: "centros de entrenamiento",
  clinica: "consultas y clínicas",
  hosteleria: "restaurantes y pastelerías",
  infoproducto: "gente que vende su programa por mensajes de Instagram y por llamada",
  otro: "negocios como el tuyo",
};

function lugar(n: DatosNegocio): string {
  return n.localidad ? ` en ${n.localidad}` : "";
}

function esPasteleria(n: DatosNegocio): boolean {
  return /pasteler|panader|reposter/i.test(n.subsector ?? "");
}

function senalTxt(senal: Senal, n: DatosNegocio): string | null {
  switch (senal) {
    case "web_caida":
      return "La web que sale en Google no carga.";
    case "sin_web":
      return "No tiene web: en Google solo sale la ficha del mapa.";
    case "solo_instagram":
      return "No tiene web, solo Instagram.";
    case "reservas_a_mano":
      return n.sector === "clinica" ? "Las citas se piden por teléfono, WhatsApp o formulario; no vimos agenda online." : "Para apuntarse hay que llamar o escribir; no vimos reserva online.";
    case "herramienta_externa":
      return "Usa una herramienta externa para las reservas.";
    case "carta_pdf":
      return "La carta o los horarios están en PDF o en fotos.";
    case "encargos":
      return "Los encargos le llegan por mensaje.";
    default:
      return null;
  }
}

function entrada(senal: Senal, n: DatosNegocio, usted: boolean): string {
  if (n.sector === "infoproducto") {
    return `Soy Brian, de neuro·node. Trabajamos con ${QUE_ES.infoproducto}. Te llamo en frío, te lo digo ya: te robo medio minuto y, si no te encaja, colgamos sin más. He estado viendo tu contenido y cómo llevas a la gente de un mensaje a reservar la llamada.`;
  }
  const base = usted
    ? `Soy Brian, de neuro·node. Trabajamos con ${QUE_ES[n.sector]}. Le llamo en frío, se lo digo ya: le robo medio minuto y, si no le encaja, colgamos sin más.`
    : `Soy Brian, de neuro·node. Trabajamos con ${QUE_ES[n.sector]}. Te llamo en frío, te lo digo ya: te robo medio minuto y, si no te encaja, colgamos sin más.`;
  const visto: Partial<Record<Senal, string>> = usted
    ? {
        web_caida: `He ido a mirar la web de ${n.nombre} y no me ha cargado.`,
        sin_web: `He buscado ${n.nombre} en Google y solo me sale la ficha del mapa.`,
        solo_instagram: `He estado mirando ${n.nombre} y veo que lo llevan todo por Instagram.`,
        reservas_a_mano: `He estado mirando ${n.nombre} y veo que la cita hay que pedirla escribiendo o llamando.`,
        herramienta_externa: `He estado mirando ${n.nombre} y veo que ya trabajan con una herramienta de citas.`,
      }
    : {
        web_caida: `He ido a mirar la web de ${n.nombre} y no me ha cargado.`,
        sin_web: `He buscado ${n.nombre} en Google y solo me sale la ficha del mapa.`,
        solo_instagram: `He estado mirando ${n.nombre} y veo que lo lleváis todo por Instagram.`,
        reservas_a_mano: `He estado mirando ${n.nombre} y veo que para apuntarse hay que escribiros o llamaros.`,
        herramienta_externa: `He estado mirando ${n.nombre} y veo que ya usáis una herramienta para las reservas.`,
        carta_pdf: `He estado mirando ${n.nombre} y veo que tenéis la carta en PDF.`,
        encargos: `He estado mirando ${n.nombre} y veo que los encargos os llegan por mensaje.`,
      };
  return visto[senal] ? `${base} ${visto[senal]}` : base;
}

function pregunta(senal: Senal, n: DatosNegocio, usted: boolean): string {
  const l = lugar(n);
  if (n.sector === "infoproducto") {
    return "¿Cuántos mensajes directos te entran a la semana y quién los contesta hoy?";
  }
  if (n.sector === "clinica") {
    switch (senal) {
      case "web_caida":
        return "¿Sabía que la web no carga? ¿Desde cuándo cree que está así?";
      case "sin_web":
      case "solo_instagram":
        return `Cuando alguien busca ${n.subsector ?? "su especialidad"}${l} en Google, ¿le encuentra, o solo llega quien ya le conoce?`;
      case "herramienta_externa":
        return "¿Y los que le escriben por WhatsApp o por Instagram en vez de reservar ahí, quién los contesta?";
      default:
        return "Cuando está con un paciente y le escriben por WhatsApp para pedir cita, ¿quién contesta?";
    }
  }
  if (n.sector === "hosteleria") {
    if (esPasteleria(n)) {
      return senal === "sin_web" || senal === "solo_instagram" || senal === "web_caida"
        ? `Quien busca una tarta por encargo${l}, ¿os encuentra en Google, o solo os compra quien ya os conoce?`
        : "Los encargos de tartas, ¿os llegan todos por WhatsApp? ¿Se os ha pasado alguno alguna vez?";
    }
    switch (senal) {
      case "web_caida":
        return "¿Sabíais que la web no carga? ¿Desde cuándo creéis que está así?";
      case "sin_web":
      case "solo_instagram":
        return `Cuando alguien busca dónde comer${l} en Google, ¿qué ve de vosotros: vuestra carta, o solo la ficha del mapa?`;
      case "carta_pdf":
        return "Cada vez que cambiáis un plato o un precio, ¿tenéis que rehacer la carta entera?";
      default:
        return "¿Las reservas os llegan por teléfono en pleno servicio, cuando menos podéis cogerlo?";
    }
  }
  // Fitness y el resto.
  switch (senal) {
    case "web_caida":
      return "¿Sabíais que la web no carga? ¿Desde cuándo creéis que está así?";
    case "sin_web":
      return `Cuando alguien busca ${n.subsector ?? "gimnasio"}${l} en Google, ¿os encuentra, o solo os llega gente por el boca a boca?`;
    case "solo_instagram":
      return `Cuando alguien busca ${n.subsector ?? "gimnasio"}${l} en Google, ¿os encuentra, o solo os conoce quien ya os sigue?`;
    case "reservas_a_mano":
      return "¿Cuánto tiempo al día se os va en contestar mensajes para apuntar gente?";
    case "herramienta_externa":
      return "¿Hay algo que sigáis haciendo a mano, fuera de la herramienta: cobros, bonos, el seguimiento de cada cliente?";
    case "carta_pdf":
      return "Cada vez que cambiáis un horario, ¿tenéis que rehacer el PDF y volver a subirlo?";
    default:
      return usted ? "¿Cómo lleva hoy las reservas y los cobros: con un programa, o con Excel y WhatsApp?" : "¿Cómo lleváis hoy las reservas y los cobros: con un programa, o con Excel y WhatsApp?";
  }
}

function prueba(n: DatosNegocio): string {
  if (n.sector === "infoproducto") {
    return "Es tu propio setter con IA para Instagram: contesta todos tus mensajes con tu guion y tu forma de hablar, entrega tus recursos, filtra y manda a reservar la llamada. Ya está funcionando con cuentas reales. Y no hay tope de mensajes.";
  }
  if (n.sector === "clinica") {
    return "Montamos un asistente que responde esos mensajes al momento, con la información de su consulta, y deja la cita puesta en su agenda. Usted sigue con el paciente que tiene delante.";
  }
  if (n.sector === "hosteleria") {
    return esPasteleria(n)
      ? "A una pastelería, Bin & Cami Cakes, le hemos hecho una web que enseña sus tartas y recoge los encargos con su fecha, para que no se pierda ninguno entre mensajes."
      : "A Tixola, una tapería de Ourense, le hemos hecho una carta digital que cambian ellos desde el móvil en un momento, y un asistente que responde a los clientes: qué lleva cada plato, alérgenos, qué vino va con qué.";
  }
  return "A Personal Fit, un centro de entrenamiento personal de Ourense, le hemos montado todo en un solo sitio: reservas, calendario, cobros y cada monitor con su panel. Y una app donde cada cliente ve su progreso.";
}

function regalo(n: DatosNegocio, usted: boolean): string {
  if (n.sector === "infoproducto") {
    return "Lo que lo hace distinto es que el guion es tuyo y lo cambias tú cuando quieras, sin esperar a nadie. Y estamos terminando la parte en la que se lo pides a tu asistente de IA con tus palabras. Te lo enseño funcionando en quince minutos por videollamada, con una cuenta real.";
  }
  return usted
    ? `Le propongo una cosa: me miro ${n.nombre} con calma y le preparo tres mejoras concretas, gratis. Se las enseño en quince minutos por videollamada y se las queda, trabajemos juntos o no.`
    : `Te propongo una cosa: me miro ${n.nombre} con calma y te preparo tres mejoras concretas, gratis. Te las enseño en quince minutos por videollamada y te las quedas, trabajemos juntos o no.`;
}

function cierre(n: DatosNegocio, usted: boolean): string {
  if (n.sector === "hosteleria") return "¿Te viene mejor por la mañana, antes del servicio, o a media tarde?";
  if (usted) return "¿Le viene mejor mañana a primera hora o el jueves al acabar la consulta?";
  return "¿Te viene mejor mañana a primera hora o el jueves a mediodía?";
}

function objeciones(senal: Senal, n: DatosNegocio, usted: boolean): Objecion[] {
  // A un infoproductor o a un coach se le habla a él solo, no a un equipo.
  const uno = n.sector === "infoproducto";
  const precio: Objecion = {
    dicen: "¿Cuánto cuesta?",
    contestas: usted
      ? "Depende de lo que necesite, por eso prefiero verlo quince minutos. Las tres mejoras son gratis y no le comprometen a nada."
      : uno
        ? "Son dos cosas: nuestra cuota al mes, con todo incluido y sin tope de mensajes, y la IA, que la pagas tú aparte y a coste. (Las cifras, las del documento de Nico; apunta qué te contesta.)"
        : "Depende de lo que necesitéis, por eso prefiero verlo quince minutos. Las tres mejoras son gratis y no os comprometen a nada.",
  };
  const info: Objecion = {
    dicen: "Mándame información",
    contestas: usted
      ? "Se la mando hoy. ¿A qué correo? Y le llamo el jueves para ver qué le ha parecido. (Marca la casilla de consentimiento al apuntar el contacto.)"
      : "Te la mando hoy. ¿A qué correo? Y te llamo el jueves para ver qué te ha parecido. (Marca la casilla de consentimiento al apuntar el contacto.)",
  };
  const no: Objecion = {
    dicen: "No me interesa",
    contestas: usted
      ? "Entendido. ¿Es porque ya lo tiene resuelto, o porque ahora no es el momento?"
      : uno
        ? "Entendido. ¿Es porque ya lo tienes resuelto, o porque ahora no es el momento?"
        : "Entendido. ¿Es porque ya lo tenéis resuelto, o porque ahora no es el momento?",
  };
  const tiempo: Objecion = {
    dicen: "Ahora no tengo tiempo",
    contestas: usted ? "Lo entiendo. ¿A qué hora le pillo más tranquilo?" : "Lo entiendo. ¿A qué hora te pillo más tranquilo?",
  };

  const propias: Objecion[] = [];
  if (n.sector === "infoproducto") {
    propias.push(
      { dicen: "Ya tengo una herramienta de palabra clave", contestas: "Esa entrega el recurso y se queda ahí. Esto sigue la conversación hasta la llamada." },
      { dicen: "El bot que me montaron no hablaba como yo", contestas: "Aquí el guion es tuyo, lo ves entero y lo ajustas tú las veces que quieras." },
      { dicen: "No soy técnico", contestas: "No hace falta. La idea es que se lo pidas a tu asistente con tus palabras. Esa parte la estamos terminando; mientras, te lo dejamos funcionando nosotros." },
      { dicen: "¿Por qué pago aparte la IA?", contestas: "Porque así pagas el consumo real, a coste y directamente al proveedor, y no hay paquetes de mensajes." },
      { dicen: "¿Y si lo cambio y lo estropeo?", contestas: "Cada versión del guion se guarda y vuelves a la anterior cuando quieras." },
      { dicen: "¿Me garantizas llamadas?", contestas: "No. El bot conversa y filtra; cuántas llamadas salgan depende de tu contenido y de tu oferta. Eso no te lo voy a prometer." },
      { dicen: "Me entran pocos mensajes", contestas: "Entonces todavía no te compensa: sin mensajes entrando, el bot no tiene con quién hablar. Si te parece, hablamos cuando tengas más volumen. (Apúntalo como «No le interesa» con esa nota.)" },
    );
  } else if (n.sector === "clinica") {
    propias.push(
      { dicen: "Mis pacientes no quieren hablar con una máquina", contestas: "Responde solo con la información que usted apruebe. Y en cuanto alguien pregunta algo fuera de eso, le pasa la conversación a usted." },
      { dicen: "¿Y la protección de datos?", contestas: "No improvises. «Se trata con un contrato de encargado del tratamiento, que se firma antes de empezar. Se lo explica mi socio en la videollamada.»" },
    );
    if (senal === "herramienta_externa") propias.push({ dicen: "Ya uso un programa de citas", contestas: "Entonces la agenda la tiene. ¿Y los que le escriben por WhatsApp o Instagram en vez de reservar ahí?" });
  } else if (n.sector === "hosteleria") {
    propias.push({ dicen: "Ya tengo Instagram y me va bien", contestas: "Y hay que mantenerlo. La web es para quien no os sigue todavía y os busca en Google." });
    if (!esPasteleria(n)) propias.push({ dicen: "Ya tengo la carta en un QR", contestas: "¿Y la cambiáis vosotros en un minuto, o tenéis que pedírselo a alguien?" });
  } else {
    propias.push(
      { dicen: "Ya tenemos un programa", contestas: "Perfecto, entonces lo básico lo tenéis. ¿Hay algo que hagáis fuera del programa, a mano? Ahí es donde solemos ayudar." },
      { dicen: "Somos pequeños, no nos hace falta", contestas: "Personal Fit también es pequeño, y por eso lo necesitaba: sin recepción, cada mensaje lo contestaba el dueño." },
    );
  }
  return [...propias, precio, info, tiempo, no];
}

/** Encaja si tiene volumen de mensajes, usa un asistente de IA de pago y quiere configurarlo él. */
const CUALIFICAR_SETTER = [
  "¿Cómo cierras: por mensaje o por llamada? ¿Con qué agendas?",
  "¿Usas algún asistente de IA de pago en tu día a día? ¿Cuál y para qué?",
  "¿Te ves ajustando tu bot tú mismo, o esperas que alguien lo lleve por ti?",
  "¿Tienes algún recurso gratuito que ya entregues por comentario o por mensaje?",
  "¿Qué has probado antes y qué falló?",
];

/** Para validar el precio. Las cifras no van aquí: están en el documento interno de Nico. */
const PRECIOS_SETTER = [
  "¿Qué pagas hoy por contestar o automatizar tus mensajes? ¿Cuánto al mes?",
  "¿Cuántas llamadas agendas al mes desde Instagram y cuánto vale para ti una llamada agendada?",
  "Si esto te contestara todos los mensajes y te llenara la agenda, ¿a partir de qué precio al mes te parecería caro? ¿Y a partir de cuál tan barato que desconfiarías?",
  "La IA la pagas tú aparte, a coste, y a cambio no hay límite de mensajes. ¿Te encaja?",
  "¿Prefieres que te lo dejemos funcionando la primera vez, o configurarlo tú desde el principio?",
  "¿Te interesa saber qué publica tu competencia y qué le funciona? ¿Cuánto pagarías por eso al mes?",
  "¿Usarías también el setter en WhatsApp? ¿Pagarías más por tenerlo?",
  "¿Mensual, o anual con descuento?",
];

/**
 * Secuencia de Instagram para infoproductores y coaches: calentar, abrir conversación sin enlace,
 * dos seguimientos (el segundo con un regalo) y el enlace solo cuando hay interés.
 * Los huecos entre corchetes se rellenan mirando su perfil. Sin precios ni clientes inventados.
 */
export function secuenciaInfoproducto(): PasoDM[] {
  // El nombre de la cuenta no siempre es el de la persona («About Coaching»): mejor rellenarlo a mano.
  const nombre = "[nombre]";
  return [
    {
      cuando: "Día 1",
      titulo: "Calentar",
      texto: null,
      nota: "Dale like a 2 o 3 publicaciones y deja un comentario con sentido en la última: algo concreto de lo que dice, nada de «buen contenido». Así, cuando le escribas, tu nombre le suena.",
    },
    {
      cuando: "Día 2",
      titulo: "Primer mensaje (sin enlace)",
      texto: `¡Hola ${nombre}! Soy Brian, de neuro·node. Vi tu reel de [tema del reel] y lo de «comenta [palabra]». Pregunta rápida: ¿todos esos mensajes los contestas tú o tienes a alguien?`,
      nota: "Busca un reel suyo con «comenta X» o «escríbeme» y cámbialo en los corchetes. El objetivo es que conteste, no venderle.",
    },
    {
      cuando: "Si contesta",
      titulo: "Contarle qué es",
      texto: "Tiene sentido. Te lo pregunto porque estamos sacando un agente de IA que contesta esos mensajes con tu forma de hablar, filtra a quien encaja y le agenda la llamada. Lo conectas a la IA que ya usas. Buscamos 10 personas para probarlo gratis antes de lanzarlo. ¿Quieres que te calcule antes cuántas ventas se te pueden estar escapando por contestar tarde?",
    },
    {
      cuando: "Día 4 o 5, si no contesta",
      titulo: "Seguimiento 1",
      texto: `Hola ${nombre}, por si se te pasó: ¿los mensajes que te llegan por tus reels los contestas tú? Te lo pregunto porque tengo algo que te puede quitar ese trabajo.`,
    },
    {
      cuando: "Día 8 o 9, si sigue sin contestar",
      titulo: "Seguimiento 2 (con regalo)",
      texto: "Último mensaje, prometido. Te dejo algo gratis: dime tres perfiles de tu nicho y te mando qué contenido les está funcionando y qué podrías aplicar tú. Sin compromiso. Si no te interesa, no te escribo más.",
      nota: "Si te pasa los perfiles, apúntalos en la nota de su ficha para preparar el radar.",
    },
    {
      cuando: "Cuando muestra interés",
      titulo: "El enlace",
      texto: "Aquí lo tienes: [enlace de la web]. En 30 segundos calculas lo que se te escapa, y si te encaja te reservo una de las 10 plazas de la beta. ¿Te va bien una videollamada de 30 minutos esta semana para dejártelo montado?",
      nota: "Pon el enlace cuando la web nueva esté publicada. Muévelo a «Interesado» en el pipeline.",
    },
  ];
}

/** Monta el guion de un negocio. `aMedida` son las partes que haya escrito el puesto de Guion. */
export function montarGuion(n: DatosNegocio, dolores: string[] = [], aMedida?: Partial<Guion> | null): Guion {
  const senal = detectarSenal(n, dolores);
  const usted = deUsted(n.sector);
  const quien = n.sector === "clinica" ? "la consulta" : n.sector === "hosteleria" ? "el local" : n.sector === "infoproducto" ? "las ventas" : "el centro";
  const secuenciaDM = n.sector === "infoproducto" ? secuenciaInfoproducto() : [];
  // El primer mensaje de la secuencia hace de «mensaje» para las vistas que solo enseñan uno.
  const mensaje = secuenciaDM[1]?.texto ?? null;
  const base: Guion = {
    senal: dolores[0] ?? senalTxt(senal, n),
    centralita: `Buenos días, soy Brian, de neuro·node. ¿Con quién hablo? … Mira, [nombre], ¿está la persona que lleva ${quien}? Si pregunta de qué es: «Es una llamada comercial, muy breve. He estado mirando ${n.nombre} y quería comentarle una cosa. Medio minuto y cuelgo».`,
    entrada: entrada(senal, n, usted),
    pregunta: pregunta(senal, n, usted),
    prueba: prueba(n),
    regalo: regalo(n, usted),
    cierre: cierre(n, usted),
    objeciones: objeciones(senal, n, usted),
    mensaje,
    secuenciaDM,
    cualificar: n.sector === "infoproducto" ? CUALIFICAR_SETTER : [],
    precios: n.sector === "infoproducto" ? PRECIOS_SETTER : [],
    seguimiento: "Si no cogen, no lo des por perdido: tres intentos, en días y horas distintas. Si te dicen «ahora no», apunta la hora que te den y llama a esa hora.",
    aMedida: false,
  };
  if (!aMedida) return base;
  const limpio = Object.fromEntries(Object.entries(aMedida).filter(([, v]) => (Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim() !== "")));
  return { ...base, ...limpio, aMedida: Object.keys(limpio).length > 0 };
}
