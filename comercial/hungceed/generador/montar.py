# -*- coding: utf-8 -*-
"""Monta ../propuesta.html a partir de css.part, paginas.part y los dibujos de svgs.py.

    python3 generador/montar.py

Se edita AQUI (textos en paginas.part, estilos en css.part, dibujos en svgs.py), nunca el
propuesta.html a mano.
"""
import base64
import pathlib
import sys

base = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(base))
import svgs as S  # noqa: E402
import dibujos as D  # noqa: E402

css = (base / "css.part").read_text()
pag = (base / "paginas.part").read_text()
for clave, fn in (("PORTADA_DECO", S.portada_deco), ("ECUACION", S.ecuacion), ("CATALOGO", S.catalogo),
                  ("FLUJO", S.flujo), ("PASOS", S.pasos),
                  ("DOLOR", D.dolor), ("WEB_ANOTADA", D.web_anotada),
                  ("TIENDA_HOY", D.tienda_hoy), ("TIENDA_DESPUES", D.tienda_despues),
                  ("WA_HOY", D.whatsapp_hoy), ("WA_DESPUES", D.whatsapp_despues),
                  ("GYM_HOY", D.gym_hoy), ("GYM_DESPUES", D.gym_despues),
                  ("AUTO_HOY", D.auto_hoy), ("AUTO_DESPUES", D.auto_despues)):
    marca = "{{" + clave + "}}"
    if marca in pag:
        pag = pag.replace(marca, fn())

for nombre in ("personalfit", "tixola", "bincami"):
    datos = base64.b64encode((base / "clientes" / f"{nombre}.png").read_bytes()).decode()
    marca = "{{LOGO_" + nombre + "}}"
    assert marca in pag, nombre
    pag = pag.replace(marca, f'<img src="data:image/png;base64,{datos}" alt="{nombre}">')

html = ('<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
        '<title>Propuesta para Hungceed</title>\n<style>\n' + css +
        '</style>\n</head>\n<body>\n' + S.SPRITE + '\n' + pag + '\n</body>\n</html>\n')
destino = base.parent / "propuesta.html"
destino.write_text(html)
print("propuesta.html:", len(html), "bytes")
