import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { negocio } from "@/data/negocio";

/**
 * Textos legales PENDIENTES de los datos del titular (razón social, NIF y responsable). Estructura
 * lista; no se publica la web definitiva hasta completarlos.
 */
const paginas: Record<string, { titulo: string; bloques: { h: string; p: string }[] }> = {
  "aviso-legal": {
    titulo: "Aviso legal",
    bloques: [
      { h: "Titular del sitio web", p: `Razón social: [pendiente]. NIF: [pendiente]. Domicilio: ${negocio.direccion.completa}. Email: ${negocio.email}.` },
      { h: "Objeto", p: "Este sitio informa sobre los servicios de 720 GYM CLUB y permite solicitar inscripciones, entradas diarias y clases de prueba." },
      { h: "Propiedad intelectual", p: "Los textos, fotografías, logotipos y marcas (720 GYM, 720 PILATES, 720 YOGA, CROSSGYM 720, 720 POWERLIFTING y 720P) pertenecen a su titular o se usan con su permiso." },
      { h: "Responsabilidad", p: "Los precios y horarios pueden cambiar. Ante cualquier duda, prevalece la información facilitada en el propio centro." },
    ],
  },
  privacidad: {
    titulo: "Política de privacidad",
    bloques: [
      { h: "Responsable", p: `[Razón social pendiente], ${negocio.direccion.completa}. Contacto: ${negocio.email}.` },
      { h: "Qué datos tratamos", p: "Los que nos facilitas en el formulario: nombre, teléfono, email opcional, actividad, plan, día y comentarios." },
      { h: "Para qué", p: "Para gestionar tu solicitud de inscripción, entrada diaria o clase de prueba y contactarte por WhatsApp, teléfono o email." },
      { h: "Legitimación", p: "Tu consentimiento al enviar el formulario y la aplicación de medidas precontractuales a petición tuya." },
      { h: "Conservación", p: "Mientras dure la relación o hasta que pidas su supresión, y después durante los plazos legales." },
      { h: "Destinatarios", p: "No se ceden datos a terceros salvo obligación legal. El aviso puede enviarse a través de WhatsApp (Meta) y de la plataforma de alojamiento de la web." },
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
        <h1 className="titular mt-4 text-[clamp(2.1rem,3.6vw,3.1rem)]">{p.titulo}</h1>
        <p className="mt-6 border-l-4 border-acento bg-white px-4 py-3 text-[14px] text-negro/70">
          Texto pendiente de completar con los datos del titular (razón social y NIF).
        </p>
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
