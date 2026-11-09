import Link from "next/link";
import Ondas from "@/components/ui/Ondas";
import DeslizaInscribete from "@/components/ui/DeslizaInscribete";
import { claseBoton } from "@/components/ui/Boton";
import { negocio, wa } from "@/data/negocio";

/** Cierre de venta: la última invitación antes del contacto, con el deslizador. */
export default function Cierre() {
  return (
    <section className="relative overflow-hidden bg-negro py-28 sm:py-36" aria-labelledby="titulo-cierre">
      <Ondas lineas={12} color="rgb(255 255 255 / 0.07)" />
      <div className="container-page relative text-center">
        <p data-reveal className="etiqueta text-white/55">
          Plazas limitadas · {negocio.horario.texto.toLowerCase()}
        </p>
        <h2 id="titulo-cierre" data-reveal className="mt-6">
          <span className="titular block text-[clamp(3.75rem,13vw,10rem)]">Tu sitio te espera</span>
          <span className="subtitular mt-3 block text-[clamp(1.4rem,3vw,2.2rem)] text-white/55">Desde 35 €/mes. Sin matrícula en Pilates. Cancela cuando quieras.</span>
        </h2>
        <div data-reveal className="mx-auto mt-12 flex max-w-md flex-col items-center gap-3">
          <DeslizaInscribete />
          <div className="grid w-full grid-cols-2 gap-3">
            <Link href="/?tipo=prueba#apuntate" className={claseBoton("contorno")}>
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
