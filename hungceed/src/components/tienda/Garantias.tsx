import { Headphones, ShieldCheck, Truck, CreditCard } from "lucide-react";
import { GARANTIAS } from "@/data/negocio";
import { cn } from "@/lib/utils";

const ICONOS = [Truck, ShieldCheck, CreditCard, Headphones];

/** Franja de confianza: envío, garantía, pago y soporte (lo que hoy solo sale dentro de la ficha). */
export default function Garantias({ oscuro = false }: { oscuro?: boolean }) {
  return (
    <ul className={cn("grid gap-px sm:grid-cols-2 lg:grid-cols-4", oscuro ? "bg-white/10" : "bg-linea")}>
      {GARANTIAS.map((g, i) => {
        const Icono = ICONOS[i]!;
        return (
          <li key={g.titulo} className={cn("flex gap-4 p-6", oscuro ? "bg-negro" : "bg-white")}>
            <Icono aria-hidden className="mt-0.5 size-6 shrink-0 text-rojo" />
            <div>
              <h3 className={cn("text-[14px] font-bold tracking-[0.04em] uppercase", oscuro ? "text-white" : "text-negro")}>{g.titulo}</h3>
              <p className={cn("mt-1.5 text-[13px] leading-relaxed", oscuro ? "text-gris-claro" : "text-gris")}>{g.texto}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
