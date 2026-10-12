# Dossier para Arroutada

Lo que se le enseña a David: como funciona el ciclo de un pedido, de la
llamada a la comanda en cocina. Sin precios de servicio, sin cuotas y sin
condiciones: eso se habla en persona, no en un papel.

- `noah.html` es la fuente. Se edita esto, nunca el PDF.
- `noah-arroutada.pdf` es lo que se envia.

Para volver a generarlo:

    chromium --headless --disable-gpu --no-pdf-header-footer \
      --print-to-pdf=noah-arroutada.pdf noah.html

Tiene que salir en **5 hojas**. Si salen 6, algo se desbordo: mira el
`zoom` de `.hoja` y los margenes de la hoja que se partio.

## Pendiente

Los precios de los platos del panel son **inventados**, y asi lo dice el
propio PDF debajo del recuadro. Las fuentes publicas no coinciden (la web
de Arroutada da 13,00 EUR la Clasica y Uber Eats 14,50 EUR). En cuanto
David pase la carta, se cambian por los suyos y se vuelve a generar.
