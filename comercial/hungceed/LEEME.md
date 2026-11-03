# Propuesta para Hungceed (Jose)

Lo que se le manda a Jose: `propuesta-hungceed.pdf`, **8 hojas**.

- `propuesta.html` es la fuente. **Se edita esto, nunca el PDF.**
- `fuentes/` lleva Poppins (la letra de su marca), sacada de la maqueta `hungceed/`.
- El alcance sale del contexto del cliente y de `hungceed/docs/asistente-make.md`. Los precios
  son los de la hoja 8; si cambian, cambiarlos ahí y en el pack.

Para volver a generarlo (desde esta carpeta):

    /opt/pw-browsers/chromium-1194/chrome-linux/chrome --headless --disable-gpu \
      --no-sandbox --no-pdf-header-footer --allow-file-access-from-files \
      --print-to-pdf=propuesta-hungceed.pdf propuesta.html

Para revisarlo como imágenes antes de mandarlo:

    pdftoppm -png -r 70 propuesta-hungceed.pdf pg

Tienen que salir **8 hojas**.

| Hoja | Qué cuenta |
| --- | --- |
| 1 | Portada: «Que tu tienda venda sola. Y que tu WhatsApp conteste solo» |
| 2 | Lo que nos contó (web, WhatsApp, gimnasio), lo que vimos en su web y la cuenta con sus números |
| 3 | A · El rediseño dentro de su WordPress, antes/después del nombre de producto, enlace a la maqueta |
| 4 | B · El asistente de WhatsApp: la conversación dibujada y los seis pasos; todo a su nombre |
| 5 | D · Automatizaciones: opinión, bienvenida, inactivos, carrito; plantillas de Meta |
| 6 | C · La página del gimnasio con sus tarifas reales en tarjetas |
| 7 | Cómo trabajamos: lo que incluye la cuota, plazos, lo que necesita de Jose |
| 8 | Precios con el 10 % de Brandán, pack, condiciones y siguiente paso |

## Lo que tiene que confirmar Brian antes de mandarlo

- Los **plazos** de la hoja 7 (3–4 semanas tienda, 2 semanas asistente) los he propuesto yo.
- **D · Automatizaciones** no tiene precio: en el contexto no lo había. Va «se presupuesta por
  escenario».
- La **maqueta** está protegida en Vercel: para que Jose la abra desde el PDF hay que quitar
  la protección del proyecto `hungceed-maqueta` o mandarle un enlace compartido.
- Desde el 1/10/2026 **Meta cobra también las respuestas** del asistente (1.000 gratis al mes
  por número, después 0,0166 €). La propuesta lo deja en «céntimos por mensaje, en tu cuenta».
