# Persianas López: propuestas de mejora

## Hechas

- Páginas legales (aviso legal, privacidad, cookies y condiciones de contratación) redactadas para Persianas López.
- RGPD/LOPDGDD: información básica por capas en contacto y en el asistente, con casilla sin marcar antes de enviar.
- Cookies (Guía AEPD): panel con «Aceptar» y «Rechazar» con el mismo peso y «Configurar». El mapa de Google y las estadísticas solo se cargan con permiso. «Configurar cookies» en el pie.
- Condiciones de contratación (TRLGDCU): procedimiento, validez, desplazamientos, cancelaciones, desistimiento, garantías y hojas de reclamación de la Xunta.
- Analítica sin cookies preparada: cuenta llamadas, clics de WhatsApp, uso del asistente y del mapa. Falta activarla (GoatCounter o Vercel Analytics).
- Páginas por servicio (4).
- Catálogo de repuestos con ilustraciones y muestrario de colores de lama interactivo.
- Producción: Tailwind compilado, tipografías alojadas en la propia web (sin Google Fonts), imagen para compartir, sitemap y conversión automática de fotos a WebP.
- Versión completa en gallego con selector de idioma.
- Asistente de presupuesto que recoge los datos y los manda por WhatsApp.
- Logo sacado de la tarjeta de visita y portada solo con el logo.
- Galería con fotos de modelos (estores noche y día, venecianas, estores enrollables).
- Datos de la tarjeta: reparaciones a domicilio, motores, compactos, rústicas, verticales, fantasías y Velux.

- Diagnóstico de la persiana en 1 minuto (causa, si la puedes arreglar tú, pieza, visita o urgencia por WhatsApp).
- Probador «Pruébala en tu ventana» con foto propia (la foto no sale del móvil).
- Guía de medidas que pasa las medidas al asistente.
- Guías «Arréglala tú» en repuestos y botón «Reservar para recoger» en cada pieza.
- Aviso de temporada en la portada según el mes.
- Código QR que abre el asistente: /qr/asistente-es.png y /qr/asistente-gl.png (también en SVG para imprenta).
- Preparados y ocultos hasta tener datos: «Abierto ahora / Cerrado» (HORARIO), «Antes y después» (ANTES_DESPUES) y vídeos de las guías (VIDEOS), todo en `src/config.mjs`.

## Datos que tiene que dar el negocio (salen como [PENDIENTE] en la web)

- Nombre o razón social, NIF y correo para protección de datos (`src/config.mjs`, `titular`).
- Validez del presupuesto, coste de desplazamiento o visita, coste de cancelación y garantía de las reparaciones (`src/config.mjs`, `condiciones`).
- Confirmar que el cartel de hojas de reclamación de la Xunta está a la vista en la tienda.
- Horario real de la tienda para «Abierto ahora».
- Fotos de trabajos propios (antes y después) y, si se graban, enlaces a vídeos de las guías.
- Confirmar el plazo de un año para borrar consultas que no acaban en encargo (política de privacidad).

## Siguientes

1. Fotos de trabajos hechos por el negocio (antes y después) y del stock de repuestos.
2. Reseñas reales de Google copiadas tal cual, con permiso.
3. Horario real y aviso de "Abierto ahora / Cerrado".
4. Dominio propio y alta en Google Search Console y Google Business Profile.
5. Precios orientativos en el asistente.
6. Conectar Vercel al repositorio de GitHub para que cada cambio se publique solo.
