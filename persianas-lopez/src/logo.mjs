// Logo recreado a partir del cartel de la tienda: franjas azules como lamas,
// "Persianas" en blanco sobre la franja superior y "López" grande en cursiva.
// Si el negocio tiene el archivo original del logo, sustituir este SVG por ese.

export function logo({ clase = '', titulo = 'Persianas López' } = {}) {
  return `<svg class="logo ${clase}" viewBox="0 0 168 64" role="img" aria-label="${titulo}">
  <g class="logo-lamas">
    <path d="M16 4H168V20H9Z" fill="#2F86DC"/>
    <path d="M9 25H168V33H6Z" fill="#7FB8F0"/>
    <path d="M6 37H168V44H4Z" fill="#2F86DC"/>
    <path d="M4 48H168V53H2Z" fill="#A9D0F5"/>
  </g>
  <text x="26" y="16.5" fill="#fff" font-family="'Plus Jakarta Sans', sans-serif" font-style="italic" font-weight="800" font-size="13" letter-spacing=".4">Persianas</text>
  <text x="12" y="58" fill="#0A3F8F" stroke="#fff" stroke-width="3.5" paint-order="stroke" stroke-linejoin="round" font-family="'Plus Jakarta Sans', sans-serif" font-style="italic" font-weight="800" font-size="37" letter-spacing="-.5">López</text>
</svg>`;
}

// Favicon: las mismas franjas con la "L" del logo
export const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#fff"/><path d="M10 10h50v9H6Z" fill="#2F86DC"/><path d="M8 24h52v6H6Z" fill="#7FB8F0"/><path d="M6 35h54v6H4Z" fill="#2F86DC"/><path d="M5 46h55v5H3Z" fill="#A9D0F5"/><path d="M27 12h11l-6.5 30H45l-2 9H17Z" fill="#0A3F8F" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
