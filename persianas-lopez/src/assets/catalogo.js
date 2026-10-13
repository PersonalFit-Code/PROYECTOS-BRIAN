// Muestrario de colores: al pulsar un color se pinta la persiana de ejemplo.
(function () {
  'use strict';
  var muestra = document.getElementById('muestra-persiana');
  var nombre = document.getElementById('muestra-nombre');
  var enlace = document.getElementById('muestra-wa');
  var botones = document.querySelectorAll('.color-btn');
  var tel = enlace.href.split('?')[0];

  botones.forEach(function (b) {
    b.addEventListener('click', function () {
      botones.forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
      muestra.style.setProperty('--a', b.dataset.a);
      muestra.style.setProperty('--b', b.dataset.b);
      muestra.classList.toggle('madera', b.dataset.color === 'madera');
      nombre.textContent = b.dataset.nombre;
      enlace.href = tel + '?text=' + encodeURIComponent(enlace.dataset.base + ' ' + b.dataset.nombre.toLowerCase() + '?');
    });
  });
})();
