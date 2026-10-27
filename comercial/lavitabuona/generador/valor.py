# -*- coding: utf-8 -*-
"""Hoja de la cuenta: lo que cuesta una llamada frente a lo que deja un
pedido. Cifras de ejemplo, con las hipotesis escritas al pie de la hoja."""
from svgs import NEGRO, ACENTO, HUMO, FONT, icono

COSTE_LLAMADA = 0.50   # euros: dato real, una llamada de prueba de 5 min 53 s (unos 0,085 €/min)
PEDIDO_MEDIO = 30      # euros
DIAS_MES = 26          # cierran los lunes
ESCENARIOS = (1, 3, 5) # pedidos salvados al dia


def eur(x):
    return f"{x:,.0f}".replace(",", ".") + " €"


def balanza():
    s = [f'<svg class="f" viewBox="0 0 700 250" {FONT} role="img" aria-label="Una llamada cuesta 0,50 euros y un pedido deja 30">']
    # Izquierda: la moneda
    s.append('<rect x="8" y="20" width="250" height="210" rx="14" fill="#FBF6EC" stroke="#E6DCCB"/>')
    s.append('<circle cx="133" cy="92" r="30" fill="#fff" stroke="#CDBDA2" stroke-width="2"/>')
    s.append('<circle cx="133" cy="92" r="23" fill="none" stroke="#E6DCCB" stroke-width="1.4"/>')
    s.append(icono("i-tel", 121, 80, 24, HUMO))
    s.append(f'<text x="133" y="168" font-size="34" font-weight="bold" fill="{NEGRO}" text-anchor="middle">0,50 €</text>')
    s.append(f'<text x="133" y="191" font-size="10.5" fill="{HUMO}" text-anchor="middle">lo que cuesta que Noah</text>')
    s.append(f'<text x="133" y="205" font-size="10.5" fill="{HUMO}" text-anchor="middle">coja una llamada</text>')
    # Centro: el multiplicador
    s.append(f'<circle cx="350" cy="125" r="44" fill="{ACENTO}"/>')
    s.append(f'<text x="350" y="122" font-size="11" font-weight="bold" fill="{NEGRO}" text-anchor="middle" letter-spacing="1.2">DEJA</text>')
    s.append(f'<text x="350" y="148" font-size="30" font-weight="bold" fill="{NEGRO}" text-anchor="middle">×60</text>')
    s.append(f'<path d="M268 125 h30" stroke="#CDBDA2" stroke-width="2"/><path d="M402 125 h22" stroke="#CDBDA2" stroke-width="2"/><path d="M432 125 l-9 -5 v10z" fill="#CDBDA2"/>')
    # Derecha: el pedido
    s.append(f'<rect x="442" y="20" width="250" height="210" rx="14" fill="{NEGRO}"/>')
    s.append(f'<circle cx="567" cy="92" r="34" fill="#2A1D16" stroke="{ACENTO}" stroke-width="2"/>')
    s.append(icono("i-pizza", 550, 75, 34, ACENTO))
    s.append(f'<text x="567" y="168" font-size="44" font-weight="bold" fill="#fff" text-anchor="middle">30 €</text>')
    s.append(f'<text x="567" y="191" font-size="10.5" fill="#CDBFAE" text-anchor="middle">lo que te deja un pedido</text>')
    s.append(f'<text x="567" y="205" font-size="10.5" fill="#CDBFAE" text-anchor="middle">medio que no se pierde</text>')
    s.append('</svg>')
    return "".join(s)


def barras():
    """Ventas recuperadas al mes frente a lo que cuestan esas llamadas."""
    s = [f'<svg class="f" viewBox="0 0 700 250" {FONT} role="img" aria-label="Ventas recuperadas al mes">']
    maximo = ESCENARIOS[-1] * DIAS_MES * PEDIDO_MEDIO
    base_y, alto_max = 200, 160
    for i, n in enumerate(ESCENARIOS):
        x = 40 + i * 225
        ventas = n * DIAS_MES * PEDIDO_MEDIO
        coste = n * DIAS_MES * COSTE_LLAMADA
        h = alto_max * ventas / maximo
        hc = max(2.5, alto_max * coste / maximo)
        # barra de ventas
        s.append(f'<rect x="{x}" y="{base_y-h:.1f}" width="92" height="{h:.1f}" rx="6" fill="{ACENTO}"/>')
        s.append(f'<text x="{x+46}" y="{base_y-h-8:.1f}" font-size="15" font-weight="bold" fill="{NEGRO}" text-anchor="middle">{eur(ventas)}</text>')
        # barra de coste, al lado
        s.append(f'<rect x="{x+102}" y="{base_y-hc:.1f}" width="56" height="{hc:.1f}" rx="3" fill="#CDBDA2"/>')
        s.append(f'<text x="{x+130}" y="{base_y-hc-7:.1f}" font-size="11" font-weight="bold" fill="{HUMO}" text-anchor="middle">{eur(coste)}</text>')
        texto = "pedido salvado al día" if n == 1 else "pedidos salvados al día"
        s.append(f'<text x="{x+79}" y="{base_y+22}" font-size="11.5" font-weight="bold" fill="{NEGRO}" text-anchor="middle">{n} {texto}</text>')
    s.append(f'<line x1="20" y1="{base_y}" x2="680" y2="{base_y}" stroke="#E6DCCB"/>')
    # leyenda
    s.append(f'<rect x="200" y="236" width="11" height="11" rx="2" fill="{ACENTO}"/><text x="216" y="245" font-size="10" fill="{HUMO}">Ventas que recuperas al mes</text>')
    s.append(f'<rect x="400" y="236" width="11" height="11" rx="2" fill="#CDBDA2"/><text x="416" y="245" font-size="10" fill="{HUMO}">Lo que cuestan esas llamadas</text>')
    s.append('</svg>')
    return "".join(s)
