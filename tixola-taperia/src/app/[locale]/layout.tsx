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
    /* SVG para navegadores modernos, .ico para los que piden /favicon.ico por su cuenta (y para Google,
       que enseña el icono junto al resultado), PNG de 180 px para "Añadir a pantalla de inicio" en iPhone
       (Safari no usa el SVG) y el manifiesto para Android. Todos salen de `favicon.svg`. */
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "32x32" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    },
    manifest: "/manifest.webmanifest",
    ...pageMetadata(locale, "/", { title, description }),
    /* Después del spread: `pageMetadata` devuelve `title` como cadena y borraría la plantilla que
       da el sufijo de marca a /carta y a las páginas legales. */
    title: { default: title, template: `%s · ${BUSINESS.name}` },
  };
}

export const viewport: Viewport = {
  themeColor: "#3b1613",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  /* Que el TECLADO encoja la página, no que se limite a taparla. Donde se admite (Chrome en Android
     y los navegadores de Chromium) esto hace que al abrirse el teclado se recalculen `100dvh` y los
     elementos anclados al pie, así que el cuadro de texto del camarero virtual sube solo, sin que
     nadie tenga que medir nada. Safari en iOS todavía lo ignora, y para ese caso está el anclaje a
     `visualViewport` de `useKeyboardViewport`: uno cubre al otro, y donde funcionan los dos el
     resultado es el mismo. */
  interactiveWidget: "resizes-content",
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
    /* Tixola no coge reservas: es por orden de llegada. Este campo lo lee Google para decidir
       si enseña un botón de "Reservar" en la ficha del negocio, así que dejarlo en "True" era
       mandar gente a intentar algo que no existe. */
    acceptsReservations: "False",
    image: [`${SITE_URL}/og.jpg`, `${SITE_URL}/images/terraza-catedral.jpg`, `${SITE_URL}/images/zamburinas-plancha.webp`],
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.region,
      postalCode: BUSINESS.address.postalCode,
      addressCountry: BUSINESS.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: BUSINESS.geo.lat, longitude: BUSINESS.geo.lng },
    /* AQUÍ HABÍA UN `aggregateRating` CON EL 4,4 Y LAS 858 RESEÑAS DE GOOGLE, y se ha quitado.
       Esa nota no es nuestra: sale de la ficha de Google Business y de TripAdvisor (ver
       `BUSINESS.ratings`). Publicarla como AggregateRating del propio negocio choca de frente con
       dos reglas de los fragmentos de reseña de Google —las reseñas sobre uno mismo en un
       LocalBusiness, y las valoraciones agregadas traídas de otro sitio—, y la sanción no es que no
       salga la estrellita: es que Google puede aplicar una acción manual de datos estructurados a
       un negocio que vive precisamente de su ficha local.
       Las cifras siguen a la vista en la portada y en el pie, con su fuente y con enlace a la ficha,
       que es donde sí son legítimas: allí son una cita, no una autodeclaración. */
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
        {/*
          RED DE SEGURIDAD DE LOS REVELADOS. El estado oculto de los `[data-reveal]` vive en CSS
          (`globals.css`) y el atributo viaja YA en el HTML del servidor, así que sin esta línea toda la
          home por debajo de la portada —cabeceras, carrusel de platos, indicadores, reseñas, galería,
          FAQ— nacería a opacidad 0 y seguiría invisible mientras el bundle de React no hidratara… o para
          siempre si el JavaScript no llega. En una presentación con la wifi del local eso es una página
          en blanco.
          Por eso el ocultado es OPT-IN: solo se aplica bajo `:root[data-reveal-armed]`, que se escribe
          aquí, de forma síncrona y antes del primer pintado (sin JS el atributo no existe y el contenido
          se lee tal cual, sin parpadeo). El temporizador es el vigía: si en 2,6 s nadie ha montado
          `useScrollReveal` —bundle lento, error de hidratación, JS desactivado a medias— suelta el
          atributo y la página aparece sin animación, que es infinitamente mejor que en blanco. El propio
          hook lo cancela al montarse (`disarmRevealWatchdog`).
          Es un atributo en <html> y no una clase a propósito: la clase de <html> la escribe React con
          las variables de tipografía y una hidratación podría pisarla; `data-*` es el mismo contrato que
          ya usan los modales con `data-scroll-lock`.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var r=document.documentElement;r.setAttribute("data-reveal-armed","");' +
              'window.__tixolaRevealWatchdog=window.setTimeout(function(){r.removeAttribute("data-reveal-armed");' +
              "delete window.__tixolaRevealWatchdog},2600)}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-dvh bg-granate text-cream antialiased">
        <LocaleProvider locale={locale} messages={messages}>
          {/* SALTAR AL CONTENIDO. Primer elemento enfocable de la página, invisible hasta que recibe
              el foco. El texto y el destino (`<main id="main">` en las tres plantillas) llevaban
              tiempo puestos, pero el enlace en sí nunca se llegó a montar: quien navega con teclado
              tenía que tabular, en CADA página, por la cabecera fija, el menú, el selector de
              idioma, el botón de WhatsApp y el lanzador del chat antes de llegar al contenido.
              Es la técnica de WCAG 2.4.1 (Bypass Blocks), nivel A. */}
          <a
            href="#main"
            className="sr-only rounded-full focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:inline-flex focus-visible:items-center focus-visible:bg-pimenton focus-visible:px-5 focus-visible:py-3 focus-visible:font-sans focus-visible:text-sm focus-visible:font-semibold focus-visible:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-granate"
          >
            {messages.common.misc.skipToContent}
          </a>
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
