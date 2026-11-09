import Image from "next/image";
import Link from "next/link";
import { fotos } from "@/data/fotos";
import { MapPin } from "lucide-react";
import FondoMarca from "@/components/ui/FondoMarca";
import DeslizaInscribete from "@/components/ui/DeslizaInscribete";
import { claseBoton } from "@/components/ui/Boton";
import { enlacePrueba } from "@/components/layout/navegacion";

/**
 * Portada v3: medidas contenidas (Gymshark), titular en minúsculas, fondo con el degradado y el
 * «720» del logo. Cuando lleguen las fotos o el vídeo de la sala, van detrás con un velo oscuro.
 */
export default function Hero() {
  return (
    <section className="relative flex min-h-[88svh] flex-col overflow-hidden bg-negro pt-[var(--header-h)] lg:min-h-[78svh]" aria-labelledby="titulo-portada">
      {/* Foto real de la sala con velo: legible a la izquierda, la sala se ve a la derecha. */}
      <div className="absolute inset-0" aria-hidden>
        <Image src={fotos.sala.grande} alt="" fill priority sizes="100vw" className="fondo-vivo object-cover object-[60%_50%] saturate-[0.9]" />
        <div className="absolute inset-0 bg-gradient-to-t from-negro via-negro/55 to-negro/10 lg:bg-gradient-to-r lg:from-negro/95 lg:via-negro/50 lg:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-negro to-transparent" />
      </div>
      <FondoMarca agua={false} className="opacity-30" />
      {/* Enunciado pegado a la izquierda (margen mínimo) y, abajo a la derecha, el deslizador. */}
      <div className="relative flex flex-1 flex-col justify-end gap-8 px-5 pb-10 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-12 lg:pb-16">
        <div className="max-w-xl">
          <p className="hero-in etiqueta flex items-center gap-2 text-white/70" style={{ ["--i" as string]: 0 }}>
            <MapPin className="size-3.5" aria-hidden /> Centro privado de entrenamiento · Ourense
          </p>
          <h1 id="titulo-portada" className="hero-in titular mt-4 text-[clamp(2.6rem,5.4vw,4rem)]" style={{ ["--i" as string]: 1 }}>
            Entrena. Cuídate. <span className="texto-logo">Crece.</span>
            <span className="sr-only"> 720 GYM CLUB, gimnasio con aforo limitado en Ourense.</span>
          </h1>
          <p className="hero-in mt-4 max-w-md text-[15px] leading-relaxed text-white/75 sm:text-[16px]" style={{ ["--i" as string]: 2 }}>
            Un club de entrenamiento con aforo limitado, abierto los 365 días. Fuerza, Pilates Reformer y comunidad en el centro de Ourense.
          </p>
          <div className="hero-in mt-7" style={{ ["--i" as string]: 3 }}>
            <Link href={enlacePrueba} className={claseBoton("contorno")}>
              Prueba una clase gratis
            </Link>
          </div>
        </div>

        <div className="hero-in w-full sm:max-w-md lg:w-[26rem]" style={{ ["--i" as string]: 4 }}>
          <DeslizaInscribete />
        </div>
      </div>
    </section>
  );
}
