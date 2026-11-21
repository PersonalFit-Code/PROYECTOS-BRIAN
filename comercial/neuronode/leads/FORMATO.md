# Formato de los ficheros de negocios

Un CSV por comunidad: `lote1-<comunidad>.csv`, en UTF-8, con cabecera y separado por comas (campos entre comillas dobles).

Columnas, en este orden:
`nombre,sector,subsector,comunidad,provincia,localidad,direccion,telefono,web,instagram,email_generico,fuente_url,notas`

- `sector`: `fitness`, `clinica` u `hosteleria`.
- `subsector`: por ejemplo gimnasio, entrenamiento personal, crossfit, pilates, yoga, fisioterapia, nutricion, psicologia, restaurante, pasteleria.
- `telefono`: 9 dígitos, sin espacios ni prefijo.
- `web` e `instagram`: dirección completa, o vacío si no tiene.
- `email_generico`: solo direcciones genéricas del negocio (info@, hola@, contacto@). Nunca correos de personas.
- `fuente_url`: la página donde se comprobó el dato.
- `notas`: una frase con lo que se ha visto (por ejemplo «sin web, solo Instagram» o «reservas por WhatsApp»).

Reglas:
- Solo datos públicos del negocio. Nada de datos personales de dueños o empleados.
- Si un dato no se encuentra, se deja vacío. No se inventa.
- Sin cadenas grandes ni franquicias nacionales.
