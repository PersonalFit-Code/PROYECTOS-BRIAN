/**
 * Cinta de logos al final (Bodyism): submarcas 720 y clubes que entrenan dentro. Mientras no
 * tengamos sus logos en buena calidad, cada uno va como marca tipográfica.
 */
const marcas: { a: string; b?: string; estilo: "stencil" | "club" }[] = [
  { a: "720", b: "GYM", estilo: "stencil" },
  { a: "720", b: "PILATES", estilo: "stencil" },
  { a: "720", b: "YOGA", estilo: "stencil" },
  { a: "CROSSGYM", b: "720", estilo: "stencil" },
  { a: "720", b: "POWERLIFTING", estilo: "stencil" },
  { a: "720P", b: "PROFESIONALES", estilo: "stencil" },
  { a: "XIMNASIA", b: "BURGAS", estilo: "club" },
  { a: "CAPOEIRA", b: "ANDARUÊ", estilo: "club" },
  { a: "BJJ", b: "MAMBISES", estilo: "club" },
];

export default function CintaLogos({ tono = "claro" }: { tono?: "claro" | "oscuro" }) {
  const lista = [...marcas, ...marcas];
  return (
    <section aria-label="Submarcas y clubes de 720" className={tono === "claro" ? "bg-acero text-negro" : "bg-negro text-white"}>
      <div className="container-page flex items-center justify-between pt-10">
        <p className="etiqueta opacity-55">El universo 720</p>
        <p className="etiqueta opacity-55">Submarcas y clubes</p>
      </div>
      <div className="relative overflow-hidden py-10 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <ul className="marquesina-pista flex w-max items-center gap-16 pr-16">
          {lista.map((m, i) => (
            <li key={i} aria-hidden={i >= marcas.length} className="flex shrink-0 items-baseline gap-2 opacity-70 transition-opacity hover:opacity-100">
              {m.estilo === "stencil" ? (
                <>
                  <span className="titular text-[40px]">{m.a}</span>
                  <span className="subtitular text-[18px] tracking-[0.12em]">{m.b}</span>
                </>
              ) : (
                <>
                  <span className="font-club text-[22px] font-black tracking-tight">{m.a}</span>
                  <span className="font-club text-[14px] font-extrabold tracking-[0.2em] opacity-70">{m.b}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
