import type { DataTranslations } from "@/i18n/data";

/**
 * Overrides em português europeu (pt-PT) para os DADOS (ementa, pratos estrela, alergénios,
 * etiquetas, características). Os nomes dos pratos mantêm-se em espanhol/galego (são nomes
 * próprios e o que o cliente verá na ementa impressa); as descrições explicam as especialidades
 * galegas quando é útil. Chaves ausentes → espanhol.
 */
const pt: DataTranslations = {
  categories: {
    tostas: {
      label: "Tostas",
      kicker: "Para começar",
      description: "Pão torrado e, por cima, pouco e bom. A primeira dentada enquanto se decide o resto.",
    },
    tixolas: {
      label: "Tixolas",
      kicker: "A especialidade da casa",
      description: "«Tixola» é frigideira em galego. Ferro fundido que chega à mesa a chiar, e todas levam ovos e batatas fritas.",
    },
    ensaladas: {
      label: "Saladas",
      kicker: "Fresco, e de prato único",
      description: "Grandes, para comer delas e não para acompanhar. Da horta e da lota em partes iguais.",
    },
    cocina: {
      label: "A nossa cozinha",
      kicker: "O de sempre, bem feito",
      description: "Croquetes, fritos e doses para partilhar. O que sai da cozinha o dia inteiro.",
    },
    especiales: {
      label: "Especiais",
      kicker: "O que há mesmo que provar",
      description: "As zamburiñas (vieiras pequenas) que nos puseram no mapa e os clássicos que não faltam em mesa nenhuma.",
    },
    pulpo: {
      label: "Polvo",
      kicker: "Da ria",
      description: "Cozido em panela de cobre ou marcado na chapa. Em Ourense o polvo tem secção própria.",
    },
    embutidos: {
      label: "Enchidos e queijos",
      kicker: "Tábua e faca",
      description: "Para abrir o apetite ou para esticar a conversa à mesa com o que sobrar no copo.",
    },
    revueltos: {
      label: "Ovos mexidos",
      kicker: "Ovo e frigideira",
      description: "Coalhados no ponto, nem secos nem líquidos. O prato de colher de quem não pega nela.",
    },
    varios: {
      label: "Vários",
      kicker: "Sobremesa e mesa",
      description: "O final doce e o que acompanha tudo o resto.",
    },
  },

  menuItems: {
    // ─── TOSTAS ────────────────────────────────────────────────────
    "tos-salmon-queso": {
      description: "Salmão fumado e queijo cremoso sobre pão torrado. Fria, suave e direta: a que se pede sem pensar enquanto chega o resto.",
      unit: "unidade",
    },
    "tos-trigueros-jamon-codorniz": {
      description: "Espargos verdes na chapa, presunto e um ovo de codorniz por cima. Come-se em duas dentadas e a gema faz o resto.",
      unit: "unidade",
    },
    "tos-cebolla-foie-cabra": {
      description: "Cebola cozinhada devagar até ficar doce, foie gras e um medalhão de queijo de cabra. A mais gulosa das três.",
      unit: "unidade",
    },

    // ─── TIXOLAS ───────────────────────────────────────────────────
    "tix-piquillos-panceta": {
      description: "Pimentos do piquillo caramelizados e entremeada estaladiça sobre a frigideira de ferro, com os seus ovos e as suas batatas. Doce e salgado na mesma dentada.",
      unit: "frigideira",
    },
    "tix-chistorra": {
      description: "Chistorra (enchido de porco com pimentão) feita na própria frigideira, com ovos e batatas fritas. A mais simples e a que mais se repete.",
      unit: "frigideira",
    },
    "tix-gulas-setas-langostinos": {
      description: "Gulas (sucedâneo de meixão), cogumelos salteados e gambas sobre o ferro quente, com ovos e batatas. A mais completa da secção.",
      unit: "frigideira",
    },
    "tix-raxo-arzua": {
      description: "Raxo (lombo de porco marinado à galega) com queijo Arzúa-Ulloa derretido por cima, sobre ovos e batatas. É a que aparece em todas as fotografias da casa.",
      unit: "frigideira",
    },
    "tix-pisto-verduras": {
      description: "Pisto de legumes (o refogado espanhol, feito devagar), com ovos e batatas fritas. A opção sem carne da secção, e não é prémio de consolação.",
      unit: "frigideira",
    },

    // ─── SALADAS ───────────────────────────────────────────────────
    "ens-gulas-setas-langostinos": {
      description: "Cama de rebentos com gulas (sucedâneo de meixão), cogumelos salteados e gambas. Morna por cima e fresca por baixo: come-se como prato único.",
      unit: "dose",
    },
    "ens-pollo-crujiente": {
      description: "Tiras de frango panado frito na hora, nozes e maçã. A que pedem os que não vêm para comer salada.",
      unit: "dose",
    },
    "ens-ventresca": {
      description: "Ventresca de atum sobre legumes frescos. Pouco mais: quando a ventresca é boa, o resto está a mais.",
      unit: "dose",
    },
    "ens-cecina-helado-oveja": {
      description: "Lâminas de cecina (carne de vaca curada e fumada) e uma quenelle de gelado de queijo de ovelha que se vai desfazendo por cima. A mais vistosa da ementa.",
      unit: "dose",
    },
    "ens-aguacate-bacalao": {
      description: "Abacate e bacalhau fumado, suave e amanteigado. A mais leve das cinco.",
      unit: "dose",
    },

    // ─── A NOSSA COZINHA ───────────────────────────────────────────
    "coc-patatas": {
      description: "Batatas fritas com molho bravo, com alioli ou com os dois ao mesmo tempo. A escolha é sua; as mistas são o que pede quase toda a gente.",
      unit: "dose",
    },
    "coc-croquetas-jamon": {
      description: "Béchamel que repousa até ganhar corpo, presunto bem picado e fritura à última hora. Estaladiços por fora, quase líquidos por dentro.",
      unit: "dose",
      variants: ["Meia dose", "Dose"],
    },
    "coc-croquetas-grelos-chipiron": {
      description: "Grelos e chipirão (lula pequena) dentro da béchamel: verde e mar no mesmo croquete. Os mais galegos e os que mais se repetem nas avaliações.",
      unit: "dose",
      variants: ["Meia dose", "Dose"],
    },
    "coc-croquetas-cecina-cabra": {
      description: "Cecina (carne de vaca curada e fumada) e queijo de cabra derretidos na béchamel. Os mais intensos dos três; uma dose chega e sobra para dois.",
      unit: "dose",
      variants: ["Meia dose", "Dose"],
    },
    "coc-mejillones-tigre": {
      description: "Mexilhão picado e ligado com béchamel, devolvido à concha e panado. O petisco de balcão de sempre, feito como deve ser.",
      unit: "dose",
    },
    "coc-calamares": {
      description: "Anéis de lula passados por farinha e fritos na hora. Com limão ao lado e sem mais cerimónia.",
      unit: "dose",
    },
    "coc-bacalao-tempura": {
      description: "Cubos de bacalhau em tempura fina, com pimentos ao lado. Estala ao trincar e por dentro continua suculento.",
      unit: "dose",
    },
    "coc-salteado-verdura-arroz": {
      description: "Legumes e cogumelos salteados em lume forte com arroz. Um prato completo para quem não quer fritos.",
      unit: "dose",
    },
    "coc-croquetas-sin-gluten": {
      description: "O mesmo croquete, feito sem glúten. Está na ementa porque no-lo pedem todos os dias; avise ao pedir para que a cozinha o tenha em conta.",
      unit: "dose",
    },
    "coc-tortilla-champinones": {
      description: "Tortilha suculenta terminada num guisado curto com cogumelos. Come-se com pão e não sobra nada.",
      unit: "dose",
    },
    "coc-fingers-pollo": {
      description: "Tiras de frango panadas e fritas. O prato a que os miúdos se agarram e de que os crescidos acabam por petiscar.",
      unit: "dose",
    },
    "coc-pastel-cabracho": {
      description: "O clássico do norte: rascasso (cabracho), ovo e natas no forno, servido frio com pão torrado. Suave e com muito sabor a mar.",
      unit: "dose",
    },

    // ─── ESPECIAIS ─────────────────────────────────────────────────
    "esp-timbal-vegetal": {
      description: "Legumes montados em camadas, feitos na hora. A entrada mais leve da ementa.",
      unit: "dose",
    },
    "esp-brocheta-xxl": {
      description: "Espetada grande de porco marinado, feita na chapa. Para partilhar ou para quem chega com fome a sério.",
      unit: "unidade",
    },
    "esp-ajada-bacalao": {
      description: "Bacalhau com ajada galega: azeite, alho e pimentão por cima. Receita de sempre, das que se limpam com pão.",
      unit: "dose",
      variants: ["Meia dose", "Dose"],
    },
    "esp-zamburinas-plancha": {
      description: "Zamburiñas (vieiras pequenas) da ria marcadas na chapa, na própria concha. Pouco lume e nada que as tape: o prato que nos deu nome.",
      unit: "dose",
    },
    "esp-zamburinas-rellenas": {
      description: "As mesmas zamburiñas, recheadas com um refogado e gratinadas no forno. A versão gulosa da anterior.",
      unit: "dose",
    },
    "esp-queso-frito": {
      description: "Cubos de queijo panados e fritos, mornos e derretidos por dentro. Dura pouco na mesa.",
      unit: "dose",
    },
    "esp-oreja-plancha": {
      description: "Orelha de porco cozida e depois marcada na chapa até estalar por fora. Petisco de Ourense sem rodeios.",
      unit: "dose",
    },

    // ─── POLVO ─────────────────────────────────────────────────────
    "pul-gallega-plancha": {
      description: "Como preferir: á feira, com cachelos (batatas cozidas), pimentão e azeite, ou marcado na chapa. O mesmo polvo, duas escolas.",
      unit: "dose",
    },
    "pul-plancha-grelos": {
      description: "Polvo marcado na chapa sobre uma cama de grelos salteados. O amargo do grelo com o doce do polvo.",
      unit: "dose",
    },
    "pul-salteado-salmon-langostinos": {
      description: "Polvo, salmão e gambas salteados juntos na frigideira. O prato mais caro da ementa e o que mais mar tem.",
      unit: "dose",
    },
    "pul-tempura": {
      description: "Pedaços de polvo em tempura leve, fritos na hora. Estala por fora e continua tenro por dentro.",
      unit: "dose",
    },

    // ─── ENCHIDOS E QUEIJOS ────────────────────────────────────────
    "emb-jamon-serrano": {
      description: "Cortado à faca e servido à temperatura certa, para que solte a gordura. Com pão ao lado e pouco mais.",
      unit: "dose",
    },
    "emb-queso-pais": {
      description: "Queijo galego da zona, tenro e suave. O que melhor acompanha um copo sem o tapar.",
      unit: "dose",
    },
    "emb-queso-oveja": {
      description: "Curado de ovelha, com mais carácter do que o do país. Para quem quer que o queijo se note.",
      unit: "dose",
    },
    "emb-queso-cabra": {
      description: "Queijo de cabra em rolo, às rodelas, ácido e cremoso. O contraponto da tábua.",
      unit: "dose",
    },

    // ─── OVOS MEXIDOS ──────────────────────────────────────────────
    "rev-algas-langostinos": {
      description: "Ovo coalhado no ponto com algas e gambas. Sabe a mar sem ser peixe.",
      unit: "dose",
    },
    "rev-bacalao-grelos-langostinos": {
      description: "Bacalhau desfiado, grelos e gambas ligados com ovo. O mais completo dos três.",
      unit: "dose",
    },
    "rev-setas-oreja": {
      description: "Cogumelos e orelha estaladiça sobre ovo coalhado. Terra pura, e o que mais enche.",
      unit: "dose",
    },

    // ─── VÁRIOS ────────────────────────────────────────────────────
    "var-postre": {
      description: "Muda conforme o dia e conforme o que tiver saído nessa manhã. Pergunte ao pessoal: há sempre algo caseiro.",
      unit: "dose",
    },
    "var-postre-sin-gluten": {
      description: "A alternativa doce feita sem glúten, para que ninguém fique sem final. Pergunte qual há hoje.",
      unit: "dose",
    },
    "var-pan": {
      description: "Pão do dia no seu cesto, para limpar o que ficar na frigideira.",
      unit: "cesto",
    },
    "var-pan-tomate": {
      description: "Pão torrado esfregado com tomate e azeite. Entra sozinho enquanto chega o resto.",
      unit: "dose",
    },
  },

  starDishes: {
    zamburinas: {
      kicker: "Prato estrela",
      headline: "As zamburiñas que tornaram a casa famosa",
      description:
        "Zamburiñas galegas (vieiras pequenas) abertas na concha e marcadas na chapa com azeite virgem extra, alho laminado e salsa fresca. Suculentas, com aquele ponto de brasa que só o ferro dá.",
      ingredients: ["Zamburiñas da ria", "Azeite virgem extra", "Alho laminado", "Salsa fresca", "Sal", "Limão"],
      unit: "dose",
      badge: "N.º 1 em zamburiñas",
      pairingWhy: "A sua salinidade e a sua acidez limpam a gordura do azeite e realçam a doçura do molusco.",
    },
    raxo: {
      kicker: "A especialidade da casa",
      headline: "A frigideira que chega a chiar à mesa",
      description:
        "Raxo (lombo de porco marinado à galega) sobre ovos e batatas fritas, com queijo Arzúa-Ulloa derretido por cima, servido na própria frigideira de ferro. Ouve-se antes de se ver.",
      ingredients: ["Raxo de porco", "Queijo Arzúa-Ulloa D.O.P.", "Ovos do campo", "Batatas", "Pimentão", "Azeite virgem extra"],
      unit: "frigideira",
      badge: "A mais pedida",
      pairingWhy: "Um tinto leve e fresco que aguenta o queijo derretido sem tapar o marinado da carne.",
    },
    croquetas: {
      kicker: "Béchamel que repousa",
      headline: "Verde e mar no mesmo croquete",
      description:
        "Grelos salteados e chipirão dentro de uma béchamel que repousa até ganhar corpo, panados e fritos na hora. Estalam ao trincar e por dentro continuam quase líquidos.",
      ingredients: ["Grelos", "Chipirão", "Béchamel de 24 h", "Pão ralado", "Ovo", "Azeite virgem extra"],
      unit: "dose",
      badge: "Os mais pedidos",
      pairingWhy: "Tem corpo para a béchamel e o amargo certo para acompanhar o grelo.",
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
  photos: {
    "terraza-catedral": {
      alt: "Esplanada da Tixola Tapería na Rúa Juan de Austria com uma tixola de raxo, croquetes e dois copos de vinho branco, e a igreja de Santa Eufemia de Ourense ao fundo",
      caption: "A esplanada, com Santa Eufemia ao fundo",
    },
    "zamburinas-plancha": {
      alt: "Oito vieiras grelhadas na concha, com um molho de alho e salsa por cima, servidas em prato branco com um fio de redução ao lado",
      caption: "Vieiras galegas grelhadas",
    },
    "tixola-raxo-croquetas": {
      alt: "Tixola de raxo com queijo de Arzúa em frigideira de ferro, croquetes caseiros e vinho branco galego na esplanada da Tixola Tapería, Ourense",
      caption: "Tixola de raxo com queijo de Arzúa e croquetes",
    },
    fachada: {
      alt: "Fachada da Tixola Tapería na Rúa Juan de Austria 7, centro histórico de Ourense, com os seus toldos vermelhos e a ardósia do dia",
      caption: "Rúa Juan de Austria, 7",
    },

    /* Fotos tiradas na casa a 2 de outubro de 2026 */
    "tixola-raxo": {
      alt: "Tixola de raxo com queijo de Arzúa vista de cima: frigideira com batatas, tacos de porco adobado e ovo coalhado, na mesa da Tixola Tapería",
      caption: "Tixola de raxo e Arzúa",
    },
    "tixola-chistorra": {
      alt: "Tixola com chistorra vista de cima: frigideira com batatas, ovo coalhado e rodelas de chistorra",
      caption: "Tixola com chistorra",
    },
    "queso-frito": {
      alt: "Dose de queijo frito: quatro barras de queijo panadas e douradas sobre folhas de alface, com uma taça de nozes descascadas e outra de molho vermelho ao lado",
      caption: "Queijo frito, com nozes e molho",
    },
    "mejillones-tigre": {
      alt: "Dose de mexilhões tigre: oito conchas recheadas e panadas, douradas, sobre uma cama de folhas de salada em prato verde",
      caption: "Mexilhões tigre",
    },
    "postre-chocolate": {
      alt: "Sobremesa de chocolate com açúcar em pó e calda, servida em prato verde com uma bola de gelado de baunilha e duas de chantilly, na mesa da Tixola Tapería",
      caption: "A sobremesa: chocolate, gelado e chantilly",
    },
    "tixola-raxo-mesa": {
      alt: "Tixola de raxo com batatas e ovo coalhado servida à mesa na Tixola Tapería, com a garrafeira e as caixas de madeira das adegas ao fundo",
      caption: "Tixola de raxo, com a garrafeira atrás",
    },
    "tixola-chistorra-mesa": {
      alt: "Tixola com chistorra, batatas e ovo coalhado servida à mesa com dois garfos, e os expositores de vinho da sala ao fundo",
      caption: "Tixola com chistorra, servida à mesa",
    },
    "tixola-gulas-langostinos": {
      alt: "Tixola com gulas, cogumelos e lagostins vista de cima: frigideira de cabo de madeira com batatas e ovo",
      caption: "Tixola com gulas, cogumelos e lagostins",
    },
    "patatas-alioli": {
      alt: "Batatas com alioli e salsa em taça de cerâmica verde, na Tixola Tapería de Ourense",
      caption: "Batatas com alioli",
    },
    "calamares-fritos": {
      alt: "Lulas fritas em argolas sobre batatas às rodelas, com um gomo de limão e algumas folhas de salada, servidas em taça de barro na mesa da Tixola Tapería",
      caption: "Lulas fritas",
    },
    "pulpo-tempura": {
      alt: "Polvo em tempura sobre cama de batatas, com limão e molho de colorau à parte, em travessa de cerâmica verde",
      caption: "Polvo em tempura",
    },
    "revuelto-bacalao-grelos": {
      alt: "Ovos mexidos com bacalhau, grelos e lagostins vistos de cima, em prato branco com um fio de redução",
      caption: "Ovos mexidos com bacalhau, grelos e lagostins",
    },
    "ensalada-pollo-crujiente": {
      alt: "Salada de frango crocante com nozes, maçã em palitos, tomate e rebentos verdes, em prato fundo de cerâmica",
      caption: "Salada de frango crocante, nozes e maçã",
    },
    "ensalada-aguacate-bacalao": {
      alt: "Salada de abacate e bacalhau fumado com alface de cordeiro, tomate, pimento vermelho e azeitonas pretas, em prato branco",
      caption: "Salada de abacate e bacalhau fumado",
    },
    "croquetas-tabla": {
      alt: "Croquetes caseiros acabados de fritar, vistos de cima sobre uma tábua de madeira comprida",
      caption: "Croquetes da casa",
    },
    "croquetas-racion": {
      alt: "Dose de croquetes caseiros alinhados em prato comprido branco sobre a mesa de madeira da tapería",
      caption: "Dose de croquetes",
    },
    "rotulo-noche": {
      alt: "Tabuleta da Tixola vinoteca-tapería iluminada à noite no centro histórico de Ourense",
      caption: "A tabuleta, à noite no centro histórico",
    },
    barra: {
      alt: "Balcão da Tixola Tapería com as garrafas nas prateleiras e as paredes grená da sala",
      caption: "O balcão",
    },
    "vinoteca-armarios": {
      alt: "Armários climatizados da garrafeira da Tixola, com caixas de madeira de adega por cima",
      caption: "A garrafeira",
    },
    "vinoteca-botellas": {
      alt: "Garrafas de vinho galego e de outras denominações arrumadas nas prateleiras da garrafeira da Tixola",
      caption: "Garrafas na prateleira",
    },
    "pizarra-vinos": {
      alt: "Ardósia da Tixola com os vinhos recomendados a copo escritos à mão, por denominação de origem",
      caption: "Os vinhos recomendados do dia",
    },
    "cubitera-regina": {
      alt: "Balde de gelo com garrafas a refrescar na garrafeira da Tixola Tapería",
      caption: "A refrescar para a ronda seguinte",
    },
  },
};
export default pt;
