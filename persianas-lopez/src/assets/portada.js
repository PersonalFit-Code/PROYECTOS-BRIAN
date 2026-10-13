// Persiana de la portada: las lamas se separan, entra luz y se enrollan en el cajón al hacer scroll.
(function () {
  'use strict';
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clamp(v) { return Math.min(1, Math.max(0, v)); }
  function suave(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  var tramo = document.getElementById('inicio');
  var escena = document.getElementById('escena');
  var persiana = document.getElementById('persiana');
  var contLamas = document.getElementById('lamas');
  var barra = document.getElementById('barra');
  var rodillo = document.getElementById('rodillo');
  var luz = document.getElementById('luz');
  var aviso = document.getElementById('aviso');
  var indNum = document.getElementById('indicador-num');
  var indBarra = document.getElementById('indicador-barra');
  var indicador = document.getElementById('indicador');
  var heroItems = document.querySelectorAll('.hero-item');
  var heroContenido = document.getElementById('hero-contenido');
  var lamas = [];
  var alto = 0, paso = 34, cajonAlto = 88, pendiente = false;

  function construir() {
    paso = window.innerWidth < 640 ? 28 : 36;
    cajonAlto = window.innerWidth < 640 ? 84 : 92;
    escena.style.setProperty('--cajon', cajonAlto + 'px');
    persiana.style.setProperty('--lama', paso + 'px');
    alto = escena.clientHeight - cajonAlto;
    var n = Math.ceil(alto / paso) + 2;
    contLamas.innerHTML = '';
    lamas = [];
    for (var i = 0; i < n; i++) {
      var l = document.createElement('div');
      l.className = 'lama';
      contLamas.appendChild(l);
      lamas.push(l);
    }
  }

  function pintar() {
    pendiente = false;
    var recorrido = tramo.offsetHeight - window.innerHeight;
    var p = reducido ? 1 : clamp(window.scrollY / (recorrido * 0.9));

    // Fase 1 (0–12 %): las lamas se separan y entra luz por las rendijas
    // Fase 2 (8–92 %): la persiana se enrolla en el cajón
    var rendija = suave(clamp(p / 0.12)) * (1 - clamp((p - 0.6) / 0.3)) * paso * 0.3;
    var sube = suave(clamp((p - 0.08) / 0.84)) * (alto + paso * 2);
    var fondo = alto - 16 - sube;

    barra.style.transform = 'translateY(' + fondo + 'px)';
    barra.style.visibility = fondo < -20 ? 'hidden' : 'visible';

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

    rodillo.style.backgroundPosition = '0 ' + (-sube * 0.6) + 'px';
    luz.style.opacity = String(clamp(p / 0.1) * (1 - clamp((p - 0.18) / 0.3)) * 0.9);
    aviso.style.opacity = String(1 - clamp(p / 0.05));

    var pct = Math.round(clamp((p - 0.08) / 0.84) * 100);
    indNum.textContent = pct + '%';
    indBarra.style.height = pct + '%';
    indicador.style.opacity = String(1 - clamp((p - 0.9) / 0.1));

    // El contenido se enfoca mientras sube; el desenfoque solo en escritorio porque es caro de repintar
    var vista = clamp((p - 0.2) / 0.6);
    heroContenido.style.transform = 'scale(' + (0.92 + vista * 0.08) + ')';
    heroContenido.style.filter = vista < 1 && window.innerWidth >= 1024 ? 'blur(' + ((1 - vista) * 8) + 'px)' : '';
    heroItems.forEach(function (el, i) {
      var t = clamp((p - 0.25 - i * 0.06) / 0.35);
      el.style.opacity = String(t);
      el.style.transform = 'translateY(' + ((1 - t) * 50) + 'px)';
    });
  }

  window.addEventListener('scroll', function () { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } }, { passive: true });
  var anchoPrevio = window.innerWidth;
  window.addEventListener('resize', function () {
    // En móvil la barra del navegador cambia el alto al hacer scroll: solo se reconstruye si cambia el ancho
    if (window.innerWidth !== anchoPrevio) { anchoPrevio = window.innerWidth; construir(); }
    pintar();
  });
  construir();
  pintar();
})();
