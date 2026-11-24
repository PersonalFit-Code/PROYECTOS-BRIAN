import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, AtSign, CalendarClock, Camera, Coins, Plus, Quote, Users } from "lucide-react";
import IconoConcepto, { iconoDe } from "@/components/ui/IconoConcepto";
import IconoWhatsApp from "@/components/ui/IconoWhatsApp";
import JsonLd, { migas } from "@/components/ui/JsonLd";
import SelloConcepto from "@/components/ui/SelloConcepto";
import { conceptoPorSlug, conceptos, grupos, type Concepto, type Persona } from "@/data/conceptos";
import { negocio, wa } from "@/data/negocio";
import { cn } from "@/lib/utils";

/**
 * Ficha «Dentro de 720» de cada concepto, en su dirección corta (/gimnasio, /pilates, /capoeira…).
 * Sigue el boceto de Brais: qué es → modalidades → quién lo imparte → horarios → y, lo último, las
 * cuotas. Cada ficha lleva su color (--marca): puntos, iconos y detalles.
 */
export function generateStaticParams() {
  return conceptos.map((c) => ({ concepto: c.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ concepto: string }> }): Promise<Metadata> {
  const c = conceptoPorSlug((await params).concepto);
  if (!c) return {};
  return { title: c.seo.titulo, description: c.seo.descripcion, alternates: { canonical: c.href } };
}

const EXT = { target: "_blank", rel: "noopener noreferrer" } as const;

function Desplegable({ id, Icono, titulo, resumen, abierto, children }: { id: string; Icono: typeof Users; titulo: string; resumen?: string; abierto?: boolean; children: React.ReactNode }) {
  return (
    <details id={id} open={abierto} className="group scroll-mt-28 overflow-hidden rounded-3xl border border-negro/10 bg-white transition-colors hover:border-naranja open:shadow-[0_18px_50px_-30px_rgb(0_0_0/0.35)]">
      <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 sm:px-7 sm:py-5 [&::-webkit-details-marker]:hidden">
        <Icono className="size-7 shrink-0 text-marca" strokeWidth={1.6} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="subtitular block text-[19px] leading-tight sm:text-[22px]">{titulo}</span>
          {resumen && <span className="mt-0.5 block truncate text-[13px] text-negro/55">{resumen}</span>}
        </span>
        <Plus className="size-6 shrink-0 text-marca transition-transform duration-300 group-open:rotate-45" aria-hidden />
      </summary>
      <div className="border-t border-negro/10 px-5 py-6 sm:px-7 sm:py-8">{children}</div>
    </details>
  );
}

function FichaPersona({ p }: { p: Persona }) {
  const iniciales = p.nombre.split(" ").slice(0, 2).map((x) => x[0]).join("");
  return (
    <article className="grid gap-5 sm:grid-cols-[7.5rem_1fr] sm:gap-7">
      <div className="relative size-24 overflow-hidden rounded-2xl bg-niebla sm:size-[7.5rem]">
        {p.foto ? (
          <Image src={p.foto} alt={`Retrato de ${p.nombre}`} fill sizes="120px" className="object-cover" />
        ) : (
          <span className="titular grid size-full place-items-center text-[34px] text-negro/35" aria-hidden>
            {iniciales}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="text-[22px] leading-tight font-bold tracking-tight">
          {p.nombre}
          {p.apodo && <span className="ml-2 font-normal text-negro/50 italic">«{p.apodo}»</span>}
        </h3>
        <p className="mt-1 text-[14px] font-semibold text-negro/60">{p.rol}</p>
        {p.resumen && <p className="mt-4 text-[15px] leading-relaxed text-negro/80">{p.resumen}</p>}
        {p.bio?.map((t) => (
          <p key={t.slice(0, 24)} className="mt-4 text-[15px] leading-relaxed text-negro/75">
            {t}
          </p>
        ))}
        {p.bloques && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {p.bloques.map((b) => (
              <div key={b.titulo} className={cn("rounded-2xl bg-pared p-5", b.texto && "lg:col-span-2")}>
                <h4 className="subtitular text-[17px]">{b.titulo}</h4>
                {b.texto?.map((t) => (
                  <p key={t.slice(0, 24)} className="mt-3 text-[14.5px] leading-relaxed text-negro/75">
                    {t}
                  </p>
                ))}
                {b.lista && (
                  <ul className="mt-3 grid gap-1.5 text-[14.5px] text-negro/75">
                    {b.lista.map((x) => (
                      <li key={x} className="flex gap-2.5">
                        <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-marca" aria-hidden />
                        {x}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
        {p.sellos && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {p.sellos.map((x) => (
              <li key={x} className="rounded-full bg-pared px-3 py-1.5 text-[13px] font-semibold text-negro/75">
                {x}
              </li>
            ))}
          </ul>
        )}
        {p.cita && (
          <blockquote className="mt-6 flex gap-3 rounded-2xl border-l-4 border-marca bg-pared px-5 py-4 text-[15.5px] leading-relaxed font-semibold text-negro/85">
            <Quote className="mt-0.5 size-5 shrink-0 text-marca" aria-hidden />
            {p.cita}
          </blockquote>
        )}
      </div>
    </article>
  );
}

function Tarjetas({ c }: { c: Concepto }) {
  const b = c.bloque;
  return (
    <ul className={cn("mt-8 grid gap-3 sm:gap-4", b.tarjetas.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
      {b.tarjetas.map((t, i) => (
        <li key={t.titulo} data-reveal className="ficha-clara rounded-3xl border border-negro/10 bg-white p-6 sm:p-7">
          {b.pasos ? (
            <span className="titular grid size-11 place-items-center rounded-full bg-pared text-[22px]">{i + 1}</span>
          ) : iconoDe(t.titulo) ? (
            <span className="grid size-16 place-items-center rounded-2xl bg-pared">
              <IconoConcepto texto={t.titulo} className="size-10 text-marca" />
            </span>
          ) : (
            <span className="block h-1 w-10 rounded-full bg-marca" aria-hidden />
          )}
          <h3 className="subtitular mt-4 text-[21px] leading-tight">{t.titulo}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-negro/65">{t.texto}</p>
        </li>
      ))}
    </ul>
  );
}

export default async function PaginaConcepto({ params }: { params: Promise<{ concepto: string }> }) {
  const c = conceptoPorSlug((await params).concepto);
  if (!c) notFound();
  const numero = c.whatsapp ?? negocio.whatsapp;
  const color = { "--marca-base": c.color } as CSSProperties;
  const equipo = c.equipo;
  const nombres = equipo?.personas.map((p) => p.nombre).join(" · ");

  return (
    <div style={color}>
      <JsonLd datos={migas([[c.nombre, c.href]])} />

      {/* Qué es */}
      <section className="relative overflow-hidden bg-negro pt-[calc(var(--header-h)+2.5rem)] pb-14 sm:pb-20" aria-labelledby="titulo-ficha">
        <div className="container-page grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="lg:col-span-6">
            <p className="hero-in etiqueta text-white/60" style={{ ["--i" as string]: 0 }}>
              Dentro de 720 · {grupos[c.grupo].titulo}
            </p>
            <h1 id="titulo-ficha" className="hero-in titular mt-4 text-[clamp(2.8rem,7vw,5.2rem)] leading-[0.92]" style={{ ["--i" as string]: 1 }}>
              {c.titulo}
            </h1>
            {c.lema && (
              <p className="hero-in subtitular mt-3 text-[clamp(1.3rem,2.6vw,1.9rem)] leading-tight text-white/90" style={{ ["--i" as string]: 2 }}>
                {c.lema}
              </p>
            )}
            <p className="hero-in mt-5 max-w-xl text-[17px] leading-relaxed text-white/70" style={{ ["--i" as string]: 3 }}>
              {c.texto}
            </p>
            <ul className="hero-in mt-6 flex flex-wrap gap-2" style={{ ["--i" as string]: 4 }}>
              {c.chips.map((x) => (
                <li key={x} className="flex items-center gap-2 rounded-full bg-white/[0.07] px-4 py-2 text-[14px] font-semibold text-white/85 ring-1 ring-white/10">
                  {iconoDe(x) ? <IconoConcepto texto={x} className="size-[18px] text-white/70" /> : <span className="size-1.5 rounded-full bg-marca" aria-hidden />}
                  {x}
                </li>
              ))}
            </ul>
            <div className="hero-in mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style={{ ["--i" as string]: 5 }}>
              <a href={wa(c.conocer.mensaje, numero)} {...EXT} className="boton-venta sin-flecha subtitular inline-flex h-14 items-center justify-center gap-2.5 px-7 text-[16px]">
                <IconoWhatsApp className="size-5 text-marca" />
                {c.conocer.boton}
              </a>
              {c.horarios && (
                <a href="#horarios" className="boton-info subtitular inline-flex h-14 items-center justify-center px-7 text-[16px] text-white">
                  Ver horarios
                </a>
              )}
            </div>
            {c.club?.web && (
              <a href={c.club.web} {...EXT} className="hero-in group mt-5 flex w-fit items-center gap-2 text-[14.5px] font-semibold text-white/85 hover:text-white" style={{ ["--i" as string]: 6 }}>
                <ArrowRight className="size-4 text-white/55 group-hover:text-white" aria-hidden />
                Web de {c.club.nombre}: {c.club.web.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
              </a>
            )}
            {c.instagram && (
              <a href={`https://www.instagram.com/${c.instagram}/`} {...EXT} className={cn("hero-in group inline-flex items-center gap-2 text-[14.5px] font-semibold text-white/75 hover:text-white", c.club?.web ? "mt-2.5" : "mt-5")} style={{ ["--i" as string]: 6 }}>
                <AtSign className="size-4 text-white/55 group-hover:text-white" aria-hidden />
                Síguenos en Instagram: {c.instagram}
              </a>
            )}
          </div>
          <div className="lg:col-span-6">
            {c.foto ? (
              <div className="relative">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-suelo">
                  <Image src={c.foto} alt={`${c.titulo} en 720GYM CLUB`} fill priority sizes="(min-width:1024px) 46vw, 92vw" className="object-cover" />
                </div>
                <SelloConcepto logo={c.logo} nombre={c.nombre} className="absolute -bottom-5 left-5 size-24 rounded-3xl shadow-2xl sm:size-28" />
              </div>
            ) : (
              <div className="grid aspect-[4/3] place-items-center rounded-[2rem] bg-black ring-1 ring-white/10">
                <SelloConcepto logo={c.logo} nombre={c.nombre} className="aspect-square h-[82%] rounded-[2rem] ring-0" sizes="420px" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modalidades */}
      <section className="bg-pared py-16 text-negro sm:py-24" aria-labelledby="titulo-bloque">
        <div className="container-page">
          <p data-reveal className="etiqueta text-negro/50">
            {c.marca}
          </p>
          <h2 id="titulo-bloque" data-reveal className="titular mt-3 max-w-3xl text-titulo-2 leading-[0.98]">
            {c.bloque.titulo}
          </h2>
          {c.bloque.intro && (
            <p data-reveal className="mt-4 max-w-3xl text-[16.5px] leading-relaxed text-negro/65">
              {c.bloque.intro}
            </p>
          )}
          {c.bloque.tarjetas.length > 0 && <Tarjetas c={c} />}
          {c.bloque.nota && <p className="mt-5 text-[14.5px] text-negro/60">{c.bloque.nota}</p>}

          {c.destacados && (
            <ul className="mt-4 grid gap-3 sm:gap-4 md:grid-cols-2">
              {c.destacados.map((d) => (
                <li key={d.titulo} data-reveal className="rounded-3xl bg-negro p-6 text-white sm:p-7">
                  {iconoDe(d.titulo) ? (
                    <span className="grid size-12 place-items-center rounded-2xl bg-white/[0.08] ring-1 ring-white/10">
                      <IconoConcepto texto={d.titulo} className="size-6 text-white" />
                    </span>
                  ) : (
                    <span className="block h-1 w-10 rounded-full bg-marca" aria-hidden />
                  )}
                  <h3 className="subtitular mt-4 text-[21px]">{d.titulo}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/70">{d.texto}</p>
                </li>
              ))}
            </ul>
          )}

          {c.niveles && (
            <div className="mt-12">
              <h3 data-reveal className="titular text-[clamp(1.5rem,2.6vw,2.1rem)]">
                {c.niveles.titulo}
              </h3>
              <p className="mt-2 max-w-3xl text-[15.5px] text-negro/65">{c.niveles.intro}</p>
              <ul className="mt-6 grid gap-3 md:grid-cols-2">
                {c.niveles.items.map((n) => (
                  <li key={n.titulo} data-reveal className="ficha-clara flex gap-4 rounded-3xl border border-negro/10 bg-white p-5 sm:p-6">
                    {iconoDe(n.titulo) ? (
                      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-pared">
                        <IconoConcepto texto={n.titulo} className="size-7 text-marca" />
                      </span>
                    ) : (
                      <span className="mt-1 w-1 shrink-0 rounded-full bg-marca" aria-hidden />
                    )}
                    <span>
                      <span className="subtitular block text-[18px] leading-tight">{n.titulo}</span>
                      <span className="mt-1.5 block text-[14.5px] leading-relaxed text-negro/65">{n.texto}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {c.club && (
            <div data-reveal className="ficha-clara mt-6 flex items-center gap-5 rounded-3xl border border-negro/10 bg-white p-5 sm:p-6">
              <SelloConcepto logo={c.logo} nombre={c.club.nombre} className="size-16 rounded-full sm:size-20" />
              <div>
                <p className="subtitular text-[20px] leading-tight sm:text-[23px]">{c.club.nombre}</p>
                <p className="mt-1 text-[14.5px] text-negro/65">{c.club.texto}</p>
                {c.club.web && (
                  <a href={c.club.web} {...EXT} className="group mt-2 inline-flex items-center gap-1.5 text-[14px] font-bold underline decoration-marca decoration-2 underline-offset-4">
                    Visitar la web del club <ArrowRight className="size-4 text-marca transition-transform group-hover:translate-x-1" aria-hidden />
                  </a>
                )}
                {c.instagram && (
                  <a href={`https://www.instagram.com/${c.instagram}/`} {...EXT} className="group mt-2 flex items-center gap-1.5 text-[14px] font-bold underline decoration-marca decoration-2 underline-offset-4">
                    Instagram del club: @{c.instagram} <ArrowRight className="size-4 text-marca transition-transform group-hover:translate-x-1" aria-hidden />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Por dentro */}
      {c.galeria && c.galeria.length > 1 && (
        <section className="bg-negro py-14 sm:py-20" aria-labelledby="titulo-dentro">
          <div className="container-page flex items-center gap-3">
            <Camera className="size-6 text-marca" strokeWidth={1.6} aria-hidden />
            <h2 id="titulo-dentro" className="subtitular text-[22px] sm:text-[26px]">
              {c.nombre} por dentro
            </h2>
          </div>
          <ul className="no-scrollbar mt-7 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 sm:px-6 lg:container-page lg:gap-4">
            {c.galeria.map((f) => (
              <li
                key={f.src}
                className={`relative h-64 shrink-0 snap-start overflow-hidden rounded-3xl bg-suelo sm:h-80 ${f.vertical ? "w-48 sm:w-60" : "w-[78vw] sm:w-[44vw] lg:w-[28rem]"}`}
              >
                <Image src={f.src} alt={f.alt} fill sizes={f.vertical ? "15rem" : "(min-width:1024px) 28rem, 78vw"} className="object-cover" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Quién, cuándo y, lo último, cuánto */}
      {(equipo || c.horarios || c.cuotas) && (
        <section className="bg-pared py-16 text-negro sm:py-24" aria-label="Profesionales, horarios y cuotas">
          <div className="container-page grid max-w-5xl gap-3 sm:gap-4">
            {equipo && (
              <Desplegable id="equipo" Icono={Users} titulo={equipo.titulo} resumen={nombres} abierto>
                <div className="grid gap-10">
                  {equipo.personas.map((p) => (
                    <FichaPersona key={p.nombre} p={p} />
                  ))}
                </div>
              </Desplegable>
            )}
            {c.horarios && (
              <Desplegable id="horarios" Icono={CalendarClock} titulo="Consultar horarios y disponibilidad" resumen={c.horarios.titulo}>
                <h3 className="titular text-[26px]">{c.horarios.titulo}</h3>
                <div className={cn("mt-5 grid gap-3", c.horarios.grupos.length > 1 && "md:grid-cols-2")}>
                  {c.horarios.grupos.map((g, i) => (
                    <div key={g.titulo ?? i} className="rounded-2xl bg-pared p-5">
                      {g.titulo && <p className="subtitular text-[17px]">{g.titulo}</p>}
                      <ul className={cn("grid gap-2 text-[15px] text-negro/80", g.titulo && "mt-3")}>
                        {g.lineas.map((l) => (
                          <li key={l} className="flex gap-2.5">
                            <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-marca" aria-hidden />
                            {l}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {c.horarios.destacado && (
                  <div className="mt-3 rounded-2xl p-5" style={{ background: "color-mix(in srgb, var(--marca) 14%, white)" }}>
                    <p className="subtitular text-[17px]">{c.horarios.destacado.titulo}</p>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-negro/75">{c.horarios.destacado.texto}</p>
                  </div>
                )}
                {c.horarios.nota && <p className="mt-4 text-[14px] text-negro/60">{c.horarios.nota}</p>}
                <a href={wa(c.horarios.mensaje, numero)} {...EXT} className="subtitular mt-6 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full border-2 border-marca px-6 text-[15px] text-negro transition hover:bg-marca/10 sm:w-auto">
                  <IconoWhatsApp className="size-5 text-marca" />
                  Consultar disponibilidad
                </a>
              </Desplegable>
            )}
            {c.cuotas && (
              <Desplegable id="cuotas" Icono={Coins} titulo={`Consultar ${c.cuotas.titulo.toLowerCase().startsWith("cuota") || c.cuotas.titulo.toLowerCase().startsWith("tarifa") ? c.cuotas.titulo.charAt(0).toLowerCase() + c.cuotas.titulo.slice(1) : "cuotas"}`}>
                <h3 className="titular text-[26px]">{c.cuotas.titulo}</h3>
                <div className={cn("mt-5 grid gap-3", c.cuotas.grupos.length > 1 && "md:grid-cols-2")}>
                  {c.cuotas.grupos.map((g, i) => (
                    <div key={g.titulo ?? i} className="rounded-2xl bg-pared p-5">
                      {g.titulo && <p className="subtitular text-[17px]">{g.titulo}</p>}
                      <dl className={cn("grid gap-2.5 text-[15px]", g.titulo && "mt-3")}>
                        {g.filas.map(([concepto, precio]) => (
                          <div key={concepto} className="flex items-baseline justify-between gap-4 border-b border-negro/10 pb-2.5 last:border-0 last:pb-0">
                            <dt className="text-negro/70">{concepto}</dt>
                            <dd className="shrink-0 text-right font-bold tabular-nums">{precio}</dd>
                          </div>
                        ))}
                      </dl>
                      {g.nota && <p className="mt-3 text-[13.5px] leading-relaxed text-negro/60">{g.nota}</p>}
                    </div>
                  ))}
                </div>
                {c.cuotas.notas?.map((n, i) =>
                  i === 0 ? (
                    <p key={n} className="subtitular mt-4 rounded-2xl px-5 py-3 text-center text-[15px]" style={{ background: "color-mix(in srgb, var(--marca) 16%, white)" }}>
                      {n}
                    </p>
                  ) : (
                    <p key={n} className="mt-3 text-center text-[14px] text-negro/60">
                      {n}
                    </p>
                  ),
                )}
                {c.cuotas.boton && (
                  <a href={wa(c.cuotas.boton.mensaje, numero)} {...EXT} className="subtitular mt-5 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full border-2 border-marca px-6 text-[15px] text-negro transition hover:bg-marca/10">
                    <IconoWhatsApp className="size-5 text-marca" />
                    {c.cuotas.boton.texto}
                  </a>
                )}
              </Desplegable>
            )}
          </div>
        </section>
      )}

      {/* Cierre */}
      <section className="bg-negro py-16 text-center sm:py-24" aria-label="Contacto">
        <div className="container-page max-w-3xl">
          {c.notaFinal && (
            <p data-reveal className="mx-auto max-w-xl text-[17px] leading-relaxed text-white/75">
              {c.notaFinal}
            </p>
          )}
          <a href={wa(c.conocer.mensaje, numero)} {...EXT} data-reveal className="boton-venta sin-flecha subtitular mt-7 inline-flex h-16 w-full items-center justify-center gap-3 px-8 text-[17px] sm:w-auto sm:min-w-[26rem]">
            <IconoWhatsApp className="size-6 text-marca" />
            {c.conocer.boton}
          </a>
          {c.enlace && (
            <p className="mt-8 text-[15px] text-white/60">
              {c.enlace.pregunta}{" "}
              <Link href={c.enlace.href} className="group ml-1 inline-flex items-center gap-1.5 font-bold text-white underline decoration-marca decoration-2 underline-offset-4">
                {c.enlace.texto} <ArrowRight className="size-4 text-marca transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </p>
          )}
          <p className="mt-10">
            <Link href="/#que-buscas" className="text-[14px] font-semibold text-white/55 underline-offset-4 hover:text-white hover:underline">
              Ver todas las formas de entrenar en 720
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
