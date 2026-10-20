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
      description: "Chistorra (enchido de porco com colorau) feita na própria frigideira, com ovos e batatas fritas. A mais simples e a que mais se repete.",
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
      description: "Tiras de frango panadas em milho e fritas, com molho de mel e mostarda. O prato a que os miúdos se agarram e de que os graúdos acabam por petiscar.",
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
      description: "Bacalhau com ajada galega: azeite, alho e colorau por cima. Receita de sempre, das que se limpam com pão.",
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
      description: "Cubos de queijo panados e fritos, mornos e derretidos por dentro. Servem-se com nozes e molho ao lado. Dura pouco na mesa.",
      unit: "dose",
    },
    "esp-oreja-plancha": {
      description: "Orelha de porco cozida e depois marcada na chapa até estalar por fora. Petisco de Ourense sem rodeios.",
      unit: "dose",
    },

    // ─── POLVO ─────────────────────────────────────────────────────
    "pul-gallega-plancha": {
      description: "Como preferir: à feira, com cachelos (batatas cozidas), colorau e azeite, ou marcado na chapa. O mesmo polvo, duas escolas.",
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
      description: "Queijo galego da zona, pouco curado e suave. O que melhor acompanha um copo sem o tapar.",
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
      badge: "O prato pelo qual nos conhecem",
      pairingWhy: "A sua salinidade e a sua acidez limpam a gordura do azeite e realçam a doçura do molusco.",
    },
    raxo: {
      kicker: "A especialidade da casa",
      headline: "A frigideira que chega a chiar à mesa",
      description:
        "Raxo (lombo de porco marinado à galega) sobre ovos e batatas fritas, com queijo Arzúa-Ulloa derretido por cima, servido na própria frigideira de ferro. Ouve-se antes de se ver.",
      ingredients: ["Raxo de porco", "Queijo Arzúa-Ulloa D.O.P.", "Ovos do campo", "Batatas", "Colorau", "Azeite virgem extra"],
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
    pulpo: {
      kicker: "Duas escolas, um polvo",
      headline: "À feira sobre cachelos ou marcado na chapa",
      description:
        "Polvo cozido no ponto e servido como se pedir: à feira, no prato de madeira de sempre, com cachelos, colorau e um fio de azeite; ou marcado na chapa. O mesmo polvo, duas maneiras de o entender.",
      ingredients: ["Polvo", "Cachelos", "Colorau", "Azeite virgem extra", "Sal grosso"],
      unit: "dose",
      pairingWhy: "O branco de taberna de sempre: fresco e sem madeira, aguenta o colorau sem lhe fazer frente.",
    },
    "tixola-gulas": {
      kicker: "Da frigideira para a mesa",
      headline: "A tixola mais completa da casa",
      description:
        "Gulas, cogumelos salteados e gambas sobre ovos e batatas, feitos na mesma frigideira de ferro em que chegam à mesa. A mais completa das tixolas.",
      ingredients: ["Gulas", "Cogumelos salteados", "Gambas", "Ovos", "Batatas", "Azeite virgem extra"],
      unit: "frigideira",
      pairingWhy: "Tem gordura de ovo e doçura de gamba: pede um branco com corpo e acidez, não um leve.",
    },
    cecina: {
      kicker: "Curado e frio",
      headline: "O gelado desfaz-se por cima da cecina",
      description:
        "Lâminas de cecina dispostas em coroa sobre alface e endívia, com gomos de tomate, maçã e nozes, e uma quenelle de gelado de queijo de ovelha no centro que se vai desfazendo por cima. A mais vistosa da ementa.",
      ingredients: ["Cecina", "Gelado de queijo de ovelha", "Alface e endívia", "Tomate", "Maçã", "Nozes"],
      unit: "dose",
      pairingWhy: "Um tinto leve dos que se servem ligeiramente frios: acompanha a cecina sem tapar o gelado de queijo.",
    },
  },

  allergens: {
    gluten: { label: "Glúten", description: "Cereais com glúten: trigo, centeio, cevada, aveia, espelta." },
    crustaceos: { label: "Crustáceos", description: "Gambas, camarões, navalheiras, santola e derivados." },
    huevos: { label: "Ovos", description: "Ovos e produtos à base de ovos." },
    pescado: { label: "Peixe", description: "Peixe e produtos à base de peixe." },
    cacahuetes: { label: "Amendoins", description: "Amendoins e produtos à base de amendoins." },
    soja: { label: "Soja", description: "Soja e produtos à base de soja." },
    lacteos: { label: "Lacticínios", description: "Leite e derivados, incluindo a lactose." },
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
    "Opções vegetarianas",
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
      alt: "Oito zamburiñas (vieiras pequenas) grelhadas na concha, com um molho de alho e salsa por cima, servidas em prato branco com um fio de redução ao lado",
      caption: "Zamburiñas grelhadas",
    },
    "tixola-raxo-croquetas": {
      alt: "Tixola de raxo com queijo de Arzúa em frigideira de ferro, croquetes caseiros e vinho branco galego na esplanada da Tixola Tapería, Ourense",
      caption: "Tixola de raxo com queijo de Arzúa e croquetes",
    },

    /* Fotos tiradas na casa a 2 de outubro de 2026 */
    "tixola-raxo": {
      alt: "Tixola de raxo com queijo de Arzúa vista de cima: frigideira com batatas, cubos de porco marinado e ovo coalhado, na mesa da Tixola Tapería",
      caption: "Tixola de raxo e Arzúa",
    },
    "tixola-chistorra": {
      alt: "Tixola com chistorra vista de cima: frigideira com batatas, ovo coalhado e rodelas de chistorra",
      caption: "Tixola com chistorra",
    },
    "ensalada-gulas-langostinos": {
      alt: "Salada de gulas, cogumelos e gambas: folhas de alface e rodelas de tomate com gulas, cogumelos salteados e gambas por cima, em taça de barro",
      caption: "Salada de gulas, cogumelos e gambas",
    },
    "ajada-bacalao": {
      alt: "Bacalhau com ajada: bacalhau desfiado com azeite, alho e colorau por cima, com uma batata cozida ao lado, em taça de cerâmica verde",
      caption: "Bacalhau com ajada",
    },
    "pulpo-feira": {
      alt: "Polvo à feira em prato de madeira: rodelas de polvo cozido sobre batatas, com colorau e azeite por cima",
      caption: "Polvo à feira",
    },
    "pimientos-padron": {
      alt: "Travessa de pimentos de Padrón fritos e polvilhados com sal grosso, em prato de cerâmica verde na mesa de madeira da Tixola Tapería",
      caption: "Pimentos de Padrón",
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
      alt: "Tixola com gulas, cogumelos e gambas vista de cima: frigideira de cabo de madeira com batatas e ovo",
      caption: "Tixola com gulas, cogumelos e gambas",
    },
    "patatas-alioli": {
      alt: "Batatas com alioli e salsa em taça de cerâmica verde, na Tixola Tapería de Ourense",
      caption: "Batatas com alioli",
    },
    "calamares-fritos": {
      alt: "Lulas fritas em anéis sobre batatas às rodelas, com um gomo de limão e algumas folhas de salada, servidas em taça de barro na mesa da Tixola Tapería",
      caption: "Lulas fritas",
    },
    "bacalao-tempura": {
      alt: "Bacalhau em tempura, dourado e estaladiço, sobre uma cama de batatas às rodelas, com uma molheira de molho vermelho ao lado, em travessa de cerâmica verde",
      caption: "Bacalhau em tempura",
    },
    "revuelto-bacalao-grelos": {
      alt: "Ovos mexidos com bacalhau, grelos e gambas vistos de cima, em prato branco com um fio de redução",
      caption: "Ovos mexidos com bacalhau, grelos e gambas",
    },
    "ensalada-pollo-crujiente": {
      alt: "Salada de frango crocante com nozes, maçã em palitos, tomate e rebentos verdes, em prato fundo de cerâmica",
      caption: "Salada de frango crocante, nozes e maçã",
    },
    "ensalada-aguacate-bacalao": {
      alt: "Salada de abacate e bacalhau fumado com alface-de-cordeiro, tomate, pimento vermelho e azeitonas pretas, em prato branco",
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
    "timbal-vegetal": {
      alt: "Timbal vegetal da Tixola Tapería: beringela, courgette e pimento assado montados em camadas sobre uma base de batata, coroado com cogumelos grelhados, com salada e pingos de molho vermelho à volta do prato",
      caption: "Timbal vegetal, com a garrafeira ao fundo",
    },
    "tortilla-sarten": {
      alt: "Tortilha de batata húmida servida na própria frigideira, sobre um prato de cerâmica na mesa de madeira da Tixola Tapería, com a parede de garrafas da vinoteca desfocada ao fundo",
      caption: "A tortilha, na sua frigideira",
    },
    "oreja-plancha": {
      alt: "Tiras de orelha marcada na chapa, douradas e estaladiças nos bordos, numa travessa oval de cerâmica verde, com uma bola de puré ao lado, na mesa de madeira da Tixola Tapería",
      caption: "Orelha na chapa",
    },
    "fingers-pollo": {
      alt: "Fingers de frango panados e fritos sobre folhas de alface, cada um coroado com um gomo de pêssego grelhado, e uma taça de molho branco com salsa, numa travessa oval de cerâmica verde sobre a mesa de madeira da Tixola Tapería",
      caption: "Fingers de frango",
    },
    "tosta-salmon-queso": {
      alt: "Tosta de salmão e queijo da Tixola Tapería: duas fatias de pão rústico torrado com queijo cremoso barrado e lâminas de salmão fumado por cima, regadas com um fio de molho escuro, com folhas de salada ao lado, numa travessa oval de cerâmica verde sobre a mesa de madeira",
      caption: "Tosta de salmão e queijo",
    },
    "ensalada-cecina": {
      alt: "Salada de cecina da Tixola Tapería: lâminas de cecina dispostas em coroa sobre folhas de alface e endívia, com gomos de tomate, lâminas de maçã e nozes, e uma quenelle de gelado de queijo de ovelha ao centro, numa taça funda de cerâmica sobre a mesa de madeira",
      caption: "Salada de cecina com gelado de queijo de ovelha",
    },
    "fachada-calle": {
      alt: "Fachada da Tixola Tapería na Rúa Juan de Austria, em Ourense, com as suas duas tabuletas grená com uma frigideira, os toldos e duas mesas altas com bancos na rua de pedra",
      caption: "A fachada, no centro histórico",
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
  /* ── Fichas de vinho: a prosa (nota de prova, história, terroir, vinificação, estágio) ── */
  wines: {
    "pazo-baion": {
      notes: "Amarelo palha com reflexos esverdeados e perfume varietal intenso: flores brancas e citrinos sobre um fundo de maçã e pera. Na boca fresco, equilibrado, mineral e de final muito aromático.",
      story: "Elabora-se apenas com uva vindimada na própria quinta, sob o conceito de vinho de pago.",
      terroir: "Quinta de 22 hectares de albariño, cheia de microclimas, no coração do Vale do Salnés",
      subzone: "Vale do Salnés",
    },
    "eduardo-pena": {
      notes: "Amarelo pálido com reflexos dourados. Nariz complexo de limão, flor de laranjeira, ananás e pêssego com fundo balsâmico; na boca gordo, untuoso, saboroso e muito longo.",
      story: "A adega está meio enterrada na encosta da vinha, o que mantém o interior a 14-15 ºC sem meios mecânicos.",
      terroir: "Mais de 10 hectares em Castrelo de Miño, a 250 metros, em declive suave para a albufeira, sobre solo arenoso de ardósia e pedra",
      winemaking: "Maceração das castas, trabalho sobre borras e fermentação em barrica de 300 litros de carvalho europeu, sem fermentação maloláctica",
    },
    "lagar-do-merens": {
      notes: "Amarelo pálido com reflexos verdes. Nariz complexo e terpénico, com pera, maçã e pêssego sobre notas florais e balsâmicas; na boca amplo, envolvente e muito longo.",
      story: "Adega de colleiteiro de 2001 em A Arnoia: um lagar antigo de pedra e madeira restaurado, com 3,5 hectares de castas autóctones do Ribeiro.",
      terroir: "Solos graníticos franco-arenosos em encostas vencidas a socalcos, em A Arnoia",
      winemaking: "Maceração em prensa pneumática com neve carbónica e fermentação a 17,5 ºC durante 21 dias em aço inoxidável",
      ageing: "8 meses sobre borras finas",
    },
    "cunas-davia": {
      notes: "Nariz limpo e com alguma complexidade: maçã, marmelo e melão com notas florais e de erva fresca. Na boca saboroso e amplo, com citrinos e a acidez certa, de final longo e untuoso.",
      ageing: "6 meses sobre borras",
    },
    "algueira": {
      story: "Adega familiar de Doade (Sober), nos socalcos do Sil, com 14 hectares de castas autóctones vinificadas parcela a parcela.",
      subzone: "Amandi",
    },
    "vel-uveyra": {
      story: "«Ronsel» é o rasto que o barco deixa ao navegar: é esse o nome da adega de Parada de Sil que assina este vinho.",
      terroir: "Vinha nos canhões do Sil, em Parada de Sil, sobre granito e xisto",
      subzone: "Ribeiras do Sil",
    },
    "la-lama": {
      story: "Adega de Langullo (Manzaneda), com 32 hectares em Quiroga-Bibei; definem os seus vinhos como atlânticos, de terroir e de guarda.",
      terroir: "Socalcos de forte inclinação sobre ardósia e argila",
      winemaking: "Vindima manual e fermentação com leveduras autóctones em grandes tinas de madeira abertas",
      ageing: "20 meses em barrica neutra",
      subzone: "Quiroga-Bibei",
    },
    "a-moucha": {
      terroir: "Socalcos de montanha do vale do Bibei, com cepas de entre 15 e 100 anos sobre ardósia, xisto e granito",
      ageing: "4 meses de fermentação em barrica de carvalho francês e um mínimo de 24 meses em tonel de 5.000 litros",
      subzone: "Quiroga-Bibei",
    },
    "la-lume": {
      winemaking: "Fermentação com leveduras autóctones em barrica de 600 litros, foudre e ovo de betão, sem fermentação maloláctica",
      ageing: "Estágio sobre borras finas no próprio recipiente de fermentação: foudre, barrica e betão",
    },
    "guitian": {
      notes: "Amarelo dourado com tons esverdeados, com pêssego e toranja, um matiz de funcho e um final de flores brancas. Na boca potente e fresco, muito longo.",
      story: "O godello da quinta A Tapada foi plantado em 1985 a partir de um clone antigo, pré-filoxérico, no extremo oriental de Valdeorras, ao pé das Peñas Marías.",
      terroir: "Vinha da quinta A Tapada a cerca de 500 metros, em encosta a sul sobre xistos ordovícicos de textura argilo-limosa",
      winemaking: "Vindima em caixa, maceração pré-fermentativa a frio, prensagem pneumática a baixa pressão, desborra estática a frio e fermentação em aço inoxidável a 16-18 ºC",
      ageing: "Em rama sobre as suas borras finas até ao engarrafamento, e pelo menos 2 meses em garrafa na adega",
    },
    "guitian-sobre-lias": {
      notes: "Amarelo dourado com tons esverdeados, com pêssego seco e casca de laranja, funcho e flores brancas no final. Na boca muito potente e fresco, de grande persistência.",
      story: "Foi o primeiro vinho espanhol estagiado sobre borras em depósito com remeximento semanal durante quatro a seis meses: esta adega abriu caminho ao trabalho das borras em Espanha.",
      terroir: "Vinha da quinta A Tapada a cerca de 500 metros, em encosta a sul sobre xistos ordovícicos de textura argilo-limosa",
      winemaking: "Vindima em caixa, maceração pré-fermentativa a frio, prensagem pneumática a baixa pressão, desborra estática a frio e fermentação em aço inoxidável a 16-18 ºC",
      ageing: "De 4 a 6 meses sobre borras em depósito, com remeximento semanal, e pelo menos 2 meses em garrafa",
    },
    "pajaro-loco": {
      notes: "Amarelo palha com notas esverdeadas, de intensidade média-alta, herbáceo e com fruta de polpa branca. Na boca envolvente e fresco, de pós-gosto longo e retronasal cítrica.",
      winemaking: "Maceração a frio, prensagem suave por sangria e duas semanas de fermentação a baixa temperatura em aço inoxidável com leveduras naturais; engarrafa-se sem filtrar",
    },
    "crego-e-monaguillo-blanco": {
      notes: "Amarelo palha com toques dourados, cítrico, frutado e floral, com uma lembrança de flor de funcho. Na boca fresco, elegante e ligeiramente gordo, de acidez bem integrada.",
      story: "Adega familiar de A Salgueira (Monterrei) com mais de cinquenta anos de história, que trabalha à mão cem hectares de godello e mencía.",
      terroir: "Solos graníticos de cascalho ligeiro no vale do Támega",
      winemaking: "Maceração a frio da treixadura, prensagem pneumática e desborra por decantação a frio; fermentação em aço inoxidável a 17 ºC",
    },
    "crego-e-monaguillo-tinto": {
      notes: "Granada de capa média com aro violáceo, muito frutado: amora, morango, mirtilo e cassis com um fundo de cacau. Na boca sedoso e aveludado, de taninos doces e retronasal de fruta vermelha e especiarias.",
      story: "Adega familiar de A Salgueira (Monterrei) com mais de cinquenta anos de história, que trabalha à mão cem hectares de godello e mencía.",
      terroir: "Solos graníticos de cascalho ligeiro no vale do Támega",
      winemaking: "Desengace e esmagamento muito suave, quase uva inteira; fermentação e maceração em aço a 22 ºC, ligeira microoxigenação antes da maloláctica e repouso em aço até ao engarrafamento",
    },
    "vx-cuvee-caco": {
      notes: "A adega define-o como potência, maturidade e elegância, e primorosamente fresco. Envelhece devagar em garrafa.",
      story: "Caco é o diminutivo de Ricardo, o fundador de Coto de Gomariz, que recuperou parcelas e plantou boa parte das vinhas novas. Só se faz em colheitas excecionais, cerca de 2.500 garrafas.",
      terroir: "As quintas A Ferreira e A Canceliña, a antiga vinha experimental de tintos da adega",
      ageing: "20 meses em barrica nova de carvalho francês e americano",
    },
    "carmelo-rodero-9-meses": {
      notes: "Aroma potente, com cereja e mirtilo bem marcados. Na boca fresco e equilibrado, de textura ampla e um final que convida a continuar.",
      terroir: "Vinha de 30 a 35 anos entre 837 e 862 metros, em solos limosos e pedregosos",
      winemaking: "Vindima manual com seleção no campo e vinificação por gravidade",
      ageing: "9 meses em barrica nova de carvalho francês de 225 litros",
    },
    "arzuaga-crianza": {
      notes: "Vermelho picota com matizes violáceos. Nariz potente de fruta vermelha madura, especiarias e notas balsâmicas com final torrefacto; na boca muito volume, suave e meloso, de final muito longo.",
      story: "É a bandeira da casa, sobretudo tempranillo de vinha própria da quinta La Planta e das suas parcelas mais altas de Olivares de Duero.",
      terroir: "Vinha acima dos 900 metros em solo argilo-calcário, com a rocha-mãe calcária a um metro da superfície",
      winemaking: "Vindima em caixas de 15 kg, mesa de seleção ótica bago a bago, encubagem por gravidade e maceração pré-fermentativa de vários dias",
      ageing: "16 meses em barrica, 70 % de carvalho francês e 30 % americano, onde também fez a maloláctica",
      subzone: "Quinta La Planta e páramo de Olivares de Duero",
    },
    "tomas-postigo-3-ano": {
      notes: "Vermelho picota com reflexos púrpura, limpo e intenso, com frutinhos vermelhos e negros maduros sobre madeira fina, especiarias e alcaçuz. Na boca sedoso, de muito boa acidez e boa estrutura.",
      terroir: "Vinhas selecionadas entre 750 e 1.010 metros de altitude",
      winemaking: "Vindima manual em caixas de dez quilos com mesa de seleção, a uva move-se por gravidade sem bombas e clarifica-se com clara de ovo",
      ageing: "12 meses em barrica de carvalho francês de 225 litros de diferentes florestas",
    },
    "quinta-sardonia": {
      story: "A adega do grupo Terras Gauda em Sardón de Duero, que elabora segundo métodos biodinâmicos à procura do equilíbrio entre solo, clima, cepa e meio envolvente.",
    },
    "malabrigo": {
      notes: "Vermelho cereja com aro granada, limpo e profundo, de nariz muito intenso e elegante com fruta preta e especiarias bem integradas com a madeira. Boca intensa e volumosa, de retrogosto longo.",
      story: "Malabrigo é o nome da parcela: ali não há abrigo que proteja do clima castelhano, e essas condições extremas dão-lhe raça e finura.",
      terroir: "A parcela Malabrigo, entre 850 e 900 metros, de solo arenoso-argiloso e com grande diferença de temperatura entre o dia e a noite",
      winemaking: "Fermentação alcoólica em aço inoxidável a temperatura controlada e maloláctica de 30 dias em barrica de carvalho francês",
      ageing: "Estágio em barrica de carvalho francês",
    },
    "dehesa-de-los-canonigos": {
      story: "Uma das grandes quintas históricas da Ribera del Duero: deve o nome ao cabido da catedral de Valladolid, vinte e dois monges cónegos. Hoje são cinco gerações da mesma família a dirigi-la.",
      terroir: "Quinta histórica nas margens do Duero, com vinificações separadas por parcela, tipo de solo e casta",
    },
    "baigorri": {
      notes: "Vermelho cereja profundo, com fruta preta acabada de colher e especiarias. Na boca elegante, sedoso e frutado, com boa frescura e final longo.",
      story: "A Baigorri reivindica o Crianza de Rioja face à produção industrial: viticultura sustentável, trabalho manual e engarrafamento sem clarificar nem filtrar.",
      terroir: "Parcelas em Samaniego, Laguardia e Leza, em solo argilo-calcário a 600 metros e maioritariamente em taça",
      winemaking: "Vindima manual com seleção de bago, macerações longas com leveduras indígenas, extração por gravidade e engarrafamento sem filtrar",
      ageing: "14 meses em barrica de carvalho francês e americano",
    },
    "luis-canas": {
      notes: "Vermelho cereja, com fruta vermelha em infusão — morango, framboesa, groselha —, especiarias subtis e um fundo lácteo. Entrada doce e envolvente, muito frescor e final redondo.",
      story: "Um vinho marcado pelo terroir de Villabuena de Álava; a adega certifica a origem das uvas com o selo Vino de Zona da DOCa Rioja.",
      terroir: "Villabuena de Álava e arredores, entre 450 e 650 metros, em solos argilo-calcários e arenosos com vinhas de 35 anos de média",
      winemaking: "Vindima manual com dupla mesa de seleção, de cacho e de bago, e elaboração em aço inoxidável",
      ageing: "12 meses em barrica usada de carvalho francês (60 %) e americano (40 %)",
    },
    "marques-de-murrieta": {
      notes: "Fruta vermelha madura e alcaçuz harmonizados com notas de licor de chocolate. Na boca equilibrado, carnudo e redondo, de acidez suave e final longo.",
      story: "Resume a personalidade da Finca Ygay e tudo o que nela acontece ao longo de um ciclo completo da vinha.",
      terroir: "Finca Ygay: 300 hectares próprios em volta da adega, solo argilo-calcário entre 320 e 485 metros",
      winemaking: "Fermentação separada por castas em aço inoxidável, encubamento de 8 a 10 dias e prensagem lenta em prensa vertical",
      ageing: "25 meses em barrica de carvalho americano de 225 litros",
    },
    "malpuesto": {
      notes: "Cereja brilhante e intenso, com fruta madura, preta e silvestre. Estruturado e amplo, com um toque cremoso e terroso, muito carnudo e de final persistente.",
      story: "A Orben é o projeto de microparcelas de vinha velha nas zonas altas da Rioja Alavesa, nos arredores de Laguardia.",
      terroir: "Uma única vinha velha de 1,68 hectares plantada em taça por volta de 1931, em encosta a 520 metros, sobre solo arenoso muito pobre e superficial",
      winemaking: "Vindima manual em caixa de 15 kg, desengace sem esmagar, fermentação em aço aberto e maloláctica em barrica grande e ânfora de argila",
      ageing: "12 meses em barrica de 500 litros de carvalho francês de grão fino",
    },
    "macan-clasico": {
      notes: "O mais acessível e expressivo dos dois: trago macio, carácter marcado da terra de onde vem e uma simplicidade que o torna muito atraente.",
      story: "Macán e Macán Clásico são a visão conjunta de Rothschild e Vega Sicilia sobre a Rioja, e convivem como primeiro e segundo vinho à maneira bordalesa.",
      terroir: "100 hectares de vinha com 30 anos de média na Sonsierra, a 483 metros, com um rendimento de 4.300 kg por hectare",
      winemaking: "Maloláctica entre barrica e depósito, e estágio em madeira francesa de grão fino, a maior parte em barrica nova",
      ageing: "12 meses em barrica e 18 meses em garrafa",
    },
    "macan-etiqueta-dorada": {
      notes: "Mais escondido do que o seu irmão mais novo: será o tempo a moldar a sua elegância, envolvida por taninos aveludados e uma grande mineralidade.",
      story: "Nasceu em 2009 do encontro das famílias Rothschild e Álvarez na Rioja sonserrana, e é o primeiro vinho do projeto.",
      terroir: "100 hectares de vinha com 40 anos de média na Sonsierra, a 500 metros, com um rendimento de 4.000 kg por hectare",
      winemaking: "Maloláctica entre barrica e depósito, e estágio em madeira francesa de grão fino, a maior parte em barrica nova",
      ageing: "16 meses em barrica e foudre e 28 meses em garrafa",
    },
    "banzao": {
      story: "Um «banzao» é o açude de madeira e pedra que subia o nível da água para os canais de rega e que se refazia todos os anos. O projeto arrancou em 2017, arrendando três hectares de vinha velha abandonada para evitar que desaparecesse.",
      terroir: "18 parcelas em 8 lugares de San Pedro de Olleros, a 750 metros no vale do Ancares, em taça e em quincôncio, com a mistura original de castas",
    },
    "enate": {
      notes: "Vermelho cereja picota muito carregado, de aroma intenso e complexo, fumado e especiado sobre fruta vermelha madura. Na boca, denso, carnudo e de final extraordinariamente longo.",
      story: "O rótulo é uma pintura original que o artista Víctor Mira criou para a adega.",
      winemaking: "As duas castas fermentam separadamente a 26 ºC em aço inoxidável e depois fazem a maloláctica",
      ageing: "9 meses em barrica de carvalho francês e americano, e afinamento final em aço inoxidável",
    },
    "quinta-do-escudial": {
      notes: "Rubi com tons violáceos, com mirtilo maduro, cereja e ameixa preta sobre um toque de cassis e pimenta. Na boca, persistente e elegante, de taninos finos e sedosos.",
      story: "A adega apresenta-se como especialista em vinhos «sem madeira»: este reserva não vê barrica e afina em aço.",
      winemaking: "Vindima manual com seleção rigorosa e fermentação separada por castas, com uma elaboração minimalista",
      ageing: "Cerca de 48 meses em cuba de aço inoxidável, sem passar por barrica",
    },
    "quinta-das-bagueiras": {
      notes: "Baga e Touriga Nacional conjugam-se com harmonia: frutos silvestres, especiarias e erva fresca. Suculento, expressivo, longo e cheio de vida.",
      story: "Elabora vinhos clássicos com práticas muito tradicionais, herdadas de geração em geração, e com uma enologia minimalista.",
      winemaking: "Fermenta de 5 a 8 dias em lagar sem desengaçar, pisado à mão com macaco de madeira várias vezes ao dia",
      ageing: "Cerca de 18 meses nos mesmos tonéis de madeira velha onde termina a fermentação; engarrafa-se sem clarificar nem filtrar",
    },
    "piaugier-sablet": {
      notes: "Frutos vermelhos frescos no nariz, com cereja e framboesa. Na boca, suave e harmonioso, de taninos finos já fundidos e final elegante e persistente.",
      story: "Quinta familiar ao pé das Dentelles de Montmirail: Jean-Marc e Sophie assumiram as rédeas em 1985 e hoje a filha Maude acompanha-os.",
      terroir: "Parcelas de terroir arenoso em Sablet, sobre coluviões areno-limosos que drenam muito bem, com vinhas de 35 a 45 anos",
      winemaking: "Vindima manual e vinificação separada em cubas de cimento erguidas em 1947 pelo bisavô da casa, com maceração de duas a três semanas",
      ageing: "Cerca de 18 meses em cuba de cimento, depois do loteamento",
    },
    "terrazas-de-los-andes": {
      story: "Vinhos de montanha dos terroirs de altitude de Mendoza, ao pé dos Andes.",
    },
    "abbotsdale": {
      notes: "Rubi, com violetas e fruta vermelha e preta: cereja, ameixa, groselha preta e amora. Boca média, de taninos suaves e final longo.",
      story: "As vinhas são selecionadas por Bryan MacRobert, criado numa quinta perto da aldeia de Abbotsdale, no Swartland.",
      terroir: "Vinhas em taça, de sequeiro e baixo rendimento, sobre solo arenoso de granito decomposto; vindima-se à mão de madrugada",
      winemaking: "Seleção da uva antes da cuba, com parte de cacho inteiro para manter o frescor e uma extração suave",
      ageing: "Em tonéis grandes de madeira velha, para arredondar e estabilizar o vinho",
    },
  },
};
export default pt;
