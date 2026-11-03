import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Boton from "@/components/ui/Boton";
import Foto from "@/components/ui/Foto";
import Revelar from "@/components/ui/Revelar";
import Garantias from "@/components/tienda/Garantias";
import Carrusel from "@/components/tienda/Carrusel";
import Marquesina from "@/components/tienda/Marquesina";
import Opiniones from "@/components/tienda/Opiniones";
import {
  CATEGORIAS,
  PRODUCTOS,
  SERIES,
  precioTexto,
  productoPorSlug,
  type Serie,
} from "@/data/catalogo";
import { GYM, TARIFAS } from "@/data/gym";
import { CONFIANZA, NEGOCIO, VENTAJAS } from "@/data/negocio";

const EUR = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/**
 * Portada al estilo de las referencias de Jose (Gymshark, Breathe Divinity): blanco, negro y grises.
 * Foto a sangre con el titular abajo a la izquierda y dos botones rectos; carruseles de producto
 * sobre gris claro; categorías en rejilla con el nombre debajo; segunda foto a sangre para el gym.
 */
export default function Portada() {
  const rack = productoPorSlug("jaula-potencia-polea")!;
  /* Solo productos con precio publicado: el bloque que vende no puede decir «consultar». */
  const destacados = PRODUCTOS.filter((p) => p.precio)
    .sort((a, b) => Number(!!b.destacado) - Number(!!a.destacado))
    .slice(0, 10);
  const accesorios = PRODUCTOS.filter((p) => p.serie === "attachment");
  const ordenSeries: Serie[] = ["elite", "pro", "prelude", "attachment"];
  const enlaceSerie = (s: Serie) =>
    s === "attachment"
      ? "/categoria/attachment"
      : `/categoria/maquinas?serie=${s}`;
  const desde = (grupo: string) =>
    Math.min(
      ...TARIFAS.find((g) => g.id === grupo)!.tarifas.map((t) => t.precio),
    );
  const tarifasGym = [
    {
      titulo: "Musculación",
      precio: desde("musculacion"),
      unidad: "al mes",
      texto: "Acceso libre a la sala.",
    },
    {
      titulo: "Funcional",
      precio: desde("funcional"),
      unidad: "al mes",
      texto: "Clases en grupo, 4 o 12 sesiones.",
    },
    {
      titulo: "Entrenador personal",
      precio: desde("personal"),
      unidad: "la sesión",
      texto: "Sesiones 1:1 con plan propio.",
    },
  ];

  return (
    <>
      {/* 1 · Foto a sangre, titular abajo a la izquierda. */}
      <section className="relative isolate mt-[var(--header-h)] flex min-h-[78svh] items-end overflow-hidden text-white sm:min-h-[86svh]">
        <div className="absolute inset-0 -z-10">
          <Foto
            src={GYM.fotos.portada}
            alt=""
            prioridad
            className="grayscale-[35%] motion-safe:animate-[zoom-lento_12s_var(--ease-out-expo)_both]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-negro/80 via-negro/25 to-transparent" />
        </div>
        <div className="container-page pb-10 sm:pb-14">
          <h1
            className="hero-in titular text-[clamp(3rem,9vw,6.5rem)]"
            style={{ ["--i" as string]: 0 }}
          >
            Equipa tu gimnasio
          </h1>
          <p
            className="hero-in mt-3 max-w-md text-[14px] leading-relaxed text-white/85"
            style={{ ["--i" as string]: 1 }}
          >
            Racks, máquinas, pesas y accesorios que encajan entre sí. En casa o
            en el box.
          </p>
          <div
            className="hero-in mt-6 flex flex-wrap gap-2.5"
            style={{ ["--i" as string]: 2 }}
          >
            <Boton href="#mas-elegido" variant="claro" size="sm">
              Ver el catálogo
            </Boton>
            <Boton
              href={NEGOCIO.whatsapp}
              target="_blank"
              variant="contorno"
              size="sm"
            >
              Te asesoramos
            </Boton>
          </div>
        </div>
      </section>

      {/* 2 · El gimnasio, justo debajo de la portada: tarifas a la vista y «Apúntate» directo a Virtuagym. */}
      <section aria-labelledby="gym-titulo" className="border-b border-linea">
        <Revelar className="container-page grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-14">
          <div
            data-reveal
            className="relative aspect-[4/3] overflow-hidden bg-hueso sm:aspect-[16/10] lg:aspect-[4/5]"
          >
            <Foto
              src={GYM.fotos.secundaria}
              alt="Entrenando en Hungceed GYM"
              className="object-[50%_30%] grayscale-[35%]"
            />
            <span className="absolute bottom-3 left-3 bg-white px-2 py-1 text-[11px] font-medium text-negro">
              {GYM.localidad}
            </span>
          </div>
          <div>
            <p data-reveal className="text-[12px] font-medium text-gris">
              {GYM.nombre}
            </p>
            <h2
              id="gym-titulo"
              data-reveal
              className="titular mt-2 text-[clamp(2.8rem,7vw,5rem)]"
            >
              Entrena con nosotros
            </h2>
            <p
              data-reveal
              className="mt-4 max-w-lg text-[14px] leading-relaxed text-gris"
            >
              Musculación, funcional y entrenador personal, en la misma sala
              donde probamos nuestro equipamiento. Te das de alta online en un
              minuto.
            </p>
            <ul className="mt-8 grid gap-1.5 sm:grid-cols-3">
              {tarifasGym.map((t) => (
                <li
                  key={t.titulo}
                  data-reveal
                  className="flex flex-col bg-hueso p-5"
                >
                  <p className="text-[12px] font-medium text-gris">
                    {t.titulo}
                  </p>
                  <p className="mt-2 text-[12px] text-gris">Desde</p>
                  <p className="titular text-[42px]">{EUR.format(t.precio)}</p>
                  <p className="text-[12px] text-gris">{t.unidad}</p>
                  <a
                    href={GYM.virtuagym}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-11 items-center justify-center bg-negro text-[12px] font-semibold tracking-[0.14em] text-white uppercase transition-colors hover:bg-carbon"
                  >
                    Apúntate
                    <span className="sr-only">
                      {" "}
                      a {t.titulo} (abre Virtuagym)
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <div data-reveal className="mt-6">
              <Link
                href="/gym"
                className="text-[13px] font-medium underline underline-offset-4 hover:text-gris"
              >
                Todas las tarifas y bonos
              </Link>
            </div>
          </div>
        </Revelar>
      </section>

      {/* 3 · Lo más elegido, en carrusel. */}
      <div id="mas-elegido" className="scroll-mt-[var(--header-h)]">
        <Carrusel
          titulo="Lo más elegido"
          verTodo="/categoria/racks"
          productos={destacados}
        />
      </div>

      {/* 3 · Banda a sangre en gris: el rack que es el centro del sistema. */}
      <section className="bg-hueso">
        <div className="container-page grid items-center gap-6 py-12 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <div className="order-2 lg:order-1">
            <p className="text-[12px] font-medium text-gris">
              {SERIES.attachment.nombre}
            </p>
            <h2 className="titular mt-2 text-[clamp(2.6rem,6vw,4.75rem)]">
              Un rack.
              <br />
              Un gimnasio completo.
            </h2>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-gris">
              Empieza con la {rack.nombre.toLowerCase()} (
              {precioTexto(rack.precio)}) y añade cada accesorio cuando lo
              necesites. Todo encaja en los mismos agujeros, sin herramientas.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Boton href={`/producto/${rack.slug}`} size="sm">
                Ver la jaula
              </Boton>
              <Boton
                href="/categoria/attachment"
                variant="secundario"
                size="sm"
              >
                Ver accesorios
              </Boton>
            </div>
          </div>
          <Link
            href={`/producto/${rack.slug}`}
            className="group order-1 block aspect-[4/3] lg:order-2"
          >
            <Foto
              src={rack.imagen}
              alt={rack.nombre}
              contener
              className="mix-blend-multiply transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
            />
          </Link>
        </div>
      </section>

      {/* 4 · Los accesorios, en carrusel. */}
      <Carrusel
        titulo={SERIES.attachment.nombre}
        verTodo="/categoria/attachment"
        productos={accesorios}
      />

      <Marquesina />

      {/* 5 · Categorías: rejilla de fotos con el nombre debajo (como «Popular right now»). */}
      <Revelar
        as="section"
        id="categorias"
        className="container-page scroll-mt-[var(--header-h)] py-12 sm:py-16"
      >
        <div
          data-reveal
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <h2 className="titular text-[28px] sm:text-[34px]">
            ¿Qué estás montando?
          </h2>
          <div className="flex gap-1.5">
            <Link
              href="/categoria/racks"
              className="inline-flex h-8 items-center border border-negro px-3 text-[12px] font-medium"
            >
              Para tu casa
            </Link>
            <Link
              href="/equipa-tu-centro"
              className="inline-flex h-8 items-center border border-linea px-3 text-[12px] font-medium text-gris hover:border-negro hover:text-negro"
            >
              Para tu centro
            </Link>
          </div>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-1.5 lg:grid-cols-3">
          {CATEGORIAS.map((c) => (
            <li key={c.slug} data-reveal>
              <Link href={`/categoria/${c.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden bg-hueso">
                  <Foto
                    src={c.imagen}
                    alt=""
                    contener
                    className="p-6 mix-blend-multiply transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="mt-3 text-[13px] font-semibold group-hover:underline group-hover:underline-offset-2">
                  {c.nombre}
                </h3>
                <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-gris">
                  {c.descripcion}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Revelar>

      {/* 6 · Series, numeradas, sobre blanco. */}
      <section
        aria-labelledby="series-titulo"
        className="border-t border-linea"
      >
        <Revelar className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div data-reveal>
            <h2
              id="series-titulo"
              className="titular text-[clamp(2.4rem,5vw,3.75rem)]"
            >
              Cuatro series.
              <br />
              Un solo sistema.
            </h2>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-gris">
              Todo está diseñado para integrarse: la Attachment Series convierte
              cualquier rack Hungceed en un gimnasio completo.
            </p>
          </div>
          <ol className="border-t border-negro">
            {ordenSeries.map((s, i) => (
              <li key={s} data-reveal className="border-b border-linea">
                <Link
                  href={enlaceSerie(s)}
                  className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-5"
                >
                  <span className="text-[12px] font-medium text-gris">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="subtitular block text-[26px] sm:text-[30px]">
                      {SERIES[s].nombre}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-gris">
                      {SERIES[s].lema}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="size-5 text-gris transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-negro"
                    strokeWidth={1.5}
                  />
                </Link>
              </li>
            ))}
          </ol>
        </Revelar>
      </section>

      {/* 7 · La frase de Jose, como en su web actual: foto oscura a sangre, comillas, firma y nombre. */}
      <section
        aria-label="Palabras del CEO"
        className="relative isolate overflow-hidden text-white"
      >
        <div className="absolute inset-0 -z-10">
          <Foto
            src={GYM.fotos.portada}
            alt=""
            className="object-[50%_40%] grayscale"
          />
          <div className="absolute inset-0 bg-negro/75" />
        </div>
        <Revelar className="container-page py-20 text-center sm:py-28">
          <figure className="flex flex-col items-center">
            <span
              data-reveal
              aria-hidden
              className="titular text-[96px] leading-[0.6] text-white/90 sm:text-[120px]"
            >
              &rdquo;
            </span>
            <blockquote data-reveal className="mt-6 max-w-4xl">
              <p className="text-xl leading-snug font-semibold text-balance sm:text-3xl">
                «{NEGOCIO.fraseCeo}»
              </p>
            </blockquote>
            <figcaption data-reveal className="mt-8 flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={NEGOCIO.firmaCeo}
                alt="Firma de Jose P."
                loading="lazy"
                className="h-16 w-auto sm:h-20"
              />
              <span className="mt-4 text-[13px] font-medium text-white/85">
                {NEGOCIO.ceo}
              </span>
            </figcaption>
          </figure>
        </Revelar>
      </section>

      {/* 8 · Por qué Hungceed + confianza. */}
      <section className="bg-hueso">
        <Revelar className="container-page py-12 sm:py-16">
          <div className="grid gap-12 lg:grid-cols-2">
            <div data-reveal>
              <h2 className="titular text-[clamp(2.4rem,5vw,3.75rem)]">
                {NEGOCIO.lema}
              </h2>
            </div>
            <ul className="grid gap-1.5 self-start sm:grid-cols-2">
              {VENTAJAS.map((v, i) => (
                <li key={v.titulo} data-reveal className="bg-white p-6">
                  <span className="text-[12px] font-medium text-gris">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="subtitular mt-2 text-[22px]">{v.titulo}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-gris">
                    {v.texto}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Cifras a rellenar con los datos reales de Jose. */}
          <ul
            data-reveal
            className="mt-10 grid grid-cols-2 gap-1.5 lg:grid-cols-4"
          >
            {CONFIANZA.map((c) => (
              <li
                key={c.texto}
                className="relative bg-white p-5 pt-8 sm:p-6 sm:pt-9"
              >
                <p className="titular text-[42px]">{c.cifra}</p>
                <p className="mt-1 text-[12px] text-gris">{c.texto}</p>
                {c.pendiente ? (
                  <span className="absolute top-2 right-2 border border-linea px-1.5 py-0.5 text-[9px] font-medium text-gris uppercase">
                    Dato por confirmar
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </Revelar>
      </section>

      <Opiniones />

      {/* 9 · Garantías */}
      <section
        aria-label="Envíos y garantías"
        className="border-y border-linea"
      >
        <div className="container-page py-2">
          <Garantias />
        </div>
      </section>
    </>
  );
}
