# -*- coding: utf-8 -*-
"""Genera los PDF de neuro·node a partir de las fuentes .src.html.

    python3 generar.py                    # todos
    python3 generar.py clientes/x/*.src.html   # solo esos

Cada fuente empieza con una cabecera de datos y después el cuerpo en HTML:

    ---
    titulo: Propuesta de automatización
    tipo: Propuesta
    cliente: Clínica Ejemplo
    fecha: Noviembre de 2026
    ---
    <section class="portada">…

En el cuerpo se pueden usar {{cliente}}, {{fecha}}, {{titulo}}, {{tipo}} y {{recursos}} (la
ruta a recursos/). La cabecera (isotipo + neuro·node + tipo de documento) y el pie
(web · correo · CONFIDENCIAL) los pone este script en todas las páginas.
"""
import glob
import os
import pathlib
import re
import subprocess
import sys
import base64

BASE = pathlib.Path(__file__).resolve().parent
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

PLANTILLA = """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>{titulo} · neuro·node</title>
<link rel="stylesheet" href="{recursos}/marca.css">
</head>
<body class="{formato}">
<style>{pagina}@page {{ @top-left {{ content: {logo}; }} @top-right {{ content: "{tipo_mayus}"; }} }}</style>
{cuerpo}
</body>
</html>
"""


def logo_cabecera() -> str:
    """Isotipo + logotipo en data URI: los márgenes de página de Chrome solo pintan imágenes
    incrustadas. Con image-set a 5x el PNG (657 × 113 px) queda a unos 35 × 6 mm."""
    png = base64.b64encode((BASE / "recursos" / "cabecera-logo.png").read_bytes()).decode()
    return f'image-set(url("data:image/png;base64,{png}") 5x)'


def laminas(cuerpo: str) -> str:
    """Formato horizontal: cada <h2> abre una lámina (una página). El título y su primer
    párrafo van a la columna izquierda; el resto, a la derecha."""
    partes = re.split(r"(?=<h2[ >])", cuerpo)
    salida = [partes[0]]
    for parte in partes[1:]:
        parte = re.sub(r'<h2 class="saltar">', "<h2>", parte)
        m = re.match(r"(<h2.*?</h2>\s*(?:<p>.*?</p>)?)(.*)", parte, re.S)
        izq, der = m.group(1), m.group(2)
        salida.append(f'<section class="lamina"><div class="izq">{izq}</div><div class="der">{der}</div></section>\n')
    return "".join(salida)


def generar(fuente: pathlib.Path) -> pathlib.Path:
    texto = fuente.read_text(encoding="utf-8")
    m = re.match(r"---\n(.*?)\n---\n(.*)", texto, re.S)
    if not m:
        raise SystemExit(f"{fuente}: falta la cabecera --- … ---")
    datos = dict(re.findall(r"^(\w+):\s*(.*)$", m.group(1), re.M))
    datos.setdefault("tipo", "Documento")
    datos.setdefault("titulo", fuente.stem)
    datos["recursos"] = os.path.relpath(BASE / "recursos", fuente.parent)
    cuerpo = m.group(2)
    datos.setdefault("formato", "vertical")
    if datos["formato"] == "horizontal":
        cuerpo = laminas(cuerpo)
    for k, v in datos.items():
        cuerpo = cuerpo.replace("{{" + k + "}}", v)
    html = PLANTILLA.format(cuerpo=cuerpo, tipo_mayus=datos["tipo"].upper(), logo=logo_cabecera(),
                           pagina="@page { size: A4 landscape; } " if datos["formato"] == "horizontal" else "", **datos)
    salida_html = fuente.with_name(fuente.name.replace(".src.html", ".html"))
    salida_html.write_text(html, encoding="utf-8")
    salida_pdf = salida_html.with_suffix(".pdf")
    subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-sandbox", "--no-pdf-header-footer",
                    "--allow-file-access-from-files", f"--print-to-pdf={salida_pdf}", str(salida_html)],
                   check=True, capture_output=True)
    return salida_pdf


if __name__ == "__main__":
    fuentes = [pathlib.Path(a).resolve() for a in sys.argv[1:]] or sorted(
        pathlib.Path(p) for p in glob.glob(str(BASE / "**/*.src.html"), recursive=True))
    for f in fuentes:
        pdf = generar(f)
        paginas = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True).stdout
        n = re.search(r"Pages:\s+(\d+)", paginas)
        print(f"{pdf.relative_to(BASE)}  ({n.group(1) if n else '?'} págs.)")
