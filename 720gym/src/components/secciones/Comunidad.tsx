import { Star, ArrowUpRight } from "lucide-react";
import { negocio } from "@/data/negocio";

const temas = [
  "Ambiente familiar",
  "Grupos reducidos",
  "Atención personalizada",
  "Limpieza",
  "Sin competitividad tóxica",
  "Todas las edades",
  "Pases para quien viene de fuera",
  "Fácil aparcamiento",
];

/** Sus normas del dosier: definen el tono mejor que cualquier eslogan. */
const normas = [
  "Si puedes levantarlo, puedes bajarlo.",
  "Busca mejorar tu versión y evita las comparaciones.",
  "Deja los problemas y el ego fuera. ¿Total para qué?",
  "Recuerda que somos una familia.",
];

export default function Comunidad() {
  return (
    <section id="comunidad" className="bg-niebla py-24 text-negro sm:py-32" aria-labelledby="titulo-comunidad">
      <div className="container-page grid gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <p data-reveal className="etiqueta text-negro/50">
            <span className="text-acento-texto">09</span> · Comunidad
          </p>
          <h2 id="titulo-comunidad" data-reveal className="titular mt-5 text-[clamp(3rem,9vw,6.5rem)]">
            720 también es la gente que entrena aquí
          </h2>
          <div data-reveal className="mt-10 flex items-end gap-5">
            <span className="titular text-[clamp(6rem,16vw,10rem)] leading-[0.8]">{negocio.google.nota}</span>
            <span className="pb-2">
              <span className="flex gap-0.5" aria-label="5 de 5 estrellas">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="size-5 fill-acento text-acento" aria-hidden />
                ))}
              </span>
              <span className="mt-1 block text-[14px] text-negro/60">{negocio.google.resenas} reseñas en Google</span>
            </span>
          </div>
          <a
            data-reveal
            href={negocio.google.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold underline underline-offset-4 hover:text-acento-texto"
          >
            Leer todas las reseñas en Google <ArrowUpRight className="size-4" aria-hidden />
          </a>
          <p data-reveal className="etiqueta mt-12 text-negro/45">Lo que más repiten</p>
          <ul data-reveal className="mt-4 flex flex-wrap gap-2">
            {temas.map((t) => (
              <li key={t} className="bg-white px-3 py-2 text-[13px] font-medium text-negro/80">
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7 lg:pl-10">
          <p data-reveal className="etiqueta text-negro/45">Nuestras normas</p>
          <ol className="mt-6 divide-y divide-negro/10 border-y border-negro/10">
            {normas.map((n, i) => (
              <li key={n} data-reveal className="flex gap-6 py-7">
                <span className="subtitular pt-1 text-[18px] text-acento-texto">{String(i + 1).padStart(2, "0")}</span>
                <p className="subtitular text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.02]">{n}</p>
              </li>
            ))}
          </ol>
          <div data-reveal className="mt-10 border border-dashed border-negro/25 p-6 text-[14px] leading-relaxed text-negro/60">
            <p className="font-semibold text-negro/80">Aquí irán tres reseñas reales de Google</p>
            <p className="mt-1">Copiadas tal cual, con nombre y fecha y sin retocar. Pendiente de elegirlas con vosotros.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
