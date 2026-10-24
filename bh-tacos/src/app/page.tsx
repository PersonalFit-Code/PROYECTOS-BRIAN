import { HOME } from "@/content";
import { faqJsonLd, serializeJsonLd } from "@/lib/seo";
import Hero from "@/components/home/Hero";
import TacoAnatomy from "@/components/home/TacoAnatomy";
import SizeCompare from "@/components/home/SizeCompare";
import SauceEncyclopedia from "@/components/home/SauceEncyclopedia";
import FeaturedMenu from "@/components/home/FeaturedMenu";
import GamingZone from "@/components/home/GamingZone";
import Reviews from "@/components/home/Reviews";
import Faq from "@/components/home/Faq";
import FinalCta from "@/components/home/FinalCta";
import SectionHeading from "@/components/common/SectionHeading";
import Reveal from "@/components/common/Reveal";

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd()) }} />
      <Reveal />
      <Hero />
      <section aria-labelledby="what-title" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <SectionHeading id="what-title" kicker="¿Qué es un French Taco?" title={HOME.whatIs.title} text={HOME.whatIs.text} />
        <div className="mt-12">
          <TacoAnatomy />
        </div>
      </section>
      <SizeCompare />
      <SauceEncyclopedia />
      <FeaturedMenu />
      <GamingZone />
      <Reviews />
      <Faq />
      <FinalCta />
    </>
  );
}
