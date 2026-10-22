// Herramientas de la portada: diagnóstico de la persiana, probador sobre una foto de la ventana,
// guía de medidas, aviso de temporada y comparador antes/después.
// iniciar() se vuelve a llamar al cambiar de idioma sin recargar; el AbortController quita los oyentes anteriores.
(function () {
  'use strict';
  var control = null;
  function datosDe(id) { var el = document.getElementById(id); return el ? JSON.parse(el.textContent) : null; }
  function wa(numero, texto) { return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texto); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function icono(nombre, clase) { return '<svg class="icon ' + (clase || '') + '" aria-hidden="true"><use href="#i-' + nombre + '"/></svg>'; }

  /* ---------- Diagnóstico ---------- */
  function diagnostico(S) {
    var caja = document.getElementById('diag');
    var d = datosDe('datos-diagnostico');
    if (!caja || !d) return;
    var pasos = caja.querySelectorAll('[data-paso]');
    var puntos = caja.querySelectorAll('.diag-punto');
    function ir(n) {
      pasos.forEach(function (p) { p.hidden = p.dataset.paso !== String(n); });
      puntos.forEach(function (p, i) { p.classList.toggle('is-on', i < n); });
      var f = caja.querySelector('[data-paso="' + n + '"] button, [data-paso="' + n + '"] a');
      if (f && n > 1) f.focus({ preventScroll: true });
    }
    function sintoma(id) { return d.sintomas.filter(function (s) { return s.id === id; })[0]; }
    function preguntar(s) {
      var p2 = caja.querySelector('[data-paso="2"]');
      p2.innerHTML = '<p class="text-sm font-semibold text-brand-600">' + esc(s.etiqueta) + '</p>' +
        '<p class="mt-1 font-display text-xl font-bold text-brand-950 sm:text-2xl">' + esc(s.pregunta) + '</p>' +
        '<div class="mt-5 grid gap-3">' + s.opciones.map(function (o, i) {
          return '<button type="button" class="diag-opcion" data-opcion="' + i + '">' + icono('chevron', 'h-5 w-5 shrink-0 -rotate-90 text-brand-600') + '<span>' + esc(o[0]) + '</span></button>';
        }).join('') + '</div>' +
        '<button type="button" class="diag-volver mt-5" data-volver="1">← ' + esc(d.volver) + '</button>';
      p2.querySelectorAll('[data-opcion]').forEach(function (b) {
        b.addEventListener('click', function () { resultado(s, s.opciones[+b.dataset.opcion][0], s.opciones[+b.dataset.opcion][1]); }, S);
      });
      ir(2);
    }
    function resultado(s, respuesta, clave) {
      var r = d.resultados[clave];
      var pieza = r.pieza ? d.piezas[r.pieza] : '';
      var resumen = [d.mensaje, '• ' + s.etiqueta + (respuesta ? ': ' + respuesta : ''), '• ' + r.titulo].join('\n');
      var botones = '';
      if (pieza) botones += '<a class="btn btn-verde px-5 py-3 text-sm" target="_blank" rel="noopener" data-medir="reserva" href="' + wa(d.wa, d.reservarMensaje.replace('{pieza}', pieza.toLowerCase())) + '">' + icono('whatsapp') + ' ' + esc(d.reservar) + '</a>';
      botones += '<a class="btn btn-azul px-5 py-3 text-sm" target="_blank" rel="noopener" data-medir="visita" href="' + wa(d.wa, resumen) + '">' + icono('telefono') + ' ' + esc(d.visita) + '</a>';
      if (r.urgente) botones += '<a class="btn btn-sol px-5 py-3 text-sm" target="_blank" rel="noopener" data-medir="urgencia" href="' + wa(d.wa, resumen.replace(d.mensaje, d.mensajeUrgente)) + '">' + icono('rayo') + ' ' + esc(d.urgente) + '</a>';
      var p3 = caja.querySelector('[data-paso="3"]');
      p3.innerHTML = '<div class="flex flex-wrap items-center gap-2"><span class="diag-nivel diag-nivel-' + r.dificultad + '">' + esc(d.dificultad[r.dificultad]) + '</span></div>' +
        '<p class="mt-3 font-display text-2xl font-extrabold text-brand-950 sm:text-3xl">' + esc(r.titulo) + '</p>' +
        '<div class="mt-4 grid gap-4 sm:grid-cols-2">' +
          '<div><p class="text-xs font-bold uppercase tracking-wider text-brand-600">' + esc(d.causa) + '</p><p class="mt-1 text-slate-700">' + esc(r.causa) + '</p></div>' +
          '<div><p class="text-xs font-bold uppercase tracking-wider text-brand-600">' + esc(d.solucion) + '</p><p class="mt-1 text-slate-700">' + esc(r.solucion) + '</p></div>' +
        '</div>' +
        (pieza ? '<p class="mt-4 text-sm text-slate-600">' + esc(d.pieza) + ': <a class="font-bold text-brand-700 underline" href="' + d.catalogo + '#pieza-' + r.pieza + '">' + esc(pieza) + '</a></p>' : '') +
        (r.guia ? '<p class="mt-1 text-sm"><a class="font-bold text-brand-700 underline" href="' + d.catalogo + '#guia-' + r.guia + '">' + esc(d.guia) + ' →</a></p>' : '') +
        '<div class="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">' + botones + '</div>' +
        '<p class="mt-4 text-xs text-slate-500">' + esc(d.aviso) + '</p>' +
        '<button type="button" class="diag-volver mt-4" data-volver="1">↺ ' + esc(d.empezar) + '</button>';
      ir(3);
      if (window.medir) window.medir('diagnostico-' + clave);
    }
    caja.querySelectorAll('[data-sintoma]').forEach(function (b) {
      b.addEventListener('click', function () {
        var s = sintoma(b.dataset.sintoma);
        if (s.resultado) resultado(s, '', s.resultado); else preguntar(s);
      }, S);
    });
    caja.addEventListener('click', function (e) {
      var v = e.target.closest && e.target.closest('[data-volver]');
      if (v) ir(+v.dataset.volver);
    }, S);
  }

  /* ---------- Probador ---------- */
  function probador(S) {
    var lienzo = document.getElementById('prob-lienzo');
    var d = datosDe('datos-probador');
    if (!lienzo || !d) return;
    var foto = document.getElementById('prob-foto');
    var modelo = document.getElementById('prob-modelo');
    var tela = modelo.querySelector('.prob-tela');
    var coloresCaja = document.getElementById('prob-colores');
    var nombreColor = document.getElementById('prob-color-nombre');
    var bajada = document.getElementById('prob-bajada');
    var pedir = document.getElementById('prob-pedir');
    var estado = { m: d.modelos[0], c: 0 };

    function pintar() {
      var col = estado.m.colores[estado.c];
      modelo.dataset.modelo = estado.m.id;
      tela.style.setProperty('--a', col[1]);
      tela.style.setProperty('--b', col[2]);
      nombreColor.textContent = col[0];
      pedir.href = wa(d.wa, d.mensaje.replace('{modelo}', estado.m.nombre.toLowerCase()).replace('{color}', col[0].toLowerCase()));
      coloresCaja.querySelectorAll('button').forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === estado.c)); });
    }
    function colores() {
      coloresCaja.innerHTML = estado.m.colores.map(function (c, i) {
        return '<button type="button" class="prob-color" aria-label="' + esc(c[0]) + '" aria-pressed="' + (i === estado.c) + '" style="background:' + c[1] + ';box-shadow:inset 0 -8px 0 ' + c[2] + '"></button>';
      }).join('');
      coloresCaja.querySelectorAll('button').forEach(function (b, i) {
        b.addEventListener('click', function () { estado.c = i; pintar(); }, S);
      });
    }
    document.querySelectorAll('#prob-modelos [data-modelo]').forEach(function (b) {
      b.addEventListener('click', function () {
        estado.m = d.modelos.filter(function (m) { return m.id === b.dataset.modelo; })[0];
        estado.c = 0;
        document.querySelectorAll('#prob-modelos [data-modelo]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        colores(); pintar();
      }, S);
    });
    bajada.addEventListener('input', function () { tela.style.height = bajada.value + '%'; }, S);

    // La foto se lee en el propio navegador: no se sube a ningún sitio
    var urlFoto = null;
    document.getElementById('prob-archivo').addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      if (urlFoto) URL.revokeObjectURL(urlFoto);
      urlFoto = URL.createObjectURL(f);
      foto.src = urlFoto;
      foto.alt = '';
      if (window.medir) window.medir('probador-foto');
    }, S);

    // Mover y redimensionar con el dedo o el ratón (en % del lienzo)
    var arrastre = null;
    function pos() { return { l: parseFloat(modelo.style.left), t: parseFloat(modelo.style.top), w: parseFloat(modelo.style.width), h: parseFloat(modelo.style.height) }; }
    modelo.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      modelo.setPointerCapture(e.pointerId);
      arrastre = { x: e.clientX, y: e.clientY, p: pos(), asa: e.target.classList.contains('prob-asa'), r: lienzo.getBoundingClientRect() };
    }, S);
    modelo.addEventListener('pointermove', function (e) {
      if (!arrastre) return;
      var dx = (e.clientX - arrastre.x) / arrastre.r.width * 100;
      var dy = (e.clientY - arrastre.y) / arrastre.r.height * 100;
      var p = arrastre.p;
      if (arrastre.asa) {
        modelo.style.width = Math.min(100 - p.l, Math.max(15, p.w + dx)) + '%';
        modelo.style.height = Math.min(100 - p.t, Math.max(15, p.h + dy)) + '%';
      } else {
        modelo.style.left = Math.min(100 - p.w, Math.max(0, p.l + dx)) + '%';
        modelo.style.top = Math.min(100 - p.h, Math.max(0, p.t + dy)) + '%';
      }
    }, S);
    function soltar() { arrastre = null; }
    modelo.addEventListener('pointerup', soltar, S);
    modelo.addEventListener('pointercancel', soltar, S);
    colores(); pintar();
  }

  /* ---------- Guía de medidas ---------- */
  function medidas(S) {
    var form = document.getElementById('medir-form');
    if (!form) return;
    var ancho = document.getElementById('medir-ancho');
    var alto = document.getElementById('medir-alto');
    var info = document.getElementById('medir-info');
    var boton = document.getElementById('medir-usar');
    function valor(input) { var v = parseFloat(String(input.value).replace(',', '.')); return v >= 20 && v <= 400 ? v : null; }
    function actualizar() {
      var a = valor(ancho), h = valor(alto);
      if (a && h) info.textContent = info.dataset.superficie + ': ' + (a * h / 10000).toFixed(2).replace('.', ',') + ' m²';
      else info.textContent = '';
    }
    ancho.addEventListener('input', actualizar, S);
    alto.addEventListener('input', actualizar, S);
    // Se valida antes de que app.js abra el asistente (este oyente va en el propio botón)
    boton.addEventListener('click', function (e) {
      var a = valor(ancho), h = valor(alto);
      if (!a || !h) {
        e.preventDefault();
        e.stopPropagation();
        info.textContent = info.dataset.error;
        (a ? alto : ancho).focus();
        return;
      }
      window.medidasPresupuesto = Math.round(a) + ' × ' + Math.round(h) + ' cm';
    }, S);
    form.addEventListener('submit', function (e) { e.preventDefault(); }, S);
  }

  /* ---------- Aviso de temporada ---------- */
  function temporada() {
    var mes = new Date().getMonth() + 1;
    document.querySelectorAll('.temporada[data-meses]').forEach(function (a) {
      a.hidden = a.dataset.meses.split(',').indexOf(String(mes)) === -1;
    });
  }

  /* ---------- Comparador antes / después ---------- */
  function comparadores(S) {
    document.querySelectorAll('.comparador').forEach(function (c) {
      var r = c.querySelector('.comparador-rango');
      r.addEventListener('input', function () { c.style.setProperty('--pos', r.value + '%'); }, S);
    });
  }

  function iniciar() {
    if (control) control.abort();
    control = new AbortController();
    var S = { signal: control.signal };
    temporada();
    diagnostico(S);
    probador(S);
    medidas(S);
    comparadores(S);
  }
  window.herramientas = { iniciar: iniciar };
  iniciar();
})();
