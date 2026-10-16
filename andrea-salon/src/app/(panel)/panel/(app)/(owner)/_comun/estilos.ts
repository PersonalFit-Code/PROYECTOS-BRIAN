/**
 * Clases compartidas por los formularios del panel. En un módulo normal (ni cliente ni servidor)
 * a propósito: si vivieran en un fichero "use client", la página de servidor recibiría una
 * referencia de cliente en vez del texto.
 */
export const CAMPO =
  "mt-1.5 block w-full min-h-12 rounded-2xl border border-carmin/20 bg-white px-4 text-[16px] text-tinta focus:border-carmin focus:outline-none focus:ring-2 focus:ring-carmin/20";

export const AREA =
  "mt-1.5 block w-full min-h-24 rounded-2xl border border-carmin/20 bg-white px-4 py-3 text-[16px] text-tinta focus:border-carmin focus:outline-none focus:ring-2 focus:ring-carmin/20";

export const ETIQUETA = "block text-sm font-semibold text-tinta";

export const AYUDA = "mt-1 block text-xs font-normal text-gris";

export const TARJETA =
  "rounded-3xl border border-[var(--capa-borde)] bg-white/80 p-4 shadow-[var(--shadow-soft)] sm:p-6";

export const BOTON_PRIMARIO =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-carmin px-6 font-semibold text-white transition-colors hover:bg-carmin-oscuro disabled:opacity-60";

export const BOTON_SECUNDARIO =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-carmin/25 bg-white px-4 text-sm font-semibold text-carmin transition-colors hover:bg-rosa-niebla disabled:opacity-60";

export const CHECK = "size-5 shrink-0 rounded accent-carmin";

/** Fila de checkbox con área táctil de 44 px aunque la casilla sea pequeña. */
export const FILA_CHECK = "flex min-h-11 items-center gap-3 text-[15px] text-tinta";

export const DESPLEGABLE =
  "group rounded-2xl border border-[var(--capa-borde)] bg-white [&_summary::-webkit-details-marker]:hidden";

export const RESUMEN_DESPLEGABLE =
  "flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 text-[15px] font-semibold text-carmin";
