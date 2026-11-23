import type { ClaseId } from "./horario";
import { fotos } from "./fotos";
import { pilates } from "./negocio";

/**
 * Las fichas «Dentro de 720»: una por cada forma de entrenar. Textos, profesores, horarios y cuotas
 * salen del boceto de Brais (comercial/720gym/BOCETO-BRAIS.md, 23/11/2026). Reglas suyas:
 *  - Cada concepto tiene su color.
 *  - El precio va LO ÚLTIMO: qué es → quién lo imparte → horarios → cuotas.
 *  - Brais no aparece: cada ficha presenta a su profesional.
 * No se inventa nada: lo que falta (fotos de profesores, algún dato) queda sin poner.
 */
export type Grupo = "libre" | "plan" | "grupos" | "clubes";
export const grupos: Record<Grupo, { titulo: string; texto: string }> = {
  libre: { titulo: "Entrena por libre", texto: "Gimnasio de aforo limitado para entrenar fuerza, acondicionamiento y movilidad con autonomía." },
  plan: { titulo: "Entrena con un plan", texto: "Programa 720: aprende los ejercicios y sigue una planificación clara, con revisiones cuando las necesites." },
  grupos: { titulo: "Actividades en grupos reducidos", texto: "Pilates, Yoga, CrossGym e Hipopresivos dirigidos por profesionales especializados." },
  clubes: { titulo: "Clubes y disciplinas", texto: "Powerlifting, Capoeira, Brazilian Jiu-Jitsu, Gimnasia Acrobática y Krav Maga." },
};

export interface Persona {
  nombre: string;
  apodo?: string;
  rol: string;
  foto?: string;
  resumen?: string;
  bio?: string[];
  sellos?: string[];
  cita?: string;
  bloques?: { titulo: string; texto?: string[]; lista?: string[] }[];
}

export interface Concepto {
  slug: string;
  href: string;
  grupo: Grupo;
  /** Nombre corto para tarjetas y menús. */
  nombre: string;
  /** Titular de la ficha. */
  titulo: string;
  marca: string;
  /** Color del concepto (puntos, iconos y detalles de su ficha). */
  color: string;
  /** Logo de la marca o club (public/logos). Sin logo, el de 720 GYM CLUB. */
  logo?: string;
  /** Resumen de una línea para tarjetas. */
  lineas: string;
  lema?: string;
  texto: string;
  chips: string[];
  foto?: string;
  galeria?: { src: string; alt: string }[];
  bloque: { titulo: string; intro?: string; tarjetas: { titulo: string; texto: string }[]; pasos?: boolean; nota?: string };
  destacados?: { titulo: string; texto: string }[];
  /** `web`: la página propia del club (pendiente de que Brais pase los enlaces). */
  club?: { nombre: string; texto: string; web?: string };
  niveles?: { titulo: string; intro: string; items: { titulo: string; texto: string }[] };
  equipo?: { titulo: string; personas: Persona[] };
  horarios?: { titulo: string; grupos: { titulo?: string; lineas: string[] }[]; nota?: string; destacado?: { titulo: string; texto: string }; mensaje: string };
  cuotas?: { titulo: string; grupos: { titulo?: string; filas: [string, string][]; nota?: string }[]; notas?: string[]; boton?: { texto: string; mensaje: string } };
  notaFinal?: string;
  conocer: { boton: string; mensaje: string };
  /** WhatsApp de este concepto (por defecto, el de 720). */
  whatsapp?: string;
  enlace?: { pregunta: string; texto: string; href: string };
  actividad: string;
  clases?: ClaseId[];
  seo: { titulo: string; descripcion: string };
}

const NARANJA = "#d77455";
const beaPilates: Persona = {
  nombre: "Beatriz Cid Pérez",
  rol: "Bailarina de danza contemporánea y profesora de Pilates Mat y Máquinas",
  bio: [
    "El movimiento ha estado presente en mi vida desde siempre. Como bailarina de danza contemporánea, encontré una forma de expresarme y descubrir todo lo que mi cuerpo era capaz de hacer.",
    "En 2013 comencé a practicar y formarme en Pilates Mat —suelo—, disciplina que después impartí durante años. Más adelante descubrí los distintos aparatos del método y profundicé en el Pilates clásico y contemporáneo. Me apasionó y decidí profesionalizarme; desde entonces continúo formándome y aprendiendo.",
    "Actualmente sigo bailando y entrenando. Llevo toda esa experiencia a mis clases en 720, combinando la fluidez de la danza con la precisión del Pilates para adaptar el trabajo al ritmo y las necesidades de cada persona.",
  ],
};
const beaHipopresivos: Persona = {
  nombre: "Beatriz Cid Pérez",
  rol: "Bailarina de danza contemporánea y profesora de Pilates e hipopresivos",
  bio: [
    "El movimiento siempre ha formado parte de mi vida. En la danza contemporánea encontré una forma de expresarme, escuchar mi cuerpo y disfrutar de todo lo que es capaz de hacer.",
    "Hacia 2013 empecé a practicar y formarme en Pilates de suelo; más adelante llegaron las máquinas. En paralelo descubrí los hipopresivos y me interesó su forma de trabajar la postura, la fuerza y el cuidado del suelo pélvico.",
    "Hoy sigo bailando y formándome. En 720 llevo esa experiencia a mis clases de hipopresivos para acompañarte con cercanía y adaptar la práctica a tu propio ritmo.",
  ],
};

export const conceptos: Concepto[] = [
  {
    slug: "gimnasio",
    href: "/gimnasio",
    grupo: "libre",
    nombre: "Gimnasio",
    titulo: "Gimnasio",
    marca: "720 GYM",
    color: NARANJA,
    lineas: "Entrena a tu ritmo, sin masificación. Fuerza, acondicionamiento y movilidad con aforo limitado.",
    lema: "Entrena a tu ritmo, sin masificación",
    texto: "Un espacio cercano, cuidado y de aforo limitado, con el material necesario para que entrenes fuerza, acondicionamiento y movilidad con comodidad.",
    chips: ["Acceso 365 días", "Aforo limitado", "Amplio horario"],
    foto: fotos.maquinas.src,
    galeria: [fotos.maquinas, fotos.racks, fotos.sala, fotos.entrada, fotos.funcional, fotos.vestuarioBancos, fotos.vestuarioDuchas, fotos.vestuarioLavabos],
    bloque: {
      titulo: "Un gimnasio pensado para entrenar",
      tarjetas: [
        { titulo: "Fuerza y musculación", texto: "Racks, tarimas, peso libre y máquinas guiadas para realizar un entrenamiento completo." },
        { titulo: "Acondicionamiento y movilidad", texto: "Espacio para realizar circuitos, trabajar la resistencia, calentar, mejorar la movilidad y estirar." },
        { titulo: "Acceso e instalaciones", texto: "Acceso electrónico, vestuarios amplios, duchas y taquillas para que organices tus entrenamientos a tu manera." },
      ],
    },
    horarios: {
      titulo: "Horario del gimnasio",
      grupos: [{ lineas: ["Todos los días, de 08:00 a 22:30", "Abierto los 365 días del año", "Acceso controlado"] }],
      mensaje: "Hola, he visto en la web el horario del gimnasio de 720GYM CLUB y me gustaría concertar una visita. ¿Qué día os viene bien? Gracias.",
    },
    cuotas: {
      titulo: "Cuota de gimnasio",
      grupos: [{ filas: [["Cuota mensual", "35 €/mes"], ["Entrada de un día", "5 €"]] }],
      notas: ["Sin permanencia."],
    },
    conocer: { boton: "Quiero conocer el gimnasio", mensaje: "Hola, os escribo desde la web de 720 Gym Club. Me gustaría conocer el gimnasio libre. ¿Cuándo podría pasar para que me enseñéis la sala? Gracias." },
    whatsapp: "34672009451",
    enlace: { pregunta: "¿Necesitas ayuda para saber qué hacer en tus entrenamientos?", texto: "Conoce el Programa 720", href: "/programa-720" },
    actividad: "gimnasio",
    seo: { titulo: "Gimnasio en Ourense con aforo limitado", descripcion: "Gimnasio en Ourense para entrenar a tu ritmo y sin masificación: fuerza, musculación, acondicionamiento y movilidad. Abierto los 365 días, de 08:00 a 22:30." },
  },
  {
    slug: "programa-720",
    href: "/programa-720",
    grupo: "plan",
    nombre: "Programa 720",
    titulo: "Programa 720",
    marca: "720 ENTRENAMIENTO",
    color: NARANJA,
    logo: "/logos/720-entrenamiento.png",
    lineas: "Entrena con autonomía, sabiendo qué hacer: dos sesiones con un entrenador y una planificación clara.",
    lema: "Entrena con autonomía, sabiendo qué hacer",
    texto: "Te enseñamos a realizar correctamente el calentamiento, los ejercicios y los estiramientos, y te entregamos una planificación clara para que sepas qué hacer en cada sesión.",
    chips: ["Dos sesiones presenciales", "Planificación incluida", "Un mes de gimnasio"],
    foto: fotos.racks.src,
    bloque: {
      titulo: "Empieza con un entrenador. Continúa con un plan.",
      pasos: true,
      tarjetas: [
        { titulo: "Conocemos tu punto de partida", texto: "Primera sesión de 90 minutos para conocer tus objetivos, experiencia y necesidades, y comenzar con la parte práctica." },
        { titulo: "Aprendes y afianzas la técnica", texto: "Segunda sesión de 60 minutos para reforzar lo aprendido, corregir los ejercicios y explicar tu planificación." },
        { titulo: "Sigues tu planificación", texto: "Plan físico y digital para un bloque de entre 6 y 12 semanas, con apoyo para resolver dudas." },
      ],
    },
    cuotas: {
      titulo: "Cuotas del Programa 720",
      grupos: [
        { titulo: "Programa 720 — Inicio", filas: [["Pago único", "75 €"]], nota: "Incluye las dos sesiones presenciales, la planificación, el primer mes de gimnasio y apoyo durante la primera planificación." },
        { titulo: "Después del primer mes", filas: [["Continúa entrenando", "35 €/mes"], ["Revisión opcional de una hora con nueva planificación", "35 €"]] },
        {
          titulo: "Bonos de sesiones · revisiones y nuevos bloques",
          filas: [["Bono 2 sesiones", "65 € · 32,50 €/sesión"], ["Bono 5 sesiones", "150 € · 30 €/sesión"], ["Bono 10 sesiones", "270 € · 27 €/sesión"], ["Bono 15 sesiones", "375 € · 25 €/sesión"], ["Sesión individual", "35 €"]],
          nota: "Cada revisión es una sesión presencial de 60 minutos e incluye la preparación de tu siguiente bloque de entrenamiento.",
        },
      ],
      notas: ["Las revisiones son opcionales. Puedes contratarlas cuando necesites actualizar tu planificación, corregir ejercicios o comenzar un nuevo bloque."],
    },
    conocer: { boton: "Quiero empezar el Programa 720", mensaje: "Hola, he visto en la web la información sobre el Programa 720 y me gustaría saber si puede encajar con lo que necesito. ¿Podríais orientarme sobre cómo funciona y cómo empezar? Gracias." },
    actividad: "personal",
    seo: { titulo: "Programa 720: entrena con un plan en Ourense", descripcion: "Programa 720 en Ourense: dos sesiones presenciales con un entrenador, una planificación de 6 a 12 semanas y tu primer mes de gimnasio. Entrena con autonomía, sabiendo qué hacer." },
  },
  {
    slug: "pilates",
    href: "/pilates",
    grupo: "grupos",
    nombre: "720 Pilates",
    titulo: "Pilates",
    marca: "720 PILATES",
    color: "#f6a33b",
    logo: "/logos/720-pilates.png",
    lineas: "Muévete mejor. Siéntete mejor. Reformer, Mat y Wall Unit en grupos de máximo 6 personas.",
    lema: "Muévete mejor. Siéntete mejor.",
    texto: "Dos formas de practicar Pilates en grupos reducidos, con atención cercana y ejercicios adaptados a tu nivel.",
    chips: ["Grupos reducidos", "Máximo 6 personas", "Trabajo adaptado"],
    foto: fotos.pilatesReformer.src,
    galeria: [fotos.pilatesReformer, fotos.pilatesWallUnit, fotos.pistaPilates],
    bloque: {
      titulo: "Dos formas de practicar Pilates",
      tarjetas: [
        { titulo: "Pilates Reformer", texto: "Trabajo sobre máquina para mejorar fuerza, control, movilidad y precisión en cada movimiento." },
        { titulo: "Pilates Mat y Wall Unit", texto: "Ejercicios en suelo y unidad de pared para trabajar control corporal, postura, movilidad y fuerza." },
      ],
    },
    equipo: { titulo: "Conoce a tu profesora", personas: [beaPilates] },
    horarios: {
      titulo: "Horarios de Pilates",
      grupos: [
        { titulo: "Mañana", lineas: ["Martes y jueves · 09:00 y 10:00", "Miércoles · 10:00"] },
        { titulo: "Tarde", lineas: ["Lunes · 17:00, 18:00, 19:00, 20:00 y 21:00", "Martes y jueves · 17:00, 18:00, 19:00 y 20:00", "Miércoles · 18:00, 19:00, 20:00 y 21:00"] },
      ],
      nota: "Los horarios y la disponibilidad pueden variar durante el curso.",
      destacado: { titulo: "Primera clase gratuita", texto: "La primera clase nos permite conocerte y valorar tu nivel. A partir de ahí, la profesora te orientará sobre la modalidad y el grupo que mejor encajan contigo." },
      mensaje: "Hola, he visto en la web los horarios de 720 Pilates y me gustaría consultar la disponibilidad. ¿Podríais orientarme sobre las modalidades y los grupos que tienen plazas actualmente? Gracias.",
    },
    cuotas: {
      titulo: "Cuotas de Pilates",
      grupos: [
        { titulo: "Pilates Mat y Wall Unit", filas: [["1 día por semana", "40 €/mes"], ["2 días por semana", "57 €/mes"], ["3 días por semana", "87 €/mes"]] },
        { titulo: "Pilates Reformer", filas: [["1 día por semana", "55 €/mes"], ["2 días por semana", "95 €/mes"], ["3 días por semana", "127 €/mes"]] },
        { titulo: "Combina Mat y Reformer", filas: [["1 Mat + 1 Reformer", "78 €/mes"], ["2 Mat + 1 Reformer", "98 €/mes"], ["1 Mat + 2 Reformer", "118 €/mes"]] },
        {
          titulo: "Pilates + Hipopresivos",
          filas: [["1 Hipopresivos + 1 Mat", "60 €/mes"], ["1 Hipopresivos + 1 Reformer", "80 €/mes"], ["1 Hipopresivos + 1 Mat + 1 Reformer", "100 €/mes"], ["1 Hipopresivos + 2 Reformer", "110 €/mes"]],
          nota: "Combina ambas actividades dentro de una misma cuota mensual.",
        },
        { filas: [["Sesión suelta", "15 €"]] },
      ],
      notas: ["Primera clase gratuita · Sin matrícula.", "¿No sabes qué modalidad elegir? La primera clase nos permite orientarte sobre la opción que mejor encaja contigo."],
      boton: { texto: "Quiero probar 720 Pilates", mensaje: "Hola, he visto en la web las cuotas de 720 Pilates y me gustaría probar una primera clase. ¿Podríais orientarme sobre la modalidad y el grupo que mejor me encajan? Gracias." },
    },
    notaFinal: "No necesitas experiencia previa. Te ayudamos a encontrar la modalidad que mejor encaja contigo.",
    conocer: { boton: "Quiero conocer 720 Pilates", mensaje: "Hola, os escribo desde la web de 720 Gym Club. Me gustaría conocer vuestras clases de Pilates. ¿Podemos hablar un momento para ver qué modalidad me podría encajar? Gracias." },
    whatsapp: "34671313162",
    actividad: "pilates",
    clases: ["reformer", "mat"],
    seo: { titulo: "Pilates Reformer y Mat en Ourense", descripcion: "720 Pilates en Ourense: Pilates Reformer, Mat y Wall Unit en grupos reducidos de máximo 6 personas, con trabajo adaptado a tu nivel. Primera clase gratuita y sin matrícula." },
  },
  {
    slug: "hipopresivos",
    href: "/hipopresivos",
    grupo: "grupos",
    nombre: "720 Hipopresivos",
    titulo: "Hipopresivos",
    marca: "720 HIPOPRESIVOS",
    color: "#ef4b4b",
    lineas: "Respira. Activa. Controla. Respiración, postura y suelo pélvico en sesiones guiadas.",
    lema: "Respira. Activa. Controla.",
    texto: "Sesiones guiadas para trabajar la respiración, la capacidad ventilatoria, la postura y el suelo pélvico.",
    chips: ["Respiración", "Suelo pélvico", "Control postural"],
    foto: fotos.pilatesWallUnit.src,
    galeria: [fotos.pilatesWallUnit, fotos.pilatesReformer],
    bloque: {
      titulo: "Respiración, core y suelo pélvico",
      intro: "Combinamos técnicas posturales y respiratorias para trabajar el abdomen profundo, el control del suelo pélvico y una respiración más eficiente.",
      tarjetas: [
        { titulo: "Respiración y capacidad ventilatoria", texto: "Ejercicios para mejorar el control respiratorio y favorecer una respiración más eficiente." },
        { titulo: "Suelo pélvico y core", texto: "El trabajo postural y respiratorio puede contribuir a mejorar la activación y el control de la musculatura profunda y del suelo pélvico." },
      ],
    },
    equipo: { titulo: "Conoce a tu profesora", personas: [beaHipopresivos] },
    horarios: {
      titulo: "Horarios de Hipopresivos",
      grupos: [{ lineas: ["Martes y jueves · 16:30 – 17:00"] }],
      nota: "Consulta los horarios y las plazas disponibles. Te orientaremos para encontrar el grupo que mejor encaje contigo.",
      mensaje: "Hola, he visto en la web los horarios de 720 Hipopresivos y me gustaría consultar la disponibilidad. ¿Podríais indicarme si actualmente quedan plazas? Gracias.",
    },
    cuotas: {
      titulo: "Cuotas 720 Hipopresivos",
      grupos: [
        { filas: [["1 día por semana", "35 €/mes"], ["2 días por semana", "55 €/mes"]] },
        {
          titulo: "Combinadas con Pilates",
          filas: [["1 Hipopresivos + 1 Mat", "60 €/mes"], ["1 Hipopresivos + 1 Reformer", "80 €/mes"], ["1 Hipopresivos + 1 Mat + 1 Reformer", "100 €/mes"], ["1 Hipopresivos + 2 Reformer", "110 €/mes"]],
        },
      ],
      notas: ["Primera clase gratuita · Sin matrícula.", "La profesora te orientará sobre el grupo y horario más adecuado."],
    },
    notaFinal: "No necesitas experiencia previa. Te acompañamos desde el primer día.",
    conocer: { boton: "Quiero conocer Hipopresivos", mensaje: "Hola, os escribo desde la web de 720 Gym Club. Me gustaría saber cómo son las sesiones de Hipopresivos. ¿Podemos hablar un momento para que me contéis cómo trabajáis? Gracias." },
    whatsapp: "34671313162",
    actividad: "hipopresivos",
    seo: { titulo: "Hipopresivos en Ourense", descripcion: "720 Hipopresivos en Ourense: sesiones guiadas de respiración, control postural y suelo pélvico, martes y jueves. Primera clase gratuita y sin matrícula." },
  },
  {
    slug: "yoga",
    href: "/yoga",
    grupo: "grupos",
    nombre: "720 Yoga",
    titulo: "Yoga",
    marca: "720 YOGA",
    color: "#6d3fd6",
    logo: "/logos/720-yoga.png",
    lineas: "Hatha Yoga en grupos reducidos: movilidad, respiración, equilibrio y bienestar a tu ritmo.",
    texto: "Una práctica guiada para mejorar la movilidad, la respiración, el equilibrio y el bienestar, respetando el ritmo de cada persona.",
    chips: ["Hatha Yoga", "Máximo 8 personas"],
    bloque: {
      titulo: "Hatha Yoga en grupos reducidos",
      tarjetas: [
        { titulo: "Respiración y bienestar", texto: "Aprende a respirar con mayor consciencia, reducir tensiones y conectar contigo." },
        { titulo: "Cuerpo y movilidad", texto: "Trabajamos movilidad, control y fuerza mediante una práctica progresiva." },
      ],
    },
    equipo: {
      titulo: "Conoce a quien te acompaña",
      personas: [
        {
          nombre: "Lucía Aramburo",
          rol: "Profesora de Hatha Yoga · 720 Yoga",
          bio: [
            "De pequeña la danza clásica era mi lugar seguro, y con los años di clases de aerobic y pilates. El movimiento siempre ha estado presente en mi vida.",
            "El Yoga llegó de casualidad: fui a una clase de una compañera y, aquello que antes no había resonado conmigo, en esa sesión derrumbó mi prejuicio ante la nueva disciplina, e hizo un «click» que cambiaría muchas cosas con el tiempo. Durante el COVID, como para tanta gente, el Yoga se convirtió en un refugio.",
            "Empecé a asistir a clases presenciales, en las cuales descubrí aquello, más allá de lo físico, que tiene el Yoga que ofrecer, y que puede ser para todo el mundo.",
            "Todo esto, y la curiosidad por algo tan enorme, me llevaron a formarme en Hatha Yoga.",
            "A día de hoy doy clases de Hatha Yoga desde la idea de compartir aquello que tanto me ha ayudado.",
          ],
          cita: "Copio las palabras de B.K.S. Iyengar: «Estoy tan agradecido a lo que el Yoga ha hecho con mi vida, que siempre busco compartirlo». Te espero en la esterilla.",
        },
      ],
    },
    horarios: {
      titulo: "Horarios de Yoga",
      grupos: [
        { titulo: "Mañana", lineas: ["Lunes y miércoles · 10:00 – 11:00"] },
        { titulo: "Tarde", lineas: ["Lunes y miércoles · 20:00 – 21:00"] },
      ],
      nota: "Cuéntanos qué días y horas te encajan. Te informamos de las opciones de grupo y las plazas disponibles.",
      mensaje: "Hola, he visto en la web los horarios de 720 Yoga y me gustaría consultar la disponibilidad. ¿Podríais indicarme qué grupos tienen plazas actualmente? Gracias.",
    },
    cuotas: {
      titulo: "Cuotas de Yoga",
      grupos: [{ filas: [["1 día a la semana", "40 €/mes"], ["2 días a la semana", "68 €/mes"]] }],
      notas: ["Primera clase gratuita · Sin matrícula."],
    },
    conocer: { boton: "Quiero conocer 720 Yoga", mensaje: "Hola, os escribo desde la web de 720 Gym Club. Me gustaría conocer cómo son las clases de Yoga. ¿Podría acercarme un día a conocer el espacio y hablar con vosotros? Gracias." },
    whatsapp: "34672009451",
    actividad: "yoga",
    clases: ["yoga"],
    seo: { titulo: "Hatha Yoga en Ourense", descripcion: "720 Yoga en Ourense: Hatha Yoga en grupos reducidos de máximo 8 personas para mejorar movilidad, respiración, equilibrio y bienestar. Primera clase gratuita y sin matrícula." },
  },
  {
    slug: "crossgym",
    href: "/crossgym",
    grupo: "grupos",
    nombre: "CrossGym",
    titulo: "CrossGym",
    marca: "CROSSGYM 720",
    color: "#e02d2d",
    logo: "/logos/crossgym-720.png",
    lineas: "Entrenamiento en grupos de máximo seis personas: fuerza, movimiento y acondicionamiento adaptados a ti.",
    texto: "Entrenamiento en grupos reducidos con fuerza, movimiento y acondicionamiento, adaptado a cada persona.",
    chips: ["Grupos reducidos", "Entrenamiento adaptado"],
    foto: fotos.funcional.src,
    galeria: [fotos.funcional, fotos.pistaVertical],
    bloque: {
      titulo: "¿Qué es CrossGym?",
      intro: "CrossGym es una actividad de entrenamiento dirigido que se desarrolla dentro de 720GYM CLUB, en grupos reducidos de un máximo de seis personas. Cada sesión tiene un objetivo, una estructura y una progresión. El propósito no es únicamente hacer ejercicio, sino aprender a entrenar, mejorar la técnica y desarrollar fuerza, movilidad, resistencia y control corporal.",
      tarjetas: [
        { titulo: "Cómo se entrena", texto: "El grupo comparte la sesión, pero los ejercicios, las cargas y la dificultad se adaptan a cada persona. Utilizamos barras, kettlebells, mazas, anillas, peso corporal y otras herramientas según lo que queramos mejorar." },
        { titulo: "Para quién es", texto: "No necesitas estar en forma ni tener experiencia previa. Solo disposición para aprender, dejarte guiar y entender que los resultados se construyen mediante práctica y progresión." },
      ],
    },
    equipo: {
      titulo: "Conoce al profesional",
      personas: [
        {
          nombre: "José I. Álvarez",
          rol: "Responsable y entrenador de CrossGym en Ourense",
          resumen: "Más de tres décadas vinculado al entrenamiento y cerca de treinta años de experiencia profesional como entrenador.",
          bio: [
            "Mi relación con el entrenamiento comenzó en Gran Canaria, cuando empecé a entrenar en el Kino Gym con 15 o 16 años. A los 21 comencé a trabajar como entrenador. Desde entonces he dedicado mi carrera al entrenamiento de fuerza, la musculación, la halterofilia, el acondicionamiento físico y el entrenamiento personal.",
            "A lo largo de estos años he fundado y dirigido diferentes centros deportivos, trabajando con personas, objetivos y necesidades muy distintas. Toda esa experiencia me ha llevado a una conclusión sencilla: el entrenamiento debe adaptarse a la persona, no la persona al sistema.",
          ],
          bloques: [
            { titulo: "Trayectoria", lista: ["Gimnasio Olimpia", "Fundador de Gimnasio CrossGym", "Fundador de CrossFit Pontevedra", "Cofundador de CrossFit Ourense y Kilian CrossFit Vigo", "Responsable y entrenador de CrossGym en Ourense"] },
            { titulo: "Formación principal", lista: ["Entrenador de musculación y fitness", "Entrenador personal", "Monitor de halterofilia", "Instructor de kettlebell, niveles 1 y 2", "CrossFit Level 1, Football y Weightlifting", "Especialista en actividad física adaptada"] },
          ],
          sellos: ["Fuerza y potencia", "Halterofilia", "Kettlebells", "Indian Clubs y mazas", "Movilidad", "Biomecánica", "Programación", "Ejercicio adaptado"],
          cita: "No entrenamos una modalidad. Entrenamos personas.",
        },
      ],
    },
    horarios: {
      titulo: "Horarios de CrossGym",
      grupos: [
        { titulo: "Mañana", lineas: ["Lunes, miércoles y jueves · dos turnos entre las 09:00 y las 11:00"] },
        { titulo: "Tarde", lineas: ["Lunes, miércoles y jueves · 16:30, 17:30, 18:30 y 19:30"] },
      ],
      nota: "Clases de 60 minutos. Las plazas se organizan mediante reserva previa y los grupos tienen un máximo de seis personas.",
      mensaje: "Hola, he visto en la web la información sobre CrossGym y me gustaría consultar la disponibilidad. ¿Podríais indicarme qué turnos tienen plazas actualmente? Gracias.",
    },
    cuotas: {
      titulo: "Tarifas de CrossGym",
      grupos: [{ filas: [["1 día por semana", "35 €"], ["2 días por semana", "65 €"], ["3 días por semana", "75 €"]] }],
    },
    conocer: { boton: "Quiero conocer CrossGym", mensaje: "Hola, os escribo desde la web de 720 Gym Club. Me gustaría ver cómo es un entrenamiento de CrossGym. ¿Cuándo podría acercarme a conoceros? Gracias." },
    whatsapp: "34670617970",
    actividad: "crossgym",
    clases: ["crossgym"],
    seo: { titulo: "CrossGym: entrenamiento en grupos reducidos en Ourense", descripcion: "CrossGym en 720GYM CLUB, Ourense: entrenamiento dirigido de fuerza, movimiento y acondicionamiento en grupos de máximo seis personas, adaptado a cada persona." },
  },
  {
    slug: "powerlifting",
    href: "/powerlifting",
    grupo: "clubes",
    nombre: "720 Powerlifting",
    titulo: "Powerlifting",
    marca: "720 POWERLIFTING",
    color: NARANJA,
    logo: "/logos/720-powerlifting.png",
    lineas: "Fuerza, técnica y progresión. Sentadilla, press de banca y peso muerto con material de competición.",
    lema: "Fuerza, técnica y progresión",
    texto: "Entrena los tres movimientos del powerlifting en un espacio preparado para mejorar tu técnica, desarrollar tu fuerza y acercarte a la competición.",
    chips: ["Sentadilla", "Press de banca", "Peso muerto"],
    foto: fotos.racks.src,
    galeria: [fotos.racks, fotos.sala, fotos.entrada],
    bloque: {
      titulo: "Los tres movimientos",
      tarjetas: [
        { titulo: "Sentadilla", texto: "Control, estabilidad y fuerza para levantar con seguridad y bajo los estándares de competición." },
        { titulo: "Press de banca", texto: "Técnica, precisión y progresión en uno de los movimientos fundamentales del powerlifting." },
        { titulo: "Peso muerto", texto: "Fuerza global y ejecución técnica para completar el tercer movimiento de competición." },
      ],
    },
    destacados: [
      { titulo: "Material de competición", texto: "Contamos con barras, discos calibrados, bancos y soportes homologados por la IPF para entrenar en condiciones de competición." },
      { titulo: "720 Powerlifting Ourense", texto: "Club de powerlifting en Ourense integrado en 720GYM CLUB. Un espacio para iniciarte, formar parte de un equipo o federarte y competir en Galicia y a nivel nacional." },
    ],
    notaFinal: "Tanto si quieres empezar como si buscas prepararte para competir, ven a conocer el club.",
    conocer: { boton: "Quiero conocer 720 Powerlifting", mensaje: "Hola, os escribo desde la web de 720 Gym Club. Me gustaría conocer el grupo de Powerlifting y ver cómo entrenáis. ¿Podría pasar algún día? Gracias." },
    whatsapp: "34634290451",
    actividad: "powerlifting",
    clases: ["powerlifting"],
    seo: { titulo: "Powerlifting en Ourense", descripcion: "720 Powerlifting Ourense: sentadilla, press de banca y peso muerto con material homologado por la IPF. Club para iniciarte, entrenar en equipo o federarte y competir." },
  },
  {
    slug: "brazilian-jiu-jitsu",
    href: "/brazilian-jiu-jitsu",
    grupo: "clubes",
    nombre: "Brazilian Jiu-Jitsu",
    titulo: "Brazilian Jiu-Jitsu",
    marca: "MAMBISES BJJ",
    color: "#0b4ea2",
    logo: "/logos/mambises-bjj.png",
    lineas: "Técnica. Control. Evolución. Clases para adultos y niños con Mambises Brazilian Jiu-Jitsu.",
    lema: "Técnica. Control. Evolución.",
    texto: "Clases de Brazilian Jiu-Jitsu para adultos y niños, basadas en la técnica, la estrategia y el aprendizaje progresivo.",
    chips: ["Adultos", "Kids", "Todos los niveles"],
    bloque: {
      titulo: "Brazilian Jiu-Jitsu para adultos y kids",
      intro: "Dos grupos adaptados a cada etapa, con una enseñanza técnica, segura y progresiva.",
      tarjetas: [
        { titulo: "Brazilian Jiu-Jitsu adultos", texto: "Aprende posiciones, controles, escapes y finalizaciones mientras desarrollas técnica, movilidad y estrategia." },
        { titulo: "Brazilian Jiu-Jitsu kids", texto: "Una práctica adaptada para trabajar técnica, coordinación, atención, respeto y trabajo en equipo." },
      ],
    },
    club: { nombre: "Mambises Brazilian Jiu-Jitsu", texto: "Entrena dentro de un club especializado y forma parte de una comunidad cercana." },
    equipo: {
      titulo: "Conoce a tu profesor",
      personas: [
        {
          nombre: "Diego Rodríguez Miranda",
          rol: "Fundador e instructor de Mambises BJJ · Cinturón morado de Brazilian Jiu-Jitsu",
          resumen: "Compagino la enseñanza del jiu-jitsu con la competición y mi propia formación como deportista. En mis clases busco que cada alumno entienda lo que hace, construya una base sólida y avance con confianza.",
          bloques: [
            {
              titulo: "Mi historia con el jiu-jitsu",
              texto: [
                "Mi relación con las artes marciales comenzó a los 15 años, a través de las MMA. Más adelante descubrí el Brazilian Jiu-Jitsu en Alpha Wolf Pack, donde encontré una disciplina que acabaría convirtiéndose en una parte fundamental de mi vida.",
                "De ese recorrido nace Mambises BJJ, una academia en Ourense cuyo nombre conecta con mis raíces cubanas. Un proyecto que reúne mi experiencia como competidor y mi compromiso como instructor: compartir lo aprendido y crear un espacio donde las personas puedan entrenar, superarse y sentirse parte de un equipo.",
              ],
            },
            { titulo: "Trayectoria", lista: ["Mambises BJJ: fundador e instructor en 720GYM", "Competición: campeón de España y medallista nacional e internacional de BJJ", "BJJ y MMA: cinturón morado · récord invicto en MMA, 3–0"] },
            {
              titulo: "Cómo enseño",
              texto: [
                "Organizo las clases con una progresión que conecta ejercicios, técnica y práctica con oposición. Adapto las explicaciones y los objetivos al nivel de cada alumno, desde sus primeras clases hasta la aplicación de las técnicas en combate.",
                "Doy especial importancia al control, al respeto por el compañero y a comprender por qué funciona cada movimiento. Mi objetivo es que el alumno aprenda a tomar decisiones y pueda reconocer su propio progreso.",
              ],
            },
          ],
          sellos: ["BJJ con kimono", "No-Gi", "Iniciación", "Desarrollo técnico", "Práctica posicional"],
          cita: "Más que jiu-jitsu, una comunidad.",
        },
      ],
    },
    horarios: {
      titulo: "Horarios de Mambises BJJ",
      grupos: [
        { titulo: "Kids", lineas: ["Lunes · 17:00 – 18:00 · 4–12 años", "Martes y jueves · 17:00 – 18:00 · 4–6 años", "Martes y jueves · 18:00 – 19:00 · 6–12 años"] },
        { titulo: "Adultos +16", lineas: ["Lunes · 18:00 – 19:45", "Martes y jueves · 10:30 – 12:15", "Miércoles y viernes · 19:15 – 21:00", "Sábado · 11:30 – 13:15"] },
      ],
      mensaje: "Hola, he visto en la web los horarios de Mambises Brazilian Jiu-Jitsu y me gustaría consultar la disponibilidad. ¿Podríais orientarme sobre los grupos de Kids y adultos que tienen plazas actualmente? Gracias.",
    },
    cuotas: {
      titulo: "Cuotas Mambises BJJ",
      grupos: [{ filas: [["Kids · ilimitado", "45 €/mes"], ["Adultos · ilimitado", "60 €/mes"], ["Matrícula", "30 €"]] }],
      notas: ["Primera clase gratuita.", "Contacta con el profesor para organizar tu primera clase."],
    },
    notaFinal: "No necesitas experiencia previa. Te acompañamos desde el primer entrenamiento.",
    conocer: { boton: "Quiero conocer BJJ", mensaje: "Hola, os escribo desde la web de 720 Gym Club. Me gustaría conocer las clases de Mambises Brazilian Jiu-Jitsu. ¿Podéis contarme cómo son las clases para niños y adultos y cuándo podría pasar a conoceros? Gracias." },
    whatsapp: "34680142465",
    actividad: "bjj",
    clases: ["bjj"],
    seo: { titulo: "Brazilian Jiu-Jitsu en Ourense: Mambises BJJ", descripcion: "Mambises Brazilian Jiu-Jitsu en 720GYM CLUB, Ourense: clases de BJJ para adultos y niños, todos los niveles, con Diego Rodríguez Miranda. Primera clase gratuita." },
  },
  {
    slug: "krav-maga",
    href: "/krav-maga",
    grupo: "clubes",
    nombre: "Krav Maga",
    titulo: "Krav Maga",
    marca: "KME KRAV MAGA",
    color: "#5b7a1f",
    logo: "/logos/kme-krav-maga.png",
    lineas: "Prevención. Técnica. Respuesta. Defensa personal civil y operativa con KME Krav Maga.",
    lema: "Prevención. Técnica. Respuesta.",
    texto: "Un sistema de defensa personal basado en la prevención, la técnica y el aprendizaje progresivo.",
    chips: ["Krav Maga Civil", "Krav Maga Operativo", "Trabajo progresivo"],
    bloque: {
      titulo: "Dos formas de entrenar Krav Maga",
      intro: "Dos líneas de entrenamiento adaptadas a perfiles y necesidades diferentes.",
      tarjetas: [
        { titulo: "Krav Maga Civil", texto: "Defensa personal para público general, centrada en prevención, distancia y respuestas sencillas ante situaciones cotidianas." },
        { titulo: "Krav Maga Operativo", texto: "Entrenamiento orientado a policías, guardias civiles, seguridad privada y otros profesionales del ámbito de la seguridad." },
      ],
    },
    club: { nombre: "KME Krav Maga", texto: "Entrena dentro de un club especializado, con una práctica progresiva y adaptada a cada persona." },
    equipo: {
      titulo: "Conoce a tu profesor",
      personas: [
        {
          nombre: "David Cabreira Rodríguez",
          rol: "Director de KME · Instructor de Krav Maga",
          resumen: "Especialista en Krav Maga, defensa personal y formación aplicada al ámbito de la seguridad. Su enseñanza combina prevención, técnica y respuesta adaptada a cada perfil.",
          sellos: ["Entrenador nacional Nivel 3", "Entrenador internacional de Krav Maga", "Cinturón negro 4.º dan", "Instructor experto en defensa personal"],
        },
      ],
    },
    horarios: {
      titulo: "Horarios de KME Krav Maga",
      grupos: [
        { titulo: "Krav Maga Civil · Iniciación", lineas: ["Sábados · 09:00 – 10:30"] },
        { titulo: "Krav Maga Operativo", lineas: ["Sábados · 10:30 – 12:00", "Dirigido a profesionales del ámbito de la seguridad"] },
      ],
      mensaje: "Hola, he visto en la web los horarios de KME Krav Maga y me gustaría consultar la disponibilidad. ¿Podríais orientarme sobre las plazas disponibles en Krav Maga Civil y Operativo? Gracias.",
    },
    cuotas: {
      titulo: "Cuota KME Krav Maga",
      grupos: [{ filas: [["Cuota mensual", "40 €/mes"]] }],
      notas: ["Primera clase gratuita.", "Contacta con el profesor para organizar tu primera clase."],
    },
    notaFinal: "No necesitas experiencia previa. Te acompañamos desde el primer entrenamiento.",
    conocer: { boton: "Quiero conocer Krav Maga", mensaje: "Hola, os escribo desde la web de 720 Gym Club. Me gustaría conocer vuestras clases de Krav Maga. ¿Podemos hablar para que me contéis cómo son los grupos de Civil y Operativo? Gracias." },
    whatsapp: "34672708181",
    actividad: "kravmaga",
    seo: { titulo: "Krav Maga en Ourense: KME", descripcion: "KME Krav Maga en 720GYM CLUB, Ourense: defensa personal civil y entrenamiento operativo para profesionales de la seguridad. Primera clase gratuita." },
  },
  {
    slug: "capoeira",
    href: "/capoeira",
    grupo: "clubes",
    nombre: "Capoeira",
    titulo: "Capoeira",
    marca: "CLUB CAPOEIRA ANDARUÊ",
    color: "#0a84e8",
    logo: "/logos/andarue.png",
    lineas: "Movimiento. Ritmo. Comunidad. Capoeira para adultos y niños con el Club Capoeira Andaruê.",
    lema: "Movimiento. Ritmo. Comunidad.",
    texto: "Una práctica cultural afrobrasileña que combina movimiento, juego, lucha, música y ritmo dentro de la roda.",
    chips: ["Adultos", "Kids", "Movimiento, música y ritmo"],
    foto: fotos.pistaPilates.src,
    bloque: {
      titulo: "Capoeira para adultos y kids",
      intro: "Dos grupos adaptados a cada etapa, unidos por el movimiento, la música y la cultura de la capoeira.",
      tarjetas: [
        { titulo: "Capoeira adultos", texto: "Trabaja técnica, movilidad, coordinación y condición física mientras aprendes a participar en la roda." },
        { titulo: "Capoeira kids", texto: "Una práctica adaptada para desarrollar coordinación, atención, expresión corporal, respeto y trabajo en grupo." },
      ],
    },
    club: { nombre: "Club Capoeira Andaruê", texto: "Entrena dentro de un club especializado y forma parte de una comunidad cercana." },
    equipo: {
      titulo: "Conoce a tu profesor",
      personas: [
        {
          nombre: "Adel Pérez Rico",
          rol: "Profesor de Capoeira · Club Capoeira Andaruê",
          resumen: "Con 18 años de trayectoria en capoeira y 14 dedicados a la enseñanza de niños, niñas y adultos en la provincia de Ourense. En sus clases une técnica, cultura y comunidad para que cada persona progrese con confianza.",
          sellos: ["18 años en capoeira", "14 años enseñando", "Campeón de Europa 2008", "Más de 100 eventos"],
        },
      ],
    },
    horarios: {
      titulo: "Horarios en 720GYM",
      grupos: [{ titulo: "Adolescentes y adultos · Todos los niveles", lineas: ["Lunes · 19:30 – 21:00", "Martes · 20:00 – 21:30", "Miércoles · 10:00 – 11:30", "Jueves · 19:30 – 21:00", "Viernes · 10:00 – 11:30"] }],
      mensaje: "Hola, he visto en la web los horarios del Club Capoeira Andaruê y me gustaría consultar la disponibilidad. ¿Podríais indicarme qué grupos tienen plazas actualmente? Gracias.",
    },
    cuotas: {
      titulo: "Cuotas de Capoeira",
      grupos: [{ filas: [["1 día por semana", "30 €/mes"], ["2 días por semana", "40 €/mes"], ["3 días por semana", "50 €/mes"]] }],
      notas: ["Primera clase gratuita · Sin matrícula."],
    },
    notaFinal: "No necesitas experiencia previa. Te acompañamos desde el primer entrenamiento.",
    conocer: { boton: "Quiero conocer Capoeira", mensaje: "Hola, os escribo desde la web de 720 Gym Club. Me gustaría conocer el Club Capoeira Andaruê. ¿Podría acercarme un día a ver cómo es una clase? Gracias." },
    whatsapp: "34639611104",
    actividad: "capoeira",
    clases: ["capoeira"],
    seo: { titulo: "Capoeira en Ourense: Club Andaruê", descripcion: "Club Capoeira Andaruê en 720GYM CLUB, Ourense: capoeira para adultos y niños, todos los niveles. Movimiento, música y ritmo. Primera clase gratuita y sin matrícula." },
  },
  {
    slug: "gimnasia-acrobatica",
    href: "/gimnasia-acrobatica",
    grupo: "clubes",
    nombre: "Gimnasia acrobática",
    titulo: "Gimnasia acrobática",
    marca: "ESCOLA XIMNASIA BURGAS",
    color: "#f5b800",
    logo: "/logos/ximnasia-burgas.png",
    lineas: "Fuerza. Equilibrio. Equipo. Un grupo para cada edad con la Escola Ximnasia Burgas.",
    lema: "Fuerza. Equilibrio. Equipo.",
    texto: "Una disciplina que combina acrobacias y trabajo en equipo con un aprendizaje progresivo.",
    chips: ["Para niños", "Para adultos", "Aprendizaje progresivo"],
    bloque: {
      titulo: "Un grupo para cada edad",
      intro: "Propuestas adaptadas a diferentes edades, objetivos y niveles de práctica.",
      tarjetas: [
        { titulo: "Gimnasia para niños", texto: "Una actividad progresiva para desarrollar coordinación, fuerza, flexibilidad, confianza y trabajo en equipo." },
        { titulo: "Gimnasia para adultos", texto: "Una práctica adaptada para mejorar movilidad, fuerza, equilibrio y control corporal." },
      ],
      nota: "El club también ofrece preparación para quienes quieran avanzar hacia la competición.",
    },
    club: { nombre: "Escola Ximnasia Burgas", texto: "Entrena dentro de un club especializado y forma parte de un equipo cercano." },
    niveles: {
      titulo: "Grupos adaptados a cada etapa",
      intro: "Las clases se organizan por edad y nivel para aprender de forma progresiva, segura y divertida.",
      items: [
        { titulo: "Psicomotricidad · de 3 a 5 años", texto: "Control corporal, coordinación, fuerza y flexibilidad mientras desarrollan confianza y habilidades sociales." },
        { titulo: "Escuela de gimnasia · desde 6 años", texto: "Iniciación a la gimnasia, la acrobática y el trampolín. Aprendizaje de colocación, técnica y elementos básicos." },
        { titulo: "Gimnasia para adultos · desde 18 años", texto: "No necesitas experiencia previa. Mejora movilidad, agilidad, fuerza y control corporal con acrobacias individuales y en grupo." },
        { titulo: "Competición", texto: "Preparación para niveles escolar y nacional de gimnasia acrobática y trampolín." },
      ],
    },
    equipo: {
      titulo: "Conoce al equipo",
      personas: [
        { nombre: "Isaura Hermida Pérez", rol: "Entrenadora principal de gimnasia acrobática" },
        {
          nombre: "Yolanda García Sequeiros",
          apodo: "Yoli",
          rol: "Entrenadora de gimnasia acrobática · Fisioterapeuta",
          resumen: "Vinculada a la gimnasia desde los 6 años, ha sido gimnasta en diferentes niveles de competición y se ha formado como entrenadora de gimnasia acrobática. En 720GYM dirige parte de la escuela y las clases para adultos, ayudando a cada persona a desarrollar sus capacidades, su agilidad y la confianza en su cuerpo.",
          sellos: ["Experiencia como gimnasta", "Entrenadora en todos los niveles", "Graduada en Fisioterapia"],
        },
        {
          nombre: "Iria Do Nascimento Penín",
          rol: "Entrenadora y jueza de gimnasia acrobática",
          resumen: "Con más de 15 años sobre el tapiz, ha competido en gimnasia acrobática y trampolín, logrando medallas en campeonatos autonómicos, nacionales e internacionales. Su forma de enseñar une progresión, confianza, disciplina y trabajo en equipo.",
          sellos: ["Más de 15 años de experiencia", "Entrenadora de gimnasia acrobática", "Jueza autonómica y nacional", "Graduada en Educación Social"],
        },
        { nombre: "Luis Sánchez Botana", rol: "Entrenador de gimnasia acrobática" },
      ],
    },
    horarios: {
      titulo: "Horarios de gimnasia acrobática",
      grupos: [
        { titulo: "Psicomotricidad · 3 a 5 años", lineas: ["Lunes y jueves · 17:00 – 18:00"] },
        { titulo: "Competición", lineas: ["Martes · 16:30 – 18:30", "Miércoles y viernes · 16:30 – 20:00"] },
        { titulo: "Escuela de iniciación", lineas: ["Martes y jueves · 18:30 – 19:30"] },
        { titulo: "Acrobacia +12 años", lineas: ["Lunes · 18:30 – 20:00"] },
        { titulo: "Acrobacia adultos +18", lineas: ["Lunes · 21:00 – 22:00", "Martes · 19:30 – 20:30"] },
      ],
      mensaje: "Hola, he visto en la web los horarios de Escola Ximnasia Burgas y me gustaría consultar la disponibilidad. ¿Podríais orientarme sobre los grupos que tienen plazas actualmente? Gracias.",
    },
    cuotas: {
      titulo: "Cuotas de gimnasia acrobática",
      grupos: [
        { titulo: "1 hora por semana", filas: [["Al mes", "15 €"], ["Al trimestre", "45 €"], ["Curso completo · octubre–junio", "135 €"]] },
        { titulo: "2 horas por semana", filas: [["Al mes", "25 €"], ["Al trimestre", "70 €"], ["Curso completo · octubre–junio", "200 €"]] },
      ],
      notas: ["Primera clase gratuita."],
    },
    notaFinal: "Consulta el grupo que mejor encaja según la edad y el nivel.",
    conocer: { boton: "Quiero conocer Gimnasia Acrobática", mensaje: "Hola, os escribo desde la web de 720 Gym Club. Me gustaría conocer vuestras clases de gimnasia acrobática. ¿Podéis contarme cómo organizáis los grupos por edades y cuándo podría pasar a conoceros? Gracias." },
    whatsapp: "34605845925",
    actividad: "acrobacia",
    clases: ["acrobacia"],
    seo: { titulo: "Gimnasia acrobática en Ourense: Escola Ximnasia Burgas", descripcion: "Escola Ximnasia Burgas en 720GYM CLUB, Ourense: gimnasia acrobática para niños desde 3 años y adultos, con grupos por edad y nivel y preparación para competición. Primera clase gratuita." },
  },
];

export function conceptoPorSlug(slug: string): Concepto | undefined {
  return conceptos.find((c) => c.slug === slug);
}

/** Clubes que entrenan en 720: salen de sus fichas. */
export const clubes = conceptos
  .filter((c) => c.club)
  .map((c) => ({ logo: c.logo, nombre: c.club!.nombre, disciplina: c.titulo, corto: c.marca, detalle: c.lineas, actividad: c.actividad, href: c.href }));

/** Actividades del formulario único (sustituye a sus cuatro formularios de Google). */
export const actividades: { id: string; nombre: string; grupo?: "gimnasio" | "personal" | "pilates"; pilates?: boolean }[] = [
  { id: "gimnasio", nombre: "Gimnasio", grupo: "gimnasio" },
  { id: "personal", nombre: "Programa 720", grupo: "personal" },
  { id: "pilates", nombre: "720 Pilates (Reformer, Mat y Wall Unit)", grupo: "pilates", pilates: true },
  { id: "hipopresivos", nombre: "720 Hipopresivos", pilates: true },
  { id: "yoga", nombre: "720 Yoga" },
  { id: "crossgym", nombre: "CrossGym" },
  { id: "powerlifting", nombre: "720 Powerlifting" },
  { id: "bjj", nombre: "Brazilian Jiu-Jitsu (Mambises)" },
  { id: "kravmaga", nombre: "Krav Maga (KME)" },
  { id: "capoeira", nombre: "Capoeira (Andaruê)" },
  { id: "acrobacia", nombre: "Gimnasia acrobática (Burgas)" },
];
