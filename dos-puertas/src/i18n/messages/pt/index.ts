import type { Messages } from "@/i18n/getMessages";
import es from "../es";

/**
 * O site em português (de Portugal). As citações literais (avaliações, imprensa, a família) ficam
 * no original em espanhol, e os textos legais publicam-se em espanhol, que é a versão vinculativa.
 */
const pt: Messages = {
  common: {
    tagline: "O sabor autêntico de Os Viños desde 1974",
    description:
      "Bar de pinchos na rúa dos Fornos, zona de Os Viños de Ourense, desde 1974. Chicharrones, calamares, tortilha e empanadillas de sempre, de pé e ao balcão.",
    skipToContent: "Saltar para o conteúdo",
    area: "Centro histórico · Zona de Os Viños",
    language: "Idioma",
    call: "Ligar",
    directions: "Como chegar",
    openInMaps: "Abrir no Google Maps",
    loadMap: "Carregar mapa",
    loadMapNote: "O mapa é fornecido pela Google, que pode usar os seus cookies.",
    loadMapPolicy: "Política de cookies",
    pending: "Por confirmar",
    photoPending: "Foto real em breve",
    close: "Fechar",
    readMore: "Ver mais",
    source: "Fonte",
    days: {
      mon: "Segunda-feira",
      tue: "Terça-feira",
      wed: "Quarta-feira",
      thu: "Quinta-feira",
      fri: "Sexta-feira",
      sat: "Sábado",
      sun: "Domingo",
    },
    daysShort: { mon: "Seg", tue: "Ter", wed: "Qua", thu: "Qui", fri: "Sex", sat: "Sáb", sun: "Dom" },
    status: {
      open: "Aberto agora",
      closesAt: "até às {time}",
      closingSoon: "Fecha em breve",
      opensToday: "Abre hoje às {time}",
      closedToday: "Hoje descansamos",
      opensOn: "Abrimos {day} às {time}",
      opensTomorrow: "Abrimos amanhã às {time}",
      closed: "Fechado",
    },
    today: "Hoje",
    closedDay: "Fechado",
  },

  nav: {
    items: {
      home: "Início",
      carta: "Ementa",
      vinos: "Vinhos",
      historia: "História",
      visita: "Visite-nos",
      preguntas: "Perguntas",
    },
    subheadings: {
      home: "A página inicial",
      carta: "Pinchos, montados, sandes e doses",
      vinos: "As denominações galegas",
      historia: "Quem somos, desde 1974",
      visita: "Horário, mapa e como funciona o balcão",
      preguntas: "Reservas, preços, cães, alergénios…",
    },
    menu: { label: "Menu", open: "Abrir o menu", close: "Fechar o menu", heading: "Navegação" },
    hoursShort: "Quarta a domingo, 19:30 – 00:00",
  },

  cover: {
    label: "Café Bar Dos Puertas",
    tagline: "Ourense · Desde 1974",
    scroll: "Deslize",
  },

  puertas: {
    kicker: "Duas portas",
    titleBefore: "Por qual",
    titleAccent: "entra?",
    lead: "Lá fora, a tabuleta de 1974. Lá dentro, um balcão de hoje.",
    hint: "Deslize para as abrir ou toque numa porta",
    open: "Abrir a porta {n}: {name}",
    doors: {
      siempre: {
        n: "1",
        label: "Porta 1",
        name: "A de sempre",
        text: "Pinchos de sempre e meio século de história.",
        links: [
          { path: "/carta", label: "A ementa" },
          { path: "/historia", label: "A história" },
        ],
      },
      hoy: {
        n: "2",
        label: "Porta 2",
        name: "A de hoje",
        text: "Vinho galego, imperiais bem tiradas e o espaço renovado.",
        links: [
          { path: "/vinos", label: "Os vinhos" },
          { path: "/#por-dentro", label: "Por dentro" },
        ],
      },
    },
  },

  hero: {
    kicker: "Rúa dos Fornos, 7 · Desde 1974",
    titleBefore: "O coração",
    titleAccent: "dos Viños",
    titleAfter: "de Ourense",
    subtitle: "Tradição, autenticidade e os pinchos de sempre na rúa dos Fornos desde 1974.",
    ctaPrimary: "Ver o balcão de pinchos",
    ctaSecondary: "Como chegar",
    press: {
      outlet: "La Voz de Galicia",
      aria: "Ler a reportagem de La Voz de Galicia sobre o Dos Puertas",
      items: [
        "Até o Amancio Ortega se deixou conquistar pelos seus «calamares»",
        "Mais de 50 anos de balcão na rúa dos Fornos",
        "Uma casa mítica da zona de Os Viños",
      ],
    },
    showcase: {
      label: "Os da casa",
      boardPrices: "Pinchos a 2 €",
      seeCarta: "Ver a ementa",
    },
  },

  manifesto: {
    kicker: "Como funciona",
    titleBefore: "Entra-se por uma porta,",
    titleAccent: "sai-se",
    titleAfter: "pela outra",
    lead:
      "As duas portas não são só um nome bonito: a Irene e o José puseram-nas em 1974 para que as pessoas pudessem entrar e sair sem parar o balcão. Meio século depois, continua a ser assim tão simples.",
    rules: [
      { title: "Sem reservas", text: "Aqui não se reserva: chega-se, pede-se e partilha-se o balcão." },
      { title: "De pé, ao balcão", text: "Petiscos à moda antiga, ombro a ombro com quem vier." },
      { title: "Pinchos a 2 €", text: "Preço de balcão de sempre, que também faz parte da receita." },
    ],
  },

  barra: {
    kicker: "O balcão",
    titleBefore: "Os pinchos",
    titleAccent: "de sempre",
    titleAfter: "",
    lead: "Expostos no balcão para pedir na hora, como desde o primeiro dia. Estes são os quatro que nunca falham.",
    seeAll: "Ver a ementa completa",
    openDetail: "Ver a história: {name}",
    pageTitle: "Ementa",
    pageLead:
      "O que se pede no Dos Puertas, de pé e sem pressa. Muda conforme o dia: o que vê no balcão é o que há.",
    priceNote:
      "Segundo o quadro da fachada: pinchos a 2 € e sandes (bocadillos) a 4 €. Preços das doses por confirmar com a casa.",
    allergensNote: "Informação sobre alergénios ainda pendente: pergunte ao balcão.",
    storyLabel: "A história",
    filterLabel: "Filtrar o balcão",
    all: "Tudo",
    results: "{count} no balcão",
    categories: {
      casa: "Da casa",
      montados: "Montados",
      raciones: "Sandes e doses",
      beber: "Para beber",
    },
    items: {
      chicharrones: {
        name: "Os famosos chicharrones",
        tag: "O favorito da casa",
        text: "Torresmos estaladiços e saborosos, feitos com a receita tradicional. O pincho mais aclamado e procurado do balcão.",
        story:
          "Chegaram nos anos 90 e eram feitos em casa todos os dias. Houve um casal de Ourense que vivia na Suíça e vinha de avião alguns fins de semana só pelos chicharrones e pelos chipirones.",
      },
      calamares: {
        name: "Pincho de calamares",
        tag: "Imprescindível",
        text: "Um ícone da rúa dos Fornos. Lulas tenras, fritas no ponto certo, num pãozinho.",
        story:
          "Nasceu de uma confusão: nos anos 80 havia um pãozinho de toucinho tão estaladiço e encaracolado que os turistas o pediam como «o de calamares». Assim, juntaram-se ao balcão: na verdade são chipirones (lulas pequenas), mas ficaram com o nome. A família conta que até o Amancio Ortega ficou rendido.",
      },
      tortilla: {
        name: "Tortilha suculenta",
        tag: "Caseira",
        text: "Suculenta, acabada de fazer e sem cebola, como os clientes pediram.",
        story:
          "No início levava cebola, mas muita gente reclamava, por isso passou a fazer-se sem e pronto. Desde os anos 90 que é famosa por ser tão suculenta.",
      },
      empanadillas: {
        name: "Empanadillas tradicionais",
        tag: "Receita de 1974",
        text: "Massa estaladiça recheada com refogado clássico. Perfeitas para começar a rodada.",
        story:
          "Estão no balcão desde o primeiro ano. Algumas escolas da zona encomendavam-nas para as suas festas: houve noites inteiras a fazer mil empanadillas e mais.",
      },
      rixones: {
        name: "Rixones",
        tag: "Galego",
        text: "Rixones galegos tradicionais, como nas tabernas de antigamente.",
        story: "",
      },
      "lomo-queso": { name: "Lombo com queijo", tag: "Montado", text: "Montado de lombo com queijo, sobre pão.", story: "" },
      "jamon-queso": { name: "Presunto e queijo", tag: "Montado", text: "Montado de presunto e queijo, sobre pão.", story: "" },
      "atun-tomate": { name: "Atum com tomate", tag: "Montado", text: "Montado de atum com tomate, sobre pão.", story: "" },
      bocadillos: {
        name: "Sandes",
        tag: "4 €",
        text: "Os pinchos da casa em formato sandes (bocadillo), para quem vem com fome.",
        story: "",
      },
      raciones: {
        name: "Doses",
        tag: "Para partilhar",
        text: "Lulas, presunto serrano, queijo fresco e tortilha, segundo o quadro da porta.",
        story: "",
      },
      vinos: {
        name: "Vinhos galegos",
        tag: "D.O. da Galiza",
        text: "Seleção de vinhos das denominações de origem galegas. Referências por confirmar.",
        story: "",
      },
      cerveza: { name: "Cerveja bem tirada", tag: "Imperial", text: "A imperial de sempre para acompanhar a rodada.", story: "" },
    },
  },

  vinos: {
    kicker: "Vinhos",
    titleBefore: "Vinhos",
    titleAccent: "da terra",
    pageLead:
      "À zona de Os Viños vem-se para petiscar e beber vinho galego. Quatro das cinco denominações de origem da Galiza têm vinha na província de Ourense.",
    houseKicker: "Ao balcão",
    houseTitle: "A seleção da casa",
    houseText: "Vinhos das denominações galegas, a copo, para acompanhar a rodada de pinchos.",
    houseFacts: ["A copo", "Denominações galegas"],
    housePending: "Referências concretas por confirmar com a casa.",
    quoteLabel: "O que dizem do vinho",
    doKicker: "As denominações",
    doTitle: "Cinco origens, um mesmo país",
    doLead:
      "Toque numa para a abrir. No mapa, cada número está onde fica a sua denominação, e todos os caminhos vão dar à rúa dos Fornos.",
    doNote:
      "Isto mostra de onde vem o vinho galego, não a carta de vinhos da casa: as referências do Dos Puertas estão por confirmar.",
    doPrefix: "D.O.",
    since: "D.O. desde {year}",
    ourenseBadge: "Província de Ourense",
    mostly: { blanco: "Sobretudo branco", tinto: "Sobretudo tinto" },
    whites: "Brancas",
    reds: "Tintas",
    mapAria: "Mapa da Galiza com as cinco denominações de origem de vinho.",
    mapFlow: "De cada uma sai um caminho até Ourense, onde fica o Dos Puertas.",
    mapCredit: "Contorno da Galiza: dados do OpenStreetMap, licença ODbL.",
    mapAtlantic: "Atlântico",
    mapPortugal: "Portugal",
    mapHere: "Estamos aqui",
    regionAria: "Denominação de origem {name}",
    items: {
      "rias-baixas": {
        zone: "Costa atlântica de Pontevedra e sul da Corunha",
        text: "A única das cinco fora de Ourense: o reino do Albariño (Alvarinho), o branco atlântico.",
      },
      ribeiro: {
        zone: "Vales do Minho, do Avia e do Arnoia, a oeste da cidade",
        text: "Uma das denominações mais antigas de Espanha. Brancos aromáticos de Treixadura e tintos de castas autóctones.",
      },
      "ribeira-sacra": {
        zone: "Canhões do Sil e do Minho, entre Ourense e Lugo",
        text: "Vinha em socalcos sobre encostas impossíveis: a chamada viticultura heroica. Terra de tintos de Mencía.",
      },
      valdeorras: {
        zone: "Vale do Sil, no extremo oriental da província",
        text: "A casa do Godello, o grande branco galego do interior, e de tintos de Mencía.",
      },
      monterrei: {
        zone: "Vale de Monterrei, em torno de Verín, junto a Portugal",
        text: "Brancos de Godello e Treixadura e tintos de Mencía, na mais meridional das cinco, já à beira de Portugal.",
      },
    },
  },

  historia: {
    kicker: "História",
    titleBefore: "Mais de 50 anos",
    titleAccent: "de história",
    titleAfter: "viva",
    pageTitle: "História",
    pageLead:
      "O Dos Puertas abriu em 1974, quando na rúa dos Fornos só havia O Campante. Esta é a sua história, contada pela família que o fundou.",
    timeline: [
      {
        year: "Anos 50",
        title: "De Laza a Basileia",
        text: "Irene Fernández e José García emigram de Laza para Basileia, na Suíça. Lá aprendem, no ramo da hotelaria, «todo lo que luego pusimos en práctica en Ourense».",
      },
      {
        year: "1974",
        title: "Abrem-se as duas portas",
        text: "Voltam para estar perto da filha, Rosa, e abrem o bar na rúa dos Fornos, com duas portas para facilitar a passagem e uma novidade: todos os pinchos expostos no balcão para pedir na hora. O José ao fogão, a Irene ao balcão.",
      },
      {
        year: "Anos 70",
        title: "O moruno da casa",
        text: "O pincho mais popular dos primeiros anos, uma espetada: ganchos de aço trazidos da Suíça, um molho que o José nunca revelou e um preço de cerca de 25 pesetas. Foram também os primeiros a servir pãezinhos, feitos à mão por um padeiro.",
        photo: "anos70",
      },
      {
        year: "1984",
        title: "Chegam os «calamares»",
        text: "Junta-se à casa Luis Aguiar, marido da Rosa. De uma confusão com um pãozinho de toucinho tão estaladiço que os turistas o pediam como «o de calamares» nasce o pincho mais famoso. Às sextas e aos sábados saíam mais de 1200 pãezinhos por dia.",
      },
      {
        year: "Anos 90",
        title: "Tortilha e chicharrones",
        text: "Chega a tortilha de batata, sem cebola porque assim pediam os clientes, e os chicharrones feitos em casa todos os dias, que depressa se tornam um dos pinchos mais vendidos.",
      },
      {
        year: "Anos 2000",
        title: "O testemunho fica em casa",
        text: "José e Irene reformam-se e passam o testemunho ao Luis, que mantém o negócio intacto. Com a chegada do euro, o pincho passa de 80 pesetas para 65 cêntimos.",
      },
      {
        year: "Hoje",
        title: "Marisol e Marisa",
        text: "Desde a pandemia, o bar é gerido pelas irmãs Marisol e Marisa López, com larga experiência na restauração de Ourense, que quiseram manter intacta a essência do Dos Puertas.",
        photo: "hoy",
      },
    ],
    photos: {
      anos70: {
        alt: "Fotografia a preto e branco: a Irene atrás do balcão do Dos Puertas, com clientes do outro lado, no final dos anos setenta.",
        caption: "A Irene, do lado de dentro do balcão do Dos Puertas, no final dos anos setenta.",
        credit: "Foto: La Voz de Galicia",
      },
      hoy: {
        alt: "A equipa de hoje atrás do balcão de granito, com os pinchos do dia.",
        caption: "O balcão, hoje.",
        credit: "Foto: Faro de Vigo",
      },
    },
    sourceLabel: "Fonte",
    source:
      "La Voz de Galicia, “Hasta Amancio Ortega se dejó conquistar por los «calamares» del Dos Puertas de Ourense”, 2 de março de 2024.",
    quote: "Lo nuestro eran los pinchos a buen precio.",
    quoteAuthor: "Luis Aguiar, em declarações a La Voz de Galicia",
    famousKicker: "Pelo balcão passaram",
    famousTitle: "Até o Amancio Ortega",
    famousText:
      "A família lembra com orgulho que o Amancio Ortega esteve no bar e que adorou os «calamares». Também vinham muito o Fran, o jogador do Deportivo, a cantora Cristina Pato e políticos como Feijóo ou Santalices.",
    pressLink: "Ler a reportagem de La Voz de Galicia",
  },

  social: {
    kicker: "O que dizem",
    titleBefore: "Uma paragem",
    titleAccent: "obrigatória",
    titleAfter: "",
    lead: "{count} avaliações reais de 4 e 5 estrelas no Google e no TripAdvisor, citadas tal e qual, no original em espanhol, e com o nome de quem as escreveu.",
    ratingLabel: "Nota de qualidade-preço",
    ratingCount: "{count} opiniões no TripAdvisor",
    readOn: "Ler mais no TripAdvisor",
    readOnGoogle: "Ver todas no Google",
    stars: "{n} de 5",
  },

  interior: {
    kicker: "Por dentro",
    titleBefore: "É assim",
    titleAccent: "por dentro",
    lead:
      "Paredes brancas, prateleiras cheias de vinho com a sua luz azul, os copos pendurados de cabeça para baixo sobre o balcão e cartazes pretos com mensagens de bar das de sempre, pela positiva.",
    signsLabel: "Cartazes da parede",
    note: "Ilustração do espaço. Nos cartazes estão frases de clientes no Google e no TripAdvisor até termos fotografias dos cartazes verdadeiros.",
  },

  visita: {
    kicker: "Visite-nos",
    titleBefore: "Em pleno",
    titleAccent: "centro histórico",
    titleAfter: "",
    lead: "A dois passos da catedral, na rua com mais tradição de pinchos de Ourense.",
    hoursTitle: "Horário",
    addressTitle: "Onde",
    paymentTitle: "Pagamento",
    payments: { cash: "Dinheiro", card: "Cartão", mobile: "Pagamento móvel" },
    noReservations: "Não aceitamos reservas: petiscos ao balcão, por ordem de chegada.",
    pageTitle: "Visite-nos",
    pageLead: "Tudo o que precisa de saber antes de cruzar qualquer uma das duas portas.",
    mapLabel: "Mapa da zona de Os Viños com a localização do Dos Puertas",
    faqLink: "Perguntas frequentes",
  },

  faq: {
    kicker: "Perguntas",
    titleBefore: "Antes de",
    titleAccent: "cruzar a porta",
    pageLead:
      "O que mais nos perguntam: reservas, horários, preços e tudo o resto. Se ficar com alguma dúvida, ligue-nos.",
    pendingBadge: "Por confirmar",
    ctaTitle: "Ficou com alguma dúvida?",
    ctaText: "Ligue-nos durante o horário de abertura e nós dizemos-lhe.",
    groups: [
      {
        title: "Antes de vir",
        items: [
          { q: "Posso reservar?", a: "Não. O Dos Puertas é um bar de balcão: chega-se, pede-se e petisca-se, por ordem de chegada." },
          { q: "Há mesas para sentar?", a: "Não. Aqui petisca-se de pé, ao balcão, como desde 1974. Faz parte da graça." },
          { q: "Que dias e a que horas abrem?", a: "De quarta a domingo, das 19:30 às 00:00. À segunda e à terça descansamos." },
          { q: "Quando há mais gente?", a: "Segundo contam os clientes, nas noites de fim de semana o balcão enche até cima. Bom sinal." },
          {
            q: "Onde ficam?",
            a: "Na Rúa dos Fornos, 7, em pleno centro histórico de Ourense e a dois passos da catedral: a zona de Os Viños.",
            link: { path: "/visita", label: "Ver o mapa" },
          },
        ],
      },
      {
        title: "Ao balcão",
        items: [
          { q: "Quanto custa um pincho?", a: "Segundo o quadro da porta, 2 € o pincho e 4 € a sandes (bocadillo).", pending: true },
          {
            q: "Quais são os pinchos da casa?",
            a: "Os chicharrones (torresmos), o de calamares, a tortilha e as empanadillas. Também há rixones e montados.",
            link: { path: "/carta", label: "Ver a ementa" },
          },
          {
            q: "Os «calamares» são lulas?",
            a: "O pincho nasceu nos anos 80 de uma confusão com um pãozinho de toucinho estaladiço que os turistas pediam como «o de calamares». O que se serve são chipirones (lulas pequenas), mas o nome ficou.",
          },
          { q: "A tortilha leva cebola?", a: "Não. No início levava, mas muita gente reclamava e desde os anos 90 faz-se sem." },
          {
            q: "Que vinhos têm?",
            a: "Vinhos das denominações galegas, a copo, para acompanhar a rodada.",
            link: { path: "/vinos", label: "Ver os vinhos" },
          },
          { q: "Posso pedir para levar?", a: "As fichas do bar na internet indicam que sim. Pergunte ao balcão.", pending: true },
          {
            q: "Têm informação sobre alergénios?",
            a: "Pergunte ao balcão antes de pedir e dizemos-lhe o que leva cada pincho.",
            pending: true,
          },
        ],
      },
      {
        title: "Outras dúvidas",
        items: [
          { q: "Posso pagar com cartão?", a: "Sim: dinheiro, cartão e pagamento com o telemóvel." },
          {
            q: "Posso entrar com o meu cão?",
            a: "Vários clientes contam nas avaliações que entraram com o cão sem problema; a um até lhe deram água.",
            pending: true,
          },
        ],
      },
    ],
  },

  footer: {
    about: "Bar de pinchos na zona de Os Viños de Ourense desde 1974.",
    hours: "Horário",
    location: "Localização",
    links: "A casa",
    rights: "© {year} Café Bar Dos Puertas",
    legal: "Aviso legal",
    credits: "Proposta de site · fotos e informação por validar com a casa",
  },

  consent: {
    title: "Cookies, só se quiser",
    settingsTitle: "Configurar cookies",
    text: "Aqui não há cookies de análise nem de publicidade. A única coisa que os usa é o mapa da Google, e não é carregado enquanto não o aceitar.",
    policy: "Política de cookies",
    accept: "Aceitar todos",
    reject: "Rejeitar",
    configure: "Configurar",
    save: "Guardar a minha seleção",
    close: "Fechar sem alterar nada",
    necessary: {
      title: "Necessários",
      always: "Sempre ativos",
      text: "Guardam no seu navegador o que escolher aqui, para não lhe perguntarmos em cada página. Não saem do seu dispositivo.",
    },
    maps: {
      title: "Mapa da Google",
      text: "Carrega o Google Maps para ver como chegar sem sair do site. Ao carregá-lo, a Google pode instalar os seus próprios cookies.",
    },
    footerLink: "Configurar cookies",
    mapsOn: "Mapa da Google carregado com a sua autorização.",
    change: "Alterar",
  },

  legal: {
    ...es.legal,
    kicker: "Legal",
    draftNotice:
      "Rascunho: faltam os dados do titular do negócio (assinalados a dourado) e convém que um profissional o reveja antes de publicar o site definitivo.",
    updated: "Última atualização: 5 de outubro de 2026",
    tocLabel: "Nesta página",
    otherDocs: "Outros textos legais",
    onlySpanish: "Estes textos legais são publicados em espanhol, que é a versão vinculativa.",
    docs: {
      "aviso-legal": { ...es.legal.docs["aviso-legal"], title: "Aviso legal" },
      privacidad: { ...es.legal.docs.privacidad, title: "Privacidade" },
      cookies: { ...es.legal.docs.cookies, title: "Cookies" },
    },
  },

  notFound: {
    title: "Esta porta não dá para lado nenhum",
    text: "Mas há outras duas que dão.",
    back: "Voltar ao balcão",
  },
};

export default pt;
