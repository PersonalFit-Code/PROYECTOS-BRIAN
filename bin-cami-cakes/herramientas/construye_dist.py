# -*- coding: utf-8 -*-
"""Genera dist/ a partir de index.html y mostrador.html.

Se perdió con el contenedor el 19/10 y se reescribió el 21/10 a partir del
dist/ que ya estaba publicado, comprobando que lo reproduce BYTE A BYTE antes
de usarlo para nada (ver comprueba()).

Qué hace, y por qué cada cosa:

  1. Quita el <script> del CDN de Tailwind y el <script> con tailwind.config,
     que sin el CDN no pinta nada, y mete en su lugar el Tailwind ya compilado
     dentro de un <style>. Así la web publicada no pide nada a un tercero: lo
     dice la política de cookies y tiene que seguir siendo verdad.

  2. Calcula el sha256 de CADA script en línea de LAS DOS páginas y los mete
     en la cabecera Content-Security-Policy. Esto es lo delicado: si un script
     cambia y el hash no se recalcula, el navegador lo bloquea y la mitad de
     la web deja de funcionar sin dar error visible. Por eso esto NO se toca a
     mano nunca.

  3. Escribe vercel.json con esa CSP y el resto de cabeceras de seguridad.

Uso:  python3 construye_dist.py            -> genera dist/
      python3 construye_dist.py --comprueba -> sólo dice si reproduce lo que hay
"""
import base64, hashlib, io, json, os, re, shutil, sys

RAIZ = os.environ.get(
    'BCC_RAIZ',
    '/tmp/claude-0/-home-user-PROYECTOS-BRIAN/d7665f70-4d9f-5163-b58b-425a0e474909'
    '/scratchpad/bcc/bin-cami-cakes')
PAGINAS = ('index.html', 'mostrador.html')

# El rótulo es distinto en cada página porque así estaba en el dist/ publicado,
# y se respeta para que comprueba() pueda exigir igualdad byte a byte.
ROTULO = {
    'index.html': ('<!-- Tailwind ya compilado (construye_dist.py); '
                   'el CDN sólo en el index.html de trabajo -->'),
    'mostrador.html': '<!-- Tailwind ya compilado (construye_dist.py) -->',
}

# El CDN y el objeto de configuración van juntos y se van juntos.
CDN = re.compile(
    r'<script src="https://cdn\.tailwindcss\.com[^"]*"></script>\n'
    r'<script>\n  tailwind\.config = \{.*?\n</script>\n', re.S)

CABECERAS = [
    ('X-Content-Type-Options', 'nosniff'),
    ('X-Frame-Options', 'DENY'),
    ('Referrer-Policy', 'strict-origin-when-cross-origin'),
    ('Permissions-Policy',
     'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()'),
    ('Strict-Transport-Security', 'max-age=31536000; includeSubDomains'),
    ('Cross-Origin-Opener-Policy', 'same-origin'),
]


def tailwind_compilado(raiz):
    """El CSS de Tailwind, sacado del dist/ que ya hay.

    No se recompila con el CLI a propósito: el que está publicado es el que se
    sabe que funciona, y una compilación distinta podría mover píxeles sin que
    nadie lo pidiera. Si algún día hace falta una utilidad de Tailwind que no
    esté, hay que recompilar de verdad (npx tailwindcss) y volver a mirar la
    web entera, no parchear esto.
    """
    d = io.open(os.path.join(raiz, 'dist', 'index.html'), encoding='utf-8').read()
    bloques = re.findall(r'<style[^>]*>(.*?)</style>', d, re.S)
    tw = [t for t in bloques if '--tw-' in t and 'cabecera-capsula' not in t]
    assert len(tw) == 1, 'no identifico el Tailwind compilado (%d candidatos)' % len(tw)
    return tw[0]


def compila(origen, tw, rotulo):
    # La sustitución va como FUNCIÓN y no como plantilla: el CSS de Tailwind
    # lleva escapes de CSS tipo \2026 y re los tomaba por referencias de grupo
    # («invalid group reference 2»).
    reemplazo = rotulo + '\n<style>' + tw + '</style>\n'
    nuevo, n = CDN.subn(lambda m: reemplazo, origen)
    assert n == 1, 'esperaba 1 bloque de Tailwind que sustituir, encontre %d' % n
    return nuevo


def hashes(paginas):
    """sha256 de cada script en línea de todas las páginas, sin repetir."""
    hs = set()
    for s in paginas:
        for attr, cuerpo in re.findall(r'<script([^>]*)>(.*?)</script>', s, re.S):
            if 'src' in attr:
                raise AssertionError('queda un script externo: ' + attr.strip()[:80])
            hs.add(base64.b64encode(hashlib.sha256(cuerpo.encode('utf-8')).digest()).decode())
    return sorted(hs)


def vercel_json(hs):
    csp = ("default-src 'self'; script-src "
           + ' '.join("'sha256-%s'" % h for h in hs)
           + "; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';"
             " connect-src 'self'; frame-src https://maps.google.com https://www.google.com;"
             " form-action 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none';"
             " upgrade-insecure-requests")
    cab = [{'key': 'Content-Security-Policy', 'value': csp}]
    cab += [{'key': k, 'value': v} for k, v in CABECERAS]
    return json.dumps({'cleanUrls': True, 'trailingSlash': False,
                       'headers': [{'source': '/(.*)', 'headers': cab}]},
                      ensure_ascii=False, indent=2) + '\n'


def construye(raiz=RAIZ, escribir=True):
    tw = tailwind_compilado(raiz)
    salidas = {}
    for p in PAGINAS:
        salidas[p] = compila(io.open(os.path.join(raiz, p), encoding='utf-8').read(), tw, ROTULO[p])
    vj = vercel_json(hashes(salidas.values()))
    if escribir:
        dist = os.path.join(raiz, 'dist')
        for p, s in salidas.items():
            io.open(os.path.join(dist, p), 'w', encoding='utf-8').write(s)
        io.open(os.path.join(dist, 'vercel.json'), 'w', encoding='utf-8').write(vj)
        destino = os.path.join(dist, 'assets')
        if os.path.exists(destino):
            shutil.rmtree(destino)
        shutil.copytree(os.path.join(raiz, 'assets'), destino)
        print('dist/ generado: %s + vercel.json + %d assets'
              % (', '.join(PAGINAS), len(os.listdir(destino))))
    return salidas, vj


def comprueba(raiz=RAIZ):
    """¿Reproduce exactamente el dist/ que hay en disco? Devuelve True/False."""
    salidas, vj = construye(raiz, escribir=False)
    bien = True
    for p, s in salidas.items():
        hay = io.open(os.path.join(raiz, 'dist', p), encoding='utf-8').read()
        igual = (hay == s)
        bien &= igual
        print('  %-16s %s' % (p, 'idéntico' if igual else
                              'DISTINTO (%d vs %d bytes)' % (len(hay), len(s))))
    hay = io.open(os.path.join(raiz, 'dist', 'vercel.json'), encoding='utf-8').read()
    igual = (hay.strip() == vj.strip())
    bien &= igual
    print('  %-16s %s' % ('vercel.json', 'idéntico' if igual else 'DISTINTO'))
    return bien


if __name__ == '__main__':
    if '--comprueba' in sys.argv:
        print('¿reproduce el dist/ publicado?')
        sys.exit(0 if comprueba() else 1)
    construye()
