import type { Metadata } from "next";
import LogoCover from "@/components/home/hero/LogoCover";
import DosPuertas from "@/components/home/DosPuertas";
import Hero from "@/components/home/Hero";
import StarPinchos from "@/components/home/StarPinchos";
import Interior from "@/components/home/Interior";
import SocialProof from "@/components/home/SocialProof";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = getMessages(locale);
  return pageMetadata(locale, "/", { title: m.seo.home.title, description: m.seo.home.description, imageAlt: m.seo.ogAlt });
}

/** Portada como una presentación: el logo, las dos puertas, la entrada, los cuatro de la casa, el local por dentro y lo que dicen. El resto, en el menú. */
export default function HomePage() {
  return (
    <>
      <LogoCover />
      <DosPuertas />
      <Hero />
      <StarPinchos />
      <Interior />
      <SocialProof />
    </>
  );
}
