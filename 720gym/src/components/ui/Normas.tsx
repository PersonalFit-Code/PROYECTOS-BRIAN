import { HeartHandshake, Hand, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

/** Sus normas del dosier, fijas (sin cinta): cuatro columnas separadas por líneas finas. */
const normas = [
  { Icono: Hand, texto: "Si puedes levantarlo, puedes bajarlo" },
  { Icono: TrendingUp, texto: "Busca mejorar tu versión y evita las comparaciones" },
  { Icono: HeartHandshake, texto: "Deja los problemas y el ego fuera. ¿Total para qué?" },
  { Icono: Users, texto: "Recuerda que somos una familia" },
];

export default function Normas({ tono = "claro", className }: { tono?: "claro" | "oscuro" | "crema"; className?: string }) {
  const linea = tono === "oscuro" ? "border-white/10 divide-white/10" : "border-negro/10 divide-negro/10";
  return (
    <div className={cn("container-page", className)}>
      <p className={cn("etiqueta", tono === "oscuro" ? "text-white/45" : "text-negro/45")}>Nuestras normas</p>
      <ol className={cn("mt-4 grid border-y sm:grid-cols-2 sm:divide-x lg:grid-cols-4", linea, "divide-y sm:divide-y-0")}>
        {normas.map(({ Icono, texto }, i) => (
          <li key={texto} data-reveal className="flex items-start gap-3 py-5 sm:px-5 sm:first:pl-0 lg:py-7">
            <span className={cn("subtitular pt-0.5 text-[12px]", tono === "oscuro" ? "text-white/40" : "text-negro/40")}>0{i + 1}</span>
            <span>
              <Icono className={cn("size-5", tono === "oscuro" ? "text-white/70" : "text-negro/70")} aria-hidden />
              <span className="titular mt-2 block text-[20px] leading-tight sm:text-[22px]">{texto}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
