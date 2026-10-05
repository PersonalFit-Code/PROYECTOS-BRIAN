import LogoCover from "@/components/home/hero/LogoCover";
import Hero from "@/components/home/Hero";
import StarPinchos from "@/components/home/StarPinchos";
import SocialProof from "@/components/home/SocialProof";

/** Portada como una presentación: el logo, la entrada, los cuatro de la casa y lo que dicen. El resto, en el menú. */
export default function HomePage() {
  return (
    <>
      <LogoCover />
      <Hero />
      <StarPinchos />
      <SocialProof />
    </>
  );
}
