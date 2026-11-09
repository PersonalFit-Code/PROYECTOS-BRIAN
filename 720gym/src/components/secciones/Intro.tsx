import Collage from "@/components/ui/Collage";
import { negocio } from "@/data/negocio";

/** «Un nuevo concepto de gimnasio»: texto editorial + collage + cifras grandes y sobrias. */
export default function Intro() {
  return (
    <section id="club" className="bg-pared py-24 text-negro sm:py-32 lg:py-40" aria-labelledby="titulo-intro">
      <div className="container-page grid gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6 lg:pr-8">
          <p data-reveal className="etiqueta text-negro/50">
            <span className="text-acento-texto">01</span> · Un nuevo concepto de gimnasio
          </p>
          <h2 id="titulo-intro" data-reveal className="mt-6">
            <span className="subtitular block text-[clamp(1.5rem,3vw,2.25rem)] text-negro/55">Sin agobios. Sin postureo.</span>
            <span className="titular mt-2 block text-[clamp(3.5rem,10vw,8rem)]">Tu lugar.</span>
          </h2>
          <div data-reveal className="mt-8 max-w-xl space-y-5 text-[17px] leading-relaxed text-negro/75">
            <p>
              Un lugar donde entrenar sin agobios, en un ambiente familiar y distendido, en el que sentirás que es <em>tu</em> lugar. Con todo el
              material necesario para ello.
            </p>
            <p>
              La cercanía y el compañerismo son el sello de todos los socios. Un ambiente positivo en el que todos somos uno.
            </p>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-negro/12 pt-10">
            {[
              [negocio.metros, "de instalaciones"],
              ["365", "días abierto, festivos incluidos"],
              ["Aforo", "limitado y acceso controlado"],
              [`${negocio.google.nota} ★`, `en Google, ${negocio.google.resenas} reseñas`],
            ].map(([cifra, texto]) => (
              <div key={texto} data-reveal>
                <dt className="titular text-[clamp(2.6rem,5vw,4.5rem)] leading-none whitespace-nowrap">{cifra}</dt>
                <dd className="mt-2 max-w-[18ch] text-[14px] text-negro/60">{texto}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="lg:col-span-6 lg:pt-16">
          <Collage
            tono="claro"
            fotos={[
              { descripcion: "Plano general de la sala: paredes blancas, suelo negro y máquinas rojas" },
              { descripcion: "Socios entrenando juntos y riendo entre series" },
              { descripcion: "Detalle del logo 720 en la pared" },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
