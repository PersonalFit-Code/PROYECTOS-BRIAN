"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import type { PasoDM } from "@/lib/guion";

/** Botón para copiar un mensaje. Los huecos entre corchetes se rellenan después en Instagram. */
function Copiar({ texto }: { texto: string }) {
  const [hecho, setHecho] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
          setHecho(true);
          setTimeout(() => setHecho(false), 2000);
        } catch {
          setHecho(false);
        }
      }}
      className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-bold hover:bg-soft"
    >
      {hecho ? <Check className="size-4 text-ok" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      <span aria-live="polite">{hecho ? "Copiado" : "Copiar"}</span>
    </button>
  );
}

/** La secuencia de mensajes de Instagram, paso a paso, con cuándo mandar cada uno. */
export function SecuenciaDM({ pasos, listo }: { pasos: PasoDM[]; listo: boolean }) {
  return (
    <section aria-labelledby="secuencia-dm">
      <h3 id="secuencia-dm" className="mb-1 text-lg font-bold">
        Por Instagram, paso a paso
      </h3>
      <p className="mb-4 text-sm text-muted">
        {listo ? "Gus ya lo ha personalizado con su nombre y una publicación suya: copia y manda." : "Se puede mandar tal cual. Con la web incluida."}
      </p>
      <ol className="space-y-3">
        {pasos.map((p, i) => (
          <li key={p.titulo} className="grid grid-cols-[2rem_1fr] gap-x-3">
            <span aria-hidden className="grid size-8 place-items-center rounded-full bg-brand text-sm font-bold text-white">
              {i + 1}
            </span>
            <div className="min-w-0 rounded-xl border border-line p-3">
              <p className="text-xs font-bold tracking-wide text-brand uppercase">{p.cuando}</p>
              <h4 className="font-bold">{p.titulo}</h4>
              {p.texto && (
                <div className="mt-2 flex flex-col items-start gap-2 sm:flex-row">
                  <p className="w-full min-w-0 flex-1 rounded-lg bg-soft p-2.5 leading-snug whitespace-pre-line">{p.texto}</p>
                  <Copiar texto={p.texto} />
                </div>
              )}
              {p.nota && <p className="mt-2 text-sm text-muted">{p.nota}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
