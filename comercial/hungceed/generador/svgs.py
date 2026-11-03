# -*- coding: utf-8 -*-
"""Dibujos y sprite de iconos de la propuesta de Hungceed. Todo a 600 px de
ancho como maximo: con el zoom de la hoja el ancho util son 614 px."""

NEGRO = "#0a0a0b"; ROJO = "#dc1f26"; HUMO = "#5c5d63"; HUESO = "#f4f4f5"; LINEA = "#e4e4e7"
BIEN = "#2E7D4F"; BIEN_F = "#EAF4EE"; MAL = "#8a8a92"; MAL_F = "#ececee"
FONT = 'font-family="Poppins, Arial, sans-serif"'


def n(x):
    return f"{x:.1f}"


def icono(nombre, x, y, size, color):
    return (f'<g transform="translate({n(x)},{n(y)})" color="{color}">'
            f'<use href="#{nombre}" width="{size}" height="{size}"/></g>')


def marker(idm, color):
    return (f'<marker id="{idm}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">'
            f'<path d="M0 0l10 5-10 5z" fill="{color}"/></marker>')


# ------------------------------------------------------------------ PORTADA
def portada_deco():
    """Un rack de linea con su barra, y la flecha de la marca saliendo por arriba."""
    s = ['<svg class="p-deco" viewBox="0 0 300 280" aria-hidden="true">']
    # postes con agujeros
    for x in (70, 230):
        s.append(f'<rect x="{x-9}" y="40" width="18" height="230" rx="3" fill="none" stroke="{NEGRO}" stroke-width="3"/>')
        for y in range(58, 262, 17):
            s.append(f'<circle cx="{x}" cy="{y}" r="3.2" fill="{NEGRO}"/>')
    s.append(f'<rect x="61" y="40" width="178" height="14" rx="3" fill="{NEGRO}"/>')
    s.append(f'<rect x="52" y="262" width="36" height="10" rx="3" fill="{NEGRO}"/><rect x="212" y="262" width="36" height="10" rx="3" fill="{NEGRO}"/>')
    # j-cups y barra con discos
    s.append(f'<rect x="79" y="150" width="22" height="12" rx="2" fill="{ROJO}"/><rect x="199" y="150" width="22" height="12" rx="2" fill="{ROJO}"/>')
    s.append(f'<rect x="20" y="146" width="260" height="7" rx="3.5" fill="{NEGRO}"/>')
    for x in (28, 44):
        s.append(f'<rect x="{x}" y="118" width="12" height="62" rx="3" fill="{NEGRO}"/>')
    for x in (244, 260):
        s.append(f'<rect x="{x}" y="118" width="12" height="62" rx="3" fill="{NEGRO}"/>')
    # barra de seguridad
    s.append(f'<rect x="79" y="206" width="142" height="8" rx="3" fill="{ROJO}" opacity=".9"/>')
    # flecha de la marca
    s.append(f'<path d="M190 96 L262 24" stroke="{ROJO}" stroke-width="10" stroke-linecap="square"/>')
    s.append(f'<path d="M214 24 H262 V72" fill="none" stroke="{ROJO}" stroke-width="10" stroke-linecap="square"/>')
    s.append('</svg>')
    return "".join(s)


# ------------------------------------------------------------------ LA CUENTA
def ecuacion():
    s = [f'<svg class="f" viewBox="0 0 600 112" role="img" aria-label="Cuenta de ejemplo del tiempo en WhatsApp"><g {FONT}>']
    s.append(f'<rect x="0" y="0" width="600" height="112" rx="6" fill="#fff" stroke="{LINEA}"/>')
    s.append(f'<circle cx="42" cy="56" r="25" fill="{HUESO}" stroke="{NEGRO}" stroke-width="1.4"/>')
    s.append(icono("i-chat", 30, 44, 24, NEGRO))
    s.append(f'<text x="78" y="50" font-size="25" font-weight="800" fill="{NEGRO}">30</text>')
    s.append(f'<text x="78" y="66" font-size="9.4" fill="{HUMO}">mensajes al día</text>')
    s.append(f'<text x="78" y="78" font-size="9.4" fill="{HUMO}">(dinos tu cifra)</text>')
    s.append(f'<text x="176" y="65" font-size="24" fill="{HUMO}" text-anchor="middle">×</text>')
    s.append(f'<circle cx="222" cy="56" r="25" fill="{HUESO}" stroke="{NEGRO}" stroke-width="1.4"/>')
    s.append(icono("i-reloj", 210, 44, 24, NEGRO))
    s.append(f'<text x="258" y="50" font-size="25" font-weight="800" fill="{NEGRO}">3 min</text>')
    s.append(f'<text x="258" y="66" font-size="9.4" fill="{HUMO}">cada respuesta,</text>')
    s.append(f'<text x="258" y="78" font-size="9.4" fill="{HUMO}">entre leer y contestar</text>')
    s.append(f'<text x="376" y="65" font-size="24" fill="{HUMO}" text-anchor="middle">=</text>')
    s.append(f'<rect x="400" y="12" width="188" height="88" rx="6" fill="#fdecec" stroke="{ROJO}" stroke-width="1.2"/>')
    s.append(f'<text x="494" y="50" font-size="26" font-weight="800" fill="{ROJO}" text-anchor="middle">30 h al mes</text>')
    s.append(f'<text x="494" y="70" font-size="9.8" fill="{NEGRO}" text-anchor="middle">contestando lo mismo</text>')
    s.append(f'<text x="494" y="84" font-size="9.8" fill="{HUMO}" text-anchor="middle">una hora y media al día</text>')
    s.append('</g></svg>')
    return "".join(s)


# ------------------------------------------------------------------ ANTES / DESPUES (catálogo)
def catalogo():
    s = [f'<svg class="f" viewBox="0 0 600 212" role="img" aria-label="El catálogo hoy y después"><defs>{marker("fc", ROJO)}</defs><g {FONT}>']
    # HOY: una lista larga y alfabética
    s.append(f'<rect x="0" y="0" width="262" height="212" rx="6" fill="{MAL_F}" stroke="{MAL}" stroke-width="1.2"/>')
    s.append(f'<text x="16" y="24" font-size="8.4" font-weight="800" fill="{MAL}" letter-spacing="2">HOY</text>')
    s.append(f'<text x="16" y="42" font-size="11.5" font-weight="700" fill="{NEGRO}">37 productos, de la A a la Z</text>')
    filas = ["Agarres cónicos para polea | Aluminio o Nylon | Par…", "Almacenamiento rotativo barras olímpicas | Sop…",
             "Asiento hip thrust para rack | Respaldo giratorio…", "Banco regulable triple ajuste ELITE | Banco ho…",
             "Barra olímpica 50mm | 1,8m y 2,20m | Diseño…", "Cables de polea para máquinas de gimnasio |…",
             "Doble soporte gancho para barra de pesas | Acc…", "Elevación lateral de hombros para rack | Acc…",
             "Enganche polea suspensión para rack | Abraza…", "…"]
    for i, f in enumerate(filas):
        y = 62 + i * 14.5
        s.append(f'<rect x="16" y="{y-9}" width="8" height="8" rx="1.5" fill="#fff" stroke="{MAL}"/>')
        s.append(f'<text x="30" y="{y}" font-size="7.4" fill="{HUMO}">{f}</text>')
    # flecha
    s.append(f'<path d="M272 106 H322" stroke="{ROJO}" stroke-width="2.4" marker-end="url(#fc)"/>')
    # DESPUES: seis categorías y filtros
    s.append(f'<rect x="338" y="0" width="262" height="212" rx="6" fill="#fff" stroke="{NEGRO}" stroke-width="1.4"/>')
    s.append(f'<text x="354" y="24" font-size="8.4" font-weight="800" fill="{ROJO}" letter-spacing="2">DESPUÉS</text>')
    s.append(f'<text x="354" y="42" font-size="11.5" font-weight="700" fill="{NEGRO}">Seis categorías y filtros</text>')
    cats = [("Racks y jaulas", "i-rack"), ("Máquinas", "i-maquina"), ("Attachment", "i-engranaje"),
            ("Bancos y barras", "i-barra"), ("Pesas", "i-pesa"), ("Poleas", "i-polea")]
    for i, (nom, ic) in enumerate(cats):
        cx = 354 + (i % 3) * 80
        cy = 54 + (i // 3) * 62
        s.append(f'<rect x="{cx}" y="{cy}" width="72" height="54" rx="4" fill="{HUESO}" stroke="{LINEA}"/>')
        s.append(icono(ic, cx + 26, cy + 8, 20, NEGRO))
        s.append(f'<text x="{cx+36}" y="{cy+45}" font-size="7.6" font-weight="700" fill="{NEGRO}" text-anchor="middle">{nom}</text>')
    y = 190
    for i, f in enumerate(("Serie", "Tipo", "Precio")):
        x = 354 + i * 60
        s.append(f'<rect x="{x}" y="{y-11}" width="52" height="16" rx="8" fill="{NEGRO}"/>')
        s.append(f'<text x="{x+26}" y="{y}" font-size="7.6" font-weight="700" fill="#fff" text-anchor="middle">{f} ▾</text>')
    s.append(f'<text x="540" y="{y}" font-size="7.4" fill="{HUMO}" text-anchor="middle">filtros</text>')
    s.append('</g></svg>')
    return "".join(s)


# ------------------------------------------------------------------ FLUJO DEL ASISTENTE
def tarjeta(x, y, w, h, fondo="#fff", borde=LINEA, r=6, grosor=1.2):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fondo}" stroke="{borde}" stroke-width="{grosor}"/>'


def flujo():
    s = [f'<svg class="f" viewBox="0 0 600 236" role="img" aria-label="Cómo contesta el asistente"><defs>{marker("ff", ROJO)}{marker("fg", HUMO)}</defs><g {FONT}>']
    # cliente
    s.append(tarjeta(0, 78, 118, 80, HUESO, LINEA))
    s.append(f'<circle cx="59" cy="104" r="16" fill="#fdecec"/>' + icono("i-chat", 50, 95, 18, ROJO))
    s.append(f'<text x="59" y="134" font-size="10" font-weight="700" fill="{NEGRO}" text-anchor="middle">Tu cliente</text>')
    s.append(f'<text x="59" y="147" font-size="8" fill="{HUMO}" text-anchor="middle">escribe por WhatsApp</text>')
    s.append(f'<path d="M118 118 H166" stroke="{ROJO}" stroke-width="2" marker-end="url(#ff)"/>')
    # asistente
    s.append(tarjeta(168, 62, 150, 112, "#fff", ROJO))
    s.append(f'<rect x="168" y="62" width="150" height="5" rx="2" fill="{ROJO}"/>')
    s.append(f'<text x="243" y="92" font-size="11.5" font-weight="800" fill="{NEGRO}" text-anchor="middle">El asistente</text>')
    for i, t in enumerate(("recuerda lo hablado", "contesta con tu info", "consulta el pedido", "y si no sabe, te avisa")):
        s.append(f'<circle cx="186" cy="{108+i*15}" r="2.4" fill="{ROJO}"/>')
        s.append(f'<text x="194" y="{111+i*15}" font-size="8.4" fill="{NEGRO}">{t}</text>')
    # fuentes
    fuentes = [(10, "Tu catálogo y tus chats", "series, envíos, gym", "i-carta"),
               (90, "WooCommerce", "estado del pedido", "i-bolsa"),
               (170, "Virtuagym", "socios y tarifas", "i-gym")]
    for y, t, sub, ic in fuentes:
        s.append(f'<path d="M318 {118} C 340 118, 340 {y+26}, 366 {y+26}" fill="none" stroke="{HUMO}" stroke-width="1.6" stroke-dasharray="3 3" marker-end="url(#fg)"/>')
        s.append(tarjeta(368, y, 128, 52, "#fff", LINEA))
        s.append(icono(ic, 378, y + 15, 20, ROJO))
        s.append(f'<text x="404" y="{y+22}" font-size="9" font-weight="700" fill="{NEGRO}">{t}</text>')
        s.append(f'<text x="404" y="{y+36}" font-size="7.8" fill="{HUMO}">{sub}</text>')
    # Jose
    s.append(f'<path d="M496 118 H546" stroke="{ROJO}" stroke-width="2" marker-end="url(#ff)"/>')
    s.append(tarjeta(548, 84, 52, 68, HUESO, LINEA))
    s.append(f'<circle cx="574" cy="106" r="12" fill="{ROJO}"/>' + icono("i-persona", 567, 99, 14, "#fff"))
    s.append(f'<text x="574" y="132" font-size="9.5" font-weight="700" fill="{NEGRO}" text-anchor="middle">Jose</text>')
    s.append(f'<text x="574" y="144" font-size="7" fill="{HUMO}" text-anchor="middle">solo lo que</text>')
    s.append(f'<text x="574" y="153" font-size="7" fill="{HUMO}" text-anchor="middle">le toca</text>')
    s.append(f'<text x="300" y="228" font-size="8.4" fill="{HUMO}" text-anchor="middle">Todo pasa por Make, con la API oficial de Meta. En tu móvil no cambia nada.</text>')
    s.append('</g></svg>')
    return "".join(s)


# ------------------------------------------------------------------ PASOS
def pasos():
    s = [f'<svg class="f" viewBox="0 0 600 150" role="img" aria-label="Cómo empezamos"><defs>{marker("fp", ROJO)}</defs><g {FONT}>']
    datos = [(100, "i-check", "Me das el sí", "Con el 50 % del desarrollo", "empiezo la copia de prueba"),
             (300, "i-ojo", "Lo ves nacer", "Entras cuando quieras y", "me dices qué cambiarías"),
             (500, "i-rayo", "Lo pasamos a real", "Cuando lo apruebes. Sin", "perder pedidos ni Google")]
    for i, (x, ic, t, l1, l2) in enumerate(datos):
        s.append(f'<circle cx="{x}" cy="44" r="30" fill="#fdecec"/>')
        s.append(icono(ic, x - 14, 30, 28, ROJO))
        s.append(f'<circle cx="{x+24}" cy="20" r="11" fill="{ROJO}"/>')
        s.append(f'<text x="{x+24}" y="24" font-size="11" font-weight="800" fill="#fff" text-anchor="middle">{i+1}</text>')
        s.append(f'<text x="{x}" y="100" font-size="12" font-weight="800" fill="{NEGRO}" text-anchor="middle">{t}</text>')
        s.append(f'<text x="{x}" y="116" font-size="9" fill="{HUMO}" text-anchor="middle">{l1}</text>')
        s.append(f'<text x="{x}" y="129" font-size="9" fill="{HUMO}" text-anchor="middle">{l2}</text>')
        if i < 2:
            s.append(f'<path d="M{x+40} 44 H{x+156}" stroke="{ROJO}" stroke-width="2" stroke-dasharray="4 4" marker-end="url(#fp)"/>')
    s.append('</g></svg>')
    return "".join(s)


SPRITE = '''<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="i-marca" viewBox="0 0 24 24"><path d="M5 19 19 5M9 5h10v10" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="square"/></symbol>
<symbol id="i-chat" viewBox="0 0 24 24"><path d="M4 5h16v10H9l-5 4V5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 9h8M8 12h5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
<symbol id="i-reloj" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5.5l3.5 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-euro" viewBox="0 0 24 24"><path d="M17 6.5A7 7 0 007 12a7 7 0 0010 5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4.5 10.5h8M4.5 14h8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-carta" viewBox="0 0 24 24"><path d="M5 3h14v18H5z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-bolsa" viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6L5 8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8V6a3 3 0 016 0v2" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-cruz" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></symbol>
<symbol id="i-ojo" viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
<symbol id="i-rayo" viewBox="0 0 24 24"><path d="M13 3L5 13h6l-1 8 8-10h-6l1-8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></symbol>
<symbol id="i-persona" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 21a8 8 0 0116 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-web" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-rack" viewBox="0 0 24 24"><path d="M6 3v18M18 3v18M6 5h12M4 21h4M16 21h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 12h18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></symbol>
<symbol id="i-maquina" viewBox="0 0 24 24"><path d="M5 21V8M5 8h8M13 8v5M9 13h8M17 13v8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="3" width="6" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
<symbol id="i-engranaje" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-barra" viewBox="0 0 24 24"><path d="M2 12h20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="5" y="7" width="3" height="10" rx="1" fill="currentColor"/><rect x="16" y="7" width="3" height="10" rx="1" fill="currentColor"/></symbol>
<symbol id="i-pesa" viewBox="0 0 24 24"><path d="M8 12h8" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="3" y="8" width="4" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="17" y="8" width="4" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
<symbol id="i-polea" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 7v12M16 7v9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="13" y="16" width="6" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
<symbol id="i-gym" viewBox="0 0 24 24"><path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
<symbol id="i-estrella" viewBox="0 0 24 24"><path d="M12 3l2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8L12 3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></symbol>
<symbol id="i-mano" viewBox="0 0 24 24"><path d="M7 11V6a1.5 1.5 0 013 0v5M10 10V4.5a1.5 1.5 0 013 0V11M13 10.5V6a1.5 1.5 0 013 0v7M16 12l2.2-1.6a1.4 1.4 0 011.8 2.1L15.5 18c-1 1.5-2.5 2.5-4.5 2.5-3.5 0-6-2.5-6-6v-2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-luna" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></symbol>
<symbol id="i-caja" viewBox="0 0 24 24"><path d="M3 8l9-4 9 4v9l-9 4-9-4V8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M3 8l9 4 9-4M12 12v9" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
<symbol id="i-edificio" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-casa" viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></symbol>
<symbol id="i-candado" viewBox="0 0 24 24"><path d="M5 11h14v10H5z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 11V7.5a3.5 3.5 0 017 0V11" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
<symbol id="i-campana" viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0112 0v5l2 2H4l2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 20a2 2 0 004 0" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
<symbol id="i-lista" viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="4.5" cy="6" r="1.3" fill="currentColor"/><circle cx="4.5" cy="12" r="1.3" fill="currentColor"/><circle cx="4.5" cy="18" r="1.3" fill="currentColor"/></symbol>
<symbol id="i-tel" viewBox="0 0 24 24"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 005 5L15 12l5 2v4a2 2 0 01-2 2A15 15 0 013 5a2 2 0 012-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></symbol>
<symbol id="i-flecha" viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
</defs></svg>'''
