import type { DataTranslations } from "@/i18n/data";

/**
 * Overrides em português europeu (pt-PT) para os DADOS (ementa, pratos estrela, alergénios,
 * etiquetas, características). Os nomes dos pratos mantêm-se em espanhol/galego (são nomes
 * próprios e o que o cliente verá na ementa impressa); as descrições explicam as especialidades
 * galegas quando é útil. Chaves ausentes → espanhol.
 */
const pt: DataTranslations = {
  categories: {
    sugerencias: {
      label: "Sugestões",
      kicker: "Quadro do dia",
      description: "O que hoje entra pela porta, vindo da lota e do mercado.",
    },
    croquetas: {
      label: "Croquetes",
      kicker: "Caseiros · 8 un.",
      description: "O nosso béchamel repousa 24 h. Estaladiços por fora, cremosos por dentro.",
    },
    tixolas: {
      label: "Tixolas",
      kicker: "A especialidade da casa",
      description: "«Tixola» é frigideira em galego. Frigideiras de ferro fundido que chegam à mesa a chiar.",
    },
    mar: {
      label: "Do Mar",
      kicker: "Lota galega",
      description: "Zamburiñas (vieiras pequenas), polvo, bacalhau e lula. Produto das rias, cozinhado na hora.",
    },
    tierra: {
      label: "Da Terra",
      kicker: "Doses para partilhar",
      description: "Raxo (lombo de porco marinado), orelha, queijos galegos e clássicos dos petiscos de Ourense.",
    },
    ensaladas: {
      label: "Saladas",
      kicker: "Fresco e da época",
      description: "Legumes das hortas de Ourense com toques criativos.",
    },
    postres: {
      label: "Sobremesas",
      kicker: "Caseiras",
      description: "O final doce, feito em casa todas as manhãs.",
    },
    vinos: {
      label: "Vinhos",
      kicker: "Garrafeira galega",
      description: "Godello, Ribeiro, Albariño e Mencía. A copo ou à garrafa.",
    },
    bebidas: {
      label: "Cervejas e mais",
      kicker: "Artesanais e refrigerantes",
      description: "Cerveja artesanal galega, imperiais bem tiradas e refrigerantes.",
    },
  },

  menuItems: {
    // ─── SUGESTÕES ─────────────────────────────────────────────────
    "sug-zamburinas-rellenas": {
      description: "Zamburiñas (vieiras pequenas) da ria recheadas com um refogado de cebola, presunto e pão ralado, gratinadas no forno.",
      unit: "6 un.",
      pairing: "Albariño D.O. Rías Baixas",
    },
    "sug-raxo-arzua": {
      description: "Lombo de porco marinado à galega (raxo), batatas à padeiro e queijo Arzúa-Ulloa derretido.",
      unit: "frigideira",
      pairing: "Mencía D.O. Ribeira Sacra",
    },
    "sug-pulpo-grelos": {
      description: "Polvo da ria marcado na chapa sobre uma cama de grelos salteados com alho e pimentão de La Vera.",
      unit: "dose",
      pairing: "Godello D.O. Valdeorras",
    },

    // ─── CROQUETES ─────────────────────────────────────────────────
    "croq-grelo-chipiron": {
      description: "Os mais aplaudidos de Ourense: béchamel de grelos com chipirões (lulas pequenas) na sua tinta.",
      unit: "8 un.",
      variants: ["Meia dose (4 un.)", "Dose (8 un.)"],
      pairing: "Ribeiro Treixadura",
    },
    "croq-jamon": {
      description: "Receita da avó, com presunto ibérico picado à faca.",
      unit: "8 un.",
      variants: ["Meia dose (4 un.)", "Dose (8 un.)"],
    },
    "croq-cecina-cabra": {
      description: "Cecina de León fumada (carne de vaca curada) com coração de queijo de cabra.",
      unit: "8 un.",
    },
    "croq-bacalao-singluten": {
      description: "Panados com farinha de milho e de arroz. Adequados para celíacos.",
      unit: "8 un.",
    },

    // ─── TIXOLAS ───────────────────────────────────────────────────
    "tix-chistorra-huevos": {
      description: "Chistorra navarra (enchido de porco com pimentão) na brasa, ovos do campo estrelados e desfeitos e batata palha.",
      unit: "frigideira",
      pairing: "Mencía D.O. Ribeira Sacra",
    },
    "tix-huevos-rotos-jamon": {
      description: "O clássico: ovos do campo, batatas e presunto ibérico sobre ferro quente.",
      unit: "frigideira",
    },
    "tix-raxo-queso-azul": {
      description: "Raxo (lombo de porco marinado), ovos estrelados desfeitos e creme de queijo azul galego.",
      unit: "frigideira",
      pairing: "Godello D.O. Valdeorras",
    },
    "tix-gulas-setas-gambas": {
      description: "Gulas (sucedâneo de meixão) com alho, cogumelos da época, gambas e malagueta.",
      unit: "frigideira",
      pairing: "Albariño D.O. Rías Baixas",
    },
    "tix-vegana": {
      description: "Cogumelos, pimentos, curgete e tofu fumado com pimentão. 100 % vegetal.",
      unit: "frigideira",
      pairing: "Ribeiro Treixadura",
    },

    // ─── DO MAR ────────────────────────────────────────────────────
    "mar-zamburinas-plancha": {
      description: "Zamburiñas galegas (vieiras pequenas) grelhadas com azeite virgem, alho e salsa. O nosso prato estrela.",
      unit: "6 un.",
      pairing: "Albariño D.O. Rías Baixas",
    },
    "mar-pulpo-feira": {
      description: "Polvo à galega: cozido em panela de cobre, com cachelos (batatas cozidas), pimentão e azeite. Tradição pura.",
      unit: "dose",
      pairing: "Ribeiro Treixadura",
    },
    "mar-bacalao-tempura": {
      description: "Lombos de bacalhau demolhado em tempura leve e estaladiça, com alioli suave de alho assado.",
      unit: "dose",
      pairing: "Godello D.O. Valdeorras",
    },
    "mar-calamares": {
      description: "Anéis de lula fresca, polme fino e limão.",
      unit: "dose",
    },
    "mar-choubas": {
      description: "Petingas fritas inteiras, estaladiças, com sal grosso e limão.",
      unit: "dose",
    },
    "mar-pastel-cabracho": {
      description: "Pastel caseiro de rascasso (cabracho) com maionese de pimentos e tostas.",
      unit: "dose",
    },

    // ─── DA TERRA ──────────────────────────────────────────────────
    "tie-oreja": {
      description: "Orelha de porco cozida e marcada na chapa até ficar estaladiça, com pimentão e sal grosso.",
      unit: "dose",
      pairing: "Mencía D.O. Ribeira Sacra",
    },
    "tie-fingers-pollo": {
      description: "Tiras de frango panadas em casa, com molho de mel e mostarda.",
      unit: "dose",
    },
    "tie-raxo-patatas": {
      description: "Lombo de porco marinado com alho, pimentão e orégãos, com batatas fritas.",
      unit: "dose",
    },
    "tie-queso-frito": {
      description: "Queijo Tetilla panado e frito, com doce de tomate caseiro.",
      unit: "dose",
    },
    "tie-bravas": {
      description: "Batatas fritas com o nosso molho bravo «fora do comum» e alioli.",
      unit: "dose",
    },
    "tie-padron": {
      description: "Uns picam e outros não. Fritos em azeite, com sal grosso.",
      unit: "dose",
    },
    "tie-tabla-quesos": {
      description: "Arzúa-Ulloa, San Simón da Costa fumado e Tetilla, com marmelada e nozes.",
      unit: "tábua",
      pairing: "Godello D.O. Valdeorras",
    },
    "tie-tabla-embutidos": {
      description: "Chouriço, lacón (pá de porco curada) e cecina, com pão de Cea (IGP), o pão de lenha de Ourense.",
      unit: "tábua",
      pairing: "Mencía D.O. Ribeira Sacra",
    },

    // ─── SALADAS ───────────────────────────────────────────────────
    "ens-pollo-crujiente": {
      description: "Mistura de alfaces, frango panado, tomate cherry, parmesão e vinagreta de mel e mostarda.",
      unit: "dose",
    },
    "ens-ventresca": {
      description: "Tomate da época, ventresca de bonito, cebola nova e azeite virgem extra.",
      unit: "dose",
    },
    "ens-vegana-quinoa": {
      description: "Quinoa, abacate, edamame, romã e sementes de sésamo com lima.",
      unit: "dose",
    },

    // ─── SOBREMESAS ────────────────────────────────────────────────
    "pos-coulant": {
      description: "Bolo de chocolate com coração derretido e gelado de baunilha.",
      unit: "un.",
    },
    "pos-flan-choco-blanco": {
      description: "Pudim caseiro de chocolate branco com caramelo e natas.",
      unit: "un.",
    },
    "pos-tarta-queso": {
      description: "No forno, com base de bolacha e coulis de frutos vermelhos.",
      unit: "un.",
    },
    "pos-pina": {
      description: "Ananás fresco laminado, sumo de lima e folhas de hortelã.",
      unit: "un.",
    },

    // ─── VINHOS ────────────────────────────────────────────────────
    "vin-godello": {
      description: "Branco mineral e fresco, o favorito da casa para o polvo e o bacalhau.",
      unit: "copo",
      variants: ["Copo", "Garrafa"],
    },
    "vin-ribeiro": {
      description: "O vinho de Ourense por excelência: floral, leve, perfeito com croquetes.",
      unit: "copo",
      variants: ["Copo", "Garrafa"],
    },
    "vin-albarino": {
      description: "Aromático e salino. A harmonização natural das zamburiñas.",
      unit: "copo",
      variants: ["Copo", "Garrafa"],
    },
    "vin-mencia": {
      description: "Tinto atlântico de viticultura heroica. Frutos vermelhos e frescura para as tixolas.",
      unit: "copo",
      variants: ["Copo", "Garrafa"],
    },

    // ─── BEBIDAS ───────────────────────────────────────────────────
    "beb-artesana": {
      description: "Seleção rotativa de cervejeiras galegas. Pergunte pela de hoje.",
      unit: "33 cl",
    },
    "beb-cana": {
      description: "Imperial bem tirada, com a tapa da casa.",
      unit: "imperial",
    },
    "beb-agua": {
      description: "Com ou sem gás.",
      unit: "50 cl",
    },
  },

  starDishes: {
    zamburinas: {
      kicker: "Prato estrela",
      headline: "As zamburiñas que tornaram a casa famosa",
      description:
        "Zamburiñas galegas (vieiras pequenas) abertas na concha e marcadas na chapa com azeite virgem extra, alho laminado e salsa fresca. Suculentas, com aquele ponto de brasa que só o ferro dá.",
      ingredients: ["Zamburiñas da ria", "Azeite virgem extra", "Alho laminado", "Salsa fresca", "Sal de Arousa", "Limão"],
      unit: "6 un.",
      badge: "N.º 1 em zamburiñas",
      pairingWhy: "A sua salinidade e acidez limpam a gordura do azeite e realçam a doçura do molusco.",
    },
    pulpo: {
      kicker: "Tradição",
      headline: "O polvo de Ourense, capital galega do polvo",
      description:
        "Servimo-lo de duas formas: á feira (à galega), cozido em panela de cobre com cachelos e pimentão, ou na chapa sobre grelos salteados com alho e pimentão de La Vera. Tenro por dentro, tostado por fora.",
      ingredients: ["Polvo da ria", "Grelos", "Cachelos (batatas cozidas)", "Pimentão de La Vera", "Azeite virgem extra", "Sal grosso"],
      unit: "dose",
      pairingWhy: "Um branco com corpo e mineralidade que acompanha a textura do polvo sem a tapar.",
    },
    bacalao: {
      kicker: "Estaladiço",
      headline: "Tempura leve, bacalhau em lascas",
      description:
        "Lombos de bacalhau demolhado em casa, envoltos numa tempura arejada e muito fina, fritos na hora e servidos com alioli suave de alho assado.",
      ingredients: ["Bacalhau demolhado", "Tempura leve", "Alioli de alho assado", "Cebolinho", "Azeite virgem extra"],
      unit: "dose",
      pairingWhy: "O vinho de Ourense: floral e leve, contrasta com o polme e refresca cada garfada.",
    },
    oreja: {
      kicker: "Petisco clássico",
      headline: "Estaladiça por fora, macia por dentro",
      description:
        "Orelha de porco cozida lentamente e marcada na chapa até ficar estaladiça, terminada com pimentão, sal grosso e um fio de azeite. A tapa de sempre, feita com carinho.",
      ingredients: ["Orelha de porco", "Pimentão doce e picante", "Sal grosso", "Azeite virgem extra", "Alho"],
      unit: "dose",
      badge: "Sem glúten",
      pairingWhy: "Um tinto atlântico fresco e frutado que equilibra a untuosidade da orelha.",
    },
  },

  allergens: {
    gluten: { label: "Glúten", description: "Cereais com glúten: trigo, centeio, cevada, aveia, espelta." },
    crustaceos: { label: "Crustáceos", description: "Gambas, camarões, navalheiras, santola e derivados." },
    huevos: { label: "Ovos", description: "Ovos e produtos à base de ovos." },
    pescado: { label: "Peixe", description: "Peixe e produtos à base de peixe." },
    cacahuetes: { label: "Amendoins", description: "Amendoins e produtos à base de amendoins." },
    soja: { label: "Soja", description: "Soja e produtos à base de soja." },
    lacteos: { label: "Laticínios", description: "Leite e derivados, incluindo a lactose." },
    "frutos-cascara": { label: "Frutos de casca rija", description: "Amêndoas, avelãs, nozes, cajus, pistácios…" },
    apio: { label: "Aipo", description: "Aipo e produtos derivados." },
    mostaza: { label: "Mostarda", description: "Mostarda e produtos derivados." },
    sesamo: { label: "Sésamo", description: "Sementes de sésamo e produtos à base de sésamo." },
    sulfitos: { label: "Sulfitos", description: "Dióxido de enxofre e sulfitos (> 10 mg/kg). Presentes em vinhos e conservas em vinagre." },
    altramuces: { label: "Tremoços", description: "Tremoços e produtos à base de tremoço." },
    moluscos: { label: "Moluscos", description: "Polvo, lula, zamburiñas, mexilhões, amêijoas…" },
  },

  dietTags: {
    vegano: "Vegano",
    vegetariano: "Vegetariano",
    "sin-gluten": "Sem glúten",
    picante: "Picante",
    estrella: "Prato estrela",
    nuevo: "Novo",
  },

  features: [
    "Esplanada com vista para a Catedral",
    "Opções veganas e vegetarianas",
    "Croquetes sem glúten",
    "Garrafeira com D.O. galegas",
    "Cerveja artesanal",
    "Aceitamos cartões",
  ],
};
export default pt;
