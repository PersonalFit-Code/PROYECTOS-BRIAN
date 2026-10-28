"use client";

import { useEffect } from "react";

/** Registra el service worker (public/sw.js): lo necesitan las notificaciones push y la pantalla sin conexión. */
export function RegistrarSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
