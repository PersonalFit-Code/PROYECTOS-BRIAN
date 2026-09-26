/**
 * Motor de respuestas SIN modelo: detección determinista de intención sobre texto normalizado
 * (NFD sin diacríticos, minúsculas) y respuestas construidas con las plantillas de
 * `m.chat.offline.*` y los datos localizados de la carta.
 *
 * Se usa cuando no hay `ANTHROPIC_API_KEY` (modo `offline`) o cuando el modelo falla (modo `fallback`).
 * Es puro (sin acceso a red ni a Node) y sincrónico, así que también podría ejecutarse en el cliente.
 */
import type { AllergenId } from "@/data/allergens";
import { BUSINESS } from "@/data/business";
import { formatPrice, type DietTag, type MenuCategoryId, type MenuItem } from "@/data/menu";
import type { StarDish } from "@/data/dishes";
import { localePath, type Locale } from "@/i18n/config";
import { localizeAllergenMap, localizeCategories, localizeDietTags, localizeMenuItems, localizeStarDishes } from "@/i18n/data";
import { format } from "@/i18n/getMessages";
import es from "@/i18n/messages/es";
import gl from "@/i18n/messages/gl";
import en from "@/i18n/messages/en";
import pt from "@/i18n/messages/pt";
import { deepMerge, type Messages } from "@/i18n/types";
import { getOpenStatus } from "@/lib/openStatus";
import { describeOpenStatus, hoursLines } from "./knowledge";
import { turnText, type WaiterPage, type WaiterTurn } from "./types";

/* ────────────────────────────────────────────────────────────
   Mensajes sincrónicos por idioma (los ficheros secundarios son parciales y caen al español)
   ──────────────────────────────────────────────────────────── */
const messagesCache = new Map<Locale, Messages>();

function getMessagesSync(locale: Locale): Messages {
  const cached = messagesCache.get(locale);
  if (cached) return cached;
  const merged: Messages = locale === "es" ? es : deepMerge(es, { gl, en, pt }[locale]);
  messagesCache.set(locale, merged);
  return merged;
}

/* ────────────────────────────────────────────────────────────
   Normalización y palabras clave
   ──────────────────────────────────────────────────────────── */

/** NFD sin diacríticos, minúsculas, solo letras/números/espacios: "Zamburiñas, ¿sin gluten?" → "zamburinas sin gluten". */
export function normalizeText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Compila una lista de palabras clave en una expresión regular sobre texto normalizado.
 * "reserv*" = prefijo de palabra (reserva, reservar, reservation…); "mesa" = palabra completa.
 */
function compile(words: readonly string[]): RegExp {
  const alternatives = words.map((word) => {
    const prefix = word.endsWith("*");
    const base = escapeRegExp(normalizeText(prefix ? word.slice(0, -1) : word));
    return prefix ? base : `${base}\\b`;
  });
  return new RegExp(`\\b(?:${alternatives.join("|")})`, "u");
}

const KW = {
  greeting: compile([
    "hola", "buenas", "buenos dias", "buenas tardes", "buenas noches", "hello", "hi", "hey", "ola", "boas", "bo dia",
    "bom dia", "boa tarde", "boa noite", "good morning", "good afternoon", "good evening", "saludos",
  ]),
  thanks: compile(["gracias", "grazas", "thank*", "obrigad*", "perfecto", "genial", "estupendo"]),
  booking: compile(["reserv*", "book*", "mesa", "table", "reservation*"]),
  hours: compile([
    "hora*", "horario*", "abr*", "abiert*", "cerra*", "cierr*", "open*", "clos*", "hours", "schedule", "abert*", "pech*",
    "fech*", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado*", "domingo*", "monday*", "tuesday*",
    "wednesday*", "thursday*", "friday*", "saturday*", "sunday*", "luns", "mercores", "xoves", "venres", "segunda feira",
    "terca feira", "quarta feira", "quinta feira", "sexta feira", "fin de semana", "weekend*", "festivo*",
  ]),
  location: compile([
    "donde", "direccion", "lleg*", "ubicacion", "ubicad*", "situad*", "mapa", "aparc*", "parking", "como voy", "where",
    "address", "direction*", "location", "located", "map", "onde", "enderezo", "morada", "cheg*", "localiza*",
    "cerca de", "catedral", "terraza", "terrace", "esplanada",
  ]),
  /** contexto de exclusión: "sin gluten", "no lleva lactosa", "alergia", "celíaco"… */
  exclusion: compile([
    "sin", "no lleva*", "no lleve*", "no tenga*", "no conten*", "libre*", "free", "without", "alerg*", "intoleran*",
    "celiac*", "apt*", "suitable", "sen", "sem", "no puedo", "cannot", "can t", "evitar", "avoid",
  ]),
  pairing: compile([
    "marida*", "va con", "van con", "va bien con", "vai ben con", "vai bem com", "acompan*", "que bebo", "beber",
    "pair*", "goes with", "go with", "drink with", "que vino", "que vinho", "which wine", "what wine",
    "vino para", "vino con", "vinho com", "vinho para", "harmoniz*", "combina*", "match*",
  ]),
  drink: compile(["vino*", "wine*", "beb*", "drink*", "copa*", "vinho*", "vino"]),
  recommend: compile([
    "recomiend*", "recommend*", "recomend*", "compartir", "share", "sharing", "estrella*", "mejor*", "best", "popular*",
    "famos*", "tipic*", "typical", "que pido", "que pedir", "what should", "must try", "imprescindible*", "top",
    "especialidad*", "specialit*", "signature", "sugier*", "suggest*", "destaca*", "para dos", "para cuatro", "grupo",
  ]),
  prices: compile([
    "precio*", "cuanto", "cuesta*", "vale", "valen", "caro", "barato", "price*", "cost*", "how much", "prezo*", "preco*",
    "euros", "pagar", "tarjeta", "card", "cash", "efectivo", "bizum",
  ]),
} as const;

/** Sinónimos de cada alérgeno (español, gallego, inglés y portugués). */
const ALLERGEN_WORDS: Record<AllergenId, readonly string[]> = {
  /* "glute" es la forma gallega; sin ella la primera pregunta sugerida en GL caía en el fallback. */
  gluten: ["gluten", "glute", "celiac*", "celíac*", "trigo", "wheat", "harina"],
  lacteos: ["lacteo*", "lactosa", "lactose", "leche", "dairy", "milk", "lacticinio*", "leite"],
  huevos: ["huevo*", "egg*", "ovo", "ovos"],
  pescado: ["pescado*", "fish", "peixe"],
  crustaceos: ["crustaceo*", "marisco*", "gamba*", "langostino*", "shellfish", "shrimp*", "prawn*", "crustace*"],
  moluscos: ["molusco*", "mollusc*", "mollusk*", "molusc*", "marisco*"],
  "frutos-cascara": ["frutos secos", "fruto seco", "nuez", "nueces", "almendra*", "avellana*", "nuts", "nut", "froitos secos", "frutos de casca"],
  cacahuetes: ["cacahuet*", "peanut*", "mani", "amendoim"],
  /* Sin "soy" suelto: en español es el verbo ("Soy celíaco", "Soy vegano") y \bsoy\b disparaba
     una exclusión de soja en cualquier frase que empezara así. Del inglés queda "soy sauce"/"soybean". */
  soja: ["soja", "soya", "soy sauce", "soybean*", "soja sauce"],
  sesamo: ["sesamo", "sesame", "gergelim"],
  mostaza: ["mostaza", "mustard", "mostarda"],
  sulfitos: ["sulfito*", "sulfite*", "sulphite*"],
  apio: ["apio", "celery", "aipo"],
  altramuces: ["altramuz", "altramuces", "lupin*", "tremoc*"],
};

/** Alérgenos que la gente quiere EVITAR aunque no use "sin": "¿gluten?" significa "¿qué no lleva gluten?". */
const AVOIDED_ALLERGENS: ReadonlySet<AllergenId> = new Set<AllergenId>([
  "gluten", "lacteos", "huevos", "soja", "sesamo", "mostaza", "sulfitos", "apio", "altramuces", "cacahuetes", "frutos-cascara",
]);

const ALLERGEN_REGEX = (Object.keys(ALLERGEN_WORDS) as AllergenId[]).map((id) => ({ id, re: compile(ALLERGEN_WORDS[id]) }));

const DIET_WORDS: Partial<Record<DietTag, readonly string[]>> = {
  vegano: ["vegan*"],
  vegetariano: ["vegetarian*", "veggie", "vexetarian*"],
  picante: ["picante*", "spicy", "pica"],
};
const DIET_REGEX = (Object.keys(DIET_WORDS) as DietTag[]).map((tag) => ({ tag, re: compile(DIET_WORDS[tag] ?? []) }));

const CATEGORY_WORDS: Record<MenuCategoryId, readonly string[]> = {
  sugerencias: ["sugerencia*", "pizarra", "del dia", "especial*", "novedad*", "specials", "suggestion*", "recomendacion*"],
  croquetas: ["croqueta*", "croquette*"],
  tixolas: ["tixola*", "sarten*", "skillet*"],
  mar: ["del mar", "mar", "pescado*", "marisco*", "seafood", "peixe", "sea"],
  tierra: ["tierra", "carne*", "meat", "racion", "raciones", "embutido*", "queso*", "cheese*", "tapa", "tapas"],
  ensaladas: ["ensalada*", "salad*", "ensaladas"],
  postres: ["postre*", "dulce*", "dessert*", "sobremesa*", "tarta*", "sweet*"],
  vinos: ["vino*", "wine*", "vinho*", "vinoteca", "godello", "albarino", "ribeiro", "mencia", "treixadura"],
  bebidas: ["cerveza*", "beer*", "cana", "canas", "refresco*", "agua", "water", "bebida*", "drink*", "cervexa*", "cerveja*", "artesan*"],
};
const CATEGORY_ORDER: readonly MenuCategoryId[] = ["croquetas", "tixolas", "mar", "tierra", "ensaladas", "postres", "vinos", "bebidas", "sugerencias"];
const CATEGORY_REGEX = CATEGORY_ORDER.map((id) => ({ id, re: compile(CATEGORY_WORDS[id]) }));

/** Categorías de comida (para listados dietéticos, recomendaciones y precios). */
const FOOD_CATEGORIES: ReadonlySet<MenuCategoryId> = new Set<MenuCategoryId>([
  "sugerencias", "croquetas", "tixolas", "mar", "tierra", "ensaladas", "postres",
]);

/** Vino por defecto por categoría cuando el plato no tiene maridaje propio. */
const DEFAULT_PAIRING: Partial<Record<MenuCategoryId, string>> = {
  sugerencias: "vin-albarino",
  croquetas: "vin-ribeiro",
  tixolas: "vin-mencia",
  mar: "vin-albarino",
  tierra: "vin-mencia",
  ensaladas: "vin-ribeiro",
};

/** Palabras genéricas que no identifican un plato concreto. */
const DISH_STOPWORDS = new Set(
  [
    "tixola", "tixolas", "croqueta", "croquetas", "ensalada", "tabla", "plancha", "casero", "casera", "caseros",
    "gallega", "gallego", "gallegos", "natural", "rellenas", "fritas", "frito", "rotos", "vegana", "vegano", "queso",
    "quesos", "estrella", "blanco", "tinto", "mineral", "andaluza", "feira", "artesana",
  ].map(normalizeText),
);

const ALLERGEN_STOPWORDS = new Set(
  Object.values(ALLERGEN_WORDS)
    .flat()
    .map((w) => normalizeText(w.endsWith("*") ? w.slice(0, -1) : w)),
);

/** "zamburinas" → "zamburina", "calamares" → "calamar": raíz que casa singular y plural. */
function stemOf(word: string): string {
  if (word.length > 5 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 4 && word.endsWith("s")) return word.slice(0, -1);
  return word;
}

interface DishEntry {
  item: MenuItem;
  stems: RegExp[];
}

interface LocaleContext {
  locale: Locale;
  m: Messages;
  items: MenuItem[];
  stars: StarDish[];
  dishIndex: DishEntry[];
}

const contextCache = new Map<Locale, LocaleContext>();

function getContext(locale: Locale): LocaleContext {
  const cached = contextCache.get(locale);
  if (cached) return cached;

  const items = localizeMenuItems(locale);
  const esItems = localizeMenuItems("es");
  const dishIndex: DishEntry[] = items.map((item, i) => {
    const names = [item.name, esItems[i]?.name ?? ""];
    const stems = new Set<string>();
    for (const name of names) {
      for (const word of normalizeText(name).split(" ")) {
        if (word.length < 4 || DISH_STOPWORDS.has(word)) continue;
        const stem = stemOf(word);
        if (ALLERGEN_STOPWORDS.has(word) || ALLERGEN_STOPWORDS.has(stem)) continue;
        stems.add(stem);
      }
    }
    return { item, stems: [...stems].map((s) => new RegExp(`\\b${escapeRegExp(s)}`, "u")) };
  });

  const ctx: LocaleContext = { locale, m: getMessagesSync(locale), items, stars: localizeStarDishes(locale), dishIndex };
  contextCache.set(locale, ctx);
  return ctx;
}

/* ────────────────────────────────────────────────────────────
   Detección de intención
   ──────────────────────────────────────────────────────────── */
export type OfflineIntent =
  | { kind: "greeting" }
  | { kind: "thanks" }
  | { kind: "booking" }
  | { kind: "allergenFree"; allergens: AllergenId[]; diet: DietTag | null }
  | { kind: "pairing"; dishes: MenuItem[] }
  | { kind: "hours" }
  | { kind: "location" }
  | { kind: "dish"; dishes: MenuItem[]; askedAllergens: boolean }
  | { kind: "category"; category: MenuCategoryId }
  | { kind: "recommend" }
  | { kind: "prices" }
  | { kind: "fallback" };

/** Platos cuyo nombre aparece en el texto (máx. 2, los de mayor coincidencia; empate → plato estrella primero). */
function matchDishes(text: string, ctx: LocaleContext): MenuItem[] {
  const scored = ctx.dishIndex
    .map((entry, order) => ({
      item: entry.item,
      order,
      score: entry.stems.reduce((n, re) => (re.test(text) ? n + 1 : n), 0),
    }))
    .filter((e) => e.score > 0);
  if (!scored.length) return [];
  const best = Math.max(...scored.map((e) => e.score));
  return scored
    .filter((e) => e.score === best)
    .sort((a, b) => Number(b.item.tags.includes("estrella")) - Number(a.item.tags.includes("estrella")) || a.order - b.order)
    .slice(0, 2)
    .map((e) => e.item);
}

/** Intención del último mensaje del usuario (texto normalizado). Exportado para poder probarlo. */
export function detectIntent(text: string, locale: Locale = "es"): OfflineIntent {
  const ctx = getContext(locale);
  const allergens = ALLERGEN_REGEX.filter((a) => a.re.test(text)).map((a) => a.id);
  const diet = DIET_REGEX.find((d) => d.re.test(text))?.tag ?? null;
  const exclusion = KW.exclusion.test(text);
  const dishes = matchDishes(text, ctx);

  if (KW.booking.test(text)) return { kind: "booking" };
  if (allergens.length && dishes.length && !exclusion) return { kind: "dish", dishes, askedAllergens: true };
  if (diet) return { kind: "allergenFree", allergens: allergens.filter((a) => exclusion || AVOIDED_ALLERGENS.has(a)), diet };
  if (allergens.length && (exclusion || allergens.some((a) => AVOIDED_ALLERGENS.has(a)))) {
    return { kind: "allergenFree", allergens, diet: null };
  }
  if (KW.pairing.test(text) || (dishes.length && KW.drink.test(text))) return { kind: "pairing", dishes };
  if (KW.hours.test(text)) return { kind: "hours" };
  if (KW.location.test(text)) return { kind: "location" };
  if (dishes.length) return { kind: "dish", dishes, askedAllergens: false };
  const category = CATEGORY_REGEX.find((c) => c.re.test(text))?.id;
  if (category) return { kind: "category", category };
  if (KW.recommend.test(text)) return { kind: "recommend" };
  if (KW.prices.test(text)) return { kind: "prices" };
  if (KW.thanks.test(text)) return { kind: "thanks" };
  if (KW.greeting.test(text)) return { kind: "greeting" };
  return { kind: "fallback" };
}

/* ────────────────────────────────────────────────────────────
   Construcción de respuestas
   ──────────────────────────────────────────────────────────── */
export interface OfflineOptions {
  /** instante de referencia para el horario (por defecto ahora) */
  now?: Date;
  /** página desde la que se pregunta: en la carta no se enlaza a la carta */
  page?: WaiterPage;
}

interface AnswerContext extends LocaleContext {
  page: WaiterPage;
  now: Date;
  cartaUrl: string;
}

/** Línea de listado "**Nombre** — 9,50 € · 8 uds" (con variantes si las hay). */
function itemLine(item: MenuItem, ctx: AnswerContext): string {
  const o = ctx.m.chat.offline;
  if (item.variants?.length) {
    const variants = item.variants.map((v) => `${v.label} ${formatPrice(v.price, ctx.locale)}`).join(" · ");
    return format(o.lineVariants, { name: item.name, variants });
  }
  const price = formatPrice(item.price, ctx.locale);
  return item.unit ? format(o.lineUnit, { name: item.name, price, unit: item.unit }) : format(o.line, { name: item.name, price });
}

/** Listado agrupado por categoría, con tope de líneas y coletilla "…y N más". */
function groupedList(items: MenuItem[], ctx: AnswerContext, max = 12): string[] {
  const o = ctx.m.chat.offline;
  const categories = localizeCategories(ctx.locale);
  const lines: string[] = [];
  let shown = 0;
  for (const c of categories) {
    const inCategory = items.filter((i) => i.category === c.id);
    if (!inCategory.length || shown >= max) continue;
    lines.push(`**${c.label}**`);
    for (const item of inCategory) {
      if (shown >= max) break;
      lines.push(`- ${itemLine(item, ctx)}`);
      shown++;
    }
  }
  const remaining = items.length - shown;
  if (remaining > 0) {
    lines.push(ctx.page === "carta" ? format(o.andMoreCarta, { count: remaining }) : format(o.andMore, { count: remaining, url: ctx.cartaUrl }));
  }
  return lines;
}

function fullMenuLine(ctx: AnswerContext): string[] {
  return ctx.page === "carta" ? [] : [format(ctx.m.chat.offline.fullMenu, { url: ctx.cartaUrl })];
}

function joinParagraphs(...parts: Array<string | string[]>): string {
  return parts
    .map((p) => (Array.isArray(p) ? p.join("\n") : p))
    .filter((p) => p.length > 0)
    .join("\n\n");
}

function answerAllergenFree(intent: Extract<OfflineIntent, { kind: "allergenFree" }>, ctx: AnswerContext): string {
  const o = ctx.m.chat.offline;
  const allergenMap = localizeAllergenMap(ctx.locale);
  const dietLabels = localizeDietTags(ctx.locale);
  const matches = ctx.items.filter(
    (item) =>
      FOOD_CATEGORIES.has(item.category) &&
      !intent.allergens.some((a) => item.allergens.includes(a)) &&
      (intent.diet ? item.tags.includes(intent.diet) : true),
  );

  let header: string;
  if (intent.allergens.length) {
    const allergen = intent.allergens.map((a) => allergenMap[a].label.toLowerCase()).join(", ");
    header = matches.length ? format(o.allergenFree, { allergen }) : format(o.allergenFreeEmpty, { allergen });
  } else {
    const tag = intent.diet ?? "vegano";
    // Plural localizado ("veganas") si existe; si no, la etiqueta genérica de la carta.
    const plural = (o.dietLabels as Partial<Record<DietTag, string>>)[tag];
    const diet = (plural ?? dietLabels[tag]).toLowerCase();
    header = matches.length ? format(o.diet, { diet }) : format(o.dietEmpty, { diet });
  }

  return joinParagraphs(header, groupedList(matches, ctx), o.safety, fullMenuLine(ctx));
}

function wineFor(item: MenuItem, ctx: AnswerContext): { wine: string; why: string | null } | null {
  const star = ctx.stars.find((s) => s.menuId === item.id);
  if (star) return { wine: `${star.pairing.wine} ${star.pairing.do}`, why: star.pairing.why };
  if (item.pairing) return { wine: item.pairing, why: null };
  const fallbackId = DEFAULT_PAIRING[item.category];
  const wine = fallbackId ? ctx.items.find((i) => i.id === fallbackId) : undefined;
  return wine ? { wine: wine.name, why: null } : null;
}

function answerPairing(intent: Extract<OfflineIntent, { kind: "pairing" }>, ctx: AnswerContext): string {
  const o = ctx.m.chat.offline;
  /** un bloque (párrafo o lista) por plato preguntado */
  const blocks: Array<string | string[]> = [];

  for (const dish of intent.dishes) {
    if (dish.category === "vinos") {
      // Preguntan por un vino concreto: qué platos le van bien.
      const stem = normalizeText(dish.name).split(" ")[0] ?? "";
      const dishes = ctx.items.filter((i) => i.pairing && normalizeText(i.pairing).includes(stem) && FOOD_CATEGORIES.has(i.category));
      if (dishes.length) {
        blocks.push([format(o.pairingWine, { wine: dish.name }), ...dishes.slice(0, 6).map((d) => `- ${itemLine(d, ctx)}`)]);
        continue;
      }
    }
    const pairing = wineFor(dish, ctx);
    if (!pairing) continue;
    blocks.push(
      pairing.why
        ? format(o.pairingDish, { dish: dish.name, wine: pairing.wine, why: pairing.why })
        : format(o.pairingDishSimple, { dish: dish.name, wine: pairing.wine }),
    );
  }

  if (!blocks.length) {
    // Sin plato concreto: maridajes de los platos estrella.
    blocks.push([
      o.pairingIntro,
      ...ctx.stars.map((star) => `- ${format(o.linePairing, { name: star.name, wine: `${star.pairing.wine} ${star.pairing.do}` })}`),
    ]);
  }

  return joinParagraphs(...blocks, o.more);
}

function answerHours(ctx: AnswerContext): string {
  const o = ctx.m.chat.offline;
  const status = getOpenStatus(ctx.now);
  return joinParagraphs(
    [o.hoursIntro, ...hoursLines(ctx.m).map((l) => `- ${l}`)],
    format(o.hoursNow, { status: describeOpenStatus(status, ctx.m) }),
  );
}

function answerLocation(ctx: AnswerContext): string {
  const o = ctx.m.chat.offline;
  /* Referencia localizada (BUSINESS.address.landmark solo existe en español y la respuesta saldría
     en dos idiomas). "A un minuto a pie de la Catedral…" → minúscula: va a mitad de frase. */
  const reference = ctx.m.experience.map.subtitle;
  const landmark = reference.charAt(0).toLowerCase() + reference.slice(1);
  return joinParagraphs(format(o.location, { address: BUSINESS.address.full, landmark, url: BUSINESS.social.directions }), o.locationExtra);
}

function answerBooking(ctx: AnswerContext): string {
  const o = ctx.m.chat.offline;
  return joinParagraphs(
    format(o.booking, { phone: BUSINESS.phone.display, tel: BUSINESS.phone.tel, whatsapp: BUSINESS.phone.whatsapp }),
    o.bookingExtra,
  );
}

function answerDish(intent: Extract<OfflineIntent, { kind: "dish" }>, ctx: AnswerContext): string {
  const o = ctx.m.chat.offline;
  const allergenMap = localizeAllergenMap(ctx.locale);
  const cards = intent.dishes.map((dish) => {
    const price = dish.variants?.length
      ? dish.variants.map((v) => `${v.label} ${formatPrice(v.price, ctx.locale)}`).join(" · ")
      : `${formatPrice(dish.price, ctx.locale)}${dish.unit ? ` · ${dish.unit}` : ""}`;
    const parts = [format(o.dishInfo, { name: dish.name, price, description: dish.description })];
    parts.push(
      dish.allergens.length
        ? format(o.dishAllergens, { allergens: dish.allergens.map((a) => allergenMap[a].label).join(", ") })
        : o.dishNoAllergens,
    );
    const pairing = wineFor(dish, ctx);
    if (pairing && FOOD_CATEGORIES.has(dish.category)) parts.push(format(o.dishPairing, { wine: pairing.wine }));
    return parts.join(" ");
  });
  return joinParagraphs(...cards, intent.askedAllergens ? o.safety : "", fullMenuLine(ctx));
}

function answerCategory(intent: Extract<OfflineIntent, { kind: "category" }>, ctx: AnswerContext): string {
  const o = ctx.m.chat.offline;
  const category = localizeCategories(ctx.locale).find((c) => c.id === intent.category);
  const items = ctx.items.filter((i) => i.category === intent.category);
  if (!category || !items.length) return joinParagraphs(o.categoryEmpty, fullMenuLine(ctx));
  return joinParagraphs(
    format(o.category, { category: category.label, kicker: category.kicker }),
    items.slice(0, 12).map((i) => `- ${itemLine(i, ctx)}`),
    items.length > 12 ? format(ctx.page === "carta" ? o.andMoreCarta : o.andMore, { count: items.length - 12, url: ctx.cartaUrl }) : "",
    fullMenuLine(ctx),
  );
}

function answerRecommend(ctx: AnswerContext): string {
  const o = ctx.m.chat.offline;
  const stars = ctx.items.filter((i) => i.tags.includes("estrella") && FOOD_CATEGORIES.has(i.category) && i.category !== "postres");
  return joinParagraphs(o.recommend, stars.slice(0, 6).map((i) => `- ${itemLine(i, ctx)}`), o.recommendOutro);
}

function answerPrices(ctx: AnswerContext): string {
  const o = ctx.m.chat.offline;
  const examples = ctx.items.filter((i) => FOOD_CATEGORIES.has(i.category) && i.tags.includes("estrella")).slice(0, 5);
  return joinParagraphs(
    format(o.prices, { range: BUSINESS.priceRange }),
    examples.map((i) => `- ${itemLine(i, ctx)}`),
    o.pricesExtra,
    fullMenuLine(ctx),
  );
}

function answerFallback(ctx: AnswerContext): string {
  const o = ctx.m.chat.offline;
  return joinParagraphs(o.fallback, o.fallbackItems.map((i) => `- ${i}`), fullMenuLine(ctx));
}

/** Último mensaje del usuario del historial (texto plano). */
function lastUserText(messages: ReadonlyArray<WaiterTurn>): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return turnText(messages[i]);
  }
  return "";
}

/**
 * Respuesta determinista al último mensaje del usuario, en el idioma indicado (markdown ligero).
 * Nunca lanza: ante cualquier texto devuelve como mínimo la respuesta de ayuda.
 */
export function answerOffline(messages: ReadonlyArray<WaiterTurn>, locale: Locale, options: OfflineOptions = {}): string {
  const base = getContext(locale);
  const ctx: AnswerContext = {
    ...base,
    page: options.page ?? "home",
    now: options.now ?? new Date(),
    cartaUrl: localePath(locale, "/carta"),
  };
  const text = normalizeText(lastUserText(messages));
  const intent = text ? detectIntent(text, locale) : { kind: "greeting" as const };
  const o = ctx.m.chat.offline;

  switch (intent.kind) {
    case "greeting":
      return o.greeting;
    case "thanks":
      return o.thanks;
    case "booking":
      return answerBooking(ctx);
    case "allergenFree":
      return answerAllergenFree(intent, ctx);
    case "pairing":
      return answerPairing(intent, ctx);
    case "hours":
      return answerHours(ctx);
    case "location":
      return answerLocation(ctx);
    case "dish":
      return answerDish(intent, ctx);
    case "category":
      return answerCategory(intent, ctx);
    case "recommend":
      return answerRecommend(ctx);
    case "prices":
      return answerPrices(ctx);
    case "fallback":
      return answerFallback(ctx);
  }
}
