"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Check, CreditCard, Lock, ShieldCheck, Smartphone } from "lucide-react";
import { claseBoton } from "@/components/ui/Boton";
import { cn } from "@/lib/utils";
import { eur, planPorId, planesPago, type PlanPago } from "@/data/pagos";
import { guardarPago } from "@/lib/demo";
import { negocio, wa } from "@/data/negocio";

/**
 * ALTA + PAGO en una sola pantalla: 1) plan, 2) datos, 3) pago. Sin papeleo y sin salir de la web
 * hasta la pasarela segura (Stripe). Sin clave de Stripe, la pasarela va en modo demostración.
 */
type Paso = "datos" | "pasarela" | "ok";

const grupos = ["Gimnasio", "Entrenamiento personal", "720 Pilates"] as const;

export default function Alta() {
  const params = useSearchParams();
  const inicial = planPorId(params.get("plan")) ?? planPorId("gimnasio-libre")!;
  const [plan, setPlan] = useState<PlanPago>(inicial);
  const [grupo, setGrupo] = useState<(typeof grupos)[number]>(inicial.grupo);
  const [paso, setPaso] = useState<Paso>(params.get("estado") === "ok" ? "ok" : "datos");
  /* Si llega desde el asistente, los datos vienen ya rellenados. */
  const [datos, setDatos] = useState({ nombre: params.get("nombre") ?? "", telefono: params.get("telefono") ?? "", email: params.get("email") ?? "" });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const delGrupo = useMemo(() => planesPago.filter((p) => p.grupo === grupo), [grupo]);

  async function pagar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const d = { nombre: String(f.get("nombre") ?? "").trim(), telefono: String(f.get("telefono") ?? "").trim(), email: String(f.get("email") ?? "").trim() };
    if (d.nombre.length < 2) return setError("Escribe tu nombre.");
    if (d.telefono.replace(/\D/g, "").length < 9) return setError("Revisa el teléfono (9 cifras).");
    if (!/^\S+@\S+\.\S+$/.test(d.email)) return setError("Necesitamos un email para enviarte el recibo.");
    if (!f.get("condiciones")) return setError("Acepta las condiciones y la política de privacidad.");
    setError("");
    setDatos(d);
    setCargando(true);
    try {
      const r = await fetch("/api/pago", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId: plan.id, ...d }) });
      const j = (await r.json()) as { url?: string; demo?: boolean; error?: string };
      if (j.url) {
        window.location.href = j.url;
        return;
      }
      if (j.demo) setPaso("pasarela");
      else setError(j.error ?? "No se pudo iniciar el pago.");
    } catch {
      setPaso("pasarela");
    } finally {
      setCargando(false);
    }
  }

  function simularPago(metodo: string) {
    guardarPago({ planId: plan.id, concepto: plan.nombre, importe: plan.precio, mensual: plan.mensual, nombre: datos.nombre, telefono: datos.telefono, email: datos.email, metodo });
    setPaso("ok");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const campo = "h-13 w-full bg-suelo px-4 text-[16px] text-white ring-1 ring-white/10 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-white";

  if (paso === "ok") {
    return (
      <section className="min-h-[100svh] bg-negro pt-[calc(var(--header-h)+3rem)] pb-24">
        <div className="container-page max-w-3xl text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-white text-negro">
            <Check className="size-10" aria-hidden />
          </span>
          <h1 className="titular mt-8 text-[clamp(2.1rem,3.6vw,3.1rem)]">Bienvenido a 720</h1>
          <p className="mx-auto mt-5 max-w-xl text-[18px] leading-relaxed text-white/70">
            {datos.nombre ? `${datos.nombre.split(" ")[0]}, tu` : "Tu"} alta en <strong className="text-white">{plan.nombre}</strong> está hecha. Te hemos enviado el recibo por email y te escribimos por WhatsApp para darte la bienvenida.
          </p>
          <ol className="mx-auto mt-12 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
            {["Ven cuando quieras: abrimos de 08:00 a 22:30, los 365 días.", "El primer día te enseñamos la sala y te corregimos la técnica.", "Reserva tus clases desde el horario de la web."].map((t, i) => (
              <li key={t} className="bg-suelo p-5 text-[14px] leading-relaxed text-white/75">
                <span className="titular block text-[32px] text-white">0{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
          <div className="mt-12 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/horario" className={claseBoton("venta", true)}>
              Reservar mi primera clase
            </Link>
            <a href={wa(`Hola, me acabo de dar de alta en ${plan.nombre} desde la web.`)} target="_blank" rel="noopener noreferrer" className={claseBoton("contorno", true)}>
              Saludar por WhatsApp
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[100svh] bg-negro pt-[calc(var(--header-h)+2rem)] pb-24">
      <div className="container-page">
        <Link href="/tarifas" className="inline-flex items-center gap-2 text-[14px] text-white/60 hover:text-white">
          <ArrowLeft className="size-4" aria-hidden /> Ver todas las tarifas
        </Link>
        <h1 className="mt-6">
          <span className="subtitular block text-[clamp(1.05rem,1.6vw,1.3rem)] text-white/55">En un minuto, sin papeleo.</span>
          <span className="titular mt-1 block text-[clamp(2.4rem,4.6vw,3.6rem)]">Inscríbete</span>
        </h1>

        <ol className="mt-8 flex gap-6 text-[13px] font-semibold" aria-label="Pasos">
          {[
            ["1", "Plan", true],
            ["2", "Tus datos", true],
            ["3", "Pago seguro", paso === "pasarela"],
          ].map(([n, t, activo]) => (
            <li key={String(n)} className={cn("flex items-center gap-2", activo ? "text-white" : "text-white/40")}>
              <span className={cn("grid size-7 place-items-center rounded-full text-[12px]", activo ? "bg-white text-negro" : "ring-1 ring-white/30")}>{n}</span>
              {t}
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          {/* Plan */}
          <div className="lg:col-span-7">
            <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Tipo de plan">
              {grupos.map((g) => (
                <button
                  key={g}
                  role="tab"
                  aria-selected={grupo === g}
                  onClick={() => setGrupo(g)}
                  className={cn("subtitular h-11 shrink-0 px-4 text-[17px] transition", grupo === g ? "bg-white text-negro" : "text-white/60 hover:text-white")}
                >
                  {g}
                </button>
              ))}
            </div>
            <fieldset className="mt-5 grid gap-3 sm:grid-cols-2">
              <legend className="sr-only">Elige tu plan</legend>
              {delGrupo.map((p) => (
                <label
                  key={p.id}
                  className={cn(
                    "relative flex cursor-pointer flex-col p-5 ring-1 transition duration-300",
                    plan.id === p.id ? "bg-white text-negro ring-white" : "bg-suelo ring-white/10 hover:-translate-y-0.5 hover:ring-white/40",
                  )}
                >
                  <input type="radio" name="plan" className="sr-only" checked={plan.id === p.id} onChange={() => setPlan(p)} />
                  {p.destacado && <span className={cn("absolute top-4 right-4 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase", plan.id === p.id ? "bg-negro text-white" : "bg-white text-negro")}>Top</span>}
                  <span className="subtitular pr-12 text-[22px]">{p.nombre}</span>
                  <span className={cn("mt-1 text-[13px]", plan.id === p.id ? "text-negro/60" : "text-white/55")}>{p.detalle}</span>
                  <span className="mt-4 flex items-baseline gap-1">
                    <span className="titular text-[28px] leading-none">{p.precio}</span>
                    <span className="text-[14px] font-semibold opacity-70">€{p.mensual ? "/mes" : ""}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          </div>

          {/* Datos + pago */}
          <div className="lg:col-span-5">
            <div className="sticky top-[calc(var(--header-h)+1rem)] bg-suelo/60 p-6 ring-1 ring-white/10 sm:p-8">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="etiqueta text-white/50">Tu plan</p>
                  <p className="subtitular mt-2 text-[26px]">{plan.nombre}</p>
                  <p className="text-[13px] text-white/55">{plan.mensual ? "Cuota mensual · cobro automático del 1 al 7 · cancela cuando quieras" : "Pago único"}</p>
                </div>
                <p className="titular shrink-0 text-[30px] leading-none">{eur(plan.precio)}</p>
              </div>

              {paso === "datos" ? (
                <form onSubmit={pagar} noValidate className="mt-6 grid gap-4">
                  <label>
                    <span className="mb-2 block text-[13px] font-semibold text-white/75">Nombre y apellidos</span>
                    <input name="nombre" autoComplete="name" defaultValue={datos.nombre} className={campo} placeholder="Tu nombre" />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label>
                      <span className="mb-2 block text-[13px] font-semibold text-white/75">Teléfono</span>
                      <input name="telefono" type="tel" inputMode="tel" autoComplete="tel" defaultValue={datos.telefono} className={campo} placeholder="600 000 000" />
                    </label>
                    <label>
                      <span className="mb-2 block text-[13px] font-semibold text-white/75">Email</span>
                      <input name="email" type="email" autoComplete="email" defaultValue={datos.email} className={campo} placeholder="tu@email.com" />
                    </label>
                  </div>
                  <label className="flex items-start gap-3 text-[13px] leading-relaxed text-white/65">
                    <input type="checkbox" name="condiciones" className="mt-0.5 size-5 shrink-0 accent-white" />
                    <span>
                      Acepto las condiciones del plan y la{" "}
                      <Link href="/legal/privacidad" className="underline underline-offset-2">
                        política de privacidad
                      </Link>
                      .
                    </span>
                  </label>
                  {error && (
                    <p className="text-[14px] font-semibold" role="alert">
                      {error}
                    </p>
                  )}
                  <button type="submit" disabled={cargando} className={cn(claseBoton("venta", true), "w-full disabled:opacity-60")}>
                    <Lock className="size-4" aria-hidden /> {cargando ? "Abriendo pasarela…" : `Pagar ${eur(plan.precio)} y darme de alta`}
                  </button>
                  <p className="flex items-center justify-center gap-2 text-[12px] text-white/45">
                    <ShieldCheck className="size-4" aria-hidden /> Pago seguro con Stripe · Tarjeta, Apple Pay y Google Pay
                  </p>
                </form>
              ) : (
                <div className="mt-6" role="region" aria-label="Pasarela de pago">
                  <p className="flex items-center gap-2 bg-white/8 px-3 py-2 text-[12px] text-white/70">
                    <ShieldCheck className="size-4 shrink-0" aria-hidden />
                    Modo demostración: con la cuenta de Stripe de 720 aquí se abre la pasarela segura y se cobra de verdad.
                  </p>
                  <p className="etiqueta mt-6 text-white/50">Elige cómo pagar</p>
                  <div className="mt-3 grid gap-2">
                    {[
                      { m: "Tarjeta", Icono: CreditCard, t: "Visa, Mastercard, American Express" },
                      { m: "Apple Pay", Icono: Smartphone, t: "En iPhone, con Face ID" },
                      { m: "Google Pay", Icono: Smartphone, t: "En Android, en un toque" },
                    ].map(({ m, Icono, t }) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => simularPago(m)}
                        className="group flex items-center gap-4 bg-negro p-4 text-left ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:ring-white"
                      >
                        <Icono className="size-6" aria-hidden />
                        <span className="flex-1">
                          <span className="subtitular block text-[19px]">{m}</span>
                          <span className="text-[12px] text-white/50">{t}</span>
                        </span>
                        <span className="subtitular text-[16px] opacity-60 transition group-hover:translate-x-1 group-hover:opacity-100">Pagar {eur(plan.precio)} →</span>
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setPaso("datos")} className="mt-5 text-[13px] text-white/55 underline underline-offset-4 hover:text-white">
                    Volver a mis datos
                  </button>
                </div>
              )}
            </div>
            <p className="mt-5 text-center text-[13px] text-white/50">
              ¿Prefieres probar antes?{" "}
              <Link href="/clase-gratis" className="font-semibold text-white underline underline-offset-4">
                Clase de prueba gratis
              </Link>{" "}
              · Dudas: <a href={`tel:${negocio.telefono}`} className="underline underline-offset-4">{negocio.telefonoVisible}</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
