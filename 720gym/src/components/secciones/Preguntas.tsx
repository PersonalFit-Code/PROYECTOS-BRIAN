import { Plus } from "lucide-react";
import { preguntas } from "@/data/preguntas";

export default function Preguntas() {
  return (
    <section id="preguntas" className="bg-white py-24 text-negro sm:py-32" aria-labelledby="titulo-preguntas">
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <p data-reveal className="etiqueta text-negro/50">
            <span className="text-acento-texto">11</span> · Preguntas frecuentes
          </p>
          <h2 id="titulo-preguntas" data-reveal className="titular mt-5 text-[clamp(3rem,8vw,6rem)]">
            Antes de venir
          </h2>
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
