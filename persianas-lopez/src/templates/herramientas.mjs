// Secciones de las herramientas: diagnóstico, probador, guía de medidas, antes y después,
// avisos de temporada y guías «Arréglala tú». La interacción está en src/assets/herramientas.js.
import { SITIO, ANTES_DESPUES, VIDEOS, wa } from '../config.mjs';
import { ico } from '../icons.mjs';

const chipClase = 'glass glass-light inline-flex rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[.25em] text-brand-600';
const h2Clase = 'mt-5 font-display text-[2rem] font-extrabold leading-tight tracking-tight text-brand-950 sm:text-5xl';
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

const cabecera = (id, { chip, titulo, texto }) => `
        <div class="reveal mx-auto max-w-2xl text-center">
          <p class="${chipClase}">${chip}</p>
          <h2 id="${id}-titulo" class="${h2Clase}">${titulo}</h2>
          <p class="mt-5 text-lg leading-relaxed text-slate-600">${texto}</p>
        </div>`;

const piezaNombre = (t, id) => (t.catalogo.piezas.find((p) => p.id === id) || {}).nombre || '';

/* ---------- Diagnóstico ---------- */
export function seccionDiagnostico(t) {
  const d = t.herramientas.diagnostico;
  const iconos = { nosube: 'arriba', cinta: 'regla', caida: 'caja', lamas: 'engranaje', ruido: 'rayo' };
  const datos = {
    ...d,
    wa: SITIO.whatsapp,
    piezas: Object.fromEntries(t.catalogo.piezas.map((p) => [p.id, p.nombre])),
    catalogo: t.rutas.catalogo,
    reservarMensaje: t.herramientas.reservarMensaje
  };
  return `
    <section id="diagnostico" class="scroll-mt-20 pb-16 sm:pb-24" aria-labelledby="diagnostico-titulo">
      <div class="mx-auto max-w-5xl px-5 sm:px-8">
${cabecera('diagnostico', d)}
        <div id="diag" class="reveal glass glass-light mt-10 rounded-[2rem] p-5 sm:p-8" aria-live="polite">
          <div class="mb-5 flex items-center gap-2" aria-hidden="true"><span class="diag-punto is-on"></span><span class="diag-punto"></span><span class="diag-punto"></span></div>
          <div data-paso="1">
            <p class="font-display text-xl font-bold text-brand-950 sm:text-2xl">${d.pregunta}</p>
            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              ${d.sintomas.map((s) => `<button type="button" data-sintoma="${s.id}" class="diag-opcion">${ico(iconos[s.id] || 'chevron', 'h-5 w-5 shrink-0 text-brand-600')}<span>${s.etiqueta}</span></button>`).join('')}
            </div>
          </div>
          <div data-paso="2" hidden></div>
          <div data-paso="3" hidden></div>
        </div>
      </div>
      <script type="application/json" id="datos-diagnostico">${json(datos)}</script>
    </section>`;
}

/* ---------- Probador ---------- */
export function seccionProbador(t) {
  const p = t.herramientas.probador;
  const m0 = p.modelos[0];
  return `
    <section id="probador" class="scroll-mt-20 pb-16 sm:pb-24" aria-labelledby="probador-titulo">
      <div class="mx-auto max-w-7xl px-5 sm:px-8">
${cabecera('probador', p)}
        <div class="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          <div class="reveal glass glass-light rounded-[2rem] p-2.5">
            <div id="prob-lienzo" class="relative aspect-[4/3] touch-none select-none overflow-hidden rounded-[1.6rem] bg-slate-200">
              <img id="prob-foto" src="/assets/ventana-ejemplo.svg" alt="${p.ejemplo}" class="absolute inset-0 h-full w-full object-cover" draggable="false">
              <div id="prob-modelo" class="prob-modelo absolute cursor-move" style="left:22%;top:10%;width:56%;height:72%" data-modelo="${m0.id}">
                <div class="prob-cajon"></div>
                <div class="prob-tela" style="--a:${m0.colores[0][1]};--b:${m0.colores[0][2]};height:55%"></div>
                <span class="prob-asa" aria-hidden="true"></span>
              </div>
            </div>
            <p class="px-3 py-2.5 text-xs text-slate-500">${p.ayuda}</p>
          </div>
          <div class="reveal desde-der glass glass-light space-y-5 rounded-[2rem] p-5 sm:p-6">
            <div>
              <label class="btn btn-azul w-full cursor-pointer px-5 py-3.5 text-sm">${ico('camara')} ${p.subir}<input id="prob-archivo" type="file" accept="image/*" class="sr-only"></label>
              <p class="mt-2 flex items-center gap-1.5 text-xs text-slate-500">${ico('escudo', 'h-4 w-4 text-brand-600')} ${p.privado}</p>
            </div>
            <fieldset>
              <legend class="text-sm font-bold text-brand-950">${p.modelo}</legend>
              <div id="prob-modelos" class="mt-2 flex flex-wrap gap-2">
                ${p.modelos.map((m, i) => `<button type="button" data-modelo="${m.id}" aria-pressed="${i === 0}" class="prob-chip">${m.nombre}</button>`).join('')}
              </div>
            </fieldset>
            <fieldset>
              <legend class="text-sm font-bold text-brand-950">${p.color}: <span id="prob-color-nombre" class="font-semibold text-slate-600">${m0.colores[0][0]}</span></legend>
              <div id="prob-colores" class="mt-2 flex flex-wrap gap-2"></div>
            </fieldset>
            <label class="block text-sm font-bold text-brand-950">${p.bajada}
              <input id="prob-bajada" type="range" min="10" max="100" value="55" class="mt-2 w-full accent-brand-600">
            </label>
            <a id="prob-pedir" href="${wa(p.mensaje.replace('{modelo}', m0.nombre.toLowerCase()).replace('{color}', m0.colores[0][0].toLowerCase()))}" target="_blank" rel="noopener" data-medir="probador" class="btn btn-verde w-full px-5 py-3.5 text-sm">${ico('whatsapp')} ${p.pedir}</a>
            <a href="#medir" class="block text-center text-sm font-semibold text-brand-700 underline">${t.herramientas.medir.titulo}</a>
          </div>
        </div>
      </div>
      <script type="application/json" id="datos-probador">${json({ modelos: p.modelos, mensaje: p.mensaje, wa: SITIO.whatsapp })}</script>
    </section>`;
}

/* ---------- Guía de medidas ---------- */
const DIBUJOS_MEDIR = [
  // Ancho: tres flechas horizontales
  '<svg viewBox="0 0 120 90" aria-hidden="true"><rect x="20" y="10" width="80" height="70" rx="3" fill="#E6F1FB" stroke="#0A6CD0" stroke-width="3"/><g stroke="#F2B600" stroke-width="3" stroke-linecap="round"><path d="M26 24h68M26 45h68M26 66h68"/><path d="M30 20l-4 4 4 4M90 20l4 4-4 4M30 41l-4 4 4 4M90 41l4 4-4 4M30 62l-4 4 4 4M90 62l4 4-4 4" fill="none"/></g></svg>',
  // Alto: dos flechas verticales
  '<svg viewBox="0 0 120 90" aria-hidden="true"><rect x="20" y="10" width="80" height="70" rx="3" fill="#E6F1FB" stroke="#0A6CD0" stroke-width="3"/><g stroke="#F2B600" stroke-width="3" stroke-linecap="round" fill="none"><path d="M34 16v58M86 16v58"/><path d="M30 20l4-4 4 4M30 70l4 4 4-4M82 20l4-4 4 4M82 70l4 4 4-4"/></g></svg>',
  // Cajón abierto
  '<svg viewBox="0 0 120 90" aria-hidden="true"><rect x="16" y="8" width="88" height="20" rx="3" fill="#0E3060"/><path d="M16 28l10 10h68l10-10" fill="#CFE6F8" stroke="#0A6CD0" stroke-width="2"/><circle cx="60" cy="18" r="6" fill="#6EB3E4"/><rect x="22" y="38" width="76" height="44" rx="2" fill="#E6F1FB" stroke="#0A6CD0" stroke-width="3"/><path d="M28 46h64M28 54h64M28 62h64" stroke="#6EB3E4" stroke-width="5"/></svg>'
];

export function seccionMedir(t) {
  const m = t.herramientas.medir;
  return `
    <section id="medir" class="scroll-mt-20 pb-16 sm:pb-24" aria-labelledby="medir-titulo">
      <div class="mx-auto max-w-7xl px-5 sm:px-8">
${cabecera('medir', m)}
        <ol class="mt-10 grid gap-5 md:grid-cols-3">
          ${m.pasos.map(([titulo, texto], i) => `<li class="reveal glass glass-light rounded-[2rem] p-6" style="--d:${i * 100}ms">
            <div class="medir-dibujo">${DIBUJOS_MEDIR[i]}</div>
            <p class="mt-4 font-display text-xl font-bold text-brand-950"><span class="text-brand-500">${i + 1}.</span> ${titulo}</p>
            <p class="mt-1.5 text-sm leading-relaxed text-slate-600">${texto}</p>
          </li>`).join('')}
        </ol>
        <form id="medir-form" class="reveal glass glass-light mx-auto mt-6 grid max-w-3xl gap-4 rounded-[2rem] p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6" novalidate>
          <label class="text-sm font-bold text-brand-950">${m.ancho}<input id="medir-ancho" type="number" inputmode="numeric" min="20" max="400" class="medir-campo" placeholder="120"></label>
          <label class="text-sm font-bold text-brand-950">${m.alto}<input id="medir-alto" type="number" inputmode="numeric" min="20" max="400" class="medir-campo" placeholder="150"></label>
          <button type="submit" id="medir-usar" data-abrir-chat data-servicio="nueva" class="btn btn-sol shine px-5 py-3.5 text-sm">${ico('calculadora')} ${m.usar}</button>
          <p id="medir-info" class="text-sm text-slate-600 sm:col-span-3" aria-live="polite" data-superficie="${m.superficie}" data-error="${m.error}"></p>
        </form>
      </div>
    </section>`;
}

/* ---------- Antes y después (solo con fotos propias en config.mjs) ---------- */
export function seccionAntesDespues(t) {
  if (!ANTES_DESPUES.length) return '';
  const a = t.herramientas.antesDespues;
  return `
    <section id="antes-despues" class="scroll-mt-20 pb-16 sm:pb-24" aria-labelledby="antes-despues-titulo">
      <div class="mx-auto max-w-7xl px-5 sm:px-8">
${cabecera('antes-despues', a)}
        <div class="mt-10 grid gap-6 md:grid-cols-2">
          ${ANTES_DESPUES.map((x) => `<figure class="reveal glass glass-light rounded-[2rem] p-2.5">
            <div class="comparador relative aspect-[4/3] overflow-hidden rounded-[1.6rem]" style="--pos:50%">
              <img src="/fotos/${x.despues}-800.webp" alt="${a.despues}: ${x[t.lang]}" loading="lazy" class="absolute inset-0 h-full w-full object-cover">
              <img src="/fotos/${x.antes}-800.webp" alt="${a.antes}: ${x[t.lang]}" loading="lazy" class="comparador-antes absolute inset-0 h-full w-full object-cover">
              <span class="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">${a.antes}</span>
              <span class="absolute right-3 top-3 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white">${a.despues}</span>
              <span class="comparador-linea" aria-hidden="true"></span>
              <input type="range" min="0" max="100" value="50" class="comparador-rango" aria-label="${a.deslizar}">
            </div>
            <figcaption class="px-3 py-3 font-display font-bold text-brand-950">${x[t.lang]}</figcaption>
          </figure>`).join('')}
        </div>
      </div>
    </section>`;
}

/* ---------- Avisos de temporada (el script muestra el del mes actual) ---------- */
export const avisosTemporada = (t) => t.herramientas.temporadas.map((x) => {
  const s = t.servicios.find((y) => y.id === x.servicio);
  return `<a href="${t.rutas.servicio(s.slug)}" data-meses="${x.meses.join(',')}" hidden class="temporada hero-item mt-3 inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-lg sm:text-sm">${ico('sol', 'h-4 w-4 text-accent')} ${x.texto} ${ico('derecha', 'h-4 w-4')}</a>`;
}).join('');

/* ---------- Guías «Arréglala tú» (página de repuestos) ---------- */
export function seccionGuias(t) {
  const g = t.herramientas.guias;
  return `
    <section id="guias" class="scroll-mt-24 pb-16 sm:pb-24" aria-labelledby="guias-titulo">
      <div class="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 id="guias-titulo" class="reveal font-display text-[2rem] font-extrabold tracking-tight text-brand-950 sm:text-5xl">${g.titulo}</h2>
        <p class="reveal mt-3 max-w-2xl text-lg leading-relaxed text-slate-600">${g.texto}</p>
        <div class="mt-8 grid gap-5 lg:grid-cols-3">
          ${g.lista.map((x, i) => `<details id="guia-${x.id}" class="reveal glass glass-light group scroll-mt-28 rounded-[2rem] p-6" style="--d:${i * 100}ms">
            <summary class="flex cursor-pointer list-none items-start justify-between gap-4">
              <span>
                <span class="block font-display text-xl font-bold text-brand-950">${x.titulo}</span>
                <span class="mt-1 block text-sm text-slate-500">${g.tiempo}: ${x.tiempo}</span>
              </span>
              ${ico('chevron', 'chevron mt-1 text-brand-600 transition-transform duration-300')}
            </summary>
            <div class="respuesta mt-4 text-sm leading-relaxed text-slate-700">
              <p><strong class="text-brand-950">${g.necesitas}:</strong> ${x.necesitas}</p>
              <ol class="guia-pasos mt-3">${x.pasos.map((p) => `<li>${p}</li>`).join('')}</ol>
              <p class="mt-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-amber-900">${ico('escudo', 'h-4 w-4 shrink-0')} ${x.aviso}</p>
              <div class="mt-4 flex flex-wrap gap-2">
                <a href="${wa(t.herramientas.reservarMensaje.replace('{pieza}', piezaNombre(t, x.pieza).toLowerCase()))}" target="_blank" rel="noopener" data-medir="reserva" class="btn btn-verde px-4 py-2.5 text-xs">${ico('whatsapp', 'h-4 w-4')} ${g.pedirPieza}</a>
                ${VIDEOS[x.id] ? `<a href="${VIDEOS[x.id]}" target="_blank" rel="noopener" class="btn btn-azul px-4 py-2.5 text-xs">${ico('camara', 'h-4 w-4')} ${g.video}</a>` : ''}
              </div>
            </div>
          </details>`).join('')}
        </div>
      </div>
    </section>`;
}
