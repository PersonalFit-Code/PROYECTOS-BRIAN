"use client";

/**
 * Lo que la gerencia apunta en el panel (objetivo, caja, tareas, pagos registrados, renovaciones).
 * En la demo se guarda en el navegador; en producción, en la base de datos del centro.
 */
import { useSyncExternalStore } from "react";
import { tareasSemilla, type Metodo, type PagoCliente } from "@/data/panel-demo";

export type Prioridad = "Muy prioritaria" | "Prioritaria" | "Poco prioritaria";
export interface Tarea {
  id: string;
  texto: string;
  prioridad: Prioridad;
  hecha: boolean;
}
export interface CierreCaja {
  fecha: string;
  apertura: number;
  desglose: Record<string, number>;
  total: number;
  nota: string;
}
export interface EstadoPanel {
  objetivo: number;
  apertura: number;
  cierres: CierreCaja[];
  tareas: Tarea[];
  /** Pagos registrados a mano por cliente (id de socio → pagos). */
  pagos: Record<string, (PagoCliente & { registrado: string })[]>;
  /** Bonos renovados por cliente (id → nº de renovaciones). */
  renovaciones: Record<string, number>;
  /** Metas del mes (altas, ocupación media de clases en %, conversión de solicitudes en %). */
  metas: { altas: number; ocupacion: number; conversion: number };
}

const CLAVE = "720panel:estado";
const EVENTO = "720panel";
const inicial: EstadoPanel = { objetivo: 16_000, apertura: 150, cierres: [], tareas: tareasSemilla, pagos: {}, renovaciones: {}, metas: { altas: 20, ocupacion: 80, conversion: 50 } };

let cacheCrudo: string | null | undefined;
let cacheValor: EstadoPanel = inicial;

function leer(): EstadoPanel {
  let crudo: string | null = null;
  try {
    crudo = localStorage.getItem(CLAVE);
  } catch {}
  if (crudo === cacheCrudo) return cacheValor;
  cacheCrudo = crudo;
  try {
    cacheValor = crudo ? { ...inicial, ...(JSON.parse(crudo) as Partial<EstadoPanel>) } : inicial;
  } catch {
    cacheValor = inicial;
  }
  return cacheValor;
}

export function cambiar(f: (e: EstadoPanel) => EstadoPanel) {
  const nuevo = f(leer());
  try {
    localStorage.setItem(CLAVE, JSON.stringify(nuevo));
  } catch {}
  window.dispatchEvent(new Event(EVENTO));
}

export function restablecerPanel() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {}
  window.dispatchEvent(new Event(EVENTO));
}

function suscribir(aviso: () => void) {
  window.addEventListener(EVENTO, aviso);
  window.addEventListener("storage", aviso);
  return () => {
    window.removeEventListener(EVENTO, aviso);
    window.removeEventListener("storage", aviso);
  };
}

export function usePanel(): EstadoPanel {
  return useSyncExternalStore(suscribir, leer, () => inicial);
}

export const idNuevo = () => Math.random().toString(36).slice(2, 9);

export function registrarPago(socioId: string, pago: { importe: number; fecha: string; metodo: Metodo; concepto: string }) {
  cambiar((e) => ({
    ...e,
    pagos: { ...e.pagos, [socioId]: [...(e.pagos[socioId] ?? []), { ...pago, id: idNuevo(), registrado: new Date().toISOString() }] },
  }));
}

export function exportarCopia(extra: Record<string, unknown>) {
  const datos = { exportado: new Date().toISOString(), panel: leer(), ...extra };
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `720gym-copia-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
