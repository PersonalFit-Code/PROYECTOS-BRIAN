"use client";

import jsQR from "jsqr";
import { CameraOff, RefreshCw } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

/**
 * Lector de QR con la cámara trasera, sin librerías nativas: cada fotograma se pinta en un canvas
 * fuera de pantalla y `jsqr` busca el código en los píxeles. Funciona igual en el Safari del iPhone
 * del mostrador que en Chrome de Android.
 *
 * - Unas 8 lecturas por segundo: más no lee antes y en un móvil viejo calienta y gasta batería.
 * - El fotograma se reduce a 640 px de lado: el QR del bono es grande y así cada lectura cuesta poco.
 * - Al desmontar se paran las pistas de la cámara: si no, el piloto verde se queda encendido.
 * - Sin cámara, sin permiso o sin https no se rompe nada: se explica en castellano y quien lo use
 *   tiene al lado el campo para escribir el código a mano.
 *
 * Devuelve el TEXTO del QR tal cual; interpretarlo (sacar el código de la URL) es cosa de quien lo usa.
 */

type Soporte = "pendiente" | "ok" | "inseguro" | "sin-api";

const INTERVALO_MS = 125;
const LADO_MAX = 640;
/** El mismo QR delante de la cámara no se avisa en cada fotograma, solo de vez en cuando. */
const REPETIR_MS = 2500;

const sinSuscripcion = () => () => {};

/**
 * Se mira en el navegador con `useSyncExternalStore` (en el servidor es «pendiente»): así no hay
 * que guardarlo en un estado desde un efecto y la hidratación no ve dos textos distintos.
 */
function soporteCamara(): Soporte {
  if (!window.isSecureContext) return "inseguro";
  if (!navigator.mediaDevices?.getUserMedia) return "sin-api";
  return "ok";
}

const TEXTO_SOPORTE: Record<"inseguro" | "sin-api", string> = {
  inseguro: "La cámara solo funciona con conexión segura (https). Escribe el código a mano.",
  "sin-api": "Este navegador no deja usar la cámara. Escribe el código a mano.",
};

function motivoDeFallo(e: unknown): string {
  const nombre = e instanceof Error || e instanceof DOMException ? e.name : "";
  switch (nombre) {
    case "NotAllowedError":
    case "SecurityError":
      return "No hay permiso para usar la cámara. Dáselo en los ajustes del navegador (el candado junto a la dirección) y pulsa «Reintentar», o escribe el código a mano.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "No encuentro ninguna cámara en este dispositivo. Escribe el código a mano.";
    case "NotReadableError":
    case "AbortError":
      return "La cámara está ocupada por otra aplicación. Ciérrala y pulsa «Reintentar».";
    default:
      return "No se pudo abrir la cámara. Pulsa «Reintentar» o escribe el código a mano.";
  }
}

export default function EscanerQr({ onCodigo, className }: { onCodigo: (texto: string) => void; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const soporte = useSyncExternalStore<Soporte>(sinSuscripcion, soporteCamara, () => "pendiente");
  const [fallo, setFallo] = useState<string | null>(null);
  const [leyendo, setLeyendo] = useState(false);
  /** iOS en modo ahorro bloquea el `play()` automático: entonces hace falta un toque. */
  const [necesitaToque, setNecesitaToque] = useState(false);
  const [intento, setIntento] = useState(0);
  // Siempre la última `onCodigo` sin reiniciar la cámara cada vez que el padre se vuelve a pintar.
  const avisar = useEffectEvent((texto: string) => onCodigo(texto));

  useEffect(() => {
    if (soporte !== "ok") return;
    const video = videoRef.current;
    if (!video) return;

    let vivo = true;
    let flujo: MediaStream | null = null;
    let marco = 0;
    let ultimaLectura = 0;
    let ultimoTexto = "";
    let ultimoAviso = 0;
    const lienzo = document.createElement("canvas");
    const ctx = lienzo.getContext("2d", { willReadFrequently: true });

    const bucle = (t: number) => {
      if (!vivo) return;
      marco = requestAnimationFrame(bucle);
      if (t - ultimaLectura < INTERVALO_MS) return;
      ultimaLectura = t;
      if (!ctx || video.readyState < video.HAVE_CURRENT_DATA || !video.videoWidth) return;

      const escala = Math.min(1, LADO_MAX / Math.max(video.videoWidth, video.videoHeight));
      const ancho = Math.round(video.videoWidth * escala);
      const alto = Math.round(video.videoHeight * escala);
      if (lienzo.width !== ancho) lienzo.width = ancho;
      if (lienzo.height !== alto) lienzo.height = alto;
      ctx.drawImage(video, 0, 0, ancho, alto);
      // "dontInvert": el QR del bono es oscuro sobre blanco; probar también invertido duplica el coste.
      const qr = jsQR(ctx.getImageData(0, 0, ancho, alto).data, ancho, alto, { inversionAttempts: "dontInvert" });
      if (!qr?.data) return;
      if (qr.data === ultimoTexto && t - ultimoAviso < REPETIR_MS) return;
      ultimoTexto = qr.data;
      ultimoAviso = t;
      navigator.vibrate?.(40);
      avisar(qr.data);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then(async (s) => {
        if (!vivo) {
          s.getTracks().forEach((pista) => pista.stop());
          return;
        }
        flujo = s;
        video.srcObject = s;
        try {
          await video.play();
        } catch {
          if (vivo) setNecesitaToque(true);
        }
        if (!vivo) return;
        setLeyendo(true);
        marco = requestAnimationFrame(bucle);
      })
      .catch((e: unknown) => {
        if (vivo) setFallo(motivoDeFallo(e));
      });

    return () => {
      vivo = false;
      cancelAnimationFrame(marco);
      flujo?.getTracks().forEach((pista) => pista.stop());
      video.srcObject = null;
    };
  }, [soporte, intento]);

  const reintentar = () => {
    setFallo(null);
    setLeyendo(false);
    setNecesitaToque(false);
    setIntento((i) => i + 1);
  };

  const mensaje =
    soporte === "pendiente"
      ? "Preparando la cámara…"
      : soporte !== "ok"
        ? TEXTO_SOPORTE[soporte]
        : fallo
          ? fallo
          : !leyendo
            ? "Pidiendo permiso para usar la cámara…"
            : "Apunta al QR del bono.";
  const sinCamara = soporte === "inseguro" || soporte === "sin-api" || fallo !== null;

  return (
    // Tamaño y esquinas los decide quien lo usa (pantalla completa o un diálogo); sin `className`,
    // una caja 4:3 redondeada. No se mezclan: dos `min-h-*` a la vez los resuelve el orden del CSS.
    <div className={cn("relative overflow-hidden bg-tinta text-white", className ?? "aspect-[4/3] w-full rounded-3xl")}>
      {soporte === "ok" && (
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          aria-hidden
          className={cn("absolute inset-0 size-full object-cover transition-opacity", leyendo && !fallo ? "opacity-100" : "opacity-0")}
        />
      )}

      {leyendo && !fallo && (
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {/* La sombra enorme oscurece todo menos el recuadro: se ve dónde poner el QR. */}
          <div className="aspect-square w-3/5 max-w-72 rounded-3xl border-4 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
        </div>
      )}

      {necesitaToque && leyendo && !fallo && (
        <button
          type="button"
          onClick={() => {
            videoRef.current?.play().then(() => setNecesitaToque(false), () => undefined);
          }}
          className="absolute inset-0 flex items-center justify-center bg-black/40 text-base font-semibold"
        >
          Toca para activar la cámara
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10 text-center">
        {sinCamara && <CameraOff aria-hidden className="size-7 text-white/80" />}
        <p role="status" aria-live="polite" className="max-w-sm text-[15px] font-medium leading-snug">
          {mensaje}
        </p>
        {fallo && (
          <button
            type="button"
            onClick={reintentar}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-tinta"
          >
            <RefreshCw aria-hidden className="size-4" /> Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
