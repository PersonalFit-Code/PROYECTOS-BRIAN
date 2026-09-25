/**
 * Base de conocimiento del camarero virtual.
 *
 * `buildKnowledge()` reúne, a partir de src/data (vía los helpers localizados de @/i18n/data),
 * todo lo que el modelo puede afirmar: negocio, horario, leyenda de alérgenos, carta completa por
 * categorías y platos estrella con su maridaje. `renderKnowledge()` lo serializa en un markdown
 * compacto y DETERMINISTA (mismo orden de claves, mismos separadores, precios sin depender de ICU):
 * el bloque de sistema se cachea en la API de Anthropic y cualquier byte distinto invalidaría la caché.
 *
 * Lo que cambia con el tiempo (día de hoy, estado de apertura) NO va aquí: se añade al último mensaje
 * del usuario desde systemPrompt.ts (`buildContextSuffix`).
 */
import { BUSINESS, DAY_LABELS, type DayKey } from "@/data/business";
import type { MenuItem } from "@/data/menu";
import type { Locale } from "@/i18n/config";
import {
  localizeAllergenMap,
  localizeAllergens,
  localizeCategories,
  localizeDietTags,
  localizeFeatures,
  localizeMenuItems,
  localizeStarDishes,
} from "@/i18n/data";
import { format } from "@/i18n/getMessages";
import type { Messages } from "@/i18n/types";
import { formatRanges, OPENS_SOON_MINUTES, type OpenStatus } from "@/lib/openStatus";

/** Orden de los días tal y como se listan en horarios (lunes → domingo). */
export const DAY_ORDER: readonly DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** Precio en euros con formato fijo ("9,50 €", "14 €"), independiente de la ICU del runtime. */
export function fmtEur(n: number): string {
  return `${Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ",")} €`;
}

/** "4.4" → "4,4" (valoraciones). */
function fmtRating(n: number): string {
  return String(n).replace(".", ",");
}

export interface KnowledgeItem {
  id: string;
  name: string;
  description: string;
  price: string;
  unit: string | null;
  /** "Media (4 uds) 5,50 €", "Copa 3 €"… */
  variants: string[];
  /** etiquetas legibles de alérgenos (ya localizadas) */
  allergens: string[];
  /** etiquetas dietéticas legibles ("Vegano", "Sin gluten"…) */
  tags: string[];
  pairing: string | null;
}

export interface KnowledgeCategory {
  id: string;
  label: string;
  kicker: string;
  description: string;
  items: KnowledgeItem[];
}

export interface KnowledgeStarDish {
  id: string;
  menuId: string;
  name: string;
  kicker: string;
  headline: string;
  description: string;
  ingredients: string[];
  price: string;
  unit: string;
  allergens: string[];
  pairing: { wine: string; do: string; why: string };
  badge: string | null;
}

export interface KnowledgeBusiness {
  name: string;
  legalName: string;
  description: string;
  address: string;
  landmark: string;
  phone: string;
  tel: string;
  whatsapp: string;
  directions: string;
  website: string;
  priceRange: string;
  ratings: string;
  features: string[];
  /** "Lunes: 19:30–00:00" (etiquetas en español: el bloque de sistema es en español) */
  hours: string[];
  timezone: string;
}

export interface WaiterKnowledge {
  business: KnowledgeBusiness;
  allergens: { code: string; label: string; description: string }[];
  categories: KnowledgeCategory[];
  starDishes: KnowledgeStarDish[];
}

/** Líneas de horario "Lunes: 12:00–16:00 · 20:00–00:00" con etiquetas del idioma activo. */
export function hoursLines(m: Messages): string[] {
  return DAY_ORDER.map((day) => `${m.common.days[day]}: ${formatRanges(BUSINESS.hours[day], m.common.status.closed)}`);
}

/**
 * Estado de apertura en texto, en el idioma de `m` ("Abierto ahora · Cierra a las 16:00").
 * Reutilizado por el sufijo de contexto (en español) y por el motor sin conexión (localizado).
 */
export function describeOpenStatus(status: OpenStatus, m: Messages): string {
  const s = m.common.status;
  switch (status.kind) {
    case "open":
      return `${s.openNow} · ${format(s.closesAt, { time: status.closeTime ?? "" })}`;
    case "closingSoon":
      return `${s.closingSoon} · ${format(s.closesAt, { time: status.closeTime ?? "" })}`;
    case "opensIn":
      return status.minutesToChange !== null && status.minutesToChange <= OPENS_SOON_MINUTES
        ? `${s.closedNow} · ${format(s.opensIn, { minutes: status.minutesToChange })}`
        : `${s.closedNow} · ${format(s.opensTodayAt, { time: status.openTime ?? "" })}`;
    case "closedToday":
    case "closedUntil": {
      if (!status.nextDayKey || !status.openTime) return `${s.closed} · ${s.checkHours}`;
      const time = status.openTime;
      return status.nextDayOffset === 1
        ? `${s.closedNow} · ${format(s.opensTomorrowAt, { time })}`
        : `${s.closedNow} · ${format(s.opensOnAt, { day: m.common.days[status.nextDayKey].toLowerCase(), time })}`;
    }
  }
}

/** Estructura completa del conocimiento en el idioma pedido (por defecto español, fuente de verdad). */
export function buildKnowledge(locale: Locale = "es"): WaiterKnowledge {
  const allergenMap = localizeAllergenMap(locale);
  const dietTags = localizeDietTags(locale);
  const items = localizeMenuItems(locale);
  const categories = localizeCategories(locale);
  const stars = localizeStarDishes(locale);
  const g = BUSINESS.ratings.google;
  const ta = BUSINESS.ratings.tripadvisor;

  const toItem = (item: MenuItem): KnowledgeItem => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: fmtEur(item.price),
    unit: item.unit ?? null,
    variants: (item.variants ?? []).map((v) => `${v.label} ${fmtEur(v.price)}`),
    allergens: item.allergens.map((a) => allergenMap[a].label),
    tags: item.tags.map((t) => dietTags[t]),
    pairing: item.pairing ?? null,
  });

  return {
    business: {
      name: BUSINESS.name,
      legalName: BUSINESS.legalName,
      description: BUSINESS.description,
      address: BUSINESS.address.full,
      landmark: BUSINESS.address.landmark,
      phone: BUSINESS.phone.display,
      tel: BUSINESS.phone.tel,
      whatsapp: BUSINESS.phone.whatsapp,
      directions: BUSINESS.social.directions,
      website: BUSINESS.website,
      priceRange: BUSINESS.priceRange,
      ratings: `Google ${fmtRating(g.value)}/5 (${g.count} reseñas) · TripAdvisor ${fmtRating(ta.value)}/5 (${ta.count} opiniones, nº ${ta.rank} de ${ta.total} restaurantes de Ourense, ${ta.award})`,
      features: localizeFeatures(locale),
      hours: DAY_ORDER.map((day) => `${DAY_LABELS[day]}: ${formatRanges(BUSINESS.hours[day], "cerrado")}`),
      timezone: BUSINESS.timezone,
    },
    allergens: localizeAllergens(locale).map((a) => ({ code: a.code, label: a.label, description: a.description })),
    categories: categories.map((c) => ({
      id: c.id,
      label: c.label,
      kicker: c.kicker,
      description: c.description,
      items: items.filter((i) => i.category === c.id).map(toItem),
    })),
    starDishes: stars.map((d) => ({
      id: d.id,
      menuId: d.menuId,
      name: d.name,
      kicker: d.kicker,
      headline: d.headline,
      description: d.description,
      ingredients: [...d.ingredients],
      price: fmtEur(d.price),
      unit: d.unit,
      allergens: d.allergens.map((a) => allergenMap[a].label),
      pairing: { wine: d.pairing.wine, do: d.pairing.do, why: d.pairing.why },
      badge: d.badge ?? null,
    })),
  };
}

function renderItem(item: KnowledgeItem): string {
  const parts: string[] = [`${item.id} · ${item.name} · ${item.price}${item.unit ? ` (${item.unit})` : ""}`];
  if (item.variants.length) parts.push(`variantes: ${item.variants.join(" / ")}`);
  parts.push(`alérgenos: ${item.allergens.length ? item.allergens.join(", ") : "ninguno declarado"}`);
  if (item.tags.length) parts.push(`etiquetas: ${item.tags.join(", ")}`);
  if (item.pairing) parts.push(`maridaje: ${item.pairing}`);
  parts.push(item.description);
  return `- ${parts.join(" · ")}`;
}

/** Markdown compacto y determinista de la base de conocimiento. */
export function renderKnowledge(k: WaiterKnowledge): string {
  const b = k.business;
  const out: string[] = [];

  out.push(`# ${b.name} · base de conocimiento del camarero virtual`, "");
  out.push("## Negocio");
  out.push(`- Nombre: ${b.name} (${b.legalName})`);
  out.push(`- Qué es: ${b.description}`);
  out.push(`- "Tixola" significa sartén en gallego: las tixolas son sartenes de hierro fundido que llegan a la mesa chisporroteando.`);
  out.push(`- Dirección: ${b.address} · ${b.landmark}`);
  out.push(`- Teléfono: ${b.phone} · enlace para llamar: ${b.tel}`);
  out.push(`- WhatsApp (reservas y consultas): ${b.whatsapp}`);
  out.push(`- Cómo llegar (Google Maps): ${b.directions}`);
  out.push(`- Web: ${b.website}`);
  out.push(`- Precio medio: ${b.priceRange} por persona (precios orientativos, IVA incluido)`);
  out.push(`- Valoraciones: ${b.ratings}`);
  out.push(`- Servicios: ${b.features.join(" · ")}`);
  out.push("- Reservas: solo por teléfono o WhatsApp (no hay reserva online); grupos grandes mejor por teléfono");
  out.push(`- Zona horaria: ${b.timezone}`, "");

  out.push("## Horario semanal");
  for (const line of b.hours) out.push(`- ${line}`);
  out.push("");

  out.push("## Alérgenos (los 14 de declaración obligatoria en la UE, Reglamento 1169/2011)");
  for (const a of k.allergens) out.push(`- ${a.code} ${a.label}: ${a.description}`);
  out.push("- Nota: la cocina manipula todos los alérgenos; ante alergias o intolerancias hay que confirmarlo con el personal.", "");

  out.push("## Carta completa (formato: id · nombre · precio (unidad) · variantes · alérgenos · etiquetas · maridaje · descripción)");
  for (const c of k.categories) {
    out.push(`### ${c.label} · ${c.kicker}`);
    out.push(c.description);
    for (const item of c.items) out.push(renderItem(item));
    out.push("");
  }

  out.push("## Platos estrella (con maridaje explicado)");
  for (const d of k.starDishes) {
    const badge = d.badge ? ` · ${d.badge}` : "";
    out.push(
      `- ${d.name} (id carta: ${d.menuId}) · ${d.price} / ${d.unit}${badge} · ${d.kicker}: "${d.headline}" · Ingredientes: ${d.ingredients.join(", ")} · Alérgenos: ${d.allergens.length ? d.allergens.join(", ") : "ninguno declarado"} · Maridaje: ${d.pairing.wine} (${d.pairing.do}) — ${d.pairing.why} · ${d.description}`,
    );
  }

  return out.join("\n");
}

const markdownCache = new Map<Locale, string>();

/** Markdown de la base de conocimiento, memoizado por idioma (los datos son estáticos). */
export function getKnowledgeMarkdown(locale: Locale = "es"): string {
  const cached = markdownCache.get(locale);
  if (cached) return cached;
  const rendered = renderKnowledge(buildKnowledge(locale));
  markdownCache.set(locale, rendered);
  return rendered;
}
