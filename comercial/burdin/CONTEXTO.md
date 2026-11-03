# Contexto: cliente Burdin Gym (Ander)

Copia todo este archivo como primer mensaje del chat nuevo.

---

Hola. Soy Brian Carbajal, hago webs, IA y automatizaciones para negocios desde Ourense. Habla siempre en español.
En este chat vamos a crear el **boceto de la web de Burdin Gym** para un cliente, Ander.

## Quién es el cliente
- **Ander** va a abrir **Burdin Gym**, un gimnasio en el **País Vasco**.
  - Las obras aún no están terminadas y todavía no tiene fotos del local.
  - Llegó por el grupo de WhatsApp de dueños de gimnasio (Gymtrade). Conoce a Brandán y a Jose, de Hungceed.
- **Estilo del gimnasio:** de musculación, «old school», con máquinas de las mejores marcas del mundo elegidas una a una:
  - Cybex, Nautilus, Panatta, Hammer Strength, Gym80, Life Fitness, Gymleco, Flex Fitness, Paramount y Precor;
  - y piezas clásicas que ya no se fabrican, como un press de pecho con cadena y piñones.
- **Gestión:** usa **Virtuagym** para socios, altas y cobros, y hace un curso de Virtuagym el día 9.
  - La web no cobra nada: los botones «Apúntate» llevan a la tarifa en la tienda online de Virtuagym.
- **Tarifas:** al principio habrá **tarifa de socio fundador** y, después de la apertura, la tarifa fija. Aún no tiene precios.
- **Idiomas:** la web tiene que estar en **castellano y euskera**.

## Lo que pide
- Una **web externa sencilla** con sus tarifas y botones al alta en Virtuagym, y un **boceto** para ir viéndola.
- Le gusta cómo enseñan las máquinas estas dos webs:
  - **tdmgym.co.uk**: cada máquina es una «pieza de colección» con su historia (de dónde vino, marca, por qué es especial y los kilómetros que recorrió hasta el gimnasio). Además tiene:
    - «Founders Club»;
    - tarifas con «o pruébanos primero» (pase de día, semana o fin de semana);
    - horario y preguntas frecuentes.
  - **blvckoutgym.com/home/gym-page/**:
    - cifras grandes arriba (+150 máquinas únicas, 3 plantas, 2600 m²);
    - galería de zonas a pantalla completa con un titular corto cada una;
    - tarifas en 3 tarjetas con precio;
    - mapa, contacto y horario.

  Se toman como **inspiración** (estructura e ideas). No se copian textos, fotos ni diseños.
- **Mantenimiento:** se lo está pensando, pero ve que le vendrá bien para cambios. Cambios seguros en los primeros meses:
  - fotos cuando acaben las obras;
  - pasar de la tarifa de fundador a la fija;
  - todo al día en dos idiomas.

## Su borrador (hecho con Claude)
Está en `comercial/burdin/borrador-ander/` (`index.html` y 4 fotos de máquinas en `img/`).

**Ya tiene, y hay que mantener:**
- su logo (una B de piedra, hecha en SVG) y la estética:
  - negro, piedra y ámbar (#f2b366);
  - letras Barlow Condensed, Michroma y Syncopate;
- el selector EU/ES;
- las tarjetas de máquina al estilo TDM (foto con brillo en el suelo, marca, nombre, descripción, grupo muscular y tipo);
- la cinta de marcas y la cuadrícula de marcas;
- 3 tarifas;
- contacto y horario.

**Lo que falta o hay que mejorar:**
1. **Historia de cada máquina, como TDM:** año, de dónde vino y por qué es especial. Es lo que le enamora de esa web.
2. **Preapertura:**
   - bloque «Socio fundador» con plazas limitadas;
   - cuenta atrás hasta la apertura;
   - lista de espera con nombre y teléfono que llegue a su WhatsApp.
3. **Cifras grandes como Blvckout:** número de máquinas, marcas y metros (dejar huecos para rellenar).
4. **Tarifas:**
   - tarjetas de fundador y fijas;
   - botones a Virtuagym;
   - «Pruébanos primero» con pase de día.
5. **Galería de zonas** preparada para las fotos cuando acaben las obras. Mientras tanto, fotos de máquinas o renders.
6. **Preguntas frecuentes, mapa y botón de WhatsApp.**
7. **Arreglos:**
   - la portada repite el logo grande (ya está en el menú);
   - en móvil, el menú esconde todos los enlaces y no hay menú hamburguesa;
   - los precios salen «XX €»;
   - dirección, teléfono y email son de relleno.
8. **Fotos:** las 4 de las máquinas parecen sacadas de internet. Hay que usar fotos suyas cuando las tenga.
9. **Euskera:** los textos están traducidos de forma automática. Hay que pedirle a Ander que los revise antes de publicar.

## Precio (pendiente de confirmar)
- **Plan Presencia bilingüe:** 490 € + 29 €/mes. Incluye dominio, alojamiento, seguridad, copias y cambios.
- 30 días gratis y mínimo 3 meses de cuota.
- Cuidado: Ander conoce a Jose (Hungceed). Los precios tienen que ser coherentes entre los dos.

## Qué quiero hacer en este chat
1. Partir de su borrador y convertirlo en un **boceto bonito y completo**, con las mejoras de arriba, en castellano y euskera.
2. Que funcione perfecto en móvil.
3. Publicarlo en una URL de prueba para enseñárselo a Ander.

Reglas:
- No me pidas permiso para cada paso.
- No subas contraseñas ni claves al repositorio.
- Trabaja en la rama que te indique la sesión.
