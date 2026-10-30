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

TOTAL = 5


def pie(n):
    puntos = "".join(f'<i class="{"on" if i == n else ""}"></i>' for i in range(1, TOTAL + 1))
    return (f'<div class="pie"><span class="marca"><svg width="34" height="34"><use href="#i-marca"/></svg>'
            f'Noah &middot; asistente telef&oacute;nica con IA</span>'
            f'<span class="puntos">{puntos}<b>{n}/{TOTAL}</b></span></div>')


def ico(nombre, tam=40, color="currentColor"):
    return f'<svg width="{tam}" height="{tam}" style="color:{color}"><use href="#i-{nombre}"/></svg>'


fotos = []


def noti(hora, cuando, clase=""):
    return (f'<div class="noti {clase}"><span class="ic-n">{ico("tel-no", 34)}</span>'
            f'<div><b>Llamada perdida</b><span>Cliente &middot; {hora}</span></div><em>{cuando}</em></div>')


def tarjeta(icono, titulo, texto):
    return f'<div><span class="ic">{ico(icono, 38)}</span><b>{titulo}</b><span>{texto}</span></div>'


# 1 · Gancho: las llamadas perdidas de un viernes
fotos.append(f"""
<section class="foto oscura">
  <div class="notis">
    {noti("21:32", "ahora")}
    {noti("21:27", "hace 5 min", "atras1")}
    {noti("21:19", "hace 13 min", "atras2")}
  </div>
  <p class="cinta">Para pizzer&iacute;as de Ourense</p>
  <h1>&iquest;Cu&aacute;ntos pedidos se te escapan cuando <em>nadie coge el tel&eacute;fono?</em></h1>
  <p class="bajada">Te presento a <b>Noah</b>: la asistente de voz con IA que coge el tel&eacute;fono de tu pizzer&iacute;a y toma los pedidos por ti.</p>
  <div class="desliza">Desliza <span>&rarr;</span></div>
  {pie(1)}
</section>""")

# 2 · El problema, con la cuenta
fotos.append(f"""
<section class="foto">
  <p class="epi">El problema</p>
  <h2>Viernes, 21:30. El tel&eacute;fono suena y <em>nadie puede cogerlo.</em></h2>
  <div class="dibujo">{S2.dolor()}</div>
  <div class="ecu">
    <div><b>3</b><span>llamadas perdidas<br>a la semana</span></div>
    <i>&times;</i>
    <div><b>30&nbsp;&euro;</b><span>un pedido<br>normal</span></div>
    <i>=</i>
    <div class="res"><b>4.700&nbsp;&euro;</b><span>al a&ntilde;o que<br>no entran</span></div>
  </div>
  <p class="nota chica">Cuenta de ejemplo. Cu&aacute;ntas llamadas se pierden de verdad lo sabes t&uacute;.</p>
  {pie(2)}
</section>""")

# 3 · La solucion
fotos.append(f"""
<section class="foto">
  <p class="epi">La soluci&oacute;n</p>
  <h2>Noah coge el tel&eacute;fono <em>por ti.</em> Siempre.</h2>
  <div class="lista">
    {tarjeta("tel", "Contesta a la primera", "Y a varias llamadas a la vez.")}
    {tarjeta("carta", "Se sabe tu carta entera", "Ingredientes, precios y recomendaciones.")}
    {tarjeta("lista", "Toma el pedido plato a plato", "Y lo repite hasta que el cliente confirma.")}
    {tarjeta("euro", "Calcula el total exacto", "Lo suma el programa, no &laquo;a ojo&raquo;.")}
    {tarjeta("pantalla", "Lo manda a la cocina", "El pedido aparece en pantalla al momento.")}
    {tarjeta("luna", "Atiende con el local cerrado", "Da tu horario y la direcci&oacute;n.")}
  </div>
  <p class="nota">Voz natural en castellano. <b>En el local no hay que instalar nada.</b></p>
  {pie(3)}
</section>""")

# 4 · Asi suena
fotos.append(f"""
<section class="foto">
  <p class="epi">As&iacute; suena una llamada</p>
  <div class="encurso"><span class="vivo"></span>Llamada en curso &middot; 01:12<span class="onda">{"".join(f'<i style="height:{h}px"></i>' for h in (10, 22, 34, 18, 28, 12, 26, 16, 30, 14))}</span></div>
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
</section>""")

# 5 · La cuenta y el contacto
fotos.append(f"""
<section class="foto">
  <p class="epi">La cuenta que importa</p>
  <h2>Lo que cuesta frente a <em>lo que deja.</em></h2>
  <div class="vs">
    <div class="c claro"><span class="ic">{ico("tel", 40)}</span><b>0,50&nbsp;&euro;</b><span>lo que cuesta que Noah coja una llamada</span></div>
    <div class="x"><small>deja</small>&times;60</div>
    <div class="c oscuro"><span class="ic">{ico("pizza", 40)}</span><b>30&nbsp;&euro;</b><span>lo que deja un pedido que no se pierde</span></div>
  </div>
  <div class="dato"><b>780&nbsp;&euro;<small>/mes</small></b><span>en ventas que recuperas salvando <strong>un solo pedido al d&iacute;a</strong></span></div>
  <p class="nota chica">Ejemplo con un pedido de 30 &euro; y 26 d&iacute;as de apertura al mes.</p>
  <div class="garantias">
    <div>{ico("check", 30)}Sin permanencia</div>
    <div>{ico("check", 30)}Nada que instalar en el local</div>
    <div>{ico("check", 30)}Lo pruebas antes con llamadas</div>
  </div>
  <div class="contacto">
    <p>&iquest;Tienes una pizzer&iacute;a en Ourense?<br><b>Escr&iacute;beme y te lo ense&ntilde;o funcionando con una llamada.</b></p>
    <div class="quien"><small>Brian Carbajal</small><span>Consultor freelance en IA para negocios</span><b>611 57 35 80</b></div>
  </div>
  {pie(5)}
</section>""")

css = (base / "carrusel.css").read_text()
html = ('<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
        '<title>Noah · carrusel</title>\n<style>\n' + css + '</style>\n</head>\n<body>\n'
        + svgs.SPRITE + '\n' + "\n".join(fotos) + '\n</body>\n</html>\n')
(base.parent / "carrusel.html").write_text(html)
print("carrusel.html:", len(html), "bytes")
