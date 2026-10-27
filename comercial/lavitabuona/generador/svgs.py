# -*- coding: utf-8 -*-
# Generadores de los dibujos del dossier. Todo a 600px de ancho como maximo:
# con zoom 1.12 el ancho util son 614px y, si algo se pasa, Chromium encoge
# el documento entero sin avisar.
import math

NEGRO = "#140A06"; ACENTO = "#E0952F"; TXT = "#9A5B0C"; HUMO = "#5A514A"
BIEN = "#2E7D4F"; MAL = "#C0392B"; BIEN_F = "#EAF4EE"; MAL_F = "#FBECEA"
FONT = 'font-family="Helvetica, Arial, sans-serif"'

def pt(cx, cy, r, deg):
    t = math.radians(deg)
    return cx + r * math.sin(t), cy - r * math.cos(t)

def n(x):
    return f"{x:.1f}"

def icono(nombre, x, y, size, color):
    return (f'<g transform="translate({n(x)},{n(y)})" color="{color}">'
            f'<use href="#{nombre}" width="{size}" height="{size}"/></g>')

def rotulo(x, y, titulo, l1, l2, ancla="start", color_t=NEGRO, color_s=HUMO, tam=10.5):
    return (f'<text x="{n(x)}" y="{n(y)}" font-size="{tam}" font-weight="bold" fill="{color_t}" text-anchor="{ancla}">{titulo}</text>'
            f'<text x="{n(x)}" y="{n(y+12)}" font-size="8.8" fill="{color_s}" text-anchor="{ancla}">{l1}</text>'
            f'<text x="{n(x)}" y="{n(y+23)}" font-size="8.8" fill="{color_s}" text-anchor="{ancla}">{l2}</text>')

# ------------------------------------------------------------------ PIZZA
def pizza():
    cx, cy, R, Rc = 300, 150, 132, 116
    cortes = [
        ("Contesta siempre", "A la primera, y varias", "a la vez", "i-tel"),
        ("Atiende al cliente", "Horario, dirección y qué", "lleva cada plato", "i-chat"),
        ("Toma el pedido", "Plato a plato, solo", "de tus 63 platos", "i-carta"),
        ("Lo repite entero", "Y no sigue hasta que", "el cliente confirma", "i-check"),
        ("Calcula el total", "El servidor suma con", "tus precios", "i-euro"),
        ("Reparto o recogida", "Pide dirección y teléfono,", "y los repite", "i-moto"),
        ("Da un código", "Lo lee letra a letra", "al cliente", "i-ticket"),
        ("Avisa a cocina", "El pedido sale en", "pantalla al momento", "i-pantalla"),
    ]
    filas = [40, 112, 188, 262]          # centro vertical de cada etiqueta
    s = [f'<svg width="600" height="300" viewBox="0 0 600 300" role="img" aria-label="Las ocho cosas que hace Noah"><g {FONT}>']
    s.append(f'<circle cx="{cx}" cy="{cy}" r="{(R+Rc)/2}" fill="none" stroke="#D58A22" stroke-width="{R-Rc}"/>')
    for k, (_t, _a, _b, ic) in enumerate(cortes):
        a0 = 45 * k
        x0, y0 = pt(cx, cy, Rc, a0); x1, y1 = pt(cx, cy, Rc, a0 + 45)
        fill = "#FCE3B8" if k % 2 == 0 else "#F9D69C"
        s.append(f'<path d="M{cx} {cy}L{n(x0)} {n(y0)}A{Rc} {Rc} 0 0 1 {n(x1)} {n(y1)}Z" fill="{fill}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>')
    for k, (_t, _a, _b, ic) in enumerate(cortes):
        tm = 45 * k + 22.5
        px, py = pt(cx, cy, 68, tm)
        s.append(icono(ic, px - 11, py - 11, 22, "#5A3508"))
        dx, dy = pt(cx, cy, 98, tm + 11)
        s.append(f'<circle cx="{n(dx)}" cy="{n(dy)}" r="4.4" fill="#D9871A" opacity=".9"/>')
    # etiquetas: derecha k=0..3 (arriba->abajo), izquierda k=4..7 (abajo->arriba)
    for k, (t, a, b, _ic) in enumerate(cortes):
        tm = 45 * k + 22.5
        sx, sy = pt(cx, cy, R, tm)
        if k < 4:
            yc = filas[k]; lado = "d"
        else:
            yc = filas[7 - k]; lado = "i"
        bx = 456 if lado == "d" else 144
        s.append(f'<path d="M{n(sx)} {n(sy)}L{bx + (-9 if lado=="d" else 9)} {yc-9}" stroke="#C98320" stroke-width="1" fill="none"/>')
        s.append(f'<circle cx="{bx}" cy="{yc-9}" r="9" fill="{NEGRO}"/>')
        s.append(f'<text x="{bx}" y="{yc-5.6}" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">{k+1}</text>')
        if lado == "d":
            s.append(rotulo(472, yc - 6, t, a, b))
        else:
            s.append(rotulo(128, yc - 6, t, a, b, ancla="end"))
    s.append(f'<circle cx="{cx}" cy="{cy}" r="21" fill="{NEGRO}"/>')
    s.append(icono("i-tel", cx - 10, cy - 10, 20, ACENTO))
    s.append('</g></svg>')
    return "".join(s)

# ------------------------------------------------------------------ RUEDA
def rueda():
    cx, cy, Rr, rn = 300, 140, 96, 24
    nodos = [
        ("Suena el teléfono", "En hora punta, o", "con la cocina cerrada", "i-tel"),
        ("Noah contesta", "Y dice desde el primer", "segundo que es virtual", "i-chat"),
        ("Toma el pedido", "Plato a plato,", "y lo repite entero", "i-carta"),
        ("Total y código", "El servidor calcula;", "Noah lee el código", "i-ticket"),
        ("La cocina lo ve", "En pantalla,", "al momento", "i-pantalla"),
        ("Recoger o repartir", "Y Noah ya está libre", "para la siguiente", "i-bolsa"),
    ]
    s = [f'<svg width="600" height="280" viewBox="0 0 600 280" role="img" aria-label="Una llamada de principio a fin"><defs>'
         f'<marker id="fa" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0l10 5-10 5z" fill="#C98320"/></marker>'
         f'</defs><g {FONT}>']
    s.append(f'<circle cx="{cx}" cy="{cy}" r="{Rr-34}" fill="#FCEFD9"/>')
    # flechas del anillo
    for i in range(6):
        a = 30 + 60 * i
        x0, y0 = pt(cx, cy, Rr, a + 19); x1, y1 = pt(cx, cy, Rr, a + 41)
        s.append(f'<path d="M{n(x0)} {n(y0)}A{Rr} {Rr} 0 0 1 {n(x1)} {n(y1)}" fill="none" stroke="#C98320" stroke-width="2" marker-end="url(#fa)"/>')
    for i, (t, l1, l2, ic) in enumerate(nodos):
        a = 30 + 60 * i
        x, y = pt(cx, cy, Rr, a)
        right = i < 3
        # guia punteada hasta la etiqueta
        ex = 436 if right else 164
        ex0 = x + (rn if right else -rn)
        s.append(f'<path d="M{n(ex0)} {n(y)}L{ex} {n(y)}" stroke="#D8C7AA" stroke-width="1" stroke-dasharray="2 3"/>')
        s.append(f'<circle cx="{n(x)}" cy="{n(y)}" r="{rn}" fill="{NEGRO}"/>')
        s.append(icono(ic, x - 11, y - 11, 22, ACENTO))
        s.append(f'<circle cx="{n(x+17)}" cy="{n(y-17)}" r="8.5" fill="{ACENTO}" stroke="#fff" stroke-width="1.5"/>')
        s.append(f'<text x="{n(x+17)}" y="{n(y-13.7)}" font-size="9.5" font-weight="bold" fill="{NEGRO}" text-anchor="middle">{i+1}</text>')
        if right:
            s.append(rotulo(444, y - 6, t, l1, l2))
        else:
            s.append(rotulo(156, y - 6, t, l1, l2, ancla="end"))
    s.append(f'<text x="{cx}" y="{cy-4}" font-size="10.5" font-weight="bold" fill="{NEGRO}" text-anchor="middle" letter-spacing="1.4">UNA LLAMADA</text>')
    s.append(f'<text x="{cx}" y="{cy+10}" font-size="8.4" fill="{TXT}" text-anchor="middle">de principio a fin</text>')
    s.append('</g></svg>')
    return "".join(s)

# ------------------------------------------------------------------ DOLOR
def dolor():
    cx, cy = 300, 118
    sats = [
        ("Horno", "Manos en la masa", "i-horno", 0),
        ("Cocina", "Pasta al punto", "i-chef", 72),
        ("Reparto", "Fuera de ruta", "i-moto", 144),
        ("Sala", "Mesas llenas", "i-grupo", 216),
        ("Caja", "Cobrando", "i-euro", 288),
    ]
    rx, ry = 215, 80
    s = [f'<svg width="600" height="262" viewBox="0 0 600 262" role="img" aria-label="Quién coge el teléfono en hora punta"><g {FONT}>']
    pos = []
    for (_r, _e, _i, a) in sats:
        t = math.radians(a)
        pos.append((cx + rx * math.sin(t), cy - ry * math.cos(t)))
    for (x, y) in pos:
        mx, my = (x + cx) / 2, (y + cy) / 2
        s.append(f'<path d="M{n(x)} {n(y)}L{cx} {cy}" stroke="{MAL}" stroke-width="1.3" stroke-dasharray="4 3" opacity=".75"/>')
        s.append(f'<circle cx="{n(mx)}" cy="{n(my)}" r="7.5" fill="#fff" stroke="{MAL}" stroke-width="1.2"/>')
        s.append(f'<path d="M{n(mx-3)} {n(my-3)}l6 6M{n(mx+3)} {n(my-3)}l-6 6" stroke="{MAL}" stroke-width="1.5" stroke-linecap="round"/>')
    for (rol, est, ic, a), (x, y) in zip(sats, pos):
        s.append(f'<circle cx="{n(x)}" cy="{n(y)}" r="25" fill="{MAL_F}" stroke="{MAL}" stroke-width="1.4"/>')
        s.append(icono(ic, x - 11, y - 11, 22, MAL))
        if a == 0:
            s.append(f'<text x="{n(x+34)}" y="{n(y-2)}" font-size="9.8" font-weight="bold" fill="{NEGRO}">{rol}</text>')
            s.append(f'<text x="{n(x+34)}" y="{n(y+10)}" font-size="8.6" fill="{HUMO}">{est}</text>')
        else:
            s.append(f'<text x="{n(x)}" y="{n(y+39)}" font-size="9.8" font-weight="bold" fill="{NEGRO}" text-anchor="middle">{rol}</text>')
            s.append(f'<text x="{n(x)}" y="{n(y+51)}" font-size="8.6" fill="{HUMO}" text-anchor="middle">{est}</text>')
    # centro: el telefono que suena
    for r, o in ((50, .18), (43, .32)):
        s.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{ACENTO}" stroke-width="2" opacity="{o}"/>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="34" fill="{NEGRO}"/>')
    s.append(icono("i-tel", cx - 14, cy - 14, 28, ACENTO))
    s.append(f'<text x="{cx}" y="{cy+66}" font-size="11" font-weight="bold" fill="{NEGRO}" text-anchor="middle">¿Quién lo coge?</text>')
    s.append('</g></svg>')
    return "".join(s)

# ------------------------------------------------------------------ ECUACION
def ecuacion():
    s = [f'<svg width="600" height="96" viewBox="0 0 600 96" role="img" aria-label="Cuenta de ejemplo de llamadas perdidas"><g {FONT}>']
    s.append(f'<rect x="0" y="0" width="600" height="96" rx="4" fill="#fff" stroke="#E6DCCB"/>')
    # bloque 1
    s.append(f'<circle cx="38" cy="48" r="22" fill="{MAL_F}" stroke="{MAL}" stroke-width="1.4"/>')
    s.append(icono("i-tel-no", 27, 37, 22, MAL))
    s.append(f'<text x="72" y="44" font-size="19" font-weight="bold" fill="{NEGRO}">3</text>')
    s.append(f'<text x="72" y="58" font-size="8.8" fill="{HUMO}">llamadas perdidas</text>')
    s.append(f'<text x="72" y="69" font-size="8.8" fill="{HUMO}">a la semana</text>')
    s.append(f'<text x="176" y="56" font-size="20" fill="{HUMO}" text-anchor="middle">×</text>')
    # bloque 2
    s.append(f'<circle cx="222" cy="48" r="22" fill="#FCEFD9" stroke="{ACENTO}" stroke-width="1.4"/>')
    s.append(icono("i-euro", 211, 37, 22, TXT))
    s.append(f'<text x="256" y="44" font-size="19" font-weight="bold" fill="{NEGRO}">37,40 €</text>')
    s.append(f'<text x="256" y="58" font-size="8.8" fill="{HUMO}">un pedido normal</text>')
    s.append(f'<text x="256" y="69" font-size="8.8" fill="{HUMO}">(el de la hoja 2)</text>')
    s.append(f'<text x="384" y="56" font-size="20" fill="{HUMO}" text-anchor="middle">=</text>')
    # bloque 3
    s.append(f'<rect x="408" y="12" width="180" height="72" rx="4" fill="{MAL_F}" stroke="{MAL}" stroke-width="1.4"/>')
    s.append(f'<text x="498" y="46" font-size="24" font-weight="bold" fill="{MAL}" text-anchor="middle">≈ 5.800 €</text>')
    s.append(f'<text x="498" y="62" font-size="9" fill="{MAL}" text-anchor="middle">al año que no entran</text>')
    s.append('</g></svg>')
    return "".join(s)

# ------------------------------------------------------------------ COMPARATIVA (verde / rojo)
def comparativa():
    s = [f'<svg width="600" height="188" viewBox="0 0 600 188" role="img" aria-label="El mismo pedido por teléfono y por plataforma"><g {FONT}>']
    datos = [
        (0, BIEN, BIEN_F, "i-tel", "Por tu teléfono",
         [("Bruschetta di parma", "5,00 €"), ("Pizza margaritha", "9,50 €"),
          ("Reino de las Dos Sicilias", "16,90 €"), ("Tiramisú", "6,00 €")],
         "Cobras", "37,40 €", 1.0, "Sin comisión. Repartes tú igual."),
        (308, MAL, MAL_F, "i-moto", "Por la plataforma",
         [("Bruschetta di parma", "4,00 €"), ("Pizza margaritha", "7,60 €"),
          ("Reino de las Dos Sicilias", "13,52 €"), ("Tiramisú", "6,00 €")],
         "Cobras", "31,12 €", 31.12 / 37.40, "Y de aquí todavía sale la comisión."),
    ]
    for x0, col, fondo, ic, titulo, lineas, lab, total, frac, nota in datos:
        s.append(f'<rect x="{x0}" y="0" width="292" height="188" rx="4" fill="{fondo}" stroke="{col}" stroke-width="1.4"/>')
        s.append(icono(ic, x0 + 14, 11, 19, col))
        s.append(f'<text x="{x0+40}" y="26" font-size="11" font-weight="bold" fill="{col}">{titulo}</text>')
        for i, (nom, pre) in enumerate(lineas):
            y = 50 + 14 * i
            s.append(f'<text x="{x0+14}" y="{y}" font-size="8.9" fill="{NEGRO}">{nom}</text>')
            s.append(f'<text x="{x0+278}" y="{y}" font-size="8.9" fill="{NEGRO}" text-anchor="end">{pre}</text>')
        s.append(f'<path d="M{x0+14} 112H{x0+278}" stroke="{col}" stroke-width="1"/>')
        s.append(f'<text x="{x0+14}" y="132" font-size="11.5" font-weight="bold" fill="{col}">{lab}</text>')
        s.append(f'<text x="{x0+278}" y="134" font-size="17" font-weight="bold" fill="{col}" text-anchor="end">{total}</text>')
        s.append(f'<rect x="{x0+14}" y="144" width="264" height="8" rx="4" fill="#fff"/>')
        s.append(f'<rect x="{x0+14}" y="144" width="{264*frac:.1f}" height="8" rx="4" fill="{col}"/>')
        s.append(f'<text x="{x0+14}" y="170" font-size="8.4" fill="{HUMO}">{nota}</text>')
    s.append('</g></svg>')
    return "".join(s)

# ------------------------------------------------------------------ CIRCULOS (nicho / micronicho)
def circulos():
    cx, cy = 160, 150
    s = [f'<svg width="600" height="300" viewBox="0 0 600 300" role="img" aria-label="Nicho y micronicho"><g {FONT}>']
    s.append(f'<circle cx="{cx}" cy="{cy}" r="142" fill="#FCEFD9" stroke="{ACENTO}" stroke-width="1.6"/>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="98" fill="#F9D69C" stroke="{ACENTO}" stroke-width="1.6"/>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="54" fill="{ACENTO}"/>')
    s.append(f'<text x="{cx}" y="{cy-120}" font-size="9" font-weight="bold" fill="{TXT}" text-anchor="middle" letter-spacing="2.2">NICHO</text>')
    s.append(f'<text x="{cx}" y="{cy-74}" font-size="9" font-weight="bold" fill="{TXT}" text-anchor="middle" letter-spacing="2.2">MICRONICHO</text>')
    s.append(f'<text x="{cx}" y="{cy-2}" font-size="12" font-weight="bold" fill="{NEGRO}" text-anchor="middle">LA VITA</text>')
    s.append(f'<text x="{cx}" y="{cy+13}" font-size="12" font-weight="bold" fill="{NEGRO}" text-anchor="middle">BUONA</text>')
    bloques = [
        (55, 46, "Hostelería que vende por teléfono",
         ["Pedido hablado, carta con precios fijos,", "y quien coge el teléfono está haciendo", "otra cosa."], "NICHO"),
        (90, 150, "Pizzería o italiano con reparto propio",
         ["Repartes tú, así que el pedido directo", "no te cambia la logística y te ahorra", "la comisión de la plataforma."], "MICRONICHO"),
        (125, 252, "La Vita Buona",
         ["Recién abierta · 63 platos · maestro pizzero", "al horno · cinco personas en dos turnos ·", "desayunos en camino."], "NÚCLEO"),
    ]
    radios = [142, 98, 54]
    for (ang, ty, titulo, lineas, tag), r in zip(bloques, radios):
        px, py = pt(cx, cy, r, ang)
        s.append(f'<path d="M{n(px)} {n(py)}L330 {ty}" stroke="{NEGRO}" stroke-width="1" fill="none"/>')
        s.append(f'<circle cx="{n(px)}" cy="{n(py)}" r="3.4" fill="{NEGRO}"/>')
        s.append(f'<text x="338" y="{ty-14}" font-size="7.6" font-weight="bold" fill="{TXT}" letter-spacing="1.8">{tag}</text>')
        s.append(f'<text x="338" y="{ty}" font-size="11.5" font-weight="bold" fill="{NEGRO}">{titulo}</text>')
        for i, l in enumerate(lineas):
            s.append(f'<text x="338" y="{ty+14+12*i}" font-size="8.9" fill="{HUMO}">{l}</text>')
    s.append('</g></svg>')
    return "".join(s)

# ------------------------------------------------------------------ PROPUESTA
def propongo():
    s = [f'<svg width="600" height="212" viewBox="0 0 600 212" role="img" aria-label="Lo que propongo"><defs>'
         f'<marker id="fp" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0l10 5-10 5z" fill="{ACENTO}"/></marker>'
         f'</defs><g {FONT}>']
    s.append(f'<rect x="0" y="0" width="600" height="212" rx="5" fill="{NEGRO}"/>')
    s.append(f'<rect x="0" y="0" width="600" height="4" fill="{ACENTO}"/>')
    s.append(f'<text x="24" y="30" font-size="8.4" font-weight="bold" fill="{ACENTO}" letter-spacing="2.4">LO QUE PROPONGO</text>')
    s.append(f'<text x="24" y="50" font-size="14" font-weight="bold" fill="#FBF6EC">Que lo veas funcionando antes de hablar de nada más.</text>')
    pasos = [
        (100, "i-lista", "Me confirmas cuatro datos", "Horario bueno, envío,", "mínimo y zona de reparto"),
        (300, "i-tel", "Lo ves funcionando", "Con tu carta cargada,", "atendiendo una llamada"),
        (500, "i-chat", "Hablamos de condiciones", "Solo si te convence.", "Antes, no."),
    ]
    for i, (x, ic, t, l1, l2) in enumerate(pasos):
        s.append(f'<circle cx="{x}" cy="102" r="25" fill="{ACENTO}"/>')
        s.append(icono(ic, x - 12, 90, 24, NEGRO))
        s.append(f'<circle cx="{x+20}" cy="82" r="9" fill="#FBF6EC"/>')
        s.append(f'<text x="{x+20}" y="85.4" font-size="10" font-weight="bold" fill="{NEGRO}" text-anchor="middle">{i+1}</text>')
        s.append(f'<text x="{x}" y="148" font-size="10.5" font-weight="bold" fill="#FBF6EC" text-anchor="middle">{t}</text>')
        s.append(f'<text x="{x}" y="162" font-size="8.8" fill="#D9CCBB" text-anchor="middle">{l1}</text>')
        s.append(f'<text x="{x}" y="174" font-size="8.8" fill="#D9CCBB" text-anchor="middle">{l2}</text>')
        if i < 2:
            s.append(f'<path d="M{x+34} 102H{x+166}" stroke="{ACENTO}" stroke-width="1.6" stroke-dasharray="4 4" marker-end="url(#fp)"/>')
    s.append(f'<path d="M24 188H576" stroke="#3A2A20" stroke-width="1"/>')
    s.append(f'<text x="24" y="204" font-size="8.8" fill="#D9CCBB">Brian Carbajal · Consultor freelance en inteligencia artificial para negocios · Ourense</text>')
    s.append('</g></svg>')
    return "".join(s)

# ------------------------------------------------------------------ ICONOS
SPRITE = '''<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="i-marca" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#E0952F"/><g transform="translate(5,5) scale(.58)"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 005 5L15 12l5 2v4a2 2 0 01-2 2A15 15 0 013 5a2 2 0 012-2z" fill="none" stroke="#140A06" stroke-width="2.4" stroke-linejoin="round"/></g></symbol>
<symbol id="i-tel" viewBox="0 0 24 24"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 005 5L15 12l5 2v4a2 2 0 01-2 2A15 15 0 013 5a2 2 0 012-2z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>
<symbol id="i-tel-no" viewBox="0 0 24 24"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 005 5L15 12l5 2v4a2 2 0 01-2 2A15 15 0 013 5a2 2 0 012-2z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M3 21L21 3" fill="none" stroke="currentColor" stroke-width="1.9"/></symbol>
<symbol id="i-pizza" viewBox="0 0 24 24"><path d="M12 3c5 0 9 4 9 9H3c0-5 4-9 9-9z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M3 12h18l-9 9-9-9z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="9.5" cy="9.5" r="1.2" fill="currentColor"/><circle cx="14.5" cy="10" r="1.2" fill="currentColor"/><circle cx="12" cy="15" r="1.2" fill="currentColor"/></symbol>
<symbol id="i-horno" viewBox="0 0 24 24"><path d="M3 11a9 7 0 0118 0v8H3v-8z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8.5 19v-4a3.5 3.5 0 017 0v4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 8.5c0 1-1.3 1.4-1.3 2.4a1.3 1.3 0 002.6 0c0-1-1.3-1.4-1.3-2.4z" fill="currentColor"/></symbol>
<symbol id="i-moto" viewBox="0 0 24 24"><circle cx="5" cy="17" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="19" cy="17" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 17h8l-3.5-6H9M14 7h3l2 10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>
<symbol id="i-reloj" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7v5.5l3.5 2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></symbol>
<symbol id="i-euro" viewBox="0 0 24 24"><path d="M17 6.5A7 7 0 007 12a7 7 0 0010 5.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M4.5 10.5h8M4.5 14h8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></symbol>
<symbol id="i-carta" viewBox="0 0 24 24"><path d="M5 3h14v18H5z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></symbol>
<symbol id="i-pantalla" viewBox="0 0 24 24"><path d="M3 5h18v11H3z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9 20h6M12 16v4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M6.5 9h7M6.5 12.5h4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></symbol>
<symbol id="i-estrella" viewBox="0 0 24 24"><path d="M12 3l2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8L12 3z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>
<symbol id="i-chef" viewBox="0 0 24 24"><path d="M6 11a3.5 3.5 0 112-6.4 3.5 3.5 0 018 0A3.5 3.5 0 0118 11v1H6v-1z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M7 12v7h10v-7" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M7 15.5h10" fill="none" stroke="currentColor" stroke-width="1.5"/></symbol>
<symbol id="i-bolsa" viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6L5 8z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 8V6a3 3 0 016 0v2" fill="none" stroke="currentColor" stroke-width="1.7"/></symbol>
<symbol id="i-luna" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>
<symbol id="i-ticket" viewBox="0 0 24 24"><path d="M4 7h16v4a2 2 0 000 4v4H4v-4a2 2 0 000-4V7z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 9.5v5M12 9.5v5M15 9.5v5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-cruz" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></symbol>
<symbol id="i-mapa" viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="9.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/></symbol>
<symbol id="i-chat" viewBox="0 0 24 24"><path d="M4 5h16v10H9l-5 4V5z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8 9h8M8 12h5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></symbol>
<symbol id="i-lista" viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="4.5" cy="6" r="1.3" fill="currentColor"/><circle cx="4.5" cy="12" r="1.3" fill="currentColor"/><circle cx="4.5" cy="18" r="1.3" fill="currentColor"/></symbol>
<symbol id="i-grupo" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3 19a6 6 0 0112 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="17" cy="9" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M16 14.2A5 5 0 0121 19" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
<symbol id="i-ojo" viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/></symbol>
<symbol id="i-rayo" viewBox="0 0 24 24"><path d="M13 3L5 13h6l-1 8 8-10h-6l1-8z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>
<symbol id="i-candado" viewBox="0 0 24 24"><path d="M5 11h14v10H5z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 11V7.5a3.5 3.5 0 017 0V11" fill="none" stroke="currentColor" stroke-width="1.7"/></symbol>
</defs></svg>'''
