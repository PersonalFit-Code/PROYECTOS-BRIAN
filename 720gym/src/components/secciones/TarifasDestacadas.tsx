import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { claseBoton } from "@/components/ui/Boton";
import { cn } from "@/lib/utils";

/** Tres tarifas para decidir rápido; el resto, en /tarifas. Precios del dosier 2025-26. */
const planes = [
  { nombre: "Gimnasio libre", precio: "35", unidad: "€/mes", nota: "Oferta de apertura", incluye: ["Acceso ilimitado 365 días", "Máquinas, peso libre y cardio", "Aforo limitado"], plan: "gimnasio-libre", destacado: true },
  { nombre: "Pilates Reformer", precio: "55", unidad: "€/mes", nota: "1 día por semana", incluye: ["Grupos reducidos por niveles", "Sin matrícula", "Primera clase gratis"], plan: "reformer-1" },
  { nombre: "Bono 10 sesiones", precio: "270", unidad: "€", nota: "Entrenamiento personal", incluye: ["27 €/sesión, no caduca", "Valoración y plan a medida", "Dudas por WhatsApp"], plan: "bono-10" },
];

export default function TarifasDestacadas() {
  return (
    <section className="bg-pared py-16 text-negro sm:py-24" aria-labelledby="titulo-tarifas-dest">
      <div className="container-page">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p data-reveal className="etiqueta text-negro/50">Tarifas 2025-26</p>
            <h2 id="titulo-tarifas-dest" data-reveal className="titular mt-3 text-[clamp(1.9rem,3.2vw,2.6rem)]">
              Claras y sin letra pequeña
            </h2>
          </div>
          <Link href="/tarifas" className="group hidden items-center gap-1 text-[14px] font-semibold text-negro/70 hover:text-negro sm:flex">
            Todas las tarifas <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
        <ul className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:gap-4">
          {planes.map((p) => (
            <li key={p.plan} data-reveal className="w-[82%] shrink-0 snap-start md:w-auto">
              <div className={cn("flex h-full flex-col rounded-3xl p-6 transition duration-500 hover:-translate-y-1", p.destacado ? "bg-negro text-white shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)]" : "bg-white ring-1 ring-negro/8")}>
                <p className={cn("etiqueta !text-[10px]", p.destacado ? "text-white/55" : "text-negro/45")}>{p.nota}</p>
                <h3 className="subtitular mt-3 text-[18px]">{p.nombre}</h3>
                <p className="mt-2 flex items-baseline gap-1">
                  <span className="titular text-[48px] leading-none">{p.precio}</span>
                  <span className="text-[14px] font-semibold opacity-60">{p.unidad}</span>
                </p>
                <ul className="mt-5 mb-6 space-y-2 text-[14px]">
                  {p.incluye.map((x) => (
                    <li key={x} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 opacity-70" aria-hidden />
                      {x}
                    </li>
                  ))}
                </ul>
                <Link href={`/alta?plan=${p.plan}`} className={cn(claseBoton(p.destacado ? "venta" : "contorno-oscuro"), "mt-auto w-full rounded-full")}>
                  {p.destacado ? "Inscríbete" : "Elegir"}
                </Link>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/tarifas" className="mt-6 flex items-center justify-center gap-1 rounded-full py-3 text-[14px] font-semibold ring-1 ring-negro/15 sm:hidden">
          Ver todas las tarifas <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
