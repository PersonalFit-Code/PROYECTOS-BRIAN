import Image from "next/image";
import Link from "next/link";
import DeslizaInscribete from "@/components/ui/DeslizaInscribete";
import { claseBoton } from "@/components/ui/Boton";
import { negocio, wa } from "@/data/negocio";
import { fotos } from "@/data/fotos";

/**
 * Cierre de venta con el recurso del logo de su dosier: el «720» relleno con la foto de la sala,
 * sobre la sala desenfocada. Y el deslizador para inscribirse.
 */
export default function Cierre() {
  return (
    <section className="relative isolate overflow-hidden bg-negro py-20 sm:py-28" aria-labelledby="titulo-cierre">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <Image src={fotos.racks.grande} alt="" fill sizes="100vw" className="scale-110 object-cover opacity-30 blur-[6px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-negro via-negro/80 to-negro" />
      </div>
      <div className="container-page relative text-center">
        <p
          aria-hidden
          data-reveal
          className="marca letras-relleno mx-auto -mb-[0.06em] text-[46vw] leading-[0.78] sm:text-[34vw] lg:text-[22rem]"
          data-foto=""
          style={{ ["--foto" as string]: `url(${fotos.sala.grande})` }}
        >
          720
        </p>
        <p data-reveal className="etiqueta mt-10 text-white/55">
          Plazas limitadas · {negocio.horario.texto.toLowerCase()}
        </p>
        <h2 id="titulo-cierre" data-reveal className="titular mt-3 text-[clamp(2.2rem,4.6vw,3.4rem)]">
          Tu sitio <span className="texto-logo">te espera</span>
        </h2>
        <p data-reveal className="mx-auto mt-3 max-w-md text-[15px] text-white/65">
          Desde 35 €/mes. Sin matrícula en Pilates. Cancela cuando quieras.
        </p>
        <div data-reveal className="mx-auto mt-8 flex max-w-sm flex-col items-center gap-3">
          <DeslizaInscribete />
          <div className="grid w-full grid-cols-2 gap-3">
            <Link href="/clase-gratis" className={claseBoton("contorno")}>
              Clase gratis
            </Link>
            <a href={wa("Hola, quiero información sobre 720 GYM CLUB.")} target="_blank" rel="noopener noreferrer" className={claseBoton("contorno")}>
              Información
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
