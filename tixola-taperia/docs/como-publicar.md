# Cómo publicar la web

Guía para el día que se compre el dominio. Está escrita para hacerla seguida, de arriba abajo, en
una tarde. Lo que lleva ⚠️ es lo que puede salir mal si se hace a la ligera.

---

## 0 · Qué hay ahora mismo

La web funciona y está desplegada en **`tixola-taperia.vercel.app`**, que es una dirección prestada
que regala Vercel. Todo lo demás está hecho: los 47 platos con sus alérgenos, los 53 vinos, los
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

Ideas, por si están libres: `tixola.es`, `tixolataperia.es`, `tixolataperia.com`.

---

## 2 · Conectarlo con la web

En Vercel, dentro del proyecto `tixola-taperia`:

1. **Settings → Domains → Add**, y escribir el dominio comprado.
2. Vercel responde con **dos líneas de configuración DNS**: una `A` que apunta a una IP suya y una
   `CNAME` para el `www`. Las da hechas, solo hay que copiarlas.
3. Esas dos líneas se pegan en **GoDaddy → Mis dominios → DNS**. Si GoDaddy trae ya puestos
   registros propios (un "parking" o una página de "próximamente"), **se borran**: si no, el dominio
   sigue apuntando a GoDaddy y no a la web.
4. Esperar. Normalmente tarda entre diez minutos y dos horas; puede llegar a 24 h. Vercel lo marca
   como **Valid Configuration** cuando está, y emite el certificado de seguridad él solo.
5. ⚠️ **Marcar el dominio nuevo como el principal** del proyecto (el botón que dice *Set as primary
   domain*). Esto es lo que de verdad importa, y es el paso que se olvida.

---

## 3 · Abrir la web a Google

Aquí no hay que tocar código: el propio código lo detecta.

En cuanto el dominio propio es el principal, `SITE_URL_IS_PROVISIONAL` pasa a `false` y, con él, el
`robots.txt` se abre, las páginas dejan de ir en `noindex`, el sitemap se publica y las tres páginas
legales entran en él. Todo a la vez y sin que nadie recuerde una casilla.

⚠️ **Pero hace falta un despliegue nuevo para que surta efecto**, porque esa decisión se toma al
construir la web, no al visitarla. Así que después de marcar el dominio como principal: **Vercel →
Deployments → Redeploy**. Si no se hace, la web seguirá pidiéndole a Google que no la indexe aunque
el dominio ya esté puesto.

**Cómo comprobar que salió bien** (treinta segundos):
- Abrir `https://eldominio.es/robots.txt`: tiene que decir `Allow: /`, no `Disallow: /`.
- Abrir `https://eldominio.es/sitemap.xml`: tienen que salir las páginas con el dominio nuevo.
- En la portada, ver el código fuente y buscar `robots`: no debe poner `noindex`.

---

## 4 · La decisión que falta: el plan de Vercel

⚠️ **Esto es lo único que no se resuelve pagando 6 €.**

La web corre hoy en el plan **gratuito (Hobby)** de Vercel, y sus condiciones de uso **prohíben el
uso comercial**: la web de un bar que vende tapas no encaja en "uso personal, sin ánimo de lucro".
No hay ninguna alarma ni corte automático, pero es un incumplimiento de las condiciones y Vercel
puede suspender el proyecto si lo detecta.

Las opciones, honestamente:

| | Qué supone |
|---|---|
| **Pasar a Pro** | 20 $/mes por usuario. Es lo correcto y lo que quita el problema. Incluye la analítica de visitas, que hoy está apagada. |
| **Quedarse en Hobby** | Gratis y funciona. Es una decisión consciente de riesgo, no un descuido: si lo detectan, el aviso llega y hay que migrar con prisa. |
| **Mover a otro alojamiento** | Posible, pero **no a uno estático** (GitHub Pages, hosting compartido clásico): el camarero virtual necesita un servidor. Alternativas con plan gratuito que sí valen: Netlify, Cloudflare Pages o Railway. Es una tarde de trabajo. |

Esto lo decide Brian. No bloquea publicar.

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

- **15 fotos de plato** (quedan 25 hechas de 40). Guía en `docs/guia-fotos-platos.md` — ojo, que
  desde el 15-10-2026 el criterio es **de lado**, no cenital.
- **La lista de alérgenos firmada** por Tatiana (`docs/alergenos-para-revisar.md`). La web ya avisa
  en todas partes de que se confirmen con el personal, pero su firma es lo que convierte el dato en
  suyo y no en nuestro.
- **Repetir la foto del bacalao en tempura**, de lado, que lo pidió ella.
- **El contrato de encargo de tratamiento** (art. 28 RGPD) entre Tatiana y Brian, y la confirmación
  de la gestoría sobre la declaración responsable de inicio de actividad (TU984B).
- **El texto del pie**: donde hoy pone "Diseño web Tu estudio".

---

*Escrito el 15-10-2026. Si cambia algo de Vercel o de GoDaddy, lo que manda es su pantalla, no este
papel: las dos cambian el sitio de los botones cada pocos meses.*
