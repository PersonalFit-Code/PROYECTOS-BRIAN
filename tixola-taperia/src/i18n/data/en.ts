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
      description: "Softly scrambled and set just right, neither dry nor runny. As comforting as a stew, for anyone who would never order one.",
    },
    varios: {
      label: "Extras",
      kicker: "Dessert and bread",
      description: "The sweet finish, and what goes alongside everything else.",
    },
  },

  menuItems: {
    // ─── TOSTAS ────────────────────────────────────────────────────
    "tos-salmon-queso": {
      description: "Smoked salmon and cream cheese on toasted bread. Cold, mild and straight to the point: the one you order without thinking while the rest arrives.",
      unit: "each",
    },
    "tos-trigueros-jamon-codorniz": {
      description: "Griddled green asparagus, ham and a quail's egg on top. Two bites, and the yolk does the rest.",
      unit: "each",
    },
    "tos-cebolla-foie-cabra": {
      description: "Onion cooked down slowly until it turns sweet, foie and a medallion of goat's cheese. The most indulgent of the three.",
      unit: "each",
    },

    // ─── TIXOLAS ───────────────────────────────────────────────────
    "tix-piquillos-panceta": {
      description: "Caramelised piquillo peppers and crisp pork belly in the cast-iron pan, with eggs and chips. Sweet and salty in the same mouthful.",
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
      description: "Raxo — Galician marinated pork — under melted Arzúa-Ulloa cheese, over eggs and chips. It's the one in every photo of the bar.",
      unit: "skillet",
    },
    "tix-pisto-verduras": {
      description: "Pisto — a slow-cooked vegetable stew — with eggs and chips. The meat-free skillet, and nobody's consolation prize.",
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
      description: "A béchamel left to rest until it sets, with finely chopped ham, fried to order. Crisp outside, almost liquid inside.",
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
      description: "Mussels chopped and bound with béchamel, spooned back into their shells and breadcrumbed. The old bar-counter mouthful, made the way it should be.",
      unit: "portion",
    },
    "coc-calamares": {
      description: "Squid rings floured and fried to order. Lemon on the side and no further ceremony.",
      unit: "portion",
    },
    "coc-bacalao-tempura": {
      description: "Chunks of cod in a fine tempura, with peppers alongside. They crack when you bite and stay juicy inside.",
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
      description: "A soft Spanish omelette finished in a short mushroom stew. Eaten with bread, and nothing is left over.",
      unit: "portion",
    },
    "coc-fingers-pollo": {
      description: "Chicken strips in a corn coating, fried, with a honey and mustard sauce. The plate the children lay claim to and the one the adults end up picking at.",
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
      description: "Cubes of cheese, breaded and fried, warm and molten inside. Served with walnuts and a sauce on the side. It doesn't last long on the table.",
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
      description: "A young, mild Galician cheese from nearby. The one that sits best beside a glass of wine without overpowering it.",
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
      description: "It changes with the day and with whatever came out of the kitchen that morning. Ask our staff: there's always something homemade.",
      unit: "portion",
    },
    "var-postre-sin-gluten": {
      description: "The sweet option made without gluten, so nobody has to miss out on dessert. Ask what we have today.",
      unit: "portion",
    },
    "var-pan": {
      description: "The day's bread in its basket, for mopping up whatever is left in the pan.",
      unit: "basket",
    },
    "var-pan-tomate": {
      description: "Toasted bread rubbed with tomato and olive oil. It disappears on its own while the rest arrives.",
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
      badge: "The dish we are known for",
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
      pairingWhy: "A light, fresh red that stands up to the melted cheese without masking the marinade on the pork.",
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
    pulpo: {
      kicker: "Two schools, one octopus",
      headline: "Á feira over cachelos, or seared on the griddle",
      description:
        "Octopus boiled to the right point and served however you like it: á feira, on the usual wooden plate, with cachelos (boiled potatoes), paprika and a drizzle of olive oil; or seared on the griddle. The same octopus, two ways of understanding it.",
      ingredients: ["Octopus", "Cachelos (boiled potatoes)", "Paprika", "Extra virgin olive oil", "Coarse salt"],
      unit: "portion",
      pairingWhy: "The classic tavern white: fresh and unoaked, it stands up to the paprika instead of fighting it.",
    },
    "tixola-gulas": {
      kicker: "Straight from the pan",
      headline: "The most loaded tixola in the house",
      description:
        "Gulas (baby-eel look-alikes), sautéed mushrooms and king prawns over eggs and chips, cooked in the same iron skillet they are served in. The most complete of the tixolas.",
      ingredients: ["Gulas (baby-eel look-alikes)", "Sautéed mushrooms", "King prawns", "Eggs", "Potatoes", "Extra virgin olive oil"],
      unit: "skillet",
      pairingWhy: "Rich egg and sweet prawn: it calls for a white with body and acidity, not a light one.",
    },
    cecina: {
      kicker: "Cured and cold",
      headline: "The ice cream melts over the cured beef",
      description:
        "Slices of cecina (air-dried beef) arranged in a crown over lettuce and endive, with tomato wedges, apple and walnuts, and a quenelle of sheep's cheese ice cream in the middle that slowly melts over it. The most striking plate on the menu.",
      ingredients: ["Cecina (air-dried beef)", "Sheep's cheese ice cream", "Lettuce and endive", "Tomato", "Apple", "Walnuts"],
      unit: "portion",
      pairingWhy: "A light red served slightly chilled: it goes with the cured beef without burying the cheese ice cream.",
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
    "Vegetarian options",
    "Gluten-free croquetas",
    "Galician D.O. wines",
    "Craft beer",
    "Cards accepted",
  ],
  photos: {
    "terraza-catedral": {
      alt: "Terrace of Tixola Tapería on Rúa Juan de Austria with an iron pan of raxo pork, croquetas and two glasses of white wine, and the church of Santa Eufemia in Ourense behind",
      caption: "The terrace, with Santa Eufemia behind",
    },
    "zamburinas-plancha": {
      alt: "Eight zamburiñas (small scallops) seared in their shells, topped with an ajada of garlic and parsley, served on a white plate with a drizzle of reduction beside them",
      caption: "Zamburiñas seared on the griddle",
    },
    "tixola-raxo-croquetas": {
      alt: "Cast-iron pan of raxo pork with Arzúa cheese, homemade croquetas and Galician white wine on the terrace of Tixola Tapería, Ourense",
      caption: "Raxo and Arzúa tixola, with croquetas",
    },

    /* Photos taken at the bar on 2 October 2026 */
    "tixola-raxo": {
      alt: "Overhead view of the raxo and Arzúa pan: potatoes, marinated pork and set egg, on the table at Tixola Tapería",
      caption: "Raxo and Arzúa tixola",
    },
    "tixola-chistorra": {
      alt: "Overhead view of the chistorra pan: potatoes, set egg and sliced chistorra sausage",
      caption: "Chistorra tixola",
    },
    "ensalada-gulas-langostinos": {
      alt: "Salad with gulas, mushrooms and king prawns: lettuce leaves and tomato slices topped with gulas (baby-eel look-alikes), sautéed mushrooms and king prawns, in an earthenware bowl",
      caption: "Gulas, mushroom and king prawn salad",
    },
    "ajada-bacalao": {
      alt: "Cod in ajada: flaked cod dressed with olive oil, garlic and paprika, with a boiled potato beside it, in a green ceramic bowl",
      caption: "Cod in Galician ajada",
    },
    "pulpo-feira": {
      alt: "Pulpo á feira on a wooden plate: slices of boiled octopus over potatoes, dusted with paprika and dressed with olive oil",
      caption: "Pulpo á feira",
    },
    "pimientos-padron": {
      alt: "A dish of fried Padrón peppers sprinkled with coarse salt, on a green ceramic plate on a wooden table at Tixola Tapería",
      caption: "Padrón peppers",
    },
    "queso-frito": {
      alt: "A plate of fried cheese: four breaded, golden cheese cubes on lettuce leaves, with a small bowl of shelled walnuts and another of red sauce beside them",
      caption: "Fried cheese, with walnuts and sauce",
    },
    "mejillones-tigre": {
      alt: "A plate of mejillones tigre: eight stuffed, breaded and fried mussel shells, golden, on a bed of salad leaves on a green plate",
      caption: "Mejillones tigre (stuffed mussels)",
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
      alt: "Overhead view of the tixola with gulas, mushrooms and king prawns: potatoes and egg in a wooden-handled pan",
      caption: "Tixola with gulas, mushrooms and king prawns",
    },
    "patatas-alioli": {
      alt: "A portion of chips with aioli and parsley in a green ceramic bowl at Tixola Tapería in Ourense",
      caption: "Chips with aioli",
    },
    "calamares-fritos": {
      alt: "Fried squid rings over sliced potatoes, with a lemon wedge and a few salad leaves, served in an earthenware bowl on a table at Tixola Tapería",
      caption: "Fried squid",
    },
    "bacalao-tempura": {
      alt: "Tempura cod, golden and crisp, on a bed of sliced potatoes, with a small jug of red sauce beside it, in a green ceramic dish",
      caption: "Tempura cod",
    },
    "revuelto-bacalao-grelos": {
      alt: "Overhead view of scrambled eggs with cod, turnip greens and king prawns on a white plate with a drizzle of reduction",
      caption: "Scrambled eggs with cod, greens and king prawns",
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
      alt: "Overhead view of freshly fried homemade croquetas on a long wooden board",
      caption: "House croquetas",
    },
    "croquetas-racion": {
      alt: "A portion of homemade croquetas lined up on a long white plate on the bar's wooden table",
      caption: "A portion of croquetas",
    },
    "timbal-vegetal": {
      alt: "Tixola Tapería's vegetable timbale: aubergine, courgette and roasted pepper layered on a potato base, topped with griddled mushrooms, with salad and dots of red sauce around the plate",
      caption: "Vegetable timbale, with the wine room behind",
    },
    "tortilla-sarten": {
      alt: "A soft Spanish omelette served in the pan it was cooked in, on a ceramic plate on the wooden table at Tixola Tapería, with the wine bar's wall of bottles blurred behind",
      caption: "The tortilla, in its pan",
    },
    "oreja-plancha": {
      alt: "Strips of pig's ear seared on the griddle, golden and crisp at the edges, on a green ceramic oval platter, with a ball of pale purée alongside, on the wooden table at Tixola Tapería",
      caption: "Griddled pig's ear",
    },
    "fingers-pollo": {
      alt: "Breaded, fried chicken strips on lettuce leaves, each topped with a griddled peach wedge, and a bowl of white parsley sauce, on a green ceramic oval platter on the wooden table at Tixola Tapería",
      caption: "Chicken strips",
    },
    "tosta-salmon-queso": {
      alt: "Tixola Tapería's salmon and cheese toast: two slices of toasted rustic bread spread with cream cheese and topped with smoked salmon, drizzled with a dark sauce, with salad leaves alongside, on a green ceramic oval platter on the wooden table",
      caption: "Salmon and cheese toast",
    },
    "ensalada-cecina": {
      alt: "Tixola Tapería's cecina salad: slices of cured beef arranged in a ring over lettuce and endive, with tomato wedges, sliced apple and walnuts, and a quenelle of sheep's cheese ice cream in the middle, in a deep ceramic bowl on the wooden table",
      caption: "Cecina salad with sheep's cheese ice cream",
    },
    "fachada-calle": {
      alt: "The front of Tixola Tapería on Rúa Juan de Austria in Ourense, with its two burgundy signs showing a frying pan, the awnings and two high tables with stools on the cobbled street",
      caption: "The front, in the old town",
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
      alt: "Tixola's chalkboard with the wines recommended by the glass, handwritten and grouped by appellation",
      caption: "Today's recommended wines",
    },
    "cubitera-regina": {
      alt: "A metal ice bucket with bottles chilling in the Tixola Tapería wine room",
      caption: "Chilling for the next round",
    },
  },
  /* ── Wine sheets: the prose (tasting note, story, terroir, winemaking, ageing) ── */
  wines: {
    "pazo-baion": {
      notes: "Straw yellow with greenish highlights and an intense varietal perfume: white flowers and citrus over a background of apple and pear. Fresh, balanced and mineral on the palate, with a markedly aromatic finish.",
      story: "Made only from grapes harvested on the estate itself, following the single-estate vino de pago concept.",
      terroir: "A 22-hectare Albariño estate, full of microclimates, in the heart of the Salnés Valley",
      subzone: "Salnés Valley",
    },
    "eduardo-pena": {
      notes: "Pale yellow with golden highlights. A complex nose of lemon, orange blossom, pineapple and peach with a balsamic undertone; rich, unctuous, savoury and very long on the palate.",
      story: "The winery is half buried in the vineyard hillside, which keeps the interior at 14-15 °C with no mechanical help.",
      terroir: "More than 10 hectares at Castrelo de Miño, at 250 metres, on a gentle slope down towards the reservoir, on sandy soil of slate and stone",
      winemaking: "Maceration of the varieties, work on the lees and fermentation in 300-litre European oak barrels, with no malolactic fermentation",
    },
    "lagar-do-merens": {
      notes: "Pale yellow with green highlights. A complex, terpenic nose of pear, apple and peach over floral and balsamic notes; broad, enveloping and very long on the palate.",
      story: "A colleiteiro winery founded in 2001 at A Arnoia: an old stone-and-timber lagar, restored, with 3.5 hectares of native Ribeiro varieties.",
      terroir: "Granitic sandy-loam soils on hillsides worked in socalcos terraces, at A Arnoia",
      winemaking: "Maceration in a pneumatic press with dry ice and fermentation at 17.5 °C for 21 days in stainless steel",
      ageing: "8 months on the fine lees",
    },
    "cunas-davia": {
      notes: "A clean nose with a certain complexity: apple, quince and melon with floral and fresh-grass notes. Savoury and broad on the palate, with citrus and just the right acidity, and a long, unctuous finish.",
      ageing: "6 months on the lees",
    },
    "algueira": {
      story: "A family winery in Doade (Sober), on the terraces of the Sil, with 14 hectares of native varieties vinified plot by plot.",
    },
    "vel-uveyra": {
      story: "“Ronsel” is the wake a boat leaves behind as it sails: that is the name of the Parada de Sil winery behind this wine.",
      terroir: "Vineyard in the canyons of the Sil, at Parada de Sil, on granite and schist",
    },
    "la-lama": {
      story: "A winery in Langullo (Manzaneda), with 32 hectares in Quiroga-Bibei; they describe their wines as Atlantic, terroir-driven and built to keep.",
      terroir: "Steeply sloping terraces on slate and clay",
      winemaking: "Hand harvesting and fermentation with native yeasts in large open wooden vats",
      ageing: "20 months in neutral barrels",
    },
    "a-moucha": {
      terroir: "Mountain terraces in the Bibei valley, with vines between 15 and 100 years old on slate, schist and granite",
      ageing: "4 months fermenting in French oak barrels and a minimum of 24 months in a 5,000-litre cask",
    },
    "la-lume": {
      winemaking: "Fermentation with native yeasts in 600-litre barrels, foudre and concrete egg, with no malolactic fermentation",
      ageing: "Ageing on the fine lees in the vessel it fermented in: foudre, barrel and concrete",
    },
    "guitian": {
      notes: "Golden yellow with greenish tones, with peach and grapefruit, a touch of fennel and a white-flower finish. Powerful and fresh on the palate, with great length.",
      story: "The Godello at the A Tapada estate was planted in 1985 from an old pre-phylloxera clone, at the eastern edge of Valdeorras, at the foot of the Peñas Marías.",
      terroir: "Vineyard at the A Tapada estate at around 500 metres, on a south-facing slope over Ordovician slate with a silty-clay texture",
      winemaking: "Harvested into crates, cold pre-fermentation maceration, low-pressure pneumatic pressing, cold static settling and fermentation in stainless steel at 16-18 ºC",
      ageing: "Unfiltered on its fine lees until bottling, and at least 2 months in bottle at the winery",
    },
    "guitian-sobre-lias": {
      notes: "Golden yellow with greenish tones, with dried peach and orange peel, fennel and white flowers on the finish. Very powerful and fresh on the palate, with great persistence.",
      story: "It was the first Spanish wine aged on the lees in tank with weekly stirring for four to six months: this winery led the way in lees work in Spain.",
      terroir: "Vineyard at the A Tapada estate at around 500 metres, on a south-facing slope over Ordovician slate with a silty-clay texture",
      winemaking: "Harvested into crates, cold pre-fermentation maceration, low-pressure pneumatic pressing, cold static settling and fermentation in stainless steel at 16-18 ºC",
      ageing: "4 to 6 months on the lees in tank, with weekly stirring, and at least 2 months in bottle",
    },
    "pajaro-loco": {
      notes: "Straw yellow with greenish notes, medium to high in intensity, herbaceous and with white-fleshed fruit. Mouth-filling and fresh on the palate, with a long aftertaste and citrus coming back through the nose.",
      winemaking: "Cold maceration, gentle pressing with the free-run juice drawn off and two weeks of fermentation at low temperature in stainless steel with natural yeasts; bottled unfiltered",
    },
    "crego-e-monaguillo-blanco": {
      notes: "Straw yellow with golden highlights, citrussy, fruity and floral, with a hint of fennel flower. Fresh, elegant and slightly rich on the palate, with well-integrated acidity.",
      story: "A family winery in A Salgueira (Monterrei) with more than fifty years behind it, working a hundred hectares of Godello and Mencía by hand.",
      terroir: "Granite soils of light gravel in the Támega valley",
      winemaking: "Cold maceration of the Treixadura, pneumatic pressing and settling by cold decantation; fermentation in stainless steel at 17 ºC",
    },
    "crego-e-monaguillo-tinto": {
      notes: "Medium-depth garnet with a violet rim, very fruity: blackberry, strawberry, blueberry and blackcurrant over a base of cocoa. Silky and velvety on the palate, with sweet tannins and red fruit and spice coming back through the nose.",
      story: "A family winery in A Salgueira (Monterrei) with more than fifty years behind it, working a hundred hectares of Godello and Mencía by hand.",
      terroir: "Granite soils of light gravel in the Támega valley",
      winemaking: "Destemmed and very gently crushed, almost whole berries; fermentation and maceration in steel at 22 ºC, light micro-oxygenation before the malolactic and resting in steel until bottling",
    },
    "vx-cuvee-caco": {
      notes: "The winery describes it as power, ripeness and elegance, and exquisitely fresh. It ages slowly in bottle.",
      story: "Caco is short for Ricardo, the founder of Coto de Gomariz, who recovered plots and planted a good part of the new vines. It is only made in exceptional vintages, around 2,500 bottles.",
      terroir: "The A Ferreira and A Canceliña estates, the winery's old experimental red-wine vineyard",
      ageing: "20 months in new French and American oak barrels",
    },
    "carmelo-rodero-9-meses": {
      notes: "A powerful nose, with cherry and blueberry well to the fore. Fresh and balanced on the palate, broad in texture and with a finish that invites you to keep going.",
      terroir: "Vines 30 to 35 years old between 837 and 862 metres, on silty, stony soils",
      winemaking: "Hand harvesting with selection in the vineyard and gravity-fed vinification",
      ageing: "9 months in new 225-litre French oak barrels",
    },
    "arzuaga-crianza": {
      notes: "Cherry red with violet hints. A powerful nose of ripe red fruit, spice and balsamic notes with a roasted finish; plenty of volume on the palate, smooth and honeyed, with great length.",
      story: "It is the flagship of the house, mostly Tempranillo from their own vineyards at Finca La Planta and from their highest plots in Olivares de Duero.",
      terroir: "Vineyard above 900 metres on clay-limestone soil, with the limestone bedrock a metre below the surface",
      winemaking: "Harvested into 15 kg crates, optical sorting table berry by berry, gravity filling of the vats and several days of pre-fermentation maceration",
      ageing: "16 months in barrel, 70% French oak and 30% American, where it also went through the malolactic",
      subzone: "Finca La Planta and the Olivares de Duero plateau",
    },
    "tomas-postigo-3-ano": {
      notes: "Cherry red with purple glints, clean and intense, with ripe red and black berries over fine oak, spice and liquorice. Silky on the palate, with very good acidity and good structure.",
      terroir: "Selected vines between 750 and 1,010 metres in altitude",
      winemaking: "Hand harvesting into ten-kilo crates with a sorting table; the grapes move by gravity without pumps and it is fined with egg white",
      ageing: "12 months in 225-litre French oak barrels from different forests",
    },
    "quinta-sardonia": {
      story: "The Terras Gauda group's winery in Sardón de Duero, working biodynamically in search of the balance between soil, climate, vine and surroundings.",
    },
    "malabrigo": {
      notes: "Cherry red with a garnet rim, clean and deep, with a very intense, elegant nose of black fruit and spice well knit into the oak. Intense and full on the palate, with a long finish.",
      story: "Malabrigo is the name of the plot: there is no shelter there from the Castilian climate, and those extreme conditions give the wine breed and finesse.",
      terroir: "The Malabrigo plot, between 850 and 900 metres, on sandy-clay soil and with a wide swing in temperature between day and night",
      winemaking: "Alcoholic fermentation in temperature-controlled stainless steel and a 30-day malolactic in French oak barrels",
      ageing: "Ageing in French oak barrels",
    },
    "dehesa-de-los-canonigos": {
      story: "One of the great historic estates of the Ribera del Duero: it takes its name from the chapter of Valladolid cathedral, twenty-two canon monks. Today it is run by five generations of the same family.",
      terroir: "A historic estate on the banks of the Duero, with separate vinifications by plot, soil type and variety",
    },
    "baigorri": {
      notes: "Deep cherry red, with freshly picked black fruit and spice. Elegant, silky and fruity on the palate, with good freshness and a long finish.",
      story: "Baigorri makes the case for Rioja crianza against industrial production: sustainable viticulture, hand work and bottling without fining or filtration.",
      terroir: "Plots in Samaniego, Laguardia and Leza, on clay-limestone soil at 600 metres and mostly bush-trained",
      winemaking: "Hand harvesting with berry selection, long macerations with indigenous yeasts, extraction by gravity and bottling without filtration",
      ageing: "14 months in French and American oak barrels",
    },
    "luis-canas": {
      notes: "Morello cherry red, with infused red fruit — strawberry, raspberry, redcurrant — subtle spice and a lactic undertone. A sweet, enveloping entry, plenty of freshness and a rounded finish.",
      story: "A wine shaped by the terroir of Villabuena de Álava; the winery certifies the origin of the fruit with the DOCa Rioja's Vino de Zona seal.",
      terroir: "Villabuena de Álava and its surroundings, between 450 and 650 metres, on clay-limestone and sandy soils with vines averaging 35 years",
      winemaking: "Hand harvesting with a double sorting table, by bunch and by berry, and vinification in stainless steel",
      ageing: "12 months in used French (60%) and American (40%) oak barrels",
    },
    "marques-de-murrieta": {
      notes: "Ripe red fruit and liquorice in harmony with notes of chocolate liqueur. Balanced, fleshy and round on the palate, with gentle acidity and a long finish.",
      story: "It sums up the character of Finca Ygay and everything that happens there over a whole cycle of the vine.",
      terroir: "Finca Ygay: 300 estate-owned hectares around the winery, clay-limestone soil between 320 and 485 metres",
      winemaking: "Separate fermentation by variety in stainless steel, 8 to 10 days on the skins and slow pressing in a vertical press",
      ageing: "25 months in 225-litre American oak barrels",
    },
    "malpuesto": {
      notes: "Bright, intense cherry, with ripe black and wild fruit. Structured and broad, with a creamy, earthy touch, very fleshy and with a persistent finish.",
      story: "Orben is the old-vine micro-plot project in the high ground of Rioja Alavesa, around Laguardia.",
      terroir: "A single old vineyard of 1.68 hectares, bush-trained and planted around 1931, on a slope at 520 metres, on very poor, shallow sandy soil",
      winemaking: "Hand harvesting into 15 kg crates, destemmed without crushing, fermentation in open stainless steel and malolactic in large barrels and clay amphorae",
      ageing: "12 months in 500-litre fine-grain French oak barrels",
    },
    "macan-clasico": {
      notes: "The more approachable and expressive of the two: an easy drink, a marked character of the land it comes from and a simplicity that makes it very appealing.",
      story: "Macán and Macán Clásico are Rothschild and Vega Sicilia's joint vision of Rioja, living side by side as first and second wine in the Bordeaux manner.",
      terroir: "100 hectares of vineyard averaging 30 years in the Sonsierra, at 483 metres, with a yield of 4,300 kg per hectare",
      winemaking: "Malolactic split between barrel and tank, and ageing in fine-grain French oak, most of it in new barrels",
      ageing: "12 months in barrel and 18 months in bottle",
    },
    "macan-etiqueta-dorada": {
      notes: "More closed than its younger brother: time will be what shapes its elegance, wrapped in velvety tannins and great minerality.",
      story: "It was born in 2009 from the meeting of the Rothschild and Álvarez families in Rioja's Sonsierra, and it is the project's first wine.",
      terroir: "100 hectares of vineyard averaging 40 years in the Sonsierra, at 500 metres, with a yield of 4,000 kg per hectare",
      winemaking: "Malolactic split between barrel and tank, and ageing in fine-grain French oak, most of it in new barrels",
      ageing: "16 months in barrel and foudre and 28 months in bottle",
    },
    "banzao": {
      story: "A “banzao” is the wood-and-stone weir that raised the water level for the irrigation channels, rebuilt every year. The project began in 2017 with the lease of three hectares of abandoned old vineyard, to stop it disappearing.",
      terroir: "18 plots across 8 sites in San Pedro de Olleros, at 750 metres in the Ancares valley, bush-trained and planted in a quincunx, with the original mix of varieties",
    },
    "enate": {
      notes: "Very deep morello cherry red, with an intense, complex nose, smoky and spiced over ripe red fruit. Dense and fleshy on the palate, with an extraordinarily long finish.",
      story: "The label is an original painting the artist Víctor Mira made for the winery.",
      winemaking: "The two varieties ferment separately at 26 ºC in stainless steel and then go through the malolactic",
      ageing: "9 months in French and American oak barrels, with a final refining in stainless steel",
    },
    "quinta-do-escudial": {
      notes: "Ruby with violet tones, showing ripe blueberry, cherry and black plum over a touch of blackcurrant and pepper. Persistent and elegant on the palate, with fine, silky tannins.",
      story: "The winery describes itself as a specialist in “unoaked” wines: this Reserva sees no barrel and is refined in steel.",
      winemaking: "Hand-harvested with rigorous selection and fermented separately by variety, with minimalist winemaking",
      ageing: "Around 48 months in stainless steel tank, never seeing a barrel",
    },
    "quinta-das-bagueiras": {
      notes: "Baga and Touriga Nacional come together in harmony: wild berries, spice and fresh grass. Juicy, expressive, long and full of life.",
      story: "They make classic wines using very traditional practices, handed down from generation to generation, and with minimalist winemaking.",
      winemaking: "Ferments for 5 to 8 days in lagar without destemming, punched down by hand with a wooden plunger several times a day",
      ageing: "Around 18 months in the same old wooden casks where the fermentation finishes; bottled unfined and unfiltered",
    },
    "piaugier-sablet": {
      notes: "Fresh red fruit on the nose, with cherry and raspberry. Soft and harmonious on the palate, the fine tannins already resolved, with an elegant, persistent finish.",
      story: "A family estate at the foot of the Dentelles de Montmirail: Jean-Marc and Sophie took over in 1985, and today their daughter Maude works alongside them.",
      terroir: "Plots of sandy terroir in Sablet, on sandy-silty scree that drains very well, with vines 35 to 45 years old",
      winemaking: "Hand-harvested and vinified separately in the concrete tanks built in 1947 by the family's great-grandfather, with a two- to three-week maceration",
      ageing: "Around 18 months in concrete tank, after blending",
    },
    "terrazas-de-los-andes": {
      story: "Mountain wines from the high-altitude terroirs of Mendoza, at the foot of the Andes.",
    },
    "abbotsdale": {
      notes: "Ruby, with violets and red and black fruit: cherry, plum, blackcurrant and blackberry. Medium-bodied, with soft tannins and a long finish.",
      story: "The vineyards are chosen by Bryan MacRobert, who grew up on a farm near the village of Abbotsdale, in Swartland.",
      terroir: "Bush vines, dry-farmed and low-yielding, on sandy soil of decomposed granite; hand-picked in the early hours",
      winemaking: "Grape selection before the tank, with a portion of whole bunches for freshness and a gentle extraction",
      ageing: "In large old wooden casks, to round out and stabilise the wine",
    },
  },
};
export default en;
