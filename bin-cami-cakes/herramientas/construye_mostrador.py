# -*- coding: utf-8 -*-
"""Genera mostrador.html a partir de index.html + catalogo-cuerpo.html.

Se perdió con el contenedor el 19/10 y se reescribió el 21/10 a partir del
mostrador.html que ya estaba en el repositorio, comprobando que lo reproduce
BYTE A BYTE antes de usarlo (ver comprueba()).

La idea: el mostrador es la MISMA página que la portada —misma cabecera, mismo
menú, mismo pie, mismo CSS y mismo JS— con otro <main> dentro. Por eso se
genera en vez de mantenerse a mano: cualquier arreglo en la portada llega aquí
solo. Lo que cambia:

  1. El <main> entero, que viene de catalogo-cuerpo.html.
  2. Título, descripción y etiquetas de compartir.
  3. Las anclas de secciones que sólo existen en la portada (#galeria,
     #contacto…) pasan a index.html#… Las legales (#privacidad, #cookies,
     #aviso-legal) NO, porque esas secciones están también en esta página; ni
     las del sprite de iconos (#ic-…), que son referencias internas del SVG.
  4. El enlace «Mostrador» de la cabecera se marca como página actual.

Uso:  python3 construye_mostrador.py            -> genera mostrador.html
      python3 construye_mostrador.py --comprueba -> sólo dice si lo reproduce
"""
import io, os, re, sys

# Por defecto, el proyecto en el que vive este script (la carpeta de arriba).
# Antes apuntaba a una copia en el scratchpad y, si se olvidaba BCC_RAIZ,
# construía allí sin avisar en vez de en el repositorio.
AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.environ.get('BCC_RAIZ', os.path.dirname(AQUI))
CUERPO = os.environ.get('BCC_CUERPO', os.path.join(AQUI, 'catalogo-cuerpo.html'))

# Secciones que viven SÓLO en la portada: desde el mostrador hay que ir allí.
SECCIONES = ('inicio', 'especialidades', 'venezolana', 'nosotras', 'galeria',
             'video', 'opiniones', 'encargar', 'contacto')


def corta(s, viejo, nuevo, veces=1):
    hay = s.count(viejo)
    assert hay == veces, 'ancla x%d (esperaba %d): %r' % (hay, veces, viejo[:80])
    return s.replace(viejo, nuevo)


def construye(raiz=RAIZ, cuerpo=CUERPO, escribir=True):
    s = io.open(os.path.join(raiz, 'index.html'), encoding='utf-8').read()
    main = io.open(cuerpo, encoding='utf-8').read()

    s = corta(s, '<html lang="es-ES">',
              '<!-- GENERADO: no editar a mano. Sale de index.html + catalogo-cuerpo.html\n'
              '     con construye_mostrador.py. Lo que se toque aqui se pierde. -->\n'
              '<html lang="es-ES" data-titulo="mos.titulo">')
    s = corta(s, '<title>Tartas Personalizadas en Ourense | Bin &amp; Cami Cakes</title>',
              '<title>Nuestro mostrador · tartas y dulces del día | Bin &amp; Cami Cakes</title>')
    s = re.sub(r'<meta name="description" content="[^"]*">',
               '<meta name="description" content="Lo que hay hoy en el mostrador de Bin &amp; Cami Cakes, '
               'en Ourense: tres leches, golfeados, piñitas y cookies, con sus ingredientes '
               'y sus alérgenos.">', s, count=1)
    s = corta(s, '<meta property="og:url" content="https://bin-cami-cakes.vercel.app/">',
              '<meta property="og:url" content="https://bin-cami-cakes.vercel.app/mostrador">')
    s = corta(s, '<meta property="og:title" content="Tartas Personalizadas en Ourense | Bin &amp; Cami Cakes">',
              '<meta property="og:title" content="Nuestro mostrador | Bin &amp; Cami Cakes">')

    # El <main> entero
    i = s.index('<main'); j = s.index('</main>') + len('</main>')
    s = s[:i] + main + s[j:]

    # Las anclas de la portada, sólo fuera del <main> (dentro no hay ninguna de
    # éstas, pero se parte igual para no tocar el cuerpo del catálogo por error)
    i = s.index('<main'); j = s.index('</main>') + len('</main>')
    cab, med, col = s[:i], s[i:j], s[j:]
    for sec in SECCIONES:
        cab = cab.replace('href="#%s"' % sec, 'href="index.html#%s"' % sec)
        col = col.replace('href="#%s"' % sec, 'href="index.html#%s"' % sec)
    s = cab + med + col

    s = corta(s, '<a href="mostrador.html"  class="nav-enlace" data-i18n="nav.mostrador">',
              '<a href="mostrador.html"  class="nav-enlace" aria-current="page" data-i18n="nav.mostrador">')

    # el botón «Mostrador» de la cabecera y su pestaña del móvil (26/10)
    s = corta(s, '<a href="mostrador.html" class="cab-mostrador" data-salida="mostrador">',
              '<a href="mostrador.html" class="cab-mostrador" aria-current="page">')
    s = corta(s, '<a href="mostrador.html" class="tab tab-mostrador" data-salida="mostrador">',
              '<a href="mostrador.html" class="tab tab-mostrador" aria-current="page">')

    if escribir:
        destino = os.path.join(raiz, 'mostrador.html')
        io.open(destino, 'w', encoding='utf-8').write(s)
        print('mostrador.html: %d KB' % (len(s) // 1024))
    return s


def comprueba(raiz=RAIZ, cuerpo=CUERPO):
    mio = construye(raiz, cuerpo, escribir=False)
    hay = io.open(os.path.join(raiz, 'mostrador.html'), encoding='utf-8').read()
    igual = (hay == mio)
    print('  mostrador.html   %s' % ('idéntico' if igual else
                                     'DISTINTO (%d vs %d bytes)' % (len(hay), len(mio))))
    return igual


if __name__ == '__main__':
    if '--comprueba' in sys.argv:
        print('¿reproduce el mostrador.html que hay?')
        sys.exit(0 if comprueba() else 1)
    construye()
