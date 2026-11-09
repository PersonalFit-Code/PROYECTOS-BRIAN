import Link from "next/link";
import { Star } from "lucide-react";
import Ondas from "@/components/ui/Ondas";
import { claseBoton } from "@/components/ui/Boton";
import DeslizaInscribete from "@/components/ui/DeslizaInscribete";
import { negocio, wa } from "@/data/negocio";
import { enlacePrueba } from "@/components/layout/navegacion";

/**
 * Foto que rellena las letras «720GYM» (el recurso del logo de su dosier). Mientras no la tengamos,
 * las letras llevan su degradado azul → naranja → verde. Poner p. ej. "/fotos/portada-sala.jpg".
 */
const FOTO_LETRAS: string | undefined = undefined;

export default function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-negro pt-[var(--header-h)]" aria-labelledby="titulo-portada">
      <Ondas />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_30%,var(--color-negro)_85%)]" aria-hidden />

      <div className="container-page relative flex flex-1 flex-col justify-end pb-8 sm:pb-10">
        <p className="hero-in etiqueta flex items-center gap-3 text-white/65" style={{ ["--i" as string]: 0 }}>
          <span className="inline-block size-1.5 rounded-full bg-acento" aria-hidden />
          Centro privado de entrenamiento · Ourense
        </p>

        <p
          aria-hidden
          className="hero-in titular letras-relleno mt-4 -ml-[0.03em] text-[31vw] leading-[0.8] tracking-[-0.02em] lg:text-[min(21vw,19rem)]"
          data-foto={FOTO_LETRAS ? "" : undefined}
          style={{ ["--i" as string]: 1, ...(FOTO_LETRAS ? { ["--foto" as string]: `url(${FOTO_LETRAS})` } : {}) }}
        >
          720GYM
        </p>

        <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <h1 id="titulo-portada" className="hero-in titular text-[clamp(3rem,9vw,5.5rem)]" style={{ ["--i" as string]: 2 }}>
              Entrena. Cuídate. <span className="text-acento">Crece.</span>
              <span className="sr-only"> 720 GYM CLUB, gimnasio con aforo limitado en Ourense.</span>
            </h1>
            <p className="hero-in mt-5 max-w-xl text-[16px] leading-relaxed text-white/70 sm:text-[18px]" style={{ ["--i" as string]: 3 }}>
              Un club de entrenamiento con aforo limitado, abierto los 365 días. Fuerza, Pilates Reformer y comunidad en el centro de Ourense.
            </p>
            <div className="hero-in mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ ["--i" as string]: 4 }}>
              <DeslizaInscribete className="sm:max-w-[24rem]" />
              <div className="grid grid-cols-2 gap-3 sm:flex">
              <Link href={enlacePrueba} className={claseBoton("contorno")}>
                Clase gratis
              </Link>
              <a href={wa("Hola, quiero información sobre 720 GYM CLUB.")} target="_blank" rel="noopener noreferrer" className={claseBoton("contorno")}>
                Información
              </a>
              </div>
            </div>
          </div>
        </div>

        <dl className="hero-in mt-10 grid grid-cols-2 border-t border-white/12 pt-6 sm:grid-cols-4" style={{ ["--i" as string]: 5 }}>
          {[
            ["365", "días al año"],
            [`${negocio.horario.apertura}–${negocio.horario.cierre}`, "festivos incluidos"],
            ["Aforo", "limitado"],
            [`${negocio.google.nota}`, `en Google · ${negocio.google.resenas} reseñas`],
          ].map(([cifra, texto], i) => (
            <div key={i} className="py-2 pr-4">
              <dt className="subtitular flex items-center gap-1.5 text-[30px] sm:text-[36px]">
                {cifra}
                {i === 3 && <Star className="size-6 fill-acento text-acento" aria-hidden />}
              </dt>
              <dd className="text-[13px] text-white/55">{texto}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
