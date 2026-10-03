import type { DataTranslations } from "@/i18n/data";

/**
 * English overrides for the DATA (menu, signature dishes, allergens, tags, features).
 * Dish names stay in Spanish/Galician (they are proper names and what guests will see on the
 * printed menu); descriptions explain the Galician specialities. Missing keys → Spanish.
 */
const en: DataTranslations = {
  categories: {
    tostas: {
      label: "Tostas",
      kicker: "To begin",
      description: "Toasted bread and, on top, not much but all of it good. The first bite while you decide on the rest.",
    },
    tixolas: {
      label: "Tixolas",
      kicker: "The house speciality",
      description: "“Tixola” is Galician for frying pan. Cast iron that reaches the table still sizzling, and every one comes with eggs and chips.",
    },
    ensaladas: {
      label: "Salads",
      kicker: "Fresh, and a meal on their own",
      description: "Big enough to eat from rather than eat alongside. Half market garden, half fish market.",
    },
    cocina: {
      label: "A nosa cociña",
      kicker: "The usual, done properly",
      description: "“A nosa cociña” is Galician for our kitchen: croquetas, fried plates and portions to share, coming out all day long.",
    },
    especiales: {
      label: "Specials",
      kicker: "What you have to try",
      description: "The zamburiñas (small scallops) we are known for, and the classics that turn up on every table.",
    },
    pulpo: {
      label: "Octopus",
      kicker: "From the ría",
      description: "Boiled in a copper pot or seared on the griddle. In Ourense, octopus gets a section of its own.",
    },
    embutidos: {
      label: "Cured meats & cheeses",
      kicker: "Board and knife",
      description: "To open the meal, or to keep the table going long after the plates have gone.",
    },
    revueltos: {
      label: "Revueltos",
      kicker: "Eggs and a hot pan",
      description: "Softly scrambled and set just right, neither dry nor runny. The nearest thing to a stew for anyone who will not have one.",
    },
    varios: {
      label: "Extras",
      kicker: "Pudding and bread",
      description: "The sweet finish, and what goes alongside everything else.",
    },
  },

  menuItems: {
    // ─── TOSTAS ────────────────────────────────────────────────────
    "tos-salmon-queso": {
      description: "Smoked salmon and soft cheese on toasted bread. Cold, mild and straight to the point: the one you order without thinking while the rest arrives.",
      unit: "each",
    },
    "tos-trigueros-jamon-codorniz": {
      description: "Griddled wild asparagus, ham and a quail's egg on top. Two bites, and the yolk does the rest.",
      unit: "each",
    },
    "tos-cebolla-foie-cabra": {
      description: "Onion cooked down slowly until it turns sweet, foie and a medallion of goat's cheese. The most indulgent of the three.",
      unit: "each",
    },

    // ─── TIXOLAS ───────────────────────────────────────────────────
    "tix-piquillos-panceta": {
      description: "Caramelised piquillo peppers and crisp pork belly on the cast-iron pan, over its eggs and its chips. Sweet and salty in the same mouthful.",
      unit: "skillet",
    },
    "tix-chistorra": {
      description: "Chistorra (a paprika-spiced sausage) cooked in the pan itself, with eggs and chips. The plainest of them, and the one people come back for.",
      unit: "skillet",
    },
    "tix-gulas-setas-langostinos": {
      description: "Gulas (baby-eel look-alikes), sautéed mushrooms and king prawns on the hot iron, with eggs and chips. The fullest skillet of the lot.",
      unit: "skillet",
    },
    "tix-raxo-arzua": {
      description: "Raxo — Galician marinated pork — under melted Arzúa-Ulloa cheese, over eggs and chips. It is the one in every photo of the place.",
      unit: "skillet",
    },
    "tix-pisto-verduras": {
      description: "Slow-cooked pisto, a stew of peppers, courgette and tomato, with eggs and chips. The meat-free skillet, and nobody's consolation prize.",
      unit: "skillet",
    },

    // ─── SALADS ────────────────────────────────────────────────────
    "ens-gulas-setas-langostinos": {
      description: "A bed of leaves with gulas (baby-eel look-alikes), sautéed mushrooms and king prawns. Warm on top, cool underneath: a meal on its own.",
      unit: "portion",
    },
    "ens-pollo-crujiente": {
      description: "Strips of chicken breaded and fried to order, with walnuts and apple. The one ordered by people who did not come here for salad.",
      unit: "portion",
    },
    "ens-ventresca": {
      description: "Tuna belly over fresh leaves and vegetables. Little else: when the ventresca is this good, the rest only gets in the way.",
      unit: "portion",
    },
    "ens-cecina-helado-oveja": {
      description: "Slices of cecina (air-dried cured beef) and a quenelle of sheep's cheese ice cream melting slowly over them. The best-looking plate on the menu.",
      unit: "portion",
    },
    "ens-aguacate-bacalao": {
      description: "Avocado and smoked cod, mild and buttery. The lightest of the five.",
      unit: "portion",
    },

    // ─── A NOSA COCIÑA ─────────────────────────────────────────────
    "coc-patatas": {
      description: "Chips with spicy brava sauce, with aioli, or with both. Your call, though almost everyone goes for both.",
      unit: "portion",
    },
    "coc-croquetas-jamon": {
      description: "Béchamel left to rest until it sets, finely chopped ham and frying at the last minute. Crisp outside, almost liquid inside.",
      unit: "portion",
      variants: ["Half portion", "Full portion"],
    },
    "coc-croquetas-grelos-chipiron": {
      description: "Grelos (turnip greens) and baby squid folded into the béchamel: garden and sea in the same croqueta. The most Galician of the three, and the ones the reviews keep mentioning.",
      unit: "portion",
      variants: ["Half portion", "Full portion"],
    },
    "coc-croquetas-cecina-cabra": {
      description: "Cecina (air-dried cured beef) and goat's cheese melted into the béchamel. The strongest of the three; one portion is plenty for two.",
      unit: "portion",
      variants: ["Half portion", "Full portion"],
    },
    "coc-mejillones-tigre": {
      description: "Mussel chopped and bound with béchamel, returned to its shell and breadcrumbed. The old bar-counter mouthful, made the way it should be.",
      unit: "portion",
    },
    "coc-calamares": {
      description: "Squid rings floured and fried to order. Lemon on the side and no further ceremony.",
      unit: "portion",
    },
    "coc-bacalao-tempura": {
      description: "Chunks of cod in a fine tempura, with peppers alongside. It cracks when you bite and stays juicy inside.",
      unit: "portion",
    },
    "coc-salteado-verdura-arroz": {
      description: "Vegetables and mushrooms tossed over a high flame with rice. A full plate for anyone who would rather skip the fryer.",
      unit: "portion",
    },
    "coc-croquetas-sin-gluten": {
      description: "The same croqueta, made without gluten. It is on the menu because we are asked for it daily; do say so when you order, so the kitchen has it in mind.",
      unit: "portion",
    },
    "coc-tortilla-champinones": {
      description: "A soft tortilla finished in a short mushroom stew. Eaten with bread, and nothing is left over.",
      unit: "portion",
    },
    "coc-fingers-pollo": {
      description: "Breaded chicken strips, fried. The plate the children lay claim to and the one the adults end up picking at.",
      unit: "portion",
    },
    "coc-pastel-cabracho": {
      description: "The northern classic: scorpion fish, egg and cream baked together, served cold with toast. Mild, and full of the sea.",
      unit: "portion",
    },

    // ─── SPECIALS ──────────────────────────────────────────────────
    "esp-timbal-vegetal": {
      description: "Vegetables built up in layers, made to order. The lightest starter on the menu.",
      unit: "portion",
    },
    "esp-brocheta-xxl": {
      description: "A large skewer of marinated pork, cooked on the griddle. To share, or for anyone who arrives properly hungry.",
      unit: "each",
    },
    "esp-ajada-bacalao": {
      description: "Cod under a Galician ajada: hot oil, garlic and paprika poured over the top. An old recipe, and one that has you mopping the plate.",
      unit: "portion",
      variants: ["Half portion", "Full portion"],
    },
    "esp-zamburinas-plancha": {
      description: "Zamburiñas (small scallops) from the ría, seared on the griddle in their shells. Little heat and nothing to mask them: the dish we are known for.",
      unit: "portion",
    },
    "esp-zamburinas-rellenas": {
      description: "The same zamburiñas, filled with a slow-cooked sofrito and browned in the oven. The richer version of the one above.",
      unit: "portion",
    },
    "esp-queso-frito": {
      description: "Cubes of cheese, breaded and fried, warm and molten inside. It does not last long on the table.",
      unit: "portion",
    },
    "esp-oreja-plancha": {
      description: "Pig's ear, boiled and then seared on the griddle until the edges crisp. Ourense tapas, no frills.",
      unit: "portion",
    },

    // ─── OCTOPUS ───────────────────────────────────────────────────
    "pul-gallega-plancha": {
      description: "However you prefer it: á feira, with cachelos (boiled potatoes), paprika and oil, or seared on the griddle. The same octopus, two schools of thought.",
      unit: "portion",
    },
    "pul-plancha-grelos": {
      description: "Octopus seared on the griddle over a bed of sautéed grelos (turnip greens). The bitterness of the greens against the sweetness of the octopus.",
      unit: "portion",
    },
    "pul-salteado-salmon-langostinos": {
      description: "Octopus, salmon and king prawns tossed together in the pan. The dearest plate on the menu, and the one with the most sea in it.",
      unit: "portion",
    },
    "pul-tempura": {
      description: "Pieces of octopus in a light tempura, fried to order. Crisp outside and still tender within.",
      unit: "portion",
    },

    // ─── CURED MEATS & CHEESES ─────────────────────────────────────
    "emb-jamon-serrano": {
      description: "Hand-carved and served at room temperature, so the fat softens. Bread on the side and little else.",
      unit: "portion",
    },
    "emb-queso-pais": {
      description: "A young, mild Galician cheese from nearby. The one that sits best beside a glass without covering it.",
      unit: "portion",
    },
    "emb-queso-oveja": {
      description: "A cured sheep's cheese, with more character than the local one. For anyone who wants the cheese to speak up.",
      unit: "portion",
    },
    "emb-queso-cabra": {
      description: "Goat's cheese log in slices, tangy and creamy. The counterpoint on the board.",
      unit: "portion",
    },

    // ─── REVUELTOS ─────────────────────────────────────────────────
    "rev-algas-langostinos": {
      description: "Eggs set just right with seaweed and king prawns. Tastes of the sea without being fish.",
      unit: "portion",
    },
    "rev-bacalao-grelos-langostinos": {
      description: "Flaked cod, grelos (turnip greens) and king prawns bound with egg. The fullest of the three.",
      unit: "portion",
    },
    "rev-setas-oreja": {
      description: "Mushrooms and crisp pig's ear over softly set eggs. Pure earth, and the most filling of the three.",
      unit: "portion",
    },

    // ─── EXTRAS ────────────────────────────────────────────────────
    "var-postre": {
      description: "It changes with the day and with whatever came out of the kitchen that morning. Ask the staff: there is always something homemade.",
      unit: "portion",
    },
    "var-postre-sin-gluten": {
      description: "The sweet option made without gluten, so nobody is left without an ending. Ask what there is today.",
      unit: "portion",
    },
    "var-pan": {
      description: "The day's bread in its basket, for mopping up whatever is left in the pan.",
      unit: "basket",
    },
    "var-pan-tomate": {
      description: "Toasted bread rubbed with tomato and olive oil. It goes down on its own while the rest arrives.",
      unit: "portion",
    },
  },

  starDishes: {
    zamburinas: {
      kicker: "Signature dish",
      headline: "The zamburiñas that made this place famous",
      description:
        "Galician zamburiñas (small scallops) opened in their shell and seared on the griddle with extra virgin olive oil, sliced garlic and fresh parsley. Juicy, with that touch of char only hot iron can give.",
      ingredients: ["Zamburiñas from the ría", "Extra virgin olive oil", "Sliced garlic", "Fresh parsley", "Salt", "Lemon"],
      unit: "portion",
      badge: "No. 1 for zamburiñas",
      pairingWhy: "Its salinity and acidity cut through the oil and bring out the natural sweetness of the scallop.",
    },
    raxo: {
      kicker: "The house speciality",
      headline: "The skillet that reaches the table still sizzling",
      description:
        "Raxo — Galician marinated pork — over eggs and chips, with Arzúa-Ulloa cheese melted on top and served in the cast-iron pan it was cooked in. You hear it before you see it.",
      ingredients: ["Raxo (marinated pork)", "Arzúa-Ulloa PDO cheese", "Free-range eggs", "Potatoes", "Paprika", "Extra virgin olive oil"],
      unit: "skillet",
      badge: "The most ordered",
      pairingWhy: "A light, fresh red that stands up to the melted cheese without covering the marinade on the pork.",
    },
    croquetas: {
      kicker: "Béchamel left to rest",
      headline: "Garden and sea in the same croqueta",
      description:
        "Sautéed grelos (turnip greens) and baby squid inside a béchamel left to rest until it sets, breadcrumbed and fried to order. They crack when you bite and stay almost liquid inside.",
      ingredients: ["Grelos (turnip greens)", "Baby squid", "24-hour béchamel", "Breadcrumbs", "Egg", "Extra virgin olive oil"],
      unit: "portion",
      badge: "The most ordered",
      pairingWhy: "It has the body for the béchamel and just the right bitterness to go with the grelos.",
    },
  },

  allergens: {
    gluten: { label: "Gluten", description: "Cereals containing gluten: wheat, rye, barley, oats, spelt." },
    crustaceos: { label: "Crustaceans", description: "Prawns, king prawns, velvet crab, spider crab and products made from them." },
    huevos: { label: "Eggs", description: "Eggs and egg-based products." },
    pescado: { label: "Fish", description: "Fish and fish-based products." },
    cacahuetes: { label: "Peanuts", description: "Peanuts and peanut-based products." },
    soja: { label: "Soya", description: "Soya and soya-based products." },
    lacteos: { label: "Dairy", description: "Milk and milk products, including lactose." },
    "frutos-cascara": { label: "Tree nuts", description: "Almonds, hazelnuts, walnuts, cashews, pistachios…" },
    apio: { label: "Celery", description: "Celery and celery-based products." },
    mostaza: { label: "Mustard", description: "Mustard and mustard-based products." },
    sesamo: { label: "Sesame", description: "Sesame seeds and sesame-based products." },
    sulfitos: { label: "Sulphites", description: "Sulphur dioxide and sulphites (> 10 mg/kg). Found in wines and pickles." },
    altramuces: { label: "Lupin", description: "Lupin and lupin-based products." },
    moluscos: { label: "Molluscs", description: "Octopus, squid, zamburiñas (scallops), mussels, clams…" },
  },

  dietTags: {
    vegano: "Vegan",
    vegetariano: "Vegetarian",
    "sin-gluten": "Gluten-free",
    picante: "Spicy",
    estrella: "Signature dish",
    nuevo: "New",
  },

  features: [
    "Terrace with Cathedral views",
    "Vegan and vegetarian options",
    "Gluten-free croquetas",
    "Wine list of Galician D.O.s",
    "Craft beer",
    "Cards accepted",
  ],
  photos: {
    "terraza-catedral": {
      alt: "Terrace of Tixola Tapería on Rúa Juan de Austria with an iron skillet of raxo pork, croquetas and two glasses of white wine, and the church of Santa Eufemia in Ourense behind",
      caption: "The terrace, with Santa Eufemia behind",
    },
    "zamburinas-plancha": {
      alt: "Eight queen scallops grilled in their shells, topped with a garlic and parsley dressing, served on a white plate with a drizzle of reduction beside them",
      caption: "Grilled Galician scallops",
    },
    "tixola-raxo-croquetas": {
      alt: "Cast-iron skillet of raxo pork with Arzúa cheese, homemade croquetas and Galician white wine on the terrace of Tixola Tapería, Ourense",
      caption: "Raxo and Arzúa cheese skillet with croquetas",
    },
    fachada: {
      alt: "Front of Tixola Tapería at Rúa Juan de Austria 7 in the old town of Ourense, with its red awnings and the daily chalkboard",
      caption: "Rúa Juan de Austria, 7",
    },

    /* Photos taken at the bar on 2 October 2026 */
    "tixola-raxo": {
      alt: "Overhead view of the raxo and Arzúa pan: potatoes, marinated pork and set egg, on the table at Tixola Tapería",
      caption: "Raxo and Arzúa pan",
    },
    "tixola-chistorra": {
      alt: "Overhead view of the chistorra pan: potatoes, set egg and sliced chistorra sausage",
      caption: "Chistorra pan",
    },
    "ajada-bacalao": {
      alt: "Cod in ajada: flaked salt cod dressed with olive oil, garlic and paprika, with a boiled potato beside it, in a green ceramic bowl",
      caption: "Cod in Galician ajada",
    },
    "pulpo-feira": {
      alt: "Pulpo á feira on a wooden plate: slices of boiled octopus over potatoes, dusted with paprika and dressed with olive oil",
      caption: "Galician-style octopus",
    },
    "pimientos-padron": {
      alt: "A dish of fried Padrón peppers sprinkled with coarse salt, on a green ceramic plate on a wooden table at Tixola Tapería",
      caption: "Padrón peppers",
    },
    "queso-frito": {
      alt: "A plate of fried cheese: four breaded, golden cheese sticks on lettuce leaves, with a small bowl of shelled walnuts and another of red sauce beside them",
      caption: "Fried cheese, with walnuts and sauce",
    },
    "mejillones-tigre": {
      alt: "A plate of tiger mussels: eight stuffed, breaded and fried mussel shells, golden, on a bed of salad leaves on a green plate",
      caption: "Tiger mussels",
    },
    "postre-chocolate": {
      alt: "Chocolate dessert dusted with icing sugar and drizzled with syrup, served on a green plate with a scoop of vanilla ice cream and two of whipped cream, on a table at Tixola Tapería",
      caption: "The dessert: chocolate, ice cream and cream",
    },
    "tixola-raxo-mesa": {
      alt: "Raxo tixola with potatoes and set egg served at the table in Tixola Tapería, with the wine room and the wooden winery crates behind",
      caption: "Raxo tixola, with the wine room behind",
    },
    "tixola-chistorra-mesa": {
      alt: "Chistorra tixola with potatoes and set egg served at the table with two forks, and the dining-room wine displays behind",
      caption: "Chistorra tixola, served at the table",
    },
    "tixola-gulas-langostinos": {
      alt: "Overhead view of the pan with baby eels, mushrooms and prawns: potatoes and egg in a wooden-handled pan",
      caption: "Pan with baby eels, mushrooms and prawns",
    },
    "patatas-alioli": {
      alt: "Potatoes with alioli and parsley in a green ceramic bowl at Tixola Tapería in Ourense",
      caption: "Potatoes with alioli",
    },
    "calamares-fritos": {
      alt: "Fried squid rings over sliced potatoes, with a lemon wedge and a few salad leaves, served in an earthenware bowl on a table at Tixola Tapería",
      caption: "Fried squid",
    },
    "pulpo-tempura": {
      alt: "Tempura octopus on a bed of potatoes, with lemon and paprika sauce served on the side, in a green ceramic dish",
      caption: "Tempura octopus",
    },
    "revuelto-bacalao-grelos": {
      alt: "Overhead view of scrambled eggs with cod, turnip greens and prawns on a white plate with a drizzle of reduction",
      caption: "Scrambled eggs with cod, greens and prawns",
    },
    "ensalada-pollo-crujiente": {
      alt: "Crispy chicken salad with walnuts, apple batons, tomato and green leaves in a deep ceramic bowl",
      caption: "Crispy chicken, walnut and apple salad",
    },
    "ensalada-aguacate-bacalao": {
      alt: "Avocado and smoked cod salad with lamb's lettuce, tomato, red pepper and black olives on a white plate",
      caption: "Avocado and smoked cod salad",
    },
    "croquetas-tabla": {
      alt: "Overhead view of freshly fried homemade croquettes on a long wooden board",
      caption: "House croquettes",
    },
    "croquetas-racion": {
      alt: "A portion of homemade croquettes lined up on a long white plate on the bar's wooden table",
      caption: "A portion of croquettes",
    },
    "rotulo-noche": {
      alt: "The Tixola vinoteca-tapería sign lit up at night in the old town of Ourense",
      caption: "The sign, at night in the old town",
    },
    barra: {
      alt: "The counter at Tixola Tapería, bottles on the shelves and the deep red walls of the room",
      caption: "The counter",
    },
    "vinoteca-armarios": {
      alt: "Temperature-controlled wine cabinets at Tixola, with wooden winery crates stacked on top",
      caption: "The wine room",
    },
    "vinoteca-botellas": {
      alt: "Bottles of Galician wine and other appellations lined up on the shelves of the Tixola wine room",
      caption: "Bottles on the shelf",
    },
    "pizarra-vinos": {
      alt: "Tixola's chalkboard with the wines recommended by the glass, handwritten by appellation",
      caption: "Today's recommended wines",
    },
    "cubitera-regina": {
      alt: "A metal ice bucket with bottles chilling in the Tixola Tapería wine room",
      caption: "Chilling for the next round",
    },
  },
};
export default en;
