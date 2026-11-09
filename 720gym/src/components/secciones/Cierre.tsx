import Link from "next/link";
import FondoMarca from "@/components/ui/FondoMarca";
import DeslizaInscribete from "@/components/ui/DeslizaInscribete";
import { claseBoton } from "@/components/ui/Boton";
import { negocio, wa } from "@/data/negocio";

/** Cierre de venta: degradado con el logo detrás y el deslizador. */
export default function Cierre() {
  return (
    <section className="relative overflow-hidden bg-negro py-20 sm:py-28" aria-labelledby="titulo-cierre">
      <FondoMarca lado="centro" />
      <div className="container-page relative text-center">
        <p data-reveal className="etiqueta text-white/55">
          Plazas limitadas · {negocio.horario.texto.toLowerCase()}
        </p>
        <h2 id="titulo-cierre" data-reveal className="titular mt-4 text-[clamp(2.2rem,4.6vw,3.4rem)]">
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
