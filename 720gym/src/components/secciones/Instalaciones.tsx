import Image from "next/image";
import { DoorOpen, KeyRound, ShowerHead, Shirt } from "lucide-react";
import { fotos } from "@/data/fotos";

/**
 * «Acceso e instalaciones» (texto del boceto de Brais): vestuarios, duchas y acceso, con sus fotos
 * reales. Cuatro fotos verticales en fila; en el móvil se deslizan.
 */
const piezas = [
  { ...fotos.vestuarioBancos, titulo: "Vestuarios amplios", Icono: Shirt },
  { ...fotos.vestuarioDuchas, titulo: "Duchas", Icono: ShowerHead },
  { ...fotos.vestuarioLavabos, titulo: "Lavabos y espejos", Icono: DoorOpen },
  { ...fotos.vestuarioCabinas, titulo: "Cabinas", Icono: KeyRound },
];

export default function Instalaciones() {
  return (
    <section className="bg-pared py-16 text-negro sm:py-24" aria-labelledby="titulo-instalaciones">
      <div className="container-page grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-5">
          <p data-reveal className="etiqueta text-negro/50">Acceso e instalaciones</p>
          <h2 id="titulo-instalaciones" data-reveal className="titular mt-3 text-[clamp(1.9rem,3.2vw,2.6rem)]">
            Todo listo para que solo pienses en entrenar
          </h2>
        </div>
        <p data-reveal className="text-[16px] leading-relaxed text-negro/65 lg:col-span-6 lg:col-start-7">
          Acceso electrónico, vestuarios amplios, duchas y taquillas para que organices tus entrenamientos a tu manera.
        </p>
      </div>
      <ul className="no-scrollbar mt-10 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 sm:px-6 lg:container-page lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible">
        {piezas.map(({ src, alt, titulo, Icono }) => (
          <li key={src} data-reveal className="relative w-[62vw] shrink-0 snap-start sm:w-[38vw] lg:w-auto">
            <div className="group relative aspect-[3/4] overflow-hidden rounded-3xl bg-niebla">
              <Image src={src} alt={alt} fill sizes="(min-width:1024px) 25vw, 62vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" aria-hidden />
              <span className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                <Icono className="size-4 text-marca" aria-hidden />
                <span className="subtitular text-[16px]">{titulo}</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
