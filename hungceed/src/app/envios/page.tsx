import type { Metadata } from "next";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import Boton from "@/components/ui/Boton";
import Garantias from "@/components/tienda/Garantias";
import { NEGOCIO } from "@/data/negocio";

export const metadata: Metadata = { title: "Envíos y garantía" };

/**
 * Envíos, garantía y pago en una página propia (hoy solo aparecen dentro de cada ficha). Los textos
 * salen de lo que ya promete su web; el detalle (zonas, costes, montaje) lo confirma Jose.
 */
const PREGUNTAS = [
  { p: "¿Cuánto tarda el envío?", r: "Entre 48 y 72 horas desde que sale el pedido. Te avisamos en cada fase." },
  { p: "¿Qué garantía tengo?", r: "30 días. Si algo no encaja, nos escribes y lo resolvemos según la política de devoluciones." },
  { p: "¿Cómo puedo pagar?", r: "Tarjeta (Visa, Mastercard), PayPal, Apple Pay y Google Pay. Pago cifrado." },
  { p: "¿Me ayudáis a elegir o a montar?", r: "Sí. Soporte técnico real, antes y después de la compra. Lo más rápido es WhatsApp." },
];

export default function PaginaEnvios() {
  return (
    <>
      <section className="bg-negro pt-[var(--header-h)] text-white">
        <div className="container-page py-14 sm:py-20">
          <p className="etiqueta text-rojo">Ayuda</p>
          <h1 className="titular mt-4 text-4xl sm:text-6xl">Envíos y garantía</h1>
          <p className="mt-4 max-w-xl text-white/75">Todo lo que necesitas saber antes de comprar, en un solo sitio.</p>
        </div>
      </section>
      <div className="container-page py-2">
        <Garantias />
      </div>
      <section className="container-page grid gap-12 py-16 lg:grid-cols-[1fr_0.8fr]">
        <dl className="divide-y divide-linea border-y border-linea">
          {PREGUNTAS.map((q) => (
            <div key={q.p} className="py-6">
              <dt className="text-[17px] font-bold">{q.p}</dt>
              <dd className="mt-2 leading-relaxed text-gris">{q.r}</dd>
            </div>
          ))}
        </dl>
        <aside className="self-start bg-hueso p-8">
          <h2 className="subtitular text-2xl">¿Otra duda?</h2>
          <p className="mt-3 text-gris">Escríbenos por WhatsApp y te contestamos.</p>
          <div className="mt-6 flex flex-col gap-3">
            <Boton href={NEGOCIO.whatsapp} target="_blank" icon={<MessageCircle aria-hidden />}>
              WhatsApp
            </Boton>
            <Boton href={NEGOCIO.devoluciones} target="_blank" variant="secundario" iconRight={<ArrowUpRight aria-hidden />}>
              Política de devoluciones
            </Boton>
          </div>
          <p className="mt-6 text-[12px] text-gris">Pendiente de Jose: zonas de envío, coste por peso y si hay montaje a domicilio.</p>
        </aside>
      </section>
    </>
  );
}
