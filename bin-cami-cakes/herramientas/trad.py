# -*- coding: utf-8 -*-
"""Añade o cambia claves del diccionario de idiomas del index.html.

El diccionario vive en una sola línea dentro de un <script>, como JSON. Aquí se
lee, se modifica y se vuelve a volcar con el mismo escape de '</' que usaba el
original (si no, un '</span>' dentro de una cadena cierra el <script>).

Uso:  import trad;  trad.mete({'gl': {...}, 'en': {...}, 'pt': {...}})
"""
import io, json, os, re

# Por defecto, el index.html del proyecto en el que vive este script.
RUTA = os.environ.get('BCC_INDEX', os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'index.html'))
PATRON = re.compile(r'(  var TRAD = )(\{.*?\})(;\n)', re.S)


def mete(nuevas, ruta=RUTA):
    s = io.open(ruta, encoding='utf-8').read()
    m = PATRON.search(s)
    assert m, 'no se encontro el diccionario TRAD'
    d = json.loads(m.group(2))
    for lang, pares in nuevas.items():
        assert lang in d, 'idioma desconocido: %s' % lang
        d[lang].update(pares)
    volcado = json.dumps(d, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    s = s[:m.start()] + m.group(1) + volcado + m.group(3) + s[m.end():]
    io.open(ruta, 'w', encoding='utf-8').write(s)
    print('claves por idioma: %s' % {k: len(v) for k, v in d.items()})


def falta(ruta=RUTA):
    """Lista las claves data-i18n del HTML que no estan en algun idioma."""
    s = io.open(ruta, encoding='utf-8').read()
    d = json.loads(PATRON.search(s).group(2))
    usadas = set(re.findall(r'data-i18n(?:-aria)?="([^"]+)"', s))
    for lang in d:
        huecos = sorted(k for k in usadas if k not in d[lang])
        print('%s: faltan %d -> %s' % (lang, len(huecos), ', '.join(huecos) or 'ninguna'))
