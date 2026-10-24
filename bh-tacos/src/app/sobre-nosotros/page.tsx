import type { Metadata } from "next";
import Link from "next/link";
import { BadgeEuro, Leaf, PartyPopper } from "lucide-react";
import { ABOUT, BUSINESS, SEO } from "@/content";
import Reveal from "@/components/common/Reveal";
import TacoPreview from "@/components/common/TacoPreview";

export const metadata: Metadata = {
  title: SEO.about.title,
  description: SEO.about.description,
  alternates: { canonical: "/sobre-nosotros" },
  openGraph: { title: SEO.about.title, description: SEO.about.description, url: "/sobre-nosotros" },
};

const ICONS = [Leaf, BadgeEuro, PartyPopper];

export default function AboutPage() {
  return (
    <div className="pb-24">
      <Reveal />
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-8 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:pt-14">
        <div>
          <p className="kicker text-sm">Sobre nosotros</p>
          <h1 className="mt-2 font-display text-5xl uppercase leading-[0.95] sm:text-7xl">{ABOUT.story.title}</h1>
          {ABOUT.story.paragraphs.map((p) => (
            <p key={p.slice(0, 20)} className="mt-6 text-lg leading-relaxed text-fg-muted">
              {p}
            </p>
          ))}
        </div>
        <div className="anim-float text-fg">
          <TacoPreview style="clasico" size="L" meats={["pollo", "cordon-bleu"]} sauces={["algerienne", "spicy-marbella"]} className="h-auto w-full" />
        </div>
      </section>

      <section aria-labelledby="people-title" className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <figure className="reveal card relative overflow-hidden p-8 sm:p-10">
          <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/25 blur-2xl" />
          <h2 id="people-title" className="font-display text-4xl uppercase text-brand-text">{ABOUT.people.title}</h2>
          <blockquote className="mt-4 max-w-3xl text-lg leading-relaxed">{ABOUT.people.text}</blockquote>
          <figcaption className="mt-4 text-sm text-fg-muted">
            Fuente:{" "}
            <a href={ABOUT.people.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-fg">
              {ABOUT.people.source}
            </a>
          </figcaption>
        </figure>
      </section>

      <section aria-labelledby="values-title" className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <h2 id="values-title" className="reveal font-display text-4xl uppercase sm:text-5xl">{ABOUT.values.title}</h2>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {ABOUT.values.items.map((v, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <li key={v.title} className="reveal" style={{ ["--i" as string]: i }}>
                <article className="card lift press h-full p-6">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-white">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display text-3xl uppercase">{v.title}</h3>
                  <p className="mt-2 text-fg-muted">{v.text}</p>
                </article>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label="Lo que nos define" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {ABOUT.badges.map((b, i) => (
            <li key={b.label} className="reveal card flex flex-col items-center gap-2 p-6 text-center" style={{ ["--i" as string]: i }}>
              <span className="text-4xl" aria-hidden>
                {b.icon}
              </span>
              <span className="font-semibold">{b.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-20 max-w-5xl px-4 sm:px-6">
        <div className="reveal rounded-[28px] bg-brand px-6 py-12 text-center text-white">
          <h2 className="font-display text-4xl uppercase sm:text-5xl">{ABOUT.cta.title}</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/carta" className="press btn btn-cheese">
              {ABOUT.cta.menu}
            </Link>
            <a href={BUSINESS.maps} target="_blank" rel="noopener noreferrer" className="press btn bg-ink text-white">
              {ABOUT.cta.maps}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
