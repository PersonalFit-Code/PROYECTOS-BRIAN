# -*- coding: utf-8 -*-
"""Hoja del flujo: como va una llamada por dentro, pieza a pieza y con sus
logos, al estilo de un diagrama de automatizacion (disparador y nodos)."""
from svgs import NEGRO, ACENTO, HUMO, FONT, icono
from logos import logo, ancho_logo

LINEA = "#CDBDA2"
CREMA = "#F6EEE2"
SUAVE = "#CDBFAE"


def tarjeta(x, y, w, h, fondo="#FFFFFF", borde="#E6DCCB", grosor=1.2, r=11):
    return (f'<rect x="{x+1.2}" y="{y+2}" width="{w}" height="{h}" rx="{r}" fill="#140A06" opacity=".07"/>'
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fondo}" stroke="{borde}" stroke-width="{grosor}"/>')


def pastilla(x, y, texto, fondo=ACENTO, color=NEGRO, rayo=False):
    ancho = len(texto) * 6.1 + (30 if rayo else 18)
    s = f'<rect x="{x}" y="{y}" width="{ancho:.0f}" height="17" rx="8.5" fill="{fondo}"/>'
    tx = x + 9
    if rayo:
        s += f'<path d="M{x+12} {y+3} l-4 6.5 h3.4 l-1.6 5 l5-7 h-3.4 l1.6-4.5z" fill="{color}"/>'
        tx = x + 21
    s += (f'<text x="{tx}" y="{y+12}" font-size="8" font-weight="bold" letter-spacing="1.3" '
          f'fill="{color}">{texto}</text>')
    return s


def flecha(x1, x2, y, etiqueta):
    """Conector horizontal con puertos, punta y rotulo encima."""
    dirx = 1 if x2 > x1 else -1
    punta = x2 - 7 * dirx
    medio = (x1 + x2) / 2
    s = (f'<line x1="{x1}" y1="{y}" x2="{punta}" y2="{y}" stroke="{LINEA}" stroke-width="2"/>'
         f'<path d="M{x2} {y} l{-8*dirx} -4.5 v9z" fill="{LINEA}"/>'
         f'<circle cx="{x1}" cy="{y}" r="3.4" fill="#fff" stroke="{LINEA}" stroke-width="1.6"/>')
    ancho = len(etiqueta) * 5.2 + 12
    s += (f'<rect x="{medio-ancho/2:.1f}" y="{y-23}" width="{ancho:.1f}" height="14" rx="7" fill="#fff" stroke="#E6DCCB"/>'
          f'<text x="{medio}" y="{y-13}" font-size="7.6" fill="{HUMO}" text-anchor="middle">{etiqueta}</text>')
    return s


def texto(x, y, titulo, lineas, color_t=NEGRO, color_s=HUMO, tam=11.2, ancla="start"):
    s = f'<text x="{x}" y="{y}" font-size="{tam}" font-weight="bold" fill="{color_t}" text-anchor="{ancla}">{titulo}</text>'
    for i, l in enumerate(lineas):
        s += f'<text x="{x}" y="{y + 13 + i*11.5}" font-size="8.6" fill="{color_s}" text-anchor="{ancla}">{l}</text>'
    return s


def circulo_icono(cx, cy, nombre, r=17, fondo=NEGRO, color=ACENTO):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fondo}"/>'
            + icono(nombre, cx - r * .6, cy - r * .6, r * 1.2, color))


def flujo():
    s = [f'<svg class="f" viewBox="0 0 700 430" {FONT} role="img" aria-label="Flujo de una llamada">']

    # --- Fila 1: disparador, numero, Noah ---
    s.append(tarjeta(8, 54, 150, 104))
    s.append(pastilla(8, 34, "DISPARADOR", rayo=True))
    s.append(circulo_icono(36, 90, "i-tel"))
    s.append(f'<text x="60" y="86" font-size="11.2" font-weight="bold" fill="{NEGRO}">Suena el</text>'
             f'<text x="60" y="99" font-size="11.2" font-weight="bold" fill="{NEGRO}">teléfono</text>')
    s.append(f'<text x="20" y="130" font-size="8.6" fill="{HUMO}">Un cliente llama a</text>')
    s.append(f'<text x="20" y="141.5" font-size="8.6" fill="{HUMO}">La Vita Buona.</text>')

    s.append(flecha(158, 208, 106, "llamada"))

    s.append(tarjeta(208, 54, 140, 104))
    s.append(logo("twilio", 222, 64, 27))
    s.append(texto(222, 114, "El número", ["Recibe la llamada", "y se la pasa a Noah."]))

    s.append(flecha(348, 384, 106, "voz"))

    # Noah, dentro de Vapi: oye, piensa, habla
    s.append(tarjeta(384, 20, 308, 172, fondo=NEGRO, borde=NEGRO, r=13))
    s.append(logo("vapi", 398, 32, 17, color="#FFFFFF"))
    s.append(f'<text x="678" y="45" font-size="8" font-weight="bold" letter-spacing="1.6" fill="{ACENTO}" text-anchor="end">NOAH, LA VOZ</text>')
    piezas = [
        ("deepgram", "Oye", ["Entiende lo", "que le dicen"], "Deepgram"),
        ("anthropic", "Piensa", ["Decide qué", "contestar"], "Claude"),
        ("elevenlabs", "Habla", ["Le responde", "con voz"], "ElevenLabs"),
    ]
    for i, (marca, verbo, lineas, nombre) in enumerate(piezas):
        x = 398 + i * 99
        s.append(f'<rect x="{x}" y="64" width="90" height="114" rx="9" fill="#2A1D16" stroke="#3B2B21"/>')
        alto = 19
        s.append(logo(marca, x + 45 - ancho_logo(marca, alto) / 2, 76, alto,
                      color="#FFFFFF" if marca == "elevenlabs" else None))
        s.append(f'<text x="{x+45}" y="118" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">{verbo}</text>')
        for j, l in enumerate(lineas):
            s.append(f'<text x="{x+45}" y="{132 + j*11}" font-size="8.2" fill="{SUAVE}" text-anchor="middle">{l}</text>')
        s.append(f'<text x="{x+45}" y="169" font-size="7" letter-spacing=".6" fill="#8F7F70" text-anchor="middle">{nombre.upper()}</text>')
        if i < 2:
            s.append(f'<path d="M{x+91.5} 113 l6 4 l-6 4z" fill="{ACENTO}"/>')

    # --- Bajada de Noah al servidor ---
    s.append(f'<path d="M581 192 C 581 222, 581 228, 581 252" stroke="{LINEA}" stroke-width="2" fill="none"/>'
             f'<path d="M581 258 l-4.5 -8 h9z" fill="{LINEA}"/>'
             f'<circle cx="581" cy="192" r="3.4" fill="#fff" stroke="{LINEA}" stroke-width="1.6"/>')
    s.append(f'<rect x="594" y="214" width="98" height="26" rx="7" fill="#fff" stroke="#E6DCCB"/>'
             f'<text x="643" y="225" font-size="7.6" fill="{HUMO}" text-anchor="middle">aviso al servidor:</text>'
             f'<text x="643" y="235" font-size="7.6" fill="{HUMO}" text-anchor="middle">platos y total</text>')

    # --- Fila 2, de derecha a izquierda: servidor, base de datos, cocina ---
    s.append(tarjeta(470, 258, 222, 112))
    s.append(logo("render", 484, 271, 22))
    s.append(texto(514, 287, "Servidor de Noah", []))
    s.append(f'<text x="484" y="312" font-size="8.6" fill="{HUMO}">Se sabe tu carta, calcula el total</text>'
             f'<text x="484" y="323.5" font-size="8.6" fill="{HUMO}">sin equivocarse y da el código</text>'
             f'<text x="484" y="335" font-size="8.6" fill="{HUMO}">del pedido.</text>')

    s.append(flecha(470, 424, 314, "pedido"))

    s.append(tarjeta(244, 258, 180, 112))
    s.append(logo("firebase", 258, 271, 22))
    s.append(texto(286, 287, "Guarda el pedido", []))
    s.append(f'<text x="258" y="312" font-size="8.6" fill="{HUMO}">Cada pedido y cada llamada,</text>'
             f'<text x="258" y="323.5" font-size="8.6" fill="{HUMO}">con su hora. No se pierde</text>'
             f'<text x="258" y="335" font-size="8.6" fill="{HUMO}">ningún papel.</text>')

    s.append(flecha(244, 198, 314, "aviso"))

    s.append(tarjeta(8, 258, 190, 112, fondo="#FCEFD9", borde=ACENTO, grosor=2))
    s.append(pastilla(8, 238, "LO QUE TÚ VES"))
    s.append(circulo_icono(36, 292, "i-pantalla"))
    s.append(f'<text x="60" y="288" font-size="11.2" font-weight="bold" fill="{NEGRO}">La comanda</text>'
             f'<text x="60" y="301" font-size="11.2" font-weight="bold" fill="{NEGRO}">en cocina</text>')
    s.append(f'<text x="20" y="331" font-size="8.6" fill="#5A4630">En el móvil o el ordenador: suena</text>'
             f'<text x="20" y="342.5" font-size="8.6" fill="#5A4630">y aparece sola, con el total</text>'
             f'<text x="20" y="354" font-size="8.6" fill="#5A4630">y el código. Nadie apunta nada.</text>')

    # --- Pie del diagrama ---
    s.append(f'<line x1="8" y1="398" x2="692" y2="398" stroke="#E6DCCB" stroke-dasharray="3 4"/>')
    s.append(f'<rect x="200" y="388" width="300" height="20" rx="10" fill="{NEGRO}"/>'
             f'<text x="350" y="402" font-size="8.6" font-weight="bold" fill="{CREMA}" text-anchor="middle">'
             f'Todo dentro de la misma llamada, sin que nadie toque nada</text>')
    s.append('</svg>')
    return "".join(s)


def piezas():
    """Leyenda bajo el diagrama: que hace cada pieza, con su logo."""
    filas = [
        ("twilio", 15, "Twilio", "El número de teléfono. Tu número de siempre puede desviarse a Noah."),
        ("vapi", 12, "Vapi", "Une todas las piezas en directo mientras dura la llamada."),
        ("deepgram", 17, "Deepgram", "Pasa a texto lo que dice el cliente, en castellano."),
        ("anthropic", 15, "Claude", "La inteligencia que entiende el pedido y decide qué decir."),
        ("elevenlabs", 16, "ElevenLabs", "La voz de Noah: natural, sin sonar a contestador."),
        ("render", 16, "Render", "El servidor donde vive Noah, encendido las 24 horas."),
        ("firebase", 17, "Firebase", "La base de datos de Google donde quedan pedidos y llamadas."),
        (None, 0, "Tu cocina", "La pantalla donde llegan las comandas, con aviso sonoro."),
    ]
    out = ['<div class="piezas">']
    for marca, alto, nombre, desc in filas:
        if marca:
            ancho = ancho_logo(marca, alto)
            ico = (f'<svg width="{ancho:.1f}" height="{alto}" viewBox="0 0 {ancho:.1f} {alto}">'
                   + logo(marca, 0, 0, alto) + '</svg>')
        else:
            ico = ('<svg width="16" height="16" color="#9A5B0C"><use href="#i-pantalla" width="16" height="16"/></svg>')
        out.append(f'<div class="pieza"><div class="pl">{ico}</div><b>{nombre}</b><p>{desc}</p></div>')
    out.append('</div>')
    return "".join(out)
