import Collage from "@/components/ui/Collage";
import Contador from "@/components/ui/Contador";
import { negocio } from "@/data/negocio";

/** «Un nuevo concepto de gimnasio»: texto editorial + collage + cifras grandes y sobrias. */
export default function Intro({ pagina = false }: { pagina?: boolean }) {
  const Titulo = pagina ? "h1" : "h2";
  return (
    <section id="club" className={pagina ? "bg-pared pt-[calc(var(--header-h)+3rem)] pb-16 text-negro sm:pb-24" : "bg-pared py-16 text-negro sm:py-24"} aria-labelledby="titulo-intro">
      <div className="container-page grid gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6 lg:pr-8">
          <p data-reveal className="etiqueta text-negro/50">
            Un nuevo concepto de gimnasio
          </p>
          <Titulo id="titulo-intro" data-reveal className="mt-6">
            <span className="subtitular block text-[clamp(1.05rem,1.6vw,1.3rem)] text-negro/55">Sin agobios. Sin postureo.</span>
            <span className="titular mt-2 block text-[clamp(2.4rem,4.6vw,3.6rem)]">Tu lugar.</span>
          </Titulo>
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
            {(
              [
                [<Contador key="m" hasta={1000} prefijo="+" sufijo=" m²" />, "de instalaciones"],
                [<Contador key="d" hasta={365} />, "días abierto, festivos incluidos"],
                ["Aforo", "limitado y acceso controlado"],
                [<Contador key="g" hasta={5} decimales={1} sufijo=" ★" />, `en Google, ${negocio.google.resenas} reseñas`],
              ] as [React.ReactNode, string][]
            ).map(([cifra, texto]) => (
              <div key={texto} data-reveal>
                <dt className="titular text-[clamp(1.9rem,3vw,2.6rem)] leading-none whitespace-nowrap">{cifra}</dt>
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
