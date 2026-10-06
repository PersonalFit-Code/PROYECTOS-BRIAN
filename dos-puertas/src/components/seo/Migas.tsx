import type { Locale } from "@/i18n/config";
import { breadcrumbLd, serializeJsonLd } from "@/lib/seo";

/** Migas de pan (Inicio › página) como datos estructurados: Google las enseña bajo el resultado. */
export default function Migas({ locale, home, name, path }: { locale: Locale; home: string; name: string; path: string }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd(locale, home, name, path)) }} />;
}
