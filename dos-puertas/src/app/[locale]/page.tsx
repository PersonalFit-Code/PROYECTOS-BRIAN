import Hero from "@/components/home/Hero";
import Manifesto from "@/components/home/Manifesto";
import StarPinchos from "@/components/home/StarPinchos";
import HistoryTeaser from "@/components/home/HistoryTeaser";
import SocialProof from "@/components/home/SocialProof";
import VisitBlock from "@/components/visita/VisitBlock";
import ChapterRail from "@/components/home/ChapterRail";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StarPinchos />
      <Manifesto />
      <HistoryTeaser />
      <SocialProof />
      <VisitBlock />
      <ChapterRail />
    </>
  );
}
