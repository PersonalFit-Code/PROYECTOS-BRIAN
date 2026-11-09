import type { Metadata } from "next";
import Preguntas from "@/components/secciones/Preguntas";
import Contacto from "@/components/secciones/Contacto";
import Cierre from "@/components/secciones/Cierre";
import JsonLd, { migas } from "@/components/ui/JsonLd";
import { preguntas } from "@/data/preguntas";

export const metadata: Metadata = {
  title: "Preguntas frecuentes · horario, pagos y bonos",
  description:
    "Horario de 720 GYM CLUB en Ourense, clase de prueba gratis, entrada diaria a 5 €, pagos del 1 al 7, bonos que no caducan y recuperación de clases de Pilates.",
  alternates: { canonical: "/preguntas" },
};

export default function PaginaPreguntas() {
  return (
    <>
      <JsonLd
        datos={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: preguntas.map((q) => ({ "@type": "Question", name: q.p, acceptedAnswer: { "@type": "Answer", text: q.r } })),
        }}
      />
      <JsonLd datos={migas([["Preguntas frecuentes", "/preguntas"]])} />
      <Preguntas pagina />
      <Cierre />
      <Contacto />
    </>
  );
}
