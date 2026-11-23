import type { Guion } from "@/lib/guion";

const PASOS: { clave: "entrada" | "pregunta" | "prueba" | "regalo" | "cierre"; titulo: string; ayuda: string }[] = [
  { clave: "entrada", titulo: "Entrada", ayuda: "Que note que has mirado su negocio." },
  { clave: "pregunta", titulo: "La pregunta", ayuda: "Haz una sola y cállate." },
  { clave: "prueba", titulo: "El caso real", ayuda: "Dos frases, no más." },
  { clave: "regalo", titulo: "Lo que le das gratis", ayuda: "Poco que pedir, mucho que dar." },
  { clave: "cierre", titulo: "Cierre", ayuda: "Dos opciones, no «¿cuándo te viene bien?»." },
];

/** El guion de la llamada, paso a paso, para leerlo de un vistazo antes de marcar. */
export function GuionLlamada({ guion }: { guion: Guion }) {
  return (
    <div>
      {guion.senal && (
        <p className="mb-4 rounded-xl bg-soft p-3">
          <span className="block text-xs font-bold tracking-wide text-brand uppercase">Por qué le llamas</span>
          <span className="font-bold">{guion.senal}</span>
        </p>
      )}

      <details className="mb-4 rounded-xl border border-line p-3">
        <summary className="cursor-pointer font-bold">Si no coge quien decide</summary>
        <p className="mt-2">{guion.centralita}</p>
      </details>

      <ol className="space-y-4">
        {PASOS.map((p, i) => (
          <li key={p.clave} className="grid grid-cols-[2rem_1fr] gap-x-3">
            <span aria-hidden className="grid size-8 place-items-center rounded-full bg-brand text-sm font-bold text-white">
              {i + 1}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold">
                {p.titulo} <span className="font-[family-name:var(--font-sans)] font-medium text-muted">· {p.ayuda}</span>
              </h3>
              <p className="mt-1 text-lg leading-snug">«{guion[p.clave]}»</p>
            </div>
          </li>
        ))}
      </ol>

      <h3 className="mt-6 mb-2 text-sm font-bold">Si te dicen…</h3>
      <div className="space-y-2">
        {guion.objeciones.map((o) => (
          <details key={o.dicen} className="rounded-xl border border-line p-3">
            <summary className="cursor-pointer font-bold">{o.dicen}</summary>
            <p className="mt-2">{o.contestas}</p>
          </details>
        ))}
      </div>

      {guion.cualificar.length > 0 && (
        <details className="mt-6 rounded-xl border border-line p-3" open>
          <summary className="cursor-pointer font-bold">Para saber si encaja</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {guion.cualificar.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-muted">Encaja si le entran muchos mensajes, usa un asistente de IA de pago y quiere configurarlo él.</p>
        </details>
      )}
      {guion.precios.length > 0 && (
        <details className="mt-2 rounded-xl border border-line p-3">
          <summary className="cursor-pointer font-bold">Preguntas de precio (apunta la respuesta literal)</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {guion.precios.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </details>
      )}

      {guion.mensaje && (
        <div className="mt-6 rounded-xl border border-line p-3">
          <h3 className="text-sm font-bold">Si le escribes por Instagram</h3>
          <p className="mt-1">{guion.mensaje}</p>
        </div>
      )}

      <p className="mt-4 text-sm text-muted">{guion.seguimiento}</p>
      <p className="mt-2 text-xs text-muted">
        {guion.aMedida ? "Guion escrito a medida para este negocio." : "Guion montado con lo que sabemos del negocio. Mira su web 20 segundos antes de marcar."}
        {guion.precios.length === 0 && " Sin precios por teléfono."}
      </p>
    </div>
  );
}
