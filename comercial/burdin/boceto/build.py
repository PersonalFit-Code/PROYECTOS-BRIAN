#!/usr/bin/env python3
"""Genera las páginas secundarias a partir de index.html.
Ejecutar después de cada cambio en index.html:  python3 build.py
Cada página es una copia con <body data-page="…">: el CSS muestra solo su apartado."""
import os,re
here=os.path.dirname(os.path.abspath(__file__))
src=open(os.path.join(here,'index.html'),encoding='utf-8').read()
PAGES={'tarifas':'Tarifas','maquinas':'Las máquinas','gimnasio':'El gimnasio','fundador':'Socio fundador','contacto':'Contacto'}
for slug,title in PAGES.items():
    out=src.replace('<body data-page=""','<body data-page="%s"'%slug,1)
    out=out.replace('<title>Burdin Gym</title>','<title>%s · Burdin Gym</title>'%title,1)
    out='<!-- GENERADO por build.py a partir de index.html: no editar a mano -->\n'+out
    d=os.path.join(here,slug);os.makedirs(d,exist_ok=True)
    open(os.path.join(d,'index.html'),'w',encoding='utf-8').write(out)
    print('→',slug+'/index.html')
