"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/**
 * Widget de Cloudflare Turnstile (el CAPTCHA de la reserva; ver `lib/turnstile.ts`). Con
 * `appearance: "interaction-only"` no se ve nada salvo que Cloudflare dude de la visita: entonces
 * aparece una casilla «Verifica que eres humano». El token que da dura 5 minutos y vale UNA vez, así
 * que tras cada intento de confirmar se pide uno nuevo con `reiniciar()`.
 *
 * Sin `NEXT_PUBLIC_TURNSTILE_SITE_KEY` no pinta nada ni carga ningún script.
 */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

interface ApiTurnstile {
  render: (el: HTMLElement, opciones: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
}
declare global {
  interface Window {
    turnstile?: ApiTurnstile;
  }
}

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let cargando: Promise<void> | null = null;
function cargarScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  cargando ??= new Promise((ok, mal) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => ok();
    s.onerror = () => {
      cargando = null;
      mal(new Error("No carga Turnstile"));
    };
    document.head.appendChild(s);
  });
  return cargando;
}

export interface TurnstileHandle {
  reiniciar: () => void;
}

const Turnstile = forwardRef<TurnstileHandle, { onToken: (token: string | null) => void; idioma: string }>(function Turnstile({ onToken, idioma }, ref) {
  const caja = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const alToken = useRef(onToken);
  useEffect(() => {
    alToken.current = onToken;
  }, [onToken]);

  useImperativeHandle(ref, () => ({
    reiniciar: () => {
      alToken.current(null);
      if (widget.current && window.turnstile) window.turnstile.reset(widget.current);
    },
  }));

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let vivo = true;
    cargarScript()
      .then(() => {
        if (!vivo || !caja.current || !window.turnstile) return;
        widget.current = window.turnstile.render(caja.current, {
          sitekey: TURNSTILE_SITE_KEY,
          appearance: "interaction-only",
          // Turnstile no tiene gallego: en /gl sale en castellano.
          language: idioma === "gl" ? "es" : idioma,
          action: "reserva",
          callback: (t: string) => alToken.current(t),
          "expired-callback": () => alToken.current(null),
          "error-callback": () => alToken.current(null),
        });
      })
      // Si un bloqueador impide cargar el script, se envía sin token y el servidor lo explica.
      .catch(() => alToken.current(null));
    return () => {
      vivo = false;
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, [idioma]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={caja} className="min-h-0 [&_iframe]:max-w-full" />;
});

export default Turnstile;
