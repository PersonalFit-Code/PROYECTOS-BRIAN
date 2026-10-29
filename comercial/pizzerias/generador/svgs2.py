# -*- coding: utf-8 -*-
# Version grande de los dibujos: mas altos y con letra mas legible.
import math
from svgs import *   # pt, n, icono, constantes, SPRITE

def rot(x, y, titulo, l1, l2, ancla="start", ct=NEGRO, cs=HUMO, tt=11.5, ts=9.4):
    return (f'<text x="{n(x)}" y="{n(y)}" font-size="{tt}" font-weight="bold" fill="{ct}" text-anchor="{ancla}">{titulo}</text>'
            f'<text x="{n(x)}" y="{n(y+13.5)}" font-size="{ts}" fill="{cs}" text-anchor="{ancla}">{l1}</text>'
            f'<text x="{n(x)}" y="{n(y+25.5)}" font-size="{ts}" fill="{cs}" text-anchor="{ancla}">{l2}</text>')

def pizza():
    cx, cy, R, Rc = 300, 174, 148, 130
    cortes = [
        ("Contesta siempre", "A la primera, y varias", "a la vez", "i-tel"),
        ("Atiende al cliente", "Horario, dirección y qué", "lleva cada plato", "i-chat"),
        ("Toma el pedido", "Plato a plato, solo", "de lo que hay en tu carta", "i-carta"),
        ("Lo repite entero", "Y no sigue hasta que", "el cliente confirma", "i-check"),
        ("Calcula el total", "El servidor suma con", "tus precios", "i-euro"),
        ("Reparto o recogida", "Pide dirección y", "teléfono, y los repite", "i-moto"),
        ("Da un código", "Lo dice cifra a cifra", "al cliente", "i-ticket"),
        ("Avisa a cocina", "El pedido sale en", "pantalla al momento", "i-pantalla"),
    ]
    filas = [50, 126, 226, 300]
    s = [f'<svg class="f" viewBox="0 12 600 324" role="img" aria-label="Las ocho cosas que hace Noah"><g {FONT}>']
    s.append(f'<circle cx="{cx+3}" cy="{cy+5}" r="{R+12}" fill="#140A06" opacity=".07"/>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="{R+12}" fill="#FBF6EC" stroke="#EBDDC4" stroke-width="1.2"/>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="{(R+Rc)/2}" fill="none" stroke="#D58A22" stroke-width="{R-Rc}"/>')
    for k in range(8):
        a0 = 45 * k
        x0, y0 = pt(cx, cy, Rc, a0); x1, y1 = pt(cx, cy, Rc, a0 + 45)
        fill = "#FCE3B8" if k % 2 == 0 else "#F9D69C"
        s.append(f'<path d="M{cx} {cy}L{n(x0)} {n(y0)}A{Rc} {Rc} 0 0 1 {n(x1)} {n(y1)}Z" fill="{fill}" stroke="#fff" stroke-width="3.5" stroke-linejoin="round"/>')
    for k, (_t, _a, _b, ic) in enumerate(cortes):
        tm = 45 * k + 22.5
        px, py = pt(cx, cy, 76, tm)
        s.append(icono(ic, px - 13, py - 13, 26, "#5A3508"))
        dx, dy = pt(cx, cy, 111, tm + 12)
        s.append(f'<circle cx="{n(dx)}" cy="{n(dy)}" r="5" fill="#D9871A" opacity=".9"/>')
    for k, (t, a, b, _ic) in enumerate(cortes):
        tm = 45 * k + 22.5
        sx, sy = pt(cx, cy, R, tm)
        if k < 4:
            yc, lado = filas[k], "d"
        else:
            yc, lado = filas[7 - k], "i"
        bx = 464 if lado == "d" else 136
        s.append(f'<path d="M{n(sx)} {n(sy)}L{bx + (-10 if lado=="d" else 10)} {yc-9}" stroke="#C98320" stroke-width="1.1" fill="none"/>')
        s.append(f'<circle cx="{bx}" cy="{yc-9}" r="10" fill="{NEGRO}"/>')
        s.append(f'<text x="{bx}" y="{yc-5.4}" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">{k+1}</text>')
        if lado == "d":
            s.append(rot(481, yc - 6, t, a, b))
        else:
            s.append(rot(119, yc - 6, t, a, b, ancla="end"))
    s.append(f'<circle cx="{cx}" cy="{cy}" r="25" fill="{NEGRO}"/>')
    s.append(icono("i-tel", cx - 12, cy - 12, 24, ACENTO))
    s.append('</g></svg>')
    return "".join(s)

def rueda():
    cx, cy, Rr, rn = 300, 150, 106, 27
    nodos = [
        ("Suena el teléfono", "En hora punta, o", "con la cocina cerrada", "i-tel"),
        ("Noah contesta", "Y dice desde el primer", "segundo que es virtual", "i-chat"),
        ("Toma el pedido", "Plato a plato,", "y lo repite entero", "i-carta"),
        ("Total y código", "El servidor calcula;", "Noah lee el código", "i-ticket"),
        ("La cocina lo ve", "En pantalla,", "al momento", "i-pantalla"),
        ("Recoger o repartir", "Y Noah ya está libre", "para la siguiente", "i-bolsa"),
    ]
    s = [f'<svg class="f" viewBox="0 22 600 256" role="img" aria-label="Una llamada de principio a fin"><defs>'
         f'<marker id="fa" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0l10 5-10 5z" fill="#C98320"/></marker>'
         f'</defs><g {FONT}>']
    s.append(f'<circle cx="{cx}" cy="{cy}" r="{Rr-40}" fill="#FCEFD9"/>')
    for i in range(6):
        a = 30 + 60 * i
        x0, y0 = pt(cx, cy, Rr, a + 17); x1, y1 = pt(cx, cy, Rr, a + 43)
        s.append(f'<path d="M{n(x0)} {n(y0)}A{Rr} {Rr} 0 0 1 {n(x1)} {n(y1)}" fill="none" stroke="#C98320" stroke-width="2.2" marker-end="url(#fa)"/>')
    for i, (t, l1, l2, ic) in enumerate(nodos):
        a = 30 + 60 * i
        x, y = pt(cx, cy, Rr, a)
        right = i < 3
        ex = 446 if right else 154
        ex0 = x + (rn if right else -rn)
        s.append(f'<path d="M{n(ex0)} {n(y)}L{ex} {n(y)}" stroke="#D8C7AA" stroke-width="1" stroke-dasharray="2 3"/>')
        s.append(f'<circle cx="{n(x)}" cy="{n(y)}" r="{rn}" fill="{NEGRO}"/>')
        s.append(icono(ic, x - 13, y - 13, 26, ACENTO))
        s.append(f'<circle cx="{n(x+20)}" cy="{n(y-20)}" r="9.5" fill="{ACENTO}" stroke="#fff" stroke-width="1.6"/>')
        s.append(f'<text x="{n(x+20)}" y="{n(y-16.4)}" font-size="10.5" font-weight="bold" fill="{NEGRO}" text-anchor="middle">{i+1}</text>')
        if right:
            s.append(rot(456, y - 6, t, l1, l2))
        else:
            s.append(rot(144, y - 6, t, l1, l2, ancla="end"))
    s.append(f'<text x="{cx}" y="{cy-4}" font-size="12" font-weight="bold" fill="{NEGRO}" text-anchor="middle" letter-spacing="1.4">UNA LLAMADA</text>')
    s.append(f'<text x="{cx}" y="{cy+11}" font-size="9.4" fill="{TXT}" text-anchor="middle">de principio a fin</text>')
    s.append('</g></svg>')
    return "".join(s)

def dolor():
    cx, cy = 300, 150
    sats = [("Horno", "Manos en la masa", "i-horno", 0), ("Cocina", "Pasta al punto", "i-chef", 72),
            ("Reparto", "Fuera de ruta", "i-moto", 144), ("Sala", "Mesas llenas", "i-grupo", 216),
            ("Caja", "Cobrando", "i-euro", 288)]
    rx, ry = 238, 104
    s = [f'<svg class="f" viewBox="0 10 600 292" role="img" aria-label="Quién coge el teléfono en hora punta"><g {FONT}>']
    pos = []
    for (_r, _e, _i, a) in sats:
        t = math.radians(a)
        pos.append((cx + rx * math.sin(t), cy - ry * math.cos(t)))
    for (x, y) in pos:
        mx, my = (x + cx) / 2, (y + cy) / 2
        s.append(f'<path d="M{n(x)} {n(y)}L{cx} {cy}" stroke="{MAL}" stroke-width="1.4" stroke-dasharray="4 3" opacity=".75"/>')
        s.append(f'<circle cx="{n(mx)}" cy="{n(my)}" r="8.5" fill="#fff" stroke="{MAL}" stroke-width="1.3"/>')
        s.append(f'<path d="M{n(mx-3.4)} {n(my-3.4)}l6.8 6.8M{n(mx+3.4)} {n(my-3.4)}l-6.8 6.8" stroke="{MAL}" stroke-width="1.7" stroke-linecap="round"/>')
    for (rol, est, ic, a), (x, y) in zip(sats, pos):
        s.append(f'<circle cx="{n(x)}" cy="{n(y)}" r="30" fill="{MAL_F}" stroke="{MAL}" stroke-width="1.5"/>')
        s.append(icono(ic, x - 13, y - 13, 26, MAL))
        if a == 0:
            s.append(f'<text x="{n(x+40)}" y="{n(y-2)}" font-size="11.5" font-weight="bold" fill="{NEGRO}">{rol}</text>')
            s.append(f'<text x="{n(x+40)}" y="{n(y+12)}" font-size="9.8" fill="{HUMO}">{est}</text>')
        else:
            s.append(f'<text x="{n(x)}" y="{n(y+46)}" font-size="11.5" font-weight="bold" fill="{NEGRO}" text-anchor="middle">{rol}</text>')
            s.append(f'<text x="{n(x)}" y="{n(y+60)}" font-size="9.8" fill="{HUMO}" text-anchor="middle">{est}</text>')
    for r, o in ((62, .16), (53, .3)):
        s.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{ACENTO}" stroke-width="2.2" opacity="{o}"/>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="42" fill="{NEGRO}"/>')
    s.append(icono("i-tel", cx - 17, cy - 17, 34, ACENTO))
    s.append(f'<text x="{cx}" y="{cy+82}" font-size="13" font-weight="bold" fill="{NEGRO}" text-anchor="middle">¿Quién lo coge?</text>')
    s.append('</g></svg>')
    return "".join(s)

def ecuacion():
    s = [f'<svg class="f" viewBox="0 0 600 118" role="img" aria-label="Cuenta de ejemplo de llamadas perdidas"><g {FONT}>']
    s.append(f'<rect x="0" y="0" width="600" height="118" rx="9" fill="#fff" stroke="#E6DCCB"/>')
    s.append(f'<circle cx="44" cy="59" r="26" fill="{MAL_F}" stroke="{MAL}" stroke-width="1.5"/>')
    s.append(icono("i-tel-no", 31, 46, 26, MAL))
    s.append(f'<text x="82" y="52" font-size="26" font-weight="bold" fill="{NEGRO}">3</text>')
    s.append(f'<text x="82" y="68" font-size="9.8" fill="{HUMO}">llamadas perdidas</text>')
    s.append(f'<text x="82" y="80" font-size="9.8" fill="{HUMO}">a la semana</text>')
    s.append(f'<text x="188" y="68" font-size="24" fill="{HUMO}" text-anchor="middle">×</text>')
    s.append(f'<circle cx="236" cy="59" r="26" fill="#FCEFD9" stroke="{ACENTO}" stroke-width="1.5"/>')
    s.append(icono("i-euro", 223, 46, 26, TXT))
    s.append(f'<text x="274" y="52" font-size="23" font-weight="bold" fill="{NEGRO}">30 €</text>')
    s.append(f'<text x="274" y="68" font-size="9.8" fill="{HUMO}">un pedido normal</text>')
    s.append(f'<text x="274" y="80" font-size="9.8" fill="{HUMO}">(el de la hoja 2)</text>')
    s.append(f'<text x="392" y="68" font-size="24" fill="{HUMO}" text-anchor="middle">=</text>')
    s.append(f'<rect x="414" y="14" width="174" height="90" rx="9" fill="{MAL_F}" stroke="{MAL}" stroke-width="1.5"/>')
    s.append(f'<text x="501" y="56" font-size="27" font-weight="bold" fill="{MAL}" text-anchor="middle">≈ 4.700 €</text>')
    s.append(f'<text x="501" y="75" font-size="10.2" fill="{MAL}" text-anchor="middle">al año que no entran</text>')
    s.append('</g></svg>')
    return "".join(s)

def comparativa():
    s = [f'<svg class="f" viewBox="0 0 600 236" role="img" aria-label="El mismo pedido por teléfono y por plataforma"><g {FONT}>']
    datos = [
        (0, BIEN, BIEN_F, "i-tel", "Por tu teléfono",
         [("Pizza margarita", "9,00 €"), ("Pizza barbacoa", "11,50 €"),
          ("Pan de ajo con queso", "4,50 €"), ("Tiramisú", "5,00 €")],
         "Te quedas", "30,00 €", 1.0, "Sin comisión. Repartes tú igual."),
        (308, MAL, MAL_F, "i-moto", "Por la plataforma",
         [("El mismo pedido", "30,00 €"), ("Comisión de ejemplo (30 %)", "−9,00 €"),
          ("", ""), ("", "")],
         "Te quedas", "21,00 €", 21 / 30, "Y el cliente pasa a ser de la plataforma."),
    ]
    for x0, col, fondo, ic, titulo, lineas, lab, total, frac, nota in datos:
        s.append(f'<rect x="{x0}" y="0" width="292" height="236" rx="9" fill="{fondo}" stroke="{col}" stroke-width="1.5"/>')
        s.append(icono(ic, x0 + 16, 13, 22, col))
        s.append(f'<text x="{x0+46}" y="30" font-size="13" font-weight="bold" fill="{col}">{titulo}</text>')
        for i, (nom, pre) in enumerate(lineas):
            y = 62 + 18 * i
            s.append(f'<text x="{x0+16}" y="{y}" font-size="10.4" fill="{NEGRO}">{nom}</text>')
            s.append(f'<text x="{x0+266}" y="{y}" font-size="10.4" fill="{NEGRO}" text-anchor="end">{pre}</text>')
        s.append(f'<path d="M{x0+16} 142H{x0+276}" stroke="{col}" stroke-width="1.2"/>')
        s.append(f'<text x="{x0+16}" y="168" font-size="13.5" font-weight="bold" fill="{col}">{lab}</text>')
        s.append(f'<text x="{x0+276}" y="171" font-size="22" font-weight="bold" fill="{col}" text-anchor="end">{total}</text>')
        s.append(f'<rect x="{x0+16}" y="180" width="260" height="15" rx="7.5" fill="#fff"/>')
        s.append(f'<rect x="{x0+16}" y="180" width="{260*frac:.1f}" height="15" rx="7.5" fill="{col}"/>')
        s.append(f'<text x="{x0+16+260*frac-10:.1f}" y="190.6" font-size="9.4" font-weight="bold" fill="#fff" text-anchor="end">{round(frac*100)} %</text>')
        s.append(f'<text x="{x0+16}" y="216" font-size="9.6" fill="{HUMO}">{nota}</text>')
    s.append(f'<circle cx="300" cy="96" r="22" fill="{NEGRO}" stroke="#fff" stroke-width="2.5"/>')
    s.append(f'<text x="300" y="93" font-size="9.6" font-weight="bold" fill="{ACENTO}" text-anchor="middle">−9,00</text>')
    s.append(f'<text x="300" y="104" font-size="8.6" font-weight="bold" fill="{ACENTO}" text-anchor="middle">€</text>')
    s.append('</g></svg>')
    return "".join(s)

def circulos():
    cx, cy = 176, 168
    s = [f'<svg class="f" viewBox="0 0 600 334" role="img" aria-label="Nicho y micronicho"><g {FONT}>']
    s.append(f'<circle cx="{cx}" cy="{cy}" r="162" fill="#FCEFD9" stroke="{ACENTO}" stroke-width="1.8"/>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="112" fill="#F9D69C" stroke="{ACENTO}" stroke-width="1.8"/>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="64" fill="{ACENTO}"/>')
    s.append(f'<text x="{cx}" y="{cy-138}" font-size="10.5" font-weight="bold" fill="{TXT}" text-anchor="middle" letter-spacing="2.6">NICHO</text>')
    s.append(f'<text x="{cx}" y="{cy-88}" font-size="10.5" font-weight="bold" fill="{TXT}" text-anchor="middle" letter-spacing="2.6">MICRONICHO</text>')
    s.append(f'<text x="{cx}" y="{cy-2}" font-size="14" font-weight="bold" fill="{NEGRO}" text-anchor="middle">LA VITA</text>')
    s.append(f'<text x="{cx}" y="{cy+16}" font-size="14" font-weight="bold" fill="{NEGRO}" text-anchor="middle">BUONA</text>')
    bloques = [
        (52, 50, "Hostelería que vende por teléfono",
         ["Pedido hablado, carta con precios fijos,", "y quien coge el teléfono está haciendo", "otra cosa."], "NICHO", 162),
        (90, 168, "Pizzería o italiano con reparto",
         ["Repartes tú, así que el pedido directo", "no te cambia la logística y te ahorra", "la comisión de la plataforma."], "MICRONICHO", 112),
        (128, 280, "La Vita Buona",
         ["Recién abierta · 63 platos · maestro", "pizzero al horno · cinco personas en", "dos turnos · desayunos en camino."], "NÚCLEO", 64),
    ]
    for ang, ty, titulo, lineas, tag, r in bloques:
        px, py = pt(cx, cy, r, ang)
        s.append(f'<path d="M{n(px)} {n(py)}L356 {ty}" stroke="{NEGRO}" stroke-width="1.1" fill="none"/>')
        s.append(f'<circle cx="{n(px)}" cy="{n(py)}" r="3.8" fill="{NEGRO}"/>')
        s.append(f'<text x="364" y="{ty-17}" font-size="8.6" font-weight="bold" fill="{TXT}" letter-spacing="2">{tag}</text>')
        s.append(f'<text x="364" y="{ty}" font-size="13" font-weight="bold" fill="{NEGRO}">{titulo}</text>')
        for i, l in enumerate(lineas):
            s.append(f'<text x="364" y="{ty+16+13.5*i}" font-size="10" fill="{HUMO}">{l}</text>')
    s.append('</g></svg>')
    return "".join(s)

def propongo():
    s = [f'<svg class="f" viewBox="0 0 600 268" role="img" aria-label="Lo que propongo"><defs>'
         f'<marker id="fp" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0l10 5-10 5z" fill="{ACENTO}"/></marker>'
         f'</defs><g {FONT}>']
    s.append(f'<rect x="0" y="0" width="600" height="268" rx="9" fill="{NEGRO}"/>')
    s.append(f'<rect x="0" y="0" width="600" height="5" fill="{ACENTO}"/>')
    s.append(f'<text x="26" y="36" font-size="9.4" font-weight="bold" fill="{ACENTO}" letter-spacing="2.6">LO QUE PROPONGO</text>')
    s.append(f'<text x="26" y="60" font-size="16" font-weight="bold" fill="#FBF6EC">Que lo veas funcionando antes de hablar de nada más.</text>')
    pasos = [
        (100, "i-lista", "Me confirmas cuatro datos", "Horario bueno, envío,", "mínimo y zona de reparto"),
        (300, "i-tel", "Lo ves funcionando", "Con tu carta cargada,", "atendiendo una llamada"),
        (500, "i-chat", "Hablamos de condiciones", "Solo si te convence.", "Antes, no."),
    ]
    for i, (x, ic, t, l1, l2) in enumerate(pasos):
        s.append(f'<circle cx="{x}" cy="130" r="32" fill="{ACENTO}"/>')
        s.append(icono(ic, x - 15, 115, 30, NEGRO))
        s.append(f'<circle cx="{x+25}" cy="104" r="11" fill="#FBF6EC"/>')
        s.append(f'<text x="{x+25}" y="108" font-size="12" font-weight="bold" fill="{NEGRO}" text-anchor="middle">{i+1}</text>')
        s.append(f'<text x="{x}" y="187" font-size="12.5" font-weight="bold" fill="#FBF6EC" text-anchor="middle">{t}</text>')
        s.append(f'<text x="{x}" y="204" font-size="10" fill="#D9CCBB" text-anchor="middle">{l1}</text>')
        s.append(f'<text x="{x}" y="218" font-size="10" fill="#D9CCBB" text-anchor="middle">{l2}</text>')
        if i < 2:
            s.append(f'<path d="M{x+42} 130H{x+156}" stroke="{ACENTO}" stroke-width="1.8" stroke-dasharray="4 4" marker-end="url(#fp)"/>')
    s.append(f'<path d="M26 238H574" stroke="#3A2A20" stroke-width="1"/>')
    s.append(f'<text x="26" y="256" font-size="10" fill="#D9CCBB">Brian Carbajal · Consultor freelance en inteligencia artificial para negocios · Ourense</text>')
    s.append('</g></svg>')
    return "".join(s)


def pizza_deco():
    cx, cy, R, Rc = 122, 100, 86, 74
    s = ['<svg class="p-deco" viewBox="0 0 220 200" aria-hidden="true">']
    for r, o in ((101, .85), (112, .5), (123, .26)):
        x0, y0 = pt(cx, cy, r, 236); x1, y1 = pt(cx, cy, r, 304)
        s.append(f'<path d="M{n(x0)} {n(y0)}A{r} {r} 0 0 1 {n(x1)} {n(y1)}" fill="none" stroke="{ACENTO}" stroke-width="2.4" stroke-linecap="round" opacity="{o}"/>')
    puntos = [(0.55, 14), (0.7, 190), (0.45, 300), (0.78, 118), (0.4, 62), (0.72, 250)]
    for k in range(8):
        a0 = 45 * k; tm = a0 + 22.5
        dx, dy = (0, 0)
        if k == 5:
            dx, dy = 11 * math.sin(math.radians(tm)), -11 * math.cos(math.radians(tm))
        x0, y0 = pt(cx, cy, Rc, a0); x1, y1 = pt(cx, cy, Rc, a0 + 45)
        c0, c1 = pt(cx, cy, (R + Rc) / 2, a0 + .6), pt(cx, cy, (R + Rc) / 2, a0 + 44.4)
        fill = "#FCE3B8" if k % 2 == 0 else "#F9D69C"
        s.append(f'<g transform="translate({n(dx)},{n(dy)})">'
                 f'<path d="M{cx} {cy}L{n(x0)} {n(y0)}A{Rc} {Rc} 0 0 1 {n(x1)} {n(y1)}Z" fill="{fill}" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/>'
                 f'<path d="M{n(c0[0])} {n(c0[1])}A{(R+Rc)/2} {(R+Rc)/2} 0 0 1 {n(c1[0])} {n(c1[1])}" fill="none" stroke="#D58A22" stroke-width="{R-Rc}"/>'
                 f'</g>')
    for f_, ang in puntos:
        px, py = pt(cx, cy, 70 * f_, ang)
        s.append(f'<circle cx="{n(px)}" cy="{n(py)}" r="5.2" fill="#C97B0E"/><circle cx="{n(px)}" cy="{n(py)}" r="1.6" fill="#FBE3B8"/>')
    s.append('</svg>')
    return "".join(s)
