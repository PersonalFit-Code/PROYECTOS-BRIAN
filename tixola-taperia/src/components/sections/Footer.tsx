"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";
import { ArrowUp, ArrowUpRight, Clock, MapPin, MessageCircle, Navigation, Phone, Utensils } from "lucide-react";
import { BUSINESS, DAY_LABELS, NAV_LINKS, type DayKey, type TimeRange } from "@/data/business";
import Logo from "@/components/ui/Logo";
import { PlatformGlyph, Stars } from "@/components/ui/ReviewCarousel";
import { useReservation } from "@/components/ui/ReservationProvider";
import { formatRanges, getOpenStatus } from "@/lib/openStatus";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Datos y utilidades
   ────────────────────────────────────────────────────────────── */

const WEEK: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const HOURS = BUSINESS.hours as Record<DayKey, TimeRange[]>;

/**
 * Crédito de diseño. Sustituir por el estudio/autor real antes de publicar.
 * (Texto de relleno acordado en el brief.)
 */
const DESIGN_CREDIT = { label: "Diseño web", by: "Tu estudio", href: "#" };

/* "Reloj" externo: valores dependientes de la fecha solo en cliente (evita desajustes de
   hidratación) y refrescados cada minuto. Devuelven primitivos, estables entre llamadas. */
function subscribeMinute(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
}
const getTodayKey = (): DayKey | "" => getOpenStatus().todayKey;
const getStatusLabel = () => getOpenStatus().label;
const getIsOpen = () => (getOpenStatus().isOpen ? "1" : "0");
const getYear = () => String(new Date().getFullYear());
const serverEmpty = () => "";

const fmtRating = (v: number) => v.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const linkClass =
  "group inline-flex items-center gap-1.5 py-1 text-sm text-cream-muted transition-colors duration-300 hover:text-cream";
const headingClass = "mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-pimenton-light";

/* ──────────────────────────────────────────────────────────────
   Footer
   ────────────────────────────────────────────────────────────── */

/**
 * Pie de página: marca + descripción + plataformas, contacto, horario semanal (con el día de hoy
 * resaltado) y enlaces. Marca de agua "TIXOLA" gigante en Bebas Neue y barra inferior con ©,
 * dirección, crédito de diseño y "Volver arriba".
 */
export default function Footer() {
  const { open: openReservation } = useReservation();

  const todayKey = useSyncExternalStore(subscribeMinute, getTodayKey, serverEmpty);
  const statusLabel = useSyncExternalStore(subscribeMinute, getStatusLabel, serverEmpty);
  const isOpen = useSyncExternalStore(subscribeMinute, getIsOpen, serverEmpty) === "1";
  const year = useSyncExternalStore(subscribeMinute, getYear, serverEmpty) || "2026";

  const scrollToTop = useCallback(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, []);

  const google = BUSINESS.ratings.google;
  const trip = BUSINESS.ratings.tripadvisor;

  return (
    <footer id="footer" className="noise after:noise-after relative isolate overflow-hidden bg-iron-900 text-cream">
      <div aria-hidden className="divider-iron absolute inset-x-0 top-0" />
      {/* Brasa lateral */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/3 -z-10 h-[420px] w-[420px] rounded-full bg-burgundy/60 blur-3xl"
      />
      {/* Marca de agua */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-[0.18em] left-1/2 -z-10 -translate-x-1/2 select-none whitespace-nowrap font-condensed text-[34vw] leading-none tracking-wider text-cream/[0.035] md:text-[24vw] lg:text-[18rem]"
      >
        TIXOLA
      </span>

      <div className="container-page relative pt-16 md:pt-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.1fr_1fr] lg:gap-10">
          {/* Marca */}
          <div>
            <Link href="/" aria-label="Tixola Tapería — inicio" className="inline-block">
              <Logo size={40} decorative />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream-muted text-pretty">{BUSINESS.description}</p>
            <p className="mt-3 text-xs italic text-cream-faint">
              «Tixola» es sartén en gallego: la de hierro que llega a la mesa aún chisporroteando.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Valoraciones">
              <li>
                <a
                  href={BUSINESS.social.googleReviews}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass inline-flex items-center gap-2 rounded-full py-1.5 pl-2.5 pr-3 text-xs text-cream-200 transition-colors hover:border-cream/30 hover:text-cream"
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
                  className="glass inline-flex items-center gap-2 rounded-full py-1.5 pl-2.5 pr-3 text-xs text-cream-200 transition-colors hover:border-cream/30 hover:text-cream"
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
            <h2 className={headingClass}>Contacto</h2>
            <address className="flex flex-col gap-3 not-italic">
              <a href={BUSINESS.social.directions} target="_blank" rel="noopener noreferrer" className={cn(linkClass, "items-start")}>
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pimenton-light" aria-hidden />
                <span>
                  {BUSINESS.address.street}
                  <br />
                  {BUSINESS.address.postalCode} {BUSINESS.address.city}
                  <br />
                  <span className="text-xs text-cream-faint">{BUSINESS.address.landmark}</span>
                </span>
              </a>
              <a href={BUSINESS.phone.tel} className={linkClass}>
                <Phone className="h-4 w-4 shrink-0 text-pimenton-light" aria-hidden />
                <span className="tabular-nums">{BUSINESS.phone.display}</span>
              </a>
              <a href={BUSINESS.phone.whatsapp} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <MessageCircle className="h-4 w-4 shrink-0 text-pimenton-light" aria-hidden />
                WhatsApp
              </a>
              <a href={BUSINESS.social.directions} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <Navigation className="h-4 w-4 shrink-0 text-pimenton-light" aria-hidden />
                Cómo llegar
                <ArrowUpRight className="h-3.5 w-3.5 text-cream-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </a>
            </address>
            <button
              type="button"
              onClick={openReservation}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border border-pimenton-light/50 px-4 text-sm font-semibold text-cream transition-all duration-300 hover:border-pimenton-light hover:bg-pimenton/20 hover:shadow-neon"
            >
              <Utensils className="h-4 w-4 text-pimenton-light" aria-hidden />
              Reservar mesa
            </button>
          </div>

          {/* Horario */}
          <div>
            <h2 className={cn(headingClass, "flex items-center gap-3")}>
              Horario
              {statusLabel && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-[0.12em]",
                    isOpen ? "border-emerald-400/40 text-emerald-300" : "border-cream/15 text-cream-faint",
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", isOpen ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" : "bg-cream/30")} aria-hidden />
                  {statusLabel}
                </span>
              )}
            </h2>
            <table className="w-full text-sm">
              <caption className="sr-only">Horario semanal de {BUSINESS.name}</caption>
              <tbody>
                {WEEK.map((key) => {
                  const ranges = HOURS[key];
                  const today = key === todayKey;
                  return (
                    <tr
                      key={key}
                      aria-current={today ? "date" : undefined}
                      className={cn(
                        "border-b border-cream/[0.06] transition-colors",
                        today ? "text-cream" : "text-cream-muted",
                      )}
                    >
                      <th scope="row" className="py-1.5 pr-3 text-left font-medium">
                        <span className="inline-flex items-center gap-2">
                          <span
                            aria-hidden
                            className={cn("h-1.5 w-1.5 rounded-full", today ? "bg-pimenton-light shadow-neon" : "bg-transparent")}
                          />
                          {DAY_LABELS[key]}
                          {today && <span className="sr-only"> (hoy)</span>}
                        </span>
                      </th>
                      <td className={cn("py-1.5 text-right tabular-nums", !ranges.length && "text-cream-faint", today && "font-semibold")}>
                        {formatRanges(ranges)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-cream-faint">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Cocina abierta de forma continuada en cada tramo.
            </p>
          </div>

          {/* Carta / Enlaces */}
          <div>
            <h2 className={headingClass}>Carta y enlaces</h2>
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/carta" className={cn(linkClass, "text-cream")}>
                  <Utensils className="h-3.5 w-3.5 text-pimenton-light" aria-hidden />
                  Carta con alérgenos
                </Link>
              </li>
              <li className="mt-2 border-t border-cream/[0.06] pt-3">
                <a href={BUSINESS.social.tripadvisor} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  <PlatformGlyph source="TripAdvisor" className="h-3.5 w-3.5" />
                  TripAdvisor
                  <ArrowUpRight className="h-3.5 w-3.5 text-cream-faint" aria-hidden />
                </a>
              </li>
              <li>
                <a href={BUSINESS.social.googleReviews} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  <PlatformGlyph source="Google" className="h-3.5 w-3.5" />
                  Google
                  <ArrowUpRight className="h-3.5 w-3.5 text-cream-faint" aria-hidden />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-14 border-t border-cream/10 py-6 md:mt-20">
          <div className="flex flex-col items-start gap-4 text-xs text-cream-faint md:flex-row md:items-center md:justify-between">
            <p>
              © {year} {BUSINESS.legalName} · {BUSINESS.address.street} · {BUSINESS.address.city}
            </p>
            <div className="flex w-full items-center justify-between gap-4 md:w-auto md:justify-end">
              <p>
                {DESIGN_CREDIT.label}{" "}
                <a href={DESIGN_CREDIT.href} className="text-cream-muted transition-colors hover:text-cream">
                  {DESIGN_CREDIT.by}
                </a>
              </p>
              <button
                type="button"
                onClick={scrollToTop}
                className="group inline-flex h-11 items-center gap-2 rounded-full border border-cream/15 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-cream-200 transition-all duration-300 hover:border-pimenton-light/60 hover:text-cream hover:shadow-neon"
              >
                Volver arriba
                <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
