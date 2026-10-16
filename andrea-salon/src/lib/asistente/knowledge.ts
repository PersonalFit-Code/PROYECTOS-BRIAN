/**
 * Base de conocimiento del asistente de preguntas frecuentes.
 *
 * Todo lo que el asistente puede afirmar sale de aquí y de NINGÚN otro sitio: los datos del negocio
 * (`data/business.ts`), las preguntas frecuentes (`data/faq.ts`, la misma fuente que la sección
 * visible de la portada y el `FAQPage` de JSON-LD) y la lista de servicios, que llega de fuera porque
 * en el servidor sale de Supabase o del fixture según haya base de datos (ver `app/api/chat/route.ts`).
 *
 * `renderKnowledge()` lo serializa en un markdown compacto y DETERMINISTA (mismo orden, mismos
 * separadores, precios sin depender de ICU): el bloque de sistema se marca para la caché de prompts
 * de Anthropic y cualquier byte distinto entre peticiones la invalidaría. Lo que cambia con el tiempo
 * (día, hora, «abierto ahora») NO va aquí: lo añade `systemPrompt.ts` en un bloque aparte.
 *
 * PURO a propósito (sin `server-only`, sin Supabase en tiempo de ejecución): lo usan el motor sin IA y
 * las pruebas. Los tipos de la base de datos se importan solo como tipos.
 */
import { BUSINESS, DAY_ORDER_WEEK, type DayKey, type TimeRange } from "@/data/business";
import { FAQ, type FaqItem } from "@/data/faq";
import type { Servicio } from "@/components/servicios/types";
import { localePath, type Locale } from "@/i18n/config";
import { format } from "@/i18n/getMessages";
import es from "@/i18n/messages/es";
import type { Messages } from "@/i18n/types";
import { faqVars } from "@/lib/faq";
import { formatCents } from "@/lib/format";
import { urlFor } from "@/lib/hosts";
import type { OpenStatus } from "@/lib/openStatus";
import type { ServiceCategoryRow, ServiceRow } from "@/lib/supabase/types";
import type { ServicioAsistente } from "./types";

const HOURS: Record<DayKey, readonly TimeRange[]> = BUSINESS.hours;

/* ────────────────────────────────────────────────────────────
   Servicios: de cada fuente a la forma del asistente
   ──────────────────────────────────────────────────────────── */

/**
 * Del fixture (antes de conectar la base de datos). Todo el fixture va marcado `pendiente`: los
 * precios que trae salen de la web antigua y las duraciones son estimaciones de salón. La página de
 * servicios ya los publica así, con «Pendiente de confirmar» al lado, y el asistente dice lo mismo.
 */
export function serviciosDesdeFixture(lista: readonly Servicio[]): ServicioAsistente[] {
  return lista.map((s) => ({
    slug: s.slug,
    nombre: s.nombre,
    descripcion: s.descripcion || null,
    categoria: es.servicios.categories[s.categoria] ?? null,
    precioCents: s.precioCents !== null && s.precioCents > 0 ? s.precioCents : null,
    precioDesde: s.precioDesde,
    duracionMin: s.duracionMin > 0 ? s.duracionMin : null,
    reservableOnline: s.reservableOnline,
    pendiente: s.pendiente,
  }));
}

/**
 * De la base de datos (`getCatalogo()`). Lo que hay en Supabase lo ha puesto Andrea desde el panel,
 * así que ya no es «pendiente».
 *
 * `price_cents = 0` NO ES GRATIS: es como el importador del catálogo (`scripts/seed-catalogo.ts`)
 * guarda un precio que no se conoce, porque la columna no admite nulos. Por eso cero pasa a `null` y
 * el asistente dice «pregúntanos» en vez de anunciar un servicio a 0 €.
 */
export function serviciosDesdeCatalogo(
  categorias: readonly Pick<ServiceCategoryRow, "id" | "name">[],
  servicios: readonly ServiceRow[],
): ServicioAsistente[] {
  const nombreCategoria = new Map(categorias.map((c) => [c.id, c.name]));
  return servicios
    .filter((s) => s.active)
    .map((s) => ({
      slug: s.slug,
      nombre: s.name,
      descripcion: s.description?.trim() || null,
      categoria: (s.category_id && nombreCategoria.get(s.category_id)) || null,
      precioCents: s.price_cents > 0 ? s.price_cents : null,
      precioDesde: s.price_is_from,
      duracionMin: s.duration_min > 0 ? s.duration_min : null,
      reservableOnline: s.bookable_online,
      pendiente: false,
    }));
}

/** "25 €", "desde 25 €" o `null` si no hay precio publicado. Mismo texto que la tarjeta de servicios. */
export function precioDe(s: ServicioAsistente): string | null {
  if (s.precioCents === null) return null;
  const price = formatCents(s.precioCents);
  return s.precioDesde ? format(es.servicios.card.from, { price }) : price;
}

/** Enlace a la reserva con el servicio ya elegido (el mismo que el botón «Reservar» de cada tarjeta). */
export function reservaDe(s: ServicioAsistente, locale: Locale = "es"): string | null {
  return s.reservableOnline ? urlFor("reservar", `/?servicio=${encodeURIComponent(s.slug)}`, locale) : null;
}

/* ────────────────────────────────────────────────────────────
   Horario y estado
   ──────────────────────────────────────────────────────────── */

/** "Lunes: 09:30–13:30 / 15:30–19:30" con las etiquetas del idioma de `m`. */
export function hoursLines(m: Messages): string[] {
  return DAY_ORDER_WEEK.map((day) => {
    const ranges = HOURS[day];
    const label = ranges.length ? ranges.map((r) => `${r.open}–${r.close}`).join(" / ") : m.common.status.closed;
    return `${m.common.days[day]}: ${label}`;
  });
}

/**
 * Estado de apertura en texto, en el idioma de `m` ("Abierto ahora · hasta las 19:30"). Las mismas
 * piezas que la píldora de estado de la web (`useOpenStatusText`), para que el asistente y la
 * cabecera no digan cosas distintas a la vez.
 */
export function describeOpenStatus(status: OpenStatus, m: Messages): string {
  const s = m.common.status;
  switch (status.kind) {
    case "open":
      return `${s.open} · ${format(s.closesAt, { time: status.closeTime ?? "" })}`;
    case "closingSoon":
      return `${s.closingSoon} · ${format(s.closesAt, { time: status.closeTime ?? "" })}`;
    case "opensToday":
      return `${s.closed} · ${format(s.opensToday, { time: status.openTime ?? "" })}`;
    case "closedToday":
    case "closedUntil": {
      const label = status.kind === "closedToday" ? s.closedToday : s.closed;
      const time = status.openTime ?? "";
      if (!time) return label;
      const detail =
        status.nextDayOffset === 1
          ? format(s.opensTomorrow, { time })
          : status.nextDayKey
            ? format(s.opensOn, { day: m.common.days[status.nextDayKey].toLowerCase(), time })
            : "";
      return detail ? `${label} · ${detail}` : label;
    }
  }
}

/* ────────────────────────────────────────────────────────────
   Preguntas frecuentes
   ──────────────────────────────────────────────────────────── */

/**
 * Respuesta de una pregunta frecuente ya rellena ({hours}, {phone}…), con su `**negrita**` (el chat
 * la pinta). `null` si alguien quita esa pregunta de `data/faq.ts`: quien llama tiene su respaldo.
 */
export function faqAnswer(id: string, m: Messages = es): string | null {
  const item = FAQ.find((f) => f.id === id);
  return item ? format(item.a, faqVars(m)) : null;
}

/* ────────────────────────────────────────────────────────────
   Enlaces de la web
   ──────────────────────────────────────────────────────────── */

export interface EnlacesAsistente {
  /** Reserva online (absoluta: en producción vive en su propio subdominio). */
  reservar: string;
  servicios: string;
  bonos: string;
  equipo: string;
  galeria: string;
  resenas: string;
  contacto: string;
  privacidad: string;
}

export function enlaces(locale: Locale = "es", m: Messages = es): EnlacesAsistente {
  return {
    reservar: urlFor("reservar", "/", locale),
    servicios: localePath(locale, "/servicios"),
    bonos: localePath(locale, "/bonos"),
    equipo: localePath(locale, "/equipo"),
    galeria: localePath(locale, "/galeria"),
    resenas: localePath(locale, "/resenas"),
    contacto: localePath(locale, "/contacto"),
    privacidad: localePath(locale, `/legal/${m.legal.privacy.slug}`),
  };
}

/* ────────────────────────────────────────────────────────────
   Markdown determinista para el prompt del sistema
   ──────────────────────────────────────────────────────────── */

function renderServicio(s: ServicioAsistente): string {
  const precio = precioDe(s);
  const reserva = reservaDe(s);
  const partes = [
    s.nombre,
    s.categoria ? `categoría: ${s.categoria}` : null,
    precio ? `precio: ${precio} (IVA incluido)` : "precio: NO PUBLICADO (depende del trabajo: que pregunten)",
    s.duracionMin ? `duración aproximada: ${s.duracionMin} min` : "duración: NO PUBLICADA (que pregunten)",
    reserva ? `reserva online: ${reserva}` : "NO se reserva online: se pide en el salón o por teléfono",
    s.pendiente ? "DATOS PENDIENTES DE CONFIRMAR con el salón" : null,
    s.descripcion,
  ];
  return `- ${partes.filter(Boolean).join(" · ")}`;
}

function renderFaq(item: FaqItem): string[] {
  const respuesta = format(item.a, faqVars(es));
  return [`### ${item.q}`, item.pendiente ? `${respuesta} (Respuesta prudente: el detalle está pendiente de confirmar con el salón.)` : respuesta];
}

/**
 * Markdown compacto de la base de conocimiento (en español, la fuente de verdad: el modelo traduce
 * si la persona escribe en otro idioma). Recibe los servicios ya normalizados.
 */
export function renderKnowledge(servicios: readonly ServicioAsistente[]): string {
  const b = BUSINESS;
  const l = enlaces("es");
  const out: string[] = [];

  out.push(`# ${b.name} · base de conocimiento del asistente`, "");

  out.push("## El salón");
  out.push(`- Nombre: ${b.name} (también «${b.legalName}»). Salón de uñas y belleza en ${b.address.city} (${b.address.region}).`);
  out.push(`- Qué es: ${es.nav.footer.about}`);
  out.push(`- Dirección: ${b.address.full}`);
  out.push(`- Cómo llegar (Google Maps): ${b.directions}`);
  out.push(`- Teléfono: ${b.phone.display} · enlace para llamar: ${b.phone.tel}`);
  out.push(`- WhatsApp: ${b.whatsapp.display} · enlace: ${b.whatsapp.url}`);
  out.push(`- Instagram: ${b.social.instagramHandle} · ${b.social.instagram}`);
  out.push(`- Facebook: ${b.social.facebook}`);
  out.push(b.email ? `- Correo: ${b.email}` : "- Correo: no hay correo de contacto publicado; para escribir, WhatsApp.");
  out.push(`- Zona horaria: ${b.timezone}`, "");

  out.push("## Enlaces de la web (úsalos tal cual, con el formato [texto](url))");
  out.push(`- Reserva online (abierta 24 h, gratis y sin tarjeta; ahí se ven los huecos libres de verdad): ${l.reservar}`);
  out.push(`- Servicios y precios: ${l.servicios}`);
  out.push(`- Bonos y tarjetas regalo: ${l.bonos}`);
  out.push(`- Equipo: ${l.equipo}`);
  out.push(`- Galería de trabajos: ${l.galeria}`);
  out.push(`- Reseñas: ${l.resenas}`);
  out.push(`- Contacto y mapa: ${l.contacto}`);
  out.push(`- Política de privacidad: ${l.privacidad}`, "");

  out.push("## Horario semanal (hora de Ourense)");
  for (const line of hoursLines(es)) out.push(`- ${line}`);
  if (b.hoursPending) {
    out.push(`- AVISO: ${es.common.status.hoursPending} Siempre que hables del horario, dilo.`);
  }
  out.push("");

  out.push("## Servicios (formato: nombre · categoría · precio · duración · reserva · estado · descripción)");
  if (servicios.length) {
    if (servicios.some((s) => s.pendiente)) out.push(`AVISO: ${es.servicios.pendingNote}`);
    out.push(es.servicios.footnote);
    for (const s of servicios) out.push(renderServicio(s));
  } else {
    out.push(`La lista de servicios no está disponible ahora mismo: no nombres servicios ni precios; manda a ${l.servicios} o a WhatsApp.`);
  }
  out.push("");

  out.push("## Preguntas frecuentes (respuestas oficiales del salón: respétalas)");
  for (const item of FAQ) out.push(...renderFaq(item));

  return out.join("\n");
}
