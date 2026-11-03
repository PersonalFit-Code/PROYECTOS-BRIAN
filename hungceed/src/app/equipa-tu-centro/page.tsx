import type { Metadata } from "next";
import { Check } from "lucide-react";
import Foto from "@/components/ui/Foto";
import FormularioPresupuesto from "@/components/tienda/FormularioPresupuesto";
import { PRODUCTOS, SERIES } from "@/data/catalogo";
import { GYM } from "@/data/gym";

export const metadata: Metadata = { title: "Equipa tu centro" };

/**
 * Entrada para el cliente profesional (gimnasios, boxes, estudios): es donde están los pedidos
 * grandes y hoy su web no lo distingue del comprador de home gym.
 */
export default function PaginaEquipaTuCentro() {
  const elite = PRODUCTOS.filter((p) => p.serie === "elite").slice(0, 4);
  return (
    <>
      <section className="relative isolate overflow-hidden bg-negro pt-[var(--header-h)] text-white">
        <div className="absolute inset-0 -z-10">
          <Foto src={GYM.fotos.portada} alt="" prioridad className="opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-negro via-negro/80 to-negro/30" />
        </div>
        <div className="container-page py-20 sm:py-28">
          <p className="hero-in etiqueta text-white/80" style={{ ["--i" as string]: 0 }}>
            Para gimnasios, boxes y estudios
          </p>
          <h1 className="hero-in titular mt-4 max-w-3xl text-[clamp(2.4rem,7vw,5.5rem)]" style={{ ["--i" as string]: 1 }}>
            Equipa tu centro <span className="text-white/70">con una sola marca.</span>
          </h1>
          <p className="hero-in mt-6 max-w-xl text-lg text-white/80" style={{ ["--i" as string]: 2 }}>
            Máquinas de uso comercial, racks y peso libre que encajan entre sí. Cuéntanos qué montas y te preparamos una propuesta a medida.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-12 py-16 lg:grid-cols-[1fr_0.8fr] lg:gap-20 sm:py-20">
        <div>
          <h2 className="subtitular text-2xl sm:text-3xl">Pide presupuesto</h2>
          <p className="mt-3 text-gris">Sin compromiso. Cuanto más nos cuentes, más afinada llega la propuesta.</p>
          <div className="mt-8">
            <FormularioPresupuesto />
          </div>
        </div>
        <aside className="self-start border border-linea p-7">
          <h2 className="subtitular text-xl">Qué incluye</h2>
          <ul className="mt-5 space-y-3 text-[15px]">
            {[
              `${SERIES.elite.nombre}: ${SERIES.elite.lema.toLowerCase()}`,
              `${SERIES.pro.nombre}: ${SERIES.pro.lema.toLowerCase()}`,
              "Racks y jaulas con toda la Attachment Series",
              "Soporte técnico antes y después de la compra",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-rojo" /> {t}
              </li>
            ))}
          </ul>
          <ul className="mt-8 grid grid-cols-2 gap-2">
            {elite.map((p) => (
              <li key={p.slug} className="aspect-square bg-white">
                <Foto src={p.imagen} alt={p.nombre} contener className="p-2" />
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </>
  );
}
