import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { BUSINESS } from "@/data/business";
import { fontVariables } from "@/app/fonts";
import { LOCALES, LOCALE_META, isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import CookieConsent from "@/components/legal/CookieConsent";
import HomeJsonLd from "@/components/legal/HomeJsonLd";
import { SITE_URL, pageMetadata, serializeJsonLd } from "@/lib/seo";
import "../globals.css";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = await getMessages(locale);
  const intl = LOCALE_META[locale].intl;
  const title = `${BUSINESS.name} · ${m.hero.title}`;
  const rating = BUSINESS.ratings.google.value.toLocaleString(intl, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const count = BUSINESS.ratings.google.count.toLocaleString(intl);
  /* Sin la dirección al final: así cabe en 160 caracteres en los cuatro idiomas (la dirección ya
     viaja en el JSON-LD de Restaurant y en el pie). La nota se formatea con el locale (4,4 / 4.4). */
  const description = `${m.common.subtitle} ${rating} ★ · ${count} ${m.common.misc.reviews} ${m.common.misc.onGoogle}.`;
  return {
    metadataBase: new URL(SITE_URL),
    description,
    /* Por idioma: Next hereda los campos que un segmento hijo no sobrescribe, así que una lista
       fija en español viajaba también en /en, /gl, /pt, /carta y las páginas legales. */
    keywords: [...m.common.seoKeywords],
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.svg" },
    ...pageMetadata(locale, "/", { title, description }),
    /* Después del spread: `pageMetadata` devuelve `title` como cadena y borraría la plantilla que
       da el sufijo de marca a /carta y a las páginas legales. */
    title: { default: title, template: `%s · ${BUSINESS.name}` },
  };
}

export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const DAY_SCHEMA: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

function restaurantJsonLd(locale: Locale, description: string) {
  const openingHoursSpecification = Object.entries(BUSINESS.hours).flatMap(([day, ranges]) =>
    ranges.map((r) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY_SCHEMA[day],
      opens: r.open,
      closes: r.close === "00:00" ? "23:59" : r.close,
    })),
  );
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SITE_URL}/#restaurant`,
    name: BUSINESS.name,
    alternateName: BUSINESS.legalName,
    /* Descripción localizada (m.footer.about) e idioma de la página: el bloque viaja en /en, /gl y /pt. */
    description,
    inLanguage: LOCALE_META[locale].hreflang,
    url: `${SITE_URL}/${locale}`,
    telephone: BUSINESS.phone.e164,
    priceRange: BUSINESS.priceRangeSchema,
    /* schema.org espera el vocabulario en inglés, no el idioma de la página. */
    servesCuisine: ["Galician", "Tapas", "Spanish"],
    acceptsReservations: "True",
    image: [`${SITE_URL}/og.jpg`, `${SITE_URL}/images/terraza-catedral.jpg`, `${SITE_URL}/images/zamburinas-plancha.jpg`],
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.region,
      postalCode: BUSINESS.address.postalCode,
      addressCountry: BUSINESS.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: BUSINESS.geo.lat, longitude: BUSINESS.geo.lng },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: BUSINESS.ratings.google.value,
      reviewCount: BUSINESS.ratings.google.count,
      bestRating: 5,
    },
    openingHoursSpecification,
    hasMenu: `${SITE_URL}/${locale}/carta`,
    sameAs: [BUSINESS.social.tripadvisor],
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const messages = await getMessages(locale);
  const jsonLd = restaurantJsonLd(locale, messages.footer.about);

  return (
    <html lang={LOCALE_META[locale].hreflang} className={fontVariables}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      </head>
      <body className="min-h-dvh bg-iron text-cream antialiased">
        <LocaleProvider locale={locale} messages={messages}>
          {children}
          {/* FAQPage + WebSite JSON-LD (solo emite en la portada de cada idioma) */}
          <HomeJsonLd locale={locale} />
          {/* Aviso de cookies: localStorage `tixola_consent`, se reabre con `tixola:cookie-settings` */}
          <CookieConsent />
        </LocaleProvider>
      </body>
    </html>
  );
}
