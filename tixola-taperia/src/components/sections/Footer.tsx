"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useSyncExternalStore } from "react";
import { ArrowUp, ArrowUpRight, Clock, Cookie, MapPin, MessageCircle, Navigation, Phone, Utensils } from "lucide-react";
import { BUSINESS, type DayKey, type TimeRange } from "@/data/business";
import { formatNumber } from "@/lib/format";
import { LEGAL_DOC_KEYS } from "@/data/legal";
import Logo from "@/components/ui/Logo";
import { useNavItems } from "@/components/ui/Navbar";
import { useLocalizedOpenStatus } from "@/components/ui/ReservationModal";
import { PlatformGlyph, Stars } from "@/components/ui/ReviewCard";
import { useReservation } from "@/components/ui/ReservationProvider";
import { LOCALES, LOCALE_META, localePath, stripLocale } from "@/i18n/config";
import { useFormat, useLocale, useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { openCookieSettings } from "@/lib/consent";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Datos y utilidades
   ────────────────────────────────────────────────────────────── */

const WEEK: readonly DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const HOURS = BUSINESS.hours as Record<DayKey, TimeRange[]>;

/* "Reloj" externo: el cliente refresca el año cada minuto (Nochevieja) y el servidor devuelve el
   año del despliegue, que le llega como prop desde el Server Component. Nada de literales: las
   páginas son estáticas, así que un "2026" escrito a mano se quedaría congelado en el HTML
   prerenderizado —y en lo que ven los rastreadores— hasta el siguiente despliegue. */
function subscribeMinute(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
}
const getYear = () => String(new Date().getFullYear());

/** "12:00–16:00 · 20:00–00:00" (sin depender del "Cerrado" en español de formatRanges). */
function rangesLabel(ranges: TimeRange[], closed: string) {
  if (!ranges.length) return closed;
  return ranges.map((r) => `${r.open}–${r.close}`).join(" · ");
}

/* `min-h-11` (44 px) en móvil y `min-h-8` (32 px) a partir de `md`: el dedo necesita 44 px, el
   ratón no, y en escritorio esos 12 px extra por enlace estiraban las columnas sin motivo.
   Se descartó agrandar solo el área de pulsación con un `::after` superpuesto: en una lista
   vertical de filas de 32 px los rectángulos invisibles de enlaces contiguos se pisarían y el
   toque acabaría en el enlace de al lado. */
const linkClass =
  "group inline-flex min-h-11 items-center gap-1.5 py-1 text-sm text-cream-muted transition-colors duration-300 hover:text-cream md:min-h-8";
const headingClass = "mb-4 font-caps text-[11px] uppercase tracking-[0.3em] text-pimenton-a11y";

/* ──────────────────────────────────────────────────────────────
   Footer
   ────────────────────────────────────────────────────────────── */

/**
 * Pie de página: marca + descripción + plataformas, contacto, horario semanal (día de hoy
 * resaltado, estado en vivo localizado) y enlaces. Marca de agua "TIXOLA" en Cinzel, barra
 * inferior con ©, enlaces legales, "Configurar cookies" (evento para el módulo legal),
 * crédito de diseño y "Volver arriba". Todo el texto sale de m.footer / m.common.
 */
export interface FooterProps {
  /** Año del copyright calculado en el servidor (se hornea en el HTML/RSC de cada despliegue). */
  year: number;
}

export default function Footer({ year: buildYear }: FooterProps) {
  const m = useMessages();
  const t = useFormat();
  const lp = useLocalePath();
  const locale = useLocale();
  const { open: openReservation } = useReservation();
  const navItems = useNavItems();
  const pathname = usePathname();
  const status = useLocalizedOpenStatus();
  const serverYear = useCallback(() => String(buildYear), [buildYear]);
  const year = useSyncExternalStore(subscribeMinute, getYear, serverYear);

  const scrollToTop = useCallback(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, []);

  const fmtRating = (v: number) => formatNumber(v, locale, { decimals: 1 });
  const google = BUSINESS.ratings.google;
  const trip = BUSINESS.ratings.tripadvisor;

  return (
    <footer id="footer" className="noise after:noise-after relative isolate overflow-hidden bg-iron-900 text-cream">
      <div aria-hidden className="divider-iron absolute inset-x-0 top-0" />
      {/* Brasa lateral: 420² px de `blur-3xl` sobre un color plano. El mismo halo, horneado.
          `ember-wash` y no `ember-glow`: el original era un color PLANO al que el desenfoque solo plumeaba el borde, así que un radial de pico y caída rápida perdía ~3,5 veces de luz. Alfa igual que el original. */}
      <div
        aria-hidden
        className="ember-wash absolute -left-40 top-1/3 -z-10 h-[420px] w-[420px] rounded-full [--ember-a1:0.6] [--ember-rgb:58_14_19]"
      />
      {/* Marca de agua en Cinzel */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-[0.12em] left-1/2 -z-10 -translate-x-1/2 select-none whitespace-nowrap font-caps text-[26vw] font-semibold leading-none tracking-[0.08em] text-cream/[0.035] md:text-[19vw] lg:text-[14rem]"
      >
        TIXOLA
      </span>

      <div className="container-page relative pt-16 md:pt-20">
        {/* Una sola columna en móvil. El `max-md:grid-cols-2` anterior repartía los 288 px útiles
            de un iPhone de 320 en dos columnas de 132 px, y ahí no cabe NADA de esto: el logotipo
            son 250 px (viewBox 208×40 a 48 px de alto) con `shrink-0`, así que se salía de su
            celda y se plantaba encima de «CONTACTO» y de la dirección —el solape de la captura
            del cliente—, y cada tramo de horario («12:00–16:00 · 20:00–00:00», ~175 px) se partía
            en tres o cuatro líneas. Medido: aquel apaño no ahorraba scroll, lo empeoraba a base de
            líneas partidas (1.595 px a 320 px frente a 1.754 apilado; en inglés y portugués, más).
            El ahorro real se busca DENTRO de cada bloque —donde el contenido sí es corto—: los
            enlaces de contacto en fila, la lista de enlaces a dos columnas y la barra inferior
            aligerada. Así el logotipo y la tabla de horario siempre tienen los 288 px que piden. */}
        <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:grid-cols-[1.4fr_1fr_1.1fr_1fr] lg:gap-10">
          {/* Marca */}
          <div>
            <Link href={lp("/")} aria-label={m.nav.homeAria} className="inline-block rounded-md">
              <Logo size="lg" decorative />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream-muted text-pretty">{m.footer.about}</p>
            <p className="mt-3 font-display text-base italic leading-snug text-cream-faint">{m.footer.tixolaMeaning}</p>

            <ul className="mt-6 flex flex-wrap gap-2" aria-label={m.footer.ratingsAria}>
              <li>
                <a
                  href={BUSINESS.social.googleReviews}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t(m.common.misc.ratingLabel, { value: fmtRating(google.value), count: google.count })} · ${m.common.misc.newTab}`}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-cream/12 bg-cream/[0.06] py-1.5 pl-2.5 pr-3 text-xs text-cream-200 shadow-glass transition-colors hover:border-cream/30 hover:text-cream"
                >
                  <PlatformGlyph source="Google" />
                  <span className="font-semibold">{fmtRating(google.value)}</span>
                  <Stars rating={google.value} size="sm" />
                </a>
              </li>
              <li>
                <a
                  href={BUSINESS.social.tripadvisor}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${trip.label} ${fmtRating(trip.value)} · ${trip.award} · ${m.common.misc.newTab}`}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-cream/12 bg-cream/[0.06] py-1.5 pl-2.5 pr-3 text-xs text-cream-200 shadow-glass transition-colors hover:border-cream/30 hover:text-cream"
                >
                  <PlatformGlyph source="TripAdvisor" />
                  <span className="font-semibold">{fmtRating(trip.value)}</span>
                  <span className="text-cream-faint">{trip.award}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h2 className={headingClass}>{m.footer.contact}</h2>
            <address className="flex flex-col gap-2 not-italic">
              <a
                href={BUSINESS.social.directions}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${BUSINESS.address.full} · ${m.common.cta.openMaps}`}
                className={cn(linkClass, "items-start")}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pimenton-light" aria-hidden />
                <span>
                  {BUSINESS.address.street}
                  <br />
                  {BUSINESS.address.postalCode} {BUSINESS.address.city}
                  <br />
                  {/* Equivalente localizado de BUSINESS.address.landmark (que está solo en español). */}
                  <span className="text-xs text-cream-faint">{m.experience.map.subtitle}</span>
                </span>
              </a>
              {/* En móvil los tres atajos van en fila que envuelve: caben dos por línea a 320 px
                  (~110 px cada uno) y ahorran una fila de 44 px sin estrechar nada. `md:contents`
                  disuelve el envoltorio en escritorio para que sigan siendo hijos directos del
                  `flex-col gap-2` y la columna no cambie. */}
              <div className="flex flex-wrap gap-x-5 md:contents">
              <a href={BUSINESS.phone.tel} aria-label={t(m.common.cta.callNumber, { phone: BUSINESS.phone.display })} className={linkClass}>
                <Phone className="h-4 w-4 shrink-0 text-pimenton-light" aria-hidden />
                <span className="tabular-nums">{BUSINESS.phone.display}</span>
              </a>
              <a href={BUSINESS.phone.whatsapp} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <MessageCircle className="h-4 w-4 shrink-0 text-pimenton-light" aria-hidden />
                {m.common.cta.whatsapp}
              </a>
              <a href={BUSINESS.social.directions} target="_blank" rel="noopener noreferrer" aria-label={m.common.cta.directionsAria} className={linkClass}>
                <Navigation className="h-4 w-4 shrink-0 text-pimenton-light" aria-hidden />
                {m.common.cta.directions}
                <ArrowUpRight className="h-3.5 w-3.5 text-cream-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </a>
              </div>
            </address>
            <button
              type="button"
              onClick={openReservation}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border border-pimenton-light/50 px-4 text-sm font-semibold text-cream transition-all duration-300 hover:border-pimenton-light hover:bg-pimenton/20 hover:shadow-neon"
            >
              <Utensils className="h-4 w-4 text-pimenton-light" aria-hidden />
              {m.nav.reserveTable}
            </button>
          </div>

          {/* Horario */}
          <div>
            <h2 className={cn(headingClass, "flex flex-wrap items-center gap-3")}>
              {m.footer.hours}
              {status && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-sans text-[10px] font-bold normal-case tracking-[0.12em]",
                    status.isOpen
                      ? status.closingSoon
                        ? "border-amber-400/40 text-amber-300"
                        : "border-emerald-400/40 text-emerald-300"
                      : "border-cream/15 text-cream-faint",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      status.isOpen
                        ? status.closingSoon
                          ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]"
                          : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                        : "bg-cream/30",
                    )}
                    aria-hidden
                  />
                  {status.label}
                </span>
              )}
            </h2>
            <table className="w-full text-sm">
              <caption className="sr-only">{t(m.footer.hoursCaption, { name: BUSINESS.name })}</caption>
              <tbody>
                {WEEK.map((key) => {
                  const ranges = HOURS[key];
                  const today = status?.todayKey === key;
                  return (
                    <tr
                      key={key}
                      aria-current={today ? "date" : undefined}
                      className={cn("border-b border-cream/[0.06] transition-colors", today ? "text-cream" : "text-cream-muted")}
                    >
                      <th scope="row" className="py-1.5 pr-3 text-left font-medium">
                        <span className="inline-flex items-center gap-2">
                          <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", today ? "bg-pimenton-light shadow-neon" : "bg-transparent")} />
                          {m.common.days[key]}
                          {today && <span className="sr-only"> {m.footer.todaySr}</span>}
                        </span>
                      </th>
                      <td className={cn("py-1.5 text-right tabular-nums", !ranges.length && "text-cream-faint", today && "font-semibold")}>
                        {rangesLabel(ranges, m.footer.closedDay)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-cream-faint">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {m.footer.kitchenNote}
            </p>
          </div>

          {/* Carta / Enlaces */}
          <div>
            <h2 className={headingClass}>{m.footer.links}</h2>
            {/* Dos columnas en móvil: son siete etiquetas cortas (la más larga, «Carta con
                alérgenos», parte en dos líneas y ya está), así que pasan de siete filas de 44 px a
                cuatro. Aquí sí funciona lo que no funcionaba en la rejilla general: el contenido
                del bloque cabe en 132 px. */}
            <ul className="grid grid-cols-2 gap-x-4 md:grid-cols-1 md:gap-1">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link href={lp(item.href)} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={lp("/carta")} className={cn(linkClass, "text-cream")}>
                  <Utensils className="h-3.5 w-3.5 text-pimenton-light" aria-hidden />
                  {m.footer.menuWithAllergens}
                </Link>
              </li>
              {/* El filete separador solo en escritorio: en la rejilla de dos columnas dejaría una
                  raya suelta a mitad de una fila. */}
              <li className="md:mt-2 md:border-t md:border-cream/[0.06] md:pt-3">
                <a href={BUSINESS.social.tripadvisor} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  <PlatformGlyph source="TripAdvisor" className="h-3.5 w-3.5" />
                  {trip.label}
                  <ArrowUpRight className="h-3.5 w-3.5 text-cream-faint" aria-hidden />
                </a>
              </li>
              <li>
                <a href={BUSINESS.social.googleReviews} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  <PlatformGlyph source="Google" className="h-3.5 w-3.5" />
                  {google.label}
                  <ArrowUpRight className="h-3.5 w-3.5 text-cream-faint" aria-hidden />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra inferior: legal + © + crédito + volver arriba */}
        <div className="mt-10 border-t border-cream/10 py-6 md:mt-20">
          <nav aria-label={m.footer.legal} className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {/* Los slugs viven en m.legal.<doc>.slug (misma fuente que el banner, LegalArticle y el sitemap). */}
            {LEGAL_DOC_KEYS.map((key) => (
              <Link key={key} href={lp(`/legal/${m.legal[key].slug}`)} className={cn(linkClass, "text-xs")}>
                {m.footer[key]}
              </Link>
            ))}
            <button type="button" onClick={openCookieSettings} className={cn(linkClass, "text-xs")}>
              <Cookie className="h-3.5 w-3.5 text-cream-faint transition-colors group-hover:text-gold" aria-hidden />
              {m.footer.cookieSettings}
            </button>
          </nav>

          {/* Idiomas: los ÚNICOS enlaces a las otras versiones que están siempre en el HTML. El
              selector de la cabecera solo existe con el desplegable (o el menú móvil) abierto, así
              que sin esta fila ni un rastreador ni nadie con el menú cerrado tendría un enlace a
              /gl, /en o /pt: solo el hreflang del <head> y el sitemap. */}
          <nav aria-label={m.nav.languageSwitcher} className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-caps text-[10px] uppercase tracking-[0.3em] text-cream-faint">{m.nav.language.label}</span>
            {LOCALES.map((loc) => {
              const meta = LOCALE_META[loc];
              const active = loc === locale;
              return (
                <Link
                  key={loc}
                  href={localePath(loc, stripLocale(pathname ?? "/").path)}
                  hrefLang={meta.hreflang}
                  lang={meta.hreflang}
                  aria-current={active ? "true" : undefined}
                  aria-label={t(active ? m.nav.language.current : m.nav.language.switchTo, { language: meta.native })}
                  className={cn(linkClass, "text-xs", active && "text-cream")}
                >
                  {meta.native}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 flex flex-col items-start gap-4 text-xs text-cream-faint md:flex-row md:items-center md:justify-between">
            <p>
              © {year} {BUSINESS.legalName}
              {/* La dirección se repite tres bloques más arriba y en móvil le costaba dos líneas
                  enteras a 320 px; en escritorio, donde la línea sobra de ancho, se queda. */}
              <span className="max-md:hidden">
                {" "}
                · {BUSINESS.address.street} · {BUSINESS.address.city}
              </span>{" "}
              · {m.footer.rights}
            </p>
            <div className="flex w-full items-center justify-between gap-4 md:w-auto md:justify-end">
              <p>
                {m.footer.credit} <span className="text-cream-muted">{m.footer.creditBy}</span>
              </p>
              <button
                type="button"
                onClick={scrollToTop}
                className="group inline-flex h-11 items-center gap-2 rounded-full border border-cream/15 px-4 font-caps text-[11px] uppercase tracking-[0.25em] text-cream-200 transition-all duration-300 hover:border-pimenton-light/60 hover:text-cream hover:shadow-neon"
              >
                {m.footer.backToTop}
                <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
