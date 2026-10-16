#!/usr/bin/env node
/**
 * Supabase FALSO para revisar la interfaz sin tener el proyecto de Supabase creado.
 *
 * Imita lo justo de PostgREST (/rest/v1) y de Auth (/auth/v1) para que la reserva y el panel se
 * pinten con datos de ejemplo: lecturas con filtros simples, relaciones embebidas, inserciones,
 * cambios, borrados y las funciones `rpc` que usa la app (con una lógica mínima, sin la restricción
 * de exclusión ni RLS). NO sirve para probar reglas de la base: eso es `scripts/qa-funciones.sql`.
 *
 * Uso (con la app en modo dev apuntando aquí, ver `scripts/qa/README.md`):
 *   node scripts/qa/supabase-falso.mjs                    # escucha en :54399
 *   HOLD_SEGUNDOS=100 node scripts/qa/supabase-falso.mjs  # holds cortos: sale el aviso de tiempo
 *   node scripts/qa/supabase-falso.mjs --cookie           # imprime la cookie de sesión de la dueña
 *
 * Todo vive en memoria: reiniciar el proceso devuelve los datos de partida.
 */
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const PUERTO = Number(process.env.PUERTO_SUPABASE_FALSO ?? 54399);
export const URL_FALSA = `http://localhost:${PUERTO}`;
/** Con `HOLD_SEGUNDOS=100` el hold nace ya dentro del aviso de «se acaba el tiempo» (2 min). */
const DURACION_HOLD_S = Number(process.env.HOLD_SEGUNDOS ?? 600);
const USUARIO = { id: "00000000-0000-4000-8000-0000000000aa", email: "andrea@ejemplo.es" };

/* ── Fechas: horas de pared de Madrid → instante ISO ───────────────────────── */

const ZONA = "Europe/Madrid";
const fmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
function pared(d) {
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
  return { fecha: `${p.year}-${p.month}-${p.day}`, min: Number(p.hour) * 60 + Number(p.minute) };
}
function hoyMas(dias) {
  const d = new Date(Date.now() + dias * 86_400_000);
  return pared(d).fecha;
}
/** "2026-10-16", "10:30" → ISO UTC del instante en que Madrid marca esa hora. */
function madrid(fecha, hora) {
  const [a, m, d] = fecha.split("-").map(Number);
  const [h, mi] = hora.split(":").map(Number);
  let t = Date.UTC(a, m - 1, d, h, mi) - 2 * 3_600_000;
  for (let i = 0; i < 3; i++) {
    const w = pared(new Date(t));
    const quiero = h * 60 + mi;
    const dif = (w.fecha === fecha ? 0 : w.fecha < fecha ? 1440 : -1440) + quiero - w.min;
    if (dif === 0) break;
    t += dif * 60_000;
  }
  return new Date(t).toISOString();
}

/* ── Datos de partida ─────────────────────────────────────────────────────── */

const ahora = new Date().toISOString();
const id = () => randomUUID();
const HOY = hoyMas(0);
const MANANA = hoyMas(1);

const S = { andrea: id(), carolina: id(), lucia: id() };
const C = { manos: id(), pies: id(), mirada: id() };
const SV = { mani: id(), rusa: id(), pedi: id(), cejas: id(), retirada: id() };
const CL = { ana: id(), marta: id(), lucia: id(), uxia: id() };

const db = {
  settings: [
    ["timezone", ZONA],
    ["horizon_days", 45],
    ["min_lead_minutes", 120],
    ["slot_step_min", 15],
    ["hold_minutes", 10],
    ["cancel_hours", 24],
    ["reminder_hour_local", "10:00"],
    ["voucher_expiry_warning_days", 30],
    ["salon_hours", { 1: [{ open: "09:30", close: "13:30" }, { open: "15:30", close: "19:30" }], 5: [{ open: "09:30", close: "19:30" }] }],
    ["notices", []],
  ].map(([key, value]) => ({ key, value, updated_at: ahora })),
  profiles: [{ id: USUARIO.id, role: "owner", staff_id: S.andrea, display_name: "Andrea", created_at: ahora, updated_at: ahora }],
  staff: [
    { id: S.andrea, slug: "andrea", name: "Andrea", color: "#8e0e33", bio: "Dueña del salón.", specialties: ["Manicura rusa", "Nail art"], instagram: "andrea_salonnails", photo_path: null, active: true, bookable_online: true, position: 0 },
    { id: S.carolina, slug: "carolina", name: "Carolina", color: "#3b6ea8", bio: null, specialties: ["Pedicura", "Gel"], instagram: null, photo_path: null, active: true, bookable_online: true, position: 1 },
    { id: S.lucia, slug: "lucia", name: "Lucía", color: "#2f855a", bio: null, specialties: ["Cejas", "Pestañas"], instagram: null, photo_path: null, active: true, bookable_online: true, position: 2 },
  ].map((r) => ({ ...r, created_at: ahora, updated_at: ahora })),
  service_categories: [
    { id: C.manos, slug: "manos", name: "Manos", position: 0 },
    { id: C.pies, slug: "pies", name: "Pies", position: 1 },
    { id: C.mirada, slug: "mirada", name: "Mirada", position: 2 },
  ],
  services: [
    { id: SV.mani, category_id: C.manos, slug: "manicura-completa", name: "Manicura completa", description: "Limado, cutículas y esmaltado.", duration_min: 60, buffer_min: 0, price_cents: 2500, price_is_from: false, bookable_online: true, position: 0 },
    { id: SV.rusa, category_id: C.manos, slug: "manicura-rusa", name: "Manicura rusa", description: "Con torno, acabado de larga duración.", duration_min: 90, buffer_min: 15, price_cents: 3500, price_is_from: true, bookable_online: true, position: 1 },
    { id: SV.retirada, category_id: C.manos, slug: "retirada", name: "Retirada de gel", description: null, duration_min: 30, buffer_min: 0, price_cents: 1000, price_is_from: false, bookable_online: false, position: 2 },
    { id: SV.pedi, category_id: C.pies, slug: "pedicura-completa", name: "Pedicura completa", description: null, duration_min: 60, buffer_min: 0, price_cents: 2500, price_is_from: false, bookable_online: true, position: 0 },
    { id: SV.cejas, category_id: C.mirada, slug: "laminado-cejas", name: "Laminado de cejas", description: null, duration_min: 45, buffer_min: 0, price_cents: 3000, price_is_from: false, bookable_online: true, position: 0 },
  ].map((r) => ({ ...r, active: true, created_at: ahora, updated_at: ahora })),
  service_staff: [
    [SV.mani, S.andrea], [SV.mani, S.carolina], [SV.rusa, S.andrea], [SV.retirada, S.andrea], [SV.retirada, S.carolina],
    [SV.pedi, S.carolina], [SV.pedi, S.andrea], [SV.cejas, S.lucia],
  ].map(([service_id, staff_id]) => ({ service_id, staff_id })),
  staff_hours: [],
  time_off: [
    { id: id(), staff_id: null, starts_at: madrid(hoyMas(10), "00:00"), ends_at: madrid(hoyMas(11), "00:00"), reason: "Festivo local", created_by: null, created_at: ahora },
    { id: id(), staff_id: S.lucia, starts_at: madrid(HOY, "15:30"), ends_at: madrid(HOY, "17:00"), reason: "Médico", created_by: null, created_at: ahora },
  ],
  clients: [
    { id: CL.ana, name: "Ana Pérez", phone: "+34600111222", email: "ana@ejemplo.es", notes: "Alergia al látex.", marketing_consent: true },
    { id: CL.marta, name: "Marta Souto", phone: "+34600333444", email: "marta@ejemplo.es", notes: null, marketing_consent: false },
    { id: CL.lucia, name: "Lucía Varela", phone: "+34600555666", email: null, notes: null, marketing_consent: false },
    { id: CL.uxia, name: "Uxía Fernández", phone: "+34600777888", email: "uxia@ejemplo.es", notes: "Prefiere tardes.", marketing_consent: true },
  ].map((r) => ({ ...r, marketing_consent_at: r.marketing_consent ? ahora : null, whatsapp_consent: false, source: "web", anonymized_at: null, created_at: ahora, updated_at: ahora })),
  bookings: [],
  booking_items: [],
  payments: [],
  notifications: [],
  voucher_products: [
    { id: id(), slug: "bono-5-manicuras", name: "Bono 5 manicuras", description: "Cinco manicuras completas.", kind: "sessions", sessions: 5, service_id: SV.mani, value_cents: null, price_cents: 11000, validity_months: 12, active: true, position: 0 },
    { id: id(), slug: "tarjeta-regalo-50", name: "Tarjeta regalo 50 €", description: "Para gastar en lo que quiera.", kind: "gift", sessions: null, service_id: null, value_cents: 5000, price_cents: 5000, validity_months: null, active: true, position: 1 },
  ].map((r) => ({ ...r, created_at: ahora, updated_at: ahora })),
  vouchers: [],
  voucher_redemptions: [],
  audit_log: [],
};

for (const s of [S.andrea, S.carolina, S.lucia]) {
  for (let wd = 1; wd <= 5; wd++) {
    db.staff_hours.push({ id: id(), staff_id: s, weekday: wd, start_time: "09:30", end_time: "13:30" });
    db.staff_hours.push({ id: id(), staff_id: s, weekday: wd, start_time: "15:30", end_time: "19:30" });
  }
}
db.staff_hours.push({ id: id(), staff_id: S.andrea, weekday: 6, start_time: "10:00", end_time: "14:00" });

function cita({ cliente, staff, fecha, hora, servicios, status = "confirmed", confirmada = false, source = "web" }) {
  const bid = id();
  let min = 0;
  let total = 0;
  servicios.forEach((sid, i) => {
    const s = db.services.find((x) => x.id === sid);
    db.booking_items.push({ id: id(), booking_id: bid, service_id: sid, name: s.name, duration_min: s.duration_min, price_cents: s.price_cents, position: i });
    min += s.duration_min;
    total += s.price_cents;
  });
  const starts = madrid(fecha, hora);
  const ends = new Date(new Date(starts).getTime() + min * 60_000).toISOString();
  const c = db.clients.find((x) => x.id === cliente);
  db.bookings.push({
    id: bid, client_id: cliente, staff_id: staff, starts_at: starts, ends_at: ends, status, expires_at: null, source, any_staff: false,
    manage_token: id(), client_confirmed_at: confirmada ? ahora : null, cancelled_at: null, cancelled_by: null, cancel_reason: null,
    rescheduled_from: null, total_cents: total, notes: null, contact_name: c?.name ?? null, contact_email: c?.email ?? null,
    created_by: null, created_at: ahora, updated_at: ahora,
  });
  if (status === "done") {
    db.payments.push({ id: id(), booking_id: bid, voucher_id: null, kind: "booking", method: "card", amount_cents: total, tip_cents: 200, paid_at: ends, registered_by: USUARIO.id, note: null, created_at: ahora });
  }
  return bid;
}
cita({ cliente: CL.ana, staff: S.andrea, fecha: HOY, hora: "09:30", servicios: [SV.mani], status: "done" });
cita({ cliente: CL.marta, staff: S.andrea, fecha: HOY, hora: "11:00", servicios: [SV.rusa], confirmada: true });
cita({ cliente: CL.lucia, staff: S.carolina, fecha: HOY, hora: "10:00", servicios: [SV.pedi], status: "no_show" });
cita({ cliente: CL.uxia, staff: S.carolina, fecha: HOY, hora: "16:00", servicios: [SV.mani, SV.pedi], source: "phone" });
cita({ cliente: CL.ana, staff: S.lucia, fecha: HOY, hora: "18:00", servicios: [SV.cejas], confirmada: true });
cita({ cliente: CL.marta, staff: S.andrea, fecha: MANANA, hora: "10:00", servicios: [SV.mani] });
for (let d = -40; d < -1; d += 3) {
  cita({ cliente: [CL.ana, CL.marta, CL.uxia][Math.abs(d) % 3], staff: [S.andrea, S.carolina, S.lucia][Math.abs(d) % 3], fecha: hoyMas(d), hora: "10:00", servicios: [[SV.mani, SV.pedi, SV.cejas][Math.abs(d) % 3]], status: "done" });
}

for (const [i, p] of db.voucher_products.entries()) {
  db.vouchers.push({
    id: id(), code: i === 0 ? "AS-7K3M-Q9ZD" : "AS-H2PX-4RTV", product_id: p.id, kind: p.kind, name: p.name,
    sessions_total: p.sessions, sessions_left: p.sessions ? 3 : null, value_cents: p.value_cents, balance_cents: p.value_cents ? 3000 : null,
    price_cents: p.price_cents, buyer_name: "Marta Souto", buyer_email: "marta@ejemplo.es", recipient_name: i === 1 ? "Uxía" : null,
    gift_message: null, purchased_at: ahora, expires_at: i === 0 ? madrid(hoyMas(20), "23:59") : null, status: "active",
    stripe_checkout_session_id: null, stripe_payment_intent_id: null, sold_in_salon: i === 0, created_by: null, created_at: ahora, updated_at: ahora,
  });
}
db.notifications.push({ id: id(), booking_id: db.bookings[1].id, voucher_id: null, channel: "email", kind: "confirmation", status: "failed", attempts: 1, provider_id: null, error: "Resend: dominio sin verificar", scheduled_for: null, sent_at: null, created_at: ahora });

/* ── Vistas (se calculan al leer) ─────────────────────────────────────────── */

const vistas = {
  public_staff: () => db.staff.filter((s) => s.active).map(({ id, slug, name, bio, specialties, instagram, photo_path, bookable_online, position }) => ({ id, slug, name, bio, specialties, instagram, photo_path, bookable_online, position })),
  v_clients: () =>
    db.clients.map((c) => {
      const suyas = db.bookings.filter((b) => b.client_id === c.id);
      const hechas = suyas.filter((b) => b.status === "done");
      const futuras = suyas.filter((b) => b.status === "confirmed" && b.starts_at > new Date().toISOString());
      const gasto = db.payments.filter((p) => hechas.some((b) => b.id === p.booking_id)).reduce((t, p) => t + p.amount_cents, 0);
      return {
        ...c, visits: hechas.length, visits_12m: hechas.length, no_shows: suyas.filter((b) => b.status === "no_show").length,
        last_visit_at: hechas.map((b) => b.starts_at).sort().at(-1) ?? null, next_visit_at: futuras.map((b) => b.starts_at).sort()[0] ?? null,
        spent_cents: gasto, spent_12m_cents: gasto, median_gap_days: hechas.length > 1 ? 9 : null, favorite_service: "Manicura completa",
        usual_staff: "Andrea", tags: hechas.length >= 5 ? ["vip"] : hechas.length <= 1 ? ["nueva"] : [],
      };
    }),
  v_voucher_balance: () =>
    db.vouchers.map((v) => ({
      id: v.id, code: v.code, name: v.name, kind: v.kind, status: v.status, purchased_at: v.purchased_at, expires_at: v.expires_at,
      sessions_total: v.sessions_total, sessions_left: v.sessions_left, value_cents: v.value_cents, balance_cents: v.balance_cents,
      price_cents: v.price_cents, buyer_name: v.buyer_name, recipient_name: v.recipient_name, sold_in_salon: v.sold_in_salon,
      consumed_cents: 4400, pending_cents: v.price_cents - 4400, expiring_soon: Boolean(v.expires_at),
    })),
};
const tabla = (n) => (vistas[n] ? vistas[n]() : (db[n] ??= []));

/* ── Mini PostgREST ───────────────────────────────────────────────────────── */

/** Divide por comas de primer nivel (las de dentro de paréntesis no cuentan). */
function trocear(s) {
  const out = [];
  let nivel = 0;
  let actual = "";
  for (const ch of s) {
    if (ch === "(") nivel++;
    if (ch === ")") nivel--;
    if (ch === "," && nivel === 0) {
      out.push(actual.trim());
      actual = "";
    } else actual += ch;
  }
  if (actual.trim()) out.push(actual.trim());
  return out;
}

const SINGULAR = { bookings: "booking", clients: "client", staff: "staff", vouchers: "voucher", services: "service", payments: "payment", booking_items: "booking_item", voucher_products: "product", service_categories: "category" };
const fk = (rel) => `${SINGULAR[rel] ?? rel.replace(/s$/, "")}_id`;

function proyectar(base, fila, select) {
  if (!select || select === "*") return { ...fila };
  const out = {};
  for (const parte of trocear(select)) {
    const m = parte.match(/^(?:(\w+):)?(\w+)(?:!\w+)?\((.*)\)$/s);
    if (m) {
      const [, alias, rel, sub] = m;
      const clave = alias ?? rel;
      const col = fk(rel);
      if (col in fila) {
        const destino = tabla(rel).find((r) => r.id === fila[col]);
        out[clave] = destino ? proyectar(rel, destino, sub) : null;
      } else {
        const inversa = fk(base);
        out[clave] = tabla(rel).filter((r) => r[inversa] === fila.id).map((r) => proyectar(rel, r, sub));
      }
      continue;
    }
    if (parte === "*") Object.assign(out, fila);
    else {
      const [alias, col] = parte.includes(":") ? parte.split(":") : [parte, parte];
      out[alias.trim()] = fila[col.trim()] ?? null;
    }
  }
  return out;
}

const esFecha = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v);
function comparar(a, b) {
  if (esFecha(a) && esFecha(b)) return new Date(a).getTime() - new Date(b).getTime();
  if (typeof a === "number") return a - Number(b);
  return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
}
function cumple(valor, expr) {
  const negar = expr.startsWith("not.");
  if (negar) expr = expr.slice(4);
  const [op, ...resto] = expr.split(".");
  let v = resto.join(".");
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  let r;
  switch (op) {
    case "eq": r = String(valor) === v; break;
    case "neq": r = String(valor) !== v; break;
    case "gt": r = valor !== null && comparar(valor, v) > 0; break;
    case "gte": r = valor !== null && comparar(valor, v) >= 0; break;
    case "lt": r = valor !== null && comparar(valor, v) < 0; break;
    case "lte": r = valor !== null && comparar(valor, v) <= 0; break;
    case "in": r = v.replace(/^\(|\)$/g, "").split(",").map((x) => x.replace(/^"|"$/g, "")).includes(String(valor)); break;
    case "is": r = v === "null" ? valor === null || valor === undefined : String(valor) === v; break;
    case "like":
    case "ilike": {
      const re = new RegExp(`^${v.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/[%*]/g, ".*")}$`, op === "ilike" ? "i" : "");
      r = re.test(String(valor ?? ""));
      break;
    }
    case "cs": r = Array.isArray(valor) && JSON.parse(v.replace(/^\{/, "[").replace(/\}$/, "]").replace(/([^,[\]"]+)/g, '"$1"')).every((x) => valor.includes(x)); break;
    default: r = true;
  }
  return negar ? !r : r;
}

const RESERVADOS = new Set(["select", "order", "limit", "offset", "on_conflict", "columns", "or", "and"]);
function filtrar(filas, params) {
  return filas.filter((f) => {
    for (const [k, v] of params) {
      if (RESERVADOS.has(k) || k.includes(".")) continue;
      if (!cumple(f[k], v)) return false;
    }
    return true;
  });
}
function ordenar(filas, order) {
  if (!order) return filas;
  const claves = order.split(",").map((o) => o.split(".")).filter(([c]) => !c.includes("("));
  return [...filas].sort((a, b) => {
    for (const [c, dir] of claves) {
      const x = a[c] ?? null;
      const y = b[c] ?? null;
      if (x === y) continue;
      if (x === null) return 1;
      if (y === null) return -1;
      const d = comparar(x, y);
      if (d !== 0) return dir === "desc" ? -d : d;
    }
    return 0;
  });
}

function nuevaFila(t, datos) {
  const base = { id: id(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  if (t === "bookings") Object.assign(base, { manage_token: id(), status: "confirmed", source: "panel", any_staff: false });
  if (t === "clients") Object.assign(base, { marketing_consent: false, whatsapp_consent: false, source: "panel", anonymized_at: null, notes: null, email: null, phone: null });
  return { ...base, ...datos };
}

/* ── Funciones (rpc) ──────────────────────────────────────────────────────── */

function insertarItems(bookingId, items) {
  for (const [i, it] of (items ?? []).entries()) {
    db.booking_items.push({ id: id(), booking_id: bookingId, service_id: it.service_id ?? null, name: it.name, duration_min: it.duration_min, price_cents: it.price_cents, position: it.position ?? i });
  }
}
const rpc = {
  set_actor: () => null,
  setting_int: (a) => a.p_default,
  queue_notification: (a) => {
    const n = { id: id(), booking_id: a.p_booking ?? null, voucher_id: a.p_voucher ?? null, channel: a.p_channel, kind: a.p_kind, status: "queued", attempts: 0, provider_id: null, error: null, scheduled_for: a.p_scheduled ?? null, sent_at: null, created_at: new Date().toISOString() };
    if (db.notifications.some((x) => x.booking_id === n.booking_id && x.voucher_id === n.voucher_id && x.kind === n.kind)) return null;
    db.notifications.push(n);
    return n.id;
  },
  book_slot: (a) => {
    const b = nuevaFila("bookings", { staff_id: a.p_staff, starts_at: a.p_starts, ends_at: a.p_ends, status: "hold", expires_at: new Date(Date.now() + DURACION_HOLD_S * 1000).toISOString(), source: a.p_source ?? "web", any_staff: Boolean(a.p_any_staff), client_id: null, total_cents: (a.p_items ?? []).reduce((t, x) => t + (x.price_cents ?? 0), 0) });
    db.bookings.push(b);
    insertarItems(b.id, a.p_items);
    return b.id;
  },
  confirm_hold: (a) => {
    const b = db.bookings.find((x) => x.id === a.p_booking && x.status === "hold");
    if (!b) return null;
    let c = db.clients.find((x) => x.phone === a.p_phone);
    if (!c) db.clients.push((c = nuevaFila("clients", { name: a.p_name, phone: a.p_phone, email: a.p_email ?? null, source: "web" })));
    Object.assign(b, { status: "confirmed", expires_at: null, client_id: c.id, contact_name: a.p_name, contact_email: a.p_email ?? null, notes: a.p_notes ?? null });
    return b;
  },
  create_booking: (a) => {
    const b = nuevaFila("bookings", { client_id: a.p_client, staff_id: a.p_staff, starts_at: a.p_starts, ends_at: a.p_ends, source: a.p_source, notes: a.p_notes, total_cents: (a.p_items ?? []).reduce((t, x) => t + (x.price_cents ?? 0), 0) });
    db.bookings.push(b);
    insertarItems(b.id, a.p_items);
    return b;
  },
  complete_booking: (a) => {
    const b = db.bookings.find((x) => x.id === a.p_booking);
    if (b) b.status = "done";
    const p = { id: id(), booking_id: a.p_booking, voucher_id: null, kind: "booking", method: a.p_method, amount_cents: a.p_amount, tip_cents: a.p_tip, paid_at: new Date().toISOString(), registered_by: USUARIO.id, note: a.p_note, created_at: new Date().toISOString() };
    db.payments.push(p);
    return p;
  },
  set_booking_status: (a) => {
    const b = db.bookings.find((x) => x.id === a.p_booking);
    if (b) Object.assign(b, { status: a.p_status, cancelled_by: a.p_by, cancel_reason: a.p_reason, cancelled_at: a.p_status === "cancelled" ? new Date().toISOString() : null });
    return b ?? null;
  },
  reschedule_booking: (a) => {
    const vieja = db.bookings.find((x) => x.id === a.p_old);
    if (!vieja) return null;
    const nueva = { ...vieja, id: id(), staff_id: a.p_staff, starts_at: a.p_starts, ends_at: a.p_ends, rescheduled_from: vieja.id };
    Object.assign(vieja, { status: "cancelled", cancelled_at: new Date().toISOString() });
    db.bookings.push(nueva);
    for (const it of db.booking_items.filter((x) => x.booking_id === vieja.id)) db.booking_items.push({ ...it, id: id(), booking_id: nueva.id });
    return nueva;
  },
  redeem_voucher: (a) => {
    const v = db.vouchers.find((x) => x.code === a.p_code);
    if (!v) throw Object.assign(new Error("BONO_NO_EXISTE"), { code: "P0001" });
    if (v.sessions_left !== null) v.sessions_left -= a.p_sessions ?? 1;
    const r = { id: id(), voucher_id: v.id, booking_id: a.p_booking ?? null, sessions_used: a.p_sessions ?? 1, amount_cents: a.p_amount_cents ?? 0, redeemed_by: a.p_actor ?? null, redeemed_at: new Date().toISOString() };
    db.voucher_redemptions.push(r);
    return r;
  },
  complete_booking_with_voucher: (a) => {
    const r = rpc.redeem_voucher({ p_code: a.p_code, p_sessions: 1, p_booking: a.p_booking, p_actor: a.p_actor });
    const b = db.bookings.find((x) => x.id === a.p_booking);
    if (b) b.status = "done";
    return r;
  },
  issue_voucher: (a) => {
    const p = db.voucher_products.find((x) => x.id === a.p_product);
    if (!p) return null;
    const v = nuevaFila("vouchers", { code: a.p_code, product_id: p.id, kind: p.kind, name: p.name, sessions_total: p.sessions, sessions_left: p.sessions, value_cents: p.value_cents, balance_cents: p.value_cents, price_cents: p.price_cents, buyer_name: a.p_buyer_name, buyer_email: a.p_buyer_email, recipient_name: a.p_recipient_name, gift_message: a.p_gift_message, purchased_at: new Date().toISOString(), expires_at: null, status: "active", sold_in_salon: a.p_sold_in_salon });
    db.vouchers.push(v);
    return v;
  },
  refund_voucher: () => null,
};

/* ── Servidor ─────────────────────────────────────────────────────────────── */

function enviar(res, status, cuerpo, cabeceras = {}) {
  res.writeHead(status, { "Content-Type": "application/json", ...cabeceras });
  res.end(cuerpo === undefined ? "" : JSON.stringify(cuerpo));
}

function sesion() {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 30 * 86_400;
  const jwt = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: USUARIO.id, role: "authenticated", aud: "authenticated", exp, email: USUARIO.email })}.firma`;
  return {
    access_token: jwt, token_type: "bearer", expires_in: 30 * 86_400, expires_at: exp, refresh_token: "refresco-falso",
    user: { id: USUARIO.id, aud: "authenticated", role: "authenticated", email: USUARIO.email, app_metadata: {}, user_metadata: {}, created_at: ahora },
  };
}

/** Valor de la cookie que @supabase/ssr espera para una URL `http://localhost:<puerto>`. */
export function cookieSesion() {
  return { name: "sb-localhost-auth-token", value: `base64-${Buffer.from(JSON.stringify(sesion())).toString("base64url")}` };
}

async function leerCuerpo(req) {
  let s = "";
  for await (const trozo of req) s += trozo;
  return s ? JSON.parse(s) : null;
}

export function arrancar(puerto = PUERTO) {
  const servidor = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, URL_FALSA);
      const ruta = url.pathname;

      if (ruta.startsWith("/auth/v1/")) {
        const auth = req.headers.authorization ?? "";
        // Con sesión el cliente manda el JWT (lleva puntos); sin ella, la clave anónima («anon»).
        if (ruta === "/auth/v1/user") return auth.includes(".") ? enviar(res, 200, sesion().user) : enviar(res, 401, { message: "no autorizado" });
        if (ruta === "/auth/v1/token") return enviar(res, 200, sesion());
        if (ruta === "/auth/v1/logout") return enviar(res, 204);
        return enviar(res, 404, { message: ruta });
      }

      if (ruta.startsWith("/rest/v1/rpc/")) {
        const fn = ruta.slice("/rest/v1/rpc/".length);
        const args = (await leerCuerpo(req)) ?? {};
        if (!rpc[fn]) return enviar(res, 404, { code: "PGRST202", message: `función ${fn} no simulada` });
        try {
          return enviar(res, 200, rpc[fn](args) ?? null);
        } catch (e) {
          return enviar(res, 400, { code: e.code ?? "P0001", message: e.message, details: null, hint: null });
        }
      }

      if (!ruta.startsWith("/rest/v1/")) return enviar(res, 404, { message: ruta });
      const t = ruta.slice("/rest/v1/".length);
      const params = [...url.searchParams.entries()];
      const select = url.searchParams.get("select") ?? "*";
      const prefer = String(req.headers.prefer ?? "");
      const unaFila = String(req.headers.accept ?? "").includes("vnd.pgrst.object");

      let afectadas;
      if (req.method === "GET" || req.method === "HEAD") {
        afectadas = ordenar(filtrar(tabla(t), params), url.searchParams.get("order"));
        const total = afectadas.length;
        const offset = Number(url.searchParams.get("offset") ?? 0);
        const limit = url.searchParams.get("limit");
        afectadas = afectadas.slice(offset, limit ? offset + Number(limit) : undefined);
        const cab = prefer.includes("count=") ? { "Content-Range": `${offset}-${offset + afectadas.length - 1}/${total}` } : {};
        if (req.method === "HEAD") return enviar(res, 200, undefined, cab);
        const filas = afectadas.map((f) => proyectar(t, f, select));
        if (unaFila) return filas.length === 1 ? enviar(res, 200, filas[0], cab) : enviar(res, 406, { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned", details: `${filas.length} rows`, hint: null });
        return enviar(res, 200, filas, cab);
      }

      const cuerpo = await leerCuerpo(req);
      if (req.method === "POST") {
        const lista = (Array.isArray(cuerpo) ? cuerpo : [cuerpo]).map((d) => nuevaFila(t, d));
        const conflicto = url.searchParams.get("on_conflict");
        afectadas = [];
        for (const fila of lista) {
          const previa = conflicto ? tabla(t).find((r) => conflicto.split(",").every((c) => r[c] === fila[c])) : null;
          if (previa) {
            if (!prefer.includes("ignore-duplicates")) Object.assign(previa, cuerpo && !Array.isArray(cuerpo) ? cuerpo : fila);
            afectadas.push(previa);
          } else {
            tabla(t).push(fila);
            afectadas.push(fila);
          }
        }
      } else if (req.method === "PATCH") {
        afectadas = filtrar(tabla(t), params);
        for (const f of afectadas) Object.assign(f, cuerpo, { updated_at: new Date().toISOString() });
      } else if (req.method === "DELETE") {
        afectadas = filtrar(tabla(t), params);
        db[t] = tabla(t).filter((f) => !afectadas.includes(f));
      } else return enviar(res, 405, { message: req.method });

      if (!prefer.includes("return=representation")) return enviar(res, 204);
      const filas = afectadas.map((f) => proyectar(t, f, select));
      return unaFila ? enviar(res, filas.length ? 200 : 406, filas[0] ?? { code: "PGRST116", message: "no rows" }) : enviar(res, 201, filas);
    } catch (e) {
      console.error(e);
      enviar(res, 500, { message: String(e) });
    }
  });
  servidor.listen(puerto);
  return servidor;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes("--cookie")) {
    const c = cookieSesion();
    console.log(`${c.name}=${c.value}`);
  } else {
    arrancar();
    console.log(`Supabase falso en ${URL_FALSA} (hoy en Madrid: ${HOY})`);
  }
}
