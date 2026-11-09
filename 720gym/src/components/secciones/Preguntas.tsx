import { Plus } from "lucide-react";
import { preguntas } from "@/data/preguntas";

export default function Preguntas({ pagina = false }: { pagina?: boolean }) {
  const Titulo = pagina ? "h1" : "h2";
  return (
    <section id="preguntas" className={pagina ? "bg-white pt-[calc(var(--header-h)+4rem)] pb-24 text-negro sm:pb-32" : "bg-white py-24 text-negro sm:py-32"} aria-labelledby="titulo-preguntas">
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <p data-reveal className="etiqueta text-negro/50">Preguntas frecuentes</p>
          <Titulo id="titulo-preguntas" data-reveal className="titular mt-5 text-[clamp(2.1rem,3.6vw,3.1rem)]">
            Antes de venir
            {pagina && <span className="sr-only">: preguntas frecuentes de 720 GYM CLUB en Ourense</span>}
          </Titulo>
        </div>
        <div className="lg:col-span-8">
          {preguntas.map((q) => (
            <details key={q.p} data-reveal className="group border-b border-negro/12 first:border-t">
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-6">
                <span className="subtitular text-[22px] sm:text-[26px]">{q.p}</span>
                <Plus className="size-6 shrink-0 text-acento-texto transition-transform duration-300 group-open:rotate-45" aria-hidden />
              </summary>
              <p className="max-w-2xl pb-7 text-[16px] leading-relaxed text-negro/70">{q.r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
