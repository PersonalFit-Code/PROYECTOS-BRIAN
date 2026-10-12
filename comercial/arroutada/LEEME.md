# Dossier para Arroutada

Lo que se le enseña a David: como funciona el ciclo de un pedido, de la
llamada a la comanda en cocina. Sin precios de servicio, sin cuotas y sin
condiciones: eso se habla en persona, no en un papel que se reenvia.

- `noah.html` es la fuente. Se edita esto, nunca el PDF.
- `noah-arroutada.pdf` es lo que se envia.
- `portadas/` guarda la portada en uso y las tres descartadas.
- `montar-portada.py` cambia la portada sin tocar el resto.

Para volver a generarlo:

    chromium --headless --disable-gpu --no-pdf-header-footer \
      --print-to-pdf=noah-arroutada.pdf noah.html

Tienen que salir **6 hojas**: portada, el problema, el ciclo, la llamada,
el panel y lo practico.

## Cambiar de portada

    python3 montar-portada.py portadas/alternativa-ilustrada.html

Sustituye la hoja 1 entre las marcas `PORTADA-INICIO` y `PORTADA-FIN` de
`noah.html`. Al importarla le renombra las clases con el prefijo `pf-`,
porque si no una regla del dossier le pinta encima sin avisar: la primera
vez, `.cierre` (el recuadro del cierre de la ultima hoja) le puso un borde
negro al filete dorado del pie de la portada.

Cualquier portada nueva vale, siempre que su hoja sea un unico `<div>` y
**no se salga de los margenes**. Ver abajo por que eso importa tanto.

## Dos trampas de maquetacion que ya han mordido

**Si algo se sale de ancho, Chromium encoge el documento entero.** La
portada antigua tenia margenes negativos y se iba 5mm por cada lado; sin
decir nada, el navegador reducia todas las hojas un 4% para que cupiera.
Todo encajaba... por accidente. Al poner una portada que respeta los
margenes, el documento volvio a su tamaño real y cuatro hojas se
desbordaron de golpe. Si un dia aparecen hojas de mas sin haber tocado el
texto, lo primero que hay que mirar es si algun elemento se sale de los
182mm utiles.

**El ajuste fino se hace con el `zoom` de `.hoja`.** Esta en 1.08. Subirlo
llena mas la hoja y bajarlo la vacia, pero pasado 1.09 el pie de alguna
hoja se va a la siguiente pagina. Despues de tocarlo hay que volver a
generar y contar las paginas.

## Pendiente

Los precios de los platos del panel son **inventados**, y asi lo dice el
propio PDF debajo del recuadro. Las fuentes publicas no coinciden (la web
de Arroutada da 13,00 EUR la Clasica y Uber Eats 14,50 EUR). En cuanto
David pase la carta, se cambian por los suyos y se vuelve a generar.
