"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { claseBoton } from "@/components/ui/Boton";
import { cn } from "@/lib/utils";
import {
  bonos,
  condicionesGimnasio,
  condicionesPilates,
  extrasPersonal,
  primeraSesion,
  tarifasGimnasio,
  tarifasPilates,
  type Modalidad,
} from "@/data/tarifas";

const pestanas = [
  { id: "gimnasio", nombre: "Gimnasio" },
  { id: "personal", nombre: "Entrenamiento personal" },
  { id: "pilates", nombre: "720 Pilates" },
] as const;
type Pestana = (typeof pestanas)[number]["id"];

const enlace = (tipo: string, extra: Record<string, string>) => `/clase-gratis?${new URLSearchParams({ tipo, ...extra }).toString()}`;

export default function Tarifas({ inicial = "gimnasio", pagina = false }: { inicial?: Pestana; pagina?: boolean }) {
  const Titulo = pagina ? "h1" : "h2";
  const [pestana, setPestana] = useState<Pestana>(inicial);
  const [modalidad, setModalidad] = useState<Modalidad>("Individual");

  return (
    <section id="tarifas" className={cn("bg-acero text-negro", pagina ? "pt-[calc(var(--header-h)+3rem)] pb-16 sm:pb-24" : "py-16 sm:py-24")} aria-labelledby="titulo-tarifas">
      <div className="container-page">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p data-reveal className="etiqueta text-negro/50">
              Tarifas 2025-26
            </p>
            <Titulo id="titulo-tarifas" data-reveal className="mt-5">
              <span className="subtitular block text-[clamp(1.05rem,1.6vw,1.3rem)] text-negro/55">Claras y sin letra pequeña.</span>
              <span className="titular mt-1 block text-[clamp(2.1rem,3.6vw,3.1rem)]">Tarifas</span>
            </Titulo>
          </div>
          <div data-reveal className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Tipo de tarifa">
            {pestanas.map((p) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={pestana === p.id}
                aria-controls={`panel-${p.id}`}
                onClick={() => setPestana(p.id)}
                className={cn("subtitular h-12 shrink-0 px-5 text-[18px] transition", pestana === p.id ? "bg-negro text-white" : "text-negro/60 hover:text-negro")}
              >
                {p.nombre}
              </button>
            ))}
          </div>
        </div>

        {pestana === "gimnasio" && (
          <div id="panel-gimnasio" role="tabpanel" className="mt-12">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tarifasGimnasio.map((t) => (
                <li key={t.nombre} className={cn("flex flex-col p-7", t.destacada ? "bg-negro text-white" : "bg-white")}>
                  <div className="flex min-h-6 items-center justify-between gap-2">
                    <p className="etiqueta opacity-60">{t.tipo === "entrada" ? "De paso" : "Cuota"}</p>
                    {t.etiqueta && <span className="bg-acento px-2 py-1 text-[10px] font-bold tracking-wider text-acento-tinta uppercase">{t.etiqueta}</span>}
                  </div>
                  <h3 className="subtitular mt-6 text-[28px]">{t.nombre}</h3>
                  <p className="mt-3 flex items-baseline gap-1.5">
                    <span className={cn("titular text-[47px] leading-none", t.destacada && "text-acento")}>{t.precio}</span>
                    <span className="text-[15px] font-semibold opacity-70">{t.unidad}</span>
                  </p>
                  <p className="mt-4 text-[14px] leading-relaxed opacity-70">{t.detalle}</p>
                  {t.incluye && (
                    <ul className="mt-5 mb-8 space-y-2 text-[14px]">
                      {t.incluye.map((x) => (
                        <li key={x} className="flex gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-acento" aria-hidden />
                          {x}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link href={`/alta?plan=${t.pagoId}`} className={cn(claseBoton(t.destacada ? "venta" : "contorno-oscuro"), "mt-auto w-full")}>
                    {t.boton}
                  </Link>
                  <Link href={enlace("inscripcion", { plan: t.plan, actividad: "gimnasio" })} className="mt-3 text-center text-[13px] underline-offset-4 opacity-60 hover:underline hover:opacity-100">
                    Prefiero que me llaméis
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="bg-white p-7 lg:col-span-2">
                <p className="subtitular text-[22px]">Pases temporales</p>
                <p className="mt-2 text-[15px] leading-relaxed text-negro/70">
                  ¿Vienes a Ourense unas semanas por trabajo o vacaciones? Tenemos pases temporales para que no pierdas el ritmo.{" "}
                  <span className="font-semibold text-negro">Precio: pendiente de publicar.</span>
                </p>
                <Link href={enlace("inscripcion", { actividad: "gimnasio", plan: "Aún no lo sé, quiero que me asesoréis" })} className="mt-4 inline-block text-[14px] font-semibold underline underline-offset-4">
                  Pregúntanos por tu pase
                </Link>
              </div>
              <ul className="space-y-2 bg-white p-7 text-[13px] leading-relaxed text-negro/65">
                {condicionesGimnasio.map((c) => (
                  <li key={c}>· {c}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {pestana === "personal" && (
          <div id="panel-personal" role="tabpanel" className="mt-12 grid gap-4 lg:grid-cols-12">
            <div className="flex flex-col bg-negro p-8 text-white lg:col-span-4">
              <p className="etiqueta text-white/55">Primer paso</p>
              <h3 className="subtitular mt-6 text-[30px]">{primeraSesion.nombre}</h3>
              <p className="mt-3 flex items-baseline gap-1.5">
                <span className="titular text-[52px] leading-none text-acento">{primeraSesion.precio}</span>
                <span className="text-[15px] font-semibold text-white/70">€</span>
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-white/70">{primeraSesion.detalle}</p>
              <ul className="mt-6 space-y-2 text-[14px]">
                {extrasPersonal.map((x) => (
                  <li key={x} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-acento" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
              <Link href="/alta?plan=valoracion" className={cn(claseBoton("venta"), "mt-8 w-full")}>
                Reservar y pagar valoración
              </Link>
            </div>
            <div className="bg-white p-6 sm:p-8 lg:col-span-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="subtitular text-[26px]">Bonos de sesiones</h3>
                <div className="no-scrollbar -mx-2 flex gap-1 overflow-x-auto px-2" role="group" aria-label="Modalidad">
                  {(Object.keys(bonos) as Modalidad[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={modalidad === m}
                      onClick={() => setModalidad(m)}
                      className={cn("h-9 shrink-0 px-3 text-[13px] font-semibold", modalidad === m ? "bg-negro text-white" : "bg-pared text-negro/70")}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {bonos[modalidad].map((b) => (
                  <li key={b.sesiones} className={cn("relative flex flex-col border p-5", b.recomendado ? "border-negro bg-negro text-white" : "border-linea")}>
                    {b.recomendado && <span className="absolute -top-2.5 left-5 bg-acento px-2 py-0.5 text-[10px] font-bold tracking-wider text-acento-tinta uppercase">Recomendado</span>}
                    <p className="subtitular text-[20px]">Bono {b.sesiones}</p>
                    <p className="mt-2 flex items-baseline gap-1">
                      <span className="titular text-[33px] leading-none">{b.total}</span>
                      <span className="text-[14px] font-semibold opacity-70">€</span>
                    </p>
                    <p className={cn("mt-1 text-[13px] font-semibold", b.recomendado ? "text-acento" : "text-negro/60")}>{b.porSesion}</p>
                    <Link
                      href={
                        modalidad === "Individual" && b.sesiones >= 5
                          ? `/alta?plan=bono-${b.sesiones}`
                          : enlace("inscripcion", { actividad: "personal", plan: modalidad === "Individual" ? `Bono ${b.sesiones} sesiones` : "En pareja / trío / grupo de 4" })
                      }
                      className={cn(claseBoton(b.recomendado ? "venta" : "contorno-oscuro"), "mt-4 h-10 text-[15px]")}
                    >
                      Lo quiero
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[13px] leading-relaxed text-negro/60">
                Sesiones de 1 h. Los bonos requieren la valoración inicial y no caducan. Para cambiar o cancelar una sesión, avisa con 24 h.
              </p>
            </div>
          </div>
        )}

        {pestana === "pilates" && (
          <div id="panel-pilates" role="tabpanel" className="mt-12">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tarifasPilates.map((g) => (
                <li key={g.grupo} className="flex flex-col bg-white p-7">
                  <p className="etiqueta text-negro/50">720 Pilates</p>
                  <h3 className="subtitular mt-4 text-[28px]">{g.grupo}</h3>
                  <p className="mt-1 text-[13px] text-negro/60">{g.descripcion}</p>
                  <ul className="mt-5 divide-y divide-negro/10 border-y border-negro/10">
                    {g.planes.map((p) => (
                      <li key={p.nombre} className="flex items-baseline justify-between gap-3 py-3">
                        <span className="text-[14px] text-negro/80">
                          {p.pagoId ? (
                            <Link href={`/alta?plan=${p.pagoId}`} className="underline-offset-4 hover:underline">
                              {p.nombre}
                            </Link>
                          ) : (
                            p.nombre
                          )}
                        </span>
                        <span className="subtitular shrink-0 text-[22px]">
                          {p.precio}
                          <span className="ml-0.5 text-[13px] opacity-60">€/mes</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-6 bg-white p-7 sm:flex-row sm:items-center sm:justify-between">
              <ul className="grid gap-x-8 gap-y-1 text-[13px] text-negro/65 sm:grid-cols-2">
                {condicionesPilates.map((c) => (
                  <li key={c}>· {c}</li>
                ))}
                <li>· Sesión suelta: 15 €</li>
              </ul>
              <div className="flex shrink-0 gap-3">
                <Link href="/alta?plan=reformer-1" className={claseBoton("venta")}>
                  Inscríbete
                </Link>
                <Link href={enlace("prueba", { actividad: "pilates" })} className={claseBoton("contorno-oscuro")}>
                  Clase gratis
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
