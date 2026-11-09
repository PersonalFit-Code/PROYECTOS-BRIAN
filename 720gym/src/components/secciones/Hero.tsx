import Image from "next/image";
import Link from "next/link";
import { fotos } from "@/data/fotos";
import { Star } from "lucide-react";
import FondoMarca from "@/components/ui/FondoMarca";
import Contador from "@/components/ui/Contador";
import EstadoAbierto from "@/components/ui/EstadoAbierto";
import DeslizaInscribete from "@/components/ui/DeslizaInscribete";
import { claseBoton } from "@/components/ui/Boton";
import { negocio } from "@/data/negocio";
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
      <div className="container-page relative flex flex-1 flex-col justify-end gap-10 pb-10 lg:flex-row lg:items-end lg:justify-between lg:pb-16">
        <div className="max-w-xl">
          <p className="hero-in etiqueta text-white/60" style={{ ["--i" as string]: 0 }}>
            Centro privado de entrenamiento · Ourense
          </p>
          <h1 id="titulo-portada" className="hero-in titular mt-4 text-[clamp(2.6rem,5.4vw,4rem)]" style={{ ["--i" as string]: 1 }}>
            Entrena. Cuídate. <span className="texto-logo">Crece.</span>
            <span className="sr-only"> 720 GYM CLUB, gimnasio con aforo limitado en Ourense.</span>
          </h1>
          <p className="hero-in mt-4 max-w-md text-[15px] leading-relaxed text-white/75 sm:text-[16px]" style={{ ["--i" as string]: 2 }}>
            Un club de entrenamiento con aforo limitado, abierto los 365 días. Fuerza, Pilates Reformer y comunidad en el centro de Ourense.
          </p>
          <div className="hero-in mt-7 hidden gap-3 sm:flex" style={{ ["--i" as string]: 3 }}>
            <Link href="/alta" className={claseBoton("venta")}>
              Inscríbete
            </Link>
            <Link href={enlacePrueba} className={claseBoton("contorno")}>
              Clase gratis
            </Link>
          </div>
          <div className="hero-in mt-7 flex flex-col gap-3 sm:hidden" style={{ ["--i" as string]: 3 }}>
            <DeslizaInscribete />
            <Link href={enlacePrueba} className={claseBoton("contorno")}>
              Prueba una clase gratis
            </Link>
          </div>
        </div>

        <div className="hero-in tarjeta-vidrio w-full rounded-3xl p-5 sm:p-6 lg:w-[25rem]" style={{ ["--i" as string]: 4 }}>
          <EstadoAbierto className="text-[13px] font-medium text-white/85" />
          <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
            <div>
              <dt className="sr-only">Instalaciones</dt>
              <dd className="titular text-[28px] leading-none">
                <Contador hasta={1000} prefijo="+" />
              </dd>
              <dd className="mt-1 text-[12px] text-white/60">m² de club</dd>
            </div>
            <div>
              <dt className="sr-only">Días abierto</dt>
              <dd className="titular text-[28px] leading-none">
                <Contador hasta={365} />
              </dd>
              <dd className="mt-1 text-[12px] text-white/60">días al año</dd>
            </div>
            <div>
              <dt className="sr-only">Valoración en Google</dt>
              <dd className="titular flex items-center gap-1 text-[28px] leading-none">
                <Contador hasta={5} decimales={1} />
                <Star className="size-4 fill-white text-white" aria-hidden />
              </dd>
              <dd className="mt-1 text-[12px] text-white/60">{negocio.google.resenas} reseñas</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
