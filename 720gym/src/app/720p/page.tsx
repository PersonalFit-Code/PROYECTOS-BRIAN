import type { Metadata } from "next";
import Profesionales from "@/components/secciones/Profesionales";
import JsonLd, { migas } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  title: "720P: alquiler de espacios para profesionales en Ourense",
  description: "720P, el espacio para profesionales de 720 GYM CLUB en Ourense: alquila una sala o el centro para tus clases, cursos, talleres, seminarios o eventos.",
  alternates: { canonical: "/720p" },
};

export default function Pagina720P() {
  return (
    <>
      <JsonLd datos={migas([["720P · Espacios para profesionales", "/720p"]])} />
      <Profesionales />
    </>
  );
}
