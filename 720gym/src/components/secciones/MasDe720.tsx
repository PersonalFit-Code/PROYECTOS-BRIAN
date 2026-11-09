import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/** Enlaces a lo que vive en sus propias páginas: así la portada es más corta. */
const enlaces = [
  { href: "/clubes", etiqueta: "Clubes", titulo: "Clubes que entrenan en 720", texto: "Gimnasia acrobática, capoeira, jiu-jitsu brasileño y halterofilia." },
  { href: "/clubes#profesionales", etiqueta: "720P", titulo: "Espacios para profesionales", texto: "Alquila sala para tus clases, talleres, eventos o clinics." },
  { href: "/preguntas", etiqueta: "Antes de venir", titulo: "Preguntas frecuentes", texto: "Horario, pagos, bonos, recuperación de clases y cómo llegar." },
];

export default function MasDe720() {
  return (
    <section className="bg-pizarra py-20 sm:py-24" aria-label="Más de 720">
      <div className="container-page">
      <ul className="grid gap-px bg-white/10 md:grid-cols-3">
        {enlaces.map((e) => (
          <li key={e.href} data-reveal className="bg-pizarra">
            <Link href={e.href} className="group flex h-full flex-col p-7 transition-colors hover:bg-white/5 sm:p-9">
              <span className="etiqueta text-white/50">{e.etiqueta}</span>
              <span className="mt-4 flex items-start justify-between gap-4">
                <span className="subtitular text-[30px] leading-[1.02]">{e.titulo}</span>
                <ArrowUpRight className="mt-1 size-6 shrink-0 text-white/40 transition-[transform,color] duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white" aria-hidden />
              </span>
              <span className="mt-3 text-[15px] leading-relaxed text-white/60">{e.texto}</span>
            </Link>
          </li>
        ))}
      </ul>
      </div>
    </section>
  );
}
