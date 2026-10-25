import Link from "next/link";
import { BUSINESS, HOME } from "@/content";
import { GENERIC_ORDER_TEXT, whatsappUrl } from "@/lib/whatsapp";

export default function FinalCta() {
  const c = HOME.finalCta;
  return (
    <section id="pedir" aria-labelledby="cta-title" className="px-4 py-20 sm:px-6">
      <div className="reveal relative mx-auto max-w-5xl overflow-hidden rounded-[28px] bg-brand px-6 py-14 text-center text-ink sm:px-12">
        <div aria-hidden className="pointer-events-none absolute -left-10 -top-16 h-56 w-56 rounded-full bg-gold/40 blur-3xl" />
        <h2 id="cta-title" className="relative font-display text-6xl uppercase sm:text-7xl">
          {c.title}
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-lg text-ink/85">{c.text}</p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/monta-tu-taco" className="press btn btn-cheese">
            {c.ctaBuilder}
          </Link>
          <a href={whatsappUrl(GENERIC_ORDER_TEXT)} target="_blank" rel="noopener noreferrer" className="press btn bg-ink text-white">
            {c.ctaWhatsapp}
          </a>
          <a href={BUSINESS.maps} target="_blank" rel="noopener noreferrer" className="press btn border-2 border-ink/70 text-ink">
            {c.ctaMaps}
          </a>
        </div>
      </div>
    </section>
  );
}
