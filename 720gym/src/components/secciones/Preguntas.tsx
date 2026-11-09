import Link from "next/link";
import { Plus } from "lucide-react";
import IconoWhatsApp from "@/components/ui/IconoWhatsApp";
import { wa } from "@/data/negocio";
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
            <details key={q.p} data-reveal className="faq group border-b border-negro/12 first:border-t">
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-6">
                <span className="subtitular text-[22px] sm:text-[26px]">{q.p}</span>
                <span className="grid size-10 shrink-0 place-items-center rounded-full ring-1 ring-negro/15 transition duration-300 group-hover:bg-negro group-hover:text-white group-open:rotate-45 group-open:bg-negro group-open:text-white">
                  <Plus className="size-5" aria-hidden />
                </span>
              </summary>
              <p className="max-w-2xl pb-7 text-[16px] leading-relaxed text-negro/70">{q.r}</p>
            </details>
          ))}
          <div data-reveal className="mt-10 flex flex-col gap-4 rounded-3xl bg-negro p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="subtitular text-[20px]">¿Te queda alguna duda?</p>
              <p className="mt-1 text-[14px] text-white/60">Pregúntanos por WhatsApp o pasa a probar una clase.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={wa("Hola, tengo una pregunta sobre 720 GYM CLUB.")} target="_blank" rel="noopener noreferrer" className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#25d366] px-5 text-[14px] font-semibold transition hover:scale-[1.03] active:scale-95">
                <IconoWhatsApp className="size-5" /> WhatsApp
              </a>
              <Link href="/alta" className="boton-venta subtitular inline-flex h-12 items-center px-6 text-[15px]">
                Inscríbete
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
