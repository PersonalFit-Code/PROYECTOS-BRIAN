import type { DataTranslations } from "@/i18n/data";

/**
 * Overrides en galego dos DATOS (carta, pratos estrela, alérxenos, etiquetas, servizos).
 * Os nomes dos pratos non se tocan (son nomes propios e o que se le na carta física);
 * tradúcense descricións, unidades, variantes e maridaxes. Claves ausentes → español.
 */
const gl: DataTranslations = {
  categories: {
    sugerencias: {
      label: "Suxestións",
      kicker: "Lousa do día",
      description: "O que hoxe entra pola porta da lonxa e do mercado.",
    },
    croquetas: {
      label: "Croquetas",
      kicker: "Caseiras · 8 uds",
      description: "A nosa bechamel repousa 24 h. Crocantes por fóra, cremosas por dentro.",
    },
    tixolas: {
      label: "Tixolas",
      kicker: "A especialidade da casa",
      description: "A tixola de ferro fundido de toda a vida, a que lle dá nome á casa: chega á mesa aínda chiando.",
    },
    mar: {
      label: "Do Mar",
      kicker: "Lonxa galega",
      description: "Zamburiñas, polbo, bacallau e lura. Produto das rías, cociñado ao momento.",
    },
    tierra: {
      label: "Da Terra",
      kicker: "Racións para compartir",
      description: "Raxo, orella, queixos galegos e clásicos do tapeo ourensán.",
    },
    ensaladas: {
      label: "Ensaladas",
      kicker: "Fresco e de tempada",
      description: "Verduras da horta ourensá con toques creativos.",
    },
    postres: {
      label: "Sobremesas",
      kicker: "Caseiras",
      description: "O remate doce, feito na casa cada mañá.",
    },
    vinos: {
      label: "Viños",
      kicker: "Vinoteca galega",
      description: "Godello, Ribeiro, Albariño e Mencía. Por copas ou por botella.",
    },
    bebidas: {
      label: "Cervexas e máis",
      kicker: "Artesás e refrescos",
      description: "Cervexa artesá galega, cañas ben tiradas e refrescos.",
    },
  },

  menuItems: {
    // ─── SUXESTIÓNS ────────────────────────────────────────────────
    "sug-zamburinas-rellenas": {
      description: "Zamburiñas da ría recheas de sofrito de cebola, xamón e pan relado, gratinadas ao forno.",
      unit: "6 uds",
      pairing: "Albariño D.O. Rías Baixas",
    },
    "sug-raxo-arzua": {
      description: "Lombo de porco adobado ao estilo galego, patacas panadeira e queixo Arzúa-Ulloa fundido.",
      unit: "tixola",
      pairing: "Mencía D.O. Ribeira Sacra",
    },
    "sug-pulpo-grelos": {
      description: "Polbo da ría marcado á prancha sobre unha cama de grelos salteados con allo e pemento da Vera.",
      unit: "ración",
      pairing: "Godello D.O. Valdeorras",
    },

    // ─── CROQUETAS ─────────────────────────────────────────────────
    "croq-grelo-chipiron": {
      description: "As máis aplaudidas de Ourense: bechamel de grelo con chipirón na súa tinta.",
      unit: "8 uds",
      variants: ["Media (4 uds)", "Ración (8 uds)"],
      pairing: "Ribeiro Treixadura",
    },
    "croq-jamon": {
      description: "Receita da avoa con xamón ibérico picado a coitelo.",
      unit: "8 uds",
      variants: ["Media (4 uds)", "Ración (8 uds)"],
    },
    "croq-cecina-cabra": {
      description: "Cecina de León afumada con corazón de queixo de cabra.",
      unit: "8 uds",
    },
    "croq-bacalao-singluten": {
      description: "Rebozadas con fariña de millo e de arroz. Aptas para celíacos.",
      unit: "8 uds",
    },

    // ─── TIXOLAS ───────────────────────────────────────────────────
    "tix-chistorra-huevos": {
      description: "Chistorra navarra á brasa, ovos de campo rotos e patacas palla.",
      unit: "tixola",
      pairing: "Mencía D.O. Ribeira Sacra",
    },
    "tix-huevos-rotos-jamon": {
      description: "O clásico: ovos de campo, patacas e xamón ibérico sobre ferro quente.",
      unit: "tixola",
    },
    "tix-raxo-queso-azul": {
      description: "Raxo adobado, ovos rotos e crema de queixo azul galego.",
      unit: "tixola",
      pairing: "Godello D.O. Valdeorras",
    },
    "tix-gulas-setas-gambas": {
      description: "Gulas ao allo con cogomelos de tempada, gambas e guindilla.",
      unit: "tixola",
      pairing: "Albariño D.O. Rías Baixas",
    },
    "tix-vegana": {
      description: "Cogomelos, pementos, cabaciña e tofu afumado con pemento doce. 100 % vexetal.",
      unit: "tixola",
      pairing: "Ribeiro Treixadura",
    },

    // ─── DO MAR ────────────────────────────────────────────────────
    "mar-zamburinas-plancha": {
      description: "Zamburiñas galegas á prancha con aceite de oliva virxe, allo e perexil. O noso prato estrela.",
      unit: "6 uds",
      pairing: "Albariño D.O. Rías Baixas",
    },
    "mar-pulpo-feira": {
      description: "Polbo cocido en pota de cobre, con cachelos, pemento e aceite de oliva. Tradición pura.",
      unit: "ración",
      pairing: "Ribeiro Treixadura",
    },
    "mar-bacalao-tempura": {
      description: "Lombos de bacallau desalgado en tempura lixeira e crocante, con alioli suave de allo asado.",
      unit: "ración",
      pairing: "Godello D.O. Valdeorras",
    },
    "mar-calamares": {
      description: "Aneis de lura fresca, rebozado fino e limón.",
      unit: "ración",
    },
    "mar-choubas": {
      description: "Xoubas fritas enteiras, crocantes, con sal groso e limón.",
      unit: "ración",
    },
    "mar-pastel-cabracho": {
      description: "Pastel caseiro de cabracho con maionesa de pementos e torradas.",
      unit: "ración",
    },

    // ─── DA TERRA ──────────────────────────────────────────────────
    "tie-oreja": {
      description: "Orella de porco cocida e marcada á prancha ata quedar crocante, con pemento e sal groso.",
      unit: "ración",
      pairing: "Mencía D.O. Ribeira Sacra",
    },
    "tie-fingers-pollo": {
      description: "Tiras de polo empanadas na casa con salsa de mel e mostaza.",
      unit: "ración",
    },
    "tie-raxo-patatas": {
      description: "Lombo de porco adobado con allo, pemento e ourego, con patacas fritas.",
      unit: "ración",
    },
    "tie-queso-frito": {
      description: "Queixo de tetilla empanado e frito, con marmelada caseira de tomate.",
      unit: "ración",
    },
    "tie-bravas": {
      description: "Patacas fritas coa nosa salsa brava «fóra do común» e alioli.",
      unit: "ración",
    },
    "tie-padron": {
      description: "Uns pican e outros non. Fritos con aceite de oliva e sal groso.",
      unit: "ración",
    },
    "tie-tabla-quesos": {
      description: "Arzúa-Ulloa, San Simón da Costa afumado e Tetilla, con marmelo e noces.",
      unit: "táboa",
      pairing: "Godello D.O. Valdeorras",
    },
    "tie-tabla-embutidos": {
      description: "Chourizo, lacón e cecina con pan de Cea (IXP), o pan de forno de leña ourensán.",
      unit: "táboa",
      pairing: "Mencía D.O. Ribeira Sacra",
    },

    // ─── ENSALADAS ─────────────────────────────────────────────────
    "ens-pollo-crujiente": {
      description: "Mestura de follas, polo empanado, tomate cherry, parmesano e vinagreta de mel e mostaza.",
      unit: "ración",
    },
    "ens-ventresca": {
      description: "Tomate de tempada, ventresca de bonito, cebola tenra e AOVE.",
      unit: "ración",
    },
    "ens-vegana-quinoa": {
      description: "Quinoa, aguacate, edamame, granada e sementes de sésamo con lima.",
      unit: "ración",
    },

    // ─── SOBREMESAS ────────────────────────────────────────────────
    "pos-coulant": {
      description: "Biscoito de chocolate con corazón fundido e xeado de vainilla.",
      unit: "ud",
    },
    "pos-flan-choco-blanco": {
      description: "Flan caseiro de chocolate branco con caramelo e nata.",
      unit: "ud",
    },
    "pos-tarta-queso": {
      description: "Ao forno, con base de galleta e coulis de froitos vermellos.",
      unit: "ud",
    },
    "pos-pina": {
      description: "Piña fresca laminada, zume de lima e follas de menta.",
      unit: "ud",
    },

    // ─── VIÑOS ─────────────────────────────────────────────────────
    "vin-godello": {
      description: "Branco mineral e fresco, o favorito da casa para o polbo e o bacallau.",
      unit: "copa",
      variants: ["Copa", "Botella"],
    },
    "vin-ribeiro": {
      description: "O viño de Ourense por excelencia: floral, lixeiro, perfecto coas croquetas.",
      unit: "copa",
      variants: ["Copa", "Botella"],
    },
    "vin-albarino": {
      description: "Aromático e salino. A maridaxe natural das zamburiñas.",
      unit: "copa",
      variants: ["Copa", "Botella"],
    },
    "vin-mencia": {
      description: "Tinto atlántico de viticultura heroica. Froitas vermellas e frescura para as tixolas.",
      unit: "copa",
      variants: ["Copa", "Botella"],
    },

    // ─── BEBIDAS ───────────────────────────────────────────────────
    "beb-artesana": {
      description: "Selección rotativa de cervexeiras galegas. Pregunta pola de hoxe.",
      unit: "33 cl",
    },
    "beb-cana": {
      description: "Ben tirada, con tapa da casa.",
      unit: "caña",
    },
    "beb-agua": {
      description: "Con ou sen gas.",
      unit: "50 cl",
    },
  },

  starDishes: {
    zamburinas: {
      kicker: "Prato estrela",
      headline: "As zamburiñas que fixeron famoso o local",
      description:
        "Zamburiñas galegas abertas na súa cuncha e marcadas á prancha con aceite de oliva virxe extra, allo laminado e perexil fresco. Zumentas, con ese punto de brasa que só dá o ferro.",
      ingredients: ["Zamburiñas da ría", "AOVE", "Allo laminado", "Perexil fresco", "Sal de Arousa", "Limón"],
      unit: "6 uds",
      badge: "N.º 1 en zamburiñas",
      pairingWhy: "A súa salinidade e a súa acidez limpan a graxa do aceite e realzan a dozura do molusco.",
    },
    pulpo: {
      kicker: "Tradición",
      headline: "O polbo de Ourense, capital galega do polbo",
      description:
        "Servímolo de dúas maneiras: á feira, cocido en pota de cobre con cachelos e pemento, ou á prancha sobre grelos salteados con allo e pemento da Vera. Tenro por dentro, tostado por fóra.",
      ingredients: ["Polbo da ría", "Grelos", "Cachelos", "Pemento da Vera", "AOVE", "Sal groso"],
      unit: "ración",
      pairingWhy: "Un branco con corpo e mineralidade que acompaña a textura do polbo sen tapalo.",
    },
    bacalao: {
      kicker: "Crocante",
      headline: "Tempura lixeira, bacallau en lascas",
      description:
        "Lombos de bacallau desalgado na casa envoltos nunha tempura aireada e moi fina, fritos ao momento e servidos con alioli suave de allo asado.",
      ingredients: ["Bacallau desalgado", "Tempura lixeira", "Alioli de allo asado", "Ceboliño", "AOVE"],
      unit: "ración",
      pairingWhy: "O viño de Ourense: floral e lixeiro, contrasta co rebozado e refresca cada bocado.",
    },
    oreja: {
      kicker: "Tapeo clásico",
      headline: "Crocante por fóra, melosa por dentro",
      description:
        "Orella de porco cocida amodo e marcada á prancha ata quedar crocante, rematada con pemento, sal groso e un fío de aceite. A tapa de toda a vida, feita con agarimo.",
      ingredients: ["Orella de porco", "Pemento doce e picante", "Sal groso", "AOVE", "Allo"],
      unit: "ración",
      badge: "Sen glute",
      pairingWhy: "Un tinto atlántico fresco e froiteiro que equilibra a untuosidade da orella.",
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
};
export default gl;
