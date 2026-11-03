# -*- coding: utf-8 -*-
"""La escena de la portada: la jaula de potencia con polea de Hungceed (499 €, producto real
de su tienda) dibujada en perspectiva sobre su tarima, y encima lo que promete la propuesta:
un pedido que entra solo (avisos apilados) y un WhatsApp que se contesta solo.

Proyeccion oblicua: el eje de profundidad z va hacia arriba a la derecha, asi que de cada caja
se ven la cara frontal, la de la derecha y la de arriba. Las cajas se pintan de atras adelante.
"""
import math

FONT = 'font-family="Poppins, Arial, sans-serif"'
ROJO = "#dc1f26"; ROJO_O = "#a8161c"; ROJO_C = "#ef4a50"

# Origen y proyeccion
OX, OY = 92, 300
KX, KY = 0.55, 0.32


def p(x, y, z):
    return (OX + x + z * KX, OY - y - z * KY)


def pts(lista):
    return " ".join(f"{a:.1f},{b:.1f}" for a, b in lista)


def caja(x0, y0, z0, x1, y1, z1, frente, lado, arriba, borde="rgba(10,10,11,.28)"):
    """Caja alineada a los ejes: cara frontal (z0), lateral derecha (x1) y superior (y1)."""
    f = [p(x0, y0, z0), p(x1, y0, z0), p(x1, y1, z0), p(x0, y1, z0)]
    l = [p(x1, y0, z0), p(x1, y0, z1), p(x1, y1, z1), p(x1, y1, z0)]
    t = [p(x0, y1, z0), p(x1, y1, z0), p(x1, y1, z1), p(x0, y1, z1)]
    a = f' stroke="{borde}" stroke-width=".6" stroke-linejoin="round"'
    return (f'<polygon points="{pts(l)}" fill="{lado}"{a}/>'
            f'<polygon points="{pts(t)}" fill="{arriba}"{a}/>'
            f'<polygon points="{pts(f)}" fill="{frente}"{a}/>')


def disco(x, y, z, r, color, n=48):
    """Circulo en el plano y-z (un disco de la barra visto de lado)."""
    q = []
    for i in range(n):
        t = 2 * math.pi * i / n
        q.append(p(x, y + r * math.cos(t), z + r * math.sin(t)))
    return f'<polygon points="{pts(q)}" fill="{color}"/>'


def anillo(x, y, z, r, color, ancho):
    q = []
    for i in range(49):
        t = 2 * math.pi * i / 48
        q.append(p(x, y + r * math.cos(t), z + r * math.sin(t)))
    d = "M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in q)
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{ancho}"/>'


def placa(xa, xb, y, z, r, cara, canto):
    """Un disco de xa a xb (xa < xb). Siempre se ve la cara que mira a +x."""
    s = [disco(x, y, z, r, canto) for x in range(int(xa), int(xb))]
    s.append(disco(xb, y, z, r, cara))
    s.append(anillo(xb, y, z, r * .74, "rgba(255,255,255,.2)", .7))
    s.append(disco(xb, y, z, r * .2, "#1c1c20"))
    return "".join(s)


def escena():
    W, D, H = 168, 112, 226   # ancho, fondo y alto de la jaula
    T = 9                     # grosor de los postes
    BLANCO, LADO, TECHO = "#f4f4f5", "#b9b9c0", "#ffffff"

    s = [f'<svg class="p-escena" viewBox="0 0 430 360" role="img" '
         f'aria-label="Jaula de potencia con polea de Hungceed, con un pedido y un WhatsApp entrando solos">']
    s.append('<defs>'
             f'<radialGradient id="pg-halo" cx="58%" cy="46%" r="52%"><stop offset="0" stop-color="{ROJO}" stop-opacity=".34"/>'
             f'<stop offset=".55" stop-color="{ROJO}" stop-opacity=".08"/><stop offset="1" stop-color="{ROJO}" stop-opacity="0"/></radialGradient>'
             '<radialGradient id="pg-sombra" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000" stop-opacity=".75"/>'
             '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>'
             '<linearGradient id="pg-tarima" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#232327"/><stop offset="1" stop-color="#151518"/></linearGradient>'
             '<pattern id="pg-puntos" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".75" fill="#fff" fill-opacity=".09"/></pattern>'
             '<filter id="pg-sombra-tarjeta" x="-20%" y="-30%" width="140%" height="190%">'
             '<feDropShadow dx="0" dy="1" stdDeviation=".6" flood-color="#000" flood-opacity=".35"/>'
             '<feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#000" flood-opacity=".45"/></filter>'
             '</defs>')
    # Fondo: rejilla de puntos y halo rojo detras de la jaula
    s.append('<rect width="430" height="360" fill="url(#pg-puntos)"/>')
    s.append('<ellipse cx="236" cy="168" rx="210" ry="170" fill="url(#pg-halo)"/>')

    # Tarima (plataforma de goma) con su canto
    x0, x1, z0, z1 = -52, W + 52, -74, D + 18
    top = [p(x0, 0, z0), p(x1, 0, z0), p(x1, 0, z1), p(x0, 0, z1)]
    canto_f = [p(x0, 0, z0), p(x1, 0, z0), p(x1, -7, z0), p(x0, -7, z0)]
    canto_l = [p(x1, 0, z0), p(x1, 0, z1), p(x1, -7, z1), p(x1, -7, z0)]
    s.append(f'<ellipse cx="{p(W/2, -10, D/2)[0]:.1f}" cy="{p(W/2, -10, D/2)[1]+6:.1f}" rx="250" ry="34" fill="url(#pg-sombra)"/>')
    s.append(f'<polygon points="{pts(canto_l)}" fill="#0f0f11"/><polygon points="{pts(canto_f)}" fill="#111114"/>')
    s.append(f'<polygon points="{pts(top)}" fill="url(#pg-tarima)" stroke="rgba(255,255,255,.08)" stroke-width=".8"/>')
    # juntas de la goma
    for zz in range(int(z0) + 46, int(z1), 46):
        a, b = p(x0, 0, zz), p(x1, 0, zz)
        s.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="rgba(255,255,255,.06)" stroke-width=".8"/>')
    for xx in (x0 + 90, x1 - 90):
        a, b = p(xx, 0, z0), p(xx, 0, z1)
        s.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="rgba(255,255,255,.06)" stroke-width=".8"/>')
    # sombra de contacto de la jaula
    c = p(W / 2, 0, D / 2)
    s.append(f'<ellipse cx="{c[0]:.1f}" cy="{c[1]:.1f}" rx="150" ry="24" fill="url(#pg-sombra)" opacity=".9"/>')

    # ---- de atras adelante
    # postes traseros
    for xx in (0, W - T):
        s.append(caja(xx, 0, D - T, xx + T, H, D, BLANCO, LADO, TECHO))
    # travesano trasero arriba
    s.append(caja(0, H - 9, D - T, W, H, D, BLANCO, LADO, TECHO))

    # columna de pesas al fondo, en el centro: guias, placas y cable
    cx = W / 2
    for gx in (cx - 14, cx + 14):
        a, b = p(gx, 6, D - 26), p(gx, H - 12, D - 26)
        s.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="#8b8b93" stroke-width="1.6"/>')
    for i in range(9):
        y = 4 + i * 8.4
        s.append(caja(cx - 19, y, D - 32, cx + 19, y + 7, D - 20,
                      "#2b2b30" if i % 2 else "#323238", "#1a1a1e", "#45454c", "rgba(0,0,0,.4)"))
    # placa superior y pasador rojo
    s.append(caja(cx - 19, 80, D - 32, cx + 19, 84, D - 20, "#5b5b63", "#3a3a40", "#77777f", "rgba(0,0,0,.4)"))
    pin = p(cx + 19, 42, D - 32)
    s.append(f'<rect x="{pin[0]:.1f}" y="{pin[1]-2:.1f}" width="9" height="4" rx="2" fill="{ROJO}"/>')
    # polea de arriba atras, cable hasta la polea de delante y maneral colgando
    pa = p(cx, H - 20, D - 26)
    pf = p(cx, H - 20, 6)
    arr = p(cx, 84, D - 26)
    s.append(f'<path d="M{arr[0]:.1f},{arr[1]:.1f} L{pa[0]:.1f},{pa[1]+6:.1f}" stroke="#d4d4d8" stroke-width="1.2"/>')

    # postes laterales arriba (largueros de la izquierda y derecha)
    s.append(caja(0, H - 9, 0, T, H, D, BLANCO, LADO, TECHO))

    s.append(f'<path d="M{pa[0]:.1f},{pa[1]-6:.1f} L{pf[0]:.1f},{pf[1]-6:.1f}" stroke="#d4d4d8" stroke-width="1.2"/>')
    s.append(f'<circle cx="{pa[0]:.1f}" cy="{pa[1]:.1f}" r="6.5" fill="#26262b" stroke="#a1a1aa" stroke-width="1.2"/>')

    s.append(caja(W - T, H - 9, 0, W, H, D, BLANCO, LADO, TECHO))

    # postes delanteros con sus agujeros
    for xx in (0, W - T):
        s.append(caja(xx, 0, 0, xx + T, H, T, BLANCO, LADO, TECHO))
        for k, y in enumerate(range(18, H - 16, 11)):
            q = p(xx + T / 2, y, 0)
            s.append(f'<circle cx="{q[0]:.1f}" cy="{q[1]:.1f}" r="1.45" fill="#0a0a0b" fill-opacity=".7"/>')
    # travesano delantero de arriba y barra de dominadas que sobresale
    s.append(caja(0, H - 9, 0, W, H, T, BLANCO, LADO, TECHO))
    s.append(caja(-26, H - 4, -10, W + 26, H + 2, -4, "#d4d4d8", "#9b9ba3", "#f4f4f5"))
    for xx in (-24, W + 18):
        s.append(caja(xx, H - 4, -10, xx + 6, H + 2, -4, "#232327", "#141417", "#3a3a40", "rgba(0,0,0,.4)"))  # puños

    # polea delantera, cable bajando y maneral
    s.append(f'<circle cx="{pf[0]:.1f}" cy="{pf[1]:.1f}" r="6.5" fill="#26262b" stroke="#a1a1aa" stroke-width="1.2"/>')
    man = p(cx, 112, 6)
    s.append(f'<path d="M{pf[0]:.1f},{pf[1]+6:.1f} L{man[0]:.1f},{man[1]:.1f}" stroke="#d4d4d8" stroke-width="1.2"/>')
    s.append(f'<path d="M{man[0]-13:.1f},{man[1]+9:.1f} L{man[0]:.1f},{man[1]} L{man[0]+13:.1f},{man[1]+9:.1f}" fill="none" stroke="#d4d4d8" stroke-width="1.1"/>')
    s.append(f'<rect x="{man[0]-17:.1f}" y="{man[1]+8:.1f}" width="34" height="5" rx="2.5" fill="{ROJO}"/>')

    # brazos de seguridad (rojos) y soportes J
    for xx in (0, W - T):
        s.append(caja(xx + 1, 70, -62, xx + T - 1, 77, 0, ROJO, ROJO_O, ROJO_C, "rgba(0,0,0,.25)"))
        s.append(caja(xx - 1, 142, -13, xx + T + 1, 152, 0, ROJO, ROJO_O, ROJO_C, "rgba(0,0,0,.25)"))

    # barra olimpica con discos (bumper) apoyada en los J
    zb, yb = -7, 156
    a, b = p(-62, yb, zb), p(W + 62, yb, zb)
    # izquierda: de fuera adentro (el de dentro tapa al de fuera)
    s.append(placa(-50, -41, yb, zb, 22, "#26262b", "#0c0c0e"))
    s.append(placa(-40, -30, yb, zb, 32, ROJO, ROJO_O))
    s.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="#a1a1aa" stroke-width="5" stroke-linecap="round"/>')
    s.append(f'<line x1="{a[0]:.1f}" y1="{a[1]-.9:.1f}" x2="{b[0]:.1f}" y2="{b[1]-.9:.1f}" stroke="#ededf0" stroke-width="1.3" stroke-linecap="round"/>')
    for xx in (-24, W + 22):
        q = p(xx, yb, zb)
        s.append(f'<rect x="{q[0]-1.5:.1f}" y="{q[1]-4.5:.1f}" width="3" height="9" rx="1" fill="#d4d4d8"/>')
    # derecha: de dentro afuera
    s.append(placa(W + 30, W + 40, yb, zb, 32, ROJO, ROJO_O))
    s.append(placa(W + 41, W + 50, yb, zb, 22, "#26262b", "#0c0c0e"))

    s.append(f'<g {FONT}>')
    # ---- Aviso de pedido, apilado como las notificaciones del sistema
    tx, ty, tw, th = 6, 262, 212, 50
    # dos avisos anteriores asomando por detras, mas pequenos y apagados
    for dy, esc, color in ((-14, .88, "#3a3a40"), (-7, .94, "#6b6b72")):
        w = tw * esc
        s.append(f'<rect x="{tx + (tw - w)/2:.1f}" y="{ty + dy:.1f}" width="{w:.1f}" height="{th}" rx="11" '
                 f'fill="{color}" stroke="rgba(255,255,255,.12)" stroke-width=".6" filter="url(#pg-sombra-tarjeta)"/>')
    s.append(f'<g filter="url(#pg-sombra-tarjeta)"><rect x="{tx}" y="{ty}" width="{tw}" height="{th}" rx="11" fill="#fff"/></g>')
    s.append(f'<rect x="{tx+.5}" y="{ty+.5}" width="{tw-1}" height="{th-1}" rx="10.5" fill="none" stroke="#e4e4e7"/>')
    s.append(f'<rect x="{tx+11}" y="{ty+11}" width="28" height="28" rx="8" fill="{ROJO}"/>')
    # carrito
    s.append(f'<g transform="translate({tx+17},{ty+17})" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'
             '<path d="M1 2h2.6l2 9.2h8.2l1.8-6.6H4.6"/><circle cx="7" cy="14.4" r="1.2"/><circle cx="13.2" cy="14.4" r="1.2"/></g>')
    s.append(f'<text x="{tx+48}" y="{ty+22}" font-size="9.6" font-weight="700" fill="#0a0a0b">Pedido nuevo</text>')
    s.append(f'<text x="{tx+tw-12}" y="{ty+22}" font-size="7.6" fill="#8a8a92" text-anchor="end">ahora</text>')
    s.append(f'<text x="{tx+48}" y="{ty+36}" font-size="8.2" fill="#5c5d63">Jaula de potencia con polea · <tspan font-weight="700" fill="#0a0a0b">499 €</tspan></text>')

    # ---- WhatsApp: pregunta del cliente y respuesta del asistente
    bx, by = 250, 8
    s.append(f'<g filter="url(#pg-sombra-tarjeta)"><rect x="{bx}" y="{by}" width="160" height="36" rx="10" fill="#fff"/></g>')
    s.append(f'<text x="{bx+11}" y="{by+15}" font-size="8.4" fill="#0a0a0b">¿Qué precio tiene la jaula</text>')
    s.append(f'<text x="{bx+11}" y="{by+27}" font-size="8.4" fill="#0a0a0b">con polea?</text>')
    s.append(f'<text x="{bx+151}" y="{by+29}" font-size="6.4" fill="#8a8a92" text-anchor="end">10:42</text>')
    ry = by + 44
    s.append(f'<g filter="url(#pg-sombra-tarjeta)"><rect x="{bx+18}" y="{ry}" width="150" height="56" rx="10" fill="#e7f7df"/></g>')
    s.append(f'<text x="{bx+29}" y="{ry+13}" font-size="6.2" font-weight="700" fill="{ROJO}" letter-spacing=".8">ASISTENTE HUNGCEED</text>')
    s.append(f'<text x="{bx+29}" y="{ry+26}" font-size="8.4" fill="#0a0a0b"><tspan font-weight="700">499 €.</tspan> Te paso la ficha</text>')
    s.append(f'<text x="{bx+29}" y="{ry+38}" font-size="8.4" fill="#0a0a0b">para pedirla ahí mismo.</text>')
    s.append(f'<text x="{bx+150}" y="{ry+49}" font-size="6.4" fill="#5e8f62" text-anchor="end">10:42</text>')
    # doble check
    s.append(f'<path d="M{bx+153},{ry+46} l2,2 l4,-4.5 M{bx+157},{ry+46} l2,2 l4,-4.5" fill="none" stroke="#3b9be0" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>')
    s.append('</g>')

    s.append('</svg>')
    return "".join(s)
