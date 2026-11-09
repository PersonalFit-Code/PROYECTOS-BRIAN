import { cn } from "@/lib/utils";

/**
 * Cinta de submarcas y clubes (Bodyism), v3: dos filas en sentidos opuestos, cada marca en una
 * pastilla de vidrio, sobre un fondo con brillo. Hasta tener sus logos, marcas tipográficas.
 */
const submarcas = [
  ["720", "GYM"],
  ["720", "PILATES"],
  ["720", "YOGA"],
  ["CROSSGYM", "720"],
  ["720", "POWERLIFTING"],
  ["720P", "PROFESIONALES"],
];
const clubes = [
  ["XIMNASIA", "BURGAS"],
  ["CAPOEIRA", "ANDARUÊ"],
  ["BJJ", "MAMBISES"],
  ["HALTEROFILIA", "720"],
];

function Fila({ items, estilo, sentido }: { items: string[][]; estilo: "marca" | "club"; sentido: 1 | -1 }) {
  const lista = [...items, ...items, ...items];
  return (
    <div className="cinta-caja overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <ul className="cinta gap-3 pr-3" data-sentido={sentido} style={{ ["--cinta-duracion" as string]: "40s" }}>
        {[...lista, ...lista].map(([a, b], i) => (
          <li key={i} aria-hidden={i >= items.length || undefined} className="tarjeta-vidrio flex shrink-0 items-baseline gap-2 rounded-full px-5 py-3">
            {estilo === "marca" ? (
              <>
                <span className="marca text-[22px]">{a}</span>
                <span className="text-[11px] font-bold tracking-[0.18em] text-white/70">{b}</span>
              </>
            ) : (
              <>
                <span className="text-[14px] font-extrabold tracking-tight">{a}</span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-white/60">{b}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CintaLogos({ className }: { className?: string; tono?: "claro" | "oscuro" }) {
  return (
    <section aria-label="Submarcas y clubes de 720" className={cn("relative overflow-hidden bg-negro py-12 text-white", className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_50%,rgb(255_255_255/0.08),transparent_70%)]" aria-hidden />
      <p className="etiqueta relative text-center text-white/45">El universo 720 · submarcas y clubes</p>
      <div className="relative mt-6 space-y-3">
        <Fila items={submarcas} estilo="marca" sentido={1} />
        <Fila items={clubes} estilo="club" sentido={-1} />
      </div>
    </section>
  );
}
