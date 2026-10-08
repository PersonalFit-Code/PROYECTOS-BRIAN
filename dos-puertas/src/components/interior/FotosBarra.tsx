import Image, { type StaticImageData } from "next/image";
import ronda from "../../../public/images/fotos/ronda-pinchos.webp";
import canaBocadillos from "../../../public/images/fotos/cana-bocadillos.webp";
import pinchoCerca from "../../../public/images/fotos/pincho-cerca.webp";
import tortillaEmpanada from "../../../public/images/fotos/tortilla-empanada.webp";
import canaEmpanadilla from "../../../public/images/fotos/cana-empanadilla.webp";
import { cn } from "@/lib/cn";

type Clave = "ronda" | "canaBocadillos" | "pinchoCerca" | "tortillaEmpanada" | "canaEmpanadilla";

/* Las fotos llegan pequeñas (de 141 a 680 px de ancho): se muestran a su tamaño o menos, nunca
   ampliadas. Las pequeñas van como polaroids, que es donde una foto pequeña queda natural. */
const POLAROIDS: { id: Exclude<Clave, "ronda">; src: StaticImageData; giro: string; ancho: string }[] = [
  { id: "canaEmpanadilla", src: canaEmpanadilla, giro: "-rotate-3", ancho: "w-[136px] sm:w-[164px]" },
  { id: "canaBocadillos", src: canaBocadillos, giro: "rotate-2", ancho: "w-[136px] sm:w-[141px]" },
  { id: "tortillaEmpanada", src: tortillaEmpanada, giro: "-rotate-2", ancho: "w-[136px] sm:w-[141px]" },
  { id: "pinchoCerca", src: pinchoCerca, giro: "rotate-3", ancho: "w-[136px] sm:w-[141px]" },
];

function Polaroid({ src, alt, giro, ancho, delay }: { src: StaticImageData; alt: string; giro: string; ancho: string; delay: number }) {
  return (
    <figure
      data-reveal
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
      className={cn("shrink-0 rounded-[6px] bg-[#f6f1e6] p-2 pb-3 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.85)] transition-transform duration-500 hover:z-10 hover:rotate-0 hover:scale-105", giro, ancho)}
    >
      <Image src={src} alt={alt} sizes="164px" className="h-auto w-full rounded-[2px]" />
      <figcaption className="mt-2 text-center font-display text-[13px] leading-tight text-[#2b2a26]">{alt}</figcaption>
    </figure>
  );
}

/** «En la barra, de verdad»: la ronda de pinchos en grande y las polaroids al lado. */
export default function FotosBarra({ t }: { t: { kicker: string; captions: Record<Clave, string> } }) {
  return (
    <div className="mt-12">
      <p data-reveal className="font-caps text-[11px] font-semibold tracking-[0.24em] text-oro-a11y uppercase">
        {t.kicker}
      </p>
      <div className="mt-5 flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-center lg:gap-10">
        <figure data-reveal className="w-full max-w-[680px]">
          <Image
            src={ronda}
            alt={t.captions.ronda}
            sizes="(max-width: 720px) 100vw, 680px"
            priority={false}
            className="h-auto w-full rounded-[24px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.85)] ring-1 ring-cream/10"
          />
          <figcaption className="mt-2.5 text-sm text-cream-muted">{t.captions.ronda}</figcaption>
        </figure>
        <ul className="flex max-w-[360px] flex-wrap items-center justify-center gap-x-4 gap-y-5">
          {POLAROIDS.map((p, i) => (
            <li key={p.id} className="contents">
              <Polaroid src={p.src} alt={t.captions[p.id]} giro={p.giro} ancho={p.ancho} delay={120 + i * 90} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
