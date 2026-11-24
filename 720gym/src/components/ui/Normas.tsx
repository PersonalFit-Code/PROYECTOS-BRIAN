import { HeartHandshake, Hand, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

/** Las normas de la casa (de su dosier): cuatro fichas numeradas que se destacan en naranja al pasar. */
const normas = [
  { Icono: Hand, texto: "Si puedes levantarlo, puedes bajarlo" },
  { Icono: TrendingUp, texto: "Busca mejorar tu versión y evita las comparaciones" },
  { Icono: HeartHandshake, texto: "Deja los problemas y el ego fuera. ¿Total para qué?" },
  { Icono: Users, texto: "Recuerda que somos una familia" },
];

export default function Normas({ className }: { className?: string }) {
  return (
    <div className={cn("container-page text-negro", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="etiqueta text-negro/50">Las normas de la casa</p>
          <h3 data-reveal className="titular mt-3 text-titulo-3">
            Cuatro normas. <span className="resalte">Nada más.</span>
          </h3>
        </div>
      </div>
      <ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {normas.map(({ Icono, texto }, i) => (
          <li key={texto} data-reveal className="ficha-clara group relative flex min-h-[11.5rem] flex-col overflow-hidden rounded-3xl border border-negro/10 bg-white p-6">
            <span className="titular absolute -top-3 right-3 text-[92px] leading-none text-negro/[0.06] transition-colors group-hover:text-marca/25" aria-hidden>
              0{i + 1}
            </span>
            <span className="grid size-11 place-items-center rounded-2xl bg-negro text-white">
              <Icono className="size-5" aria-hidden />
            </span>
            <span className="titular relative mt-auto block pt-6 text-[22px] leading-[1.08]">{texto}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
