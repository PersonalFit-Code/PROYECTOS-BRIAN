# -*- coding: utf-8 -*-
"""Dibujos de problema / solucion: moviles, navegadores, el dolor de Jose y la linea
de tiempo de las automatizaciones. Paneles a 300 x 300; piezas a lo ancho, a 600."""
import math
from svgs import NEGRO, ROJO, HUMO, HUESO, LINEA, FONT, icono, n, marker

GRIS = "#a1a1aa"
GRIS_F = "#d4d4d8"
VERDE = "#2E7D4F"
WA = "#25d366"


# ------------------------------------------------------------------ piezas comunes
def movil(x, y, w=150, h=288, fondo="#fff"):
    """Marco de movil. Devuelve (svg, x0, y0, ancho, alto) de la pantalla."""
    s = (f'<rect x="{x+2}" y="{y+4}" width="{w}" height="{h}" rx="20" fill="{NEGRO}" opacity=".12"/>'
         f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="20" fill="{NEGRO}"/>'
         f'<rect x="{x+6}" y="{y+6}" width="{w-12}" height="{h-12}" rx="15" fill="{fondo}"/>'
         f'<rect x="{x+w/2-18}" y="{y+9}" width="36" height="6" rx="3" fill="{NEGRO}"/>')
    return s, x + 6, y + 18, w - 12, h - 24


def nota(x, y, tx, ty, texto, color=ROJO, ancla="start", simbolo="!"):
    """Llamada: circulo con simbolo en (x, y), linea al punto (tx, ty) y texto."""
    s = [f'<path d="M{n(x)} {n(y)} L{n(tx)} {n(ty)}" stroke="{color}" stroke-width="1.2" stroke-dasharray="2.5 2"/>',
         f'<circle cx="{n(tx)}" cy="{n(ty)}" r="2.6" fill="{color}"/>',
         f'<circle cx="{n(x)}" cy="{n(y)}" r="9" fill="{color}"/>']
    if simbolo == "ok":
        s.append(f'<path d="M{n(x-4)} {n(y)} l3 3 5-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>')
    else:
        s.append(f'<text x="{n(x)}" y="{n(y+3.6)}" font-size="10.5" font-weight="800" fill="#fff" text-anchor="middle">{simbolo}</text>')
    dx = 13 if ancla == "start" else -13
    lineas = texto.split("|")
    for i, l in enumerate(lineas):
        s.append(f'<text x="{n(x+dx)}" y="{n(y-2+i*10.5 - (len(lineas)-1)*4)}" font-size="8.4" font-weight="700" fill="{NEGRO}" text-anchor="{ancla}" stroke="#fff" stroke-width="3" paint-order="stroke">{l}</text>')
    return "".join(s)


def abrir(vb_w=300, vb_h=300, etiqueta=""):
    return [f'<svg class="dib" viewBox="-22 0 {vb_w+44} {vb_h}" role="img" aria-label="{etiqueta}"><g {FONT}>']


# ------------------------------------------------------------------ A · TIENDA
def tienda_hoy():
    s = abrir(etiqueta="Tu web hoy en el móvil")
    m, sx, sy, sw, sh = movil(75, 4)
    s.append(m)
    # cabecera con logo que es una captura
    s.append(f'<rect x="{sx}" y="{sy}" width="{sw}" height="26" fill="#fff"/>')
    s.append(f'<rect x="{sx+8}" y="{sy+6}" width="44" height="14" fill="{HUESO}" stroke="{GRIS}" stroke-dasharray="2 1.5"/>')
    s.append(f'<text x="{sx+30}" y="{sy+16}" font-size="5.6" fill="{HUMO}" text-anchor="middle">captura.png</text>')
    for i in range(3):
        s.append(f'<rect x="{sx+sw-24}" y="{sy+8+i*4.5}" width="14" height="2" fill="{NEGRO}"/>')
    # titular cortado
    s.append(f'<rect x="{sx}" y="{sy+26}" width="{sw}" height="62" fill="#1b1b1e"/>')
    s.append(f'<text x="{sx+8}" y="{sy+48}" font-size="15" font-weight="800" fill="#fff">EQUIPAMIENT</text>')
    s.append(f'<text x="{sx+8}" y="{sy+66}" font-size="15" font-weight="800" fill="#fff">O</text>')
    s.append(f'<text x="{sx+8}" y="{sy+80}" font-size="5.6" fill="{GRIS}">Una sola marca. Todo el equi…</text>')
    # lista larga
    filas = ["Agarres Cónicos para Polea | Alum…", "Almacenamiento Rotativo Barras…", "Asiento Hip Thrust para Rack | R…",
             "Banco Regulable Triple Ajuste EL…", "Barra Olímpica 50mm | 1,8m y…", "Cables de Polea para Máquinas…"]
    for i, f in enumerate(filas):
        yy = sy + 100 + i * 22
        s.append(f'<rect x="{sx+6}" y="{yy-10}" width="18" height="18" fill="{HUESO}"/>')
        s.append(f'<text x="{sx+28}" y="{yy-2}" font-size="5.6" fill="{NEGRO}">{f}</text>')
        precio = "desde 0,00 €" if i == 4 else ("" if i % 2 == 0 else "")
        if precio:
            s.append(f'<text x="{sx+28}" y="{yy+6}" font-size="6.2" font-weight="700" fill="{ROJO}">{precio}</text>')
        else:
            s.append(f'<rect x="{sx+28}" y="{yy+2}" width="40" height="3" fill="{GRIS_F}"/>')
    s.append(f'<text x="{sx+sw/2}" y="{sy+sh-6}" font-size="6" fill="{GRIS}" text-anchor="middle">… y 31 más, de la A a la Z</text>')
    s.append(nota(58, 62, sx + 8, sy + 13, "Logo que|es captura", ancla="end", simbolo="1"))
    s.append(nota(242, 74, sx + sw - 4, sy + 62, "Titular|cortado", simbolo="2"))
    s.append(nota(58, 168, sx + 26, sy + 140, "Lista sin|orden ni|filtros", ancla="end", simbolo="3"))
    s.append(nota(242, 210, sx + 78, sy + 204, "Precio|«0,00 €»", simbolo="4"))
    s.append('</g></svg>')
    return "".join(s)


def tienda_despues():
    s = abrir(etiqueta="Tu web nueva en el móvil")
    m, sx, sy, sw, sh = movil(75, 4)
    s.append(m)
    s.append(f'<rect x="{sx}" y="{sy}" width="{sw}" height="24" fill="{NEGRO}"/>')
    s.append(f'<path d="M{sx+44} {sy+16} l7-7 M{sx+46} {sy+9} h5 v5" stroke="{ROJO}" stroke-width="2" fill="none"/>')
    s.append(f'<text x="{sx+56}" y="{sy+16}" font-size="8" font-weight="800" fill="#fff">HUNGCEED</text>')
    # hero
    s.append(f'<rect x="{sx}" y="{sy+24}" width="{sw}" height="56" fill="#17171a"/>')
    s.append(f'<text x="{sx+8}" y="{sy+42}" font-size="10" font-weight="800" fill="#fff">EQUIPA TU GIMNASIO.</text>')
    s.append(f'<text x="{sx+8}" y="{sy+54}" font-size="10" font-weight="800" fill="{ROJO}">EN CASA O EN EL BOX.</text>')
    s.append(f'<rect x="{sx+8}" y="{sy+62}" width="58" height="12" rx="1" fill="{ROJO}"/>')
    s.append(f'<text x="{sx+37}" y="{sy+70.5}" font-size="5.4" font-weight="800" fill="#fff" text-anchor="middle">VER CATÁLOGO</text>')
    # producto estrella
    s.append(f'<rect x="{sx+8}" y="{sy+88}" width="{sw-16}" height="66" rx="3" fill="#fff" stroke="{LINEA}"/>')
    s.append(icono("i-rack", sx + 14, sy + 96, 44, NEGRO))
    s.append(f'<text x="{sx+64}" y="{sy+108}" font-size="6.6" font-weight="700" fill="{NEGRO}">Jaula de potencia</text>')
    s.append(f'<text x="{sx+64}" y="{sy+117}" font-size="6.6" font-weight="700" fill="{NEGRO}">con polea</text>')
    s.append(f'<text x="{sx+64}" y="{sy+134}" font-size="12" font-weight="800" fill="{NEGRO}">499 €</text>')
    s.append(f'<rect x="{sx+64}" y="{sy+139}" width="50" height="10" rx="1" fill="{NEGRO}"/>')
    s.append(f'<text x="{sx+89}" y="{sy+146}" font-size="5.2" font-weight="800" fill="#fff" text-anchor="middle">COMPRAR</text>')
    # categorias
    cats = ["i-rack", "i-maquina", "i-engranaje", "i-barra", "i-pesa", "i-polea"]
    for i, ic in enumerate(cats):
        cx = sx + 8 + (i % 3) * 42
        cy = sy + 162 + (i // 3) * 40
        s.append(f'<rect x="{cx}" y="{cy}" width="38" height="36" rx="2" fill="{HUESO}"/>')
        s.append(icono(ic, cx + 11, cy + 6, 16, NEGRO))
        s.append(f'<rect x="{cx+6}" y="{cy+27}" width="26" height="3" fill="{NEGRO}"/>')
    s.append(f'<circle cx="{sx+sw-14}" cy="{sy+sh-14}" r="10" fill="{ROJO}"/>' + icono("i-chat", sx + sw - 21, sy + sh - 21, 14, "#fff"))
    s.append(nota(58, 50, sx + 40, sy + 48, "Un solo|mensaje", ancla="end", simbolo="ok", color=VERDE))
    s.append(nota(242, 120, sx + sw - 10, sy + 120, "Producto|y precio", simbolo="ok", color=VERDE))
    s.append(nota(58, 210, sx + 10, sy + 190, "6 categorías|y filtros", ancla="end", simbolo="ok", color=VERDE))
    s.append(nota(242, 262, sx + sw - 14, sy + sh - 14, "WhatsApp|a mano", simbolo="ok", color=VERDE))
    s.append('</g></svg>')
    return "".join(s)


# ------------------------------------------------------------------ B · WHATSAPP
def whatsapp_hoy():
    s = abrir(etiqueta="Tu WhatsApp hoy")
    m, sx, sy, sw, sh = movil(75, 4)
    s.append(m)
    s.append(f'<text x="{sx+10}" y="{sy+4}" font-size="6.4" font-weight="700" fill="{NEGRO}">22:47</text>')
    s.append(f'<rect x="{sx}" y="{sy+10}" width="{sw}" height="24" fill="{HUESO}"/>')
    s.append(f'<text x="{sx+10}" y="{sy+26}" font-size="9" font-weight="800" fill="{NEGRO}">Chats</text>')
    chats = [("¿Hacéis envíos a Canarias?", 3), ("¿Dónde está mi pedido?", 2), ("¿El banco aguanta 300 kg?", 1),
             ("Precio de la jaula", 4), ("¿Horario del gym?", 1), ("¿Encaja en mi rack?", 2), ("¿Tenéis la barra de 2,20?", 1),
             ("¿Dónde está mi pedido?", 3)]
    for i, (t, k) in enumerate(chats):
        yy = sy + 40 + i * 27
        s.append(f'<circle cx="{sx+16}" cy="{yy+9}" r="9" fill="{GRIS_F}"/>')
        s.append(f'<rect x="{sx+30}" y="{yy+2}" width="40" height="4" fill="{NEGRO}"/>')
        s.append(f'<text x="{sx+30}" y="{yy+15}" font-size="5.6" fill="{HUMO}">{t}</text>')
        s.append(f'<circle cx="{sx+sw-12}" cy="{yy+11}" r="6" fill="{WA}"/>')
        s.append(f'<text x="{sx+sw-12}" y="{yy+13.4}" font-size="6.4" font-weight="800" fill="#fff" text-anchor="middle">{k}</text>')
    s.append(f'<rect x="{sx+sw-46}" y="{sy+12}" width="40" height="18" rx="9" fill="{ROJO}"/>')
    s.append(f'<text x="{sx+sw-26}" y="{sy+24}" font-size="8" font-weight="800" fill="#fff" text-anchor="middle">47</text>')
    s.append(nota(58, 30, sx + 10, sy + 2, "Las once|de la noche", ancla="end", simbolo="1"))
    s.append(nota(242, 30, sx + sw - 8, sy + 22, "47 sin|leer", simbolo="2"))
    s.append(nota(58, 150, sx + 24, sy + 133, "Las mismas|preguntas", ancla="end", simbolo="3"))
    s.append(nota(242, 230, sx + sw - 12, sy + 230, "El cliente|espera… o|se va", simbolo="4"))
    s.append('</g></svg>')
    return "".join(s)


def whatsapp_despues():
    s = abrir(etiqueta="Tu WhatsApp con el asistente")
    m, sx, sy, sw, sh = movil(75, 4, fondo="#ece5dd")
    s.append(m)
    s.append(f'<rect x="{sx}" y="{sy}" width="{sw}" height="26" fill="{NEGRO}"/>')
    s.append(f'<circle cx="{sx+14}" cy="{sy+13}" r="8" fill="{ROJO}"/>')
    s.append(f'<path d="M{sx+10} {sy+17} l7-7 M{sx+12} {sy+10} h5 v5" stroke="#fff" stroke-width="1.6" fill="none"/>')
    s.append(f'<text x="{sx+28}" y="{sy+12}" font-size="7" font-weight="800" fill="#fff">Hungceed</text>')
    s.append(f'<text x="{sx+28}" y="{sy+21}" font-size="5.4" fill="{WA}">en línea</text>')

    def burbuja(y, texto, mio):
        lineas = texto.split("|")
        h = 8 + len(lineas) * 8.5
        w = 104
        x = sx + sw - w - 6 if mio else sx + 6
        out = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" fill="{"#dcf8c6" if mio else "#fff"}"/>']
        for i, l in enumerate(lineas):
            out.append(f'<text x="{x+6}" y="{y+11+i*8.5}" font-size="6" fill="{NEGRO}">{l}</text>')
        return "".join(out), y + h + 6

    y = sy + 34
    for texto, mio in (("¿La elevación lateral|encaja en mi rack?", False),
                       ("Sí, va en los mismos|agujeros. 229,99 € y|envío en 48–72 h 👉 enlace", True),
                       ("¿Y mi pedido 1843?", False),
                       ("Salió ayer. Llega|mañana o pasado.", True),
                       ("Quiero equipar un box", False),
                       ("Te paso con Jose, que|te escribe hoy mismo.", True)):
        b, y = burbuja(y, texto, mio)
        s.append(b)
    s.append(nota(242, 70, sx + sw - 6, sy + 64, "Contesta|al momento", simbolo="ok", color=VERDE))
    s.append(nota(58, 160, sx + 6, sy + 150, "Mira el|pedido en|WooCommerce", ancla="end", simbolo="ok", color=VERDE))
    s.append(nota(242, 240, sx + sw - 6, sy + 232, "Lo grande,|a Jose", simbolo="ok", color=VERDE))
    s.append('</g></svg>')
    return "".join(s)


# ------------------------------------------------------------------ C · GIMNASIO
def gym_hoy():
    s = abrir(etiqueta="La página del gimnasio hoy")
    x, y, w, h = 20, 30, 260, 230
    s.append(f'<rect x="{x+2}" y="{y+4}" width="{w}" height="{h}" rx="7" fill="{NEGRO}" opacity=".1"/>')
    s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="7" fill="#fff" stroke="{NEGRO}" stroke-width="1.4"/>')
    s.append(f'<rect x="{x}" y="{y}" width="{w}" height="18" rx="7" fill="{HUESO}"/>')
    for i, c in enumerate(("#ff5f57", "#febc2e", "#28c840")):
        s.append(f'<circle cx="{x+10+i*9}" cy="{y+9}" r="3" fill="{c}"/>')
    s.append(f'<rect x="{x+44}" y="{y+4}" width="150" height="10" rx="5" fill="#fff"/>')
    s.append(f'<text x="{x+52}" y="{y+11.5}" font-size="5.8" fill="{HUMO}">hungceed.es/gym</text>')
    s.append(f'<text x="{x+12}" y="{y+34}" font-size="6.2" fill="{HUMO}">Hungceed GYM es tu gimnasio en La Pobla Llarga…</text>')
    # recuadro incrustado con su scroll
    ix, iy, iw, ih = x + 12, y + 42, w - 24, h - 54
    s.append(f'<rect x="{ix}" y="{iy}" width="{iw}" height="{ih}" fill="{HUESO}" stroke="{GRIS}" stroke-dasharray="3 2"/>')
    s.append(f'<rect x="{ix+iw-8}" y="{iy+2}" width="5" height="{ih-4}" rx="2.5" fill="{GRIS_F}"/>')
    s.append(f'<rect x="{ix+iw-8}" y="{iy+6}" width="5" height="34" rx="2.5" fill="{GRIS}"/>')
    tabs = ["ENTRENADOR PERSONAL", "MUSCULACIÓ", "PASES/BONOS", "E. FUNCIONAL"]
    for i, t in enumerate(tabs):
        s.append(f'<text x="{ix+6+i*52}" y="{iy+12}" font-size="5" font-weight="700" fill="{NEGRO}">{t}</text>')
    filas = [("E. Personal (1:1) - 4 días", "total", "€ 95.00"), ("Musculación gym (1 mes)", "monthly", "€ 40.00"),
             ("FUNCIONAL (1 Mes /4 sesions)", "monthly", "€ 30.00"), ("Semi-Personal (1 Mes /8 sesions)", "total", "€ 64.00")]
    for i, (a, b, c) in enumerate(filas):
        yy = iy + 26 + i * 22
        s.append(f'<text x="{ix+6}" y="{yy}" font-size="5.8" fill="{NEGRO}">{a}</text>')
        s.append(f'<text x="{ix+6}" y="{yy+8}" font-size="5" fill="{HUMO}">{b}</text>')
        s.append(f'<text x="{ix+iw-14}" y="{yy+4}" font-size="6" font-weight="700" fill="{NEGRO}" text-anchor="end">{c}</text>')
    s.append(f'<text x="{ix+iw/2}" y="{iy+ih-8}" font-size="6" fill="{GRIS}" text-anchor="middle">Loading, please wait...</text>')
    s.append(nota(32, 18, ix + 40, iy + 10, "Tres idiomas", simbolo="1"))
    s.append(nota(268, 18, ix + iw - 5, iy + 24, "Scroll dentro del scroll", ancla="end", simbolo="2"))
    s.append(nota(32, 286, ix + iw / 2 - 30, iy + ih - 10, "Se queda cargando en el móvil", simbolo="3"))
    s.append('</g></svg>')
    return "".join(s)


def gym_despues():
    s = abrir(etiqueta="La página del gimnasio nueva")
    m, sx, sy, sw, sh = movil(75, 4)
    s.append(m)
    s.append(f'<rect x="{sx}" y="{sy}" width="{sw}" height="62" fill="{NEGRO}"/>')
    s.append(f'<text x="{sx+8}" y="{sy+14}" font-size="5" font-weight="700" fill="{ROJO}" letter-spacing="1">LA POBLA LLARGA</text>')
    s.append(f'<text x="{sx+8}" y="{sy+32}" font-size="14" font-weight="800" fill="#fff">HUNGCEED</text>')
    s.append(f'<text x="{sx+8}" y="{sy+48}" font-size="14" font-weight="800" fill="{ROJO}">GYM</text>')
    tarifas = [("MUSCULACIÓN", "40 €", "al mes"), ("FUNCIONAL", "30 €", "al mes"), ("ENTRENADOR", "30 €", "la sesión"), ("PASE 1 DÍA", "8 €", "un día")]
    for i, (g, p, u) in enumerate(tarifas):
        cx = sx + 8 + (i % 2) * 64
        cy = sy + 72 + (i // 2) * 84
        s.append(f'<rect x="{cx}" y="{cy}" width="58" height="76" rx="3" fill="#17171a"/>')
        s.append(f'<text x="{cx+6}" y="{cy+13}" font-size="4.8" font-weight="700" fill="{GRIS}">{g}</text>')
        s.append(f'<text x="{cx+6}" y="{cy+34}" font-size="15" font-weight="800" fill="#fff">{p}</text>')
        s.append(f'<text x="{cx+6}" y="{cy+44}" font-size="5.2" fill="{GRIS}">{u}</text>')
        s.append(f'<rect x="{cx+6}" y="{cy+55}" width="46" height="13" rx="1.5" fill="{ROJO}"/>')
        s.append(f'<text x="{cx+29}" y="{cy+64}" font-size="5.2" font-weight="800" fill="#fff" text-anchor="middle">APÚNTATE</text>')
    s.append(f'<rect x="{sx+8}" y="{sy+244}" width="{sw-16}" height="12" rx="1.5" fill="{HUESO}"/>')
    s.append(f'<text x="{sx+sw/2}" y="{sy+252.5}" font-size="5.4" font-weight="700" fill="{NEGRO}" text-anchor="middle">Horario · Cómo llegar · Fotos</text>')
    s.append(nota(58, 40, sx + 8, sy + 30, "Su propia|página", ancla="end", simbolo="ok", color=VERDE))
    s.append(nota(242, 110, sx + sw - 8, sy + 100, "Precio a|la vista", simbolo="ok", color=VERDE))
    s.append(nota(58, 210, sx + 14, sy + 211, "Apúntate|directo a|Virtuagym", ancla="end", simbolo="ok", color=VERDE))
    s.append('</g></svg>')
    return "".join(s)


# ------------------------------------------------------------------ D · AUTOMATIZACIONES
def auto_hoy():
    s = abrir(300, 300, "Lo que hoy no se hace")
    filas = [("i-estrella", "0 reseñas", "Nadie le pide la opinión", "a quien está contento"),
             ("i-mano", "Socio nuevo", "Nadie le da la bienvenida", "el primer día"),
             ("i-reloj", "20 días sin venir", "Nadie se da cuenta", "hasta que se da de baja"),
             ("i-bolsa", "Carrito a medias", "Se queda ahí", "para siempre")]
    for i, (ic, t, l1, l2) in enumerate(filas):
        y = 14 + i * 70
        s.append(f'<rect x="10" y="{y}" width="280" height="58" rx="6" fill="#fff" stroke="{GRIS_F}"/>')
        s.append(f'<circle cx="42" cy="{y+29}" r="20" fill="{HUESO}" stroke="{GRIS}"/>')
        s.append(icono(ic, 31, y + 18, 22, GRIS))
        s.append(f'<text x="74" y="{y+24}" font-size="11" font-weight="800" fill="{NEGRO}">{t}</text>')
        s.append(f'<text x="74" y="{y+38}" font-size="8.2" fill="{HUMO}">{l1}</text>')
        s.append(f'<text x="74" y="{y+49}" font-size="8.2" fill="{HUMO}">{l2}</text>')
        s.append(f'<circle cx="268" cy="{y+29}" r="10" fill="{GRIS}"/>')
        s.append(f'<path d="M{264} {y+25} l8 8 M{272} {y+25} l-8 8" stroke="#fff" stroke-width="2" stroke-linecap="round"/>')
    s.append('</g></svg>')
    return "".join(s)


def auto_despues():
    """Linea de tiempo: disparador -> espera -> WhatsApp -> resultado, en cuatro carriles."""
    s = [f'<svg class="dib" viewBox="0 0 300 300" role="img" aria-label="Lo que va solo"><defs>{marker("fa", ROJO)}</defs><g {FONT}>']
    filas = [("i-caja", "Pedido entregado", "a los 3 días", "Pide reseña", "i-estrella", ""),
             ("i-mano", "Alta en Virtuagym", "al momento", "Bienvenida", "i-chat", ""),
             ("i-reloj", "14 días sin venir", "ese mismo día", "¿Te vemos?", "i-chat", ""),
             ("i-bolsa", "Carrito a medias", "al día siguiente", "Recordatorio", "i-chat", "")]
    for i, (ic, disp, espera, accion, ic2, res) in enumerate(filas):
        y = 14 + i * 70
        s.append(f'<rect x="4" y="{y}" width="292" height="58" rx="6" fill="#fff" stroke="{NEGRO}" stroke-width="1.1"/>')
        s.append(f'<circle cx="28" cy="{y+29}" r="17" fill="#fdecec"/>')
        s.append(icono(ic, 18, y + 19, 20, ROJO))
        s.append(f'<text x="52" y="{y+24}" font-size="8.6" font-weight="800" fill="{NEGRO}">{disp}</text>')
        s.append(f'<text x="52" y="{y+36}" font-size="7.4" fill="{HUMO}">{espera}</text>')
        s.append(f'<path d="M132 {y+29} H150" stroke="{ROJO}" stroke-width="1.6" marker-end="url(#fa)"/>')
        s.append(f'<rect x="154" y="{y+15}" width="78" height="28" rx="14" fill="{WA}"/>')
        s.append(icono("i-chat", 160, y + 21, 15, "#fff"))
        s.append(f'<text x="178" y="{y+32}" font-size="6.6" font-weight="700" fill="#fff">{accion}</text>')
        s.append(f'<path d="M234 {y+29} H246" stroke="{ROJO}" stroke-width="1.6" marker-end="url(#fa)"/>')
        if ic2 == "i-estrella":
            s.append(f'<text x="272" y="{y+33}" font-size="10" fill="{ROJO}" text-anchor="middle">★★★</text>')
        else:
            s.append(f'<circle cx="270" cy="{y+29}" r="14" fill="{ROJO}"/>')
            s.append(f'<path d="M263 {y+29} l5 5 9-10" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>')
    s.append('</g></svg>')
    return "".join(s)


# ------------------------------------------------------------------ EL DOLOR (hoja 2)
def dolor():
    cx, cy = 300, 166
    sats = [("i-chat", "30 mensajes al día", "lo mismo, una y otra vez", 0),
            ("i-caja", "«¿Y mi pedido?»", "lo buscas tú, a mano", 60),
            ("i-edificio", "Un box pide precio", "entre cien chats", 120),
            ("i-web", "Se pierden en la web", "y compran en otra", 180),
            ("i-gym", "Socios del gym", "altas y horarios", 240),
            ("i-estrella", "0 reseñas", "nadie las pide", 300)]
    rx, ry = 182, 108
    s = [f'<svg class="f" viewBox="0 0 600 336" role="img" aria-label="Todo pasa por ti"><g {FONT}>']
    pos = []
    for (_i, _t, _s, a) in sats:
        t = math.radians(a)
        pos.append((cx + rx * math.sin(t), cy - ry * math.cos(t)))
    for (x, y) in pos:
        mx, my = (x + cx) / 2, (y + cy) / 2
        s.append(f'<path d="M{n(x)} {n(y)}L{cx} {cy}" stroke="{ROJO}" stroke-width="1.4" stroke-dasharray="4 3" opacity=".7"/>')
        s.append(f'<circle cx="{n(mx)}" cy="{n(my)}" r="8" fill="#fff" stroke="{ROJO}" stroke-width="1.3"/>')
        s.append(f'<text x="{n(mx)}" y="{n(my+3.4)}" font-size="9" font-weight="800" fill="{ROJO}" text-anchor="middle">!</text>')
    for (ic, t, sub, a), (x, y) in zip(sats, pos):
        s.append(f'<circle cx="{n(x)}" cy="{n(y)}" r="27" fill="#fff" stroke="{NEGRO}" stroke-width="1.6"/>')
        s.append(icono(ic, x - 12, y - 12, 24, NEGRO))
        if a in (0, 180):
            yt = y - 40 if a == 0 else y + 44
            s.append(f'<text x="{n(x)}" y="{n(yt)}" font-size="10.5" font-weight="800" fill="{NEGRO}" text-anchor="middle">{t}</text>')
            s.append(f'<text x="{n(x)}" y="{n(yt+12)}" font-size="8.4" fill="{HUMO}" text-anchor="middle">{sub}</text>')
        else:
            izq = a > 180
            xt = x - 34 if izq else x + 34
            anc = "end" if izq else "start"
            s.append(f'<text x="{n(xt)}" y="{n(y-2)}" font-size="10.5" font-weight="800" fill="{NEGRO}" text-anchor="{anc}">{t}</text>')
            s.append(f'<text x="{n(xt)}" y="{n(y+10)}" font-size="8.4" fill="{HUMO}" text-anchor="{anc}">{sub}</text>')
    for r, o in ((60, .14), (51, .28)):
        s.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{ROJO}" stroke-width="2.4" opacity="{o}"/>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="42" fill="{ROJO}"/>')
    s.append(icono("i-persona", cx - 16, cy - 22, 32, "#fff"))
    s.append(f'<text x="{cx}" y="{cy+24}" font-size="10" font-weight="800" fill="#fff" text-anchor="middle">JOSE</text>')
    s.append('</g></svg>')
    return "".join(s)


# ------------------------------------------------------------------ LO QUE VI (hoja 3)
def web_anotada():
    s = [f'<svg class="f" viewBox="0 0 600 270" role="img" aria-label="Tu web hoy, anotada"><g {FONT}>']
    x, y, w, h = 112, 8, 376, 254
    s.append(f'<rect x="{x+3}" y="{y+5}" width="{w}" height="{h}" rx="8" fill="{NEGRO}" opacity=".1"/>')
    s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="#fff" stroke="{NEGRO}" stroke-width="1.4"/>')
    s.append(f'<rect x="{x}" y="{y}" width="{w}" height="20" rx="8" fill="{HUESO}"/>')
    for i, c in enumerate(("#ff5f57", "#febc2e", "#28c840")):
        s.append(f'<circle cx="{x+12+i*10}" cy="{y+10}" r="3.4" fill="{c}"/>')
    s.append(f'<rect x="{x+56}" y="{y+4}" width="180" height="12" rx="6" fill="#fff"/>')
    s.append(f'<text x="{x+66}" y="{y+13}" font-size="7" fill="{HUMO}">hungceed.es</text>')
    # cabecera
    s.append(f'<rect x="{x+14}" y="{y+30}" width="56" height="20" fill="{HUESO}" stroke="{GRIS}" stroke-dasharray="2 1.5"/>')
    s.append(f'<text x="{x+42}" y="{y+43}" font-size="6.4" fill="{HUMO}" text-anchor="middle">logo.png</text>')
    menu = ["ACCESORIOS", "MÁQUINAS", "PESAS", "PRODUCTOS", "GYM"]
    mx = x + 92
    for m in menu:
        s.append(f'<text x="{mx}" y="{y+43}" font-size="6.4" font-weight="700" fill="{NEGRO}">{m}</text>')
        mx += len(m) * 4.2 + 10
    s.append(f'<circle cx="{x+w-36}" cy="{y+40}" r="6" fill="none" stroke="{NEGRO}" stroke-width="1.3"/>')
    s.append(f'<circle cx="{x+w-18}" cy="{y+40}" r="6" fill="none" stroke="{NEGRO}" stroke-width="1.3"/>')
    # tres titulares compitiendo
    s.append(f'<rect x="{x+14}" y="{y+60}" width="{w-28}" height="70" fill="#1b1b1e"/>')
    s.append(f'<text x="{x+26}" y="{y+82}" font-size="10.5" font-weight="800" fill="#fff">EQUIPA TU GIMNASIO. EN CASA O EN EL BOX.</text>')
    s.append(f'<text x="{x+26}" y="{y+100}" font-size="9.5" font-weight="800" fill="{GRIS}">UNA SOLA MARCA. TODO EL EQUIPAMIENTO…</text>')
    s.append(f'<text x="{x+26}" y="{y+118}" font-size="8" font-weight="700" fill="{GRIS}">NUESTROS PRODUCTOS MÁS ELEGIDOS</text>')
    # productos sin precio
    for i in range(4):
        px = x + 14 + i * 88
        s.append(f'<rect x="{px}" y="{y+140}" width="80" height="62" fill="{HUESO}"/>')
        s.append(f'<rect x="{px+6}" y="{y+208}" width="70" height="4" fill="{NEGRO}"/>')
        s.append(f'<rect x="{px+6}" y="{y+216}" width="56" height="4" fill="{NEGRO}"/>')
        s.append(f'<rect x="{px+6}" y="{y+224}" width="64" height="4" fill="{NEGRO}"/>')
        txt = ["", "499,00 €", "0,00 €-274,99", ""][i]
        if txt:
            s.append(f'<text x="{px+6}" y="{y+240}" font-size="7" font-weight="800" fill="{ROJO if "0,00 €-" in txt else NEGRO}">{txt}</text>')
        else:
            s.append(f'<text x="{px+6}" y="{y+240}" font-size="6.4" fill="{GRIS}">sin precio</text>')
    # llamadas
    s.append(nota(96, 46, x + 14, y + 40, "Logo que es|una captura", ancla="end", simbolo="1"))
    s.append(nota(504, 70, x + 240, y + 44, "Menú que no|es tu catálogo", simbolo="2"))
    s.append(nota(96, 110, x + 14, y + 100, "Tres titulares|compitiendo", ancla="end", simbolo="3"))
    s.append(nota(504, 30, x + w - 18, y + 40, "«Mi cuenta»|lleva a otra web", simbolo="4"))
    s.append(nota(96, 218, x + 20, y + 218, "Nombres|kilométricos", ancla="end", simbolo="5"))
    s.append(nota(504, 236, x + 200, y + 238, "«0,00 €» y|sin precio", simbolo="6"))
    s.append('</g></svg>')
    return "".join(s)
