import type { Messages } from "@/i18n/getMessages";
import es from "../es";

/**
 * A web en galego. As recensións, as citas literais e os textos legais van en castelán,
 * que é como se escribiron (e, no caso dos legais, a versión vinculante).
 */
const gl: Messages = {
  common: {
    tagline: "O sabor auténtico dos Viños dende 1974",
    description:
      "Bar de pinchos na rúa dos Fornos, na zona dos Viños de Ourense, dende 1974. Chicharróns, calamares, tortilla e empanadillas de sempre, de pé e na barra.",
    skipToContent: "Saltar ao contido",
    area: "Casco histórico · Zona dos Viños",
    language: "Idioma",
    call: "Chamar",
    directions: "Como chegar",
    openInMaps: "Abrir en Google Maps",
    loadMap: "Cargar mapa",
    loadMapNote: "O mapa sérveo Google, que pode usar as súas cookies.",
    loadMapPolicy: "Política de cookies",
    pending: "Pendente de confirmar",
    photoPending: "Foto real proximamente",
    close: "Pechar",
    readMore: "Ver máis",
    source: "Fonte",
    days: {
      mon: "Luns",
      tue: "Martes",
      wed: "Mércores",
      thu: "Xoves",
      fri: "Venres",
      sat: "Sábado",
      sun: "Domingo",
    },
    daysShort: { mon: "Lu", tue: "Ma", wed: "Mé", thu: "Xo", fri: "Ve", sat: "Sá", sun: "Do" },
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
    today: "Hoxe",
    closedDay: "Pechado",
  },

  nav: {
    items: {
      home: "Inicio",
      carta: "Carta",
      vinos: "Viños",
      historia: "Historia",
      visita: "Visítanos",
      preguntas: "Preguntas",
    },
    subheadings: {
      home: "A portada",
      carta: "Pinchos, montados, bocadillos e racións",
      vinos: "As denominacións galegas",
      historia: "Quen somos, dende 1974",
      visita: "Horario, mapa e como funciona a barra",
      preguntas: "Reservas, prezos, cans, alérxenos…",
    },
    menu: { label: "Menú", open: "Abrir o menú", close: "Pechar o menú", heading: "Navegación" },
    hoursShort: "Mércores a domingo, 19:30 – 00:00",
  },

  cover: {
    label: "Café Bar Dos Puertas",
    tagline: "Ourense · Dende 1974",
    scroll: "Baixa",
  },

  puertas: {
    kicker: "Dúas portas",
    titleBefore: "Por cal",
    titleAccent: "entras?",
    lead: "Fóra, o rótulo de 1974. Dentro, unha barra ao día.",
    hint: "Baixa para abrilas ou toca unha porta",
    open: "Abrir a porta {n}: {name}",
    doors: {
      siempre: {
        n: "1",
        label: "Porta 1",
        name: "A de sempre",
        text: "Pinchos de sempre e medio século de historia.",
        links: [
          { path: "/carta", label: "A carta" },
          { path: "/historia", label: "A historia" },
        ],
      },
      hoy: {
        n: "2",
        label: "Porta 2",
        name: "A de hoxe",
        text: "Viño galego, cañas ben tiradas e o local renovado.",
        links: [
          { path: "/vinos", label: "Os viños" },
          { path: "/#por-dentro", label: "Por dentro" },
        ],
      },
    },
  },

  hero: {
    kicker: "Rúa dos Fornos, 7 · Dende 1974",
    titleBefore: "O corazón",
    titleAccent: "dos Viños",
    titleAfter: "de Ourense",
    subtitle: "Tradición, autenticidade e os pinchos de sempre na rúa dos Fornos dende 1974.",
    ctaPrimary: "Ver a Barra de Pinchos",
    ctaSecondary: "Como chegar",
    press: {
      outlet: "La Voz de Galicia",
      aria: "Ler a reportaxe de La Voz de Galicia sobre o Dos Puertas",
      items: ["Ata Amancio Ortega se deixou conquistar polos seus «calamares»", "Máis de 50 anos de barra na rúa dos Fornos", "Un mítico da zona dos Viños"],
    },
    showcase: {
      label: "Os da casa",
      boardPrices: "Pinchos a 2 €",
      seeCarta: "Ver a carta",
    },
  },

  manifesto: {
    kicker: "Como funciona",
    titleBefore: "Éntrase por unha porta,",
    titleAccent: "sáese",
    titleAfter: "pola outra",
    lead:
      "As dúas portas non son un nome bonito: Irene e José puxéronas en 1974 para que a xente puidese entrar e saír sen parar a barra. Medio século despois, segue a ser así de sinxelo.",
    rules: [
      { title: "Sen reservas", text: "Aquí non se reserva: chégase, pídese e compártese barra." },
      { title: "De pé, na barra", text: "Tapeo dos de antes, ombro con ombro con quen veña." },
      { title: "Pinchos a 2 €", text: "Prezo de barra de toda a vida, que tamén é parte da receita." },
    ],
  },

  barra: {
    kicker: "A barra",
    titleBefore: "Os pinchos",
    titleAccent: "de sempre",
    titleAfter: "",
    lead: "Expostos na barra para pedir ao momento, como dende o primeiro día. Estes son os catro que non fallan.",
    seeAll: "Ver a carta completa",
    openDetail: "Ver a historia: {name}",
    pageTitle: "Carta",
    pageLead:
      "O que se pide no Dos Puertas, de pé e sen présa. Cambia segundo o día: o que ves na barra é o que hai.",
    priceNote: "Segundo a lousa da fachada: pinchos a 2 € e bocadillos a 4 €. Prezos das racións pendentes de confirmar coa casa.",
    allergensNote: "Información de alérxenos pendente: pregunta na barra.",
    storyLabel: "A historia",
    filterLabel: "Filtrar a barra",
    all: "Todo",
    results: "{count} na barra",
    categories: {
      casa: "Da casa",
      montados: "Montados",
      raciones: "Bocadillos e racións",
      beber: "Para beber",
    },
    items: {
      chicharrones: {
        name: "Os famosos chicharróns",
        tag: "O favorito da casa",
        text: "Crocantes, saborosos e feitos coa receita tradicional. O pincho máis aclamado e buscado da barra.",
        story:
          "Chegaron nos anos 90 e cociñábanse na casa cada día. Había un matrimonio ourensán que vivía en Suíza e algunhas fins de semana viña en avión só polos chicharróns e os chipiróns.",
      },
      calamares: {
        name: "Pincho de calamares",
        tag: "Imprescindible",
        text: "Unha icona da rúa dos Fornos. Calamares tenros, fritidos no seu punto xusto, nun bolliño de pan.",
        story:
          "Naceu dunha confusión: nos 80 había un bolliño de touciño tan crocante e rizado que os turistas o pedían como «o de calamares». Así que os sumaron á barra: en realidade son chipiróns, pero quedoulles o nome. A familia conta que ata Amancio Ortega quedou conquistado.",
      },
      tortilla: {
        name: "Tortilla xugosa",
        tag: "Caseira",
        text: "Xugosa, recén feita e sen cebola, como a pediron os clientes.",
        story:
          "Ao principio levaba cebola, pero moita xente protestaba, así que pasou a facerse sen e xa está. Dende os 90 é famosa por ser tan xugosa.",
      },
      empanadillas: {
        name: "Empanadillas tradicionais",
        tag: "Receita de 1974",
        text: "Masa crocante recheada de refogado clásico. Perfectas para comezar a rolda.",
        story:
          "Están na barra dende o primeiro ano. Algúns colexios da zona encargábanas para as súas festas: houbo noites enteiras facendo mil empanadillas e máis.",
      },
      rixones: {
        name: "Rixóns",
        tag: "Galego",
        text: "Rixóns galegos tradicionais, como nas tabernas de antes.",
        story: "",
      },
      "lomo-queso": { name: "Lombo con queixo", tag: "Montado", text: "Montado de lombo con queixo.", story: "" },
      "jamon-queso": { name: "Xamón e queixo", tag: "Montado", text: "Montado de xamón e queixo.", story: "" },
      "atun-tomate": { name: "Atún con tomate", tag: "Montado", text: "Montado de atún con tomate.", story: "" },
      bocadillos: {
        name: "Bocadillos",
        tag: "4 €",
        text: "Os pinchos da casa en formato bocadillo, para quen vén con fame.",
        story: "",
      },
      raciones: {
        name: "Racións",
        tag: "Para compartir",
        text: "Calamares, xamón serrano, queixo fresco e tortilla, segundo a lousa da porta.",
        story: "",
      },
      vinos: {
        name: "Viños galegos",
        tag: "D.O. de Galicia",
        text: "Selección de viños das denominacións de orixe galegas. Referencias pendentes de confirmar.",
        story: "",
      },
      cerveza: { name: "Cervexa ben tirada", tag: "Caña", text: "A caña de sempre para acompañar a rolda.", story: "" },
    },
  },

  vinos: {
    kicker: "Viños",
    titleBefore: "Viños",
    titleAccent: "da terra",
    pageLead:
      "Nos Viños tapéase e bébese viño galego. Catro das cinco denominacións de orixe de Galicia teñen viñedo na provincia de Ourense.",
    houseKicker: "Na barra",
    houseTitle: "A selección da casa",
    houseText: "Viños das denominacións galegas, por copas, para acompañar a rolda de pinchos.",
    houseFacts: ["Por copas", "Denominacións galegas"],
    housePending: "Referencias concretas pendentes de confirmar coa casa.",
    quoteLabel: "O que din do viño",
    doKicker: "As denominacións",
    doTitle: "Cinco orixes, un mesmo país",
    doLead: "Preme nunha para despregala. No mapa, cada número está onde está a súa denominación, e todos os camiños levan á rúa dos Fornos.",
    doNote: "Isto amosa de onde sae o viño galego, non a carta da casa: as referencias do Dos Puertas están pendentes de confirmar.",
    doPrefix: "D.O.",
    since: "D.O. dende {year}",
    ourenseBadge: "Provincia de Ourense",
    mostly: { blanco: "Sobre todo branco", tinto: "Sobre todo tinto" },
    whites: "Brancas",
    reds: "Tintas",
    mapAria: "Mapa de Galicia coas cinco denominacións de orixe de viño.",
    mapFlow: "Dende cada unha sae un camiño ata Ourense, onde está o Dos Puertas.",
    mapCredit: "Contorno de Galicia: datos de OpenStreetMap, licenza ODbL.",
    mapAtlantic: "Atlántico",
    mapPortugal: "Portugal",
    mapHere: "Estamos aquí",
    regionAria: "Denominación de orixe {name}",
    items: {
      "rias-baixas": {
        zone: "Costa atlántica de Pontevedra e sur da Coruña",
        text: "A única das cinco fóra de Ourense: o reino do Albariño, o branco atlántico.",
      },
      ribeiro: {
        zone: "Vales do Miño, do Avia e do Arnoia, ao oeste da cidade",
        text: "Unha das denominacións máis antigas de España. Brancos aromáticos de Treixadura e tintos de variedades autóctonas.",
      },
      "ribeira-sacra": {
        zone: "Canóns do Sil e do Miño, entre Ourense e Lugo",
        text: "Viñedo en socalcos sobre ladeiras imposibles: a chamada viticultura heroica. Terra de tintos de Mencía.",
      },
      valdeorras: {
        zone: "Val do Sil, no extremo oriental da provincia",
        text: "A casa do Godello, o gran branco galego de interior, e de tintos de Mencía.",
      },
      monterrei: {
        zone: "Val de Monterrei, arredor de Verín, xunto a Portugal",
        text: "Brancos de Godello e Treixadura e tintos de Mencía, na máis ao sur das cinco, xa xunto a Portugal.",
      },
    },
  },

  historia: {
    kicker: "Historia",
    titleBefore: "Máis de 50 anos",
    titleAccent: "de historia",
    titleAfter: "viva",
    pageTitle: "Historia",
    pageLead:
      "O Dos Puertas abriu en 1974, cando na rúa dos Fornos só estaba O Campante. Esta é a súa historia, contada pola familia que o fundou.",
    timeline: [
      {
        year: "Anos 50",
        title: "De Laza a Basilea",
        text: "Irene Fernández e José García emigran de Laza a Basilea, en Suíza. Alí aprenden de hostalaría «todo lo que luego pusimos en práctica en Ourense».",
      },
      {
        year: "1974",
        title: "Ábrense as dúas portas",
        text: "Volven para estar preto da súa filla Rosa e abren o bar na rúa dos Fornos, con dúas portas para facilitar o paso e unha novidade: todos os pinchos expostos na barra para pedir ao momento. José nos fogóns, Irene na barra.",
      },
      {
        year: "Os 70",
        title: "O moruno da casa",
        text: "O pincho máis popular dos primeiros anos: ganchos de aceiro traídos de Suíza, unha salsa que José nunca desvelou e un prezo que rondaba as 25 pesetas. Foron tamén os primeiros en servir bolliños de pan, feitos a man por un panadeiro.",
        photo: "anos70",
      },
      {
        year: "1984",
        title: "Chegan os «calamares»",
        text: "Incorpórase Luis Aguiar, o home de Rosa. Dunha confusión cun bolliño de touciño tan crocante que os turistas o pedían como «o de calamares» nace o pincho máis famoso. Os venres e sábados saían máis de 1.200 bolliños ao día.",
      },
      {
        year: "Anos 90",
        title: "Tortilla e chicharróns",
        text: "Chega a tortilla de pataca, sen cebola porque así o pedían os clientes, e os chicharróns feitos na casa cada día, que axiña se converten nun dos pinchos máis vendidos.",
      },
      {
        year: "Anos 2000",
        title: "O relevo na casa",
        text: "Xubílanse José e Irene e colle o relevo Luis, que mantén o negocio intacto. Coa chegada do euro, o pincho pasa de 80 pesetas a 65 céntimos.",
      },
      {
        year: "Hoxe",
        title: "Marisol e Marisa",
        text: "Dende a pandemia levan o bar as irmás Marisol e Marisa López, con ampla experiencia na hostalaría de Ourense, que quixeron manter intacta a esencia do Dos Puertas.",
        photo: "hoy",
      },
    ],
    photos: {
      anos70: {
        alt: "Fotografía en branco e negro: Irene detrás da barra do Dos Puertas, con clientes ao outro lado, a finais dos anos setenta.",
        caption: "Irene, dentro da barra do Dos Puertas, a finais dos anos setenta.",
        credit: "Foto: La Voz de Galicia",
      },
      hoy: {
        alt: "O equipo de hoxe detrás da barra de granito, cos pinchos do día.",
        caption: "A barra, hoxe.",
        credit: "Foto: Faro de Vigo",
      },
    },
    sourceLabel: "Fonte",
    source: "La Voz de Galicia, “Hasta Amancio Ortega se dejó conquistar por los «calamares» del Dos Puertas de Ourense”, 2 de marzo de 2024.",
    /* Cita literal de Luis Aguiar: vai como se publicou, en castelán. */
    quote: "Lo nuestro eran los pinchos a buen precio.",
    quoteAuthor: "Luis Aguiar, a La Voz de Galicia",
    famousKicker: "Pola barra pasaron",
    famousTitle: "Ata Amancio Ortega",
    famousText:
      "A familia lembra con orgullo que Amancio Ortega estivo no bar e que lle encantaron os «calamares». Tamén viñan moito Fran, o xogador do Deportivo, a cantante Cristina Pato e políticos como Feijóo ou Santalices.",
    pressLink: "Ler a reportaxe en La Voz de Galicia",
  },

  social: {
    kicker: "O que din",
    titleBefore: "Unha parada",
    titleAccent: "obrigada",
    titleAfter: "",
    lead: "{count} recensións reais de 4 e 5 estrelas en Google e TripAdvisor, citadas literalmente na súa lingua orixinal e co seu nome.",
    ratingLabel: "Nota de calidade-prezo",
    ratingCount: "{count} opinións en TripAdvisor",
    readOn: "Ler máis en TripAdvisor",
    readOnGoogle: "Ver todas en Google",
    stars: "{n} de 5",
  },

  interior: {
    kicker: "Por dentro",
    titleBefore: "Así é",
    titleAccent: "por dentro",
    lead:
      "Paredes brancas, andeis cheos de viño coa súa luz azul, as copas colgadas boca abaixo sobre a barra e carteis negros con mensaxes de bar dos de sempre, en positivo.",
    signsLabel: "Carteis da parede",
    note: "Ilustración do local. Nos carteis van frases de clientes en Google e TripAdvisor ata que teñamos foto dos carteis de verdade.",
  },

  visita: {
    kicker: "Visítanos",
    titleBefore: "En pleno",
    titleAccent: "casco histórico",
    titleAfter: "",
    lead: "A dous pasos da catedral, na rúa con máis tradición de pinchos de Ourense.",
    hoursTitle: "Horario",
    addressTitle: "Onde",
    paymentTitle: "Pagamento",
    payments: { cash: "Efectivo", card: "Tarxeta", mobile: "Pagamento móbil" },
    noReservations: "Non aceptamos reservas: tapeo de barra, por orde de chegada.",
    pageTitle: "Visítanos",
    pageLead: "Todo o que cómpre saber antes de cruzar calquera das dúas portas.",
    mapLabel: "Mapa da zona dos Viños coa localización do Dos Puertas",
    faqLink: "Preguntas frecuentes",
  },

  faq: {
    kicker: "Preguntas",
    titleBefore: "Antes de",
    titleAccent: "cruzar a porta",
    pageLead: "O que máis nos preguntan: reservas, horarios, prezos e todo o demais. Se che queda algunha dúbida, chámanos.",
    pendingBadge: "Pendente de confirmar",
    ctaTitle: "Quédache algunha dúbida?",
    ctaText: "Chámanos en horario de apertura e contámoscho.",
    groups: [
      {
        title: "Antes de vir",
        items: [
          { q: "Pódese reservar?", a: "Non. O Dos Puertas é un bar de barra: chégase, pídese e tapéase, por orde de chegada." },
          { q: "Hai mesas para sentar?", a: "Non. Aquí tapéase de pé, na barra, como dende 1974. É parte da graza." },
          { q: "Que días e a que hora abrides?", a: "De mércores a domingo, de 19:30 a 00:00. Luns e martes descansamos." },
          { q: "Cando hai máis xente?", a: "Segundo contan os clientes, as noites da fin de semana a barra énchese ata arriba. Bo sinal." },
          { q: "Onde estades?", a: "Na Rúa dos Fornos, 7, en pleno casco histórico de Ourense e a dous pasos da catedral: a zona dos Viños.", link: { path: "/visita", label: "Ver o mapa" } },
        ],
      },
      {
        title: "Na barra",
        items: [
          { q: "Canto custa un pincho?", a: "Segundo a lousa da porta, 2 € o pincho e 4 € o bocadillo.", pending: true },
          { q: "Cales son os pinchos da casa?", a: "Os chicharróns, o de calamares, a tortilla e as empanadillas. Tamén hai rixóns e montados.", link: { path: "/carta", label: "Ver a carta" } },
          { q: "Os «calamares» son calamares?", a: "O pincho naceu nos 80 dunha confusión cun bolliño de touciño crocante que os turistas pedían como «o de calamares». O que se serve son chipiróns, pero o nome quedou." },
          { q: "A tortilla leva cebola?", a: "Non. Ao principio levábaa, pero moita xente protestaba e dende os anos 90 faise sen." },
          { q: "Que viños tedes?", a: "Viños das denominacións galegas, por copas, para acompañar a rolda.", link: { path: "/vinos", label: "Ver os viños" } },
          { q: "Pódese pedir para levar?", a: "As fichas do bar en internet indican que si. Pregunta na barra.", pending: true },
          { q: "Tedes información sobre alérxenos?", a: "Pregunta na barra antes de pedir e indicámosche que leva cada pincho.", pending: true },
        ],
      },
      {
        title: "Outras dúbidas",
        items: [
          { q: "Pódese pagar con tarxeta?", a: "Si: efectivo, tarxeta e pagamento co móbil." },
          { q: "Podo entrar co meu can?", a: "Varios clientes contan nas súas recensións que entraron co seu can sen problema; a un ata lle puxeron auga.", pending: true },
        ],
      },
    ],
  },

  footer: {
    about: "Bar de pinchos na zona dos Viños de Ourense dende 1974.",
    hours: "Horario",
    location: "Localización",
    links: "A casa",
    rights: "© {year} Café Bar Dos Puertas",
    legal: "Aviso legal",
    credits: "Proposta de web · fotos e información pendentes de validar coa casa",
  },

  consent: {
    title: "Cookies, só se ti queres",
    settingsTitle: "Configurar cookies",
    text: "Aquí non hai cookies de analítica nin de publicidade. O único que as usa é o mapa de Google, e non se carga ata que o aceptes.",
    policy: "Política de cookies",
    accept: "Aceptar todas",
    reject: "Rexeitar",
    configure: "Configurar",
    save: "Gardar a miña selección",
    close: "Pechar sen cambiar nada",
    necessary: {
      title: "Necesarias",
      always: "Sempre activas",
      text: "Gardan no teu navegador o que escolles aquí, para non preguntarcho en cada páxina. Non saen do teu dispositivo.",
    },
    maps: {
      title: "Mapa de Google",
      text: "Carga Google Maps para ver como chegar sen saír da web. Ao cargalo, Google pode instalar as súas propias cookies.",
    },
    footerLink: "Configurar cookies",
    mapsOn: "Mapa de Google cargado co teu permiso.",
    change: "Cambiar",
  },

  /* Os textos legais quedan en castelán (versión vinculante): só se traducen os rótulos e os títulos. */
  seo: {
    home: {
      title: "Dos Puertas · Bar de pinchos na zona dos viños de Ourense",
      description: "Bar de pinchos na rúa dos Fornos, nos Viños de Ourense, dende 1974: calamares, chicharróns, tortilla e viño galego. Sen reservas, de pé e na barra.",
    },
    carta: {
      title: "Carta de pinchos en Ourense · Dos Puertas",
      description: "Pinchos de calamares, chicharróns, tortilla e empanadillas, montados, bocadillos e racións na zona dos viños de Ourense. De pé e na barra, como dende 1974.",
    },
    vinos: {
      title: "Viños galegos por copas nos Viños, Ourense · Dos Puertas",
      description: "Viño galego por copas na zona dos viños de Ourense e as cinco D.O. de Galicia nun mapa: Ribeiro, Ribeira Sacra, Valdeorras, Monterrei e Rías Baixas.",
    },
    historia: {
      title: "Historia do Dos Puertas, bar de Ourense dende 1974",
      description: "De Laza a Basilea e á rúa dos Fornos: como naceu en 1974 o Dos Puertas, o pincho de «calamares» e os chicharróns da zona dos viños de Ourense.",
    },
    visita: {
      title: "Horario e enderezo · Dos Puertas, Rúa dos Fornos 7, Ourense",
      description: "De mércores a domingo, de 19:30 a 00:00, na rúa dos Fornos 7, a carón da catedral de Ourense (zona dos Viños). Sen reservas: tapeo de pé na barra.",
    },
    preguntas: {
      title: "Preguntas frecuentes · Dos Puertas, bar de pinchos en Ourense",
      description: "Pódese reservar? Canto custa un pincho? Podo ir co can? Respostas sobre o Dos Puertas, bar de pinchos da zona dos viños de Ourense.",
    },
    ogAlt: "Café Bar Dos Puertas, bar de pinchos en Ourense dende 1974",
  },
  legal: {
    ...es.legal,
    kicker: "Legal",
    draftNotice:
      "Borrador: faltan os datos do titular do negocio (marcados en dourado) e convén que un profesional o revise antes de publicar a web definitiva.",
    updated: "Última actualización: 5 de outubro de 2026",
    tocLabel: "Nesta páxina",
    otherDocs: "Outros textos legais",
    onlySpanish: "Os textos legais publícanse en castelán, que é a versión vinculante.",
    docs: {
      "aviso-legal": { ...es.legal.docs["aviso-legal"], title: "Aviso legal" },
      privacidad: { ...es.legal.docs.privacidad, title: "Privacidade" },
      cookies: { ...es.legal.docs.cookies, title: "Cookies" },
    },
  },

  notFound: {
    title: "Esta porta non leva a ningures",
    text: "Pero hai outras dúas que si.",
    back: "Volver á barra",
  },
};

export default gl;
