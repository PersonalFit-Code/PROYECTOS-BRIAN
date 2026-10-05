import LogoCover from "@/components/home/hero/LogoCover";
import DosPuertas from "@/components/home/DosPuertas";
import Hero from "@/components/home/Hero";
import StarPinchos from "@/components/home/StarPinchos";
import Interior from "@/components/home/Interior";
import SocialProof from "@/components/home/SocialProof";

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
