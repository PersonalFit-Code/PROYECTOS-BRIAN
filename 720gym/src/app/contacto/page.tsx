import type { Metadata } from "next";
import Contacto from "@/components/secciones/Contacto";
import CintaLogos from "@/components/ui/CintaLogos";
import JsonLd, { migas } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  title: "Contacto y cómo llegar",
  description: "720 GYM CLUB en Calle Río Bibei 16, Ourense. Abierto todos los días de 08:00 a 22:30. Teléfono, WhatsApp, email, mapa, autobús y aparcamiento fácil en la zona.",
  alternates: { canonical: "/contacto" },
};

export default function PaginaContacto() {
  return (
    <>
      <JsonLd datos={migas([["Contacto", "/contacto"]])} />
      <Contacto pagina />
      <CintaLogos />
    </>
  );
}
