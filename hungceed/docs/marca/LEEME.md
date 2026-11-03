# Logotipo de Hungceed (vector)

Hoy el logo de hungceed.es es una captura de pantalla de 137 × 54 px. Este es el mismo dibujo
rehecho en vector: la H con dos barras, la flecha que la cruza (plumas a la izquierda, punta a la
derecha, el asta de la «d» subiendo hasta la flecha) y «ungceed» en gótica estrecha.

- `public/marca/hungceed-negro.svg` y `hungceed-blanco.svg`: listos para usar (web, WordPress, imprenta).
- `src/components/ui/Logo.tsx`: el mismo dibujo en la web, en `currentColor`.
- `generar-logo.py` + `GrenzeGotisch-Light.ttf` (Google Fonts, licencia OFL): las letras se pasan a
  trazos, así que el SVG no necesita la fuente instalada.

    pip install fonttools
    python3 generar-logo.py GrenzeGotisch-Light.ttf salida.svg "#0a0a0b"

Pendiente: que Jose confirme si tiene el original en vector (AI, PDF o SVG); si lo tiene, se usa
ese y esto queda como respaldo.
