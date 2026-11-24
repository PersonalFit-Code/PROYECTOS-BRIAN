import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** 720P en la portada: el espacio reservado para profesionales, con su logo, y enlace a su apartado. */
export default function Banda720P() {
  return (
    <section className="bg-pared py-12 text-negro sm:py-16" aria-labelledby="titulo-720p">
      <div className="container-page">
        <Link href="/720p" data-reveal className="ficha-clara group flex flex-col gap-6 rounded-[2rem] border border-negro/10 bg-white p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
          <Image src="/sellos/720p-logo.png" alt="Logo de 720P" width={120} height={120} className="size-24 shrink-0 rounded-3xl sm:size-[120px]" />
          <div className="min-w-0 flex-1">
            <p className="etiqueta text-negro/50">720P · Espacios para profesionales</p>
            <h2 id="titulo-720p" className="titular mt-3 text-titulo-3">
              Un espacio reservado para <span className="resalte">profesionales</span>
            </h2>
            <p className="mt-2 max-w-2xl text-[15.5px] leading-relaxed text-negro/65">
              Entrenadores, terapeutas, instructores y clubes: alquila una sala o el centro entero para tus clases, cursos, talleres o eventos.
            </p>
          </div>
          <span className="boton-info subtitular inline-flex h-12 shrink-0 items-center gap-2 px-6 text-[15px]">
            Ver 720P <ArrowRight className="size-4 text-marca transition-transform group-hover:translate-x-1" aria-hidden />
          </span>
        </Link>
      </div>
    </section>
  );
}
