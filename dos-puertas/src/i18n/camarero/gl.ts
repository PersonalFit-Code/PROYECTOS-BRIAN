import type { CamareroTexts } from "./es";

/**
 * O camareiro virtual en galego. As citas das recensións van tal cal se escribiron (en castelán),
 * como no resto da web.
 */
const gl: CamareroTexts = {
  open: "Pregúntalle ao camareiro",
  title: "O camareiro",
  subtitle: "Virtual · respostas da casa",
  close: "Pechar o chat",
  greeting: "Boas! Son o camareiro virtual do Dos Puertas. Pregúntame o que queiras da casa ou toca unha destas preguntas.",
  nowLine: "Agora mesmo: {label}{detail}.",
  more: "Ver todas as preguntas",
  placeholder: "Escribe a túa pregunta…",
  send: "Enviar",
  typing: "O camareiro está a escribir…",
  fallback: "Iso non o teño apuntado na libreta. Pregúntao na barra ou chámanos ao {phone} e contámoscho.",
  note: "Respostas xa escritas coa información desta web. O que escribes non sae do teu móbil.",
  pending: "Pendente de confirmar coa casa",
  log: "Conversa co camareiro",
  you: "Ti",
  groups: { lugar: "Horario e lugar", funciona: "Como funciona", pinchos: "Pinchos", beber: "Para beber", casa: "A casa" },
  status: {
    open: "Aberto agora",
    closesAt: "ata as {time}",
    closingSoon: "Pecha axiña",
    opensToday: "Abre hoxe ás {time}",
    closedToday: "Hoxe descansamos",
    opensOn: "Abrimos o {day} ás {time}",
    opensTomorrow: "Abrimos mañá ás {time}",
    closed: "Pechado",
  },
  days: { mon: "luns", tue: "martes", wed: "mércores", thu: "xoves", fri: "venres", sat: "sábado", sun: "domingo" },
  actions: {
    call: "Chamar",
    maps: "Abrir en Google Maps",
    carta: "Ver a carta",
    vinos: "Ver os viños",
    historia: "Ler a historia",
    visita: "Horario e mapa",
    preguntas: "Máis preguntas",
  },
  items: {
    ahora: {
      q: "Estades abertos agora?",
      a: "Abrimos de mércores a domingo, de 19:30 a 00:00. Luns e martes descansamos.",
      keys: ["aberto", "abertos", "agora", "hoxe", "pechado"],
    },
    horario: {
      q: "Que horario tedes?",
      a: "De mércores a domingo, de 19:30 a 00:00. Luns e martes descansamos.",
      keys: ["horario", "hora", "abrides", "abren", "pecha", "pechades", "dias", "luns", "martes", "mercores", "xoves", "venres", "sabado", "domingo", "fin de semana"],
    },
    donde: {
      q: "Onde estades?",
      a: "Na Rúa dos Fornos, 7, en pleno casco histórico de Ourense e a dous pasos da catedral: a zona dos Viños. Busca o rótulo verde da fachada.",
      keys: ["onde", "enderezo", "direccion", "ubicacion", "chegar", "rua", "mapa", "fornos", "catedral", "zona"],
    },
    telefono: {
      q: "Como vos chamo?",
      a: "Ao {phone}, en horario de apertura.",
      keys: ["telefono", "chamar", "chamo", "contacto", "numero", "whatsapp"],
    },
    reservar: {
      q: "Pódese reservar?",
      a: "Non. Isto é un bar de barra: chégase, pídese e tapéase, por orde de chegada.",
      keys: ["reserv", "grupo", "aniversario", "celebra"],
    },
    mesas: {
      q: "Hai mesas para sentar?",
      a: "Non: aquí tapéase de pé, na barra, como dende 1974. É parte da graza.",
      keys: ["mesa", "sentar", "cadeira", "tallo", "de pe"],
    },
    gente: {
      q: "Cando hai máis xente?",
      a: "Segundo os clientes, na hora punta énchese ata arriba, sobre todo as noites da fin de semana. Iso si: falan dunha barra rápida e ben atendida.",
      keys: ["xente", "chea", "cheo", "cola", "agardar", "espera", "hora punta", "tranquil", "ambiente"],
    },
    recomienda: {
      q: "Que me recomendas?",
      a: "Os catro da casa: chicharróns, «calamares», tortilla e empanadillas. Se é a túa primeira vez, empeza polo de calamares e polo de chicharróns, que son os que máis nomean as recensións. E como din os clientes, con dous ou tres pinchos vas ceado.",
      keys: ["recomend", "pincho", "comer", "especialidade", "probar", "carta", "empanadill", "rixon", "montad", "bocadill", "racion", "cear", "tapa"],
    },
    precio: {
      q: "Canto custa un pincho?",
      a: "Segundo a lousa da porta, 2 € o pincho e 4 € o bocadillo.",
      keys: ["prezo", "precio", "custa", "canto", "caro", "barato", "euro", "vale"],
    },
    calamares: {
      q: "Os «calamares» son calamares?",
      a: "Case: son chipiróns. O pincho naceu nos 80 dunha confusión cun bolliño de touciño tan crocante que os turistas o pedían como «o de calamares», e o nome quedou. A familia conta que a Amancio Ortega lle encantaron.",
      keys: ["calamar", "chipiron", "bollino", "toucino", "panceta"],
    },
    chicharrones: {
      q: "Como son os chicharróns?",
      a: "Crocantes, coa receita tradicional e o pincho máis buscado da barra. Chegaron nos 90 e facíanse na casa cada día. Unha clienta resúmeo así: «chicharrones ricos, nada aceitosos».",
      keys: ["chicharr"],
    },
    tortilla: {
      q: "A tortilla leva cebola?",
      a: "Non. Ao principio levábaa, pero moita xente protestaba e dende os anos 90 faise sen.",
      keys: ["tortill", "cebol", "ovo", "pataca"],
    },
    vinos: {
      q: "Que viños tedes?",
      a: "Viño galego por copas, das denominacións de orixe de Galicia, para acompañar a rolda. As referencias concretas están pendentes de confirmar coa casa.",
      keys: ["vino", "albarin", "godello", "mencia", "ribeiro", "ribeira", "valdeorras", "monterrei", "copa", "tinto", "branco", "denomina"],
    },
    canas: {
      q: "Hai cañas?",
      a: "Claro! A caña de sempre, ben tirada, para acompañar a rolda. Un cliente dío así: «cañas y pinchos buenísimos».",
      keys: ["cana", "cervexa", "birra", "beber", "bebida", "refresco"],
    },
    pagar: {
      q: "Pódese pagar con tarxeta?",
      a: "Si: efectivo, tarxeta e pagamento co móbil.",
      keys: ["tarxeta", "pagar", "pago", "pagamento", "efectivo", "bizum", "cobr"],
    },
    llevar: {
      q: "Pódese pedir para levar?",
      a: "As fichas do bar en internet din que si. Mellor pregúntao na barra ou chámanos.",
      keys: ["levar", "domicilio", "encarga", "pedido", "glovo"],
    },
    alergenos: {
      q: "Tedes información de alérxenos?",
      a: "Pregunta na barra antes de pedir e dicímosche que leva cada pincho.",
      keys: ["alerx", "alerg", "celiac", "gluten", "intoleran", "lactosa", "vegan", "vexetarian"],
    },
    perro: {
      q: "Podo ir co meu can?",
      a: "Varios clientes contan nas súas recensións que entraron co seu can sen problema; a un ata lle puxeron auga.",
      keys: ["can", "cans", "mascota", "animal", "perr", "meu can", "co meu can", "levar o can", "levar o meu can"],
    },
    historia: {
      q: "Dende cando está o bar?",
      a: "Dende 1974. Abríronno Irene Fernández e José García ao volver de Suíza, cando na rúa dos Fornos só estaba O Campante. Hoxe lévano as irmás Marisol e Marisa López.",
      keys: ["historia", "dende cando", "desde cando", "cantos anos", "antigo", "1974", "fundad", "abriu", "dono", "quen leva", "familia", "marisa", "marisol"],
    },
    nombre: {
      q: "Por que se chama Dos Puertas?",
      a: "Porque as ten: Irene e José abriron o local en 1974 con dúas portas para facilitar o paso, e así éntrase por unha e sáese pola outra sen parar a barra.",
      keys: ["por que se chama", "nome", "portas", "porta", "puerta"],
    },
    famosos: {
      q: "Veu alguén famoso?",
      a: "A familia lembra que estivo Amancio Ortega e que lle encantaron os «calamares». Tamén viñan moito Fran, o xogador do Deportivo, a cantante Cristina Pato e políticos como Feijóo ou Santalices.",
      keys: ["famos", "amancio", "ortega", "conecid", "cristina pato", "feijoo", "futbol", "deportivo"],
    },
  },
};

export default gl;
