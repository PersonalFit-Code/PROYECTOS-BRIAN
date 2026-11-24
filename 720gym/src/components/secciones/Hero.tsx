import { ChevronDown } from "lucide-react";
import { HeroSection } from "@/components/ui/hero-section-4";
import IconoWhatsApp from "@/components/ui/IconoWhatsApp";
import Intro from "@/components/ui/Intro";
import { fotos } from "@/data/fotos";
import { wa, waVisita } from "@/data/negocio";

/**
 * Portada limpia (hero-section-4): foto de la sala a pantalla completa, un titular, una frase y dos
 * botones (inscribirse / concertar una visita). Debajo, WhatsApp. Nada más: el resto se despliega bajando.
 */
export default function Hero() {
  return (
    <div className="relative">
      <Intro />
      <HeroSection
        aria-labelledby="titulo-portada"
        imageUrl={fotos.pista.grande}
        imageUrlMobile={fotos.pistaVertical.grande}
        imageClassName="object-[64%_50%] lg:object-center"
        title={
          <span id="titulo-portada">
            Entrena. Cuídate. Creciendo.
            <span className="sr-only"> 720 GYM CLUB, gimnasio con aforo limitado en Ourense.</span>
          </span>
        }
        subtitle={
          <>
            Un espacio en Ourense para encontrar tu manera de entrenar y cuidarte. Gimnasio con aforo limitado, actividades en grupos reducidos y clubes
            especializados.
            <span className="mt-3 block font-semibold text-white">Abierto los 365 días del año.</span>
          </>
        }
        primaryButtonText="Ven a conocer 720"
        primaryButtonHref={waVisita()}
        secondaryButtonText="Descubre las actividades"
        secondaryButtonHref="/#que-buscas"
        extra={
          <a
            href={wa("Hola, os escribo desde la web de 720 Gym Club. Me gustaría que me orientaseis sobre lo que busco. Gracias.")}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-[14px] font-semibold text-white/85 underline-offset-4 transition hover:text-white hover:underline"
          >
            <span className="grid size-8 place-items-center rounded-full bg-whatsapp text-white transition group-hover:scale-110 group-hover:rotate-[-8deg]">
              <IconoWhatsApp className="size-4" />
            </span>
            Cuéntanos qué buscas
          </a>
        }
      />
      <a href="#que-buscas" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[11px] font-semibold tracking-[0.2em] text-white/60 uppercase transition hover:text-white sm:flex" aria-label="Bajar a la siguiente sección">
        Descubre 720
        <ChevronDown className="size-5 animate-bounce text-marca" aria-hidden />
      </a>
    </div>
  );
}
