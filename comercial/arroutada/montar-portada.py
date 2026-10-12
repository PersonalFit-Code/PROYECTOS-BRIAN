#!/usr/bin/env python3
"""Mete una de las portadas sueltas dentro de noah.html.

    python3 montar-portada.py portada-3.html

La portada se diseño como un A4 independiente. Aqui pasa a ser la hoja 1 del
dossier, asi que hay dos cosas que hay que neutralizar para que no se pisen:

  - sus clases, que usan nombres genericos (.cierre, .fila, .celda) que el
    dossier ya usa para otra cosa: se renombran todas con el prefijo pf-, en el
    CSS y en el marcado a la vez. Sin esto, una regla del dossier le pinta
    encima a la portada y no te enteras hasta que lo miras con lupa: la
    primera vez, .cierre le puso un borde negro al filete dorado del pie.
  - sus selectores de etiqueta (h1, p, svg), que se acotan con .hoja-portada
    delante para que ganen a los del dossier por especificidad.
  - el zoom 1.18 de .hoja, que el dossier aplica a las hojas de contenido y la
    portada no espera: se le devuelve a 1.
"""
import re
import sys
from pathlib import Path

AQUI = Path(__file__).parent
DESTINO = AQUI / "noah.html"
INI, FIN = "<!-- PORTADA-INICIO -->", "<!-- PORTADA-FIN -->"


def trozos(css: str):
    """Parte una hoja de estilos en reglas de primer nivel."""
    fuera, hondo, inicio = [], 0, 0
    for i, c in enumerate(css):
        if c == "{":
            hondo += 1
        elif c == "}":
            hondo -= 1
            if hondo == 0:
                fuera.append(css[inicio:i + 1].strip())
                inicio = i + 1
    return [t for t in fuera if t]


def prefijar(selector: str) -> str:
    partes = []
    for s in selector.split(","):
        s = s.strip()
        if not s:
            continue
        if s in (":root", "html", "body"):
            # Las variables y lo que colgaba del body pasan a la hoja.
            partes.append(".hoja-portada")
        else:
            partes.append(f".hoja-portada {s}")
    return ", ".join(partes)


def acotar(css: str) -> str:
    salida = []
    for regla in trozos(css):
        if regla.startswith("@page"):
            continue  # el tamaño de pagina lo manda el dossier
        if regla.startswith("@media") or regla.startswith("@supports"):
            cabeza, cuerpo = regla.split("{", 1)
            salida.append(cabeza + "{" + acotar(cuerpo.rsplit("}", 1)[0]) + "}")
            continue
        if regla.startswith("@"):
            salida.append(regla)  # @font-face, @keyframes: tal cual
            continue
        selector, cuerpo = regla.split("{", 1)
        salida.append(prefijar(selector) + " {" + cuerpo)
    return "\n".join(salida)


PREFIJO = "pf-"


def clases_de(marcado: str) -> set:
    """Todas las clases que usa el marcado de la portada."""
    nombres = set()
    for m in re.finditer(r'class\s*=\s*"([^"]*)"', marcado):
        nombres.update(m.group(1).split())
    return nombres


def renombrar_css(css: str, nombres: set) -> str:
    if not nombres:
        return css
    patron = re.compile(r"\.(" + "|".join(sorted(map(re.escape, nombres), key=len, reverse=True)) + r")\b")
    return patron.sub(lambda m: "." + PREFIJO + m.group(1), css)


def renombrar_marcado(marcado: str, nombres: set) -> str:
    def cambia(m):
        clases = " ".join(PREFIJO + c if c in nombres else c for c in m.group(1).split())
        return f'class="{clases}"'
    return re.sub(r'class\s*=\s*"([^"]*)"', cambia, marcado)


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    origen = AQUI / sys.argv[1]
    if not origen.exists():
        print(f"No encuentro {origen}")
        return 1

    portada = origen.read_text(encoding="utf-8")
    dossier = DESTINO.read_text(encoding="utf-8")

    estilos = "\n".join(
        m.group(1) for m in re.finditer(r"<style[^>]*>(.*?)</style>", portada, re.S)
    )
    cuerpo = re.search(r"<body[^>]*>(.*?)</body>", portada, re.S)
    if not cuerpo:
        print("La portada no tiene <body>")
        return 1

    nombres = clases_de(cuerpo.group(1))
    estilos = renombrar_css(estilos, nombres)
    marcado = renombrar_marcado(cuerpo.group(1).strip(), nombres)

    bloque = (
        f"{INI}\n"
        "<style>\n"
        "  /* --- portada, importada de " + origen.name + " --- */\n"
        "  .hoja-portada { zoom: 1; }\n"
        + acotar(estilos).rstrip()
        + "\n</style>\n"
        '<div class="hoja hoja-portada">\n'
        + marcado
        + f"\n</div>\n{FIN}"
    )

    a, b = dossier.index(INI), dossier.index(FIN) + len(FIN)
    DESTINO.write_text(dossier[:a] + bloque + dossier[b:], encoding="utf-8")
    print(f"Montada {origen.name} como hoja 1 de noah.html")
    print(f"   clases renombradas con {PREFIJO}: {', '.join(sorted(nombres))}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
