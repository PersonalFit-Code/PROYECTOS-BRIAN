import type { DataTranslations } from "@/i18n/data";

/**
 * Overrides en galego dos DATOS (carta, pratos estrela, alérxenos, etiquetas, servizos).
 * Os nomes dos pratos non se tocan (son nomes propios e o que se le na carta física);
 * tradúcense descricións, unidades, variantes e maridaxes. Claves ausentes → español.
 */
const gl: DataTranslations = {
  categories: {
    tostas: {
      label: "Tostas",
      kicker: "Para comezar",
      description: "Pan torrado e enriba, pouco e bo. O primeiro bocado mentres se decide o resto.",
    },
    tixolas: {
      label: "Tixolas",
      kicker: "A especialidade da casa",
      description: "A tixola de ferro fundido de toda a vida, a que lle dá nome á casa: chega á mesa chiando, e todas van con ovos e patacas fritas.",
    },
    ensaladas: {
      label: "Ensaladas",
      kicker: "Fresco, e de prato único",
      description: "Grandes, para comer delas e non para acompañar. Da horta e da lonxa a partes iguais.",
    },
    cocina: {
      label: "A nosa cociña",
      kicker: "O de sempre, ben feito",
      description: "Croquetas, frituras e racións para compartir. O que sae da cociña a todas as horas.",
    },
    especiales: {
      label: "Especiais",
      kicker: "O que hai que probar",
      description: "As zamburiñas polas que nos coñecen e os clásicos que non faltan en ningunha mesa.",
    },
    pulpo: {
      label: "Polbo",
      kicker: "Da ría",
      description: "Cocido en pota de cobre ou marcado á prancha. En Ourense o polbo ten sección propia.",
    },
    embutidos: {
      label: "Embutidos e queixos",
      kicker: "Táboa e coitelo",
      description: "Para abrir boca ou para alongar a parola co que quede na copa.",
    },
    revueltos: {
      label: "Revoltos",
      kicker: "Ovo e tixola",
      description: "Callados no punto, nin secos nin líquidos. O prato de culler para quen non a usa.",
    },
    varios: {
      label: "Varios",
      kicker: "Postre e mesa",
      description: "O remate doce e o que acompaña todo o demais.",
    },
  },

  menuItems: {
    // ─── TOSTAS ────────────────────────────────────────────────────
    "tos-salmon-queso": {
      description: "Salmón afumado e queixo cremoso sobre pan torrado. Fría, suave e directa: a que se pide sen pensar mentres chega o resto.",
      unit: "unidade",
    },
    "tos-trigueros-jamon-codorniz": {
      description: "Espárragos trigueiros á prancha, xamón e un ovo de codorniz enriba. Cómese en dous bocados e a xema fai o resto.",
      unit: "unidade",
    },
    "tos-cebolla-foie-cabra": {
      description: "Cebola cociñada amodo ata que se volve doce, foie e un medallón de rulo de cabra. A máis larpeira das tres.",
      unit: "unidade",
    },

    // ─── TIXOLAS ───────────────────────────────────────────────────
    "tix-piquillos-panceta": {
      description: "Pementos do piquillo caramelizados e panceta crocante sobre a tixola de ferro, cos seus ovos e as súas patacas. Doce e salgado no mesmo bocado.",
      unit: "tixola",
    },
    "tix-chistorra": {
      description: "Chistorra feita na propia tixola, con ovos e patacas fritas. A máis sinxela e a que máis se repite.",
      unit: "tixola",
    },
    "tix-gulas-setas-langostinos": {
      description: "Gulas, cogomelos salteados e lagostinos sobre o ferro quente, con ovos e patacas. A máis completa da sección.",
      unit: "tixola",
    },
    "tix-raxo-arzua": {
      description: "Raxo de porco adobado ao estilo galego con queixo Arzúa-Ulloa fundido por riba, sobre ovos e patacas. É a que sae en todas as fotos do local.",
      unit: "tixola",
    },
    "tix-pisto-verduras": {
      description: "Pisto de verduras cociñado amodo, con ovos e patacas fritas. A opción sen carne da sección, e non é un premio de consolación.",
      unit: "tixola",
    },

    // ─── ENSALADAS ─────────────────────────────────────────────────
    "ens-gulas-setas-langostinos": {
      description: "Base de gromos con gulas, cogomelos salteados e lagostinos. Morna por riba e fresca por abaixo: cómese como prato único.",
      unit: "ración",
    },
    "ens-pollo-crujiente": {
      description: "Tiras de polo rebozado recén frito, noces e mazá. A que piden os que non veñen comer ensalada.",
      unit: "ración",
    },
    "ens-ventresca": {
      description: "Ventresca de atún sobre verduras frescas. Pouco máis: cando a ventresca é boa, o resto sobra.",
      unit: "ración",
    },
    "ens-cecina-helado-oveja": {
      description: "Láminas de cecina e unha quenelle de xeado de queixo de ovella que se vai desfacendo enriba. A máis vistosa da carta.",
      unit: "ración",
    },
    "ens-aguacate-bacalao": {
      description: "Abacate e bacallau afumado, suave e manteigoso. A máis lixeira das cinco.",
      unit: "ración",
    },

    // ─── A NOSA COCIÑA ─────────────────────────────────────────────
    "coc-patatas": {
      description: "Patacas fritas con salsa brava, con alioli ou coas dúas. Ti elixes; as mixtas son o que pide case todo o mundo.",
      unit: "ración",
    },
    "coc-croquetas-jamon": {
      description: "Bechamel que repousa ata callar, xamón ben picado e fritura de última hora. Crocantes por fóra, case líquidas por dentro.",
      unit: "ración",
      variants: ["Media ración", "Ración"],
    },
    "coc-croquetas-grelos-chipiron": {
      description: "Grelos e chipirón dentro da bechamel: verde e mar na mesma croqueta. As máis galegas e as que máis se repiten nas recensións.",
      unit: "ración",
      variants: ["Media ración", "Ración"],
    },
    "coc-croquetas-cecina-cabra": {
      description: "Cecina e queixo de cabra fundidos na bechamel. As máis intensas das tres; cunha ración hai de sobra para dous.",
      unit: "ración",
      variants: ["Media ración", "Ración"],
    },
    "coc-mejillones-tigre": {
      description: "Mexillón picado e ligado con bechamel, devolto á súa cuncha e rebozado. O bocado de bar de toda a vida, feito como hai que facelo.",
      unit: "ración",
    },
    "coc-calamares": {
      description: "Aneis de lura enfariñados e fritos no momento. Con limón ao lado e sen máis cerimonia.",
      unit: "ración",
    },
    "coc-bacalao-tempura": {
      description: "Tacos de bacallau en tempura fina, con pementos ao lado. Cruxe ao morder e por dentro segue zumento.",
      unit: "ración",
    },
    "coc-salteado-verdura-arroz": {
      description: "Verduras e cogomelos salteados a lume forte con arroz. Un prato completo para quen non quere fritura.",
      unit: "ración",
    },
    "coc-croquetas-sin-gluten": {
      description: "A mesma croqueta, elaborada sen glute. Está na carta porque nolo piden a diario; avisa ao pedir para que na cociña o teñan presente.",
      unit: "ración",
    },
    "coc-tortilla-champinones": {
      description: "Tortilla zumenta rematada nun guiso curto con champiñóns. Cómese con pan e non sobra nada.",
      unit: "ración",
    },
    "coc-fingers-pollo": {
      description: "Tiras de polo rebozadas en millo e fritas, con salsa de mel e mostaza. O prato ao que se agarran os nenos e do que acaban picando os maiores.",
      unit: "ración",
    },
    "coc-pastel-cabracho": {
      description: "O clásico do norte: cabracho, ovo e nata ao forno, servido frío con pan torrado. Suave e con moito sabor a mar.",
      unit: "ración",
    },

    // ─── ESPECIAIS ─────────────────────────────────────────────────
    "esp-timbal-vegetal": {
      description: "Verduras montadas en capas, feitas no momento. A entrada máis lixeira da carta.",
      unit: "ración",
    },
    "esp-brocheta-xxl": {
      description: "Brocheta grande de porco adobado, feita á prancha. Para compartir ou para quen vén con fame de verdade.",
      unit: "unidade",
    },
    "esp-ajada-bacalao": {
      description: "Bacallau con allada galega: aceite, allo e pemento por riba. Receita de sempre e das que deixan o prato limpo.",
      unit: "ración",
      variants: ["Media ración", "Ración"],
    },
    "esp-zamburinas-plancha": {
      description: "Zamburiñas da ría marcadas á prancha, na súa cuncha. Pouco lume e nada que as tape: o prato polo que nos coñecen.",
      unit: "ración",
    },
    "esp-zamburinas-rellenas": {
      description: "As mesmas zamburiñas, recheas dun sofrito e gratinadas ao forno. A versión larpeira da anterior.",
      unit: "ración",
    },
    "esp-queso-frito": {
      description: "Tacos de queixo rebozados e fritos, mornos e fundentes por dentro. Sérvense con noces e salsa ao lado. Dura pouco na mesa.",
      unit: "ración",
    },
    "esp-oreja-plancha": {
      description: "Orella cocida e despois marcada na prancha ata que cruxe por fóra. Tapeo ourensán sen rodeos.",
      unit: "ración",
    },

    // ─── POLBO ─────────────────────────────────────────────────────
    "pul-gallega-plancha": {
      description: "Como o prefiras: á feira, con cachelos, pemento e aceite, ou marcado á prancha. O mesmo polbo, dúas escolas.",
      unit: "ración",
    },
    "pul-plancha-grelos": {
      description: "Polbo marcado á prancha sobre unha cama de grelos salteados. O amargo do grelo co doce do polbo.",
      unit: "ración",
    },
    "pul-salteado-salmon-langostinos": {
      description: "Polbo, salmón e lagostinos salteados xuntos na tixola. O prato máis caro da carta e o que máis mar ten.",
      unit: "ración",
    },
    "pul-tempura": {
      description: "Anacos de polbo en tempura lixeira, fritos no momento. Cruxe por fóra e segue tenro por dentro.",
      unit: "ración",
    },

    // ─── EMBUTIDOS E QUEIXOS ───────────────────────────────────────
    "emb-jamon-serrano": {
      description: "Cortado a coitelo e servido a temperatura, para que solte a graxa. Con pan ao lado e pouco máis.",
      unit: "ración",
    },
    "emb-queso-pais": {
      description: "Queixo galego da zona, tenro e suave. O que mellor acompaña unha copa sen tapala.",
      unit: "ración",
    },
    "emb-queso-oveja": {
      description: "Curado de ovella, con máis carácter que o do país. Para quen quere que o queixo se note.",
      unit: "ración",
    },
    "emb-queso-cabra": {
      description: "Rulo de cabra en rodelas, acedo e cremoso. O contrapunto da táboa.",
      unit: "ración",
    },

    // ─── REVOLTOS ──────────────────────────────────────────────────
    "rev-algas-langostinos": {
      description: "Ovo callado no punto con algas e lagostinos. Sabe a mar sen ser peixe.",
      unit: "ración",
    },
    "rev-bacalao-grelos-langostinos": {
      description: "Bacallau esmigallado, grelos e lagostinos ligados con ovo. O máis completo dos tres.",
      unit: "ración",
    },
    "rev-setas-oreja": {
      description: "Cogomelos e orella crocante sobre ovo callado. Terra pura, e o que máis enche.",
      unit: "ración",
    },

    // ─── VARIOS ────────────────────────────────────────────────────
    "var-postre": {
      description: "Cambia segundo o día e o que se faga esa mañá. Pregunta ao persoal: sempre hai caseiro.",
      unit: "ración",
    },
    "var-postre-sin-gluten": {
      description: "A alternativa doce elaborada sen glute, para que ninguén quede sen remate. Pregunta cal hai hoxe.",
      unit: "ración",
    },
    "var-pan": {
      description: "Pan do día na súa cesta, para mollar no que quede na tixola.",
      unit: "cesta",
    },
    "var-pan-tomate": {
      description: "Pan torrado e fregado con tomate e aceite. Entra só mentres chega o resto.",
      unit: "ración",
    },
  },

  starDishes: {
    zamburinas: {
      kicker: "Prato estrela",
      headline: "As zamburiñas que fixeron famoso o local",
      description:
        "Zamburiñas galegas abertas na súa cuncha e marcadas á prancha con aceite de oliva virxe extra, allo laminado e perexil fresco. Zumentas, con ese punto de brasa que só dá o ferro.",
      ingredients: ["Zamburiñas da ría", "AOVE", "Allo laminado", "Perexil fresco", "Sal", "Limón"],
      unit: "ración",
      badge: "O prato polo que nos coñecen",
      pairingWhy: "A súa salinidade e a súa acidez limpan a graxa do aceite e realzan a dozura do molusco.",
    },
    raxo: {
      kicker: "A especialidade da casa",
      headline: "A tixola que chega chiando á mesa",
      description:
        "Raxo de porco adobado ao estilo galego sobre ovos e patacas fritas, con queixo Arzúa-Ulloa fundido por riba, servido na propia tixola de ferro. Óese antes de verse.",
      ingredients: ["Raxo de porco", "Queixo Arzúa-Ulloa D.O.P.", "Ovos de campo", "Patacas", "Pemento", "AOVE"],
      unit: "tixola",
      badge: "A máis pedida",
      pairingWhy: "Un tinto lixeiro e fresco que aguanta o queixo fundido sen tapar o adobo da carne.",
    },
    croquetas: {
      kicker: "Bechamel que repousa",
      headline: "Verde e mar na mesma croqueta",
      description:
        "Grelos salteados e chipirón dentro dunha bechamel que repousa ata callar, empanadas e fritas no momento. Cruxen ao morder e por dentro seguen case líquidas.",
      ingredients: ["Grelos", "Chipirón", "Bechamel de 24 h", "Pan relado", "Ovo", "AOVE"],
      unit: "ración",
      badge: "As máis pedidas",
      pairingWhy: "Ten corpo para a bechamel e o amargor xusto para acompañar o grelo.",
    },
    pulpo: {
      kicker: "Dúas escolas, un polbo",
      headline: "Á feira sobre cachelos ou marcado á prancha",
      description:
        "Polbo cocido no punto e servido como se pida: á feira, no prato de madeira de sempre, con cachelos, pemento e un fío de aceite; ou marcado á prancha. O mesmo polbo, dúas maneiras de entendelo.",
      ingredients: ["Polbo", "Cachelos", "Pemento", "AOVE", "Sal groso"],
      unit: "ración",
      pairingWhy: "O branco de taberna de toda a vida: fresco e sen madeira, aguanta o pemento sen pelexarse con el.",
    },
    "tixola-gulas": {
      kicker: "Da tixola á mesa",
      headline: "A tixola máis completa da casa",
      description:
        "Gulas, cogomelos salteados e lagostinos sobre ovos e patacas, feitos na mesma tixola de ferro na que chegan á mesa. A máis completa das tixolas.",
      ingredients: ["Gulas", "Cogomelos salteados", "Lagostinos", "Ovos", "Patacas", "AOVE"],
      unit: "tixola",
      pairingWhy: "Ten graxa de ovo e dozura de lagostino: pide un branco con corpo e acidez, non un lixeiro.",
    },
    cecina: {
      kicker: "Curado e frío",
      headline: "O xeado desfaise enriba da cecina",
      description:
        "Láminas de cecina repartidas en coroa sobre leituga e endivia, con gallos de tomate, mazá e noces, e unha quenelle de xeado de queixo de ovella no centro que se vai desfacendo por riba. A máis vistosa da carta.",
      ingredients: ["Cecina", "Xeado de queixo de ovella", "Leituga e endivia", "Tomate", "Mazá", "Noces"],
      unit: "ración",
      pairingWhy: "Un tinto lixeiro dos que se serven algo fríos: acompaña a cecina sen tapar o xeado de queixo.",
    },
  },

  allergens: {
    gluten: { label: "Glute", description: "Cereais con glute: trigo, centeo, cebada, avea, espelta." },
    crustaceos: { label: "Crustáceos", description: "Gambas, lagostinos, nécoras, centola e derivados." },
    huevos: { label: "Ovos", description: "Ovo e produtos a base de ovo." },
    pescado: { label: "Peixe", description: "Peixe e produtos a base de peixe." },
    cacahuetes: { label: "Cacahuetes", description: "Cacahuetes e produtos a base de cacahuete." },
    soja: { label: "Soia", description: "Soia e produtos a base de soia." },
    lacteos: { label: "Lácteos", description: "Leite e derivados, incluída a lactosa." },
    "frutos-cascara": { label: "Froitos de casca", description: "Améndoas, abelás, noces, anacardos, pistachos…" },
    apio: { label: "Apio", description: "Apio e produtos derivados." },
    mostaza: { label: "Mostaza", description: "Mostaza e produtos derivados." },
    sesamo: { label: "Sésamo", description: "Grans de sésamo e produtos a base de sésamo." },
    sulfitos: { label: "Sulfitos", description: "Dióxido de xofre e sulfitos (> 10 mg/kg). Presentes en viños e encurtidos." },
    altramuces: { label: "Tremoceiros", description: "Tremoceiros e produtos a base de tremoceiro." },
    moluscos: { label: "Moluscos", description: "Polbo, lura, zamburiñas, mexillóns, ameixas…" },
  },

  dietTags: {
    vegano: "Vegano",
    vegetariano: "Vexetariano",
    "sin-gluten": "Sen glute",
    picante: "Picante",
    estrella: "Prato estrela",
    nuevo: "Novo",
  },

  features: [
    "Terraza con vistas á Catedral",
    "Opcións vexetarianas",
    "Croquetas sen glute",
    "Vinoteca con D.O. galegas",
    "Cervexa artesá",
    "Acéptanse tarxetas",
  ],
  photos: {
    "terraza-catedral": {
      alt: "Terraza de Tixola Tapería na Rúa Juan de Austria cunha tixola de raxo, croquetas e dúas copas de viño branco, e a igrexa de Santa Eufemia de Ourense ao fondo",
      caption: "A terraza, con Santa Eufemia ao fondo",
    },
    "zamburinas-plancha": {
      alt: "Oito zamburiñas á prancha na súa cuncha, con allada de allo e perexil por riba, servidas en prato branco cun cordón de redución ao lado",
      caption: "Zamburiñas á prancha",
    },
    "tixola-raxo-croquetas": {
      alt: "Tixola de raxo con queixo de Arzúa en tixola de ferro, croquetas caseiras e viño branco galego na terraza de Tixola Tapería, Ourense",
      caption: "Tixola de raxo con queixo de Arzúa e croquetas",
    },

    /* Fotos da casa do 2 de outubro de 2026 */
    "tixola-raxo": {
      alt: "Tixola de raxo con queixo de Arzúa vista desde arriba: tixola con patacas, tacos de raxo e ovo callado, sobre a mesa de Tixola Tapería",
      caption: "Tixola de raxo e Arzúa",
    },
    "tixola-chistorra": {
      alt: "Tixola con chistorra vista desde arriba: tixola con patacas, ovo callado e rodas de chistorra",
      caption: "Tixola con chistorra",
    },
    "ensalada-gulas-langostinos": {
      alt: "Ensalada de gulas, cogomelos e lagostinos: gromos de leituga e rodas de tomate con gulas, cogomelos salteados e lagostinos por riba, en cunca de barro",
      caption: "Ensalada de gulas, cogomelos e lagostinos",
    },
    "ajada-bacalao": {
      alt: "Allada de bacallau: bacallau esmigallado con aceite, allo e pemento por riba, cunha pataca cocida ao lado, en cunca de cerámica verde",
      caption: "Allada de bacallau",
    },
    "pulpo-feira": {
      alt: "Polbo á feira en prato de madeira: rodas de polbo cocido sobre cachelos, con pemento e aceite de oliva por riba",
      caption: "Polbo á feira",
    },
    "pimientos-padron": {
      alt: "Fonte de pementos de Padrón fritos e espolvoreados con sal groso, en prato de cerámica verde sobre a mesa de madeira de Tixola Tapería",
      caption: "Pementos de Padrón",
    },
    "queso-frito": {
      alt: "Ración de queixo frito: catro tacos de queixo rebozados e dourados sobre follas de leituga, cunha cunca de noces peladas e outra de salsa vermella ao lado",
      caption: "Queixo frito, con noces e salsa",
    },
    "mejillones-tigre": {
      alt: "Ración de mexillóns tigre: oito cunchas recheas e rebozadas, douradas, sobre un leito de gromos de ensalada en prato verde",
      caption: "Mexillóns tigre",
    },
    "postre-chocolate": {
      alt: "Postre de chocolate con azucre glas e xarope, servida en prato verde cunha bóla de xeado de vainilla e dúas de nata montada, sobre a mesa de Tixola Tapería",
      caption: "O postre: chocolate, xeado e nata",
    },
    "tixola-raxo-mesa": {
      alt: "Tixola de raxo con patacas e ovo callado servida na mesa de Tixola Tapería, coa vinoteca e as caixas de madeira das adegas ao fondo",
      caption: "Tixola de raxo, coa vinoteca detrás",
    },
    "tixola-chistorra-mesa": {
      alt: "Tixola con chistorra, patacas e ovo callado servida na mesa con dous garfos, e os expositores de viño da sala ao fondo",
      caption: "Tixola con chistorra, servida na mesa",
    },
    "tixola-gulas-langostinos": {
      alt: "Tixola con gulas, cogomelos e lagostinos vista desde arriba: tixola de mango de madeira con patacas, ovo e gulas",
      caption: "Tixola con gulas, cogomelos e lagostinos",
    },
    "patatas-alioli": {
      alt: "Ración de patacas con alioli e perexil en cunca de cerámica verde, en Tixola Tapería de Ourense",
      caption: "Patacas con alioli",
    },
    "calamares-fritos": {
      alt: "Calamares fritos en aros sobre patacas panadeira, cunha cuña de limón e unhas follas de ensalada, servidos en cunca de barro sobre a mesa de Tixola Tapería",
      caption: "Calamares fritos",
    },
    "bacalao-tempura": {
      alt: "Bacallau en tempura, dourado e crocante, sobre unha cama de patacas en rodas, cunha salseira de salsa vermella ao lado, en fonte de cerámica verde",
      caption: "Bacallau en tempura",
    },
    "revuelto-bacalao-grelos": {
      alt: "Revolto de bacallau, grelos e lagostinos visto desde arriba, en prato branco cun fío de redución",
      caption: "Revolto de bacallau, grelos e lagostinos",
    },
    "ensalada-pollo-crujiente": {
      alt: "Ensalada de polo crocante con noces, mazá en bastóns, tomate e gromos verdes, en prato fondo de cerámica",
      caption: "Ensalada de polo crocante, noces e mazá",
    },
    "ensalada-aguacate-bacalao": {
      alt: "Ensalada de abacate e bacallau afumado con canónigos, tomate, pemento vermello e olivas negras, en prato branco",
      caption: "Ensalada de abacate e bacallau afumado",
    },
    "croquetas-tabla": {
      alt: "Croquetas caseiras recén fritas, vistas desde arriba sobre unha táboa de madeira alongada",
      caption: "Croquetas da casa",
    },
    "croquetas-racion": {
      alt: "Ración de croquetas caseiras aliñadas en prato alongado branco sobre a mesa de madeira da tapería",
      caption: "Ración de croquetas",
    },
    "timbal-vegetal": {
      alt: "Timbal vexetal de Tixola Tapería: berenxena, cabaciña e pemento asado montados en capas sobre unha base de pataca, coroado con cogomelos á prancha, con ensalada e pingas de salsa vermella arredor do prato",
      caption: "Timbal vexetal, coa vinoteca ao fondo",
    },
    "tortilla-sarten": {
      alt: "Tortilla de pataca húmida servida na propia tixola, sobre un prato de cerámica na mesa de madeira de Tixola Tapería, coa parede de botellas da vinoteca desenfocada ao fondo",
      caption: "A tortilla, na súa tixola",
    },
    "oreja-plancha": {
      alt: "Tiras de orella marcada na prancha, douradas e crocantes polos bordos, nunha fonte ovalada de cerámica verde, cunha bola de puré ao lado, sobre a mesa de madeira de Tixola Tapería",
      caption: "Orella na prancha",
    },
    "fingers-pollo": {
      alt: "Fingers de polo empanados e fritos sobre follas de leituga, cada un coroado cun gallo de pexego marcado á prancha, e unha cunca de salsa branca con perexil, nunha fonte ovalada de cerámica verde sobre a mesa de madeira de Tixola Tapería",
      caption: "Fingers de polo",
    },
    "tosta-salmon-queso": {
      alt: "Tosta de salmón e queixo de Tixola Tapería: dúas rebandas de pan rústico tostado con queixo cremoso untado e lascas de salmón afumado por riba, regadas cun fío de salsa escura, con follas de ensalada ao lado, nunha fonte ovalada de cerámica verde sobre a mesa de madeira",
      caption: "Tosta de salmón e queixo",
    },
    "ensalada-cecina": {
      alt: "Ensalada de cecina de Tixola Tapería: láminas de cecina repartidas en coroa sobre follas de leituga e endivia, con gallos de tomate, láminas de mazá e noces, e unha quenelle de xeado de queixo de ovella no centro, nunha cunca fonda de cerámica sobre a mesa de madeira",
      caption: "Ensalada de cecina con xeado de queixo de ovella",
    },
    "fachada-calle": {
      alt: "Fachada de Tixola Tapería na Rúa Juan de Austria de Ourense, cos seus dous rótulos granate cunha tixola, os toldos e dúas mesas altas con taburetes na rúa empedrada",
      caption: "A fachada, no casco histórico",
    },
    "rotulo-noche": {
      alt: "Rótulo de Tixola vinoteca-tapería iluminado de noite no casco histórico de Ourense",
      caption: "O rótulo, de noite no casco histórico",
    },
    barra: {
      alt: "Barra de Tixola Tapería coas botellas nos estantes e as paredes granates do local",
      caption: "A barra",
    },
    "vinoteca-armarios": {
      alt: "Armarios climatizados da vinoteca de Tixola, con caixas de madeira de adega enriba",
      caption: "A vinoteca",
    },
    "vinoteca-botellas": {
      alt: "Botellas de viño galego e doutras denominacións ordenadas nos estantes da vinoteca de Tixola",
      caption: "Botellas no estante",
    },
    "pizarra-vinos": {
      alt: "Lousa de Tixola cos viños recomendados por copa escritos a man, por denominación de orixe",
      caption: "Os viños recomendados do día",
    },
    "cubitera-regina": {
      alt: "Cubiteira de metal con botellas a arrefriar na vinoteca de Tixola Tapería",
      caption: "Arrefriando para a seguinte rolda",
    },
  },
  /* ── Fichas de viño: a prosa (nota de cata, historia, terreo, elaboración, crianza) ── */
  wines: {
    "pazo-baion": {
      notes: "Amarelo pallizo con reflexos verdosos e perfume varietal intenso: flores brancas e cítricos sobre un fondo de mazá e pera. En boca fresco, equilibrado, mineral e de final moi aromático.",
      story: "Elabórase só con uva vendimada na propia finca, baixo o concepto de viño de pago.",
      terroir: "Finca de 22 hectáreas de albariño, chea de microclimas, no corazón do Val do Salnés",
      subzone: "Val do Salnés",
    },
    "eduardo-pena": {
      notes: "Amarelo pálido con reflexos dourados. Nariz complexa de limón, flor de laranxeira, ananás e pexego con fondo balsámico; en boca graxo, untuoso, saboroso e moi longo.",
      story: "A adega está medio enterrada na ladeira do viñedo, o que mantén o interior a 14-15 ºC sen medios mecánicos.",
      terroir: "Máis de 10 hectáreas en Castrelo de Miño, a 250 metros, en pendente suave cara ao encoro, sobre solo areoso de lousa e pedra",
      winemaking: "Maceración das variedades, traballo sobre lías e fermentación en barrica de 300 litros de carballo europeo, sen fermentación maloláctica",
    },
    "lagar-do-merens": {
      notes: "Amarelo pálido con reflexos verdes. Nariz complexa e terpénica, con pera, mazá e pexego sobre notas florais e balsámicas; en boca amplo, envolvente e moi longo.",
      story: "Adega de colleiteiro de 2001 en A Arnoia: un lagar antigo de pedra e madeira restaurado, con 3,5 hectáreas de variedades autóctonas do Ribeiro.",
      terroir: "Solos graníticos francoareosos en ladeiras salvadas con socalcos, en A Arnoia",
      winemaking: "Maceración en prensa neumática con neve carbónica e fermentación a 17,5 ºC durante 21 días en aceiro inoxidable",
      ageing: "8 meses sobre lías finas",
    },
    "cunas-davia": {
      notes: "Nariz limpa e con certa complexidade: mazá, marmelo e melón con notas florais e de herba fresca. En boca saboroso e amplo, con cítricos e a acidez xusta, de final longo e untuoso.",
      ageing: "6 meses sobre lías",
    },
    "algueira": {
      story: "Adega familiar de Doade (Sober), nos socalcos do Sil, con 14 hectáreas de variedades autóctonas vinificadas parcela a parcela.",
      subzone: "Amandi",
    },
    "vel-uveyra": {
      story: "«Ronsel» é o rastro que deixa a barca ao navegar: así se chama a adega de Parada de Sil que asina este viño.",
      terroir: "Viñedo nos canóns do Sil, en Parada de Sil, sobre granito e xisto",
      subzone: "Ribeiras do Sil",
    },
    "la-lama": {
      story: "Adega de Langullo (Manzaneda), con 32 hectáreas en Quiroga-Bibei; definen os seus viños como atlánticos, de terroir e de garda.",
      terroir: "Socalcos de forte pendente sobre lousa e arxila",
      winemaking: "Vendima manual e fermentación con levaduras autóctonas en tinas grandes de madeira abertas",
      ageing: "20 meses en barrica neutra",
      subzone: "Quiroga-Bibei",
    },
    "a-moucha": {
      terroir: "Socalcos de montaña do val do Bibei, con cepas de entre 15 e 100 anos sobre lousa, xisto e granito",
      ageing: "4 meses de fermentación en barrica de carballo francés e un mínimo de 24 meses en tonel de 5.000 litros",
      subzone: "Quiroga-Bibei",
    },
    "la-lume": {
      winemaking: "Fermentación con levaduras autóctonas en barrica de 600 litros, foudre e ovo de formigón, sen fermentación maloláctica",
      ageing: "Crianza sobre lías finas no propio recipiente de fermentación: foudre, barrica e formigón",
    },
    "guitian": {
      notes: "Amarelo dourado con tons verdosos, con pexego e pomelo, un matiz de fiúncho e un final de flores brancas. En boca potente e fresco, de gran lonxitude.",
      story: "O godello da finca A Tapada plantouse en 1985 a partir dun clon antigo, prefiloxérico, no extremo oriental de Valdeorras, ao pé das Peñas Marías.",
      terroir: "Viñedo da finca A Tapada a uns 500 metros, en ladeira ao sur sobre lousas ordovícicas de textura arxilo-limosa",
      winemaking: "Vendima en caixa, maceración prefermentativa en frío, prensado pneumático a baixa presión, desfangado estático en frío e fermentación en aceiro inoxidable a 16-18 ºC",
      ageing: "En rama sobre as súas lías finas ata o embotellado, e polo menos 2 meses en botella na adega",
    },
    "guitian-sobre-lias": {
      notes: "Amarelo dourado con tons verdosos, con orellón de pexego e cortiza de laranxa, fiúncho e flores brancas ao final. En boca moi potente e fresco, de gran persistencia.",
      story: "Foi o primeiro viño español criado sobre lías en depósito con removido semanal durante catro a seis meses: esta adega abriu camiño no manexo de lías en España.",
      terroir: "Viñedo da finca A Tapada a uns 500 metros, en ladeira ao sur sobre lousas ordovícicas de textura arxilo-limosa",
      winemaking: "Vendima en caixa, maceración prefermentativa en frío, prensado pneumático a baixa presión, desfangado estático en frío e fermentación en aceiro inoxidable a 16-18 ºC",
      ageing: "De 4 a 6 meses sobre lías en depósito, con removido semanal, e polo menos 2 meses en botella",
    },
    "pajaro-loco": {
      notes: "Amarelo palla con notas verdosas, de intensidade media-alta, herbáceo e con froita de polpa branca. En boca envolvente e fresco, de posgusto longo e retronasal cítrica.",
      winemaking: "Maceración en frío, prensado suave por sangrado e dúas semanas de fermentación a baixa temperatura en aceiro inoxidable con lévedos naturais; embotéllase sen filtrar",
    },
    "crego-e-monaguillo-blanco": {
      notes: "Amarelo palla con toques dourados, cítrico, afroitado e floral, cun recordo de flor de fiúncho. En boca fresco, elegante e lixeiramente graxo, de acidez ben integrada.",
      story: "Adega familiar da Salgueira (Monterrei) con máis de cincuenta anos detrás, que traballa a man cen hectáreas de godello e mencía.",
      terroir: "Solos graníticos de grava lixeira no val do Támega",
      winemaking: "Maceración en frío da treixadura, prensado pneumático e desfangado por decantación en frío; fermentación en aceiro inoxidable a 17 ºC",
    },
    "crego-e-monaguillo-tinto": {
      notes: "Granate de capa media con ribete violáceo, moi afroitado: mora, amorodo, arando e casis cun fondo de cacao. En boca sedoso e aveludado, de taninos doces e retronasal de froita vermella e especias.",
      story: "Adega familiar da Salgueira (Monterrei) con máis de cincuenta anos detrás, que traballa a man cen hectáreas de godello e mencía.",
      terroir: "Solos graníticos de grava lixeira no val do Támega",
      winemaking: "Desengazado e esmagado moi suave, case uva enteira; fermentación e maceración en aceiro a 22 ºC, lixeira microoxixenación antes da maloláctica e repouso en aceiro ata o embotellado",
    },
    "vx-cuvee-caco": {
      notes: "A adega defíneo como potencia, madurez e elegancia, e exquisitamente fresco. Envellece amodo en botella.",
      story: "Caco é o diminutivo de Ricardo, o fundador de Coto de Gomariz, que recuperou parcelas e plantou boa parte das viñas novas. Só se fai en colleitas excepcionais, unhas 2.500 botellas.",
      terroir: "As fincas A Ferreira e A Canceliña, o antigo viñedo experimental de tintos da adega",
      ageing: "20 meses en barrica nova de carballo francés e americano",
    },
    "carmelo-rodero-9-meses": {
      notes: "Aroma potente, con cereixa e arando ben marcados. En boca fresco e equilibrado, de textura ampla e un final que convida a seguir.",
      terroir: "Viñedo de 30 a 35 anos entre 837 e 862 metros, en solos limosos e pedregosos",
      winemaking: "Vendima manual con selección no campo e vinificación por gravidade",
      ageing: "9 meses en barrica nova de carballo francés de 225 litros",
    },
    "arzuaga-crianza": {
      notes: "Vermello picota con matices violáceos. Nariz potente de froita vermella madura, especias e notas balsámicas con final torrefacto; en boca moito volume, suave e meloso, de gran lonxitude.",
      story: "É o buque insignia da casa, sobre todo tempranillo de viñedo propio da finca La Planta e das súas parcelas máis altas de Olivares de Duero.",
      terroir: "Viñedo por riba dos 900 metros en solo arxilo-calcario, coa rocha nai calcaria a un metro da superficie",
      winemaking: "Vendima en caixas de 15 kg, mesa de selección óptica gran a gran, encubado por gravidade e maceración prefermentativa de varios días",
      ageing: "16 meses en barrica, 70 % de carballo francés e 30 % americano, onde tamén fixo a maloláctica",
      subzone: "Finca La Planta e páramo de Olivares de Duero",
    },
    "tomas-postigo-3-ano": {
      notes: "Vermello picota con reflexos púrpura, limpo e intenso, con froitiños vermellos e negros maduros sobre madeira fina, especias e regaliz. En boca sedoso, de moi boa acidez e boa estrutura.",
      terroir: "Viñas seleccionadas entre 750 e 1.010 metros de altitude",
      winemaking: "Vendima manual en caixas de dez quilos con mesa de selección, a uva móvese por gravidade sen bombas e clarifícase con clara de ovo",
      ageing: "12 meses en barrica de carballo francés de 225 litros de distintos bosques",
    },
    "quinta-sardonia": {
      story: "A adega do grupo Terras Gauda en Sardón de Duero, que elabora por métodos biodinámicos buscando o equilibrio entre solo, clima, cepa e contorno.",
    },
    "malabrigo": {
      notes: "Vermello cereixa con ribete granate, limpo e profundo, de nariz moi intenso e elegante con froita negra e especias ben ensambladas coa madeira. Boca intensa e voluminosa, de posgusto longo.",
      story: "Malabrigo é o nome da parcela: alí non hai abrigo que protexa do clima castelán, e esas condicións extremas danlle raza e finura.",
      terroir: "A parcela Malabrigo, entre 850 e 900 metros, de solo areento-arxiloso e con moita diferenza de temperatura entre o día e a noite",
      winemaking: "Fermentación alcohólica en aceiro inoxidable a temperatura controlada e maloláctica de 30 días en barrica de carballo francés",
      ageing: "Crianza en barrica de carballo francés",
    },
    "dehesa-de-los-canonigos": {
      story: "Unha das grandes fincas históricas da Ribera del Duero: debe o seu nome ao cabido da catedral de Valladolid, vinte e dous monxes cóengos. Hoxe lévana cinco xeracións da mesma familia.",
      terroir: "Finca histórica á beira do Duero, con vinificacións separadas por parcela, tipo de solo e variedade",
    },
    "baigorri": {
      notes: "Vermello cereixa profundo, con froita negra recén recollida e especias. En boca elegante, sedoso e froital, con boa frescura e final longo.",
      story: "Baigorri reivindica o crianza de Rioja fronte á produción industrial: viticultura sustentable, traballo manual e embotellado sen clarificar nin filtrar.",
      terroir: "Parcelas en Samaniego, Laguardia e Leza, en solo arxilo-calcario a 600 metros e maioritariamente en vaso",
      winemaking: "Vendima manual con selección de bago, maceracións longas con lévedos indíxenas, extracción por gravidade e embotellado sen filtrar",
      ageing: "14 meses en barrica de carballo francés e americano",
    },
    "luis-canas": {
      notes: "Vermello picota, con froita vermella infusionada —amorodo, framboesa, grosella—, especias subtís e un fondo lácteo. Entrada doce e envolvente, moito frescor e final redondo.",
      story: "Un viño marcado polo terroir de Villabuena de Álava; a adega acredita a orixe da uva co selo Vino de Zona da DOCa Rioja.",
      terroir: "Villabuena de Álava e arredores, entre 450 e 650 metros, en solos arxilo-calcarios e areentos con viñas de 35 anos de media",
      winemaking: "Vendima manual con dobre mesa de selección, de acio e de bago, e elaboración en aceiro inoxidable",
      ageing: "12 meses en barrica usada de carballo francés (60 %) e americano (40 %)",
    },
    "marques-de-murrieta": {
      notes: "Froita vermella madura e regalicia harmonizadas con notas de licor de chocolate. En boca equilibrado, carnoso e redondo, de acidez amable e final longo.",
      story: "Resume a personalidade da Finca Ygay e todo o que pasa nela durante un ciclo enteiro da viña.",
      terroir: "Finca Ygay: 300 hectáreas propias arredor da adega, solo arxilo-calcario entre 320 e 485 metros",
      winemaking: "Fermentación separada por variedades en aceiro inoxidable, encubado de 8 a 10 días e prensado lento en prensa vertical",
      ageing: "25 meses en barrica de carballo americano de 225 litros",
    },
    "malpuesto": {
      notes: "Cereixa brillante e intenso, con froita madura, negra e silvestre. Estruturado e amplo, cun toque cremoso e terroso, moi carnoso e de final persistente.",
      story: "Orben é o proxecto de microparcelas de viñedo vello nas zonas altas de Rioja Alavesa, no contorno de Laguardia.",
      terroir: "Un único viñedo vello de 1,68 hectáreas plantado en vaso cara a 1931, en ladeira a 520 metros, sobre solo areento moi pobre e superficial",
      winemaking: "Vendima manual en caixa de 15 kg, desengazado sen esmagar, fermentación en aceiro aberto e maloláctica en barrica grande e ánfora de arxila",
      ageing: "12 meses en barrica de 500 litros de carballo francés de gran fino",
    },
    "macan-clasico": {
      notes: "O máis próximo e expresivo dos dous: trago amable, carácter marcado da terra de onde vén e unha sinxeleza que o fai moi atractivo.",
      story: "Macán e Macán Clásico son a visión conxunta de Rothschild e Vega Sicilia sobre Rioja, e conviven como primeiro e segundo viño á maneira bordelesa.",
      terroir: "100 hectáreas de viñedo de 30 anos de media na Sonsierra, a 483 metros, cun rendemento de 4.300 kg por hectárea",
      winemaking: "Maloláctica entre barrica e depósito, e crianza en madeira francesa de gran fino, a maior parte en barrica nova",
      ageing: "12 meses en barrica e 18 meses en botella",
    },
    "macan-etiqueta-dorada": {
      notes: "Máis agochado que o seu irmán menor: será o tempo o que modele a súa elegancia, arroupada por uns taninos aveludados e unha gran mineralidade.",
      story: "Naceu en 2009 do encontro das familias Rothschild e Álvarez na Rioja sonserrana, e é o primeiro viño do proxecto.",
      terroir: "100 hectáreas de viñedo de 40 anos de media na Sonsierra, a 500 metros, cun rendemento de 4.000 kg por hectárea",
      winemaking: "Maloláctica entre barrica e depósito, e crianza en madeira francesa de gran fino, a maior parte en barrica nova",
      ageing: "16 meses en barrica e foudre e 28 meses en botella",
    },
    "banzao": {
      story: "Un «banzao» é a presa de madeira e pedra que subía o nivel da auga para as canles de rego e que se refacía cada ano. O proxecto arrincou en 2017 arrendando tres hectáreas de viñedo vello abandonado para evitar que desaparecese.",
      terroir: "18 parcelas en 8 paraxes de San Pedro de Olleros, a 750 metros no val do Ancares, en vaso e a tresbolillo coa mestura orixinal de variedades",
    },
    "enate": {
      notes: "Vermello cereixa picota moi cuberto, con aroma intenso e complexo, afumado e especiado sobre froita vermella madura. En boca denso, carnoso e de final extraordinariamente longo.",
      story: "A etiqueta é unha pintura orixinal que o artista Víctor Mira creou para a adega.",
      winemaking: "As dúas variedades fermentan por separado a 26 ºC en aceiro inoxidable e despois fan a maloláctica",
      ageing: "9 meses en barrica de carballo francés e americano, e afinado final en aceiro inoxidable",
    },
    "quinta-do-escudial": {
      notes: "Rubí con tons violáceos, con arando maduro, cereixa e ameixa negra sobre un toque de casis e pementa. En boca persistente e elegante, de taninos finos e sedosos.",
      story: "A adega preséntase como especialista en viños «sen madeira»: este reserva non ve barrica e afina en aceiro.",
      winemaking: "Vendima manual con selección rigorosa e fermentación separada por variedades, cunha elaboración minimalista",
      ageing: "Uns 48 meses en cuba de aceiro inoxidable, sen pasar por barrica",
    },
    "quinta-das-bagueiras": {
      notes: "Baga e Touriga Nacional conxúganse con harmonía: froitos silvestres, especias e herba fresca. Zumarento, expresivo, longo e cheo de vida.",
      story: "Elabora viños clásicos con prácticas moi tradicionais, herdadas de xeración en xeración, e cunha enoloxía minimalista.",
      winemaking: "Fermenta de 5 a 8 días en lagar sen desengazar, con bazuqueos a man cun pisón de madeira varias veces ao día",
      ageing: "Uns 18 meses nos mesmos toneis de madeira vella onde remata a fermentación; embotéllase sen clarificar nin filtrar",
    },
    "piaugier-sablet": {
      notes: "Froitos vermellos frescos en nariz, con cereixa e framboesa. En boca suave e harmonioso, de taninos finos xa fundidos e final elegante e persistente.",
      story: "Finca familiar ao pé das Dentelles de Montmirail: Jean-Marc e Sophie tomaron o relevo en 1985 e hoxe acompáñaos a súa filla Maude.",
      terroir: "Parcelas de terroir areento en Sablet, sobre derrubios areno-limosos que drenan moi ben, con viñas de 35 a 45 anos",
      winemaking: "Vendima manual e vinificación separada en depósitos de formigón levantados en 1947 polo bisavó da casa, con maceración de dúas a tres semanas",
      ageing: "Uns 18 meses en depósito de formigón, despois da ensamblaxe",
    },
    "terrazas-de-los-andes": {
      story: "Viños de montaña dos terroirs de altura de Mendoza, ao pé dos Andes.",
    },
    "abbotsdale": {
      notes: "Rubí, con violetas e froita vermella e negra: cereixa, ameixa, grosella negra e amora. Boca media, de taninos suaves e final longo.",
      story: "Os viñedos selecciónaos Bryan MacRobert, criado nunha finca preto da vila de Abbotsdale, en Swartland.",
      terroir: "Viñas en vaso, de secaño e baixo rendemento, sobre solo areento de granito descomposto; vendímase a man pola madrugada",
      winemaking: "Selección de uva antes do depósito, con parte de acio enteiro para manter o frescor e unha extracción suave",
      ageing: "En toneis grandes de madeira vella, para redondear e estabilizar o viño",
    },
  },
};
export default gl;
