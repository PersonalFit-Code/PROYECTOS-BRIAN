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
      description: "Para abrir boca ou para alongar a sobremesa co que quede na copa.",
    },
    revueltos: {
      label: "Revoltos",
      kicker: "Ovo e tixola",
      description: "Callados no punto, nin secos nin líquidos. O prato de culler para quen non a usa.",
    },
    varios: {
      label: "Varios",
      kicker: "Sobremesa e mesa",
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
      description: "Base de brotes con gulas, cogomelos salteados e lagostinos. Morna por riba e fresca por abaixo: cómese como prato único.",
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
      description: "Aguacate e bacallau afumado, suave e manteigoso. A máis lixeira das cinco.",
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
      description: "Grelos e chipirón dentro da bechamel: verde e mar na mesma croqueta. As máis galegas e as que máis se repiten nas reseñas.",
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
      description: "Tiras de polo empanadas e fritas. O prato ao que se agarran os nenos e do que acaban picando os maiores.",
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
      description: "Tacos de queixo rebozados e fritos, mornos e fundentes por dentro. Dura pouco na mesa.",
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
      badge: "N.º 1 en zamburiñas",
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
    "Opcións veganas e vexetarianas",
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
      alt: "Zamburiñas galegas á prancha na súa cuncha con aceite de oliva, allo e perexil, prato estrela de Tixola Tapería en Ourense",
      caption: "Zamburiñas á prancha",
    },
    "tixola-raxo-croquetas": {
      alt: "Tixola de raxo con queixo de Arzúa en tixola de ferro, croquetas caseiras e viño branco galego na terraza de Tixola Tapería, Ourense",
      caption: "Tixola de raxo con queixo de Arzúa e croquetas",
    },
    fachada: {
      alt: "Fachada de Tixola Tapería na Rúa Juan de Austria 7, casco histórico de Ourense, cos seus toldos vermellos e a lousa do día",
      caption: "Rúa Juan de Austria, 7",
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
    "queso-frito": {
      alt: "Ración de queixo frito: catro tacos de queixo rebozados e dourados sobre follas de leituga, cun cunco de noces peladas e outro de salsa vermella ao lado",
      caption: "Queixo frito, con noces e salsa",
    },
    "mejillones-tigre": {
      alt: "Ración de mexillóns tigre: oito cunchas recheas e rebozadas, douradas, sobre un leito de brotes de ensalada en prato verde",
      caption: "Mexillóns tigre",
    },
    "postre-chocolate": {
      alt: "Sobremesa de chocolate con azucre glas e xarope, servida en prato verde cunha bóla de xeado de vainilla e dúas de nata montada, sobre a mesa de Tixola Tapería",
      caption: "A sobremesa: chocolate, xeado e nata",
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
      alt: "Tixola con gulas, fungos e lagostinos vista desde arriba: tixola de mango de madeira con patacas e ovo",
      caption: "Tixola con gulas, fungos e lagostinos",
    },
    "patatas-alioli": {
      alt: "Ración de patacas con allada e perexil en cunca de cerámica verde, en Tixola Tapería de Ourense",
      caption: "Patacas con alioli",
    },
    "calamares-fritos": {
      alt: "Calamares fritos en aros sobre patacas panadeira, con limón e ensalada, en Tixola Tapería",
      caption: "Calamares fritos",
    },
    "pulpo-tempura": {
      alt: "Polbo en tempura sobre cama de patacas, con limón e salsa de pemento en salseira á parte, en fonte de cerámica verde",
      caption: "Polbo en tempura",
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
      alt: "Croquetas caseiras recén fritas, vistas desde arriba sobre un taboleiro de madeira alongado",
      caption: "Croquetas da casa",
    },
    "croquetas-racion": {
      alt: "Ración de croquetas caseiras aliñadas en prato alongado branco sobre a mesa de madeira da tapería",
      caption: "Ración de croquetas",
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
      alt: "Cubiteira de metal con botellas arrefriando na vinoteca de Tixola Tapería",
      caption: "Arrefriando para a seguinte rolda",
    },
  },
};
export default gl;
