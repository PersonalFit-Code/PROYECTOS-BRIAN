# Cómo publicar la web

Guía para el día que se compre el dominio. Está escrita para hacerla seguida, de arriba abajo, en
una tarde. Lo que lleva ⚠️ es lo que puede salir mal si se hace a la ligera.

---

## 0 · Qué hay ahora mismo

La web funciona y está desplegada en **`tixola-taperia.vercel.app`**, que es una dirección prestada
que regala Vercel. Todo lo demás está hecho: los 47 platos con sus alérgenos, los 46 vinos, los
cuatro idiomas, las tres páginas legales completas con el NIF y el correo de Tatiana, el camarero
virtual y el aviso de cookies.

**La web está deliberadamente oculta a Google.** No es un fallo: mientras viva en una dirección
prestada, `robots.txt` le pide a los buscadores que no la indexen y todas las páginas van en
`noindex`. Quien tenga el enlace la ve igual de bien. Esto se abre solo en el paso 3.

---

## 1 · Comprar el dominio

En GoDaddy, en cualquier registrador español (nic.es, OVH, Dinahosting) o en el propio Vercel. Da
igual dónde: lo único que cambia es dónde se escriben dos líneas de configuración.

**Qué mirar antes de pagar:**

- ⚠️ **El precio que anuncian es el del PRIMER año.** Los 6 € son la oferta de entrada; la
  renovación anual es bastante más —en `.es` suele ir de 10 a 20 €/año y en `.com` de 15 a 25 €—.
  No es caro, pero conviene saberlo antes y no al año siguiente.
- ⚠️ **Rechaza los extras del carrito.** GoDaddy ofrece hosting, correo, certificado SSL y
  "protección de dominio". **No hace falta ninguno**: el alojamiento y el certificado los pone
  Vercel, y el correo ya lo tiene Tatiana.
- **`.es` o `.com`.** Para una tapería de Ourense, `.es` se entiende perfectamente y suele estar
  libre. El `.com` es más caro y más difícil de encontrar libre.
- **Que el dominio quede a nombre de Tatiana**, no de Brian. Es de ella, igual que el correo.

**Y el dato que conviene saber ANTES de ir a GoDaddy: `tixola.es` está cogido.** Consultado el
15-10-2026: `tixola.es`, `tixola.com` y `tixola.gal` están **los tres registrados** por alguien.
Ninguno de los tres resuelve a una web, así que probablemente estén aparcados y puede que en venta,
pero eso ya no cuesta 6 € — un dominio de reventa va de los cientos a los miles. **No merece la pena
pelearse por el nombre corto**: el que la gente va a teclear es el que esté en la ficha de Google y
en la servilleta, y ahí da igual que lleve «taperia».

**Lo que SÍ está libre** (comprobado el 15-10-2026, el mismo día):

| Dominio | Comentario |
|---|---|
| **`tixolataperia.es`** | **La recomendación.** Dice el nombre completo, `.es` se entiende en Ourense y es el que mejor queda dicho en voz alta. |
| `tixolataperia.com` | Igual de bueno. En Vercel sale a **11,25 $/año, y la renovación al mismo precio** (consultado el 18-10-2026 — son dólares: Vercel factura todo en USD, así que en el banco llegan unos 10-11 € más el IVA). GoDaddy lo suele dar más barato el primer año y más caro después. |
| `taperiatixola.es` · `tixola-taperia.es` | Valen, pero el guion se pierde al dictarlo y el orden invertido cuesta más de recordar. |
| `tixolaourense.es` · `tixolavinoteca.es` | Buenos para buscadores, peores para decirlos. |
| `tixola.bar` · `tixola.eu` · `tixola.net` | Libres y cortos, pero `.bar` y `.eu` no los teclea nadie por su cuenta y `.net` suena a los 2000. |

Con cualquiera de ellos la web funciona igual: el paso 2 es el mismo.

---

## 2 · Conectarlo con la web

En Vercel, dentro del proyecto `tixola-taperia`:

1. **Settings → Domains → Add**, y escribir el dominio comprado, **sin el `www`**
   (`tixolataperia.es`, no `www.tixolataperia.es`). El `www` se añade después, en el paso 5.
2. Vercel responde con lo que hay que escribir en el registrador. Hay **dos caminos** y basta con
   uno:
   - **Cambiar los servidores de nombres** (lo recomendado, y lo más corto): en el registrador se
     sustituyen los suyos por `ns1.vercel-dns.com` y `ns2.vercel-dns.com`. A partir de ahí el DNS
     entero lo lleva Vercel y no hay que volver a entrar ahí. ⚠️ **Ojo si Tatiana quiere correo en
     ese dominio**: al delegar, los registros `MX` del correo hay que volver a darlos de alta en
     Vercel. Hoy el correo de contacto es un Gmail, así que no afecta.
   - **Dejar el DNS en el registrador** y pegar los registros que Vercel enseña en pantalla: un `A`
     para el dominio sin www y un `CNAME` para el `www`. **Copiar los valores de su pantalla, no de
     este papel**: Vercel lleva años dando `76.76.21.21` y `cname.vercel-dns.com`, pero ya reparte
     valores distintos por proyecto y el que manda es el que él diga ese día.
3. Si el registrador trae ya puestos registros propios (un "parking" o una página de "próximamente"),
   **se borran**: si no, el dominio sigue apuntando al registrador y no a la web.
4. Esperar. Normalmente tarda entre diez minutos y dos horas; puede llegar a 24 h. Vercel lo marca
   como **Valid Configuration** cuando está, y emite el certificado de seguridad él solo. Si se
   atasca más de un día, mirar si el registrador tiene **DNSSEC** activado: con DNSSEC puesto y los
   servidores de nombres cambiados, el dominio no resuelve hasta que se desactiva.
5. **Añadir también `www.tixolataperia.es`**, y dejarlo como **redirección** al dominio sin www. Así
   quien teclee el `www` acaba en la web buena y Google no ve dos direcciones con lo mismo.

**No busques ningún botón de "dominio principal": no existe.** Vercel elige solo, y la regla es
"el dominio de producción personalizado **más corto**" (su documentación, comprobada el 18-10-2026).
Con `tixolataperia.es` y `www.tixolataperia.es` dados de alta, gana el corto, que es el que se
quiere. Lo que sí conviene saber: si algún día se añade a ESTE proyecto un dominio aún más corto, la
web empezaría a declararse en ese otro sin que nadie toque nada. Para no depender de eso, se puede
fijar a mano la variable `NEXT_PUBLIC_SITE_URL` con el dominio bueno (Settings → Environment
Variables), y entonces manda esa y punto.

---

## 3 · Abrir la web a Google

Aquí no hay que tocar código: el propio código lo detecta.

En cuanto el dominio propio está puesto, `SITE_URL_IS_PROVISIONAL` pasa a `false` y, con él, el
`robots.txt` se abre, las páginas dejan de ir en `noindex`, el sitemap se publica y las tres páginas
legales entran en él. Todo a la vez y sin que nadie recuerde una casilla.

⚠️ **Pero hace falta un despliegue nuevo para que surta efecto**, porque esa decisión se toma al
construir la web, no al visitarla. Así que después de conectar el dominio: **Vercel → Deployments →
Redeploy**, y ahí **desmarcar "Use existing Build Cache"** — con la caché puesta, Vercel puede
reutilizar las páginas construidas con la dirección vieja y la web seguiría diciendo `noindex` con el
dominio ya funcionando. Vale igual empujar cualquier commit: eso siempre construye de cero.

**Cómo comprobar que salió bien** (treinta segundos):
- Abrir `https://eldominio.es/robots.txt`: tiene que decir `Allow: /`, no `Disallow: /`.
- Abrir `https://eldominio.es/sitemap.xml`: tienen que salir las páginas con el dominio nuevo.
- En la portada, ver el código fuente y buscar `robots`: no debe poner `noindex`.

---

## 4 · La decisión que falta: el plan de Vercel

⚠️ **Esto es lo único que no se resuelve pagando 6 €.**

La web corre hoy en el plan **gratuito (Hobby)** de Vercel, y sus condiciones de uso **prohíben el
uso comercial**. Y no es una lectura nuestra: su propia página lo deja por escrito —"Hobby teams are
restricted to non-commercial personal use only. All commercial usage of the platform requires either
a Pro or Enterprise plan"— y entre los ejemplos de uso comercial nombra **"anunciar la venta de un
producto o servicio"** y **"recibir dinero por crear, actualizar o alojar la web"**. Una tapería que
enseña su carta encaja en el primero, y el trabajo de Brian en el segundo. No hay ninguna alarma ni
corte automático, pero es un incumplimiento y Vercel puede suspender el proyecto si lo detecta.
(Condiciones consultadas el 18-10-2026 en `vercel.com/docs/limits/fair-use-guidelines`.)

Las opciones, honestamente:

| | Qué supone |
|---|---|
| **Pasar a Pro** (lo elegido) | **20 $/mes**, que son dólares y sin IVA: en el banco salen unos 19-20 € con el cambio, más el 21 %. Es mes a mes y cubre **todos los proyectos del equipo**, no solo este, así que la cuenta no se multiplica por web. Incluye 20 $ de consumo, que para una web así sobran de largo. Es lo correcto y lo que quita el problema. De paso trae la analítica de visitas, que hoy está apagada. |
| **Quedarse en Hobby** | Gratis y funciona. Es una decisión consciente de riesgo, no un descuido: si lo detectan, el aviso llega y hay que migrar con prisa, con la web ya en la calle y el dominio ya repartido. |
| **Mover a otro alojamiento** | Posible, pero **no a uno estático** (GitHub Pages, hosting compartido clásico): el camarero virtual necesita un servidor. Lo que sí vale y lo que no, comprobado el 18-10-2026, está en el cuadro de abajo. |

**Y si algún día se quiere salir de Vercel, lo comprobado el 18-10-2026:**

- **Netlify** es la alternativa gratuita de verdad: su plan Free **no prohíbe el uso comercial** y
  soporta Next 16 con el adaptador oficial de OpenNext, incluido el `proxy.ts` de los idiomas y la
  optimización de fotos. El límite es de **300 créditos al mes**, y al agotarlos **la web se pausa
  hasta el mes siguiente** (y pausa todos los proyectos de la cuenta, no solo el que se pasó). El
  plan de pago siguiente son 9 $/mes.
- **Cloudflare Workers** ya es posible, pero no es un cambio de botón: el `proxy.ts` de Next 16 (lo
  que reparte los cuatro idiomas) solo está soportado **desde agosto de 2026 y como experimental**,
  y su plan gratuito corta a **10 ms de CPU por petición**, que es poco para una web que se pinta en
  el servidor — el siguiente escalón son 5 $/mes. Cloudflare **Pages** ya no vale: su adaptador está
  descontinuado.
- Un **servidor pequeño** (Railway, Fly, un VPS) sale por 5-7 €/mes, pero entonces las
  actualizaciones, los certificados y las copias las lleva alguien a mano.

Nada de esto es gratis de verdad: o se paga en euros o se paga en tardes. **Y cambiar de alojamiento
obliga a reescribir los textos legales**, porque la política de privacidad nombra a Vercel como
encargado del tratamiento con nombre y apellidos.

---

## 5 · El mismo día que se publique

- **Ficha de Google de Tixola** → poner el dominio nuevo como sitio web, y de paso **corregir el
  horario**, que sigue diciendo que abren a las 12:00 cuando la cocina abre a las 13:00.
- **Google Search Console** (gratis): dar de alta el dominio y mandarle el `sitemap.xml`. Es lo que
  hace que Google la encuentre en días en vez de en semanas.
- **Probar el camarero virtual** en el dominio nuevo. La clave de Anthropic ya está puesta en
  Vercel; si algún día falla, el chat no se rompe, pasa a un modo sin conexión que responde con la
  carta y el horario.
- **Probarla en un móvil de verdad**, no solo en el ordenador.

---

## 6 · Lo que seguirá faltando, y no impide publicar

Nada de esto bloquea: son mejoras que se pueden ir metiendo con la web ya en la calle.

- **13 fotos de plato** (de los 47 platos, 27 tienen foto y 7 no la necesitan). Guía en
  `docs/guia-fotos-platos.md` — ojo, que desde el 15-10-2026 el criterio es **de lado**, no cenital.
- **La lista de alérgenos firmada** por Tatiana (`docs/alergenos-para-revisar.md`). La web ya avisa
  en todas partes de que se confirmen con el personal, pero su firma es lo que convierte el dato en
  suyo y no en nuestro.
- **Repetir la foto del bacalao en tempura**, de lado, que lo pidió ella.
- **El contrato de encargo de tratamiento** (art. 28 RGPD) entre Tatiana y Brian, y la confirmación
  de la gestoría sobre la declaración responsable de inicio de actividad (TU984B).
- **El texto del pie**: donde hoy pone "Diseño web Tu estudio".

---

*Escrito el 15-10-2026, repasado el 18-10-2026 (precios y condiciones de Vercel comprobados ese día;
corregido un paso que no existe: no hay ningún "marcar como dominio principal"). Si cambia algo de
Vercel o del registrador, lo que manda es su pantalla, no este papel: las dos cambian el sitio de los
botones cada pocos meses.*
