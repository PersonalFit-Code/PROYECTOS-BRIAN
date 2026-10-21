# -*- coding: utf-8 -*-
"""Sirve dist/ con las cabeceras de verdad de vercel.json.

Sin esto, probar dist/ con un http.server normal no dice nada: la CSP es
justo lo que puede tumbar la web, y sólo aparece si alguien la manda.
Relee vercel.json en cada peticion, que si no se queda con el de hace dos
construcciones y la prueba miente.
Uso: python3 servidor_csp.py [puerto] [carpeta]
"""
import http.server, json, os, sys

CARPETA = sys.argv[2] if len(sys.argv) > 2 else '.'
VJ = os.path.join(CARPETA, 'vercel.json')


class Con(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=CARPETA, **k)

    def end_headers(self):
        try:
            for h in json.load(open(VJ))['headers'][0]['headers']:
                self.send_header(h['key'], h['value'])
        except Exception as e:
            sys.stderr.write('vercel.json: %s\n' % e)
        super().end_headers()

    def log_message(self, *a):
        pass


http.server.HTTPServer(('127.0.0.1', int(sys.argv[1] if len(sys.argv) > 1 else 8780)), Con).serve_forever()
