/* Saca Bin-y-Cami-Cakes-lo-que-falta.png (para WhatsApp) y .pdf (para imprimir)
   del mismo lista.html.

   Uso:   node pinta-lista.mjs [carpeta]
   Sin argumento usa la carpeta donde está este archivo. Necesita playwright y
   un Chromium; la ruta del Chromium se puede cambiar con CHROMIUM_PATH.

   Antes de pintar comprueba tres cosas, porque una lista que se le manda a
   una clienta no puede llevar un «21 cosas» que sean 20:
     1. que las casillas dibujadas sumen lo que dicen los contadores de cada bloque
     2. que sumen lo que dice el «N cosas» del pie
     3. que ningún texto se salga de su columna */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const carpeta = path.resolve(process.argv[2] || path.dirname(fileURLToPath(import.meta.url)));
const b = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport:{ width:1200, height:1800 }, deviceScaleFactor:2 });
await p.goto('file://' + path.join(carpeta, 'lista.html'), { waitUntil:'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(500);

const r = await p.evaluate(() => {
  const cajas = document.querySelectorAll('.caja').length;
  const contadores = [...document.querySelectorAll('.cuantos')].map(e => +e.textContent);
  const porBloque = [...document.querySelectorAll('.bloque')].map(bq => bq.querySelectorAll('.caja').length);
  const sello = +(document.querySelector('.sello').textContent.match(/\d+/) || [0])[0];
  const h = document.querySelector('.hoja').getBoundingClientRect();
  const cols = [...document.querySelectorAll('.col')].map(c => Math.round(c.getBoundingClientRect().height));
  const fuera = [];
  document.querySelectorAll('.col').forEach(col => {
    const cr = col.getBoundingClientRect();
    col.querySelectorAll('.txt, .titulo-bloque').forEach(e => {
      if (e.getBoundingClientRect().right > cr.right + 1) fuera.push(e.textContent.trim().slice(0, 40));
    });
  });
  return { cajas, contadores, porBloque, sello, w: Math.round(h.width), h: Math.round(h.height), cols, fuera };
});

let mal = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ❌ ') + m); if (!c) mal++; };
ok(JSON.stringify(r.contadores) === JSON.stringify(r.porBloque),
   `cada bloque suma lo que dice su contador: ${JSON.stringify(r.porBloque)}`);
ok(r.cajas === r.sello, `el pie dice «${r.sello} cosas» y hay ${r.cajas} casillas`);
ok(r.fuera.length === 0, 'ningún texto se sale de su columna' + (r.fuera.length ? ': ' + r.fuera.join(' | ') : ''));
console.log(`  · hoja ${r.w}×${r.h}px (A4 = 1200×1697) · alto de las columnas: ${r.cols.join(' / ')}`);
if (mal) { console.log('\nNO se pinta: arregla lista.html'); await b.close(); process.exit(1); }

await p.setViewportSize({ width:r.w, height:r.h });
await p.waitForTimeout(300);
await p.screenshot({ path: path.join(carpeta, 'Bin-y-Cami-Cakes-lo-que-falta.png') });
await p.pdf({ path: path.join(carpeta, 'Bin-y-Cami-Cakes-lo-que-falta.pdf'),
              width:`${r.w}px`, height:`${r.h}px`, printBackground:true,
              margin:{ top:'0', bottom:'0', left:'0', right:'0' } });
console.log('\nPNG y PDF listos en', carpeta);
await b.close();
