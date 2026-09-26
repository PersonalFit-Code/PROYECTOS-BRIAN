"use client";

import { usePathname } from "next/navigation";
import { BUSINESS } from "@/data/business";
import { LOCALE_META, stripLocale, type Locale } from "@/i18n/config";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { faqVars } from "@/lib/faq";
import { absoluteUrl, faqJsonLd, serializeJsonLd, SITE_URL, type JsonLdObject } from "@/lib/seo";

/**
 * JSON-LD de la portada: `FAQPage` (m.legal.faq, el mismo que pinta `<Faq />` en #opiniones) y `WebSite`.
 * Se monta en el layout, pero solo emite en la ruta "/" de cada idioma: el FAQ describe la home,
 * y `carta` y las páginas legales publican su propio JSON-LD (Menu, BreadcrumbList).
 * Es un componente cliente para leer la ruta; el `<script>` se renderiza igualmente en el HTML del servidor.
 */
export default function HomeJsonLd({ locale }: { locale: Locale }) {
  const m = useMessages();
  const t = useFormat();
  const pathname = usePathname();
  if (stripLocale(pathname ?? "/").path !== "/") return null;

  /* Las mismas variables que interpola el FAQ VISIBLE (`<Faq />` al final de SocialProof): el texto
     marcado y el que lee el visitante tienen que coincidir carácter a carácter. */
  const vars = faqVars(m);
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
