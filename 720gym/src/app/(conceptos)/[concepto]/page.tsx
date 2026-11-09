import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import Ondas from "@/components/ui/Ondas";
import Collage from "@/components/ui/Collage";
import { claseBoton } from "@/components/ui/Boton";
import Horario from "@/components/secciones/Horario";
import Apuntate from "@/components/secciones/Apuntate";
import Conceptos from "@/components/secciones/Conceptos";
import Normas from "@/components/ui/Normas";
import CintaLogos from "@/components/ui/CintaLogos";
import Cierre from "@/components/secciones/Cierre";
import JsonLd, { migas } from "@/components/ui/JsonLd";
import { conceptoPorSlug, conceptos } from "@/data/conceptos";
import { wa } from "@/data/negocio";

/**
 * Página de cada concepto, en su propia dirección corta (/gimnasio, /crossgym…). 720 Pilates tiene
 * la suya en /pilates, con su paleta. Con dominio propio, proxy.ts sirve también crossgym.dominio, etc.
 */
export function generateStaticParams() {
  return conceptos.filter((c) => c.slug !== "pilates").map((c) => ({ concepto: c.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ concepto: string }> }): Promise<Metadata> {
  const c = conceptoPorSlug((await params).concepto);
  if (!c) return {};
  return { title: c.seo.titulo, description: c.seo.descripcion, alternates: { canonical: c.href } };
}

export default async function PaginaConcepto({ params }: { params: Promise<{ concepto: string }> }) {
  const c = conceptoPorSlug((await params).concepto);
  if (!c || c.slug === "pilates") notFound();
  const conPrecio = c.precio;
  const base = c.href;
  const prueba = `${base}?tipo=prueba&actividad=${c.actividad}#apuntate`;

  return (
    <>
      <JsonLd datos={migas([[c.nombre, c.href]])} />
      <section className="relative overflow-hidden bg-negro pt-[calc(var(--header-h)+3rem)] pb-20 sm:pb-28" aria-labelledby="titulo-concepto">
        <Ondas lineas={10} color="rgb(255 255 255 / 0.06)" />
        <div className="container-page relative grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-6">
            <nav aria-label="Migas" className="hero-in etiqueta text-white/45" style={{ ["--i" as string]: 0 }}>
              <Link href="/" className="hover:text-white">Inicio</Link> / <Link href="/#que-buscas" className="hover:text-white">Conceptos</Link>
            </nav>
            <p className="hero-in etiqueta mt-10 text-acento" style={{ ["--i" as string]: 1 }}>
              {c.marca}
            </p>
            <h1 id="titulo-concepto" className="hero-in titular mt-4 text-[clamp(2.1rem,3.6vw,3.1rem)] [overflow-wrap:anywhere] lg:text-[clamp(2.1rem,3.6vw,3.1rem)]" style={{ ["--i" as string]: 2 }}>
              {c.nombre}
              <span className="sr-only"> en Ourense</span>
            </h1>
            <p className="hero-in mt-6 max-w-lg text-[18px] leading-relaxed text-white/70" style={{ ["--i" as string]: 3 }}>
              {c.lineas}
            </p>
            <div className="hero-in mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style={{ ["--i" as string]: 4 }}>
              <Link href={c.planPago ? `/alta?plan=${c.planPago}` : `${base}?tipo=inscripcion&actividad=${c.actividad}#apuntate`} className={claseBoton("venta", true)}>
                Inscríbete
              </Link>
              <Link href={prueba} className={claseBoton("contorno", true)}>
                Clase gratis
              </Link>
              <a href={wa(`Hola, quiero información de ${c.nombre} en 720 GYM CLUB.`)} target="_blank" rel="noopener noreferrer" className={claseBoton("contorno", true)}>
                Información
              </a>
            </div>
          </div>
          <div className="lg:col-span-6">
            <Collage fotos={[{ descripcion: c.fotoDescripcion, src: c.foto }, c.extras?.[0] ?? { descripcion: c.fotosExtra[0] }, c.extras?.[1] ?? { descripcion: c.fotosExtra[1] }]} />
          </div>
        </div>

        <div className="container-page relative mt-16">
        <dl className="grid gap-px bg-white/10 sm:grid-cols-3">
          <div className="bg-negro py-6 pr-6">
            <dt className="etiqueta text-white/45">Para quién</dt>
            <dd className="mt-3 text-[16px] leading-relaxed text-white/85">{c.paraQuien}</dd>
          </div>
          <div className="bg-negro py-6 sm:px-6">
            <dt className="etiqueta text-white/45">Nivel</dt>
            <dd className="subtitular mt-3 text-[28px]">{c.nivel}</dd>
          </div>
          <div className="bg-negro py-6 sm:px-6">
            <dt className="etiqueta text-white/45">Precio</dt>
            <dd className="mt-3">
              {conPrecio ? (
                <span className="flex items-baseline gap-1.5">
                  {conPrecio.desde && <span className="text-[14px] text-white/60">desde</span>}
                  <span className="titular text-[40px] leading-none text-acento">{conPrecio.cifra}</span>
                  <span className="text-[15px] font-semibold text-white/70">{conPrecio.unidad}</span>
                </span>
              ) : (
                <span className="text-[16px] text-white/70">Pendiente de publicar. Pregúntanos sin compromiso.</span>
              )}
            </dd>
          </div>
        </dl>
        </div>
      </section>

      <section className="bg-pared py-24 text-negro sm:py-32" aria-labelledby="titulo-detalle">
        <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p data-reveal className="etiqueta text-negro/50">En 720</p>
            <h2 id="titulo-detalle" data-reveal className="titular mt-5 text-[clamp(2.1rem,3.6vw,3.1rem)]">
              Cómo es
            </h2>
            <div data-reveal className="mt-8 max-w-2xl space-y-5 text-[18px] leading-relaxed text-negro/75">
              {c.descripcion.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <div data-reveal className="bg-negro p-8 text-white">
              <p className="etiqueta text-white/50">Incluye</p>
              <ul className="mt-6 space-y-4">
                {c.incluye.map((x) => (
                  <li key={x} className="flex gap-3 text-[16px]">
                    <Check className="mt-0.5 size-5 shrink-0 text-acento" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
              <Link href={c.planPago ? `/alta?plan=${c.planPago}` : `${base}?tipo=inscripcion&actividad=${c.actividad}#apuntate`} className={`${claseBoton("venta")} mt-10 w-full`}>
                Inscríbete
              </Link>
              <Link href="/tarifas" className="mt-4 block text-center text-[13px] text-white/60 underline underline-offset-4 hover:text-white">
                Ver todas las tarifas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {c.clases.length > 0 && <Horario soloClases={c.clases} titulo={`Horario de ${c.nombre.replace(/^720 /, "")}`} />}

      <section className="bg-white" aria-label="Lema">
        <Normas className="py-12" />
      </section>

      <Cierre />
      <Apuntate actividadInicial={c.actividad} orden={null} />
      <Conceptos excluir={c.slug} />
      <CintaLogos />
    </>
  );
}
