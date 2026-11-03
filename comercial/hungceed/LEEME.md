# Propuesta para Hungceed (Jose)

Lo que se le manda a Jose: `propuesta-hungceed.pdf`, **8 hojas**, al estilo del dossier de
Noah para La Vita Buona: poco texto, dibujos, el dolor primero y una carta de servicios para
que elija.

- `propuesta.html` se **genera**: no se edita a mano.
- `generador/` es donde se edita: textos en `paginas.part`, estilos en `css.part`, dibujos
  (rack de portada, la cuenta, el catálogo antes/después, el flujo del asistente, los pasos)
  en `svgs.py`. Los logos de clientes en `generador/clientes/`.
- `fuentes/` lleva Poppins (la letra de su marca), sacada de la maqueta `hungceed/`.
- El alcance sale del contexto del cliente y de `hungceed/docs/asistente-make.md`.

Para volver a generarlo (desde esta carpeta):

    python3 generador/montar.py
    /opt/pw-browsers/chromium-1194/chrome-linux/chrome --headless --disable-gpu \
      --no-sandbox --no-pdf-header-footer --allow-file-access-from-files \
      --print-to-pdf=propuesta-hungceed.pdf propuesta.html

Para revisarlo como imágenes antes de mandarlo:

    pdftoppm -png -r 70 propuesta-hungceed.pdf pg

Tienen que salir **8 hojas**:

| Hoja | Qué cuenta |
| --- | --- |
| 1 | Portada con el rack dibujado y **la carta**: A tienda, B asistente, C gym, D automatizaciones |
| 2 | Seis situaciones de un día normal, hoy y después (gris / verde) |
| 3 | La cuenta del WhatsApp en horas y las seis cosas que vi en su web, gratis |
| 4 | A · La tienda: el catálogo hoy y después, los seis pasos, la maqueta |
| 5 | B · El asistente: el flujo dibujado, un chat corto, cuándo avisa |
| 6 | C · El gym con sus tarifas en tarjetas · D · Lo que puede ir solo |
| 7 | La carta con precios: A, Pack (destacado), B; C y D debajo; condiciones |
| 8 | Cómo empezamos: tres pasos, lo que necesito, clientes, contacto |

## Lo que tiene que confirmar Brian antes de mandarlo

- Los **plazos** (3–4 semanas tienda, 2 semanas asistente) los he propuesto yo.
- **D · Automatizaciones** no tiene precio: va «se presupuesta por escenario».
- La **maqueta** está protegida en Vercel: para que Jose la abra desde el PDF hay que quitar
  la protección del proyecto `hungceed-maqueta` o mandarle un enlace compartido.
- Desde el 1/10/2026 **Meta cobra también las respuestas** del asistente (1.000 gratis al mes
  por número, después 0,0166 €). El PDF lo deja en «céntimos por mensaje, en tu cuenta».
- «30 mensajes al día» (hoja 3) es un ejemplo y el PDF lo dice. Pedirle la cifra real.
