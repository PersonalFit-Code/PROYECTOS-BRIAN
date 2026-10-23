# -*- coding: utf-8 -*-
"""Monta noah.html a partir de css.part, paginas.part y los dibujos de svgs2.py.

    python3 generador/montar.py

Sobrescribe ../noah.html. Se edita AQUI (textos en paginas.part, estilos en
css.part, dibujos en svgs2.py), nunca el noah.html a mano.
"""
import pathlib
import sys

base = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(base))
import svgs  # noqa: E402  (el sprite de iconos y los helpers)
import svgs2 as S2  # noqa: E402

css = (base / "css.part").read_text()
pag = (base / "paginas.part").read_text()
for clave, fn in (("PIZZA", S2.pizza), ("RUEDA", S2.rueda), ("DOLOR", S2.dolor),
                  ("ECUACION", S2.ecuacion), ("COMPARATIVA", S2.comparativa),
                  ("CIRCULOS", S2.circulos), ("PROPONGO", S2.propongo)):
    marca = "{{" + clave + "}}"
    assert marca in pag, clave
    pag = pag.replace(marca, fn())

html = ('<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
        '<title>Noah para La Vita Buona</title>\n<style>\n' + css +
        '</style>\n</head>\n<body>\n' + svgs.SPRITE + '\n' + pag + '\n</body>\n</html>\n')
destino = base.parent / "noah.html"
destino.write_text(html)
print("noah.html:", len(html), "bytes")
