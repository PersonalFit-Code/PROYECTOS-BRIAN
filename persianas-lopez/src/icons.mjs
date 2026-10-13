// Iconos SVG (sprite) e ilustraciones de las piezas del catálogo.

const T = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

export const SPRITE = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
<symbol id="i-telefono" ${T}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></symbol>
<symbol id="i-whatsapp" ${T}><path d="M3 21l1.65-4.95A9 9 0 1 1 7.9 19.4L3 21z"/><path d="M9 8.6c0 3.5 2.9 6.4 6.4 6.4l1.1-1.6-2.1-1-1 .8a5 5 0 0 1-2.6-2.6l.8-1-1-2.1L9 8.6z" fill="currentColor" stroke-width="1"/></symbol>
<symbol id="i-ubicacion" ${T}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></symbol>
<symbol id="i-reloj" ${T}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></symbol>
<symbol id="i-estrella" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></symbol>
<symbol id="i-estrella-media" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 2L8.91 8.26 2 9.27l5 4.87-1.18 6.88L12 17.77V2z" fill="currentColor"/></symbol>
<symbol id="i-rayo" ${T}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></symbol>
<symbol id="i-caja" ${T}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7 12 12l8.7-5M12 22V12M7.5 4.2l9 5.2"/></symbol>
<symbol id="i-llave" ${T}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></symbol>
<symbol id="i-mosquitera" ${T}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18" stroke-width="1.3"/></symbol>
<symbol id="i-sol" ${T}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></symbol>
<symbol id="i-ducha" ${T}><path d="M4 21V7a4 4 0 0 1 4-4h1a4 4 0 0 1 4 4v1"/><path d="M9 8h8a4 4 0 0 1-4 4h0a4 4 0 0 1-4-4z"/><path d="M11 15v1M15 15v1M13 18v1M17 18v1M11 21v.01M15 21v.01"/></symbol>
<symbol id="i-engranaje" ${T}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68 1.65 1.65 0 0 0 10 3.17V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m8.5 12 2.5 2.5 4.5-5"/></symbol>
<symbol id="i-abajo" ${T}><path d="M12 5v14M19 12l-7 7-7-7"/></symbol>
<symbol id="i-derecha" ${T}><path d="M5 12h14M12 5l7 7-7 7"/></symbol>
<symbol id="i-arriba" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></symbol>
<symbol id="i-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></symbol>
<symbol id="i-personas" ${T}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></symbol>
<symbol id="i-tienda" ${T}><path d="M3 9 4.5 4h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M4.5 11.5V20h15v-8.5M9.5 20v-5h5v5"/></symbol>
<symbol id="i-camara" ${T}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></symbol>
<symbol id="i-regla" ${T}><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/></symbol>
<symbol id="i-escudo" ${T}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></symbol>
<symbol id="i-chat" ${T}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/></symbol>
<symbol id="i-calculadora" ${T}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h4"/></symbol>
<symbol id="i-enviar" ${T}><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></symbol>
<symbol id="i-cerrar" ${T}><path d="M18 6 6 18M6 6l12 12"/></symbol>
<symbol id="i-reiniciar" ${T}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></symbol>
<symbol id="i-globo" ${T}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/></symbol>
<symbol id="i-mapa" ${T}><path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3z"/><path d="M9 3v15M15 6v15"/></symbol>
<symbol id="i-google" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></symbol>
</svg>`;

export const ico = (nombre, clase = '') => `<svg class="icon ${clase}" aria-hidden="true"><use href="#i-${nombre}"/></svg>`;

// Ilustraciones de las piezas (vector, sin fotos inventadas)
const AZ = '#0066CC', AZC = '#7FB8F0', GR = '#94A3B8', GRO = '#475569';
export const PIEZAS = {
  'cinta': `<svg viewBox="0 0 120 90"><path d="M20 70c0-30 20-50 40-50s40 20 40 50" fill="none" stroke="${AZC}" stroke-width="10" stroke-linecap="round"/><path d="M20 70c0-30 20-50 40-50s40 20 40 50" fill="none" stroke="${AZ}" stroke-width="2" stroke-dasharray="4 5"/><circle cx="20" cy="74" r="8" fill="${GR}"/><circle cx="100" cy="74" r="8" fill="${GR}"/></svg>`,
  'recogedor': `<svg viewBox="0 0 120 90"><rect x="38" y="10" width="44" height="70" rx="8" fill="#E2E8F0" stroke="${GR}" stroke-width="3"/><circle cx="60" cy="40" r="16" fill="${AZC}" stroke="${AZ}" stroke-width="3"/><circle cx="60" cy="40" r="5" fill="${AZ}"/><rect x="55" y="56" width="10" height="34" fill="${AZC}" stroke="${AZ}" stroke-width="2"/></svg>`,
  'lama-aluminio': `<svg viewBox="0 0 120 90"><path d="M8 34h104v14H8z" fill="#CBD5E1"/><path d="M8 34h104v4H8z" fill="#F1F5F9"/><path d="M8 48h104v4H8z" fill="${GRO}"/><path d="M8 54h104v14H8z" fill="#CBD5E1" opacity=".6"/><path d="M14 44h8M34 44h8M54 44h8M74 44h8M94 44h8" stroke="${GRO}" stroke-width="2"/></svg>`,
  'lama-pvc': `<svg viewBox="0 0 120 90"><path d="M8 32h104v16H8z" fill="#F8FAFC" stroke="${GR}" stroke-width="2"/><path d="M8 32h104v4H8z" fill="#fff"/><path d="M8 54h104v16H8z" fill="#F8FAFC" stroke="${GR}" stroke-width="2" opacity=".7"/><path d="M14 42h8M34 42h8M54 42h8M74 42h8M94 42h8" stroke="${GR}" stroke-width="2"/></svg>`,
  'eje': `<svg viewBox="0 0 120 90"><rect x="10" y="34" width="100" height="22" rx="11" fill="${GR}"/><rect x="10" y="34" width="100" height="7" rx="3.5" fill="#E2E8F0"/><path d="M30 34v22M50 34v22M70 34v22M90 34v22" stroke="${GRO}" stroke-width="2" opacity=".5"/><circle cx="10" cy="45" r="11" fill="${GRO}"/></svg>`,
  'polea': `<svg viewBox="0 0 120 90"><circle cx="60" cy="45" r="32" fill="#E2E8F0" stroke="${GR}" stroke-width="4"/><circle cx="60" cy="45" r="22" fill="none" stroke="${AZ}" stroke-width="6"/><circle cx="60" cy="45" r="7" fill="${GRO}"/><path d="M60 13v10M60 67v10M28 45h10M82 45h10" stroke="${GR}" stroke-width="3"/></svg>`,
  'topes': `<svg viewBox="0 0 120 90"><rect x="20" y="36" width="80" height="14" rx="3" fill="#CBD5E1"/><rect x="32" y="22" width="16" height="22" rx="4" fill="${AZ}"/><rect x="72" y="22" width="16" height="22" rx="4" fill="${AZ}"/><rect x="20" y="56" width="80" height="14" rx="3" fill="#CBD5E1" opacity=".6"/></svg>`,
  'guias': `<svg viewBox="0 0 120 90"><path d="M30 6v78M90 6v78" stroke="${GR}" stroke-width="14"/><path d="M30 6v78M90 6v78" stroke="#E2E8F0" stroke-width="4"/><path d="M37 30h46M37 44h46M37 58h46" stroke="${AZC}" stroke-width="10"/></svg>`
};

// Banderas para el selector de idioma (con sus colores, no heredan currentColor)
export const BANDERAS = {
  es: '<svg class="bandera" viewBox="0 0 3 2" aria-hidden="true"><rect width="3" height="2" fill="#AA151B"/><rect y=".5" width="3" height="1" fill="#F1BF00"/></svg>',
  gl: '<svg class="bandera" viewBox="0 0 3 2" aria-hidden="true"><rect width="3" height="2" fill="#fff"/><path d="M0 0h.5L3 1.62V2h-.5L0 .38z" fill="#0090D0"/></svg>'
};
