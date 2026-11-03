# Propuesta para Hungceed (Jose)

Lo que se le manda a Jose: `propuesta-hungceed.pdf`, **9 hojas**, al estilo del dossier de
Noah para La Vita Buona: poco texto, dibujos, el dolor primero y una carta de servicios para
que elija.

- `propuesta.html` se **genera**: no se edita a mano.
- `generador/` es donde se edita: textos en `paginas.part`, estilos en `css.part`, la escena
  de portada (jaula con polea en perspectiva, aviso de pedido y WhatsApp) en `portada.py`, dibujos
  básicos ( la cuenta, el flujo del asistente, los pasos) en `svgs.py` y los
  de problema → solución (móviles, navegador anotado, el dolor, la línea de tiempo) en
  `dibujos.py`. Los logos de clientes en `generador/clientes/`.
- `fuentes/` lleva Poppins (la letra de su marca), sacada de la maqueta `hungceed/`.
- El alcance sale del contexto del cliente y de `hungceed/docs/asistente-make.md`.

Para volver a generarlo (desde esta carpeta):

    python3 generador/montar.py
    /opt/pw-browsers/chromium-1194/chrome-linux/chrome --headless --disable-gpu \
      --no-sandbox --no-pdf-header-footer --allow-file-access-from-files \
      --print-to-pdf=propuesta-hungceed.pdf propuesta.html

Para revisarlo como imágenes antes de mandarlo:

    pdftoppm -png -r 70 propuesta-hungceed.pdf pg

Tienen que salir **9 hojas**:

| Hoja | Qué cuenta |
| --- | --- |
| 1 | Portada en bloque negro: titular, la jaula con polea (499 €) en perspectiva con un pedido y un WhatsApp entrando solos, y **la carta**: A tienda, B asistente, C gym, D automatizaciones |
| 2 | El problema: Jose en el centro y todo lo que tira de él; la cuenta del WhatsApp; la solución en cuatro piezas |
| 3 | Su web actual dibujada y anotada con seis fallos, cada uno con su arreglo |
| 4 | A · Tienda: móvil de hoy (problema) → móvil nuevo (solución), qué incluye, qué gana |
| 5 | B · Asistente: WhatsApp con 47 sin leer → chat que contesta solo, flujo por dentro |
| 6 | C · Gym: recuadro de Virtuagym → página con tarifas, tarifas en tarjetas |
| 7 | D · Automatizaciones: lo que no se hace → línea de tiempo «pasa algo → WhatsApp → resultado» |
| 8 | La carta con precios: A, Pack (destacado), B; C y D debajo; condiciones |
| 9 | Cómo empezamos: tres pasos, lo que necesito, clientes, contacto |

## Lo que tiene que confirmar Brian antes de mandarlo

- Los **plazos** (3–4 semanas tienda, 2 semanas asistente) los he propuesto yo.
- **D · Automatizaciones** no tiene precio: va «se presupuesta por escenario».
- La **maqueta** está protegida en Vercel: para que Jose la abra desde el PDF hay que quitar
  la protección del proyecto `hungceed-maqueta` o mandarle un enlace compartido.
- Desde el 1/10/2026 **Meta cobra también las respuestas** del asistente (1.000 gratis al mes
  por número, después 0,0166 €). El PDF lo deja en «céntimos por mensaje, en tu cuenta».
- «30 mensajes al día» (hoja 3) es un ejemplo y el PDF lo dice. Pedirle la cifra real.
