"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import Foto from "@/components/ui/Foto";
import { negocio } from "@/data/negocio";

/**
 * «Aquí no había nada»: antes y después del local con un deslizador. Las dos imágenes saldrán de
 * su vídeo de Instagram (un fotograma del local vacío y la sala hoy).
 */
const ANTES: string | undefined = undefined;
const DESPUES: string | undefined = "/fotos/sala-general.webp";

export default function Historia() {
  const [pos, setPos] = useState(50);
  return (
    <section id="historia" className="relative overflow-hidden bg-negro py-24 sm:py-32" aria-labelledby="titulo-historia">
      <div className="container-page grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-5">
          <p data-reveal className="etiqueta text-white/55">
            Nuestra historia
          </p>
          <h2 id="titulo-historia" data-reveal className="titular mt-5 text-[clamp(2.4rem,4.6vw,3.6rem)]">
            Aquí no había <span className="text-acento">nada.</span>
          </h2>
          <div data-reveal className="mt-8 max-w-md space-y-4 text-[16px] leading-relaxed text-white/70">
            <p>Un bajo vacío en la calle Río Bibei. Paredes desnudas, suelo de obra y una idea: crear el gimnasio en el que nos gustaría entrenar.</p>
            <p>
              Hoy son {negocio.metros} con máquinas, peso libre, powerlifting, cardio, funcional, Pilates y yoga. Y, sobre todo, una comunidad que lo llena de
              vida cada día.
            </p>
          </div>
          <a
            data-reveal
            href={negocio.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 text-[15px] font-semibold text-white hover:text-acento"
          >
            <span className="grid size-11 place-items-center rounded-full bg-acento text-acento-tinta">
              <Play className="size-4 fill-current" aria-hidden />
            </span>
            Ver el vídeo de la obra en Instagram
          </a>
        </div>

        <div data-reveal className="lg:col-span-7">
          <div className="relative aspect-[4/3] select-none overflow-hidden">
            <div className="absolute inset-0">
              <Foto src={DESPUES} descripcion="DESPUÉS: la sala hoy, mismo encuadre que la foto de antes" proporcion="h-full" />
            </div>
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
              <Foto src={ANTES} descripcion="ANTES: el local vacío, fotograma del vídeo «Aquí no había nada»" proporcion="h-full" tono="claro" bn />
            </div>
            <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-acento" style={{ left: `${pos}%` }} aria-hidden>
              <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-acento text-acento-tinta subtitular text-[14px]">
                ⟷
              </span>
            </div>
            <span className="absolute top-4 left-4 bg-negro/80 px-2 py-1 etiqueta text-white">Antes</span>
            <span className="absolute top-4 right-4 bg-negro/80 px-2 py-1 etiqueta text-white">Después</span>
            <input
              type="range"
              min={0}
              max={100}
              value={pos}
              onChange={(e) => setPos(Number(e.target.value))}
              aria-label="Comparar antes y después"
              className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
