/**
 * Motor de respuestas SIN modelo: detección determinista de intención sobre texto normalizado
 * (NFD sin diacríticos, minúsculas) y respuestas construidas con las plantillas de
 * `m.chat.offline.*`, las preguntas frecuentes de `data/faq.ts` y los servicios que le pasa la ruta.
 *
 * Es el modo NORMAL mientras el salón no ponga `ANTHROPIC_API_KEY` (modo `offline`), y el respaldo
 * cuando el modelo falla (modo `fallback`). Por eso tiene que ser aburrido y fiable: nunca lanza,
 * nunca inventa un dato (lo que no está, se pregunta) y nunca promete una cita.
 *
 * Puro (sin red, sin Node, sin `server-only`) y sincrónico: se prueba con `node:test` sin montar nada.
 */
import { BUSINESS } from "@/data/business";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/getMessages";
import es from "@/i18n/messages/es";
import type { Messages } from "@/i18n/types";
import { getOpenStatus } from "@/lib/openStatus";
import { describeOpenStatus, enlaces, faqAnswer, hoursLines, precioDe, reservaDe } from "./knowledge";
import { turnText, type AsistentePage, type AsistenteTurn, type ServicioAsistente } from "./types";

/* ────────────────────────────────────────────────────────────
   Normalización y palabras clave
   ──────────────────────────────────────────────────────────── */

/** NFD sin diacríticos, minúsculas, solo letras/números/espacios: "¿Uñas de gel, mañana?" → "unas de gel manana". */
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
 * "reserv*" = prefijo de palabra (reserva, reservar, reservo…); "cita" = palabra completa.
 */
function compile(words: readonly string[]): RegExp {
  const alternatives = words.map((word) => {
    const prefix = word.endsWith("*");
    const base = escapeRegExp(normalizeText(prefix ? word.slice(0, -1) : word));
    return prefix ? base : `${base}\\b`;
  });
  return new RegExp(`\\b(?:${alternatives.join("|")})`, "u");
}

/*
 * Las listas están en castellano con algún guiño al gallego y al inglés, que es lo que se escribe en
 * la web de un salón de Ourense. EL ORDEN EN QUE SE CONSULTAN IMPORTA MÁS QUE LAS LISTAS: ver
 * `detectIntent`.
 */
const KW = {
  greeting: compile(["hola", "buenas", "buenos dias", "buenas tardes", "buenas noches", "ola", "boas", "bo dia", "hello", "hi", "hey", "saludos"]),
  thanks: compile(["gracias", "grazas", "thank*", "perfecto", "genial", "estupendo", "fenomenal"]),
  /* "hema" es el monómero de los geles al que más gente es alérgica: la pregunta llega tal cual. */
  health: compile([
    "alerg*", "alerx*", "sensib*", "intoleran*", "reaccion*", "irrita*", "picor*", "escozor*", "hema", "embaraz*", "lactan*",
    "diabet*", "hongo*", "infecc*", "herida*", "dermat*", "medic*", "psoriasis", "eccema*", "quimio*", "enferm*",
  ]),
  cancel: compile([
    "cancel*", "anul*", "desconvoc*", "aplaz*", "cambiar la cita", "cambiar mi cita", "cambiar de cita", "cambio de cita",
    "cambiar la hora", "cambiar de hora", "cambiar el dia", "mover la cita", "mover mi cita", "modificar la cita", "modificar mi cita",
    "no puedo ir", "no voy a poder", "no podre ir",
  ]),
  walkIn: compile(["sin cita", "sin reserva", "sin reservar", "sin pedir cita", "pasar sin", "walk in", "de paso"]),
  bonos: compile(["bono*", "tarjeta regalo", "tarjetas regalo", "regal*", "vale regalo", "vales regalo", "cheque regalo", "gift*"]),
  duration: compile(["cuanto dura*", "dura", "duran", "duracion*", "cuanto tiempo", "cuanto tarda*", "tarda*", "minutos"]),
  booking: compile([
    "reserv*", "cita", "citas", "pedir hora", "coger hora", "dar hora", "pedir vez", "hueco*", "disponib*", "agendar", "turno*",
    "book*", "appointment*", "hay sitio",
  ]),
  payment: compile([
    "como se paga", "como pago", "como puedo pagar", "forma de pago", "formas de pago", "metodo de pago", "metodos de pago",
    "pagar con", "pago con", "tarjeta", "efectivo", "bizum", "datafono",
  ]),
  prices: compile([
    "precio*", "cuanto cuesta*", "cuanto vale*", "cuanto es", "cuanto cobr*", "cuesta*", "cuestan", "valen", "tarifa*", "caro", "cara",
    "barat*", "euros", "coste*", "presupuesto*", "prezo*", "price*",
  ]),
  hours: compile([
    "horario*", "hora", "horas", "abr*", "abiert*", "cerr*", "cierr*", "lunes", "martes", "miercoles", "jueves", "viernes",
    "sabado*", "domingo*", "fin de semana", "festivo*", "hoy", "manana", "tarde*", "luns", "xoves", "venres", "open*", "hours",
  ]),
  location: compile([
    "donde", "direccion", "lleg*", "ubica*", "situad*", "mapa", "aparc*", "parking", "coche", "como voy", "calle", "zona", "onde",
    "enderezo", "where", "address",
  ]),
  kids: compile(["nino*", "nina*", "hijo*", "hija*", "crio*", "cria*", "bebe*", "peques", "carrito*", "menor*"]),
  contact: compile(["telefono*", "llamar", "llamo", "numero", "whatsapp", "wasap", "watsap", "contact*", "correo*", "email", "mail", "escribir*"]),
  gallery: compile(["instagram", "insta", "foto*", "galeria", "trabajos", "redes", "facebook", "ejemplos", "disenos"]),
  team: compile(["equipo", "quien", "quienes", "profesional*", "manicurista*", "trabajador*", "chicas"]),
  services: compile(["servicio*", "que haceis", "que hacen", "haceis", "ofrec*", "tratamiento*", "catalogo", "carta", "lista"]),
} as const;

/* ────────────────────────────────────────────────────────────
   Servicios nombrados en la pregunta
   ──────────────────────────────────────────────────────────── */

/** Palabras de los nombres que no distinguen un servicio de otro ("uñas" normaliza a "unas"). */
const SERVICE_STOPWORDS = new Set(["de", "del", "la", "las", "el", "los", "y", "e", "o", "con", "sin", "en", "para", "por", "un", "una", "uno", "unas", "unos", "al", "a"]);

/**
 * Cómo se llama de verdad a algunos servicios al preguntar. Van por `slug` (los del catálogo de
 * hoy): si Andrea crea otros desde el panel, siguen funcionando por su nombre; esto solo suma.
 */
const SERVICE_SYNONYMS: Readonly<Record<string, readonly string[]>> = {
  "gel-acrylgel": ["acril*", "acrygel", "esculpid*", "extension*", "postiz*", "porcelana"],
  "nail-art": ["decoracion*", "decorad*", "dibujo*", "pedreria", "piedrecita*", "disenos de unas", "diseno de unas"],
  "manicura-personalizada": ["francesa*", "personaliz*"],
  "pedicura-completa": ["pies"],
};

/** "pestañas" → "pestana", "cejas" → "ceja": raíz que casa singular y plural. */
function stemOf(word: string): string {
  if (word.length > 5 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 4 && word.endsWith("s")) return word.slice(0, -1);
  return word;
}

function serviceMatchers(s: ServicioAsistente): RegExp[] {
  const stems = new Set<string>();
  for (const word of normalizeText(s.nombre).split(" ")) {
    /* Tres letras como mínimo, no cuatro: "gel" es justo la palabra por la que se pregunta. */
    if (word.length < 3 || SERVICE_STOPWORDS.has(word)) continue;
    stems.add(stemOf(word));
  }
  const matchers = [...stems].map((stem) => new RegExp(`\\b${escapeRegExp(stem)}`, "u"));
  const synonyms = SERVICE_SYNONYMS[s.slug];
  if (synonyms) matchers.push(compile(synonyms));
  return matchers;
}

/**
 * Servicios cuyo nombre aparece en el texto: los de MAYOR coincidencia, en el orden del catálogo y
 * como mucho tres. "manicura rusa" casa dos palabras con la rusa y una con las demás manicuras, así
 * que sale solo la rusa; "manicura" a secas empata las tres y salen las tres.
 */
export function matchServicios(text: string, servicios: readonly ServicioAsistente[]): ServicioAsistente[] {
  const scored = servicios
    .map((s) => ({ s, score: serviceMatchers(s).reduce((n, re) => (re.test(text) ? n + 1 : n), 0) }))
    .filter((e) => e.score > 0);
  if (!scored.length) return [];
  const best = Math.max(...scored.map((e) => e.score));
  return scored
    .filter((e) => e.score === best)
    .slice(0, 3)
    .map((e) => e.s);
}

/* ────────────────────────────────────────────────────────────
   Detección de intención
   ──────────────────────────────────────────────────────────── */
export type OfflineIntent =
  | { kind: "greeting" }
  | { kind: "thanks" }
  | { kind: "health" }
  | { kind: "cancel" }
  | { kind: "walkIn" }
  | { kind: "bonos" }
  | { kind: "duration"; servicios: ServicioAsistente[] }
  | { kind: "booking"; servicios: ServicioAsistente[] }
  | { kind: "payment" }
  | { kind: "prices"; servicios: ServicioAsistente[] }
  | { kind: "hours" }
  | { kind: "location" }
  | { kind: "kids" }
  | { kind: "contact" }
  | { kind: "gallery" }
  | { kind: "team" }
  | { kind: "service"; servicios: ServicioAsistente[] }
  | { kind: "services" }
  | { kind: "fallback" };

/**
 * Intención del último mensaje (texto YA normalizado). Exportado para poder probarlo.
 *
 * ORDEN DE DESEMPATE, y cada posición tiene su porqué:
 *  1. Salud, lo primero: «soy alérgica al gel, ¿puedo reservar?» tiene que llevarse la respuesta
 *     prudente, no el enlace de la reserva.
 *  2. Cancelar antes que reservar: «cancelar mi reserva» lleva "reserv".
 *  3. Sin cita antes que reservar: «¿atendéis sin cita?» lleva "cita".
 *  4. Bonos antes que pago y precios: «tarjeta regalo» lleva "tarjeta», «¿cuánto cuesta un bono?»
 *     lleva "cuesta", y la respuesta buena es la de los bonos.
 *  5. Duración antes que reservar: «¿cuánto dura la cita?».
 *  6. Precios y horario antes que los servicios sueltos: «¿cuánto cuesta la pedicura?» es una
 *     pregunta de precio aunque nombre un servicio.
 *  7. Saludo y gracias al final: «hola, ¿qué horario tenéis?» es una pregunta de horario.
 */
export function detectIntent(text: string, servicios: readonly ServicioAsistente[] = []): OfflineIntent {
  const matched = matchServicios(text, servicios);

  if (KW.health.test(text)) return { kind: "health" };
  if (KW.cancel.test(text)) return { kind: "cancel" };
  if (KW.walkIn.test(text)) return { kind: "walkIn" };
  if (KW.bonos.test(text)) return { kind: "bonos" };
  if (KW.duration.test(text)) return { kind: "duration", servicios: matched };
  if (KW.booking.test(text)) return { kind: "booking", servicios: matched };
  if (KW.payment.test(text)) return { kind: "payment" };
  if (KW.prices.test(text)) return { kind: "prices", servicios: matched };
  if (KW.hours.test(text)) return { kind: "hours" };
  if (KW.location.test(text)) return { kind: "location" };
  if (KW.kids.test(text)) return { kind: "kids" };
  if (KW.contact.test(text)) return { kind: "contact" };
  if (KW.gallery.test(text)) return { kind: "gallery" };
  if (KW.team.test(text)) return { kind: "team" };
  if (matched.length) return { kind: "service", servicios: matched };
  if (KW.services.test(text)) return { kind: "services" };
  if (KW.thanks.test(text)) return { kind: "thanks" };
  if (KW.greeting.test(text)) return { kind: "greeting" };
  return { kind: "fallback" };
}

/* ────────────────────────────────────────────────────────────
   Construcción de respuestas
   ──────────────────────────────────────────────────────────── */
export interface OfflineOptions {
  /** Servicios normalizados (fixture o base de datos). Sin ellos, el motor manda a la página de servicios. */
  servicios?: readonly ServicioAsistente[];
  /** Instante de referencia para el horario (por defecto, ahora). */
  now?: Date;
  /** Página desde la que se pregunta: en /servicios no se manda a /servicios. */
  page?: AsistentePage;
  locale?: Locale;
}

interface AnswerContext {
  m: Messages;
  o: Messages["chat"]["offline"];
  servicios: readonly ServicioAsistente[];
  page: AsistentePage;
  now: Date;
  locale: Locale;
  /** Marcadores comunes a todas las plantillas: format() ignora los que no usa. */
  vars: Record<string, string>;
}

function joinParagraphs(...parts: Array<string | readonly string[] | null | undefined>): string {
  return parts
    .map((p) => (p == null ? "" : typeof p === "string" ? p : p.join("\n")))
    .filter((p) => p.length > 0)
    .join("\n\n");
}

function t(ctx: AnswerContext, template: string, extra: Record<string, string | number> = {}): string {
  return format(template, { ...ctx.vars, ...extra });
}

/** Línea de precio: "**Manicura completa** — 25 €" o "… — precio en el salón, pregúntanos". */
function priceLine(s: ServicioAsistente, ctx: AnswerContext): string {
  const price = precioDe(s);
  return price ? t(ctx, ctx.o.line, { name: s.nombre, price }) : t(ctx, ctx.o.linePriceUnknown, { name: s.nombre });
}

function durationLine(s: ServicioAsistente, ctx: AnswerContext): string {
  return s.duracionMin
    ? t(ctx, ctx.o.lineDuration, { name: s.nombre, minutes: s.duracionMin })
    : t(ctx, ctx.o.lineDurationUnknown, { name: s.nombre });
}

/** Lista agrupada por categoría (en el orden del catálogo), con la línea que se le pida. */
function groupedList(servicios: readonly ServicioAsistente[], ctx: AnswerContext, line: (s: ServicioAsistente) => string): string[] {
  const grupos = new Map<string, ServicioAsistente[]>();
  for (const s of servicios) {
    const key = s.categoria ?? "";
    const grupo = grupos.get(key);
    if (grupo) grupo.push(s);
    else grupos.set(key, [s]);
  }
  const lines: string[] = [];
  const conTitulos = grupos.size > 1;
  for (const [categoria, lista] of grupos) {
    if (conTitulos && categoria) lines.push(t(ctx, ctx.o.lineCategory, { category: categoria }));
    for (const s of lista) lines.push(`- ${line(s)}`);
  }
  return lines;
}

function answerHealth(ctx: AnswerContext): string {
  return joinParagraphs(faqAnswer("alergias", ctx.m) ?? ctx.o.healthFallback, t(ctx, ctx.o.healthExtra));
}

function answerCancel(ctx: AnswerContext): string {
  return joinParagraphs(faqAnswer("cancelar", ctx.m), t(ctx, ctx.o.cancelExtra));
}

function answerBooking(servicios: readonly ServicioAsistente[], ctx: AnswerContext): string {
  const directos = servicios
    .map((s) => ({ s, url: reservaDe(s, ctx.locale) }))
    .filter((e): e is { s: ServicioAsistente; url: string } => e.url !== null)
    .map((e) => `- ${t(ctx, ctx.o.serviceBook, { name: e.s.nombre, url: e.url })}`);
  return joinParagraphs(t(ctx, ctx.o.booking), directos, t(ctx, ctx.o.bookingAlt));
}

function answerWalkIn(ctx: AnswerContext): string {
  const faq = faqAnswer("sin-cita", ctx.m);
  return faq ? joinParagraphs(faq, t(ctx, ctx.o.walkInExtra)) : answerBooking([], ctx);
}

function answerBonos(ctx: AnswerContext): string {
  return joinParagraphs(faqAnswer("bonos", ctx.m), ctx.page === "bonos" ? ctx.o.bonosLinkHere : t(ctx, ctx.o.bonosLink));
}

function answerDuration(matched: readonly ServicioAsistente[], ctx: AnswerContext): string {
  /* Sin servicio concreto, la respuesta que el salón ya ha escrito para «¿cuánto dura?». */
  if (!matched.length) {
    const faq = faqAnswer("duracion", ctx.m);
    if (faq) return faq;
  }
  const lista = matched.length ? matched : ctx.servicios;
  if (!lista.length) return t(ctx, ctx.o.servicesNone);
  return joinParagraphs(
    [ctx.o.durationIntro, ...lista.map((s) => `- ${durationLine(s, ctx)}`)],
    lista.some((s) => s.pendiente) ? ctx.o.durationPending : null,
    ctx.o.durationOutro,
  );
}

function answerPayment(ctx: AnswerContext): string {
  return faqAnswer("pago", ctx.m) ?? t(ctx, ctx.o.contact);
}

function answerPrices(matched: readonly ServicioAsistente[], ctx: AnswerContext): string {
  if (!ctx.servicios.length) return t(ctx, ctx.o.pricesNone);
  const lista = matched.length ? matched : ctx.servicios;
  const lines = matched.length ? matched.map((s) => `- ${priceLine(s, ctx)}`) : groupedList(lista, ctx, (s) => priceLine(s, ctx));
  return joinParagraphs(
    [matched.length ? ctx.o.pricesMatchIntro : ctx.o.pricesIntro, ...lines],
    lista.some((s) => s.precioCents === null) ? t(ctx, ctx.o.pricesUnknown) : null,
    lista.some((s) => s.pendiente) ? ctx.o.pricesPending : null,
    ctx.page === "servicios" ? null : t(ctx, ctx.o.pricesOutro),
  );
}

function answerHours(ctx: AnswerContext): string {
  const status = getOpenStatus(ctx.now);
  return joinParagraphs(
    [ctx.o.hoursIntro, ...hoursLines(ctx.m).map((l) => `- ${l}`)],
    t(ctx, ctx.o.hoursNow, { status: describeOpenStatus(status, ctx.m) }),
    /* Mientras Andrea no confirme el horario, el pie y la página de contacto lo dicen al lado: aquí
       también. Un «abierto ahora» con un horario sin confirmar es una promesa a medias. */
    BUSINESS.hoursPending ? t(ctx, ctx.o.hoursPending) : null,
  );
}

function answerLocation(ctx: AnswerContext): string {
  /* La pregunta frecuente de aparcar ya empieza diciendo la dirección: con ella, solo falta el
     enlace; sin ella, la plantilla completa. */
  const faq = faqAnswer("aparcar", ctx.m);
  return faq ? joinParagraphs(faq, t(ctx, ctx.o.locationDirections)) : t(ctx, ctx.o.location);
}

function answerService(servicios: readonly ServicioAsistente[], ctx: AnswerContext): string {
  const cards = servicios.map((s) => {
    const pending = s.pendiente ? ctx.o.pendingSuffix : "";
    /* Si el servicio tiene su propia pregunta frecuente (la manicura rusa), manda esa: es la
       explicación que el salón ha escrito, no la línea corta del catálogo. */
    const explicacion = faqAnswer(s.slug, ctx.m) ?? s.descripcion;
    const price = precioDe(s);
    const url = reservaDe(s, ctx.locale);
    return [
      explicacion ? t(ctx, ctx.o.serviceInfo, { name: s.nombre, description: explicacion }) : t(ctx, ctx.o.serviceTitle, { name: s.nombre }),
      price ? t(ctx, ctx.o.servicePrice, { price, pending }) : ctx.o.servicePriceUnknown,
      s.duracionMin ? t(ctx, ctx.o.serviceDuration, { minutes: s.duracionMin, pending }) : null,
      url ? t(ctx, ctx.o.serviceBook, { name: s.nombre, url }) : t(ctx, ctx.o.serviceNotOnline),
    ]
      .filter(Boolean)
      .join(" ");
  });
  return joinParagraphs(...cards);
}

function answerServices(ctx: AnswerContext): string {
  if (!ctx.servicios.length) return t(ctx, ctx.o.servicesNone);
  return joinParagraphs(
    [ctx.o.servicesIntro, ...groupedList(ctx.servicios, ctx, (s) => t(ctx, ctx.o.serviceTitle, { name: s.nombre }))],
    ctx.page === "servicios" ? ctx.o.servicesOutroHere : t(ctx, ctx.o.servicesOutro),
  );
}

function answerFallback(ctx: AnswerContext): string {
  return joinParagraphs(ctx.o.fallback, ctx.o.fallbackItems.map((i) => `- ${i}`), t(ctx, ctx.o.fallbackContact));
}

/** Último mensaje del usuario del historial (texto plano). */
function lastUserText(messages: ReadonlyArray<AsistenteTurn>): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return turnText(messages[i]);
  }
  return "";
}

/**
 * Respuesta determinista al último mensaje del usuario (markdown ligero).
 * Nunca lanza: ante cualquier texto devuelve como mínimo la respuesta de ayuda.
 *
 * Los textos salen siempre del castellano: es el único idioma publicado (`LOCALES`). Cuando se
 * publique el gallego, su `chat` traducido se mezcla aquí igual que hace `getMessages`.
 */
export function answerOffline(messages: ReadonlyArray<AsistenteTurn>, options: OfflineOptions = {}): string {
  const m = es;
  const locale = options.locale ?? "es";
  const l = enlaces(locale, m);
  const ctx: AnswerContext = {
    m,
    o: m.chat.offline,
    servicios: options.servicios ?? [],
    page: options.page ?? "home",
    now: options.now ?? new Date(),
    locale,
    vars: {
      phone: BUSINESS.phone.display,
      tel: BUSINESS.phone.tel,
      whatsapp: BUSINESS.whatsapp.url,
      address: BUSINESS.address.full,
      directions: BUSINESS.directions,
      instagram: BUSINESS.social.instagram,
      instagramHandle: BUSINESS.social.instagramHandle,
      reservar: l.reservar,
      servicios: l.servicios,
      bonos: l.bonos,
      equipo: l.equipo,
      galeria: l.galeria,
    },
  };

  const text = normalizeText(lastUserText(messages));
  const intent: OfflineIntent = text ? detectIntent(text, ctx.servicios) : { kind: "greeting" };
  const o = ctx.o;

  switch (intent.kind) {
    case "greeting":
      return o.greeting;
    case "thanks":
      return t(ctx, o.thanks);
    case "health":
      return answerHealth(ctx);
    case "cancel":
      return answerCancel(ctx);
    case "walkIn":
      return answerWalkIn(ctx);
    case "bonos":
      return answerBonos(ctx);
    case "duration":
      return answerDuration(intent.servicios, ctx);
    case "booking":
      return answerBooking(intent.servicios, ctx);
    case "payment":
      return answerPayment(ctx);
    case "prices":
      return answerPrices(intent.servicios, ctx);
    case "hours":
      return answerHours(ctx);
    case "location":
      return answerLocation(ctx);
    case "kids":
      return faqAnswer("ninos", m) ?? answerFallback(ctx);
    case "contact":
      return t(ctx, o.contact);
    case "gallery":
      return t(ctx, o.gallery);
    case "team":
      return t(ctx, o.team);
    case "service":
      return answerService(intent.servicios, ctx);
    case "services":
      return answerServices(ctx);
    case "fallback":
      return answerFallback(ctx);
  }
}
