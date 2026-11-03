import sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

def texto_a_path(fuente, texto, x0, base, alto_x, ancho):
    f = TTFont(fuente); gs = f.getGlyphSet(); cmap = f.getBestCmap()
    xh = f["OS/2"].sxHeight or 500
    k = alto_x / xh
    natural = sum(gs[cmap[ord(c)]].width for c in texto)
    kx = ancho / natural
    pen = SVGPathPen(gs); x = 0
    for ch in texto:
        g = cmap[ord(ch)]
        gs[g].draw(TransformPen(pen, (kx, 0, 0, -k, x0 + x * kx, base)))
        x += gs[g].width
    # asta de la d prolongada hasta cruzar la flecha, como en el logo original
    pref = sum(gs[cmap[ord(c)]].width for c in texto[:-1])
    asta = (x0 + (pref + 300) * kx, (46) * kx, base - 643 * k + 1.5)
    return pen.getCommands(), asta

def logo(fuente, color="currentColor"):
    eje = 45.4
    s = []
    s.append('<rect x="38.9" y="2.3" width="3.8" height="94.5"/>')
    s.append('<rect x="52.8" y="18.6" width="3.8" height="76.5"/>')
    s.append(f'<rect x="24" y="{eje-1.25}" width="190" height="2.5"/>')
    # punta con barbas
    s.append(f'<path d="M238 {eje} L212 {eje-4.8} L218 {eje} L212 {eje+4.8} Z"/>')
    # plumas en zigzag
    s.append(f'<path d="M2.5 33 L29 {eje} L8.5 50 L27.5 51.5 M1 61.5 L27 52" fill="none" stroke="{color}" stroke-width="2.4" stroke-linejoin="miter" stroke-linecap="square"/>')
    letras, (ax, aw, atop) = texto_a_path(fuente, "ungceed", 64.5, 80, 23, 132)
    s.append(f'<path d="{letras}"/>')
    s.append(f'<rect x="{ax:.2f}" y="33" width="{aw:.2f}" height="{atop-33:.2f}"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 100" fill="{color}">' + "".join(s) + "</svg>"

if __name__ == "__main__":
    open(sys.argv[2], "w").write(logo(sys.argv[1], sys.argv[3] if len(sys.argv) > 3 else "#fff"))
