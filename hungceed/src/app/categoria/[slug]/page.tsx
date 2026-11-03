import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Catalogo from "@/components/tienda/Catalogo";
import { CATEGORIAS, SERIES, categoriaPorSlug, productosDe, type Serie } from "@/data/catalogo";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return CATEGORIAS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = categoriaPorSlug((await params).slug);
  return { title: c?.nombre ?? "Categoría" };
}

export default async function PaginaCategoria({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ [k: string]: string | string[] | undefined }> }) {
  const { slug } = await params;
  const categoria = categoriaPorSlug(slug);
  if (!categoria) notFound();
  const sp = await searchParams;
  const serie = typeof sp.serie === "string" && sp.serie in SERIES ? (sp.serie as Serie) : undefined;

  return (
    <>
      <section className="border-b border-linea bg-white pt-[var(--header-h)] text-negro">
        <div className="container-page py-12 sm:py-16">
          <nav aria-label="Estás aquí" className="text-[12px] text-gris">
            <Link href="/" className="hover:text-negro">
              Inicio
            </Link>{" "}
            / <span className="text-negro">{categoria.nombre}</span>
          </nav>
          <h1 className="titular mt-4 text-4xl sm:text-6xl">{categoria.nombre}</h1>
          <p className="mt-4 max-w-2xl text-gris">{categoria.descripcion}</p>
        </div>
        {/* Saltar entre categorías sin volver al menú. */}
        <div className="border-t border-linea">
          <ul className="container-page no-scrollbar flex gap-6 overflow-x-auto">
            {CATEGORIAS.map((c) => (
              <li key={c.slug} className="shrink-0">
                <Link
                  href={`/categoria/${c.slug}`}
                  aria-current={c.slug === slug ? "page" : undefined}
                  className={cn(
                    "inline-flex h-12 items-center border-b-[3px] text-[12px] font-semibold tracking-[0.12em] uppercase transition-colors",
                    c.slug === slug ? "border-negro text-negro" : "border-transparent text-gris hover:text-negro",
                  )}
                >
                  {c.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-10 sm:py-14">
        <Catalogo key={serie ?? "todas"} productos={productosDe(categoria.slug)} serieInicial={serie} />
      </section>
    </>
  );
}
