// Persiana de la portada: al cargar se abren las rendijas y sube sola en tres tirones hasta enrollarse en el cajón.
(function () {
  'use strict';
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clamp(v) { return Math.min(1, Math.max(0, v)); }
  // Cada tirón sube deprisa, se pasa un poco y se asienta, como al tirar de la cinta
  function tiron(t) { var c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }

  // [inicio en ms, duración en ms, altura que alcanza de 0 a 1]
  var TIRONES = [[650, 520, 0.34], [1600, 520, 0.67], [2550, 760, 1]];
  var FIN = 3400;

  var e = {}, lamas = [], alto = 0, paso = 34, cajonAlto = 88, terminado = false;

  function construir() {
    paso = window.innerWidth < 640 ? 28 : 36;
    cajonAlto = window.innerWidth < 640 ? 84 : 92;
    e.escena.style.setProperty('--cajon', cajonAlto + 'px');
    e.persiana.style.setProperty('--lama', paso + 'px');
    alto = e.escena.clientHeight - cajonAlto;
    var n = Math.ceil(alto / paso) + 2;
    e.lamas.innerHTML = '';
    lamas = [];
    for (var i = 0; i < n; i++) {
      var l = document.createElement('div');
      l.className = 'lama';
      e.lamas.appendChild(l);
      lamas.push(l);
    }
  }

  function subida(t) {
    var h = 0;
    for (var i = 0; i < TIRONES.length; i++) {
      var x = TIRONES[i], desde = i ? TIRONES[i - 1][2] : 0;
      if (t >= x[0]) h = desde + (x[2] - desde) * tiron(clamp((t - x[0]) / x[1]));
    }
    return h;
  }

  function pintar(t) {
    var h = t >= FIN ? 1 : subida(t);
    // Las rendijas se abren antes del primer tirón y se cierran al enrollarse
    var rendija = clamp((t - 150) / 400) * (1 - clamp((h - 0.75) / 0.25)) * paso * 0.3;
    var sube = h * (alto + paso * 2);
    var fondo = alto - 16 - sube;

    e.barra.style.transform = 'translateY(' + fondo + 'px)';
    e.barra.style.visibility = fondo < -20 ? 'hidden' : 'visible';
    for (var i = 0; i < lamas.length; i++) {
      var abajo = fondo - i * (paso + rendija);
      var arriba = abajo - paso;
      var l = lamas[i];
      if (abajo <= 0) { l.style.visibility = 'hidden'; continue; }
      l.style.visibility = 'visible';
      // Cerca del cajón cada lama gira como si se enrollara en el eje
      var zona = paso * 2.2;
      var giro = arriba < zona ? (1 - Math.max(arriba, 0) / zona) * 75 : 0;
      l.style.transform = 'translateY(' + Math.max(arriba, 0) + 'px) rotateX(' + giro + 'deg)';
      l.style.filter = giro ? 'brightness(' + (1 - giro / 160) + ')' : '';
    }
    e.rodillo.style.backgroundPosition = '0 ' + (-sube * 0.6) + 'px';
    e.luz.style.opacity = String(clamp((t - 150) / 500) * (1 - clamp((t - 2800) / 600)) * 0.9);

    // El contenido se enfoca durante el último tirón; el desenfoque solo en escritorio porque es caro de repintar
    var vista = clamp((t - 2450) / 800);
    e.contenido.style.transform = vista < 1 ? 'scale(' + (0.94 + vista * 0.06) + ')' : '';
    e.contenido.style.filter = vista < 1 && window.innerWidth >= 1024 ? 'blur(' + ((1 - vista) * 8) + 'px)' : '';
    e.items.forEach(function (el, i) {
      var v = clamp((t - 2650 - i * 110) / 550);
      el.style.opacity = String(v);
      el.style.transform = v < 1 ? 'translateY(' + ((1 - v) * 40) + 'px)' : '';
    });

    if (t >= FIN) {
      terminado = true;
      e.persiana.style.visibility = 'hidden';
      document.documentElement.classList.add('persiana-abierta');
      // Avisa a app.js para que muestre la barra de acciones del móvil
      window.dispatchEvent(new Event('scroll'));
    }
  }

  function iniciar(animar) {
    e.escena = document.getElementById('escena');
    if (!e.escena) return;
    e.persiana = document.getElementById('persiana');
    e.lamas = document.getElementById('lamas');
    e.barra = document.getElementById('barra');
    e.rodillo = document.getElementById('rodillo');
    e.luz = document.getElementById('luz');
    e.contenido = document.getElementById('hero-contenido');
    e.items = [].slice.call(document.querySelectorAll('.hero-item'));
    terminado = false;
    construir();
    // Sin animación si el usuario la ha desactivado o si la página se abre ya bajada
    if (!animar || reducido || window.scrollY > window.innerHeight * 0.5) { pintar(FIN); return; }
    var inicio = null;
    (function frame(ahora) {
      if (inicio === null) inicio = ahora;
      pintar(ahora - inicio);
      if (!terminado) requestAnimationFrame(frame);
    })(performance.now());
  }

  var anchoPrevio = window.innerWidth;
  window.addEventListener('resize', function () {
    // En móvil la barra del navegador cambia el alto: solo se reconstruye si cambia el ancho y la persiana sigue a la vista
    if (window.innerWidth === anchoPrevio || terminado || !e.escena) return;
    anchoPrevio = window.innerWidth;
    construir();
  });

  window.portada = { iniciar: iniciar };
  iniciar(true);
})();
