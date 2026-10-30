# -*- coding: utf-8 -*-
"""Monta carrusel.html: 5 fotos de 1080x1350 para Instagram, con los dibujos
del dossier de pizzerias (../../pizzerias/generador).

    python3 generador/montar.py
    node generador/fotos.js

Se edita AQUI, nunca carrusel.html a mano.
"""
import pathlib
import sys

base = pathlib.Path(__file__).resolve().parent
dossier = base.parent.parent / "pizzerias" / "generador"
sys.path.insert(0, str(dossier))
import svgs  # noqa: E402  (el sprite de iconos)
import svgs2 as S2  # noqa: E402
import valor as V  # noqa: E402

TOTAL = 5


def pie(n):
    puntos = "".join(f'<i class="{"on" if i == n else ""}"></i>' for i in range(1, TOTAL + 1))
    return (f'<div class="pie"><span class="marca"><svg width="34" height="34"><use href="#i-marca"/></svg>'
            f'Noah &middot; asistente telef&oacute;nica con IA</span>'
            f'<span class="puntos">{puntos}<b>{n}/{TOTAL}</b></span></div>')


def ico(nombre, tam=40, color="currentColor"):
    return f'<svg width="{tam}" height="{tam}" style="color:{color}"><use href="#i-{nombre}"/></svg>'


fotos = []

# 1 · Gancho
fotos.append(f'''
<section class="foto oscura">
  <div class="deco">{S2.pizza_deco()}</div>
  <p class="cinta">Para pizzer&iacute;as de Ourense</p>
  <h1>&iquest;Cu&aacute;ntos pedidos se te escapan cuando <em>nadie coge el tel&eacute;fono?</em></h1>
  <p class="bajada">Te presento a <b>Noah</b>: una asistente de voz con inteligencia artificial que contesta las llamadas de tu pizzer&iacute;a y toma los pedidos por ti.</p>
  <div class="desliza">Desliza <span>&rarr;</span></div>
  {pie(1)}
</section>''')

# 2 · El problema
fotos.append(f'''
<section class="foto">
  <p class="epi">El problema</p>
  <h2>Viernes, 21:30. El tel&eacute;fono suena y <em>nadie puede cogerlo.</em></h2>
  <div class="dibujo">{S2.dolor()}</div>
  <div class="caja mal">
    {ico("tel-no", 52, "#C0392B")}
    <p>Cada llamada sin contestar es un pedido que <b>se va a otro local</b>, o que acaba en la plataforma <b>pagando comisi&oacute;n</b>.</p>
  </div>
  {pie(2)}
</section>''')

# 3 · La solucion
fotos.append(f'''
<section class="foto">
  <p class="epi">La soluci&oacute;n</p>
  <h2>Noah coge el tel&eacute;fono <em>por ti.</em> Siempre.</h2>
  <div class="lista">
    <div>{ico("tel", 46)}<b>Contesta a la primera</b><span>Y a varias llamadas a la vez.</span></div>
    <div>{ico("carta", 46)}<b>Se sabe tu carta entera</b><span>Ingredientes, precios y recomendaciones.</span></div>
    <div>{ico("lista", 46)}<b>Toma el pedido plato a plato</b><span>Y lo repite hasta que el cliente confirma.</span></div>
    <div>{ico("euro", 46)}<b>Calcula el total exacto</b><span>Lo suma el programa, no &laquo;a ojo&raquo;.</span></div>
    <div>{ico("pantalla", 46)}<b>Lo manda a la cocina</b><span>El pedido aparece en pantalla al momento.</span></div>
    <div>{ico("luna", 46)}<b>Atiende con el local cerrado</b><span>Da tu horario y la direcci&oacute;n.</span></div>
  </div>
  <p class="nota">Habla castellano con voz natural y dice que es una asistente virtual. En el local no hay que instalar nada.</p>
  {pie(3)}
</section>''')

# 4 · Asi suena
fotos.append(f'''
<section class="foto">
  <p class="epi">As&iacute; suena una llamada</p>
  <div class="chat">
    <div class="burbuja noah"><small>Noah</small>Buenas, soy Noah, la asistente virtual de la pizzer&iacute;a. &iquest;Qu&eacute; le pongo?</div>
    <div class="burbuja cli"><small>Cliente</small>Una margarita, una barbacoa y algo para picar.</div>
    <div class="burbuja noah"><small>Noah</small>El pan de ajo con queso gusta mucho. Cuatro cincuenta.</div>
    <div class="burbuja noah"><small>Noah</small>Son treinta euros. Su c&oacute;digo es cuatro, siete, dos, nueve.</div>
  </div>
  <p class="flecha">{ico("rayo", 34, "#E0952F")} Y en la cocina aparece esto:</p>
  <div class="pantalla">
    <div class="barra"><span>Pedidos de hoy &middot; Tu pizzer&iacute;a</span><span>21:31</span></div>
    <div class="cuerpo">
      <div class="fila-cod"><span class="cod">4729</span><span>recogida &middot; pendiente</span></div>
      <table>
        <tr><td>1 &times; Pizza margarita</td><td>9,00 &euro;</td></tr>
        <tr><td>1 &times; Pizza barbacoa</td><td>11,50 &euro;</td></tr>
        <tr><td>1 &times; Pan de ajo con queso</td><td>4,50 &euro;</td></tr>
        <tr><td>1 &times; Tiramis&uacute;</td><td>5,00 &euro;</td></tr>
        <tr class="total"><td>TOTAL</td><td>30,00 &euro;</td></tr>
      </table>
    </div>
  </div>
  <p class="nota">Platos y precios de ejemplo. Con tu carta cargada, los importes los calcula el programa.</p>
  {pie(4)}
</section>''')

# 5 · La cuenta y el contacto
fotos.append(f'''
<section class="foto">
  <p class="epi">La cuenta que importa</p>
  <h2>Una llamada cuesta unos <em>50 c&eacute;ntimos.</em> Un pedido que no se pierde deja unos <em>30 &euro;.</em></h2>
  <div class="dibujo">{V.balanza()}</div>
  <p class="nota">Con un solo pedido salvado al d&iacute;a, recuperas unos <b>780 &euro; al mes</b> en ventas (26 d&iacute;as de apertura, pedido de 30 &euro;).</p>
  <div class="contacto">
    <p>&iquest;Tienes una pizzer&iacute;a en Ourense?<br><b>Escr&iacute;beme y te lo ense&ntilde;o funcionando con una llamada.</b></p>
    <div class="quien"><small>Brian Carbajal</small><span>Consultor freelance en IA para negocios</span><b>611 57 35 80</b></div>
  </div>
  {pie(5)}
</section>''')

css = (base / "carrusel.css").read_text()
html = ('<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
        '<title>Noah · carrusel</title>\n<style>\n' + css + '</style>\n</head>\n<body>\n'
        + svgs.SPRITE + '\n' + "\n".join(fotos) + '\n</body>\n</html>\n')
(base.parent / "carrusel.html").write_text(html)
print("carrusel.html:", len(html), "bytes")
