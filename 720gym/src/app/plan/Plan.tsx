"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import { ArrowRight, CalendarCheck, Download } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { leerPlanes, type PlanSemanas } from "@/lib/demo";
import { negocio } from "@/data/negocio";

/**
 * Plan de 4 semanas que crea el asistente. Se ve en la web y se descarga en PDF (imprimir →
 * guardar como PDF), con la marca de 720. En la demo se guarda en este navegador.
 */
const nada = () => () => {};

export default function Plan() {
  const id = useSearchParams().get("id");
  const plan = useSyncExternalStore(
    nada,
    () => leerPlanes().find((p) => p.id === id) ?? null,
    () => null,
  ) as PlanSemanas | null;

  if (!plan) {
    return (
      <section className="grid min-h-[70svh] place-items-center bg-negro px-6 pt-[var(--header-h)] text-center text-white">
        <div>
          <h1 className="titular text-[40px]">Plan no encontrado</h1>
          <p className="mt-3 text-white/65">Pídeselo al asistente de 720: te lo prepara en un minuto.</p>
          <Link href="/" className="boton-venta subtitular mt-6 inline-flex h-12 items-center px-6">
            Volver a la web
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="plan-pdf bg-white pt-[calc(var(--header-h)+2rem)] pb-24 text-negro print:pt-0">
      <style>{`@media print{@page{margin:12mm}header,footer,nav,aside,.no-imprimir,[aria-label="Escríbenos por WhatsApp"]{display:none!important}.plan-pdf{padding:0!important}.plan-semana{break-inside:avoid}}`}</style>
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-negro/10 pb-8">
          <div>
            <Logo tono="negro" className="text-[22px]" />
            <h1 className="titular mt-6 text-[clamp(2.4rem,5vw,3.6rem)]">Tu plan de 4 semanas</h1>
            <p className="mt-2 text-[16px] text-negro/65">
              Para {plan.nombre} · {plan.objetivo} · nivel {plan.nivel} · {plan.dias_por_semana} días por semana
            </p>
          </div>
          <div className="no-imprimir flex flex-wrap gap-2">
            <button type="button" onClick={() => window.print()} className="boton-barrido subtitular inline-flex h-12 items-center gap-2 bg-negro px-6 text-white [--barrido:#3a3a3e]">
              <Download className="size-4" aria-hidden /> Descargar PDF
            </button>
            <Link href="/alta?plan=valoracion" className="boton-info subtitular inline-flex h-12 items-center gap-2 px-5 text-negro">
              Revisarlo con un entrenador
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {plan.semanas.map((s) => (
            <article key={s.semana} className="plan-semana rounded-3xl bg-pared p-6 ring-1 ring-negro/5 sm:p-7">
              <p className="etiqueta text-negro/50">Semana {s.semana}</p>
              <h2 className="subtitular mt-2 text-[22px]">{s.enfoque}</h2>
              <div className="mt-5 grid gap-4">
                {s.sesiones.map((se, i) => (
                  <div key={i} className="rounded-2xl bg-white p-4">
                    <p className="flex items-center gap-2 text-[14px] font-semibold">
                      <CalendarCheck className="size-4" aria-hidden /> {se.dia} · {se.titulo}
                    </p>
                    <ul className="mt-2 grid gap-1 text-[14px] text-negro/75">
                      {se.ejercicios.map((ej) => (
                        <li key={ej}>· {ej}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        {plan.consejos.length > 0 && (
          <div className="plan-semana mt-8 rounded-3xl bg-negro p-6 text-white sm:p-8">
            <h2 className="subtitular text-[20px]">Consejos</h2>
            <ul className="mt-3 grid gap-2 text-[15px] text-white/80">
              {plan.consejos.map((c) => (
                <li key={c}>· {c}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-8 max-w-2xl text-[13px] text-negro/55">
          Plan orientativo y general generado por el asistente de 720. No sustituye la valoración de un profesional: si tienes alguna lesión o molestia, empieza por la valoración
          inicial. {negocio.direccion.completa} · WhatsApp {negocio.whatsappVisible}.
        </p>

        <div className="no-imprimir mt-10 flex flex-col items-start gap-3 rounded-3xl bg-pared p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="subtitular text-[20px]">¿Lo hacemos juntos en 720?</p>
            <p className="text-[14px] text-negro/60">Prueba una clase gratis o date de alta desde 35 €/mes.</p>
          </div>
          <Link href="/alta" className="boton-venta subtitular inline-flex h-12 items-center gap-2 px-6">
            Inscribirme <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
