"use client";

import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Boton } from "@/components/ui/basicos";

function aUint8(base64: string): Uint8Array<ArrayBuffer> {
  const relleno = "=".repeat((4 - (base64.length % 4)) % 4);
  const b = atob((base64 + relleno).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(b.length));
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}

/**
 * Activa las notificaciones en ESTE dispositivo. En iPhone solo funciona con la app añadida a la
 * pantalla de inicio (iOS 16.4+), no desde Safari.
 */
export function ActivarAvisos({ clavePublica }: { clavePublica: string | null }) {
  const [estado, setEstado] = useState<"cargando" | "no-soportado" | "activo" | "inactivo" | "bloqueado">("cargando");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !clavePublica) return setEstado("no-soportado");
      if (Notification.permission === "denied") return setEstado("bloqueado");
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      setEstado(sub ? "activo" : "inactivo");
    })().catch(() => setEstado("no-soportado"));
  }, [clavePublica]);

  async function activar() {
    setError(null);
    try {
      const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register("/sw.js"));
      await navigator.serviceWorker.ready;
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") return setEstado(permiso === "denied" ? "bloqueado" : "inactivo");
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: aUint8(clavePublica!) });
      const res = await fetch("/api/push", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(sub.toJSON()) });
      if (!res.ok) throw new Error("No se pudo guardar la suscripción");
      setEstado("activo");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo activar");
    }
  }

  async function desactivar() {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
      await sub.unsubscribe();
    }
    setEstado("inactivo");
  }

  if (estado === "cargando") return <p className="text-sm text-muted">Comprobando…</p>;
  if (estado === "no-soportado")
    return (
      <p className="text-sm text-muted">
        {clavePublica ? "Este navegador no admite notificaciones. En iPhone, añade la app a la pantalla de inicio y ábrela desde ahí." : "Las notificaciones no están configuradas (faltan las claves VAPID en Vercel)."}
      </p>
    );
  if (estado === "bloqueado") return <p className="text-sm text-muted">Has bloqueado las notificaciones para esta web. Actívalas en los ajustes del navegador.</p>;
  return (
    <div className="flex items-center gap-3">
      {estado === "activo" ? (
        <Boton onClick={desactivar}>
          <BellOff className="size-4" /> Desactivar en este dispositivo
        </Boton>
      ) : (
        <Boton variante="primario" onClick={activar}>
          <Bell className="size-4" /> Activar avisos
        </Boton>
      )}
      {estado === "activo" && <span className="text-sm text-ok">Activadas</span>}
      {error && <span className="text-sm text-bad">{error}</span>}
    </div>
  );
}
