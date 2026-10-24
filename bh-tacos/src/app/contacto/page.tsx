import type { Metadata } from "next";
import { MapPin, Navigation } from "lucide-react";
import { BUSINESS, CONTACT, SEO } from "@/content";
import OrderOptions from "@/components/contacto/OrderOptions";
import HoursWidget from "@/components/contacto/HoursWidget";
import MapEmbed from "@/components/contacto/MapEmbed";
import ContactForm from "@/components/contacto/ContactForm";
import SocialGrid from "@/components/contacto/SocialGrid";
import Reveal from "@/components/common/Reveal";

export const metadata: Metadata = {
  title: SEO.contacto.title,
  description: SEO.contacto.description,
  alternates: { canonical: "/contacto" },
  openGraph: { title: SEO.contacto.title, description: SEO.contacto.description, url: "/contacto" },
};

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-20 px-4 pb-24 pt-8 sm:px-6 lg:pt-12">
      <Reveal />
      <header>
        <p className="kicker text-sm">Contacto</p>
        <h1 className="mt-2 font-display text-5xl uppercase leading-none sm:text-7xl">
          Contacto, horario <span className="text-brand-text">y pedidos</span>
        </h1>
      </header>

      <OrderOptions />

      <section aria-labelledby="horario-title" className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 id="horario-title" className="font-display text-4xl uppercase sm:text-5xl">{CONTACT.hoursTitle}</h2>
          <div className="mt-8">
            <HoursWidget />
          </div>
        </div>
        <div className="flex flex-col">
          <h2 className="font-display text-4xl uppercase sm:text-5xl">{CONTACT.mapTitle}</h2>
          <address className="mt-8 not-italic">
            <p className="flex items-start gap-2 text-lg font-semibold">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-brand-text" aria-hidden /> {BUSINESS.address.full}
            </p>
            <p className="mt-2 text-fg-muted">{CONTACT.mapExtra}</p>
          </address>
          <a href={BUSINESS.maps} target="_blank" rel="noopener noreferrer" className="press btn btn-cheese mt-5 self-start">
            <Navigation className="h-5 w-5" aria-hidden /> Cómo llegar
          </a>
          <div className="mt-6 flex-1">
            <MapEmbed />
          </div>
        </div>
      </section>

      <section aria-labelledby="form-title" className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 id="form-title" className="font-display text-4xl uppercase sm:text-5xl">{CONTACT.formTitle}</h2>
          <p className="mt-4 text-fg-muted">¿Un evento, un pedido grande o una duda? Cuéntanos y te respondemos.</p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
        <div>
          <h2 className="font-display text-4xl uppercase sm:text-5xl">{CONTACT.socialTitle}</h2>
          <div className="mt-8">
            <SocialGrid />
          </div>
        </div>
      </section>
    </div>
  );
}
