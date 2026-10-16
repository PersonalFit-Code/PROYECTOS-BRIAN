import { formatearEuros } from "@/lib/money";
import type { VoucherKind, VoucherStatus } from "@/lib/supabase/types";
import { normalizarCodigoBono } from "@/lib/vouchers/code";

/**
 * Lo que comparten las pantallas de bonos del panel y el cobro de una cita con bono. Es un módulo
 * normal (ni "use client" ni "use server") a propósito: lo importan componentes de cliente, páginas
 * de servidor y acciones, y dentro de un fichero con directiva dejaría de ser un objeto corriente.
 */

export const ESTADO_BONO: Record<VoucherStatus, string> = {
  active: "Activo",
  used: "Gastado",
  expired: "Caducado",
  refunded: "Devuelto",
  void: "Anulado",
};

/** Activo en rosa; todo lo que ya no se puede usar, en gris, para que se vea de un vistazo. */
export const CLASE_ESTADO: Record<VoucherStatus, string> = {
  active: "bg-rosa-niebla text-carmin",
  used: "bg-zinc-100 text-zinc-700",
  expired: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  refunded: "bg-zinc-100 text-zinc-700",
  void: "bg-zinc-100 text-zinc-700",
};

/**
 * Los `raise exception` de `redeem_voucher` y `complete_booking_with_voucher`, en castellano de
 * mostrador. Viven aquí y no en cada acción para que canjear desde la ficha del bono y cobrar una
 * cita con bono digan exactamente lo mismo ante el mismo problema.
 */
export const ERRORES_BONO: Record<string, string> = {
  BONO_NO_EXISTE: "Ese código no existe.",
  BONO_NO_ACTIVO: "Ese bono ya está gastado, devuelto o anulado.",
  BONO_CADUCADO: "Ese bono ha caducado.",
  BONO_SIN_SESIONES: "A ese bono no le quedan sesiones.",
  BONO_SIN_SALDO: "A esa tarjeta regalo no le queda saldo suficiente.",
  IMPORTE_INVALIDO: "El importe no es válido.",
  SESIONES_INVALIDAS: "El número de sesiones no es válido.",
};

/**
 * Lo que dio la cámara (o lo que alguien pegó) → código canónico, o null si no es un bono.
 * El QR lleva la URL entera de la página del bono (`…/es/bono/AS-XXXX-XXXX?t=…`) para que la
 * clienta pueda abrirlo con su móvil; aquí solo interesa el código. Si no hay URL, se prueba el
 * texto tal cual: un QR impreso a mano o un código copiado de un correo también valen.
 */
export function codigoDeLectura(texto: string): string | null {
  const t = texto.trim();
  const enUrl = /\/bono\/([A-Z0-9-]+)/i.exec(t);
  return normalizarCodigoBono(enUrl ? enUrl[1]! : t);
}

/**
 * Estado que hay que enseñar: un bono con fecha pasada sigue en `active` hasta que alguien intenta
 * usarlo (es `redeem_voucher` quien lo marca), pero en el mostrador ya es un bono caducado.
 */
export function estadoVisible(status: VoucherStatus, expiresAt: string | null, ahora: Date): VoucherStatus {
  if (status === "active" && expiresAt && new Date(expiresAt) < ahora) return "expired";
  return status;
}

interface Saldo {
  kind: VoucherKind;
  sessions_left: number | null;
  sessions_total: number | null;
  balance_cents: number | null;
  value_cents: number | null;
}

/** "Quedan 3 de 5 sesiones" · "Queda 1 de 5 sesiones" · "Saldo 32,50 € de 50 €". */
export function queQueda(b: Saldo): string {
  if (b.kind === "sessions") {
    const quedan = b.sessions_left ?? 0;
    const total = b.sessions_total ?? 0;
    return `${quedan === 1 ? "Queda" : "Quedan"} ${quedan} de ${total} ${total === 1 ? "sesión" : "sesiones"}`;
  }
  return `Saldo ${formatearEuros(b.balance_cents ?? 0)} de ${formatearEuros(b.value_cents ?? 0)}`;
}

/** Lo que devuelve `consultarBono`: lo justo para el cobro de una cita, sin datos de la compradora. */
export interface ResumenBono {
  code: string;
  nombre: string;
  kind: VoucherKind;
  estado: VoucherStatus;
  /** Se puede canjear ahora mismo (activo, sin caducar y con algo dentro). */
  usable: boolean;
  queda: string;
  caducidad: string;
  balanceCents: number | null;
  paraQuien: string | null;
}
