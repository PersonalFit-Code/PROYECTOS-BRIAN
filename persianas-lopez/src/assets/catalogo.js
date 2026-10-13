// Muestrario de colores: al pulsar un color se pinta la persiana de ejemplo.
// Va delegado en document para seguir funcionando cuando se cambia de idioma sin recargar.
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.color-btn');
    if (!b) return;
    var muestra = document.getElementById('muestra-persiana');
    var enlace = document.getElementById('muestra-wa');
    document.querySelectorAll('.color-btn').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
    muestra.style.setProperty('--a', b.dataset.a);
    muestra.style.setProperty('--b', b.dataset.b);
    muestra.classList.toggle('madera', b.dataset.color === 'madera');
    document.getElementById('muestra-nombre').textContent = b.dataset.nombre;
    enlace.href = enlace.href.split('?')[0] + '?text=' + encodeURIComponent(enlace.dataset.base + ' ' + b.dataset.nombre.toLowerCase() + '?');
  });
})();
