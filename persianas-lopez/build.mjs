// Genera el sitio estático en dist/: páginas en castellano y gallego, estilos compilados,
// tipografías propias, imagen para compartir, sitemap y fotos en WebP.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, basename } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { SITIO } from './src/config.mjs';
import { FAVICON, logo } from './src/logo.mjs';
import es from './src/content/es.mjs';
import gl from './src/content/gl.mjs';
import { paginaInicio, paginaServicio, paginaCatalogo, paginaLegal, pagina404 } from './src/templates/pages.mjs';

const raiz = dirname(fileURLToPath(import.meta.url));
const dist = join(raiz, 'dist');
const require = createRequire(import.meta.url);
const modulo = (p) => dirname(require.resolve(`${p}/package.json`));

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

function escribir(ruta, html) {
  const archivo = ruta.endsWith('.html') ? join(dist, ruta) : join(dist, ruta, 'index.html');
  mkdirSync(dirname(archivo), { recursive: true });
  writeFileSync(archivo, html);
}

/* ---------- Páginas ---------- */
// Cada página se genera en los dos idiomas y cada versión enlaza a la otra (hreflang y botón de idioma)
const idiomas = [es, gl];
const otro = (t) => (t.lang === 'es' ? gl : es);
const urls = [];

function pagina(rutaDe, generar) {
  for (const t of idiomas) {
    const ruta = rutaDe(t);
    const rutaAlt = rutaDe(otro(t));
    escribir(ruta, generar(t, rutaAlt));
    urls.push({ ruta, alt: rutaAlt, lang: t.lang });
  }
}

pagina((t) => t.rutas.inicio, (t, alt) => paginaInicio(t, alt));
pagina((t) => t.rutas.catalogo, (t, alt) => paginaCatalogo(t, alt));
for (const clave of ['aviso', 'privacidad', 'cookies', 'condiciones']) {
  pagina((t) => t.rutas[clave], (t, alt) => paginaLegal(t, clave, alt));
}
es.servicios.forEach((_, i) => {
  pagina((t) => t.rutas.servicio(t.servicios[i].slug), (t, alt) => paginaServicio(t, t.servicios[i], alt));
});
escribir('404.html', pagina404(es, gl.rutas.inicio));

/* ---------- Estilos y scripts ---------- */
mkdirSync(join(dist, 'assets'), { recursive: true });
execFileSync(process.execPath, [
  join(modulo('tailwindcss'), 'lib/cli.js'),
  '-c', join(raiz, 'tailwind.config.cjs'),
  '-i', join(raiz, 'src/styles.css'),
  '-o', join(dist, 'assets/styles.css'),
  '--minify'
], { stdio: 'inherit', cwd: raiz });
for (const js of readdirSync(join(raiz, 'src/assets'))) cpSync(join(raiz, 'src/assets', js), join(dist, 'assets', js));

/* ---------- Tipografías (solo el subconjunto latino, que cubre castellano y gallego) ---------- */
mkdirSync(join(dist, 'fonts'), { recursive: true });
const jakarta = join(modulo('@fontsource-variable/plus-jakarta-sans'), 'files');
const bricolage = join(modulo('@fontsource-variable/bricolage-grotesque'), 'files');
cpSync(join(jakarta, 'plus-jakarta-sans-latin-wght-normal.woff2'), join(dist, 'fonts/jakarta.woff2'));
cpSync(join(jakarta, 'plus-jakarta-sans-latin-wght-italic.woff2'), join(dist, 'fonts/jakarta-italic.woff2'));
cpSync(join(bricolage, 'bricolage-grotesque-latin-wght-normal.woff2'), join(dist, 'fonts/bricolage.woff2'));

/* ---------- Favicon, icono de iOS e imagen para compartir ---------- */
writeFileSync(join(dist, 'favicon.svg'), FAVICON);
const { Resvg } = await import('@resvg/resvg-js');
const ttf = (pkg, carpeta, archivo) => join(modulo(pkg), carpeta, archivo);
const fuentes = {
  fontFiles: [
    ttf('@expo-google-fonts/plus-jakarta-sans', '800ExtraBold_Italic', 'PlusJakartaSans_800ExtraBold_Italic.ttf'),
    ttf('@expo-google-fonts/plus-jakarta-sans', '600SemiBold', 'PlusJakartaSans_600SemiBold.ttf'),
    ttf('@expo-google-fonts/bricolage-grotesque', '800ExtraBold', 'BricolageGrotesque_800ExtraBold.ttf')
  ],
  loadSystemFonts: false,
  defaultFontFamily: 'Plus Jakarta Sans'
};
const png = (svg, ancho) => new Resvg(svg, { font: fuentes, fitTo: { mode: 'width', value: ancho } }).render().asPng();

writeFileSync(join(dist, 'apple-touch-icon.png'), png(FAVICON, 180));

const logoOg = logo().replace('<svg class="logo "', '<svg x="96" y="92" width="420" height="160"').replace(/ role="img" aria-label="[^"]*"/, '');
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0052A3"/><stop offset=".55" stop-color="#003D7A"/><stop offset="1" stop-color="#001833"/></linearGradient>
    <pattern id="l" width="1200" height="36" patternUnits="userSpaceOnUse"><rect width="1200" height="28" fill="#fff" opacity=".07"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#f)"/>
  <rect width="1200" height="630" fill="url(#l)"/>
  <circle cx="1080" cy="560" r="260" fill="#FFD23F" opacity=".14"/>
  <rect x="64" y="64" width="484" height="216" rx="32" fill="#fff"/>
  ${logoOg}
  <text x="72" y="380" fill="#fff" font-family="Bricolage Grotesque" font-weight="800" font-size="62">Instalación y reparación</text>
  <text x="72" y="452" fill="#fff" font-family="Bricolage Grotesque" font-weight="800" font-size="62">de persianas en Ourense</text>
  <text x="72" y="530" fill="#FFD23F" font-family="Plus Jakarta Sans" font-weight="600" font-size="34">${SITIO.direccion} · Tel. ${SITIO.telefonoVisible}</text>
  <text x="72" y="578" fill="#D6E8FF" font-family="Plus Jakarta Sans" font-weight="600" font-size="28">Mosquiteras · Estores · Mamparas · Repuestos</text>
</svg>`;
writeFileSync(join(dist, 'og.png'), png(og, 1200));

/* ---------- Código QR para la tarjeta, el escaparate y la furgoneta: abre el asistente ---------- */
const QRCode = (await import('qrcode')).default;
mkdirSync(join(dist, 'qr'), { recursive: true });
for (const t of [es, gl]) {
  const url = `${SITIO.url}${t.rutas.inicio}?abrir=asistente`;
  const svg = await QRCode.toString(url, { type: 'svg', margin: 2, errorCorrectionLevel: 'M', color: { dark: '#141B53', light: '#FFFFFF' } });
  writeFileSync(join(dist, 'qr', `asistente-${t.lang}.svg`), svg);
  writeFileSync(join(dist, 'qr', `asistente-${t.lang}.png`), png(svg, 1024));
}

/* ---------- Fotos: cualquier JPG/PNG en src/fotos se publica en WebP ---------- */
const carpetaFotos = join(raiz, 'src/fotos');
const fotos = existsSync(carpetaFotos) ? readdirSync(carpetaFotos).filter((f) => /\.(jpe?g|png)$/i.test(f)) : [];
if (fotos.length) {
  const sharp = (await import('sharp')).default;
  mkdirSync(join(dist, 'fotos'), { recursive: true });
  for (const f of fotos) {
    const nombre = basename(f, extname(f));
    await sharp(join(carpetaFotos, f)).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 78 }).toFile(join(dist, 'fotos', `${nombre}.webp`));
    await sharp(join(carpetaFotos, f)).rotate().resize({ width: 800, withoutEnlargement: true }).webp({ quality: 74 }).toFile(join(dist, 'fotos', `${nombre}-800.webp`));
  }
}

/* ---------- Sitemap y robots ---------- */
const hoy = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((u) => {
  const esR = u.lang === 'es' ? u.ruta : u.alt, glR = u.lang === 'gl' ? u.ruta : u.alt;
  return `  <url><loc>${SITIO.url}${u.ruta}</loc><lastmod>${hoy}</lastmod><xhtml:link rel="alternate" hreflang="es" href="${SITIO.url}${esR}"/><xhtml:link rel="alternate" hreflang="gl" href="${SITIO.url}${glR}"/></url>`;
}).join('\n')}
</urlset>
`;
writeFileSync(join(dist, 'sitemap.xml'), sitemap);
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITIO.url}/sitemap.xml\n`);

console.log(`Listo: ${urls.length} páginas, ${fotos.length} fotos en WebP.`);
