# Dossier base: Noah para pizzerias de Ourense

Version generica del dossier de La Vita Buona, para ensenarla a cualquier
pizzeria de Ourense. Sale de `../lavitabuona/generador` sin la hoja 6 ("Lo que
vi mirando lo tuyo") y sin ningun dato de un local concreto.

- `noah-pizzerias.pdf` es lo que se envia. **9 hojas.**
- `noah.html` se **genera**: no se edita a mano.
- `generador/` es donde se edita: textos en `paginas.part`, estilos en
  `css.part`, dibujos en `svgs2.py`, flujo en `flujo.py`, cuenta en `valor.py`.

Para volver a generarlo:

    python3 generador/montar.py
    /opt/pw-browsers/chromium-1194/chrome-linux/chrome --headless --no-sandbox \
      --disable-gpu --no-pdf-header-footer \
      --print-to-pdf=noah-pizzerias.pdf noah.html

Tienen que salir **9 hojas**: portada, una llamada, ocho situaciones, el
telefono que nadie coge, seis formas, como funciona por dentro, la cuenta que
importa, la propuesta y como empezamos.

## Que cambia respecto a La Vita Buona

- **Pedido de ejemplo de 30,00 EUR** (margarita 9, barbacoa 11,50, pan de ajo
  con queso 4,50, tiramisu 5) y codigo 4729. Es un ejemplo, y la hoja 2 lo dice.
- **Comision de plataforma del 30 %**, tambien de ejemplo: la hoja 5 dice que
  depende del contrato de cada local.
- Sin fuentes de prensa ni resenas: no hay ningun dato del local que comprobar.
- Viernes, sabados y noches de partido como picos de llamadas.

## Para personalizarlo para un local

Copiar esta carpeta, cambiar el nombre en la portada (`tu pizzeria`) y en los
pies, y poner en la hoja 2 un pedido con platos y precios de su carta.
