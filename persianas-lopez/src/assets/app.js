(function () {
  'use strict';
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clamp(v) { return Math.min(1, Math.max(0, v)); }
  function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
  function leer(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  /* ---------- Analítica sin cookies ---------- */
  function medir(evento) {
    try {
      if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: 'evento/' + evento, title: evento, event: true });
      if (window.va) window.va('event', { name: evento });
    } catch (e) { /* la analítica nunca debe romper la página */ }
  }
  window.medir = medir;
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-medir]');
    if (a) medir(a.getAttribute('data-medir'));
  });

  // Todo lo que depende del contenido de la página se monta aquí. Al cambiar de idioma
  // se sustituye el <body> y se vuelve a llamar: el AbortController quita los oyentes anteriores.
  var control = null;
  function arrancar() {
    if (control) control.abort();
    control = new AbortController();
    var S = { signal: control.signal };
    var SP = { passive: true, signal: control.signal };

    /* ---------- Menú a pantalla completa ---------- */
    var btn = document.getElementById('menu-btn');
    var texto = document.getElementById('menu-texto');
    var panel = document.getElementById('menu-panel');
    var abierto = false;
    function setMenu(abrir) {
      abierto = abrir;
      var r = btn.getBoundingClientRect();
      panel.style.setProperty('--cx', (r.left + r.width / 2) + 'px');
      panel.style.setProperty('--cy', (r.top + r.height / 2) + 'px');
      document.documentElement.classList.toggle('menu-abierto', abrir);
      document.body.style.overflow = abrir ? 'hidden' : '';
      btn.setAttribute('aria-expanded', String(abrir));
      btn.setAttribute('aria-label', btn.dataset[abrir ? 'cerrar' : 'abrir']);
      texto.textContent = btn.dataset[abrir ? 'textoCerrar' : 'textoAbrir'];
      if (abrir) setTimeout(function () { var p = panel.querySelector('a'); if (p) p.focus({ preventScroll: true }); }, 350);
    }
    btn.addEventListener('click', function () { setMenu(!abierto); }, S);
    panel.querySelectorAll('a, button').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && abierto) { setMenu(false); btn.focus(); }
      if (e.key === 'Tab' && abierto) {
        var focos = [btn].concat([].slice.call(panel.querySelectorAll('a, button')));
        var i = focos.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); focos[focos.length - 1].focus(); }
        else if (!e.shiftKey && i === focos.length - 1) { e.preventDefault(); focos[0].focus(); }
      }
    }, S);

    /* ---------- Selector de idioma ---------- */
    var idioma = document.getElementById('idioma');
    var idiomaBtn = document.getElementById('idioma-btn');
    function setIdioma(abrir) {
      idioma.classList.toggle('idioma-abierto', abrir);
      idiomaBtn.setAttribute('aria-expanded', String(abrir));
    }
    idiomaBtn.addEventListener('click', function () { setIdioma(!idioma.classList.contains('idioma-abierto')); }, S);
    document.addEventListener('click', function (e) { if (!idioma.contains(e.target)) setIdioma(false); }, S);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && idioma.classList.contains('idioma-abierto')) { setIdioma(false); idiomaBtn.focus(); }
    }, S);

    /* ---------- Barra de progreso, volver arriba y sección activa ---------- */
    var progreso = document.getElementById('progreso');
    var subir = document.getElementById('subir');
    var barraMovil = document.getElementById('barra-movil');
    var esInicio = !!document.getElementById('escena');
    var enlaces = document.querySelectorAll('[data-spy]');
    var secciones = ['inicio', 'servicios', 'repuestos', 'presupuesto', 'faq', 'contacto', 'ubicacion']
      .map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var pendiente = false;
    var aviso = document.getElementById('aviso-cookies');
    var avisoPendiente = !leer('aviso-cookies') && !!document.getElementById('escena');

    function pintar() {
      pendiente = false;
      var y = window.scrollY;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      progreso.style.transform = 'scaleX(' + (total > 0 ? y / total : 0) + ')';
      var umbral = esInicio ? window.innerHeight * 0.5 : 400;
      var fuera = y > umbral;
      subir.style.opacity = fuera ? '1' : '0';
      subir.style.transform = fuera ? 'none' : '';
      // Barra de acciones del móvil: aparece en cuanto se empieza a bajar
      barraMovil.classList.toggle('visible', y > 120);
      if (fuera && avisoPendiente) mostrarAviso();
      if (esInicio) {
        var linea = window.innerHeight * 0.35, actual = 'inicio';
        secciones.forEach(function (s) { if (s.getBoundingClientRect().top <= linea) actual = s.id; });
        enlaces.forEach(function (a) {
          var activo = a.dataset.spy === actual;
          a.classList.toggle('is-active', activo);
          if (activo) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      }
    }
    window.addEventListener('scroll', function () { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } }, SP);
    pintar();

    /* ---------- Brillo del cristal que sigue al cursor ---------- */
    document.addEventListener('pointermove', function (e) {
      var g = e.target.closest && e.target.closest('.glass');
      if (!g) return;
      var r = g.getBoundingClientRect();
      g.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      g.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, SP);

    /* ---------- Aparición al entrar en pantalla ---------- */
    function contar(el) {
      var fin = parseFloat(el.dataset.to), dec = parseInt(el.dataset.dec, 10), inicio = performance.now();
      (function frame(ahora) {
        var t = clamp((ahora - inicio) / 1400);
        el.textContent = (fin * (1 - Math.pow(1 - t, 3))).toFixed(dec).replace('.', ',');
        if (t < 1) requestAnimationFrame(frame);
      })(inicio);
    }
    if ('IntersectionObserver' in window && !reducido) {
      var obs = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      document.querySelectorAll('.reveal, .stars').forEach(function (el) { obs.observe(el); });
      var obsC = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { contar(e.target); obsC.unobserve(e.target); } });
      }, { threshold: 0.6 });
      document.querySelectorAll('.contador').forEach(function (el) { obsC.observe(el); });
      control.signal.addEventListener('abort', function () { obs.disconnect(); obsC.disconnect(); });
    } else {
      document.querySelectorAll('.reveal, .stars').forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* ---------- Aviso de cookies (solo informativo: la web no usa cookies) ---------- */
    // En la portada sale al bajar un poco para no tapar sus botones; en el resto, a los 1,5 s
    function mostrarAviso() { avisoPendiente = false; aviso.classList.remove('hidden'); }
    if (!leer('aviso-cookies') && !esInicio) {
      var espera = setTimeout(mostrarAviso, 1500);
      control.signal.addEventListener('abort', function () { clearTimeout(espera); });
    }
    document.getElementById('aviso-cookies-ok').addEventListener('click', function () {
      guardar('aviso-cookies', '1');
      aviso.classList.add('hidden');
    }, S);

    /* ---------- Mapa de Google solo bajo demanda ---------- */
    function cargarMapa(caja) {
      var f = document.createElement('iframe');
      f.src = caja.dataset.mapaSrc;
      f.title = caja.dataset.mapaTitulo;
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.allowFullscreen = true;
      f.className = 'absolute inset-0 h-full w-full';
      f.style.border = '0';
      caja.innerHTML = '';
      caja.appendChild(f);
    }
    document.querySelectorAll('.mapa').forEach(function (caja) {
      if (leer('mapa-ok')) { cargarMapa(caja); return; }
      var b = caja.querySelector('.mapa-cargar');
      if (b) b.addEventListener('click', function () { guardar('mapa-ok', '1'); medir('mapa'); cargarMapa(caja); }, S);
    });

    /* ---------- Asistente de presupuesto ---------- */
    var datos = JSON.parse(document.getElementById('chat-datos').textContent);
    var chat = document.getElementById('chat');
    var lista = document.getElementById('chat-mensajes');
    var opciones = document.getElementById('chat-opciones');
    var form = document.getElementById('chat-form');
    var input = document.getElementById('chat-input');
    var saltar = document.getElementById('chat-saltar');
    var estado = null;
    var ultimoFoco = null;

    function burbuja(html, yo) {
      var p = document.createElement('div');
      p.className = 'burbuja ' + (yo ? 'burbuja-yo' : 'burbuja-bot');
      if (yo) p.textContent = html; else p.innerHTML = html;
      lista.appendChild(p);
      lista.scrollTop = lista.scrollHeight;
    }
    function escribir(html, despues) {
      var e = document.createElement('div');
      e.className = 'burbuja burbuja-bot escribiendo';
      e.setAttribute('aria-label', datos.escribiendo);
      e.innerHTML = '<span></span><span></span><span></span>';
      lista.appendChild(e);
      lista.scrollTop = lista.scrollHeight;
      setTimeout(function () { e.remove(); burbuja(html); if (despues) despues(); }, reducido ? 0 : 550);
    }
    function limpiarEntrada() {
      opciones.innerHTML = '';
      opciones.classList.remove('hidden');
      form.classList.add('hidden');
      form.classList.remove('flex');
    }
    function botones(lista_, alElegir) {
      limpiarEntrada();
      lista_.forEach(function (txt, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'opcion-chat';
        b.style.animationDelay = (i * 40) + 'ms';
        b.textContent = txt;
        b.addEventListener('click', function () { alElegir(txt); });
        opciones.appendChild(b);
      });
      var primero = opciones.querySelector('button');
      if (primero) primero.focus({ preventScroll: true });
    }
    function pedirTexto(alResponder) {
      opciones.innerHTML = '';
      opciones.classList.add('hidden');
      form.classList.remove('hidden');
      form.classList.add('flex');
      input.value = '';
      input.focus({ preventScroll: true });
      form.onsubmit = function (e) {
        e.preventDefault();
        var v = input.value.trim();
        if (v) alResponder(v);
      };
      saltar.onclick = function () { alResponder(null); };
    }
    function pasoSiguiente() {
      var pasos = datos.servicios[estado.servicio].pasos.concat(datos.comunes);
      var paso = pasos[estado.i];
      if (!paso) return resumen();
      var id = paso[0], pregunta = paso[1], ops = paso[2];
      escribir(pregunta, function () {
        var responder = function (v) {
          if (v) { burbuja(v, true); estado.resp.push([id, v]); } else { burbuja(datos.saltar, true); }
          estado.i++;
          limpiarEntrada();
          pasoSiguiente();
        };
        if (ops) botones(ops, responder); else pedirTexto(responder);
      });
    }
    function elegirServicio(clave) {
      estado.servicio = clave;
      estado.resp.push(['servicio', datos.servicios[clave].etiqueta]);
      pasoSiguiente();
    }
    function resumen() {
      limpiarEntrada();
      var filas = estado.resp.map(function (r) {
        return '<dt>' + datos.etiquetas[r[0]] + '</dt><dd>' + r[1].replace(/</g, '&lt;') + '</dd>';
      }).join('');
      var precio = datos.precios && datos.precios[estado.servicio];
      escribir(datos.resumen + '<dl class="resumen-chat mt-2">' + filas + '</dl>', function () {
        escribir(precio ? '<strong>' + datos.precio + ':</strong> ' + precio : datos.sinPrecio, function () {
          limpiarEntrada();
          var enviar = document.createElement('button');
          enviar.type = 'button';
          enviar.className = 'btn btn-verde w-full px-5 py-3 text-sm';
          enviar.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-whatsapp"/></svg> ' + datos.enviar;
          enviar.addEventListener('click', function () {
            var lineas = [datos.mensaje].concat(estado.resp.map(function (r) { return '• ' + datos.etiquetas[r[0]] + ': ' + r[1]; }));
            window.open('https://wa.me/' + datos.wa + '?text=' + encodeURIComponent(lineas.join('\n')), '_blank', 'noopener');
            medir('asistente-enviado');
            burbuja(datos.gracias);
          });
          var llamar = document.createElement('a');
          llamar.href = 'tel:' + datos.tel;
          llamar.className = 'opcion-chat';
          llamar.textContent = datos.llamarMejor;
          llamar.setAttribute('data-medir', 'llamada');
          var otra = document.createElement('button');
          otra.type = 'button';
          otra.className = 'opcion-chat';
          otra.textContent = datos.reiniciar;
          otra.addEventListener('click', function () { iniciar(); });
          opciones.appendChild(enviar);
          opciones.appendChild(llamar);
          opciones.appendChild(otra);
          enviar.focus({ preventScroll: true });
        });
      });
    }
    function iniciar(servicio) {
      estado = { servicio: null, i: 0, resp: [] };
      lista.innerHTML = '';
      limpiarEntrada();
      escribir(datos.hola, function () {
        if (servicio && datos.servicios[servicio]) { elegirServicio(servicio); return; }
        escribir(datos.queNecesitas, function () {
          var claves = Object.keys(datos.servicios);
          botones(claves.map(function (k) { return datos.servicios[k].etiqueta; }), function (txt) {
            burbuja(txt, true);
            var clave = claves.filter(function (k) { return datos.servicios[k].etiqueta === txt; })[0];
            limpiarEntrada();
            elegirServicio(clave);
          });
        });
      });
    }
    function abrirChat(servicio) {
      if (abierto) setMenu(false);
      ultimoFoco = document.activeElement;
      chat.hidden = false;
      document.documentElement.classList.add('chat-abierto');
      medir('asistente-abierto');
      if (!estado || servicio) iniciar(servicio);
    }
    function cerrarChat() {
      chat.hidden = true;
      document.documentElement.classList.remove('chat-abierto');
      if (ultimoFoco) ultimoFoco.focus({ preventScroll: true });
    }
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-abrir-chat]');
      if (b) { e.preventDefault(); abrirChat(b.dataset.servicio); }
    }, S);
    document.getElementById('chat-cerrar').addEventListener('click', cerrarChat, S);
    document.getElementById('chat-reiniciar').addEventListener('click', function () { iniciar(); }, S);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !chat.hidden) cerrarChat(); }, S);

    document.getElementById('anio').textContent = new Date().getFullYear();
  }
  arrancar();

  /* ---------- Cambio de idioma sin recargar ---------- */
  // Se pide la misma página en el otro idioma, se cambia el contenido y se conserva la posición.
  // Si algo falla (o la otra página necesita scripts que esta no tiene) se navega de forma normal.
  var rutaActual = location.pathname;
  var SELECTORES_HEAD = 'meta[name="description"], meta[property^="og:"], link[rel="canonical"], link[rel="alternate"], script[type="application/ld+json"]';
  function cambiarIdioma(url, empujar) {
    var y = window.scrollY;
    fetch(url, { credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var faltan = [].some.call(doc.querySelectorAll('script[src]'), function (s) {
          return !document.querySelector('script[src="' + s.getAttribute('src') + '"]');
        });
        if (faltan) { location.href = url; return; }
        function aplicar() {
          var raiz = document.documentElement;
          raiz.lang = doc.documentElement.lang;
          raiz.classList.remove('menu-abierto', 'chat-abierto');
          document.title = doc.title;
          document.head.querySelectorAll(SELECTORES_HEAD).forEach(function (n) { n.remove(); });
          doc.head.querySelectorAll(SELECTORES_HEAD).forEach(function (n) { document.head.appendChild(document.importNode(n, true)); });
          document.body.replaceWith(document.adoptNode(doc.body));
          if (empujar) history.pushState({ idioma: raiz.lang }, '', url);
          rutaActual = location.pathname;
          arrancar();
          if (window.portada) window.portada.iniciar(false);
          window.scrollTo({ top: y, behavior: 'instant' });
          document.getElementById('idioma-btn').focus({ preventScroll: true });
          medir('idioma-' + raiz.lang);
          try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: location.pathname }); } catch (e) { /* nada */ }
        }
        if (document.startViewTransition && !reducido) document.startViewTransition(aplicar); else aplicar();
      })
      .catch(function () { location.href = url; });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-idioma]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    e.preventDefault();
    if (a.getAttribute('aria-current')) { document.getElementById('idioma').classList.remove('idioma-abierto'); return; }
    cambiarIdioma(a.href, true);
  });
  window.addEventListener('popstate', function () {
    // Los saltos a anclas también disparan popstate: solo se recarga el contenido si cambia la página
    if (location.pathname !== rutaActual) cambiarIdioma(location.href, false);
  });
})();
