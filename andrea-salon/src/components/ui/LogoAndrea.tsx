import { cn } from "@/lib/utils";

/**
 * El logotipo de Andrea Salón: «Andrea Salón» en caligrafía, «uñas y belleza» debajo en rosa y, si se
 * pide, la filigrana de arriba de su logo (la de abajo se quitó: Brian, 16/10). Es texto de verdad (se lee y se indexa) con la
 * fuente caligráfica; las filigranas son un SVG dibujado aquí, decorativo.
 *
 * Si Andrea entrega el logo original en vectorial, se cambia este componente por la imagen y nada más.
 */
export function Filigrana({ className, invertida = false }: { className?: string; invertida?: boolean }) {
  // Mitad izquierda de la filigrana; la derecha es su espejo. Centro: un rombo fino.
  const mitad = "M112 13 C98 4 80 3 68 10 C60 15 50 15 48 10 C46 5 53 3 56 7 C59 12 52 15 43 13 C30 10 18 11 6 15";
  const bucle = "M96 13 C88 18 80 19 74 16";
  return (
    <svg aria-hidden viewBox="0 0 240 26" className={cn("h-auto w-full", invertida && "rotate-180", className)} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d={mitad} />
      <path d={bucle} />
      <g transform="translate(240 0) scale(-1 1)">
        <path d={mitad} />
        <path d={bucle} />
      </g>
      <path d="M120 3 L126 13 L120 23 L114 13 Z" />
      <path d="M120 8 L123 13 L120 18 L117 13 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function LogoAndrea({
  className,
  tamano = "md",
  filigranas = false,
}: {
  className?: string;
  tamano?: "sm" | "md" | "lg" | "xl";
  filigranas?: boolean;
}) {
  const nombre = { sm: "text-[1.6rem]", md: "text-[2.1rem] lg:text-[2.9rem]", lg: "text-[2.4rem] lg:text-[2.6rem]", xl: "text-[3.4rem] sm:text-[5rem]" }[tamano];
  const lema = { sm: "text-[0.95rem]", md: "text-[1.05rem] lg:text-[1.35rem]", lg: "text-[1.15rem]", xl: "text-[1.6rem] sm:text-[2.2rem]" }[tamano];
  const ancho = { sm: "w-40", md: "w-48 lg:w-56", lg: "w-56", xl: "w-64 sm:w-96" }[tamano];
  return (
    <span className={cn("inline-flex flex-col items-center text-tinta", className)}>
      {filigranas && <Filigrana className={cn(ancho, "mb-0.5")} />}
      <span className={cn("font-[family-name:var(--font-script)] leading-[1.05] whitespace-nowrap", nombre)}>Andrea Salón</span>
      <span className={cn("-mt-1 font-[family-name:var(--font-script)] leading-none whitespace-nowrap text-[var(--color-rosa-logo)]", lema)}>uñas y belleza</span>
    </span>
  );
}
