import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** «La filosofía 720» (texto del boceto de Brais), con el lema y sus palabras clave en naranja. */
export default function Filosofia() {
  return (
    <section className="bg-white py-20 text-negro sm:py-28" aria-labelledby="titulo-filosofia">
      <div className="container-page grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
        <div className="lg:col-span-8">
          <p data-reveal className="etiqueta text-negro/50">
            La filosofía 720
          </p>
          <h2 id="titulo-filosofia" data-reveal className="titular mt-4 text-titulo-1 leading-[0.97]">
            No queremos ser un gimnasio donde simplemente <span className="resalte">vienes, entrenas y te vas.</span>
          </h2>
        </div>
        <div className="lg:col-span-4">
          <p data-reveal className="text-[16.5px] leading-relaxed text-negro/70">
            Queremos que cada persona encuentre su manera de entrenar, progresar y cuidarse dentro de un entorno cercano, profesional, con aforo limitado y con identidad propia.
          </p>
          <Link href="/club#historia" data-reveal className="ficha-clara group mt-6 inline-flex h-12 items-center gap-2 rounded-full border border-negro/15 bg-white px-6 text-[14px] font-bold tracking-wide uppercase">
            Conoce nuestra historia <ArrowRight className="size-4 text-marca transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
      </div>
      <div className="container-page mt-12">
        <p data-reveal className="titular flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-negro/10 pt-8 text-[clamp(1.7rem,4vw,3rem)] leading-none">
          <span>Entrena.</span>
          <span>Cuídate.</span>
          <span className="resalte">Sigue creciendo.</span>
        </p>
      </div>
    </section>
  );
}
