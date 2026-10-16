import "server-only";

import { getAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";

/**
 * Ajustes del negocio (tabla `settings`), con los valores por defecto de seed.sql por si falta
 * alguna clave. Se leen frescos en cada petición: es una consulta de una fila por clave y así un
 * cambio desde el panel vale al momento.
 */
export interface Ajustes {
  timezone: string;
  horizonDays: number;
  minLeadMinutes: number;
  slotStepMin: number;
  holdMinutes: number;
  cancelHours: number;
  reminderHourLocal: string;
  voucherExpiryWarningDays: number;
  salonHours: Record<string, { open: string; close: string }[]>;
  notices: { id: string; text: string; from?: string; to?: string }[];
}

const POR_DEFECTO: Ajustes = {
  timezone: "Europe/Madrid",
  horizonDays: 45,
  minLeadMinutes: 120,
  slotStepMin: 15,
  holdMinutes: 10,
  cancelHours: 24,
  reminderHourLocal: "10:00",
  voucherExpiryWarningDays: 30,
  salonHours: {},
  notices: [],
};

function entero(v: Json | undefined, def: number): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string" && /^\d+$/.test(v)) return Number(v);
  return def;
}

function texto(v: Json | undefined, def: string): string {
  return typeof v === "string" && v.trim() !== "" ? v : def;
}

export async function getAjustes(): Promise<Ajustes> {
  const db = getAdminClient();
  const { data, error } = await db.from("settings").select("key, value");
  if (error) throw new Error(`No se pudieron leer los ajustes: ${error.message}`);

  const mapa = new Map<string, Json>();
  for (const fila of data ?? []) mapa.set(fila.key, fila.value);

  const salonHours = mapa.get("salon_hours");
  const notices = mapa.get("notices");

  return {
    timezone: texto(mapa.get("timezone"), POR_DEFECTO.timezone),
    horizonDays: entero(mapa.get("horizon_days"), POR_DEFECTO.horizonDays),
    minLeadMinutes: entero(mapa.get("min_lead_minutes"), POR_DEFECTO.minLeadMinutes),
    slotStepMin: entero(mapa.get("slot_step_min"), POR_DEFECTO.slotStepMin),
    holdMinutes: entero(mapa.get("hold_minutes"), POR_DEFECTO.holdMinutes),
    cancelHours: entero(mapa.get("cancel_hours"), POR_DEFECTO.cancelHours),
    reminderHourLocal: texto(mapa.get("reminder_hour_local"), POR_DEFECTO.reminderHourLocal),
    voucherExpiryWarningDays: entero(mapa.get("voucher_expiry_warning_days"), POR_DEFECTO.voucherExpiryWarningDays),
    salonHours:
      salonHours && typeof salonHours === "object" && !Array.isArray(salonHours)
        ? (salonHours as Ajustes["salonHours"])
        : POR_DEFECTO.salonHours,
    notices: Array.isArray(notices) ? (notices as Ajustes["notices"]) : POR_DEFECTO.notices,
  };
}
