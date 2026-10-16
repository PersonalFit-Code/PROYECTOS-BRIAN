/**
 * Vídeo «walkthrough» del salón controlado por scroll. NO SE IMPLEMENTA AHORA (plan §11): Brian
 * avisará cuando tenga las fotos del local y el vídeo generado. Este fichero deja el HUECO: la
 * bandera que lo apaga y las tarjetas de ejemplo que irán apareciendo sobre el vídeo según el
 * progreso (0–1) del scroll.
 *
 * Cuando llegue el MP4 (todo-keyframes, ≤ 8 MB, receta FFmpeg en `docs/recorrido-video.md`):
 *  1. ponerlo en `public/video/recorrido.mp4` y el póster en `public/video/recorrido.jpg`;
 *  2. `RECORRIDO_VIDEO_READY = true`;
 *  3. afinar `start`/`end` de cada tarjeta mirando el vídeo.
 * `components/home/RecorridoVideo.tsx` renderiza `null` mientras la bandera sea false.
 */
export const RECORRIDO_VIDEO_READY = false;

export const RECORRIDO_VIDEO = {
  src: "/video/recorrido.mp4",
  poster: "/video/recorrido.jpg",
  /** Alto del carril de scroll en viewports: cuánto hay que bajar para ver el vídeo entero. */
  trackVh: 400,
} as const;

export interface RecorridoCard {
  id: string;
  /** Progreso (0–1) del scroll en el que aparece y desaparece la tarjeta. */
  start: number;
  end: number;
  title: string;
  text: string;
}

/* Tarjetas de EJEMPLO con el recorrido previsto (entrada → recepción → sala → pedicura). Los textos
   se revisan con el vídeo delante. */
export const RECORRIDO_CARDS: readonly RecorridoCard[] = [
  { id: "entrada", start: 0.05, end: 0.25, title: "La entrada", text: "Rúa Río Mao, 23. Entras y ya huele a salón." },
  { id: "recepcion", start: 0.3, end: 0.5, title: "Recepción", text: "Te esperamos con tu cita preparada: sin esperas." },
  { id: "sala", start: 0.55, end: 0.75, title: "La sala", text: "Luz natural y una silla para ti. Aquí pasa la magia." },
  { id: "pedicura", start: 0.8, end: 0.95, title: "Zona de pedicura", text: "Un rincón más tranquilo para los pies." },
];
