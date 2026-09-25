import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Cormorant_Garamond, Cinzel, Manrope, Bebas_Neue } from "next/font/google";
import { BUSINESS } from "@/data/business";
import { LOCALES, LOCALE_META, isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { SITE_URL, pageMetadata } from "@/lib/seo";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cinzel",
  display: "swap",
});

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas", display: "swap" });

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = await getMessages(locale);
  const title = `${BUSINESS.name} · ${m.hero.title}`;
  const description = `${m.common.subtitle} ${BUSINESS.ratings.google.value} ★ · ${BUSINESS.ratings.google.count} ${m.common.misc.reviews} ${m.common.misc.onGoogle}. ${BUSINESS.address.full}.`;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s · ${BUSINESS.name}` },
    description,
    keywords: [
      "tapería Ourense",
      "tapas Ourense",
      "zamburiñas Ourense",
      "pulpo a la gallega Ourense",
      "bar de tapas catedral Ourense",
      "Tixola",
      "vinos gallegos",
      "cerveza artesanal Ourense",
      "tapas Ourense casco histórico",
    ],
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.svg" },
    ...pageMetadata(locale, "/", { title, description }),
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

function restaurantJsonLd(locale: Locale) {
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
    description: BUSINESS.description,
    url: `${SITE_URL}/${locale}`,
    telephone: BUSINESS.phone.e164,
    priceRange: BUSINESS.priceRangeSchema,
    servesCuisine: ["Gallega", "Tapas", "Española"],
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

  return (
    <html lang={LOCALE_META[locale].hreflang} className={`${cormorant.variable} ${cinzel.variable} ${manrope.variable} ${bebas.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd(locale)) }} />
      </head>
      <body className="min-h-dvh bg-iron text-cream antialiased">
        <LocaleProvider locale={locale} messages={messages}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
