"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Check, Clock, Loader2, Phone, User, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Boton from "@/components/ui/Boton";
import { BUSINESS } from "@/data/business";
import { useFormat, useLocale, useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { formatCents } from "@/lib/format";
import { urlFor } from "@/lib/hosts";
import { cn } from "@/lib/utils";
import { duracionTexto, horaSalon, llamar } from "./api";
import Calendario from "./Calendario";
import Turnstile, { type TurnstileHandle } from "./Turnstile";
import type { CatalogoReserva, CitaACambiar, DiaDisponible, ErrorApi, Hueco } from "./tipos";

/**
 * El asistente de reserva: servicio → profesional → día → hora → datos → hecho.
 *
 * No decide nada sobre la agenda: pide días y horas a `/api/reservar/disponibilidad`, guarda la
 * hora con `/hold` (que puede contestar 409 si alguien se adelantó) y confirma con `/confirmar`
 * (410 si el hold caducó). Cada error se traduce con su código y devuelve a la clienta al paso
 * donde puede arreglarlo. El estado básico (servicios, profesional, día) se refleja en la URL para
 * que «atrás» del navegador y compartir el enlace funcionen.
 *
 * En modo «cambiar» (llega desde el correo) los servicios son los de su cita y la última acción no
 * es un hold sino `/api/reservar/cambiar`, que mueve la cita en una sola transacción.
 */
type Paso = "servicios" | "profesional" | "dia" | "hora" | "datos" | "hecho";

interface Hold {
  holdId: string;
  expiraEn: string;
  inicio: string;
  salida: string;
  duracionMin: number;
  profesional: { id: string; nombre: string };
  totalCents: number;
}

type Borrador = Record<string, string | boolean>;

interface Hecho {
  fecha: string;
  hora: string;
  urlCita: string;
  email: string | null;
}

interface Props {
  catalogo: CatalogoReserva;
  /** slug de `?con=` (enlace de la bio de Instagram de cada profesional) */
  conSlug?: string | null;
  cambiar?: CitaACambiar | null;
  inicial?: { servicios?: string[]; fecha?: string | null };
}

export default function Asistente({ catalogo, conSlug, cambiar, inicial }: Props) {
  const m = useMessages().reservar;
  const t = useFormat();
  const locale = useLocale();
  const reduced = useReducedMotion() ?? false;

  const preferida = conSlug ? catalogo.equipo.find((p) => p.slug === conSlug)?.id ?? null : null;
  const [servicios, setServicios] = useState<string[]>(
    cambiar?.servicios ?? (inicial?.servicios ?? []).filter((id) => catalogo.servicios.some((s) => s.id === id)),
  );
  const [staffId, setStaffId] = useState<string | null>(cambiar?.staffId ?? preferida);
  const [paso, setPaso] = useState<Paso>(cambiar ? "dia" : "servicios");
  const [dias, setDias] = useState<DiaDisponible[] | null>(null);
  const [fecha, setFecha] = useState<string | null>(inicial?.fecha ?? null);
  const [huecos, setHuecos] = useState<Hueco[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hold, setHold] = useState<Hold | null>(null);
  const [hecho, setHecho] = useState<Hecho | null>(null);
  /** Lo tecleado en «Tus datos». Vive aquí y no en el paso: si el hold caduca y hay que volver a
      elegir hora, el formulario vuelve relleno en vez de en blanco. */
  const [borrador, setBorrador] = useState<Borrador>({});
  const tituloRef = useRef<HTMLHeadingElement>(null);

  const porId = useMemo(() => new Map(catalogo.servicios.map((s) => [s.id, s])), [catalogo.servicios]);
  const elegidos = servicios.map((id) => porId.get(id)).filter((s) => s !== undefined);
  const duracion = elegidos.reduce((tot, s) => tot + s.duracionMin, 0);
  const total = elegidos.reduce((tot, s) => tot + s.precioCents, 0);
  const desde = elegidos.some((s) => s.precioDesde);

  /** Profesionales que hacen TODOS los servicios elegidos, en el orden del panel. */
  const candidatas = useMemo(
    () => catalogo.equipo.filter((p) => servicios.every((id) => (catalogo.quienHace[id] ?? []).includes(p.id))),
    [catalogo, servicios],
  );

  const traducir = useCallback(
    (e: ErrorApi) => (m.errores as Record<string, string>)[e.codigo] ?? m.errores.ERROR_INTERNO,
    [m.errores],
  );

  /* Foco al título de cada paso: quien navega con lector de pantalla sabe dónde está. */
  useEffect(() => {
    tituloRef.current?.focus({ preventScroll: true });
    if (!reduced) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [paso, reduced]);

  /* La URL refleja la elección (sin recargar): servicios, profesional y día. */
  useEffect(() => {
    if (cambiar || paso === "hecho") return;
    const q = new URLSearchParams(window.location.search);
    if (servicios.length) q.set("servicios", servicios.join(","));
    else q.delete("servicios");
    const slug = catalogo.equipo.find((p) => p.id === staffId)?.slug;
    if (slug) q.set("con", slug);
    else q.delete("con");
    if (fecha) q.set("fecha", fecha);
    else q.delete("fecha");
    const qs = q.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [servicios, staffId, fecha, cambiar, paso, catalogo.equipo]);

  const query = useCallback(
    (extra?: Record<string, string>) =>
      new URLSearchParams({ servicios: servicios.join(","), con: staffId ?? "", ...(extra ?? {}) }).toString(),
    [servicios, staffId],
  );

  const cargarDias = useCallback(async () => {
    setCargando(true);
    setDias(null);
    const r = await llamar<{ dias: DiaDisponible[] }>(`/api/reservar/disponibilidad?${query()}`);
    setCargando(false);
    if (r.ok) setDias(r.datos.dias);
    else setError(traducir(r.error));
  }, [query, traducir]);

  const cargarHuecos = useCallback(
    async (dia: string) => {
      setCargando(true);
      setHuecos(null);
      const r = await llamar<{ huecos: Hueco[] }>(`/api/reservar/disponibilidad?${query({ fecha: dia })}`);
      setCargando(false);
      if (r.ok) setHuecos(r.datos.huecos);
      else setError(traducir(r.error));
    },
    [query, traducir],
  );

  /* Las cargas salen del cuerpo del effect (setTimeout 0): así el cambio de paso pinta primero y,
     si la clienta cambia otra vez antes de que arranque, la petición vieja ni se lanza. */
  useEffect(() => {
    if (paso !== "dia") return;
    const t = window.setTimeout(() => void cargarDias(), 0);
    return () => window.clearTimeout(t);
  }, [paso, cargarDias]);

  useEffect(() => {
    if (paso !== "hora" || !fecha) return;
    const t = window.setTimeout(() => void cargarHuecos(fecha), 0);
    return () => window.clearTimeout(t);
  }, [paso, fecha, cargarHuecos]);

  /* ── Navegación ─────────────────────────────────────────── */

  const irA = (p: Paso) => {
    setError(null);
    setPaso(p);
  };

  const trasServicios = () => {
    if (staffId && !candidatas.some((p) => p.id === staffId)) setStaffId(null);
    // Con una sola profesional posible no hay nada que elegir.
    if (candidatas.length <= 1) {
      setStaffId(candidatas[0]?.id ?? null);
      irA("dia");
    } else irA("profesional");
  };

  const liberarHold = useCallback(async (h: Hold | null) => {
    if (!h) return;
    await llamar(`/api/reservar/hold`, { method: "DELETE", body: JSON.stringify({ holdId: h.holdId }) });
  }, []);

  const atras = () => {
    setError(null);
    if (paso === "profesional") irA("servicios");
    else if (paso === "dia") irA(cambiar ? "dia" : candidatas.length <= 1 ? "servicios" : "profesional");
    else if (paso === "hora") irA("dia");
    else if (paso === "datos") {
      void liberarHold(hold);
      setHold(null);
      irA("hora");
    }
  };

  /* ── Elegir hora: hold (o cambio directo) ────────────────── */

  const elegirHora = async (h: Hueco) => {
    setError(null);
    setCargando(true);
    if (cambiar) {
      const r = await llamar<{ cita: { fecha: string; hora: string } | null; urlCita: string }>(`/api/reservar/cambiar`, {
        method: "POST",
        body: JSON.stringify({ token: cambiar.token, t: cambiar.firma, inicio: h.inicio, staffId, locale }),
      });
      setCargando(false);
      if (r.ok) {
        setHecho({ fecha: r.datos.cita?.fecha ?? "", hora: r.datos.cita?.hora ?? horaSalon(h.inicio), urlCita: r.datos.urlCita, email: null });
        irA("hecho");
      } else {
        setError(traducir(r.error));
        if (r.error.codigo === "HORA_OCUPADA" && fecha) void cargarHuecos(fecha);
      }
      return;
    }
    const r = await llamar<Hold>(`/api/reservar/hold`, {
      method: "POST",
      body: JSON.stringify({ servicios, staffId, inicio: h.inicio }),
    });
    setCargando(false);
    if (r.ok) {
      setHold(r.datos);
      irA("datos");
    } else {
      setError(traducir(r.error));
      if (r.error.codigo === "HORA_OCUPADA" && fecha) void cargarHuecos(fecha);
    }
  };

  const alCaducar = useCallback(() => {
    setHold(null);
    setError(m.errores.HOLD_CADUCADO);
    setPaso("hora");
  }, [m.errores.HOLD_CADUCADO]);

  /* ── Render ─────────────────────────────────────────────── */

  const pasosVisibles: Paso[] = cambiar ? ["dia", "hora"] : ["servicios", "profesional", "dia", "hora", "datos"];
  const indice = pasosVisibles.indexOf(paso);

  const titulo: Record<Paso, string> = {
    servicios: m.servicios.title,
    profesional: m.profesional.title,
    dia: m.dia.title,
    hora: m.hora.title,
    datos: m.datos.title,
    hecho: m.confirmada.title,
  };

  const variantes = reduced
    ? { entra: { opacity: 1 }, sale: { opacity: 1 }, quieto: { opacity: 1 } }
    : { entra: { opacity: 0, y: 16 }, quieto: { opacity: 1, y: 0 }, sale: { opacity: 0, y: -12 } };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-40 pt-6 sm:px-6">
      {cambiar && paso !== "hecho" && (
        <p className="mb-4 rounded-2xl bg-rosa-niebla px-4 py-3 text-sm text-tinta">
          {t(m.cambiar.banner, { fecha: cambiar.fecha, hora: cambiar.hora })}
        </p>
      )}

      {paso !== "hecho" && indice >= 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-carmin-suave">
            <span>{t(m.progreso, { n: indice + 1, total: pasosVisibles.length })}</span>
            <span>{m.pasos[paso as Exclude<Paso, "hecho">]}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-rosa" aria-hidden>
            <motion.div
              className="h-full rounded-full bg-carmin"
              initial={false}
              animate={{ width: `${((indice + 1) / pasosVisibles.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            />
          </div>
        </div>
      )}

      {/* Los errores se ANUNCIAN desde aquí, una región que no se desmonta: la de dentro de cada paso
          nace a la vez que el paso (p. ej. hold caducado → vuelta a «Hora») y un `role="alert"` que
          aparece ya relleno no siempre se lee. La de dentro es solo visual. */}
      <p role="alert" aria-atomic="true" className="sr-only">
        {error ?? ""}
      </p>

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={paso}
          variants={variantes}
          initial="entra"
          animate="quieto"
          exit="sale"
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 ref={tituloRef} tabIndex={-1} className="font-display text-3xl font-semibold text-tinta outline-none sm:text-4xl">
            {titulo[paso]}
          </h1>

          {error && (
            <p className="mt-4 rounded-2xl border border-carmin/20 bg-white px-4 py-3 text-[15px] text-carmin">
              {error}
            </p>
          )}

          <div className="mt-5">
            {paso === "servicios" && (
              <PasoServicios catalogo={catalogo} elegidos={servicios} onCambiar={setServicios} />
            )}

            {paso === "profesional" && (
              <div className="grid gap-3">
                {candidatas.length === 0 && <p className="text-gris">{m.profesional.ninguna}</p>}
                {candidatas.length > 0 && (
                  <Opcion activa={staffId === null} onClick={() => { setStaffId(null); irA("dia"); }}>
                    <span className="grid size-12 place-items-center rounded-full bg-rosa-niebla text-carmin">
                      <Users aria-hidden className="size-6" />
                    </span>
                    <span>
                      <span className="block font-semibold text-tinta">{m.profesional.cualquiera}</span>
                      <span className="block text-sm text-gris">{m.profesional.cualquieraHint}</span>
                    </span>
                  </Opcion>
                )}
                {candidatas.map((p) => (
                  <Opcion key={p.id} activa={staffId === p.id} onClick={() => { setStaffId(p.id); irA("dia"); }}>
                    {p.foto ? (
                      <Image src={p.foto} alt="" width={48} height={48} className="size-12 rounded-full object-cover" />
                    ) : (
                      <span className="grid size-12 place-items-center rounded-full bg-rosa-niebla text-carmin">
                        <User aria-hidden className="size-6" />
                      </span>
                    )}
                    <span>
                      <span className="block font-semibold text-tinta">{p.nombre}</span>
                      {p.especialidades.length > 0 && (
                        <span className="block text-sm text-gris">{p.especialidades.slice(0, 3).join(" · ")}</span>
                      )}
                    </span>
                  </Opcion>
                ))}
              </div>
            )}

            {paso === "dia" && (
              <>
                <p className="mb-4 text-gris">{m.dia.hint}</p>
                {cargando && !dias && <Cargando texto={m.dia.cargando} />}
                {dias && dias.some((d) => d.hayHuecos) && (
                  <Calendario
                    dias={dias}
                    seleccionada={fecha}
                    onElegir={(f) => {
                      setFecha(f);
                      irA("hora");
                    }}
                  />
                )}
                {dias && !dias.some((d) => d.hayHuecos) && (
                  <SinHuecos texto={t(m.dia.sinDias, { dias: dias.length })} />
                )}
              </>
            )}

            {paso === "hora" && (
              <>
                {fecha && <p className="mb-4 text-gris">{fechaBonita(fecha, m.dia, t)}</p>}
                {cargando && !huecos && <Cargando texto={m.dia.cargando} />}
                {huecos && huecos.length === 0 && <SinHuecos texto={m.hora.sinHoras} />}
                {huecos && huecos.length > 0 && (
                  <Horas huecos={huecos} onElegir={elegirHora} ocupado={cargando} />
                )}
                {cargando && huecos && <Cargando texto={m.hora.reservando} />}
              </>
            )}

            {paso === "datos" && hold && (
              <PasoDatos
                hold={hold}
                horasCancelacion={catalogo.horasCancelacion}
                borrador={borrador}
                onBorrador={(campo, valor) => setBorrador((b) => ({ ...b, [campo]: valor }))}
                onProrroga={(expiraEn) => setHold((h) => (h ? { ...h, expiraEn } : h))}
                onCaducar={alCaducar}
                onError={(e) => {
                  if (e.codigo === "HOLD_CADUCADO") alCaducar();
                  else setError(traducir(e));
                }}
                onHecho={(h) => {
                  setHecho(h);
                  setHold(null);
                  setBorrador({});
                  irA("hecho");
                }}
              />
            )}

            {paso === "hecho" && hecho && (
              <div className="rounded-3xl border border-[var(--capa-borde)] bg-white p-6 text-center shadow-[var(--shadow-card)]">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-carmin text-[var(--on-accent)]">
                  <Check aria-hidden className="size-8" />
                </span>
                <p className="mt-4 font-display text-2xl font-semibold text-tinta">
                  {hecho.fecha} · {hecho.hora}
                </p>
                <p className="mt-3 text-gris">
                  {cambiar
                    ? t(m.cambiar.hecho, { fecha: hecho.fecha, hora: hecho.hora })
                    : t(m.confirmada.text, { email: hecho.email ?? "" })}
                </p>
                {!cambiar && <p className="mt-1 text-sm text-gris">{m.confirmada.sinCorreo}</p>}
                <div className="mt-6 flex flex-col items-center gap-3">
                  <Boton href={hecho.urlCita}>{m.confirmada.verCita}</Boton>
                  <Boton href={urlFor("web", "/", locale)} variant="fantasma">
                    {m.confirmada.web}
                  </Boton>
                </div>
              </div>
            )}
          </div>
        </motion.section>
      </AnimatePresence>

      {/* Barra inferior: resumen y siguiente paso, al alcance del pulgar. */}
      {paso !== "hecho" && (
        /* `barra-reserva`: mientras se escribe en un campo se esconde (globals.css), para que no tape
           el campo enfocado ni se quede encima del teclado del móvil (WCAG 2.4.11). */
        <div className="barra-reserva fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),12px)]">
          <div className="liquid-glass liquid-glass-strong mx-auto flex max-w-2xl items-center gap-3 rounded-[28px] px-3 py-3 sm:px-4">
            {(paso !== "servicios" && !(cambiar && paso === "dia")) ? (
              <button
                type="button"
                onClick={atras}
                className="grid size-12 shrink-0 place-items-center rounded-full text-carmin hover:bg-carmin/5"
                aria-label={m.atras}
              >
                <ArrowLeft aria-hidden className="size-5" />
              </button>
            ) : null}
            <div className="min-w-0 flex-1">
              {elegidos.length > 0 ? (
                <>
                  <p className="truncate text-sm font-semibold text-tinta">{elegidos.map((s) => s.nombre).join(" + ")}</p>
                  <p className="flex items-center gap-1.5 text-xs text-gris">
                    <Clock aria-hidden className="size-3.5" />
                    {duracionTexto(duracion)} · {desde ? t(m.resumen.precioDesde, { precio: formatCents(total) }) : formatCents(total)}
                  </p>
                </>
              ) : (
                <a href={BUSINESS.phone.tel} className="flex min-h-11 items-center gap-2 text-sm text-gris">
                  <Phone aria-hidden className="size-4 text-carmin-suave" />
                  {m.header.call} {BUSINESS.phone.display}
                </a>
              )}
            </div>
            {paso === "servicios" && (
              <Boton onClick={trasServicios} disabled={servicios.length === 0} size="md">
                {m.continuar}
              </Boton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Piezas
   ──────────────────────────────────────────────────────────── */

function Opcion({ activa, onClick, children }: { activa: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={cn(
        "flex min-h-16 w-full items-center gap-4 rounded-3xl border bg-white px-4 py-3 text-left transition-[border-color,box-shadow]",
        activa ? "border-carmin shadow-[var(--shadow-soft)]" : "border-[var(--capa-borde)] hover:border-carmin/40",
      )}
    >
      {children}
    </button>
  );
}

function Cargando({ texto }: { texto: string }) {
  return (
    <p className="flex items-center gap-2 py-6 text-gris" role="status">
      <Loader2 aria-hidden className="size-5 animate-spin text-carmin-suave" />
      {texto}
    </p>
  );
}

function SinHuecos({ texto }: { texto: string }) {
  return (
    <div className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5">
      <p className="text-tinta">{texto}</p>
      <a href={BUSINESS.phone.tel} className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-carmin">
        <Phone aria-hidden className="size-4" />
        {BUSINESS.phone.display}
      </a>
    </div>
  );
}

function fechaBonita(
  fecha: string,
  textos: { meses: readonly string[]; diasLargos: readonly string[]; fechaFormato: string },
  t: (plantilla: string, vars?: Record<string, string | number>) => string,
): string {
  const [a, mes, d] = fecha.split("-").map(Number);
  const dow = new Date(Date.UTC(a, mes - 1, d)).getUTCDay();
  return t(textos.fechaFormato, { dia: textos.diasLargos[dow] ?? "", n: d, mes: textos.meses[mes - 1] ?? "" });
}

function PasoServicios({
  catalogo,
  elegidos,
  onCambiar,
}: {
  catalogo: CatalogoReserva;
  elegidos: string[];
  onCambiar: (ids: string[]) => void;
}) {
  const m = useMessages().reservar.servicios;
  const t = useFormat();
  if (catalogo.servicios.length === 0) return <SinHuecos texto={m.vacio} />;

  const grupos = [
    ...catalogo.categorias.map((c) => ({ id: c.id, nombre: c.nombre, servicios: catalogo.servicios.filter((s) => s.categoriaId === c.id) })),
    { id: "otros", nombre: "", servicios: catalogo.servicios.filter((s) => !catalogo.categorias.some((c) => c.id === s.categoriaId)) },
  ].filter((g) => g.servicios.length > 0);

  const alternar = (id: string) =>
    onCambiar(elegidos.includes(id) ? elegidos.filter((x) => x !== id) : [...elegidos, id]);

  return (
    <div className="space-y-7">
      <p className="text-gris">{m.hint}</p>
      {grupos.map((g) => (
        <div key={g.id}>
          {g.nombre && <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-carmin-suave">{g.nombre}</h2>}
          <ul className="grid gap-2.5">
            {g.servicios.map((s) => {
              const activo = elegidos.includes(s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => alternar(s.id)}
                    aria-pressed={activo}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-3xl border bg-white px-4 py-3.5 text-left transition-[border-color,box-shadow]",
                      activo ? "border-carmin shadow-[var(--shadow-soft)]" : "border-[var(--capa-borde)] hover:border-carmin/40",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border transition-colors",
                        activo ? "border-carmin bg-carmin text-[var(--on-accent)]" : "border-carmin/30",
                      )}
                    >
                      {activo && <Check className="size-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-tinta">{s.nombre}</span>
                      {s.descripcion && <span className="mt-0.5 block text-sm text-gris">{s.descripcion}</span>}
                      <span className="mt-1 block text-sm text-gris">{duracionTexto(s.duracionMin)}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-carmin">
                      {s.precioDesde ? t(m.desde, { precio: formatCents(s.precioCents) }) : formatCents(s.precioCents)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Horas({
  huecos,
  onElegir,
  ocupado,
}: {
  huecos: Hueco[];
  onElegir: (h: Hueco) => void;
  ocupado: boolean;
}) {
  const m = useMessages().reservar.hora;
  const manana = huecos.filter((h) => Number(horaSalon(h.inicio).slice(0, 2)) < 14);
  const tarde = huecos.filter((h) => Number(horaSalon(h.inicio).slice(0, 2)) >= 14);
  const bloque = (titulo: string, lista: Hueco[]) =>
    lista.length > 0 && (
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-carmin-suave">{titulo}</h2>
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {lista.map((h) => (
            <li key={h.inicio}>
              <button
                type="button"
                disabled={ocupado}
                onClick={() => onElegir(h)}
                className="min-h-12 w-full rounded-2xl border border-[var(--capa-borde)] bg-white text-[15px] font-semibold text-tinta transition-colors hover:border-carmin hover:bg-rosa-niebla disabled:opacity-50"
              >
                {horaSalon(h.inicio)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  return (
    <div className="space-y-6">
      {bloque(m.manana, manana)}
      {bloque(m.tarde, tarde)}
    </div>
  );
}

/** Con cuánto margen se avisa de que el hold se acaba (WCAG 2.2.1 pide al menos 20 segundos). */
const AVISO_HOLD_MS = 2 * 60_000;

function PasoDatos({
  hold,
  horasCancelacion,
  borrador,
  onBorrador,
  onProrroga,
  onCaducar,
  onError,
  onHecho,
}: {
  hold: Hold;
  horasCancelacion: number;
  borrador: Borrador;
  onBorrador: (campo: string, valor: string | boolean) => void;
  onProrroga: (expiraEn: string) => void;
  onCaducar: () => void;
  onError: (e: ErrorApi) => void;
  onHecho: (h: Hecho) => void;
}) {
  const todo = useMessages();
  const r = todo.reservar;
  const m = r.datos;
  const legal = todo.legal;
  const t = useFormat();
  const lp = useLocalePath();
  const locale = useLocale();
  const [enviando, setEnviando] = useState(false);
  const [restante, setRestante] = useState(() => new Date(hold.expiraEn).getTime() - Date.now());
  /** Minutos que se guarda la hora (lo que dura un hold recién hecho o recién alargado). */
  const [minutosHold] = useState(() => Math.max(1, Math.round((new Date(hold.expiraEn).getTime() - Date.now()) / 60_000)));
  const [prorrogando, setProrrogando] = useState(false);
  /** Minutos que dio la última prórroga (null = aún no se ha pedido). */
  const [prorrogada, setProrrogada] = useState<number | null>(null);
  const [telefonoMal, setTelefonoMal] = useState(false);
  const [correoMal, setCorreoMal] = useState(false);
  const telefonoRef = useRef<HTMLInputElement>(null);
  const correoRef = useRef<HTMLInputElement>(null);
  /** Token del CAPTCHA (null si no está configurado o aún no ha contestado). */
  const [turnstile, setTurnstile] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      const ms = new Date(hold.expiraEn).getTime() - Date.now();
      setRestante(ms);
      if (ms <= 0) {
        window.clearInterval(id);
        onCaducar();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [hold.expiraEn, onCaducar]);

  const minutos = Math.max(0, Math.floor(restante / 60_000));
  const segundos = Math.max(0, Math.floor((restante % 60_000) / 1000));
  const avisar = restante > 0 && restante <= AVISO_HOLD_MS;

  const pedirMasTiempo = async () => {
    setProrrogando(true);
    const res = await llamar<{ expiraEn: string }>(`/api/reservar/hold`, { method: "PATCH", body: JSON.stringify({ holdId: hold.holdId }) });
    setProrrogando(false);
    if (res.ok) {
      const ms = new Date(res.datos.expiraEn).getTime() - Date.now();
      onProrroga(res.datos.expiraEn);
      setRestante(ms);
      setProrrogada(Math.max(1, Math.round(ms / 60_000)));
    } else onError(res.error);
  };

  /* Cada cambio del formulario se copia al borrador del asistente (ver `borrador` arriba). */
  const alCambiar = (ev: React.FormEvent<HTMLFormElement>) => {
    const el = ev.target as HTMLInputElement | HTMLTextAreaElement;
    if (!el.name) return;
    onBorrador(el.name, el instanceof HTMLInputElement && el.type === "checkbox" ? el.checked : el.value);
    if (el.name === "telefono") setTelefonoMal(false);
    if (el.name === "email") setCorreoMal(false);
  };
  const texto = (campo: string) => (typeof borrador[campo] === "string" ? (borrador[campo] as string) : undefined);
  const marcada = (campo: string) => borrador[campo] === true;

  const enviar = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    setEnviando(true);
    const res = await llamar<{ cita: { fecha: string; hora: string } | null; urlCita: string }>(`/api/reservar/confirmar`, {
      method: "POST",
      body: JSON.stringify({
        holdId: hold.holdId,
        nombre: String(f.get("nombre") ?? ""),
        telefono: String(f.get("telefono") ?? ""),
        email: String(f.get("email") ?? ""),
        notas: String(f.get("notas") ?? ""),
        condiciones: f.get("condiciones") === "on",
        privacidad: f.get("privacidad") === "on",
        marketing: f.get("marketing") === "on",
        locale,
        turnstile: turnstile ?? undefined,
      }),
    });
    setEnviando(false);
    if (res.ok) {
      onHecho({
        fecha: res.datos.cita?.fecha ?? "",
        hora: res.datos.cita?.hora ?? horaSalon(hold.inicio),
        urlCita: res.datos.urlCita,
        email: String(f.get("email") ?? ""),
      });
    } else {
      // El token del CAPTCHA ya se gastó (vale una vez): uno nuevo para el siguiente intento.
      turnstileRef.current?.reiniciar();
      if (res.error.codigo === "TELEFONO_INVALIDO") {
        setTelefonoMal(true);
        telefonoRef.current?.focus();
      } else if (res.error.codigo === "CORREO_INVALIDO") {
        setCorreoMal(true);
        correoRef.current?.focus();
      }
      onError(res.error);
    }
  };

  /* El texto de ejemplo en `gris` entero (5,6:1): con transparencia no se leía. Se distingue de lo
     tecleado porque esto va en `tinta`, casi negro. */
  const campo = "mt-1.5 block w-full min-h-12 rounded-2xl border border-carmin/20 bg-white px-4 text-[16px] text-tinta placeholder:text-gris focus:border-carmin focus:outline-none focus:ring-2 focus:ring-carmin/20";
  const privacidad = legal.privacy.slug;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5 shadow-[var(--shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-carmin-suave">{r.resumen.title}</p>
        <p className="mt-2 font-display text-xl font-semibold text-tinta">
          {horaSalon(hold.inicio)} – {horaSalon(hold.salida)} · {hold.profesional.nombre}
        </p>
        <p className="mt-1 text-sm text-gris">
          {duracionTexto(hold.duracionMin)} · {formatCents(hold.totalCents)} · {r.resumen.pagoSalon}
        </p>
        <p className="mt-3 text-sm text-gris">{t(m.reservada, { minutos: minutosHold })}</p>
        {/* El reloj NO es una región viva: se leería cada segundo. Lo que se anuncia va abajo. */}
        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-carmin">
          <Clock aria-hidden className="size-4" />
          {t(m.caduca, { tiempo: `${minutos}:${String(segundos).padStart(2, "0")}` })}
        </p>
        {/* Siempre montada (vacía no ocupa): una región viva que aparece a la vez que su texto no
            siempre se anuncia. */}
        <div role="status">
          {avisar && <p className="mt-3 text-sm text-tinta">{t(m.avisoTiempo, { minutos: AVISO_HOLD_MS / 60_000 })}</p>}
          {!avisar && prorrogada !== null && <p className="mt-3 text-sm text-tinta">{t(m.prorrogada, { minutos: prorrogada })}</p>}
        </div>
        {avisar && (
          <Boton variant="secundario" size="sm" className="mt-2" onClick={pedirMasTiempo} disabled={prorrogando}>
            {m.masTiempo}
          </Boton>
        )}
      </div>

      <form onSubmit={enviar} onChange={alCambiar} className="space-y-4">
        <label className="block text-sm font-semibold text-tinta">
          {m.nombre}
          <input name="nombre" required minLength={2} maxLength={80} autoComplete="name" placeholder={m.nombrePh} defaultValue={texto("nombre")} className={campo} />
        </label>
        {/* La ayuda va FUERA de la etiqueta y enlazada con `aria-describedby`: dentro, pasaba a ser
            parte del nombre del campo y el lector la decía dos veces. */}
        <div>
          <label className="block text-sm font-semibold text-tinta">
            {m.telefono}
            <input
              ref={telefonoRef}
              name="telefono"
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={m.telefonoPh}
              defaultValue={texto("telefono")}
              aria-invalid={telefonoMal || undefined}
              aria-describedby="reserva-telefono-ayuda"
              className={cn(campo, telefonoMal && "border-carmin ring-2 ring-carmin/20")}
            />
          </label>
          <p id="reserva-telefono-ayuda" className={cn("mt-1 text-xs", telefonoMal ? "font-semibold text-carmin" : "text-gris")}>
            {telefonoMal ? r.errores.TELEFONO_INVALIDO : m.telefonoHint}
          </p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-tinta">
            {m.email}
            <input
              ref={correoRef}
              name="email"
              required
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={m.emailPh}
              defaultValue={texto("email")}
              aria-invalid={correoMal || undefined}
              aria-describedby="reserva-email-ayuda"
              className={cn(campo, correoMal && "border-carmin ring-2 ring-carmin/20")}
            />
          </label>
          <p id="reserva-email-ayuda" className={cn("mt-1 text-xs", correoMal ? "font-semibold text-carmin" : "text-gris")}>
            {correoMal ? r.errores.CORREO_INVALIDO : m.emailHint}
          </p>
        </div>
        <label className="block text-sm font-semibold text-tinta">
          {m.notas}
          <textarea name="notas" maxLength={500} rows={3} placeholder={m.notasPh} defaultValue={texto("notas")} className={cn(campo, "py-3")} />
        </label>

        <div className="space-y-3 pt-1 text-sm text-tinta">
          <label className="flex items-start gap-3">
            <input name="condiciones" type="checkbox" required defaultChecked={marcada("condiciones")} className="mt-0.5 size-5 shrink-0 accent-[#8e0e33]" />
            <span>{t(m.condiciones, { horas: horasCancelacion })}</span>
          </label>
          <label className="flex items-start gap-3">
            <input name="privacidad" type="checkbox" required defaultChecked={marcada("privacidad")} className="mt-0.5 size-5 shrink-0 accent-[#8e0e33]" />
            <span>
              {m.privacidad}{" "}
              <Link href={lp(`/legal/${privacidad}`)} target="_blank" className="font-semibold text-carmin underline underline-offset-2">
                {m.privacidadLink}
                <span className="sr-only"> ({todo.common.misc.newTab})</span>
              </Link>
            </span>
          </label>
          <label className="flex items-start gap-3 text-gris">
            <input name="marketing" type="checkbox" defaultChecked={marcada("marketing")} className="mt-0.5 size-5 shrink-0 accent-[#8e0e33]" />
            <span>{m.marketing}</span>
          </label>
        </div>

        <Turnstile ref={turnstileRef} onToken={setTurnstile} idioma={locale} />

        <Boton type="submit" size="lg" className="w-full" disabled={enviando}>
          {enviando ? m.confirmando : m.confirmar}
        </Boton>
      </form>
    </div>
  );
}
