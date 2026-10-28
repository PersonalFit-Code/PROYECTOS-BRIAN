"use server";

import { revalidatePath } from "next/cache";
import { comprobar, fecha, numero, numeroONull, texto, textoONull } from "@/lib/acciones";
import { hoy } from "@/lib/fechas";
import { getSesion } from "@/lib/sesion";
import type { AccountKind, Frequency, TxKind } from "@/lib/tipos";

function refrescar() {
  revalidatePath("/finanzas", "layout");
  revalidatePath("/hoy");
}

function importe(f: FormData, campo = "amount"): number {
  const v = Math.round(numero(f, campo) * 100) / 100;
  if (!Number.isFinite(v) || v <= 0) throw new Error("El importe tiene que ser mayor que 0");
  return v;
}

function tipo(f: FormData): TxKind {
  return f.get("kind") === "ingreso" ? "ingreso" : "gasto";
}

/* ── Movimientos ────────────────────────────────────────── */

export async function crearMovimiento(f: FormData) {
  const s = await getSesion();
  comprobar(
    await s.db.from("transactions").insert({
      user_id: s.userId,
      day: fecha(f, "day") ?? hoy(),
      amount: importe(f),
      kind: tipo(f),
      category_id: texto(f, "category_id", 40) || null,
      note: textoONull(f, "note", 300),
    }),
    "apuntar el movimiento",
  );
  refrescar();
}

export async function borrarMovimiento(id: string) {
  const s = await getSesion();
  comprobar(await s.db.from("transactions").delete().eq("id", id).eq("user_id", s.userId), "borrar el movimiento");
  refrescar();
}

/* ── Categorías y presupuesto ───────────────────────────── */

export async function guardarPresupuesto(categoryId: string, valor: number | null) {
  const s = await getSesion();
  const v = valor != null && Number.isFinite(valor) && valor > 0 ? Math.round(valor * 100) / 100 : null;
  comprobar(await s.db.from("categories").update({ monthly_budget: v }).eq("id", categoryId).eq("user_id", s.userId), "guardar el presupuesto");
  refrescar();
}

export async function crearCategoria(f: FormData) {
  const s = await getSesion();
  const name = texto(f, "name", 40);
  if (!name) throw new Error("La categoría necesita un nombre");
  comprobar(
    await s.db.from("categories").insert({ user_id: s.userId, name, emoji: texto(f, "emoji", 30) || "circle", kind: tipo(f), position: 99 }),
    "crear la categoría",
  );
  refrescar();
}

/* ── Fijos y suscripciones ──────────────────────────────── */

export async function crearRecurrente(f: FormData) {
  const s = await getSesion();
  const name = texto(f, "name", 80);
  if (!name) throw new Error("Ponle un nombre");
  const frequency = (["semanal", "mensual", "anual"].includes(String(f.get("frequency"))) ? f.get("frequency") : "mensual") as Frequency;
  comprobar(
    await s.db.from("recurring_items").insert({
      user_id: s.userId,
      name,
      amount: importe(f),
      kind: tipo(f),
      category_id: texto(f, "category_id", 40) || null,
      frequency,
      next_date: fecha(f, "next_date") ?? hoy(),
      is_subscription: f.get("is_subscription") === "on",
    }),
    "guardar el fijo",
  );
  refrescar();
}

export async function activarRecurrente(id: string, active: boolean) {
  const s = await getSesion();
  comprobar(await s.db.from("recurring_items").update({ active }).eq("id", id).eq("user_id", s.userId), "actualizar el fijo");
  refrescar();
}

export async function borrarRecurrente(id: string) {
  const s = await getSesion();
  comprobar(await s.db.from("recurring_items").delete().eq("id", id).eq("user_id", s.userId), "borrar el fijo");
  refrescar();
}

/* ── Huchas ─────────────────────────────────────────────── */

export async function crearHucha(f: FormData) {
  const s = await getSesion();
  const name = texto(f, "name", 80);
  if (!name) throw new Error("Ponle un nombre a la hucha");
  comprobar(
    await s.db.from("savings_goals").insert({
      user_id: s.userId,
      name,
      emoji: texto(f, "emoji", 30) || "piggy-bank",
      target: importe(f, "target"),
      saved: Math.max(0, numeroONull(f, "saved") ?? 0),
      target_date: fecha(f, "target_date"),
    }),
    "crear la hucha",
  );
  refrescar();
}

/** Aportar (o retirar, con importe negativo) dinero de una hucha. */
export async function aportarHucha(id: string, cantidad: number) {
  if (!Number.isFinite(cantidad) || cantidad === 0) return;
  const s = await getSesion();
  const { data: h } = await s.db.from("savings_goals").select("saved, target").eq("id", id).eq("user_id", s.userId).single();
  if (!h) throw new Error("Esa hucha no existe");
  const saved = Math.max(0, Math.round((Number(h.saved) + cantidad) * 100) / 100);
  comprobar(await s.db.from("savings_goals").update({ saved, done: saved >= Number(h.target) }).eq("id", id).eq("user_id", s.userId), "aportar a la hucha");
  refrescar();
}

export async function borrarHucha(id: string) {
  const s = await getSesion();
  comprobar(await s.db.from("savings_goals").delete().eq("id", id).eq("user_id", s.userId), "borrar la hucha");
  refrescar();
}

/* ── Patrimonio ─────────────────────────────────────────── */

export async function crearCuenta(f: FormData) {
  const s = await getSesion();
  const name = texto(f, "name", 80);
  if (!name) throw new Error("Ponle un nombre a la cuenta");
  const kind = (["liquidez", "inversion", "deuda", "otro"].includes(String(f.get("kind"))) ? f.get("kind") : "liquidez") as AccountKind;
  comprobar(
    await s.db.from("accounts").insert({
      user_id: s.userId,
      name,
      kind,
      balance: Math.abs(numeroONull(f, "balance") ?? 0),
      symbol: kind === "inversion" || kind === "liquidez" ? texto(f, "symbol", 20).toUpperCase() || null : null,
    }),
    "crear la cuenta",
  );
  refrescar();
}

export async function actualizarSaldo(id: string, balance: number) {
  if (!Number.isFinite(balance)) throw new Error("Saldo no válido");
  const s = await getSesion();
  comprobar(
    await s.db.from("accounts").update({ balance: Math.abs(balance), updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", s.userId),
    "actualizar el saldo",
  );
  refrescar();
}

export async function borrarCuenta(id: string) {
  const s = await getSesion();
  comprobar(await s.db.from("accounts").update({ active: false }).eq("id", id).eq("user_id", s.userId), "quitar la cuenta");
  refrescar();
}
