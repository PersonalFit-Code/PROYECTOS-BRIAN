import type { CamareroTexts } from "./es";

/**
 * O empregado virtual em português (de Portugal, a dois passos de Ourense). As citações das
 * avaliações ficam no original em espanhol, como no resto do site.
 */
const pt: CamareroTexts = {
  open: "Pergunte ao empregado",
  title: "O empregado",
  subtitle: "Virtual · respostas da casa",
  close: "Fechar o chat",
  greeting: "Olá! Sou o empregado virtual do Dos Puertas. Pergunte-me o que quiser sobre a casa ou toque numa destas perguntas.",
  nowLine: "Neste momento: {label}{detail}.",
  more: "Ver todas as perguntas",
  placeholder: "Escreva a sua pergunta…",
  send: "Enviar",
  typing: "O empregado está a escrever…",
  fallback: "Isso não tenho apontado no caderno. Pergunte ao balcão ou ligue-nos para o {phone} e nós dizemos-lhe.",
  note: "Respostas já escritas com a informação deste site. O que escreve não sai do seu telemóvel.",
  pending: "Por confirmar com a casa",
  log: "Conversa com o empregado",
  you: "Você",
  groups: { lugar: "Horário e local", funciona: "Como funciona", pinchos: "Pinchos", beber: "Para beber", casa: "A casa" },
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
  days: {
    mon: "na segunda-feira",
    tue: "na terça-feira",
    wed: "na quarta-feira",
    thu: "na quinta-feira",
    fri: "na sexta-feira",
    sat: "no sábado",
    sun: "no domingo",
  },
  actions: {
    call: "Ligar",
    maps: "Abrir no Google Maps",
    carta: "Ver a ementa",
    vinos: "Ver os vinhos",
    historia: "Ler a história",
    visita: "Horário e mapa",
    preguntas: "Mais perguntas",
  },
  items: {
    ahora: {
      q: "Estão abertos agora?",
      a: "Abrimos de quarta a domingo, das 19:30 às 00:00. À segunda e à terça descansamos.",
      keys: ["aberto", "abertos", "agora", "hoje", "fechado"],
    },
    horario: {
      q: "Qual é o horário?",
      a: "De quarta a domingo, das 19:30 às 00:00. À segunda e à terça descansamos.",
      keys: ["horario", "hora", "abrem", "fecham", "fecha", "dias", "segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo", "fim de semana"],
    },
    donde: {
      q: "Onde ficam?",
      a: "Na Rúa dos Fornos, 7, em pleno centro histórico de Ourense e a dois passos da catedral: a zona de Os Viños. Procure a tabuleta verde na fachada.",
      keys: ["onde", "morada", "endereco", "localiza", "chegar", "rua", "mapa", "fornos", "catedral", "zona"],
    },
    telefono: {
      q: "Como vos posso ligar?",
      a: "Para o {phone}, no horário de abertura.",
      keys: ["telefone", "ligar", "contacto", "numero", "whatsapp"],
    },
    reservar: {
      q: "Posso reservar?",
      a: "Não. Isto é um bar de balcão: chega-se, pede-se e petisca-se, por ordem de chegada.",
      keys: ["reserv", "grupo", "aniversario", "festa"],
    },
    mesas: {
      q: "Há mesas para sentar?",
      a: "Não: aqui petisca-se de pé, ao balcão, como desde 1974. Faz parte da graça.",
      keys: ["mesa", "sentar", "cadeira", "banco", "de pe"],
    },
    gente: {
      q: "Quando há mais gente?",
      a: "Segundo os clientes, à hora de ponta enche até cima, sobretudo nas noites de fim de semana. Mas falam de um balcão rápido e bem atendido.",
      keys: ["gente", "cheio", "fila", "esperar", "espera", "hora de ponta", "calm", "ambiente"],
    },
    recomienda: {
      q: "O que me recomenda?",
      a: "Os quatro da casa: chicharrones (torresmos), «calamares», tortilha e empanadillas (empadinhas). Se é a primeira vez, comece pelo de calamares e pelo de chicharrones, os que as avaliações mais referem. E, como dizem os clientes, com dois ou três pinchos fica jantado.",
      keys: ["recomend", "pincho", "petisc", "comer", "especialidade", "provar", "ementa", "carta", "jantar"],
    },
    precio: {
      q: "Quanto custa um pincho?",
      a: "Segundo o quadro da porta, 2 € o pincho e 4 € a sandes (bocadillo).",
      keys: ["preco", "custa", "quanto", "caro", "barato", "euro"],
    },
    calamares: {
      q: "Os «calamares» são lulas?",
      a: "Quase: são lulas pequenas (chipirones). O pincho nasceu nos anos 80 de uma confusão com um pãozinho de toucinho tão estaladiço que os turistas o pediam como «o de calamares», e o nome ficou. A família conta que o Amancio Ortega adorou.",
      keys: ["calamar", "lula", "chipiron", "pao"],
    },
    chicharrones: {
      q: "Como são os chicharrones?",
      a: "Estaladiços, com a receita tradicional e o pincho mais procurado do balcão. Chegaram nos anos 90 e eram feitos em casa todos os dias. Uma cliente resume assim: «chicharrones ricos, nada aceitosos».",
      keys: ["chicharr", "torresm"],
    },
    tortilla: {
      q: "A tortilha leva cebola?",
      a: "Não. No início levava, mas muita gente reclamava e desde os anos 90 faz-se sem.",
      keys: ["tortil", "omelete", "cebola", "ovo", "batata"],
    },
    vinos: {
      q: "Que vinhos têm?",
      a: "Vinho galego a copo, das denominações de origem da Galiza, para acompanhar a rodada. As referências concretas estão por confirmar com a casa.",
      keys: ["vinho", "albarin", "alvarinho", "godello", "mencia", "ribeiro", "ribeira", "valdeorras", "monterrei", "copo", "tinto", "branco"],
    },
    canas: {
      q: "Há cerveja de pressão?",
      a: "Claro! A caña (imperial) de sempre, bem tirada, para acompanhar a rodada. Um cliente diz assim: «cañas y pinchos buenísimos».",
      keys: ["cerveja", "imperial", "fino", "pressao", "cana", "beber", "bebida", "refrigerante"],
    },
    pagar: {
      q: "Posso pagar com cartão?",
      a: "Sim: dinheiro, cartão e pagamento com o telemóvel.",
      keys: ["cartao", "pagar", "pagamento", "dinheiro", "mb way", "multibanco"],
    },
    llevar: {
      q: "Posso pedir para levar?",
      a: "As fichas do bar na internet dizem que sim. O melhor é perguntar ao balcão ou ligar-nos.",
      keys: ["levar", "take away", "entrega", "domicilio", "encomenda"],
    },
    alergenos: {
      q: "Têm informação sobre alergénios?",
      a: "Pergunte ao balcão antes de pedir e dizemos-lhe o que leva cada pincho.",
      keys: ["alerg", "gluten", "celiac", "intoleran", "lactose", "vegan", "vegetarian"],
    },
    perro: {
      q: "Posso ir com o meu cão?",
      a: "Vários clientes contam nas avaliações que entraram com o cão sem problema; a um até lhe deram água.",
      keys: ["cao", "caes", "cachorro", "animal", "patudo", "meu cao", "com o cao", "levar o cao", "levar o meu cao"],
    },
    historia: {
      q: "Desde quando existe o bar?",
      a: "Desde 1974. Abriram-no Irene Fernández e José García quando voltaram da Suíça, numa altura em que na rúa dos Fornos só havia O Campante. Hoje é gerido pelas irmãs Marisol e Marisa López.",
      keys: ["historia", "desde quando", "quantos anos", "antigo", "1974", "fundad", "abriu", "dono", "quem gere", "familia", "marisa", "marisol"],
    },
    nombre: {
      q: "Porque se chama Dos Puertas?",
      a: "Porque tem duas portas (dos puertas): a Irene e o José abriram o espaço em 1974 com duas portas para facilitar a passagem, e assim entra-se por uma e sai-se pela outra sem parar o balcão.",
      keys: ["porque se chama", "nome", "portas", "porta", "puertas"],
    },
    famosos: {
      q: "Já veio alguém famoso?",
      a: "A família lembra que esteve cá o Amancio Ortega e que adorou os «calamares». Também vinham muito o Fran, o jogador do Deportivo, a cantora Cristina Pato e políticos como Feijóo ou Santalices.",
      keys: ["famos", "celebridade", "amancio", "ortega", "cristina pato", "feijoo", "futebol", "deportivo"],
    },
  },
};

export default pt;
