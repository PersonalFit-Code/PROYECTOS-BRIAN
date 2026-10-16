import type { Metadata } from "next";
import Contacto from "@/components/contacto/Contacto";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";
import { pageContext } from "@/lib/page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await pageContext(params);
  return pageMetadata(locale, "/contacto", { title: m.contacto.seo.title, description: m.contacto.seo.description });
}

export default async function ContactoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await pageContext(params);
  const migas = breadcrumbJsonLd([{ name: m.nav.items.home, url: absoluteUrl(locale, "/") }, { name: m.nav.items.contacto, url: absoluteUrl(locale, "/contacto") }]);
  return (
    <div className="pt-24 sm:pt-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(migas) }} />
      <Contacto titleAs="h1" />
    </div>
  );
}
