import type { Metadata } from "next";
import { SEO } from "@/content";
import TacoBuilder from "@/components/builder/TacoBuilder";

export const metadata: Metadata = {
  title: SEO.builder.title,
  description: SEO.builder.description,
  alternates: { canonical: "/monta-tu-taco" },
  openGraph: { title: SEO.builder.title, description: SEO.builder.description, url: "/monta-tu-taco" },
};

export default function BuilderPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:pt-12">
      <p className="kicker text-sm">Configurador</p>
      <h1 className="mt-2 font-display text-5xl uppercase leading-none sm:text-7xl">
        Monta tu <span className="text-brand-text">taco</span>
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-fg-muted">Estilo, tamaño, carnes, salsas y gratinado. Lo ves montarse en directo y lo pides por WhatsApp o lo recoges en el local.</p>
      <div className="mt-10">
        <TacoBuilder />
      </div>
    </div>
  );
}
