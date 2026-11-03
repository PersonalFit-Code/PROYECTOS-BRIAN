import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, MessageCircle, ShoppingBag } from "lucide-react";
import Boton from "@/components/ui/Boton";
import Foto from "@/components/ui/Foto";
import Garantias from "@/components/tienda/Garantias";
import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import { PRODUCTOS, SERIES, categoriaPorSlug, precioTexto, productoPorSlug, productosDe } from "@/data/catalogo";

export function generateStaticParams() {
  return PRODUCTOS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = productoPorSlug((await params).slug);
  return { title: p?.nombre ?? "Producto" };
}

export default async function PaginaProducto({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const producto = productoPorSlug(slug);
  if (!producto) notFound();
  const categoria = categoriaPorSlug(producto.categoria)!;
  const relacionados = productosDe(producto.categoria)
    .filter((p) => p.slug !== producto.slug)
    .slice(0, 4);
  const wa = `https://wa.me/34621221820?text=${encodeURIComponent(`Hola, tengo una consulta sobre: ${producto.nombre}`)}`;

  return (
    <>
      <div className="pt-[var(--header-h)]">
        <nav aria-label="Estás aquí" className="container-page pt-6 text-[12px] text-gris">
          <Link href="/" className="hover:text-negro">
            Inicio
          </Link>{" "}
          /{" "}
          <Link href={`/categoria/${categoria.slug}`} className="hover:text-negro">
            {categoria.nombre}
          </Link>{" "}
          / <span className="text-negro">{producto.nombre}</span>
        </nav>

        <section className="container-page grid gap-10 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-12">
          <div className="relative aspect-square overflow-hidden bg-hueso">
            <Foto src={producto.imagen} alt={producto.nombre} prioridad contener className="p-8" />
            {producto.serie ? <span className="absolute top-4 left-4 bg-negro px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] text-white uppercase">{SERIES[producto.serie].nombre}</span> : null}
          </div>

          <div className="lg:pt-4">
            <p className="etiqueta text-rojo">{producto.serie ? SERIES[producto.serie].nombre : categoria.nombre}</p>
            <h1 className="titular mt-3 text-4xl sm:text-5xl">{producto.nombre}</h1>
            <p className="mt-5 text-lg leading-relaxed text-gris">{producto.resumen}</p>

            <p className="mt-8 text-3xl font-extrabold">{precioTexto(producto.precio)}</p>
            {producto.precio ? (
              <p className="mt-1 text-[13px] text-gris">Envío en 48–72 h · Garantía de 30 días</p>
            ) : (
              <p className="mt-1 text-[13px] text-gris">Escríbenos y te pasamos precio y plazo de entrega.</p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {producto.precio ? (
                <Boton href={producto.original} target="_blank" size="lg" icon={<ShoppingBag aria-hidden />}>
                  Comprar
                </Boton>
              ) : null}
              <Boton href={wa} target="_blank" variant={producto.precio ? "secundario" : "primario"} size="lg" icon={<MessageCircle aria-hidden />}>
                {producto.precio ? "Preguntar" : "Pedir precio por WhatsApp"}
              </Boton>
            </div>

            <ul className="mt-8 space-y-2.5 border-t border-linea pt-6 text-[14px]">
              {["Compatible con todo el sistema Hungceed", "Soporte técnico antes y después de la compra", "Tarjeta, PayPal, Apple Pay y Google Pay"].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-rojo" /> {t}
                </li>
              ))}
            </ul>

            {/* Nota de la maqueta: el arreglo del nombre, para enseñárselo a Jose. */}
            <aside className="mt-10 border border-dashed border-gris-claro bg-hueso p-5 text-[13px] leading-relaxed text-gris">
              <p className="font-bold tracking-[0.1em] text-negro uppercase">Nota de la maqueta</p>
              <p className="mt-2">
                Hoy el producto se llama: <span className="text-negro">«{producto.nombreSeo}»</span>. En la web nueva el nombre es corto y ese texto pasa al campo de SEO, donde Google lo sigue leyendo.
              </p>
              <a href={producto.original} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 font-semibold text-rojo underline underline-offset-4">
                Ver la ficha actual <ArrowUpRight aria-hidden className="size-3.5" />
              </a>
            </aside>
          </div>
        </section>
      </div>

      <section aria-label="Envíos y garantías" className="border-y border-linea">
        <div className="container-page py-2">
          <Garantias />
        </div>
      </section>

      {relacionados.length > 0 ? (
        <section className="container-page py-16 sm:py-20">
          <h2 className="subtitular text-2xl sm:text-3xl">También en {categoria.nombre.toLowerCase()}</h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {relacionados.map((p) => (
              <li key={p.slug} className="flex">
                <TarjetaProducto producto={p} className="w-full" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
