import Foto from "./Foto";
import { cn } from "@/lib/utils";

/**
 * Composición de 2 o 3 fotos superpuestas (Bodyism): una grande vertical, otra que la solapa abajo
 * y, opcionalmente, una tercera pequeña arriba. Cada hueco lleva su descripción hasta tener la foto.
 */
export default function Collage({
  fotos,
  tono = "oscuro",
  espejo = false,
  className,
}: {
  fotos: { descripcion: string; src?: string }[];
  tono?: "oscuro" | "claro" | "crema";
  espejo?: boolean;
  className?: string;
}) {
  const [a, b, c] = fotos;
  const borde = tono === "oscuro" ? "ring-8 ring-negro" : tono === "crema" ? "ring-8 ring-crema" : "ring-8 ring-pared";
  return (
    <div className={cn("relative mx-auto w-full max-w-xl pb-[18%]", className)}>
      <div data-reveal className={cn("w-[72%]", espejo && "ml-auto")}>
        <Foto {...a} tono={tono} proporcion="aspect-[4/5]" sizes="(min-width:1024px) 30vw, 70vw" posicion={espejo ? "arriba-der" : "arriba-izq"} />
      </div>
      {b && (
        <div data-reveal className={cn("absolute bottom-0 w-[52%] shadow-2xl", espejo ? "left-0" : "right-0", borde)}>
          <Foto {...b} tono={tono} proporcion="aspect-[4/3]" sizes="(min-width:1024px) 22vw, 50vw" />
        </div>
      )}
      {c && (
        <div data-reveal className={cn("absolute top-[8%] w-[34%] shadow-2xl", espejo ? "left-[2%]" : "right-[2%]", borde)}>
          <Foto {...c} tono={tono} proporcion="aspect-square" sizes="(min-width:1024px) 14vw, 34vw" />
        </div>
      )}
    </div>
  );
}
