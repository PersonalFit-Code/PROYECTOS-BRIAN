"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { CalendarDays, Clock, Phone, Send, Users, X } from "lucide-react";
import { BUSINESS, type DayKey, type TimeRange } from "@/data/business";
import NeonButton from "@/components/ui/NeonButton";
import { WhatsAppGlyph } from "@/components/ui/FloatingWhatsApp";
import { useInertBackground } from "@/hooks/useInertBackground";
import { LOCALE_META } from "@/i18n/config";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import type { Messages } from "@/i18n/types";
import { getOpenStatus } from "@/lib/openStatus";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Estado de apertura localizado (compartido con Footer)
   ────────────────────────────────────────────────────────────── */

const DAY_ORDER: readonly DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const HOURS = BUSINESS.hours as Record<DayKey, TimeRange[]>;

type NextKind = "closes" | "today" | "tomorrow" | "day" | "none";

export interface LocalizedOpenStatus {
  isOpen: boolean;
  closingSoon: boolean;
  /** "Abierto ahora" · "Cierra pronto" · "Abre en 25 min" · "Cerrado ahora" */
  label: string;
  /** "Cierra a las 16:00" · "Abre mañana a las 12:00" · "Consulta horarios" */
  detail: string;
  todayKey: DayKey;
}

/** Próximo día (a partir de mañana) con horario; `offset` en días. */
function nextOpenDay(todayKey: DayKey): { key: DayKey; offset: number } | null {
  const idx = DAY_ORDER.indexOf(todayKey);
  for (let i = 1; i <= 7; i++) {
    const key = DAY_ORDER[(idx + i) % 7];
    if (HOURS[key].length) return { key, offset: i };
  }
  return null;
}

/**
 * Instantánea serializada del estado de apertura (useSyncExternalStore compara por identidad;
 * un string es estable entre llamadas). Formato: isOpen|closingSoon|todayKey|time|kind|day|minutes
 * `getOpenStatus()` es determinista a partir de BUSINESS.hours; la hora HH:MM se toma de su detalle.
 */
function readSnapshot(): string {
  const s = getOpenStatus();
  const time = /(\d{1,2}:\d{2})/.exec(s.detail)?.[1] ?? "";
  let kind: NextKind = "none";
  let day = "";
  let minutes = "";
  if (s.isOpen) {
    kind = "closes";
  } else if (s.minutesToChange !== null) {
    kind = "today";
    minutes = String(s.minutesToChange);
  } else {
    const next = nextOpenDay(s.todayKey);
    if (next) {
      kind = next.offset === 1 ? "tomorrow" : "day";
      day = next.key;
    }
  }
  const closingSoon = s.isOpen && s.minutesToChange !== null && s.minutesToChange <= 30;
  return [s.isOpen ? 1 : 0, closingSoon ? 1 : 0, s.todayKey, time, kind, day, minutes].join("|");
}

function subscribeMinute(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  const onVisibility = () => {
    if (document.visibilityState === "visible") onChange();
  };
  document.addEventListener("visibilitychange", onVisibility);
  return () => {
    window.clearInterval(id);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
const getServerSnapshot = () => "";

/** Traduce la instantánea a textos de `m.common.status` / `m.common.days`. */
function localizeSnapshot(snapshot: string, c: Messages["common"], t: (tpl: string, vars?: Record<string, string | number>) => string): LocalizedOpenStatus | null {
  if (!snapshot) return null;
  const [open, soon, todayKey, time, kind, day, minutes] = snapshot.split("|");
  const isOpen = open === "1";
  const closingSoon = soon === "1";
  let label: string;
  let detail: string;
  if (isOpen) {
    label = closingSoon ? c.status.closingSoon : c.status.openNow;
    detail = time ? t(c.status.closesAt, { time }) : "";
  } else if (kind === "today") {
    const wait = Number(minutes);
    label = wait <= 60 ? t(c.status.opensIn, { minutes: wait }) : c.status.closedNow;
    detail = time ? t(c.status.opensTodayAt, { time }) : c.status.checkHours;
  } else if (kind === "tomorrow") {
    label = c.status.closedNow;
    detail = time ? t(c.status.opensTomorrowAt, { time }) : c.status.checkHours;
  } else if (kind === "day") {
    label = c.status.closedNow;
    const dayLabel = c.days[day as DayKey]?.toLocaleLowerCase() ?? day;
    detail = time ? t(c.status.opensOnAt, { day: dayLabel, time }) : c.status.checkHours;
  } else {
    label = c.status.closed;
    detail = c.status.checkHours;
  }
  return { isOpen, closingSoon, label, detail, todayKey: todayKey as DayKey };
}

/**
 * Estado de apertura en el idioma activo, calculado solo en cliente (sin desajustes de
 * hidratación) y refrescado cada minuto y al volver a la pestaña. `null` hasta hidratar.
 */
export function useLocalizedOpenStatus(): LocalizedOpenStatus | null {
  const m = useMessages();
  const t = useFormat();
  const snapshot = useSyncExternalStore(subscribeMinute, readSnapshot, getServerSnapshot);
  return useMemo(() => localizeSnapshot(snapshot, m.common, t), [snapshot, m, t]);
}

/* ──────────────────────────────────────────────────────────────
   Constantes y utilidades del formulario
   ────────────────────────────────────────────────────────────── */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const MAX_PEOPLE = 12;
const MAX_COMMENT = 300;
const PEOPLE_OPTIONS = Array.from({ length: MAX_PEOPLE }, (_, i) => i + 1);

/** Base de wa.me sin texto prefijado (BUSINESS.phone.whatsapp ya incluye un mensaje genérico). */
const WHATSAPP_BASE = `https://wa.me/${BUSINESS.phone.e164.replace(/\D/g, "")}`;

type FieldName = "nombre" | "telefono" | "personas" | "fecha" | "hora" | "comentarios";
type Errors = Partial<Record<FieldName, string>>;
type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/** "2026-09-25" → "viernes, 25 de septiembre" (formato largo del idioma activo). */
function formatDate(iso: string, intl: string) {
  const [y, mo, d] = iso.split("-").map(Number);
  if (!y || !mo || !d) return iso;
  return new Date(y, mo - 1, d).toLocaleDateString(intl, { weekday: "long", day: "numeric", month: "long" });
}

/** Fecha de hoy en formato ISO (YYYY-MM-DD) en hora local del dispositivo. */
function todayIso() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${mm}-${dd}`;
}

/** Mensaje amable a partir del estado de validación nativo de cada campo. */
function messageFor(
  name: FieldName,
  el: FormElement,
  errors: Messages["common"]["reservation"]["errors"],
  t: (tpl: string, vars?: Record<string, string | number>) => string,
): string | undefined {
  const v = el.validity;
  if (v.valid) return undefined;
  switch (name) {
    case "nombre":
      return v.valueMissing ? errors.nameRequired : errors.nameShort;
    case "telefono":
      return v.valueMissing ? errors.phoneRequired : errors.phoneInvalid;
    case "personas":
      return t(errors.people, { max: MAX_PEOPLE });
    case "fecha":
      return v.valueMissing ? errors.dateRequired : errors.datePast;
    case "hora":
      return errors.time;
    case "comentarios":
      return t(errors.comments, { max: MAX_COMMENT });
  }
}

/* ──────────────────────────────────────────────────────────────
   Campos del formulario
   ────────────────────────────────────────────────────────────── */

const fieldClass =
  "peer w-full rounded-xl border border-cream/15 bg-iron/60 px-3.5 py-3 font-sans text-[15px] text-cream placeholder:text-cream/30 transition-colors focus:border-pimenton-light focus:outline-none focus:ring-2 focus:ring-pimenton-light/40 aria-[invalid=true]:border-pimenton-light aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-pimenton/40 [color-scheme:dark]";
const labelClass = "mb-1.5 block font-caps text-[10px] uppercase tracking-[0.22em] text-cream-faint";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-pimenton-a11y">
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
 * En móvil es una hoja inferior; en escritorio, panel centrado. Todo el texto sale de m.common.reservation.
 */
export default function ReservationModal({ open, onClose }: ReservationModalProps) {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();
  const r = m.common.reservation;

  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const fieldId = (name: FieldName) => `${uid}-${name}`;

  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [waLink, setWaLink] = useState<string | null>(null);

  const status = useLocalizedOpenStatus();
  const openDetail = status ? `${status.label}${status.detail ? ` · ${status.detail}` : ""}` : m.common.status.checking;

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
  const validateField = useCallback(
    (e: FormEvent<FormElement>) => {
      const el = e.currentTarget;
      const name = el.name as FieldName;
      const message = messageFor(name, el, r.errors, t);
      setErrors((prev) => (prev[name] === message ? prev : { ...prev, [name]: message }));
    },
    [r.errors, t],
  );

  /* Envío: validamos con la API nativa y abrimos WhatsApp con el mensaje compuesto. */
  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const nextErrors: Errors = {};
      const names: FieldName[] = ["nombre", "telefono", "personas", "fecha", "hora", "comentarios"];
      let firstInvalid: HTMLElement | null = null;
      for (const name of names) {
        const el = form.elements.namedItem(name);
        if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)) continue;
        const message = messageFor(name, el, r.errors, t);
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
      const personas = Number(data.get("personas") ?? 2);
      const fecha = String(data.get("fecha") ?? "");
      const hora = String(data.get("hora") ?? "");
      const comentarios = String(data.get("comentarios") ?? "").trim();

      const lines = [
        t(r.message.intro, { name: nombre, brand: m.common.brand }),
        t(r.message.people, { count: personas, unit: personas === 1 ? r.person : r.people }),
        t(r.message.when, { date: formatDate(fecha, LOCALE_META[locale].intl), time: hora }),
        t(r.message.phone, { phone: telefono }),
      ];
      if (comentarios) lines.push(t(r.message.notes, { notes: comentarios }));
      lines.push(r.message.outro);

      const url = `${WHATSAPP_BASE}?text=${encodeURIComponent(lines.join("\n"))}`;
      setWaLink(url);
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [locale, m.common.brand, r, t],
  );

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
                aria-label={m.common.misc.close}
                className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full text-cream-muted transition-colors hover:bg-cream/10 hover:text-cream"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>

              <div className="relative overflow-y-auto px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-8 sm:pb-8 sm:pt-8">
                <p className="font-caps text-[10px] uppercase tracking-[0.35em] text-pimenton-a11y">{r.kicker}</p>
                <h2 id={titleId} className="mt-2 font-display text-4xl leading-[0.95] tracking-[-0.01em] text-cream sm:text-5xl">
                  {r.title} <em className="text-gradient-ember italic">{r.accent}</em>
                </h2>
                <p id={descId} className="mt-3 text-sm text-cream-muted sm:text-[15px]">
                  {r.description}
                </p>

                {/* Acciones directas */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <NeonButton href={BUSINESS.phone.tel} size="md" pulse icon={<Phone aria-hidden />} className="w-full">
                    {t(m.common.cta.callNumber, { phone: BUSINESS.phone.display })}
                  </NeonButton>
                  <NeonButton
                    href={BUSINESS.phone.whatsapp}
                    target="_blank"
                    variant="outline"
                    size="md"
                    icon={<WhatsAppGlyph className="h-5 w-5" />}
                    className="w-full border-[#25D366]/50 hover:border-[#25D366] hover:bg-[#25D366]/10"
                  >
                    {m.common.cta.whatsapp}
                  </NeonButton>
                </div>

                {/* Estado de apertura + nota de grupos */}
                <div className="mt-4 flex flex-col gap-1.5 rounded-xl border border-cream/10 bg-iron/40 px-3.5 py-3 text-xs text-cream-muted">
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
                    <span aria-live="polite">{openDetail}</span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
                    <span>
                      {t(r.groups, { max: Math.floor(MAX_PEOPLE / 2) })}{" "}
                      <a href={BUSINESS.phone.tel} className="font-semibold text-cream underline-offset-2 hover:underline">
                        {r.groupsCall}
                      </a>
                      .
                    </span>
                  </span>
                </div>

                {/* Separador */}
                <div className="my-6 flex items-center gap-3 font-caps text-[10px] uppercase tracking-[0.25em] text-cream-faint">
                  <span className="divider-iron flex-1" />
                  {r.divider}
                  <span className="divider-iron flex-1" />
                </div>

                {/* Formulario → WhatsApp prellenado */}
                <form noValidate onSubmit={onSubmit} className="grid grid-cols-2 gap-x-3 gap-y-4">
                  <div className="col-span-2">
                    <label htmlFor={fieldId("nombre")} className={labelClass}>
                      {r.fields.name}
                    </label>
                    <input
                      id={fieldId("nombre")}
                      name="nombre"
                      type="text"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={60}
                      placeholder={r.placeholders.name}
                      aria-invalid={Boolean(errors.nombre)}
                      aria-describedby={errors.nombre ? `${fieldId("nombre")}-error` : undefined}
                      onBlur={validateField}
                      className={fieldClass}
                    />
                    <FieldError id={`${fieldId("nombre")}-error`} message={errors.nombre} />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor={fieldId("telefono")} className={labelClass}>
                      {r.fields.phone}
                    </label>
                    <input
                      id={fieldId("telefono")}
                      name="telefono"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      pattern="^\+?[0-9][0-9 ]{7,15}$"
                      placeholder={r.placeholders.phone}
                      aria-invalid={Boolean(errors.telefono)}
                      aria-describedby={errors.telefono ? `${fieldId("telefono")}-error` : undefined}
                      onBlur={validateField}
                      className={fieldClass}
                    />
                    <FieldError id={`${fieldId("telefono")}-error`} message={errors.telefono} />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor={fieldId("personas")} className={labelClass}>
                      {r.fields.people}
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
                            {n} {n === 1 ? r.person : r.people}
                          </option>
                        ))}
                      </select>
                    </div>
                    <FieldError id={`${fieldId("personas")}-error`} message={errors.personas} />
                  </div>

                  <div>
                    <label htmlFor={fieldId("fecha")} className={labelClass}>
                      {r.fields.date}
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
                      {r.fields.time}
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
                      {r.fields.comments} <span className="normal-case tracking-normal text-cream/30">({m.common.misc.optional})</span>
                    </label>
                    <textarea
                      id={fieldId("comentarios")}
                      name="comentarios"
                      rows={2}
                      maxLength={MAX_COMMENT}
                      placeholder={r.placeholders.comments}
                      aria-invalid={Boolean(errors.comentarios)}
                      aria-describedby={errors.comentarios ? `${fieldId("comentarios")}-error` : undefined}
                      onBlur={validateField}
                      className={cn(fieldClass, "resize-none")}
                    />
                    <FieldError id={`${fieldId("comentarios")}-error`} message={errors.comentarios} />
                  </div>

                  <div className="col-span-2 mt-1">
                    <NeonButton type="submit" size="lg" variant="cream" iconRight={<Send aria-hidden />} className="w-full">
                      {r.submit}
                    </NeonButton>
                    {waLink && (
                      <p className="mt-3 text-center text-xs text-cream-muted" role="status">
                        {r.opened}{" "}
                        <a href={waLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-cream underline underline-offset-2">
                          {r.openedFallback}
                        </a>
                        .
                      </p>
                    )}
                    <p className="mt-3 text-center text-[11px] leading-relaxed text-cream/40">{r.privacy}</p>
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
