# Dossier para La Vita Buona

Restaurante italiano de Rua Ramon Puga 75, Ourense. Abrio el 1 de octubre de
2026. Dueno: **Oumar Ndiaye Gueye**, maestro pizzero formado en Napoles.
Cocinero: Cheick Mbacke. Telefono **988 57 06 24**, WhatsApp 602 135 607.

- `noah.html` es la fuente. Se edita esto, nunca el PDF.
- `noah-lavitabuona.pdf` es lo que se envia. **7 hojas.**

Para volver a generarlo (aqui chromium no esta en el PATH):

    /opt/pw-browsers/chromium-1194/chrome-linux/chrome --headless --no-sandbox \
      --disable-gpu --no-pdf-header-footer \
      --print-to-pdf=noah-lavitabuona.pdf noah.html

## De donde sale cada dato

Todo es verificable, y eso es medio argumento de venta: si Oumar comprueba
uno y cuadra, se cree los demas.

| Dato | Fuente |
| --- | --- |
| Apertura 1-10-2026, horario de cocina, desayunos por venir, premios | Faro de Vigo, 1-10-2026 |
| Trayectoria, Sicilia in Bocca, cinco empleados | La Voz de Galicia, 21-9-2026 |
| 4,9 con 29 resenas, cero respuestas del dueno, telefono | Google Maps, 23-10-2026 |
| Precios de Glovo, "el establecimiento entrega los pedidos directamente" | Glovo, 23-10-2026 |
| Mapa que lleva a A Coruna, masa 48-72h contra 6h, resenas de relleno | su web, 23-10-2026 |
| La carta y los precios de casa | los paso Brian el 23-10-2026 |

## El numero que sostiene el dossier

En pizzas, pastas y ensaladas, **el precio de Glovo es exactamente un 20,0%
mas bajo que el de su carta**. En postres, identico. Comprobado plato a plato.
Encima de eso va la comision, y el reparto lo ponen ellos.

El mismo pedido (bruschetta di parma, margaritha, Reino de las Dos Sicilias y
tiramisu): **37,40 EUR por telefono contra 31,12 EUR por Glovo**, antes de
comision. Ese pedido es el de la hoja 5 y los importes salen de ejecutar el
programa, no de una calculadora aparte.

## La hoja 5 no es un invento

Los importes, el total y el codigo salen de:

    cd ../../vapi-voice-agent && npm run probar:pedido

Lo que dice el cliente esta escrito; lo del servidor, no. Eso se puede decir
en la visita y se puede enseñar corriendo, que es lo que mas convence.

Para una llamada de telefono de verdad: `NEGOCIO_DE_EJEMPLO=lavitabuona` en
el `.env` y `npm run dev`. No hace falta Firestore.

## Lo que NO promete el dossier, a proposito

- **Reservas de mesa.** No estan construidas. La hoja 6 lo dice con todas las
  letras. Si Oumar las pide, es trabajo nuevo, no un ajuste.
- **Que el servidor este encendido.** Hoy corre en el portatil. Tambien esta
  dicho en la hoja 6.
- **Un porcentaje de comision concreto.** No lo sabemos y el dossier lo dice:
  "el numero exacto lo sabes tu". Queda mejor y ademas le hace sacar su
  propia cuenta.

## Cuatro datos que hay que preguntarle antes de coger una llamada

Estan inventados con criterio y marcados en `src/db/lavitabuona.ts`:

1. **El horario bueno.** Su web dice 19:00-23:00 y el Faro publico 20:00-23:30.
2. Gastos de envio.
3. Minimo para envio gratis.
4. Hasta donde reparten.

## Trampas de maquetacion heredadas del dossier de Arroutada

**Si algo se sale de ancho, Chromium encoge el documento entero sin avisar.**
Con `zoom: 1.12` el ancho util en CSS son 162,5mm = 614px. Los SVG estan a
600px a proposito, para no rozarlo. Si un dia aparecen hojas de mas sin haber
tocado el texto, lo primero es comprobar que ningun SVG pase de 600.

**El `zoom` de `.hoja` esta en 1.12.** Subirlo llena mas, pero la hoja 5 ya va
al 88% y el pie se caeria a la pagina siguiente. Despues de tocarlo hay que
volver a generar y contar las paginas.
