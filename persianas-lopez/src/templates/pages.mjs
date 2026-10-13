import { SITIO, wa } from '../config.mjs';
import { ico, PIEZAS } from '../icons.mjs';
import { layout, ancla } from './layout.mjs';

const chipClase = 'glass glass-light inline-flex rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[.25em] text-brand-600';
const h2Clase = 'mt-5 font-display text-4xl font-extrabold tracking-tight text-brand-950 sm:text-5xl';
const mapsBusqueda = 'https://www.google.com/maps/search/?api=1&query=Persianas+L%C3%B3pez+R%C3%BAa+Bonhome+10+32005+Ourense';
const mapsRuta = 'https://www.google.com/maps/dir/?api=1&destination=R%C3%BAa+Bonhome+10%2C+32005+Ourense';

/* ---------- Datos estructurados ---------- */
export function negocioSchema(t) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${SITIO.url}/#negocio`,
    name: SITIO.nombre,
    description: t.home.description,
    url: SITIO.url + t.rutas.inicio,
    telephone: SITIO.telefono,
    image: `${SITIO.url}/og.png`,
    logo: `${SITIO.url}/favicon.svg`,
    priceRange: '€€',
    address: { '@type': 'PostalAddress', streetAddress: SITIO.direccion, addressLocality: SITIO.ciudad, postalCode: SITIO.cp, addressRegion: SITIO.region, addressCountry: 'ES' },
    geo: { '@type': 'GeoCoordinates', latitude: SITIO.geo.lat, longitude: SITIO.geo.lng },
    hasMap: mapsBusqueda,
    areaServed: [{ '@type': 'City', name: 'Ourense' }, ...t.zonas.map((z) => ({ '@type': 'Place', name: `${z.nombre}, Ourense` }))],
    aggregateRating: { '@type': 'AggregateRating', ratingValue: String(SITIO.valoracion.nota), bestRating: '5', reviewCount: String(SITIO.valoracion.resenas) },
    knowsLanguage: ['es', 'gl']
  };
}
const faqSchema = (lista) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: lista.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const migasSchema = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([nombre, ruta], i) => ({ '@type': 'ListItem', position: i + 1, name: nombre, item: SITIO.url + ruta })) });

/* ---------- Bloques comunes ---------- */
const migas = (t, items) => `<nav aria-label="${t.ui.migas}" class="mb-6 text-sm text-slate-500"><ol class="flex flex-wrap items-center gap-2">${items.map(([n, r], i) => i < items.length - 1 ? `<li><a href="${r}" class="font-semibold text-brand-700 hover:underline">${n}</a></li><li aria-hidden="true">/</li>` : `<li aria-current="page">${n}</li>`).join('')}</ol></nav>`;

const faqBloque = (lista) => lista.map(([q, a], i) => `
          <details class="reveal glass glass-light group rounded-3xl px-6 py-5" style="--d:${i * 80}ms">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold text-brand-950">${q}${ico('chevron', 'chevron text-brand-600 transition-transform duration-300')}</summary>
            <p class="respuesta mt-3 leading-relaxed text-slate-600">${a}</p>
          </details>`).join('');

const pasosBloque = (t) => `
        <div class="reveal desde-der glass glass-light rounded-[2rem] p-8 sm:p-10" style="--d:150ms">
          <h3 class="font-display text-3xl font-extrabold text-brand-950">${t.ui.comoTrabajamos}</h3>
          <ol class="relative mt-8 space-y-8">
            <span class="paso-linea absolute bottom-6 left-6 top-6 w-0.5 bg-gradient-to-b from-brand-500 to-accent" aria-hidden="true"></span>
            ${t.ui.pasos.map(([a, b], i) => `<li class="relative flex gap-5">
              <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${i === 2 ? 'bg-gradient-to-b from-accent to-yellow-500 text-brand-950' : 'bg-gradient-to-b from-brand-500 to-brand-700 text-white'} font-display text-lg font-bold ring-4 ring-white/80" aria-hidden="true">${i + 1}</span>
              <div><p class="font-display text-lg font-bold text-brand-950">${a}</p><p class="text-slate-600">${b}</p></div>
            </li>`).join('')}
          </ol>
        </div>`;

const mapa = (t) => `
          <div id="ubicacion" class="reveal desde-der glass glass-light scroll-mt-24 overflow-hidden rounded-[2rem] p-2 lg:col-span-3" style="--d:150ms">
            <div class="mapa relative flex h-[380px] flex-col items-center justify-center gap-4 overflow-hidden rounded-[1.6rem] bg-brand-50 p-6 text-center lg:h-full lg:min-h-[460px]" data-mapa-src="https://www.google.com/maps?q=R%C3%BAa+Bonhome+10,+32005+Ourense&z=17&output=embed" data-mapa-titulo="${t.ui.mapaTitulo}">
              <div class="mapa-fondo absolute inset-0" aria-hidden="true"></div>
              <span class="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl ring-8 ring-white/70">${ico('ubicacion', 'h-8 w-8')}</span>
              <p class="relative font-display text-xl font-bold text-brand-950">${SITIO.direccion} · ${SITIO.ciudad}</p>
              <button type="button" class="mapa-cargar relative btn btn-azul px-6 py-3">${ico('mapa')} ${t.ui.mapaBoton}</button>
              <p class="relative max-w-sm text-xs text-slate-500">${t.ui.mapaAviso}</p>
            </div>
          </div>`;

const contactoBloque = (t, { conTitulo = true } = {}) => {
  const u = t.ui, c = t.home.contacto;
  return `
    <section id="contacto" class="scroll-mt-20 pb-24 ${conTitulo ? '' : 'pt-4'}" aria-labelledby="contacto-titulo">
      <div class="mx-auto max-w-7xl px-5 sm:px-8">
        <div class="reveal mx-auto max-w-2xl text-center">
          <p class="${chipClase}">${c.chip}</p>
          <h2 id="contacto-titulo" class="${h2Clase}">${c.titulo}</h2>
          <p class="mt-5 text-lg leading-relaxed text-slate-600">${c.texto}</p>
        </div>
        <div class="mt-14 grid gap-6 lg:grid-cols-5">
          <address class="not-italic lg:col-span-2">
            <ul class="space-y-4">
              <li class="reveal desde-izq group glass glass-light flex gap-4 rounded-3xl p-6">
                <span class="icono-burbuja flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100" aria-hidden="true">${ico('ubicacion', 'h-6 w-6')}</span>
                <div>
                  <p class="font-display text-lg font-bold text-brand-950">${u.direccion}</p>
                  <p class="text-slate-600">${SITIO.direccion}<br>${SITIO.cp} ${SITIO.ciudad}</p>
                  <a href="${mapsRuta}" target="_blank" rel="noopener" data-medir="como-llegar" class="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:underline" aria-label="${u.comoLlegarAria}">${u.comoLlegar} ${ico('derecha', 'h-4 w-4 transition group-hover:translate-x-1')}</a>
                </div>
              </li>
              <li class="reveal desde-izq group glass glass-light flex gap-4 rounded-3xl p-6" style="--d:120ms">
                <span class="icono-burbuja flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100" aria-hidden="true">${ico('telefono', 'h-6 w-6')}</span>
                <div>
                  <p class="font-display text-lg font-bold text-brand-950">${u.telefonoWa}</p>
                  <a href="tel:${SITIO.telefono}" data-medir="llamada" class="font-display text-2xl font-extrabold text-brand-700 hover:underline" aria-label="${u.llamarAria}">${SITIO.telefonoVisible}</a>
                  <p><a href="${wa(t.servicios[0].wa)}" target="_blank" rel="noopener" data-medir="whatsapp" class="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-green-700 hover:underline" aria-label="${u.whatsappAria}">${ico('whatsapp', 'h-4 w-4')} ${u.escribirWa}</a></p>
                </div>
              </li>
              <li class="reveal desde-izq group glass glass-light flex gap-4 rounded-3xl p-6" style="--d:240ms">
                <span class="icono-burbuja flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100" aria-hidden="true">${ico('reloj', 'h-6 w-6')}</span>
                <div>
                  <p class="font-display text-lg font-bold text-brand-950">${u.horario}</p>
                  <!-- PENDIENTE: confirmar horario exacto con el negocio -->
                  <p class="text-slate-600">${u.horarioTexto}</p>
                  <p class="text-sm text-slate-500">${u.horarioNota}</p>
                </div>
              </li>
            </ul>
          </address>
${mapa(t)}
        </div>
${ctaFinal(t)}
      </div>
    </section>`;
};

const ctaFinal = (t) => `
        <div class="reveal zoom glass glass-tint relative mt-16 flex flex-col items-center gap-6 overflow-hidden rounded-[2rem] bg-brand-700 px-6 py-12 text-center text-white sm:px-12 lg:flex-row lg:justify-between lg:text-left">
          <div class="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" aria-hidden="true"></div>
          <div class="relative">
            <h3 class="font-display text-3xl font-extrabold sm:text-4xl">${t.home.contacto.ctaTitulo}</h3>
            <p class="mt-2 text-lg text-brand-50">${t.home.contacto.ctaTexto}</p>
          </div>
          <div class="relative flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a href="tel:${SITIO.telefono}" data-medir="llamada" class="btn btn-sol shine px-7 py-4" aria-label="${t.ui.llamarAria}">${ico('telefono')} ${SITIO.telefonoVisible}</a>
            <button type="button" data-abrir-chat class="btn btn-cristal px-7 py-4">${ico('calculadora')} ${t.ui.abrirAsistente}</button>
          </div>
        </div>`;

const tarjetaServicio = (t, s, i, destacada = false) => destacada ? `
          <article class="reveal group glass glass-light flex flex-col rounded-[2rem] p-8 transition duration-500 hover:-translate-y-2 lg:col-span-3 lg:row-span-2">
            <span class="icono-burbuja flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.5),0_14px_30px_-10px_rgba(0,102,204,.8)]" aria-hidden="true">${ico(s.icono, 'h-8 w-8')}</span>
            <h3 class="mt-6 font-display text-3xl font-extrabold text-brand-950">${s.titulo}</h3>
            <p class="mt-3 text-lg leading-relaxed text-slate-600">${s.corto}</p>
            <ul class="mt-6 grid gap-2 text-slate-700 sm:grid-cols-2">${s.puntos.slice(0, 4).map((p) => `<li class="flex items-center gap-2">${ico('check', 'text-brand-600')} ${p}</li>`).join('')}</ul>
            <a href="${t.rutas.servicio(s.slug)}" class="btn btn-azul mt-8 w-fit px-6 py-3 text-sm lg:mt-auto">${t.home.servicios.verMas} ${ico('derecha')}</a>
          </article>` : `
          <article class="reveal group glass glass-light relative rounded-[2rem] p-7 transition duration-500 hover:-translate-y-2 ${i < 3 ? 'lg:col-span-3' : 'lg:col-span-2'}" style="--d:${(i % 3) * 100}ms">
            <div class="flex items-start gap-5">
              <span class="icono-burbuja flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100" aria-hidden="true">${ico(s.icono, 'h-7 w-7')}</span>
              <div>
                <h3 class="font-display text-2xl font-bold text-brand-950"><a href="${t.rutas.servicio(s.slug)}" class="after:absolute after:inset-0 after:rounded-[2rem]">${s.titulo}</a></h3>
                <p class="mt-2 leading-relaxed text-slate-600">${s.corto}</p>
                <span class="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600">${t.home.servicios.verMas} ${ico('derecha', 'h-4 w-4 transition group-hover:translate-x-1')}</span>
              </div>
            </div>
          </article>`;

/* ---------- Portada ---------- */
export function paginaInicio(t, rutaAlt) {
  const h = t.home, u = t.ui;
  const cinta = [...h.cinta, ...h.cinta].map((c) => `<span>${c}</span><span class="text-accent">✦</span>`).join('');
  const cuerpo = `
    <section id="inicio" class="relative h-[260vh]" aria-labelledby="hero-titulo">
      <div id="escena" class="sticky top-0 h-svh min-h-[560px] overflow-hidden bg-brand-950">
        <div class="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 text-white">
          <div class="pointer-events-none absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full bg-brand-500/60 blur-3xl" aria-hidden="true"></div>
          <div class="pointer-events-none absolute -right-20 bottom-0 h-[24rem] w-[24rem] rounded-full bg-accent/25 blur-3xl" aria-hidden="true"></div>
          <div class="pointer-events-none absolute right-1/3 top-1/4 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl" aria-hidden="true"></div>
          <div id="hero-contenido" class="relative mx-auto grid h-full max-w-7xl items-center gap-10 px-5 pb-8 pt-24 sm:px-8 sm:pt-28 lg:grid-cols-[1.25fr_1fr]">
            <div>
              <p class="hero-item glass glass-dark mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold [@media(max-height:700px)_and_(max-width:639px)]:hidden">${ico('ubicacion', 'text-accent')} ${h.chip}</p>
              <h1 id="hero-titulo" class="hero-item font-display text-[2rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl [@media(min-width:640px)_and_(max-height:780px)]:text-5xl">
                ${h.h1}
                <span class="mt-3 block bg-gradient-to-r from-accent via-yellow-200 to-white bg-clip-text text-2xl text-transparent sm:text-4xl">Persianas López</span>
              </h1>
              <p class="hero-item mt-5 max-w-xl text-base leading-relaxed text-brand-100 sm:text-xl">${h.subtitulo}</p>
              <div class="hero-item mt-7 flex flex-col gap-3 sm:flex-row">
                <button type="button" data-abrir-chat class="btn btn-sol shine px-7 py-4 text-base">${ico('calculadora')} ${u.pedirPresupuesto}</button>
                <a href="#servicios" class="btn btn-cristal px-7 py-4 text-base">${u.verServicios} ${ico('abajo')}</a>
              </div>
            </div>
            <div class="hidden gap-4 lg:grid" aria-hidden="true">
              <div class="hero-item glass glass-dark ml-auto w-full max-w-sm rounded-[1.75rem] p-6">
                <div class="flex items-center gap-1 text-accent">${ico('estrella')}${ico('estrella')}${ico('estrella')}${ico('estrella')}${ico('estrella-media')}</div>
                <p class="mt-3 font-display text-5xl font-extrabold">4,4<span class="text-2xl text-brand-200"> / 5</span></p>
                <p class="mt-1 text-sm text-brand-100">${SITIO.valoracion.resenas} ${u.resenasGoogle}</p>
              </div>
              <div class="hero-item glass glass-dark w-full max-w-sm rounded-[1.75rem] p-6">
                <div class="flex items-center gap-4"><span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-brand-900">${ico('caja')}</span><div><p class="font-display text-xl font-bold">${h.tarjetas[0][0]}</p><p class="text-sm text-brand-100">${h.tarjetas[0][1]}</p></div></div>
              </div>
              <div class="hero-item glass glass-dark ml-12 w-full max-w-sm rounded-[1.75rem] p-6">
                <div class="flex items-center gap-4"><span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white">${ico('rayo')}</span><div><p class="font-display text-xl font-bold">${h.tarjetas[1][0]}</p><p class="text-sm text-brand-100">${h.tarjetas[1][1]}</p></div></div>
              </div>
            </div>
          </div>
        </div>
        <div id="luz" class="luz pointer-events-none absolute inset-0 z-10 opacity-0" aria-hidden="true"></div>
        <div id="persiana" class="pointer-events-none absolute inset-x-0 bottom-0 z-20" aria-hidden="true" style="top: var(--cajon, 88px); perspective: 900px;">
          <div id="lamas" class="absolute inset-0"></div>
          <div id="barra" class="barra"></div>
        </div>
        <div id="cajon" class="cajon absolute inset-x-0 top-0 z-30" style="height: var(--cajon, 88px);" aria-hidden="true">
          <div id="rodillo" class="rodillo absolute inset-x-0 bottom-3 h-4"></div>
          <div class="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-b from-slate-300 to-slate-500"></div>
        </div>
        <div id="indicador" class="glass glass-dark absolute right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 rounded-full px-2 py-4 text-white sm:right-6 sm:flex" aria-hidden="true">
          <span class="font-display text-sm font-bold tabular-nums" id="indicador-num">0%</span>
          <span class="relative h-40 w-1.5 overflow-hidden rounded-full bg-white/20"><span id="indicador-barra" class="absolute inset-x-0 bottom-0 h-0 rounded-full bg-accent"></span></span>
          ${ico('arriba', 'h-4 w-4 text-accent')}
        </div>
        <div id="aviso" class="chip-scroll glass glass-dark absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full py-2.5 pl-3 pr-5 text-sm font-semibold text-white" aria-hidden="true">
          <span class="relative flex h-8 w-5 justify-center rounded-full border-2 border-white/80"><span class="raton mt-1.5 h-1.5 w-1 rounded-full bg-accent"></span></span>
          ${h.aviso}
        </div>
      </div>
    </section>

    <div class="cinta-wrap relative z-10 -mt-px overflow-hidden border-y border-white/60 bg-white/40 py-4 backdrop-blur-xl" aria-hidden="true">
      <div class="cinta flex w-max gap-10 whitespace-nowrap font-display text-lg font-bold text-brand-800">${cinta}</div>
    </div>

    <section id="servicios" class="scroll-mt-20 py-24" aria-labelledby="servicios-titulo">
      <div class="mx-auto max-w-7xl px-5 sm:px-8">
        <div class="reveal mx-auto max-w-2xl text-center">
          <p class="${chipClase}">${h.servicios.chip}</p>
          <h2 id="servicios-titulo" class="${h2Clase}">${h.servicios.titulo}</h2>
          <p class="mt-5 text-lg leading-relaxed text-slate-600">${h.servicios.texto}</p>
        </div>
        <div class="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          ${tarjetaServicio(t, t.servicios[0], 0, true)}
          ${t.servicios.slice(1).map((s, i) => tarjetaServicio(t, s, i + 1)).join('')}
          <article class="reveal group glass glass-light relative rounded-[2rem] p-7 transition duration-500 hover:-translate-y-2 lg:col-span-2" style="--d:100ms">
            <span class="icono-burbuja flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100" aria-hidden="true">${ico('engranaje', 'h-7 w-7')}</span>
            <h3 class="mt-5 font-display text-2xl font-bold text-brand-950"><a href="${t.rutas.catalogo}" class="after:absolute after:inset-0 after:rounded-[2rem]">${t.catalogo.h1}</a></h3>
            <p class="mt-2 leading-relaxed text-slate-600">${t.catalogo.intro}</p>
          </article>
          <article class="reveal zoom group glass glass-tint relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-brand-700 p-7 text-white sm:col-span-2 lg:col-span-2" style="--d:200ms">
            <div>
              <span class="icono-burbuja flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/40" aria-hidden="true">${ico('camara', 'h-7 w-7')}</span>
              <h3 class="mt-5 font-display text-2xl font-bold">${h.servicios.fotoTitulo}</h3>
              <p class="mt-2 text-brand-50">${h.servicios.fotoTexto}</p>
            </div>
            <a href="${wa(h.servicios.fotoWa)}" target="_blank" rel="noopener" data-medir="whatsapp" class="btn btn-sol shine mt-6 px-6 py-3" aria-label="${u.whatsappAria}">${ico('whatsapp')} ${h.servicios.fotoBoton}</a>
          </article>
        </div>
      </div>
    </section>

    <section id="repuestos" class="scroll-mt-20 py-24" aria-labelledby="repuestos-titulo">
      <div class="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
        <div class="reveal desde-izq">
          <p class="${chipClase}">${h.repuestos.chip}</p>
          <h2 id="repuestos-titulo" class="${h2Clase}">${h.repuestos.titulo}</h2>
          <p class="mt-5 text-lg leading-relaxed text-slate-600">${h.repuestos.texto}</p>
          <ul class="mt-8 grid gap-3 sm:grid-cols-2">
            ${h.repuestos.lista.map(([a, b], i) => `<li class="reveal glass glass-light flex items-start gap-3 rounded-2xl p-4" style="--d:${100 + i * 80}ms">${ico('check', 'mt-0.5 text-brand-600')}<span><strong class="font-display text-brand-950">${a}</strong><br><span class="text-sm text-slate-600">${b}</span></span></li>`).join('')}
          </ul>
          <a href="${t.rutas.catalogo}" class="btn btn-azul mt-8 px-6 py-3.5">${h.repuestos.boton} ${ico('derecha')}</a>
        </div>
${pasosBloque(t)}
      </div>
    </section>

    <section class="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 py-24 text-white" aria-labelledby="confianza-titulo">
      <div class="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-brand-500/50 blur-3xl" aria-hidden="true"></div>
      <div class="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" aria-hidden="true"></div>
      <div class="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div class="reveal zoom glass glass-dark mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-[2rem] px-6 py-9 text-center sm:flex-row sm:justify-center sm:gap-8 sm:text-left">
          <div class="stars flex gap-1 text-accent" role="img" aria-label="${u.valoracionAria}">${ico('estrella', 'h-8 w-8')}${ico('estrella', 'h-8 w-8')}${ico('estrella', 'h-8 w-8')}${ico('estrella', 'h-8 w-8')}${ico('estrella-media', 'h-8 w-8')}</div>
          <div>
            <h2 id="confianza-titulo" class="font-display text-3xl font-extrabold sm:text-4xl"><span class="contador" data-to="4.4" data-dec="1">4,4</span> ${h.confianza.nota}</h2>
            <p class="mt-1 text-brand-100">${h.confianza.basado} <span class="contador" data-to="63" data-dec="0">63</span> ${h.confianza.resenas}</p>
          </div>
        </div>
        <!-- Resumen de lo que se valora, sin inventar reseñas. Con permiso del dueño, cambiar por citas reales de Google. -->
        <h3 class="reveal mt-20 text-center font-display text-3xl font-extrabold">${h.confianza.titulo}</h3>
        <div class="mt-10 grid gap-5 md:grid-cols-3">
          ${h.confianza.razones.map(([ic, a, b], i) => `<article class="reveal group glass glass-dark rounded-[2rem] p-8 transition duration-500 hover:-translate-y-2" style="--d:${i * 150}ms">
            <span class="icono-burbuja flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-brand-950" aria-hidden="true">${ico(ic, 'h-7 w-7')}</span>
            <h4 class="mt-5 font-display text-xl font-bold">${a}</h4>
            <p class="mt-2 leading-relaxed text-brand-100">${b}</p>
          </article>`).join('')}
        </div>
        <div class="reveal mt-12 text-center">
          <a href="${mapsBusqueda}" target="_blank" rel="noopener" class="btn btn-cristal px-6 py-3.5" aria-label="${u.leerResenasAria}"><span class="flex h-7 w-7 items-center justify-center rounded-full bg-white">${ico('google', 'h-4 w-4')}</span> ${u.leerResenas}</a>
        </div>
      </div>
    </section>

    <section id="presupuesto" class="scroll-mt-20 py-24" aria-labelledby="presupuesto-titulo">
      <div class="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div class="reveal desde-izq">
          <p class="${chipClase}">${h.asistente.chip}</p>
          <h2 id="presupuesto-titulo" class="${h2Clase}">${h.asistente.titulo}</h2>
          <p class="mt-5 text-lg leading-relaxed text-slate-600">${h.asistente.texto}</p>
          <ul class="mt-8 space-y-3 text-slate-700">${h.asistente.puntos.map(([ic, p]) => `<li class="flex items-center gap-3">${ico(ic, 'text-brand-600')} ${p}</li>`).join('')}</ul>
          <button type="button" data-abrir-chat class="btn btn-sol shine mt-8 px-7 py-4 text-base">${ico('calculadora')} ${h.asistente.boton}</button>
        </div>
        <div class="reveal desde-der" aria-hidden="true">
          <div class="glass glass-light mx-auto max-w-md rounded-[2rem] p-5">
            <div class="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 px-4 py-3 text-white">${ico('calculadora')}<span class="font-display font-bold">${t.chat.titulo}</span></div>
            <div class="mt-4 space-y-3 text-sm">
              <p class="w-fit max-w-[85%] rounded-2xl rounded-tl-md bg-white px-4 py-3 text-slate-700 shadow-sm">${t.chat.queNecesitas}</p>
              <div class="flex flex-wrap gap-2">${Object.values(t.chat.servicios).slice(0, 4).map((s) => `<span class="rounded-full border border-brand-200 bg-white/80 px-3 py-1.5 font-semibold text-brand-800">${s.etiqueta}</span>`).join('')}</div>
              <p class="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-md bg-brand-600 px-4 py-3 text-white shadow-sm">${t.chat.servicios.reparar.etiqueta}</p>
              <p class="w-fit max-w-[85%] rounded-2xl rounded-tl-md bg-white px-4 py-3 text-slate-700 shadow-sm">${t.chat.servicios.reparar.pasos[0][1]}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="pb-24" aria-labelledby="zonas-titulo">
      <div class="mx-auto max-w-7xl px-5 sm:px-8">
        <div class="reveal mx-auto max-w-2xl text-center">
          <p class="${chipClase}">${h.zonas.chip}</p>
          <h2 id="zonas-titulo" class="${h2Clase}">${h.zonas.titulo}</h2>
          <p class="mt-5 text-lg leading-relaxed text-slate-600">${h.zonas.texto}</p>
        </div>
        <ul class="mt-10 flex flex-wrap justify-center gap-3">
          ${t.zonas.map((z, i) => `<li class="reveal" style="--d:${i * 70}ms"><a href="${t.rutas.zona(z.slug)}" class="glass glass-light inline-flex items-center gap-2 rounded-full px-5 py-3 font-display font-bold text-brand-900 transition hover:-translate-y-1">${ico('ubicacion', 'text-brand-600')} ${z.nombre}</a></li>`).join('')}
        </ul>
      </div>
    </section>

    <section id="faq" class="scroll-mt-20 pb-24" aria-labelledby="faq-titulo">
      <div class="mx-auto max-w-3xl px-5 sm:px-8">
        <div class="reveal text-center">
          <p class="${chipClase}">${h.faqChip}</p>
          <h2 id="faq-titulo" class="${h2Clase}">${h.faqTitulo}</h2>
        </div>
        <div class="mt-10 space-y-3">${faqBloque(h.faq)}</div>
      </div>
    </section>
${contactoBloque(t)}`;

  return layout({
    t, title: h.title, description: h.description, ruta: t.rutas.inicio, rutaAlt, cuerpo, esInicio: true,
    schema: [negocioSchema(t), faqSchema(h.faq)],
    extraScripts: '<script src="/assets/portada.js" defer></script>'
  });
}

/* ---------- Cabecera de páginas interiores ---------- */
const cabeceraInterior = (t, { migasItems, h1, intro, icono, botones = true, servicioChat = '' }) => `
    <section class="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 pb-20 pt-32 text-white">
      <div class="persiana-fondo pointer-events-none absolute inset-0 opacity-20" aria-hidden="true"></div>
      <div class="pointer-events-none absolute -left-24 top-10 h-96 w-96 rounded-full bg-brand-500/60 blur-3xl" aria-hidden="true"></div>
      <div class="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-accent/25 blur-3xl" aria-hidden="true"></div>
      <div class="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div class="[&_a]:text-brand-100 [&_li]:text-brand-200">${migas(t, migasItems)}</div>
        <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-3xl">
            ${icono ? `<span class="entrar mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur" aria-hidden="true">${ico(icono, 'h-8 w-8 text-accent')}</span>` : ''}
            <h1 class="entrar font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl" style="--d:80ms">${h1}</h1>
            ${intro ? `<p class="entrar mt-5 text-lg leading-relaxed text-brand-100 sm:text-xl" style="--d:160ms">${intro}</p>` : ''}
          </div>
          ${botones ? `<div class="entrar flex flex-col gap-3 sm:flex-row lg:flex-col" style="--d:240ms">
            <button type="button" data-abrir-chat ${servicioChat ? `data-servicio="${servicioChat}"` : ''} class="btn btn-sol shine px-7 py-4">${ico('calculadora')} ${t.ui.abrirAsistente}</button>
            <a href="tel:${SITIO.telefono}" data-medir="llamada" class="btn btn-cristal px-7 py-4" aria-label="${t.ui.llamarAria}">${ico('telefono')} ${SITIO.telefonoVisible}</a>
          </div>` : ''}
        </div>
      </div>
    </section>`;

/* ---------- Página de servicio ---------- */
const chatPorServicio = { reparacion: 'reparar', mosquiteras: 'mosquitera', estores: 'estor', mamparas: 'mampara' };

export function paginaServicio(t, s, rutaAlt) {
  const ruta = t.rutas.servicio(s.slug);
  const migasItems = [[t.ui.inicio, t.rutas.inicio], [t.ui.servicios, `${t.rutas.inicio}#servicios`], [s.h1, ruta]];
  const otros = t.servicios.filter((x) => x.id !== s.id);
  const cuerpo = `
${cabeceraInterior(t, { migasItems, h1: s.h1, intro: s.intro, icono: s.icono, servicioChat: chatPorServicio[s.id] })}
    <section class="py-20">
      <div class="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-2">
        <div class="reveal desde-izq glass glass-light rounded-[2rem] p-8 sm:p-10">
          <h2 class="font-display text-3xl font-extrabold text-brand-950">${t.lang === 'gl' ? 'Que facemos' : 'Qué hacemos'}</h2>
          <ul class="mt-6 grid gap-3 sm:grid-cols-2">${s.puntos.map((p) => `<li class="flex items-center gap-3 text-slate-700">${ico('check', 'text-brand-600')} ${p}</li>`).join('')}</ul>
          <a href="${wa(s.wa)}" target="_blank" rel="noopener" data-medir="whatsapp" class="btn btn-verde mt-8 px-6 py-3.5" aria-label="${t.ui.whatsappAria}">${ico('whatsapp')} ${t.ui.preguntarWa}</a>
        </div>
${pasosBloque(t)}
      </div>
    </section>
    <section class="pb-20">
      <div class="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 class="reveal font-display text-3xl font-extrabold text-brand-950 sm:text-4xl">${s.problemasTitulo}</h2>
        <div class="mt-8 grid gap-5 md:grid-cols-2 ${s.problemas.length === 3 ? 'lg:grid-cols-3' : ''}">
          ${s.problemas.map(([a, b], i) => `<article class="reveal group glass glass-light rounded-[2rem] p-7 transition duration-500 hover:-translate-y-1" style="--d:${i * 90}ms">
            <span class="font-display text-sm font-bold text-brand-500">0${i + 1}</span>
            <h3 class="mt-2 font-display text-xl font-bold text-brand-950">${a}</h3>
            <p class="mt-2 leading-relaxed text-slate-600">${b}</p>
          </article>`).join('')}
        </div>
      </div>
    </section>
    <section class="pb-20">
      <div class="mx-auto max-w-3xl px-5 sm:px-8">
        <h2 class="reveal text-center font-display text-3xl font-extrabold text-brand-950 sm:text-4xl">${t.ui.preguntasFrecuentes}</h2>
        <div class="mt-8 space-y-3">${faqBloque(s.faq)}</div>
      </div>
    </section>
    <section class="pb-24">
      <div class="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 class="reveal font-display text-2xl font-extrabold text-brand-950">${t.ui.otrosServicios}</h2>
        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          ${otros.map((o, i) => `<a href="${t.rutas.servicio(o.slug)}" class="reveal group glass glass-light flex items-center gap-4 rounded-3xl p-5 transition hover:-translate-y-1" style="--d:${i * 80}ms"><span class="icono-burbuja flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">${ico(o.icono, 'h-6 w-6')}</span><span class="font-display font-bold text-brand-950">${o.titulo}</span></a>`).join('')}
          <a href="${t.rutas.catalogo}" class="reveal group glass glass-light flex items-center gap-4 rounded-3xl p-5 transition hover:-translate-y-1"><span class="icono-burbuja flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">${ico('engranaje', 'h-6 w-6')}</span><span class="font-display font-bold text-brand-950">${t.catalogo.h1}</span></a>
        </div>
${ctaFinal(t)}
      </div>
    </section>`;
  return layout({
    t, title: s.metaTitle, description: s.metaDesc, ruta, rutaAlt, cuerpo,
    schema: [
      { '@context': 'https://schema.org', '@type': 'Service', name: s.h1, description: s.metaDesc, areaServed: { '@type': 'City', name: 'Ourense' }, provider: { '@id': `${SITIO.url}/#negocio` } },
      negocioSchema(t), faqSchema(s.faq), migasSchema(migasItems)
    ]
  });
}

/* ---------- Catálogo de repuestos ---------- */
export function paginaCatalogo(t, rutaAlt) {
  const c = t.catalogo;
  const ruta = t.rutas.catalogo;
  const migasItems = [[t.ui.inicio, t.rutas.inicio], [c.h1, ruta]];
  const baseColor = t.lang === 'gl' ? 'Ola, tedes lamas en cor' : 'Hola, ¿tenéis lamas en color';
  const preguntar = (nombre) => wa(`${t.lang === 'gl' ? 'Ola, tedes' : 'Hola, ¿tenéis'} ${nombre.toLowerCase()}?`);
  const cuerpo = `
${cabeceraInterior(t, { migasItems, h1: c.h1, intro: c.intro, icono: 'engranaje', servicioChat: 'repuesto' })}
    <section class="py-20">
      <div class="mx-auto max-w-7xl px-5 sm:px-8">
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          ${c.piezas.map((p, i) => `<article class="reveal group glass glass-light flex flex-col rounded-[2rem] p-5 transition duration-500 hover:-translate-y-2" style="--d:${(i % 4) * 80}ms">
            <div class="pieza flex aspect-[4/3] items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-brand-50 to-white ring-1 ring-brand-100">${PIEZAS[p.id] || ''}</div>
            <h2 class="mt-4 font-display text-xl font-bold text-brand-950">${p.nombre}</h2>
            <p class="mt-1 flex-1 text-sm leading-relaxed text-slate-600">${p.texto}</p>
            <a href="${preguntar(p.nombre)}" target="_blank" rel="noopener" data-medir="whatsapp" class="mt-4 inline-flex items-center gap-2 text-sm font-bold text-green-700 hover:underline">${ico('whatsapp', 'h-4 w-4')} ${c.pedir}</a>
          </article>`).join('')}
        </div>
        <p class="mt-6 text-center text-sm text-slate-500">${c.notaImagenes}</p>
      </div>
    </section>
    <section class="pb-24" aria-labelledby="colores-titulo">
      <div class="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2">
        <div class="reveal desde-izq">
          <h2 id="colores-titulo" class="font-display text-4xl font-extrabold tracking-tight text-brand-950 sm:text-5xl">${c.coloresTitulo}</h2>
          <p class="mt-4 text-lg leading-relaxed text-slate-600">${c.coloresTexto}</p>
          <p class="mt-6 text-sm font-semibold text-brand-700">${c.probar}</p>
          <div class="mt-3 grid grid-cols-4 gap-3" role="radiogroup" aria-label="${c.coloresTitulo}">
            ${c.colores.map(([id, nombre, a, b], i) => `<button type="button" role="radio" aria-checked="${i === 0}" data-color="${id}" data-nombre="${nombre}" data-a="${a}" data-b="${b}" class="color-btn group flex flex-col items-center gap-2 rounded-2xl p-2 transition hover:bg-white/70">
              <span class="h-14 w-full rounded-xl shadow-inner ring-2 ring-white transition group-hover:scale-105 ${id === 'madera' ? 'madera' : ''}" style="background: repeating-linear-gradient(180deg, ${a} 0 9px, ${b} 9px 11px)"></span>
              <span class="text-xs font-semibold text-slate-700">${nombre}</span>
            </button>`).join('')}
          </div>
        </div>
        <div class="reveal desde-der glass glass-light rounded-[2rem] p-6">
          <div class="overflow-hidden rounded-[1.4rem] border-8 border-slate-200 bg-gradient-to-b from-sky-300 to-sky-50">
            <div class="h-5 bg-slate-300"></div>
            <div id="muestra-persiana" class="muestra h-72 transition-[background] duration-500" style="--a:${c.colores[0][2]}; --b:${c.colores[0][3]}"></div>
          </div>
          <div class="mt-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p class="font-display text-2xl font-extrabold text-brand-950" id="muestra-nombre">${c.colores[0][1]}</p>
            <a id="muestra-wa" href="${wa(`${baseColor} ${c.colores[0][1].toLowerCase()}?`)}" data-base="${baseColor}" target="_blank" rel="noopener" data-medir="whatsapp" class="btn btn-verde px-5 py-3 text-sm">${ico('whatsapp')} ${c.preguntarColor}</a>
          </div>
        </div>
      </div>
    </section>
${contactoBloque(t)}`;
  return layout({
    t, title: c.title, description: c.description, ruta, rutaAlt, cuerpo,
    schema: [negocioSchema(t), migasSchema(migasItems), {
      '@context': 'https://schema.org', '@type': 'ItemList', name: c.h1,
      itemListElement: c.piezas.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Product', name: p.nombre, description: p.texto, brand: SITIO.nombre } }))
    }],
    extraScripts: '<script src="/assets/catalogo.js" defer></script>'
  });
}

/* ---------- Página de barrio ---------- */
export function paginaZona(t, z, rutaAlt) {
  const zt = t.zonaTextos;
  const ruta = t.rutas.zona(z.slug);
  const migasItems = [[t.ui.inicio, t.rutas.inicio], [zt.h1(z.nombre), ruta]];
  const cuerpo = `
${cabeceraInterior(t, { migasItems, h1: zt.h1(z.nombre), intro: z.intro, icono: 'ubicacion' })}
    <section class="py-20">
      <div class="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 class="reveal font-display text-3xl font-extrabold text-brand-950 sm:text-4xl">${zt.queHacemos(z.nombre)}</h2>
        <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          ${t.servicios.map((s, i) => `<article class="reveal group glass glass-light relative rounded-[2rem] p-6 transition duration-500 hover:-translate-y-2" style="--d:${i * 80}ms">
            <span class="icono-burbuja flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100" aria-hidden="true">${ico(s.icono, 'h-6 w-6')}</span>
            <h3 class="mt-4 font-display text-xl font-bold text-brand-950"><a href="${t.rutas.servicio(s.slug)}" class="after:absolute after:inset-0 after:rounded-[2rem]">${s.titulo}</a></h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-600">${s.corto}</p>
          </article>`).join('')}
        </div>
        <div class="mt-10 grid gap-10 lg:grid-cols-2">
          <div class="reveal desde-izq glass glass-light rounded-[2rem] p-8">
            <h2 class="font-display text-2xl font-extrabold text-brand-950">${t.home.repuestos.titulo}</h2>
            <p class="mt-3 leading-relaxed text-slate-600">${t.home.repuestos.texto}</p>
            <a href="${t.rutas.catalogo}" class="btn btn-azul mt-6 px-6 py-3">${t.home.repuestos.boton} ${ico('derecha')}</a>
          </div>
${pasosBloque(t)}
        </div>
        <div class="mt-12">
          <h2 class="reveal font-display text-2xl font-extrabold text-brand-950">${t.ui.otrasZonas}</h2>
          <ul class="mt-5 flex flex-wrap gap-3">${t.zonas.filter((x) => x.id !== z.id).map((x) => `<li><a href="${t.rutas.zona(x.slug)}" class="glass glass-light inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-display font-bold text-brand-900 transition hover:-translate-y-1">${ico('ubicacion', 'text-brand-600')} ${x.nombre}</a></li>`).join('')}</ul>
        </div>
      </div>
    </section>
${contactoBloque(t)}`;
  return layout({ t, title: zt.title(z.nombre), description: zt.description(z.nombre), ruta, rutaAlt, cuerpo, schema: [negocioSchema(t), migasSchema(migasItems)] });
}

/* ---------- Páginas legales ---------- */
export function paginaLegal(t, clave, rutaAlt) {
  const l = t.legal[clave];
  const ruta = t.rutas[clave];
  const migasItems = [[t.ui.inicio, t.rutas.inicio], [l.h1, ruta]];
  const cuerpo = `
${cabeceraInterior(t, { migasItems, h1: l.h1, botones: false })}
    <section class="py-16">
      <div class="mx-auto max-w-3xl px-5 sm:px-8">
        <div class="glass glass-light legal rounded-[2rem] p-7 sm:p-10">
          ${l.secciones(SITIO).map(([h, html]) => `<h2>${h}</h2>${html}`).join('')}
          <p class="mt-8 text-sm text-slate-500">${t.lang === 'gl' ? 'Última actualización' : 'Última actualización'}: ${new Date().toISOString().slice(0, 10)}</p>
        </div>
      </div>
    </section>`;
  return layout({ t, title: l.title, description: l.h1 + ' · Persianas López', ruta, rutaAlt, cuerpo, schema: [migasSchema(migasItems)] });
}

/* ---------- 404 ---------- */
export function pagina404(t, rutaAlt) {
  const cuerpo = `
    <section class="flex min-h-[80vh] items-center justify-center px-5 pt-28">
      <div class="glass glass-light max-w-lg rounded-[2rem] p-10 text-center">
        <p class="font-display text-7xl font-extrabold text-brand-600">404</p>
        <h1 class="mt-4 font-display text-3xl font-extrabold text-brand-950">${t.ui.noEncontrado}</h1>
        <p class="mt-3 text-slate-600">${t.ui.noEncontradoTexto}</p>
        <a href="${t.rutas.inicio}" class="btn btn-azul mt-8 px-6 py-3.5">${t.ui.volverInicio}</a>
      </div>
    </section>`;
  return layout({ t, title: `${t.ui.noEncontrado} | Persianas López`, description: t.ui.noEncontradoTexto, ruta: '/404', rutaAlt, cuerpo, noindex: true });
}
