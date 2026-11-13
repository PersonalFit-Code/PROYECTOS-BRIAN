import { ArrowUpRight, Car, Heart, Plane, ShieldCheck, Smile, Sparkles, UserCheck, Users, Star } from "lucide-react";
import Contador from "@/components/ui/Contador";
import Normas from "@/components/ui/Normas";
import { negocio } from "@/data/negocio";

const temas = [
  { t: "Ambiente familiar", I: Heart },
  { t: "Grupos reducidos", I: Users },
  { t: "Atención personalizada", I: UserCheck },
  { t: "Limpieza", I: Sparkles },
  { t: "Sin competitividad tóxica", I: ShieldCheck },
  { t: "Todas las edades", I: Smile },
  { t: "Pases para quien viene de fuera", I: Plane },
  { t: "Fácil aparcamiento", I: Car },
];


export default function Comunidad({ resumen = false }: { resumen?: boolean }) {
  return (
    <section id="comunidad" className="overflow-hidden bg-niebla py-16 text-negro sm:py-24" aria-labelledby="titulo-comunidad">
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <p data-reveal className="etiqueta text-negro/50">Comunidad</p>
          <h2 id="titulo-comunidad" data-reveal className="titular mt-3 text-[clamp(1.9rem,3.2vw,2.6rem)]">
            720 también es la gente que entrena aquí
          </h2>
          <ul data-reveal className="mt-6 flex flex-wrap gap-2">
            {temas.slice(0, resumen ? 6 : temas.length).map(({ t, I }) => (
              <li key={t} className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[13px] font-medium text-negro/80">
                <I className="size-3.5 text-negro/60" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div data-reveal className="lg:col-span-5 lg:col-start-8">
          <div className="rounded-3xl bg-white p-6 shadow-[0_30px_60px_-40px_rgb(0_0_0/0.4)] sm:p-8">
            <div className="flex items-end gap-4">
              <span className="titular text-[72px] leading-[0.85]">
                <Contador hasta={5} decimales={1} />
              </span>
              <span className="pb-1">
                <span className="flex gap-0.5" aria-label="5 de 5 estrellas">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="size-4 fill-negro text-negro" aria-hidden />
                  ))}
                </span>
                <span className="mt-1 block text-[13px] text-negro/60">
                  <Contador hasta={negocio.google.resenas} /> reseñas en Google
                </span>
              </span>
            </div>
            <figure className="mt-5 border-t border-negro/10 pt-5">
              <blockquote className="text-[15px] leading-relaxed text-negro/80">«Buscaba un gimnasio no masificado, completo, con buen ambiente y lo encontré. Luego el trato con Brais y Pablo espectacular desde el primer momento.»</blockquote>
              <figcaption className="mt-2 text-[12px] text-negro/55">Ruben M. · Reseña de Google</figcaption>
            </figure>
            <a href={negocio.google.url} target="_blank" rel="noopener noreferrer" className="group mt-4 inline-flex items-center gap-1 text-[14px] font-semibold">
              Leer las reseñas en Google <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </a>
          </div>
        </div>
      </div>
      <Normas className="mt-12" />
    </section>
  );
}
