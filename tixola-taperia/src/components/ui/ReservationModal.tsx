"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { CalendarDays, Clock, MessageCircle, Phone, Send, Users, X } from "lucide-react";
import { BUSINESS } from "@/data/business";
import NeonButton from "@/components/ui/NeonButton";
import { useInertBackground } from "@/hooks/useInertBackground";
import { getOpenStatus } from "@/lib/openStatus";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Constantes y utilidades
   ────────────────────────────────────────────────────────────── */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const MAX_PEOPLE = 12;
const PEOPLE_OPTIONS = Array.from({ length: MAX_PEOPLE }, (_, i) => i + 1);

/** Base de wa.me sin texto prefijado (BUSINESS.phone.whatsapp ya incluye un mensaje genérico). */
const WHATSAPP_BASE = `https://wa.me/${BUSINESS.phone.e164.replace(/\D/g, "")}`;

type FieldName = "nombre" | "telefono" | "personas" | "fecha" | "hora" | "comentarios";
type Errors = Partial<Record<FieldName, string>>;

/** "2026-09-25" → "viernes 25 de septiembre" (formateo local es-ES). */
function formatDateEs(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}

/** Fecha de hoy en formato ISO (YYYY-MM-DD) en hora local del dispositivo. */
function todayIso() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${mm}-${dd}`;
}

/** Mensaje amable a partir del estado de validación nativo de cada campo. */
function messageFor(name: FieldName, el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string | undefined {
  const v = el.validity;
  if (v.valid) return undefined;
  switch (name) {
    case "nombre":
      return v.valueMissing ? "Dinos tu nombre para la reserva." : "Escribe al menos 2 letras.";
    case "telefono":
      return v.valueMissing ? "Necesitamos un teléfono para confirmarte." : "Revisa el número: 9 dígitos (o con prefijo +34).";
    case "personas":
      return `Indica cuántas personas venís (1 a ${MAX_PEOPLE}).`;
    case "fecha":
      return v.valueMissing ? "Elige el día." : "La fecha no puede ser anterior a hoy.";
    case "hora":
      return "Indica una hora aproximada.";
    case "comentarios":
      return "Máximo 300 caracteres.";
  }
}

/* Estado de apertura: solo en cliente (evita desajustes de hidratación) y refrescado cada minuto. */
function subscribeMinute(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
}
const getOpenDetail = () => {
  const s = getOpenStatus();
  return `${s.isOpen ? "Abierto ahora" : "Ahora cerrado"} · ${s.detail}`;
};
const getServerDetail = () => "";

/* ──────────────────────────────────────────────────────────────
   Campos del formulario
   ────────────────────────────────────────────────────────────── */

const fieldClass =
  "peer w-full rounded-xl border border-cream/15 bg-iron/60 px-3.5 py-3 font-sans text-[15px] text-cream placeholder:text-cream/30 transition-colors focus:border-pimenton-light focus:outline-none focus:ring-2 focus:ring-pimenton-light/40 aria-[invalid=true]:border-pimenton-light aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-pimenton/40 [color-scheme:dark]";
const labelClass = "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-cream-faint";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-pimenton-light">
      {message}
    </p>
  );
}

/* ──────────────────────────────────────────────────────────────
   Modal
   ────────────────────────────────────────────────────────────── */

interface ReservationModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal "Reserva tu mesa": llamada directa, WhatsApp y un formulario compacto que compone un
 * mensaje de WhatsApp prellenado (sin backend). Diálogo accesible: role=dialog + aria-modal,
 * foco movido al panel, trampa de foco, Escape / clic fuera cierran, scroll del body bloqueado.
 * En móvil es una hoja inferior; en escritorio, panel centrado.
 */
export default function ReservationModal({ open, onClose }: ReservationModalProps) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const fieldId = (name: FieldName) => `${uid}-${name}`;

  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [waLink, setWaLink] = useState<string | null>(null);

  const openDetail = useSyncExternalStore(subscribeMinute, getOpenDetail, getServerDetail);

  /* El resto de la página (main, Navbar, Footer, MobileStickyBar…) sale del árbol de
     accesibilidad mientras el diálogo está abierto — no basta con bloquear el scroll. */
  useInertBackground(open, [overlayRef]);

  /* Bloqueo de scroll + Escape + foco al panel + fecha mínima; devolución del foco al cerrar. */
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    if (dateRef.current) dateRef.current.min = todayIso();
    const timer = window.setTimeout(() => panelRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  /* Trampa de foco dentro del panel. */
  const trapFocus = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  /* Validación por campo al salir de él (blur) — errores amables en línea. */
  const validateField = useCallback((e: FormEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const name = el.name as FieldName;
    const message = messageFor(name, el);
    setErrors((prev) => (prev[name] === message ? prev : { ...prev, [name]: message }));
  }, []);

  /* Envío: validamos con la API nativa y abrimos WhatsApp con el mensaje compuesto. */
  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const nextErrors: Errors = {};
    const names: FieldName[] = ["nombre", "telefono", "personas", "fecha", "hora", "comentarios"];
    let firstInvalid: HTMLElement | null = null;
    for (const name of names) {
      const el = form.elements.namedItem(name);
      if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)) continue;
      const message = messageFor(name, el);
      if (message) {
        nextErrors[name] = message;
        if (!firstInvalid) firstInvalid = el;
      }
    }
    setErrors(nextErrors);
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const data = new FormData(form);
    const nombre = String(data.get("nombre") ?? "").trim();
    const telefono = String(data.get("telefono") ?? "").trim();
    const personas = String(data.get("personas") ?? "2");
    const fecha = String(data.get("fecha") ?? "");
    const hora = String(data.get("hora") ?? "");
    const comentarios = String(data.get("comentarios") ?? "").trim();

    const lines = [
      `Hola, soy ${nombre}. Quiero reservar mesa en Tixola Tapería.`,
      `👥 ${personas} ${Number(personas) === 1 ? "persona" : "personas"}`,
      `📅 ${formatDateEs(fecha)} a las ${hora}`,
      `📞 ${telefono}`,
    ];
    if (comentarios) lines.push(`📝 ${comentarios}`);
    lines.push("¿Me confirmáis? ¡Gracias!");

    const url = `${WHATSAPP_BASE}?text=${encodeURIComponent(lines.join("\n"))}`;
    setWaLink(url);
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && (
          <motion.div
            key="reserva-overlay"
            ref={overlayRef}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
          >
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descId}
              tabIndex={-1}
              onKeyDown={trapFocus}
              initial={{ opacity: 0, y: 48, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.98, transition: { duration: 0.22 } }}
              transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
              className={cn(
                "glass-smoke noise after:noise-after relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl outline-none sm:max-w-lg sm:rounded-3xl",
                "shadow-card",
              )}
            >
              {/* Brasa superior */}
              <span aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-48 w-80 -translate-x-1/2 rounded-full bg-pimenton/35 blur-3xl" />
              {/* Asa (móvil) */}
              <span aria-hidden className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-cream/20 sm:hidden" />

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full text-cream-muted transition-colors hover:bg-cream/10 hover:text-cream"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>

              <div className="relative overflow-y-auto px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-8 sm:pb-8 sm:pt-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-pimenton-light">Reservas</p>
                <h2 id={titleId} className="mt-2 font-display text-3xl leading-tight text-cream sm:text-4xl">
                  Reserva tu <em className="text-gradient-ember italic">mesa</em>
                </h2>
                <p id={descId} className="mt-2 text-sm text-cream-muted sm:text-[15px]">
                  Te atendemos al momento por teléfono o WhatsApp.
                </p>

                {/* Acciones directas */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <NeonButton href={BUSINESS.phone.tel} size="md" pulse icon={<Phone aria-hidden />} className="w-full">
                    Llamar al {BUSINESS.phone.display}
                  </NeonButton>
                  <NeonButton
                    href={BUSINESS.phone.whatsapp}
                    target="_blank"
                    variant="outline"
                    size="md"
                    icon={<MessageCircle aria-hidden />}
                    className="w-full border-[#25D366]/50 hover:border-[#25D366] hover:bg-[#25D366]/10"
                  >
                    WhatsApp
                  </NeonButton>
                </div>

                {/* Estado de apertura + nota de grupos */}
                <div className="mt-4 flex flex-col gap-1.5 rounded-xl border border-cream/10 bg-iron/40 px-3.5 py-3 text-xs text-cream-muted">
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
                    <span aria-live="polite">{openDetail || "Consultando horario…"}</span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
                    <span>
                      Grupos grandes (más de {Math.floor(MAX_PEOPLE / 2)}): <a href={BUSINESS.phone.tel} className="font-semibold text-cream underline-offset-2 hover:underline">llámanos</a>.
                    </span>
                  </span>
                </div>

                {/* Separador */}
                <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-cream-faint">
                  <span className="divider-iron flex-1" />
                  o déjanos los datos
                  <span className="divider-iron flex-1" />
                </div>

                {/* Formulario → WhatsApp prellenado */}
                <form noValidate onSubmit={onSubmit} className="grid grid-cols-2 gap-x-3 gap-y-4">
                  <div className="col-span-2">
                    <label htmlFor={fieldId("nombre")} className={labelClass}>
                      Nombre
                    </label>
                    <input
                      id={fieldId("nombre")}
                      name="nombre"
                      type="text"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={60}
                      placeholder="¿A nombre de quién?"
                      aria-invalid={Boolean(errors.nombre)}
                      aria-describedby={errors.nombre ? `${fieldId("nombre")}-error` : undefined}
                      onBlur={validateField}
                      className={fieldClass}
                    />
                    <FieldError id={`${fieldId("nombre")}-error`} message={errors.nombre} />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor={fieldId("telefono")} className={labelClass}>
                      Teléfono
                    </label>
                    <input
                      id={fieldId("telefono")}
                      name="telefono"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      pattern="^\+?[0-9][0-9 ]{7,15}$"
                      placeholder="6XX XX XX XX"
                      aria-invalid={Boolean(errors.telefono)}
                      aria-describedby={errors.telefono ? `${fieldId("telefono")}-error` : undefined}
                      onBlur={validateField}
                      className={fieldClass}
                    />
                    <FieldError id={`${fieldId("telefono")}-error`} message={errors.telefono} />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor={fieldId("personas")} className={labelClass}>
                      Personas
                    </label>
                    <div className="relative">
                      <Users className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cream-faint" aria-hidden />
                      <select
                        id={fieldId("personas")}
                        name="personas"
                        required
                        defaultValue="2"
                        aria-invalid={Boolean(errors.personas)}
                        aria-describedby={errors.personas ? `${fieldId("personas")}-error` : undefined}
                        onBlur={validateField}
                        className={cn(fieldClass, "appearance-none pl-10")}
                      >
                        {PEOPLE_OPTIONS.map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? "persona" : "personas"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <FieldError id={`${fieldId("personas")}-error`} message={errors.personas} />
                  </div>

                  <div>
                    <label htmlFor={fieldId("fecha")} className={labelClass}>
                      Fecha
                    </label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cream-faint" aria-hidden />
                      <input
                        ref={dateRef}
                        id={fieldId("fecha")}
                        name="fecha"
                        type="date"
                        required
                        aria-invalid={Boolean(errors.fecha)}
                        aria-describedby={errors.fecha ? `${fieldId("fecha")}-error` : undefined}
                        onBlur={validateField}
                        className={cn(fieldClass, "pl-10")}
                      />
                    </div>
                    <FieldError id={`${fieldId("fecha")}-error`} message={errors.fecha} />
                  </div>

                  <div>
                    <label htmlFor={fieldId("hora")} className={labelClass}>
                      Hora
                    </label>
                    <div className="relative">
                      <Clock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cream-faint" aria-hidden />
                      <input
                        id={fieldId("hora")}
                        name="hora"
                        type="time"
                        required
                        step={900}
                        aria-invalid={Boolean(errors.hora)}
                        aria-describedby={errors.hora ? `${fieldId("hora")}-error` : undefined}
                        onBlur={validateField}
                        className={cn(fieldClass, "pl-10")}
                      />
                    </div>
                    <FieldError id={`${fieldId("hora")}-error`} message={errors.hora} />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor={fieldId("comentarios")} className={labelClass}>
                      Comentarios <span className="normal-case tracking-normal text-cream/30">(opcional)</span>
                    </label>
                    <textarea
                      id={fieldId("comentarios")}
                      name="comentarios"
                      rows={2}
                      maxLength={300}
                      placeholder="Terraza, alergias, celebración…"
                      aria-invalid={Boolean(errors.comentarios)}
                      aria-describedby={errors.comentarios ? `${fieldId("comentarios")}-error` : undefined}
                      onBlur={validateField}
                      className={cn(fieldClass, "resize-none")}
                    />
                    <FieldError id={`${fieldId("comentarios")}-error`} message={errors.comentarios} />
                  </div>

                  <div className="col-span-2 mt-1">
                    <NeonButton type="submit" size="lg" variant="cream" iconRight={<Send aria-hidden />} className="w-full">
                      Enviar por WhatsApp
                    </NeonButton>
                    {waLink && (
                      <p className="mt-3 text-center text-xs text-cream-muted" role="status">
                        Hemos abierto WhatsApp con tu mensaje.{" "}
                        <a href={waLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-cream underline underline-offset-2">
                          Si no se ha abierto, pulsa aquí
                        </a>
                        .
                      </p>
                    )}
                    <p className="mt-3 text-center text-[11px] leading-relaxed text-cream/40">
                      No guardamos tus datos: el mensaje se envía desde tu WhatsApp y os confirmamos por ahí.
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
