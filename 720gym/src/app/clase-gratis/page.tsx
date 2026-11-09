import type { Metadata } from "next";
import Apuntate from "@/components/secciones/Apuntate";
import JsonLd, { migas } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  title: "Clase de prueba gratis e inscripción",
  description: "Pide tu clase de prueba gratis en 720 GYM CLUB (Ourense), inscríbete o saca la entrada diaria de 5 €. Eliges día y hora y te confirmamos por WhatsApp. Sin compromiso.",
  alternates: { canonical: "/clase-gratis" },
};

export default function PaginaClaseGratis() {
  return (
    <>
      <JsonLd datos={migas([["Clase gratis", "/clase-gratis"]])} />
      <Apuntate pagina />
    </>
  );
}
