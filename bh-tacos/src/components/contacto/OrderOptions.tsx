import { Bike, MessageCircle, Phone, Store } from "lucide-react";
import { BUSINESS, CONTACT } from "@/content";
import { GENERIC_ORDER_TEXT, whatsappUrl } from "@/lib/whatsapp";

/* TODO: sustituir los botones de color por los logos oficiales de Just Eat y Uber Eats (con su
   permiso de uso de marca). Hoy son placeholders con sus colores corporativos. */
export default function OrderOptions() {
  const o = CONTACT.order;
  return (
    <section id="pedir" aria-labelledby="pedir-title" className="scroll-mt-24">
      <h2 id="pedir-title" className="font-display text-4xl uppercase sm:text-5xl">{o.title}</h2>
      <ul className="mt-8 grid gap-5 md:grid-cols-3">
        <li className="reveal">
          <article className="card flex h-full flex-col p-6">
            <Bike className="h-10 w-10 text-cheese" aria-hidden />
            <h3 className="mt-4 font-display text-3xl uppercase">{o.delivery.title}</h3>
            <p className="mt-2 flex-1 text-fg-muted">{o.delivery.text}</p>
            <div className="mt-5 grid gap-2">
              <a href={BUSINESS.delivery.justEat} target="_blank" rel="noopener noreferrer" className="press btn bg-[#FF8000] text-ink">
                Just Eat
              </a>
              <a href={BUSINESS.delivery.uberEats} target="_blank" rel="noopener noreferrer" className="press btn bg-[#06C167] text-ink">
                Uber Eats
              </a>
            </div>
          </article>
        </li>
        <li className="reveal" style={{ ["--i" as string]: 1 }}>
          <article className="card flex h-full flex-col p-6">
            <Store className="h-10 w-10 text-brand-text" aria-hidden />
            <h3 className="mt-4 font-display text-3xl uppercase">{o.pickup.title}</h3>
            <p className="mt-2 flex-1 text-fg-muted">{o.pickup.text}</p>
            <a href={`tel:${BUSINESS.phone.tel}`} className="press btn btn-primary mt-5">
              <Phone className="h-5 w-5" aria-hidden /> {BUSINESS.phone.display}
            </a>
          </article>
        </li>
        <li className="reveal" style={{ ["--i" as string]: 2 }}>
          <article className="card flex h-full flex-col p-6">
            <MessageCircle className="h-10 w-10 text-salsa" aria-hidden />
            <h3 className="mt-4 font-display text-3xl uppercase">{o.whatsapp.title}</h3>
            <p className="mt-2 flex-1 text-fg-muted">{o.whatsapp.text}</p>
            <a href={whatsappUrl(GENERIC_ORDER_TEXT)} target="_blank" rel="noopener noreferrer" className="press btn btn-salsa mt-5">
              Escribir por WhatsApp
            </a>
          </article>
        </li>
      </ul>
      <p className="mt-4 text-sm text-fg-muted">{o.noGlovo}</p>
    </section>
  );
}
