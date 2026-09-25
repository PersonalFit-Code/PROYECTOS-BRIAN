"use client";

import { usePathname } from "next/navigation";
import { BUSINESS, type DayKey, type TimeRange } from "@/data/business";
import { LOCALE_META, stripLocale, type Locale } from "@/i18n/config";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { absoluteUrl, faqJsonLd, serializeJsonLd, SITE_URL, type JsonLdObject } from "@/lib/seo";

const WEEK: readonly DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const HOURS = BUSINESS.hours as Record<DayKey, TimeRange[]>;

/**
 * JSON-LD de la portada: `FAQPage` (m.legal.faq) y `WebSite`.
 * Se monta en el layout, pero solo emite en la ruta "/" de cada idioma: el FAQ describe la home,
 * y `carta` y las páginas legales publican su propio JSON-LD (Menu, BreadcrumbList).
 * Es un componente cliente para leer la ruta; el `<script>` se renderiza igualmente en el HTML del servidor.
 */
export default function HomeJsonLd({ locale }: { locale: Locale }) {
  const m = useMessages();
  const t = useFormat();
  const pathname = usePathname();
  if (stripLocale(pathname ?? "/").path !== "/") return null;

  /* "Lunes: 19:30–00:00 · Martes: 12:00–16:00 / 20:00–00:00 · … · Domingo: Cerrado" (siempre sincronizado con business.ts) */
  const hours = WEEK.map((day) => {
    const ranges = HOURS[day];
    const label = ranges.length ? ranges.map((r) => `${r.open}–${r.close}`).join(" / ") : m.common.status.closed;
    return `${m.common.days[day]}: ${label}`;
  }).join(" · ");

  const vars = { hours, phone: BUSINESS.phone.display, address: BUSINESS.address.full };
  const homeUrl = absoluteUrl(locale, "/");

  const faq = faqJsonLd(
    m.legal.faq.items.map(({ q, a }) => ({ q: t(q, vars), a: t(a, vars) })),
    { locale, url: homeUrl },
  );

  const website: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: homeUrl,
    name: BUSINESS.name,
    inLanguage: LOCALE_META[locale].hreflang,
    publisher: { "@id": `${SITE_URL}/#restaurant` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(website) }} />
    </>
  );
}
