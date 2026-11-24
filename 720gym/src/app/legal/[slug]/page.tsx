import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { negocio } from "@/data/negocio";

/**
 * Textos legales con los datos del titular que pasó Brais (24/11/2026). El domicilio social va
 * escrito como en sus datos fiscales («Río Bibey»), aunque en el resto de la web se use «Río Bibei».
 */
const titular = { razon: "720GYM CLUB SL", nif: "B24758161", domicilio: "Calle Río Bibey 16, bajo, 32001 Ourense" };
const paginas: Record<string, { titulo: string; bloques: { h: string; p: string }[] }> = {
  "aviso-legal": {
    titulo: "Aviso legal",
    bloques: [
      { h: "Titular del sitio web", p: `Razón social: ${titular.razon}. NIF: ${titular.nif}. Domicilio: ${titular.domicilio}. Email: ${negocio.email}. Teléfono: ${negocio.telefonoVisible}.` },
      { h: "Objeto", p: "Este sitio informa sobre los servicios y actividades de 720 GYM CLUB y facilita el contacto con el centro y con los clubes que entrenan en él, principalmente por WhatsApp." },
      { h: "Propiedad intelectual", p: "Los textos, fotografías, logotipos y marcas (720 GYM, 720 PILATES, 720 YOGA, CROSSGYM 720, 720 POWERLIFTING y 720P) pertenecen a su titular o se usan con su permiso." },
      { h: "Responsabilidad", p: "Los precios y horarios pueden cambiar. Ante cualquier duda, prevalece la información facilitada en el propio centro." },
    ],
  },
  privacidad: {
    titulo: "Política de privacidad",
    bloques: [
      { h: "Responsable", p: `${titular.razon}, NIF ${titular.nif}, ${titular.domicilio}. Contacto: ${negocio.email}.` },
      { h: "Qué datos tratamos", p: "Los que nos facilitas al escribirnos por WhatsApp, teléfono o email: tu nombre, tu número o dirección de contacto y lo que nos cuentes sobre la actividad que te interesa. La web no tiene formularios ni registro de usuarios." },
      { h: "Para qué", p: "Para responder a tu consulta, orientarte sobre las actividades y concertar una visita o una primera clase." },
      { h: "Legitimación", p: "Tu consentimiento al escribirnos y la aplicación de medidas precontractuales a petición tuya." },
      { h: "Conservación", p: "Mientras dure la relación o hasta que pidas su supresión, y después durante los plazos legales." },
      { h: "Destinatarios", p: "No se ceden datos a terceros salvo obligación legal. Las conversaciones se mantienen a través de WhatsApp (Meta). Si escribes a un club asociado desde su ficha, el mensaje llega directamente a ese club, que es responsable de sus propios datos." },
      { h: "Tus derechos", p: `Puedes ejercer acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a ${negocio.email}. También puedes reclamar ante la AEPD (aepd.es).` },
    ],
  },
  cookies: {
    titulo: "Política de cookies",
    bloques: [
      { h: "Qué usamos", p: "Esta web no usa cookies publicitarias ni de analítica. Solo guarda en tu navegador una preferencia técnica de visualización." },
      { h: "Contenido de terceros", p: "El mapa de Google Maps de la sección de contacto puede instalar sus propias cookies al cargarse. Consulta la política de Google." },
      { h: "Cómo desactivarlas", p: "Puedes borrar o bloquear las cookies desde la configuración de tu navegador." },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(paginas).map((slug) => ({ slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = paginas[(await params).slug];
  return p ? { title: p.titulo, description: `${p.titulo} de 720 GYM CLUB, gimnasio en Calle Río Bibei 16, Ourense.`, robots: { index: false } } : {};
}

export default async function PaginaLegal({ params }: { params: Promise<{ slug: string }> }) {
  const p = paginas[(await params).slug];
  if (!p) notFound();
  return (
    <section className="bg-pared pt-[calc(var(--header-h)+4rem)] pb-24 text-negro">
      <div className="container-page max-w-3xl">
        <p className="etiqueta text-negro/50">Legal</p>
        <h1 className="titular mt-4 text-titulo-2">{p.titulo}</h1>
        <div className="mt-10 space-y-8">
          {p.bloques.map((b) => (
            <div key={b.h}>
              <h2 className="subtitular text-[26px]">{b.h}</h2>
              <p className="mt-2 text-[16px] leading-relaxed text-negro/75">{b.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
