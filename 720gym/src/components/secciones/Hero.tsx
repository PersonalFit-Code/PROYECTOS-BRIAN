import { ChevronDown, MapPin } from "lucide-react";
import { HeroSection } from "@/components/ui/hero-section-4";
import IconoWhatsApp from "@/components/ui/IconoWhatsApp";
import { fotos } from "@/data/fotos";
import { wa } from "@/data/negocio";
import { enlacePrueba } from "@/components/layout/navegacion";

/**
 * Portada limpia (hero-section-4): foto de la sala a pantalla completa, un titular, una frase y dos
 * botones (inscribirse / clase gratis). Debajo, WhatsApp. Nada más: el resto se despliega bajando.
 */
export default function Hero() {
  return (
    <div className="relative">
      <HeroSection
        aria-labelledby="titulo-portada"
        imageUrl={fotos.sala.grande}
        eyebrow={
          <span className="vidrio inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold tracking-wide text-white/90">
            <MapPin className="size-3.5" aria-hidden /> Centro privado de entrenamiento · Ourense
          </span>
        }
        title={
          <span id="titulo-portada">
            Entrena. Cuídate. Crece.
            <span className="sr-only"> 720 GYM CLUB, gimnasio con aforo limitado en Ourense.</span>
          </span>
        }
        subtitle="Un club con aforo limitado, abierto los 365 días. Fuerza, Pilates Reformer y comunidad en el centro de Ourense."
        primaryButtonText="Inscríbete ahora"
        primaryButtonHref="/alta"
        secondaryButtonText="Prueba una clase gratis"
        secondaryButtonHref={enlacePrueba}
        extra={
          <a
            href={wa("Hola, quiero información para apuntarme a 720 GYM CLUB.")}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-[14px] font-semibold text-white/85 underline-offset-4 transition hover:text-white hover:underline"
          >
            <span className="grid size-8 place-items-center rounded-full bg-[#25d366] text-white transition group-hover:scale-110 group-hover:rotate-[-8deg]">
              <IconoWhatsApp className="size-4" />
            </span>
            ¿Dudas? Escríbenos por WhatsApp
          </a>
        }
      />
      <a href="#por-que" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[11px] font-semibold tracking-[0.2em] text-white/60 uppercase transition hover:text-white sm:flex" aria-label="Bajar a la siguiente sección">
        Descubre 720
        <ChevronDown className="size-5 animate-bounce" aria-hidden />
      </a>
    </div>
  );
}
