# Demo de Noah en La Vita Buona

Lo que hay que hacer para ensenarle Noah a Oumar funcionando. No hace falta
numero espanol, ni Render, ni gastar nada: la demo va con tu portatil, ngrok y
el numero gratis de Vapi. Lo de Twilio se hace **solo si dice que si**.

Todos los comandos, en Git Bash, desde:

    cd /c/Users/brian/proyectos/PROYECTOS-BRIAN/vapi-voice-agent

## 1. La vispera (media hora)

1. Traer lo ultimo y comprobar que todo pasa:

       git pull
       npm install
       npm test

   Tiene que acabar en `# fail 0`.

2. Subir la ficha de la demo a Firestore (la carta de La Vita Buona, tomando
   pedidos a cualquier hora, pero diciendo su horario real si se lo preguntan):

       npm run crear:negocio lavitabuona-prueba

3. Ensayo completo en casa, igual que en el local (paso 2 entero) y una
   llamada de verdad haciendo el pedido de la hoja 2 del dossier. Si algo
   falla, es ahora cuando hay tiempo de arreglarlo.

## 2. Antes de salir hacia el local

Tres ventanas de Git Bash:

**Ventana 1**, el servidor:

    npm run dev

**Ventana 2**, el tunel:

    ngrok http 3000

**Ventana 3**, preparar y comprobar:

    NEGOCIO=lavitabuona-prueba bash scripts/preparar-prueba.sh

Te dice que poner en Vapi (Phone Numbers > tu numero): Server URL y el
secreto. Ponlo, guarda, y reinicia el servidor de la ventana 1 (Ctrl+C y
`npm run dev`). Despues:

    bash scripts/antes-de-salir.sh

Si dice **SAL TRANQUILO**, sal. Si dice **NO SALGAS**, arriba pone que falta.

Y ademas:
- El portatil enchufado, con la tapa abierta y la suspension en **Nunca**
  (Configuracion > Sistema > Inicio/apagado). Si se duerme, Noah no contesta.
- Llama tu al numero desde la calle, justo antes de entrar.
- El panel abierto en el movil: la direccion de ngrok + `/pedidos`, usuario
  `cocina`. Asi Oumar ve el pedido entrar.
- El numero de Vapi es de Estados Unidos: llamar desde tu movil es una
  llamada internacional. Mira tu tarifa, y llama tu (no le pidas a Oumar que
  llame desde su telefono).

## 3. En el local: la demo en cinco minutos

1. **El dossier, hojas 1 y 2.** Que es Noah y como es una llamada.
2. **Llamas en altavoz** y pides lo mismo que la hoja 2: una bruschetta di
   parma, una margaritha, la Reino de las Dos Sicilias y un tiramisu. Tienen
   que salir **37,40 EUR** y un codigo de cuatro cifras.
3. **El movil con el panel:** el pedido aparece con sus platos, el total y el
   codigo. Es el momento clave: le ensenas lo que veria su cocina.
4. **Que lo pruebe el.** Le das el movil y que pida lo que quiera, y que
   intente liarlo: cambiar de idea a mitad, preguntar que lleva una pizza,
   preguntar si es una persona, pedir algo que no tiene la carta.
5. **El dossier, hojas 8 a 10.** La cuenta, la propuesta y como empezamos.

Si algo falla en el local: no lo arregles delante de el. Sigue con el dossier
("esto es lo que hace, os lo ensenamos funcionando otro dia") y lo miramos
despues con los registros de la ventana 1.

## 4. Lo que hay que preguntarle alli mismo

Son los datos de la ficha que no estan confirmados. Apuntalos en el movil:

- [ ] El horario. Noah ya dice el de su web (martes a jueves 13-16 y 19-23,
      viernes a domingo 13-16 y 19-23:30, lunes cerrado), pero el Faro de Vigo
      publico otro: que te diga cual es el bueno.
- [ ] Gastos de envio, minimo para envio gratis y hasta donde reparten.
- [ ] Bebidas: precio en el local (ahora son los de Glovo) y si hay cerveza o vino.
- [ ] Que postre quiere que ofrezca Noah (ahora el tiramisu).
- [ ] Cuantas pizzas caben en el horno y cuanto tarda una hornada.
- [ ] Un telefono de una persona del local para pasar llamadas (quejas, reservas).

## 5. Si dice que si

Lo que le pides a Oumar para el numero espanol de Twilio:

- Foto del **CIF** (o NIF si es autonomo).
- Una **factura** (luz, agua, alquiler) con la direccion del local.

Y lo demas que hay que montar esta en `PENDIENTE.md`, bloque 2: numero 988
en Twilio, servidor siempre encendido, saldo en Vapi, `PANEL_PASSWORD`, el
desvio de su telefono a Noah y el aviso si el servidor se cae.
