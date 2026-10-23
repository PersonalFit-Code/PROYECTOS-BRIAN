# Dossier para La Vita Buona

Restaurante italiano de Rua Ramon Puga 75, Ourense. Abrio el 1 de octubre de
2026. Dueno: **Oumar Ndiaye Gueye**, maestro pizzero formado en Napoles.
Telefono **988 57 06 24**, WhatsApp 602 135 607.

- `noah-lavitabuona.pdf` es lo que se envia. **7 hojas.**
- `noah.html` se **genera**: no se edita a mano.
- `generador/` es donde se edita: textos en `paginas.part`, estilos en
  `css.part`, dibujos (pizza, rueda, circulos...) en `svgs2.py`.

Para volver a generarlo:

    python3 generador/montar.py
    /opt/pw-browsers/chromium-1194/chrome-linux/chrome --headless --no-sandbox \
      --disable-gpu --no-pdf-header-footer \
      --print-to-pdf=noah-lavitabuona.pdf noah.html

Tienen que salir **7 hojas**: portada y que es Noah, una llamada, ocho
situaciones, el dolor, seis formas de ayudar, nicho y micronicho, y lo que
propongo.

## Diseno

Un solo color de acento (el ambar de la portada). **Verde y rojo solo para
comparar**: sin Noah / con Noah, por telefono / por plataforma. Nada mas
lleva esos colores.

## De donde sale cada dato

Todo es verificable: si Oumar comprueba uno y cuadra, se cree los demas.

| Dato | Fuente |
| --- | --- |
| Apertura 1-10-2026, desayunos por venir, premios | Faro de Vigo, 1-10-2026 |
| Trayectoria, Sicilia in Bocca, cinco empleados | La Voz de Galicia, 21-9-2026 |
| 4,9 con 29 resenas, telefono | Google Maps, 23-10-2026 |
| Diez ultimas resenas sin respuesta del local | Google Maps (muestra de 10) |
| Precios de Glovo, "entrega los pedidos directamente" | Glovo, 23-10-2026 |
| Mapa a A Coruna, masa 48-72h contra 6h, sin telefono, 3 opiniones con iniciales | su web, 23-10-2026 |
| La carta y los precios de casa | los paso Brian el 23-10-2026 |

## Lo que NO es un dato y esta dicho como ejemplo

- **"Sin Noah"** (hoja 3 y 4) describe lo que pasa en cualquier local cuando no
  hay quien coja el telefono. No afirma nada de como atienden hoy.
- **"3 llamadas perdidas a la semana = 5.800 EUR al ano"** (hoja 4) es una
  cuenta de ejemplo con el pedido de la hoja 2 (37,40 EUR). El numero de
  llamadas lo sabe el, no nosotros, y el dossier lo dice.
- **La conversacion de la hoja 2**: lo del cliente es un ejemplo; los importes
  y el codigo los devuelve `npm run probar:pedido` con su carta cargada.

## El numero que sostiene la comparativa

En pizzas, pastas y ensaladas, **el precio de Glovo es exactamente un 20,0%
mas bajo que el de su carta**; en postres, identico. El mismo pedido
(bruschetta di parma, margaritha, Reino de las Dos Sicilias y tiramisu):
**37,40 EUR por telefono contra 31,12 EUR por Glovo**, antes de comision. Es
solo UNA de las ocho situaciones: si el cliente va a recoger al local, paga lo
mismo con o sin plataforma, y el dossier lo dice.

## Lo que el dossier NO promete

- **Reservas de mesa**: no estan construidas (hoja 6, "Esto no").
- **Servidor encendido**: hoy corre en el portatil. No esta en el dossier a
  proposito (lo explica Brian), pero sigue siendo verdad: hasta que se
  despliegue no hay llamada de cliente de verdad.
- **Una comision concreta**: no se sabe.
- Que se arreglen los cinco detalles de la hoja 7: se le cuentan, no se
  prometen arreglados (no son nuestra web).

## Cuatro datos que preguntarle antes de coger una llamada

Estan marcados en `vapi-voice-agent/src/db/lavitabuona.ts`:

1. **El horario bueno**: su web dice 19:00-23:00 y el Faro publico 20:00-23:30.
2. Gastos de envio.
3. Minimo para envio gratis.
4. Hasta donde reparten.

## Trampa de maquetacion que ya mordio dos veces

**Si algo se sale de ancho, Chromium encoge el documento entero sin avisar.**
La portada de la primera version tenia margenes negativos que se salian de la
pagina y todo salia un 8% mas pequeno (y los dibujos, a un 90% del ancho).
Ahora la portada no se sale y `zoom` de `.hoja` esta en **1.033**; los dibujos
llevan `class="f"` (ancho 100%) y se recortan con el `viewBox`.

Si aparecen hojas de mas sin haber tocado el texto, lo primero es mirar que
nada se salga del ancho. Despues de tocar tamanos hay que volver a generar y
contar las hojas: cada una ronda el 87-90% y pasar del 91% suelta el pie a la
hoja siguiente.
