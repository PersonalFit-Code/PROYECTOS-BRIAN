"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";
import { claseBoton } from "@/components/ui/Boton";
import { cn } from "@/lib/utils";
import { actividades } from "@/data/conceptos";
import { negocio, pilates } from "@/data/negocio";
import { planesFormulario } from "@/data/tarifas";
import { guardarSolicitud } from "@/lib/demo";

/**
 * FORMULARIO ÚNICO. Sustituye a sus cuatro Google Forms (inscripción, entrada diaria, yoga y
 * pilates) y añade la clase de prueba.
 *
 * Cómo avisa: al enviar se abre WhatsApp con el mensaje ya escrito hacia el número del gimnasio
 * (o el de 720 Pilates si es Pilates), y en paralelo se manda a /api/aviso, que lo reenvía a un
 * webhook (Make → WhatsApp/email) si está configurado AVISO_WEBHOOK_URL. Sin claves en el código.
 */
type Tipo = "prueba" | "inscripcion" | "entrada";

const tipos: { id: Tipo; nombre: string; corto: string }[] = [
  { id: "prueba", nombre: "Clase de prueba gratis", corto: "Clase gratis" },
  { id: "inscripcion", nombre: "Inscripción", corto: "Inscripción" },
  { id: "entrada", nombre: "Entrada diaria · 5 €", corto: "Entrada diaria" },
];

const horas = Array.from({ length: 15 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`);

function hoyISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
function fechaBonita(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}

interface Props {
  tipoInicial?: Tipo;
  actividadInicial?: string;
  planInicial?: string;
  tono?: "oscuro" | "crema";
  titulo?: string;
  numero?: string;
  /** Número de sección («06»); null en páginas internas. */
  orden?: string | null;
}

function Formulario({ tipoInicial = "prueba", actividadInicial = "gimnasio", planInicial, tono = "oscuro" }: Props) {
  const [tipo, setTipo] = useState<Tipo>(tipoInicial);
  const [actividad, setActividad] = useState(actividadInicial);
  const grupo = actividades.find((a) => a.id === actividad)?.grupo;
  const planes = grupo ? planesFormulario[grupo] : [];
  const [plan, setPlan] = useState(planInicial && planes.includes(planInicial) ? planInicial : "");
  const [enviado, setEnviado] = useState<{ url: string } | null>(null);
  const [error, setError] = useState("");
  const minFecha = useMemo(() => hoyISO(), []);

  const claro = tono === "crema";
  const campo = cn(
    "h-13 w-full px-4 text-[16px] outline-none transition placeholder:opacity-40 focus:ring-2 focus:ring-acento",
    claro ? "bg-white text-carbon ring-1 ring-carbon/10" : "bg-suelo text-white ring-1 ring-white/10",
  );
  const etiqueta = cn("mb-2 block text-[13px] font-semibold", claro ? "text-carbon/75" : "text-white/75");

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("web")) return; // trampa para bots
    const nombre = String(f.get("nombre") ?? "").trim();
    const telefono = String(f.get("telefono") ?? "").trim();
    if (nombre.length < 2) return setError("Escribe tu nombre.");
    if (telefono.replace(/\D/g, "").length < 9) return setError("Revisa el teléfono: necesitamos 9 cifras para llamarte.");
    if (!f.get("privacidad")) return setError("Acepta la política de privacidad para que podamos contactarte.");
    setError("");

    const act = actividades.find((a) => a.id === actividad);
    const fecha = String(f.get("fecha") ?? "");
    const hora = String(f.get("hora") ?? "");
    const email = String(f.get("email") ?? "").trim();
    const comentario = String(f.get("comentario") ?? "").trim();
    const lineas = [
      tipo === "prueba" ? "🟠 *Clase de prueba* (desde la web)" : tipo === "entrada" ? "🟠 *Entrada diaria* (desde la web)" : "🟠 *Inscripción* (desde la web)",
      `Nombre: ${nombre}`,
      `Teléfono: ${telefono}`,
      email && `Email: ${email}`,
      tipo !== "entrada" && act && `Actividad: ${act.nombre}`,
      tipo === "inscripcion" && plan && `Plan: ${plan}`,
      (tipo === "prueba" || tipo === "entrada") && fecha && `Día: ${fechaBonita(fecha)}`,
      tipo === "prueba" && hora && `Hora: ${hora}`,
      comentario && `Comentario: ${comentario}`,
    ].filter(Boolean) as string[];
    const texto = lineas.join("\n");
    const destino = tipo !== "entrada" && act?.pilates ? pilates.whatsapp : negocio.whatsapp;
    const url = `https://wa.me/${destino}?text=${encodeURIComponent(texto)}`;

    guardarSolicitud({ tipo, nombre, telefono, email, actividad: act?.nombre, plan, fecha, hora, comentario });
    /* Se abre en el mismo gesto del usuario para que el navegador no lo bloquee. */
    window.open(url, "_blank", "noopener");
    fetch("/api/aviso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, nombre, telefono, email, actividad: act?.nombre, plan, fecha, hora, comentario }),
      keepalive: true,
    }).catch(() => {});
    setEnviado({ url });
  }

  if (enviado) {
    return (
      <div className={cn("p-8 sm:p-10", claro ? "bg-white text-carbon" : "bg-suelo")} role="status">
        <CheckCircle2 className="size-10 text-acento" aria-hidden />
        <p className="titular mt-6 text-[48px]">¡Listo!</p>
        <p className={cn("mt-3 max-w-md text-[16px] leading-relaxed", claro ? "text-carbon/70" : "text-white/70")}>
          Se ha abierto WhatsApp con tu mensaje preparado: solo tienes que pulsar <strong>enviar</strong>. Te contestamos enseguida para confirmarlo.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href={enviado.url} target="_blank" rel="noopener noreferrer" className={claseBoton("acento")}>
            Abrir WhatsApp otra vez
          </a>
          <button type="button" onClick={() => setEnviado(null)} className={claseBoton(claro ? "contorno-oscuro" : "contorno")}>
            Enviar otra solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className={cn("p-6 sm:p-10", claro ? "bg-crema-2" : "bg-suelo/60 ring-1 ring-white/8")}>
      <div className="grid grid-cols-3 gap-1" role="tablist" aria-label="Qué quieres hacer">
        {tipos.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tipo === t.id}
            onClick={() => setTipo(t.id)}
            className={cn(
              "subtitular min-h-12 px-2 text-[15px] leading-tight transition sm:text-[18px]",
              tipo === t.id ? "bg-acento text-acento-tinta" : claro ? "bg-white/60 text-carbon/70" : "bg-negro/60 text-white/65 hover:text-white",
            )}
          >
            <span className="sm:hidden">{t.corto}</span>
            <span className="hidden sm:inline">{t.nombre}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="f-nombre" className={etiqueta}>Nombre y apellidos</label>
          <input id="f-nombre" name="nombre" autoComplete="name" required className={campo} placeholder="Tu nombre" />
        </div>
        <div>
          <label htmlFor="f-telefono" className={etiqueta}>Teléfono</label>
          <input id="f-telefono" name="telefono" type="tel" inputMode="tel" autoComplete="tel" required className={campo} placeholder="600 000 000" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="f-email" className={etiqueta}>
            Email <span className="font-normal opacity-60">(opcional)</span>
          </label>
          <input id="f-email" name="email" type="email" autoComplete="email" className={campo} placeholder="tu@email.com" />
        </div>

        {tipo !== "entrada" && (
          <div className={cn(tipo === "inscripcion" && planes.length ? "" : "sm:col-span-2")}>
            <label htmlFor="f-actividad" className={etiqueta}>{tipo === "prueba" ? "¿Qué quieres probar?" : "Actividad"}</label>
            <select
              id="f-actividad"
              value={actividad}
              onChange={(e) => {
                setActividad(e.target.value);
                setPlan("");
              }}
              className={campo}
            >
              {actividades.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {tipo === "inscripcion" && planes.length > 0 && (
          <div>
            <label htmlFor="f-plan" className={etiqueta}>Plan</label>
            <select id="f-plan" value={plan} onChange={(e) => setPlan(e.target.value)} className={campo}>
              <option value="">Elige un plan</option>
              {planes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        )}

        {(tipo === "prueba" || tipo === "entrada") && (
          <div className={tipo === "entrada" ? "sm:col-span-2" : ""}>
            <label htmlFor="f-fecha" className={etiqueta}>Día</label>
            <input id="f-fecha" name="fecha" type="date" min={minFecha} defaultValue={minFecha} className={cn(campo, "[color-scheme:dark]", claro && "[color-scheme:light]")} />
          </div>
        )}
        {tipo === "prueba" && (
          <div>
            <label htmlFor="f-hora" className={etiqueta}>Hora aproximada</label>
            <select id="f-hora" name="hora" className={campo} defaultValue="18:00">
              {horas.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </div>
        )}

        <div className="sm:col-span-2">
          <label htmlFor="f-comentario" className={etiqueta}>
            ¿Algo que debamos saber? <span className="font-normal opacity-60">(opcional)</span>
          </label>
          <textarea id="f-comentario" name="comentario" rows={3} className={cn(campo, "h-auto py-3")} placeholder="Lesiones, objetivos, si vienes con alguien…" />
        </div>

        <input type="text" name="web" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

        <label className={cn("flex items-start gap-3 text-[13px] leading-relaxed sm:col-span-2", claro ? "text-carbon/70" : "text-white/65")}>
          <input type="checkbox" name="privacidad" className="mt-0.5 size-5 shrink-0 accent-[var(--acento)]" />
          <span>
            Acepto la{" "}
            <Link href="/legal/privacidad" className="underline underline-offset-2">
              política de privacidad
            </Link>{" "}
            y que 720 GYM CLUB me contacte para gestionar esta solicitud.
          </span>
        </label>
      </div>

      {error && (
        <p className="mt-5 text-[14px] font-semibold text-acento" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className={cn(claseBoton("acento", true), "mt-8 w-full")}>
        <Send className="size-5" aria-hidden />
        {tipo === "prueba" ? "Reservar mi clase de prueba" : tipo === "entrada" ? "Pedir mi entrada diaria" : "Enviar inscripción"}
      </button>
      <p className={cn("mt-3 text-center text-[12px]", claro ? "text-carbon/55" : "text-white/45")}>Te llega la confirmación por WhatsApp. Sin compromiso.</p>
    </form>
  );
}

function FormularioConParametros(props: Props) {
  const p = useSearchParams();
  const tipo = (p.get("tipo") as Tipo | null) ?? props.tipoInicial;
  const actividad = p.get("actividad") ?? props.actividadInicial;
  const plan = p.get("plan") ?? props.planInicial;
  return <Formulario key={`${tipo}-${actividad}-${plan}`} {...props} tipoInicial={tipo} actividadInicial={actividad} planInicial={plan ?? undefined} />;
}

export default function Apuntate(props: Props & { id?: string }) {
  const { tono = "oscuro", titulo } = props;
  const claro = tono === "crema";
  return (
    <section id={props.id ?? "apuntate"} className={cn("py-24 sm:py-32", claro ? "bg-crema text-carbon" : "bg-negro")} aria-labelledby="titulo-apuntate">
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 lg:col-span-5">
          <p data-reveal className={cn("etiqueta", claro ? "text-carbon/55" : "text-white/55")}>
            {props.orden !== null && <><span className={claro ? "text-pil-menta-osc" : "text-acento"}>{props.orden ?? "06"}</span> · </>}En dos toques
          </p>
          <h2 id="titulo-apuntate" data-reveal className="mt-5">
            <span className="titular block text-[clamp(3.25rem,9vw,7rem)]">{titulo ?? "Ven a probar"}</span>
            <span className={cn("subtitular mt-2 block text-[clamp(1.5rem,3vw,2.25rem)]", claro ? "text-carbon/55" : "text-white/55")}>
              Tu primera clase, gratis.
            </span>
          </h2>
          <p data-reveal className={cn("mt-6 max-w-md text-[16px] leading-relaxed", claro ? "text-carbon/70" : "text-white/70")}>
            Elige día y hora, o date de alta directamente. Te escribimos por WhatsApp para confirmarlo. Sin colas, sin papeleo y sin compromiso.
          </p>
          <ol data-reveal className="mt-10 space-y-5">
            {["Rellena tus datos", "Elige actividad, plan o día", "Te confirmamos por WhatsApp"].map((paso, i) => (
              <li key={paso} className="flex items-center gap-4">
                <span className={cn("titular grid size-12 place-items-center text-[26px]", claro ? "bg-carbon text-crema" : "bg-white text-negro")}>{i + 1}</span>
                <span className="subtitular text-[19px] sm:text-[22px]">{paso}</span>
              </li>
            ))}
          </ol>
        </div>
        <div data-reveal className="min-w-0 lg:col-span-7">
          <Suspense fallback={<Formulario {...props} />}>
            <FormularioConParametros {...props} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
