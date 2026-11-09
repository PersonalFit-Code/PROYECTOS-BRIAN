import Foto from "@/components/ui/Foto";
import { equipo } from "@/data/equipo";

export default function Equipo() {
  return (
    <section id="equipo" className="bg-white py-24 text-negro sm:py-32" aria-labelledby="titulo-equipo">
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p data-reveal className="etiqueta text-negro/50">
              El equipo
            </p>
            <h2 id="titulo-equipo" data-reveal className="mt-5">
              <span className="subtitular block text-[clamp(1.05rem,1.6vw,1.3rem)] text-negro/55">Caras conocidas desde el primer día.</span>
              <span className="titular mt-1 block text-[clamp(2.1rem,3.6vw,3.1rem)]">Quién te entrena</span>
            </h2>
          </div>
          <p data-reveal className="max-w-md text-[16px] leading-relaxed text-negro/65 lg:col-span-5 lg:justify-self-end">
            Aquí te llaman por tu nombre y te corrigen la técnica. Es lo que más repiten nuestros socios en Google.
          </p>
        </div>
        <ul className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {equipo.map((p, i) => (
            <li key={p.nombre} data-reveal className={i === 1 ? "lg:mt-16" : ""}>
              <Foto src={p.foto} descripcion={p.fotoDescripcion} tono="claro" proporcion="aspect-[4/3] sm:aspect-[4/5]" bn sizes="(min-width:1024px) 30vw, 90vw" />
              <p className="etiqueta mt-5 text-acento-texto">{p.rol}</p>
              <h3 className="titular mt-2 text-[35px]">{p.nombre}</h3>
              <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-negro/65">{p.linea}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
