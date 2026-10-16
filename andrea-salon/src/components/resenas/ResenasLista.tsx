"use client";

import { useRef } from "react";
import { useReveal } from "@/hooks/useReveal";
import { REVIEWS_SHOWN } from "@/data/reviews";
import { ReviewCard } from "./SocialProof";

/**
 * Las mismas reseñas, QUIETAS y todas a la vista, para /resenas: la cascada de la portada es un
 * escaparate, pero quien entra en la página de reseñas quiere leerlas, y una lista que se mueve
 * no se lee (ni la rastrea bien un buscador: media copia va `aria-hidden`).
 */
export default function ResenasLista() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  return (
    <div ref={ref} className="container-page pb-20 sm:pb-28">
      <ul className="columns-1 gap-x-10 md:columns-2 lg:columns-3">
        {REVIEWS_SHOWN.map((r) => (
          <li key={r.id} data-reveal className="break-inside-avoid">
            <ReviewCard r={r} />
          </li>
        ))}
      </ul>
    </div>
  );
}
