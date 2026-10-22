import { SITIO, ANALITICA, PRECIOS, HORARIO, wa } from '../config.mjs';
import { SPRITE, ico } from '../icons.mjs';
import { logo } from '../logo.mjs';

// Banderas para el selector de idioma (con sus colores, no heredan currentColor)
const BANDERAS = {
  es: '<svg class="bandera" viewBox="0 0 3 2" aria-hidden="true"><rect width="3" height="2" fill="#AA151B"/><rect y=".5" width="3" height="1" fill="#F1BF00"/></svg>',
  gl: '<svg class="bandera" viewBox="0 0 3 2" aria-hidden="true"><rect width="3" height="2" fill="#fff"/><path d="M0 0h.5L3 1.62V2h-.5L0 .38z" fill="#0090D0"/></svg>'
};

// Primera capa de información de protección de datos (contacto y asistente)
export const capaBasica = (t) => `<dl class="capa-basica">${t.legal.basica(SITIO).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl><p class="mt-3"><a href="${t.rutas.privacidad}" class="font-semibold text-brand-700 underline">${t.ui.masInfoDatos}</a></p>`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Ruta a un ancla de la portada: en la portada basta con '#id'
export const ancla = (t, a, esInicio) => (esInicio ? a : `${t.rutas.inicio}${a}`);

export function layout({ t, title, description, ruta, rutaAlt, cuerpo, esInicio = false, schema = [], extraScripts = '', ogTipo = 'website', noindex = false }) {
  const url = SITIO.url + ruta;
  const altLang = t.otroIdioma.codigo;
  const rutaEs = t.lang === 'es' ? ruta : rutaAlt;
  const rutaGl = t.lang === 'gl' ? ruta : rutaAlt;
  const u = t.ui;
  const idiomas = [['es', 'Español', rutaEs], ['gl', 'Galego', rutaGl]];

  const navDesktop = t.nav.map((n) => `<li><a href="${ancla(t, n.ancla, esInicio)}" data-spy="${n.id}" class="nav-link block rounded-full px-4 py-2 transition hover:bg-white/80">${n.etiqueta}</a></li>`).join('');
  const navMenu = t.nav.map((n, i) => `
            <li class="menu-item" style="--i:${i + 1}">
              <a href="${ancla(t, n.ancla, esInicio)}" data-spy="${n.id}" class="menu-enlace group flex items-center gap-5 rounded-3xl px-3 py-3 transition hover:bg-white/10 sm:px-5">
                <span class="font-display text-sm font-bold text-brand-300">0${i + 1}</span>
                <span class="flex-1"><span class="block font-display text-4xl font-extrabold tracking-tight sm:text-6xl">${n.etiqueta}</span><span class="mt-1 block text-sm text-brand-100/80">${n.desc}</span></span>
                ${ico('derecha', 'flecha h-8 w-8 text-accent')}
              </a>
            </li>`).join('');

  // La analítica no se carga aquí: app.js la añade solo si se acepta en el panel de cookies
  const hayAnalitica = !!(ANALITICA.goatcounter || ANALITICA.vercel);
  const analitica = hayAnalitica ? `<script type="application/json" id="config-analitica">${JSON.stringify(ANALITICA)}</script>` : '';

  const datosChat = JSON.stringify({
    ...t.chat, wa: SITIO.whatsapp, tel: SITIO.telefono, precios: PRECIOS,
    basica: t.legal.basica(SITIO), privacidadUrl: t.rutas.privacidad, condicionesUrl: t.rutas.condiciones
  });

  return `<!DOCTYPE html>
<html lang="${t.lang}" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <script>document.documentElement.classList.add('js');</script>
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow'}">
  <meta name="geo.region" content="ES-GA">
  <meta name="geo.placename" content="Ourense">
  <meta name="theme-color" content="#0066CC">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="es" href="${SITIO.url}${rutaEs}">
  <link rel="alternate" hreflang="gl" href="${SITIO.url}${rutaGl}">
  <link rel="alternate" hreflang="x-default" href="${SITIO.url}${rutaEs}">
  <meta property="og:type" content="${ogTipo}">
  <meta property="og:locale" content="${t.locale}">
  <meta property="og:site_name" content="Persianas López">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITIO.url}/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Persianas López · Persianas en Ourense · ${SITIO.telefonoVisible}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preload" href="/fonts/jakarta.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/bricolage.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/styles.css">
  ${schema.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n  ')}
  ${analitica}
</head>
<body class="font-sans text-slate-800 antialiased">
${SPRITE}
  <a href="#contenido" class="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-brand-900">${u.saltar}</a>
  <div class="aurora" aria-hidden="true"><span></span><span></span><span></span></div>
  <div id="progreso" class="fixed left-0 top-0 z-[60] h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-accent via-yellow-300 to-brand-300" aria-hidden="true"></div>

  <header id="cabecera" class="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
    <nav class="glass glass-light mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 rounded-2xl pl-2 pr-2 sm:pl-3" aria-label="${t.lang === 'gl' ? 'Navegación principal' : 'Navegación principal'}">
      <a href="${esInicio ? '#inicio' : t.rutas.inicio}" class="marca flex items-center rounded-xl bg-white/80 px-2 py-0.5 ring-1 ring-white" aria-label="${u.inicioAria}">
        ${logo({ clase: 'h-[3.25rem] w-auto' })}
      </a>
      <ul class="hidden items-center gap-1 rounded-full bg-white/40 p-1 text-sm font-semibold text-slate-700 ring-1 ring-white/70 xl:flex">
        ${navDesktop}
      </ul>
      <div class="flex items-center gap-2">
        <div id="idioma" class="idioma relative">
          <button type="button" id="idioma-btn" class="inline-flex h-11 items-center gap-2 rounded-full bg-white/60 pl-2.5 pr-2 text-sm font-bold text-brand-800 ring-1 ring-white transition hover:bg-white" aria-haspopup="true" aria-expanded="false" aria-controls="idioma-lista" aria-label="Idioma: ${idiomas.find((i) => i[0] === t.lang)[1]}">
            ${BANDERAS[t.lang]}<span class="hidden md:inline">${t.lang.toUpperCase()}</span>${ico('chevron', 'idioma-flecha h-4 w-4')}
          </button>
          <ul id="idioma-lista" class="idioma-lista glass glass-light absolute right-0 top-full mt-2 w-48 rounded-2xl p-1.5">
            ${idiomas.map(([c, n, r]) => `<li><a href="${r}" hreflang="${c}" lang="${c}" data-idioma="${c}"${c === t.lang ? ' aria-current="true"' : ''} class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-white/90">${BANDERAS[c]}<span class="flex-1">${n}</span>${c === t.lang ? ico('check', 'h-4 w-4 text-brand-600') : ''}</a></li>`).join('')}
          </ul>
        </div>
        <a href="tel:${SITIO.telefono}" data-medir="llamada" class="btn btn-azul shine hidden h-11 w-11 p-0 sm:inline-flex" aria-label="${u.llamarAria}" title="${SITIO.telefonoVisible}">
          ${ico('telefono', 'h-5 w-5')}
        </a>
        <button id="menu-btn" type="button" class="menu-btn btn h-12 gap-3 bg-brand-900 pl-4 pr-5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_10px_24px_-10px_rgba(0,41,82,.9)]" aria-controls="menu-panel" aria-expanded="false" aria-label="${u.abrirMenu}" data-abrir="${u.abrirMenu}" data-cerrar="${u.cerrarMenu}" data-texto-abrir="${u.menu}" data-texto-cerrar="${u.cerrar}">
          <span class="hamburguesa relative block h-[16.5px] w-6" aria-hidden="true"><span></span><span></span><span></span></span>
          <span id="menu-texto" class="hidden sm:inline">${u.menu}</span>
        </button>
      </div>
    </nav>
  </header>

  <div id="menu" class="pointer-events-none fixed inset-0 z-40">
    <div id="menu-panel" class="menu-panel absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain bg-brand-950/80 text-white" role="dialog" aria-modal="true" aria-label="${u.menu}">
      <div class="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div class="absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-brand-500/40 blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-accent/20 blur-3xl"></div>
      </div>
      <div class="relative mx-auto grid min-h-full max-w-7xl gap-10 px-5 pb-12 pt-28 sm:px-8 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-16 lg:pt-32">
        <nav aria-label="${u.navegacion}">
          <p class="menu-item mb-6 text-xs font-bold uppercase tracking-[.3em] text-brand-200" style="--i:0">${u.navegacion}</p>
          <ul class="space-y-2">${navMenu}
          </ul>
        </nav>
        <aside class="menu-item glass glass-dark rounded-[2rem] p-6 sm:p-8" style="--i:6">
          <p class="font-display text-2xl font-extrabold">${u.atascada}</p>
          <p class="mt-2 text-brand-100/90">${u.atascadaTexto}</p>
          <div class="mt-6 grid gap-3">
            <button type="button" data-abrir-chat class="btn btn-sol shine px-6 py-4 text-base">${ico('calculadora')} ${u.abrirAsistente}</button>
            <a href="tel:${SITIO.telefono}" data-medir="llamada" class="btn btn-azul px-6 py-4 text-base" aria-label="${u.llamarAria}">${ico('telefono')} ${u.llamar} ${SITIO.telefonoVisible}</a>
            <a href="${wa(t.servicios[0].wa)}" target="_blank" rel="noopener" data-medir="whatsapp" class="btn btn-verde px-6 py-4 text-base" aria-label="${u.whatsappAria}">${ico('whatsapp')} ${u.escribirWa}</a>
          </div>
          <div class="mt-6 space-y-3 border-t border-white/15 pt-6 text-sm text-brand-100">
            <p class="flex items-center gap-3">${ico('ubicacion', 'text-accent')} ${SITIO.direccion} · ${SITIO.cp} ${SITIO.ciudad}</p>
            <p class="flex items-center gap-3">${ico('reloj', 'text-accent')} ${u.horarioTexto}</p>
            <a href="${rutaAlt}" hreflang="${altLang}" lang="${altLang}" data-idioma="${altLang}" class="flex items-center gap-3 font-semibold text-white hover:underline">${ico('globo', 'text-accent')} ${t.otroIdioma.etiqueta}</a>
          </div>
        </aside>
      </div>
    </div>
  </div>

  <main id="contenido">
${cuerpo}
  </main>

  <footer class="relative overflow-hidden bg-brand-950 pb-20 text-brand-100 sm:pb-0">
    <div class="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand-600/40 blur-3xl" aria-hidden="true"></div>
    <div class="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-3">
      <div>
        <a href="${t.rutas.inicio}" class="inline-flex rounded-xl bg-white px-3 py-2" aria-label="${u.inicioAria}">${logo({ clase: 'h-12 w-auto' })}</a>
        <p class="mt-4 text-sm leading-relaxed">${u.pie}</p>
        <p class="mt-4 text-sm">${SITIO.direccion}<br>${SITIO.cp} ${SITIO.ciudad}, ${SITIO.region}</p>
        <a href="tel:${SITIO.telefono}" data-medir="llamada" class="mt-2 inline-block text-sm font-semibold text-white hover:underline" aria-label="${u.llamarAria}">Tel. ${SITIO.telefonoVisible}</a>
      </div>
      <nav aria-label="${u.servicios}">
        <p class="font-display font-bold text-white">${u.servicios}</p>
        <ul class="mt-3 space-y-2 text-sm">
          ${t.servicios.map((s) => `<li><a href="${t.rutas.servicio(s.slug)}" class="hover:text-white hover:underline">${s.h1.replace(/ en Ourense$/, '')}</a></li>`).join('')}
          <li><a href="${t.rutas.catalogo}" class="hover:text-white hover:underline">${t.catalogo.h1}</a></li>
        </ul>
      </nav>
      <nav aria-label="${u.legal}">
        <p class="font-display font-bold text-white">${u.legal}</p>
        <ul class="mt-3 space-y-2 text-sm">
          <li><a href="${t.rutas.aviso}" class="hover:text-white hover:underline">${u.avisoLegal}</a></li>
          <li><a href="${t.rutas.privacidad}" class="hover:text-white hover:underline">${u.privacidad}</a></li>
          <li><a href="${t.rutas.cookies}" class="hover:text-white hover:underline">${u.cookies}</a></li>
          <li><a href="${t.rutas.condiciones}" class="hover:text-white hover:underline">${u.condiciones}</a></li>
          <li><button type="button" data-configurar-cookies class="hover:text-white hover:underline">${u.configurarCookies}</button></li>
          <li class="pt-2"><a href="${rutaAlt}" hreflang="${altLang}" lang="${altLang}" data-idioma="${altLang}" class="inline-flex items-center gap-2 font-semibold text-white hover:underline">${ico('globo', 'h-4 w-4')} ${t.otroIdioma.etiqueta}</a></li>
        </ul>
      </nav>
    </div>
    <div class="relative border-t border-white/10">
      <p class="mx-auto max-w-7xl px-5 py-6 text-center text-xs text-brand-200 sm:px-8">&copy; <span id="anio">2026</span> Persianas López · ${u.derechos}</p>
    </div>
  </footer>

  <!-- Móvil: barra inferior con las acciones -->
  <div id="barra-movil" class="barra-movil pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 sm:hidden" style="padding-bottom: env(safe-area-inset-bottom);">
    <div class="glass glass-light pointer-events-auto flex items-center gap-1.5 rounded-full p-1.5">
      <a href="tel:${SITIO.telefono}" data-medir="llamada" class="btn btn-azul h-9 gap-1.5 px-3.5 text-xs" aria-label="${u.llamarAria}">${ico('telefono', 'h-4 w-4')} ${u.llamar}</a>
      <button type="button" data-abrir-chat class="btn btn-sol h-9 gap-1.5 px-3.5 text-xs">${ico('calculadora', 'h-4 w-4')} ${u.presupuesto}</button>
      <a href="${wa(t.servicios[0].wa)}" target="_blank" rel="noopener" data-medir="whatsapp" class="btn btn-verde h-9 gap-1.5 px-3.5 text-xs" aria-label="${u.whatsappAria}">${ico('whatsapp', 'h-4 w-4')} ${u.whatsapp}</a>
    </div>
  </div>
  <!-- Escritorio: volver arriba, asistente y WhatsApp -->
  <div class="fixed bottom-6 right-6 z-40 hidden flex-col items-end gap-3 sm:flex">
    <a id="subir" href="#contenido" class="glass glass-light flex h-12 w-12 translate-y-4 items-center justify-center rounded-full text-brand-700 opacity-0 transition duration-300 hover:-translate-y-1" aria-label="${u.volverArriba}">${ico('arriba')}</a>
    <button type="button" data-abrir-chat class="btn btn-sol shine h-14 px-5 text-sm" aria-label="${t.chat.abrir}">${ico('calculadora')} ${u.abrirAsistente}</button>
    <a href="${wa(t.servicios[0].wa)}" target="_blank" rel="noopener" data-medir="whatsapp" class="btn btn-verde h-16 w-16 animate-pulse hover:animate-none" aria-label="${u.whatsappAria}">${ico('whatsapp', 'h-8 w-8')}</a>
  </div>

  <!-- Asistente de presupuesto -->
  <section id="chat" class="chat fixed inset-x-3 bottom-3 z-[70] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[400px]" role="dialog" aria-modal="false" aria-labelledby="chat-titulo" hidden>
    <div class="glass glass-light flex max-h-[min(640px,calc(100svh-1.5rem))] flex-col overflow-hidden rounded-[1.75rem]">
      <div class="flex items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-800 px-5 py-4 text-white">
        <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/40">${ico('calculadora')}</span>
        <div class="flex-1">
          <p id="chat-titulo" class="font-display text-lg font-bold leading-tight">${t.chat.titulo}</p>
          <p class="flex items-center gap-1.5 text-xs text-brand-100"><span class="h-2 w-2 rounded-full bg-emerald-400"></span>${t.chat.subtitulo}</p>
        </div>
        <button type="button" id="chat-reiniciar" class="rounded-full p-2 transition hover:bg-white/15" aria-label="${t.chat.reiniciar}">${ico('reiniciar', 'h-5 w-5')}</button>
        <button type="button" id="chat-cerrar" class="rounded-full p-2 transition hover:bg-white/15" aria-label="${t.chat.cerrar}">${ico('cerrar', 'h-5 w-5')}</button>
      </div>
      <div id="chat-mensajes" class="chat-mensajes flex-1 space-y-3 overflow-y-auto px-4 py-5" aria-live="polite"></div>
      <div id="chat-opciones" class="flex flex-wrap gap-2 border-t border-white/70 bg-white/50 px-4 py-3"></div>
      <form id="chat-form" class="hidden items-center gap-2 border-t border-white/70 bg-white/60 px-3 py-3">
        <label for="chat-input" class="sr-only">${t.chat.placeholder}</label>
        <input id="chat-input" type="text" autocomplete="off" maxlength="160" class="min-w-0 flex-1 rounded-full border border-brand-100 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20" placeholder="${t.chat.placeholder}">
        <button type="button" id="chat-saltar" class="rounded-full px-3 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">${t.chat.saltar}</button>
        <button type="submit" class="btn btn-azul h-10 w-10 p-0" aria-label="${t.chat.enviarTexto}">${ico('enviar', 'h-4 w-4')}</button>
      </form>
    </div>
  </section>
  <script type="application/json" id="chat-datos">${datosChat.replace(/</g, '\\u003c')}</script>

  <!-- Panel de cookies: Aceptar y Rechazar con el mismo peso (Guía de cookies de la AEPD) -->
  <div id="aviso-cookies" class="fixed inset-x-3 bottom-20 z-[65] mx-auto hidden max-w-md sm:bottom-6 sm:left-6 sm:right-auto sm:mx-0" role="dialog" aria-modal="false" aria-labelledby="cookies-titulo" aria-describedby="cookies-texto">
    <div class="glass glass-light rounded-2xl p-4 text-slate-700">
      <p id="cookies-titulo" class="font-display text-base font-bold text-brand-950">${u.cookiesTitulo}</p>
      <p id="cookies-texto" class="mt-1 text-xs leading-relaxed">${u.cookiesAviso} <a href="${t.rutas.cookies}" class="font-semibold text-brand-700 underline">${u.cookiesMas}</a></p>
      <div id="cookies-opciones" class="mt-3 hidden space-y-2 rounded-xl bg-white/70 p-3 text-xs">
        <label class="flex items-center gap-2 text-slate-500"><input type="checkbox" checked disabled class="h-4 w-4 accent-brand-600"> ${u.cookiesTecnicas}</label>
        <label class="flex items-center gap-2"><input type="checkbox" id="ck-mapas" class="h-4 w-4 accent-brand-600"> ${u.cookiesMapas}</label>
        ${hayAnalitica ? `<label class="flex items-center gap-2"><input type="checkbox" id="ck-analitica" class="h-4 w-4 accent-brand-600"> ${u.cookiesAnalitica}</label>` : ''}
      </div>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <button type="button" id="ck-rechazar" class="btn btn-azul px-3 py-2.5 text-xs">${u.cookiesRechazar}</button>
        <button type="button" id="ck-aceptar" class="btn btn-azul px-3 py-2.5 text-xs">${u.cookiesAceptar}</button>
      </div>
      <button type="button" id="ck-configurar" class="mt-2 w-full rounded-full py-1.5 text-xs font-semibold text-brand-700 underline" data-texto-guardar="${u.cookiesGuardar}">${u.cookiesConfigurar}</button>
    </div>
  </div>

  ${HORARIO ? `<script type="application/json" id="datos-horario">${JSON.stringify({ horario: HORARIO, textos: t.herramientas.horario })}</script>` : ''}
  <script src="/assets/app.js" defer></script>
  ${extraScripts}
</body>
</html>`;
}
