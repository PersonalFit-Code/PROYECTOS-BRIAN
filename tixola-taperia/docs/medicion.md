# La medición de la web: qué mide, qué se le dice a la gente y qué te toca a ti

_Escrito el 20 de octubre de 2026, el día que se encendió._

## Lo corto

Desde hoy la web mide visitas con **tres herramientas**, y ninguna se carga hasta que el
visitante pulsa «Aceptar» en el aviso de cookies:

| Herramienta | Qué hace | Cookies | Dónde se ve |
| --- | --- | --- | --- |
| **Vercel Web Analytics** | Cuenta páginas vistas, de dónde llega la gente y desde qué ciudad | Ninguna | vercel.com → proyecto → Analytics |
| **Google Analytics 4** | Lo mismo pero con mucho más detalle y con histórico | `_ga` y `_ga_RPV2JX7ZXW`, en nuestro dominio | analytics.google.com |
| **Microsoft Clarity** | Mapas de calor y reconstrucción del recorrido por la página | `_clck` y `_clsk`, más alguna de Microsoft | clarity.microsoft.com |

El aviso de cookies **vuelve a salirle a todo el mundo**, incluso a quien ya lo había aceptado
estos días. No es un fallo: lo que se aceptaba antes era «medimos de forma agregada, sin cookies»,
y eso ya no es lo que pasa. Un «sí» dado para una cosa no vale para otra distinta.

---

## Lo que ahora dice la web sobre Microsoft, y por qué conviene leerlo

Google Analytics es fácil de declarar: Google trata esos datos **por cuenta nuestra**, como
encargado del tratamiento, con un contrato que ya viene incluido por ser una empresa europea.

**Microsoft Clarity no.** Sus propias condiciones dicen que Microsoft y nosotros somos
*responsables independientes*, y que Microsoft puede usar lo que recoja **para sus propios fines,
incluida la elaboración de perfiles con fines publicitarios**. Eso hay que decirlo, y la web lo
dice: está en el panel de preferencias de cookies y en las dos políticas.

Lo que sí se ha hecho para reducirlo:

- **Se le dice que no a la publicidad.** Al aceptar, la web le manda a Microsoft
  `ad_Storage: "denied"`. Con eso no instala `MUID` —la cookie que su documentación describe como
  publicitaria— ni comparte nada con Microsoft Ads. Por eso la política puede seguir diciendo, y es
  verdad, que esta web no usa cookies de publicidad.
- **El chat queda fuera de las grabaciones.** Las burbujas de la conversación, la respuesta del
  camarero y los botones de preguntas rápidas van marcados para que Clarity los tape, y lo tapado
  no llega a salir del navegador. Ahí la gente escribe sus alergias, que son datos de salud.

**Si prefieres no decirle eso a tus clientes, se apaga en un commit de una línea** (vaciar
`CLARITY_ID` en `src/lib/medicion.ts`) y se repasan los textos. Dímelo y lo hago. Google Analytics
no tiene ese problema y puede quedarse igualmente.

---

## Tres cosas que tienes que mirar tú en los paneles

1. **GA4 → Administrar → Configuración de la propiedad → Uso compartido de datos.**
   Si está activado, Google deja de ser solo nuestro encargado para esos datos y pasa a usarlos
   también por su cuenta — y entonces la política de privacidad se queda corta. **Desactívalo.**
2. **GA4 → Administrar → Conservación de datos.** Tiene que estar en **2 meses**, que es el valor
   por defecto y lo que dice la política. Si alguna vez lo subes a 14, avísame y cambio el texto.
3. **Clarity → Settings → Masking.** Viene en «Balanced», que solo tapa números y correos. El chat
   ya va tapado desde el código y eso manda sobre el panel, así que «Balanced» vale. Si quieres ir
   a lo seguro, «Strict» tapa todo el texto; se ven igual los mapas de calor, pero las grabaciones
   pierden casi todo el interés.

Y una comprobación de un minuto, cuando entres la primera vez desde tu móvil: acepta las cookies,
abre las herramientas de desarrollador (o mira las cookies del sitio) y confirma que la segunda
cookie de Google se llama exactamente **`_ga_RPV2JX7ZXW`**. Es lo que dice la política de cookies.
Google publica el patrón pero no el nombre literal, así que es lo único de esa tabla que no está
verificado contra su documentación.

---

## Cuánto se guarda

- **Google Analytics**: los datos de usuario, 2 meses (su ajuste por defecto). Las cookies, 2 años
  desde la última visita, aunque los navegadores las acortan por su cuenta.
- **Microsoft Clarity**: las grabaciones, 30 días; las que marques como favoritas y una muestra
  elegida al azar, hasta 9 meses; los mapas de calor, 9 meses.
- **Vercel**: agregado, sin identificar a nadie.

---

## Si alguien ejerce sus derechos

Por el correo de contacto pueden pedir acceso, supresión u oposición. Dos avisos prácticos:

- En **Clarity no se puede borrar a un visitante concreto**: Microsoft solo permite borrar el
  proyecto entero. Si llega una petición de supresión, lo honesto es decir que se le ha retirado el
  consentimiento (lo que detiene la recogida) y que los datos ya recogidos caducan solos en los
  plazos de arriba.
- En **GA4** sí hay borrado por usuario, desde Administrar → Eliminación de datos.
