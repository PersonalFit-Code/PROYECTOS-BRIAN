import type { DataTranslations } from "@/i18n/data";

/**
 * English overrides for the DATA (menu, signature dishes, allergens, tags, features).
 * Dish names stay in Spanish/Galician (they are proper names and what guests will see on the
 * printed menu); descriptions explain the Galician specialities. Missing keys → Spanish.
 */
const en: DataTranslations = {
  categories: {
    sugerencias: {
      label: "Specials",
      kicker: "Today's board",
      description: "Whatever came through the door today from the fish market and the produce market.",
    },
    croquetas: {
      label: "Croquetas",
      kicker: "Homemade · 8 pcs",
      description: "Our béchamel rests for 24 hours. Crisp outside, creamy inside.",
    },
    tixolas: {
      label: "Tixolas",
      kicker: "The house speciality",
      description: "“Tixola” is Galician for frying pan: cast-iron skillets that reach the table still sizzling.",
    },
    mar: {
      label: "From the Sea",
      kicker: "Galician fish market",
      description: "Zamburiñas (small scallops), octopus, cod and squid. Produce from the rías, cooked to order.",
    },
    tierra: {
      label: "From the Land",
      kicker: "Sharing plates",
      description: "Raxo (marinated pork loin), pig's ear, Galician cheeses and the classics of Ourense tapas.",
    },
    ensaladas: {
      label: "Salads",
      kicker: "Fresh and seasonal",
      description: "Vegetables from Ourense's market gardens with a creative twist.",
    },
    postres: {
      label: "Desserts",
      kicker: "Homemade",
      description: "The sweet finish, made in-house every morning.",
    },
    vinos: {
      label: "Wines",
      kicker: "Galician wine list",
      description: "Godello, Ribeiro, Albariño and Mencía. By the glass or by the bottle.",
    },
    bebidas: {
      label: "Beers & more",
      kicker: "Craft beers and soft drinks",
      description: "Galician craft beer, perfectly poured cañas and soft drinks.",
    },
  },

  menuItems: {
    // ─── SPECIALS ──────────────────────────────────────────────────
    "sug-zamburinas-rellenas": {
      description: "Zamburiñas (small Galician scallops) from the ría stuffed with a sofrito of onion, ham and breadcrumbs, gratinated in the oven.",
      unit: "6 pcs",
      pairing: "Albariño D.O. Rías Baixas",
    },
    "sug-raxo-arzua": {
      description: "Galician-style marinated pork loin (raxo) with sliced pan-fried potatoes and melted Arzúa-Ulloa cheese.",
      unit: "skillet",
      pairing: "Mencía D.O. Ribeira Sacra",
    },
    "sug-pulpo-grelos": {
      description: "Octopus from the ría seared on the griddle over a bed of grelos (turnip greens) sautéed with garlic and La Vera smoked paprika.",
      unit: "portion",
      pairing: "Godello D.O. Valdeorras",
    },

    // ─── CROQUETAS ─────────────────────────────────────────────────
    "croq-grelo-chipiron": {
      description: "The most talked-about croquetas in Ourense: grelo (turnip greens) béchamel with baby squid in its own ink.",
      unit: "8 pcs",
      variants: ["Half (4 pcs)", "Full (8 pcs)"],
      pairing: "Ribeiro Treixadura",
    },
    "croq-jamon": {
      description: "Grandma's recipe, with hand-cut Ibérico ham.",
      unit: "8 pcs",
      variants: ["Half (4 pcs)", "Full (8 pcs)"],
    },
    "croq-cecina-cabra": {
      description: "Smoked cecina (cured beef) from León with a goat's cheese centre.",
      unit: "8 pcs",
    },
    "croq-bacalao-singluten": {
      description: "Cod croquetas coated in corn and rice flour. Suitable for coeliacs.",
      unit: "8 pcs",
    },

    // ─── TIXOLAS ───────────────────────────────────────────────────
    "tix-chistorra-huevos": {
      description: "Chargrilled chistorra (Navarran paprika sausage), broken free-range eggs and matchstick chips.",
      unit: "skillet",
      pairing: "Mencía D.O. Ribeira Sacra",
    },
    "tix-huevos-rotos-jamon": {
      description: "The classic: free-range eggs, potatoes and Ibérico ham on hot iron.",
      unit: "skillet",
    },
    "tix-raxo-queso-azul": {
      description: "Marinated pork loin (raxo), broken eggs and a Galician blue cheese cream.",
      unit: "skillet",
      pairing: "Godello D.O. Valdeorras",
    },
    "tix-gulas-setas-gambas": {
      description: "Gulas (surimi baby eels) with garlic, seasonal mushrooms, prawns and chilli.",
      unit: "skillet",
      pairing: "Albariño D.O. Rías Baixas",
    },
    "tix-vegana": {
      description: "Mushrooms, peppers, courgette and smoked tofu with paprika. 100% plant-based.",
      unit: "skillet",
      pairing: "Ribeiro Treixadura",
    },

    // ─── FROM THE SEA ──────────────────────────────────────────────
    "mar-zamburinas-plancha": {
      description: "Galician zamburiñas (small scallops) grilled with virgin olive oil, garlic and parsley. Our signature dish.",
      unit: "6 pcs",
      pairing: "Albariño D.O. Rías Baixas",
    },
    "mar-pulpo-feira": {
      description: "Galician-style octopus boiled in a copper pot, served with cachelos (boiled potatoes), paprika and olive oil. Pure tradition.",
      unit: "portion",
      pairing: "Ribeiro Treixadura",
    },
    "mar-bacalao-tempura": {
      description: "Desalted cod loins in a light, crisp tempura, with a mild roasted-garlic aioli.",
      unit: "portion",
      pairing: "Godello D.O. Valdeorras",
    },
    "mar-calamares": {
      description: "Fresh squid rings in a light Andalusian-style coating, with lemon.",
      unit: "portion",
    },
    "mar-choubas": {
      description: "Whole fried baby sardines, crisp, with coarse salt and lemon.",
      unit: "portion",
    },
    "mar-pastel-cabracho": {
      description: "Homemade scorpion fish terrine with red pepper mayonnaise and toasts.",
      unit: "portion",
    },

    // ─── FROM THE LAND ─────────────────────────────────────────────
    "tie-oreja": {
      description: "Pig's ear, boiled then seared on the griddle until crisp, with paprika and coarse salt.",
      unit: "portion",
      pairing: "Mencía D.O. Ribeira Sacra",
    },
    "tie-fingers-pollo": {
      description: "Chicken strips breaded in-house, with honey and mustard sauce.",
      unit: "portion",
    },
    "tie-raxo-patatas": {
      description: "Pork loin marinated with garlic, paprika and oregano, served with chips.",
      unit: "portion",
    },
    "tie-queso-frito": {
      description: "Breaded and fried Tetilla cheese with homemade tomato jam.",
      unit: "portion",
    },
    "tie-bravas": {
      description: "Chips with our “out of the ordinary” brava sauce and aioli.",
      unit: "portion",
    },
    "tie-padron": {
      description: "“Some are hot and some are not.” Fried in olive oil with coarse salt.",
      unit: "portion",
    },
    "tie-tabla-quesos": {
      description: "Arzúa-Ulloa, smoked San Simón da Costa and Tetilla, with quince jelly and walnuts.",
      unit: "board",
      pairing: "Godello D.O. Valdeorras",
    },
    "tie-tabla-embutidos": {
      description: "Chorizo, lacón (cured pork shoulder) and cecina with Cea bread (PGI), Ourense's wood-fired loaf.",
      unit: "board",
      pairing: "Mencía D.O. Ribeira Sacra",
    },

    // ─── SALADS ────────────────────────────────────────────────────
    "ens-pollo-crujiente": {
      description: "Mixed leaves, breaded chicken, cherry tomatoes, Parmesan and a honey-mustard vinaigrette.",
      unit: "portion",
    },
    "ens-ventresca": {
      description: "Seasonal tomato, bonito tuna belly, spring onion and extra virgin olive oil.",
      unit: "portion",
    },
    "ens-vegana-quinoa": {
      description: "Quinoa, avocado, edamame, pomegranate and sesame seeds with lime.",
      unit: "portion",
    },

    // ─── DESSERTS ──────────────────────────────────────────────────
    "pos-coulant": {
      description: "Chocolate sponge with a molten centre and vanilla ice cream.",
      unit: "each",
    },
    "pos-flan-choco-blanco": {
      description: "Homemade white chocolate crème caramel with caramel and cream.",
      unit: "each",
    },
    "pos-tarta-queso": {
      description: "Baked, with a biscuit base and a red berry coulis.",
      unit: "each",
    },
    "pos-pina": {
      description: "Fresh sliced pineapple, lime juice and mint leaves.",
      unit: "each",
    },

    // ─── WINES ─────────────────────────────────────────────────────
    "vin-godello": {
      description: "A fresh, mineral white: the house favourite with octopus and cod.",
      unit: "glass",
      variants: ["Glass", "Bottle"],
    },
    "vin-ribeiro": {
      description: "The quintessential Ourense wine: floral, light, perfect with croquetas.",
      unit: "glass",
      variants: ["Glass", "Bottle"],
    },
    "vin-albarino": {
      description: "Aromatic and saline. The natural partner for zamburiñas.",
      unit: "glass",
      variants: ["Glass", "Bottle"],
    },
    "vin-mencia": {
      description: "An Atlantic red from heroic hillside vineyards. Red fruit and freshness for the skillets.",
      unit: "glass",
      variants: ["Glass", "Bottle"],
    },

    // ─── DRINKS ────────────────────────────────────────────────────
    "beb-artesana": {
      description: "A rotating selection from Galician craft breweries. Ask what's on today.",
      unit: "330 ml",
    },
    "beb-cana": {
      description: "Perfectly poured, served with a house tapa.",
      unit: "caña",
    },
    "beb-agua": {
      description: "Still or sparkling.",
      unit: "500 ml",
    },
  },

  starDishes: {
    zamburinas: {
      kicker: "Signature dish",
      headline: "The zamburiñas that made this place famous",
      description:
        "Galician zamburiñas (small scallops) opened in their shell and seared on the griddle with extra virgin olive oil, sliced garlic and fresh parsley. Juicy, with that touch of char only hot iron can give.",
      ingredients: ["Zamburiñas from the ría", "Extra virgin olive oil", "Sliced garlic", "Fresh parsley", "Arousa sea salt", "Lemon"],
      unit: "6 pcs",
      badge: "No. 1 for zamburiñas",
      pairingWhy: "Its salinity and acidity cut through the oil and bring out the natural sweetness of the scallop.",
    },
    pulpo: {
      kicker: "Tradition",
      headline: "Octopus from Ourense, Galicia's octopus capital",
      description:
        "We serve it two ways: á feira, boiled in a copper pot with cachelos (boiled potatoes) and paprika, or seared on the griddle over grelos (turnip greens) sautéed with garlic and La Vera smoked paprika. Tender inside, charred outside.",
      ingredients: ["Octopus from the ría", "Grelos (turnip greens)", "Cachelos (boiled potatoes)", "La Vera smoked paprika", "Extra virgin olive oil", "Coarse salt"],
      unit: "portion",
      pairingWhy: "A white with body and minerality that keeps up with the texture of the octopus without overpowering it.",
    },
    bacalao: {
      kicker: "Crisp",
      headline: "Light tempura, cod in flakes",
      description:
        "Cod loins desalted in-house, wrapped in an airy, paper-thin tempura, fried to order and served with a mild roasted-garlic aioli.",
      ingredients: ["Desalted cod", "Light tempura", "Roasted-garlic aioli", "Chives", "Extra virgin olive oil"],
      unit: "portion",
      pairingWhy: "The Ourense wine: floral and light, it contrasts with the batter and refreshes every bite.",
    },
    oreja: {
      kicker: "Classic tapa",
      headline: "Crisp outside, meltingly soft inside",
      description:
        "Pig's ear slow-cooked, then seared on the griddle until crisp and finished with paprika, coarse salt and a drizzle of oil. The all-time classic tapa, made with care.",
      ingredients: ["Pig's ear", "Sweet and hot paprika", "Coarse salt", "Extra virgin olive oil", "Garlic"],
      unit: "portion",
      badge: "Gluten-free",
      pairingWhy: "A fresh, fruity Atlantic red that balances the richness of the ear.",
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
};
export default en;
