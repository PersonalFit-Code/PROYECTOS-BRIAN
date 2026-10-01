# De dónde salen estas fichas

Son 12 de las **818** de [Anthropic Cybersecurity Skills][repo] (Apache-2.0,
de `mukul975`), el zip que pasó Brian el 1/10/2026. Aquí están copiadas sólo
las que le sirven de algo a un sitio **estático**: cabeceras, CSP,
clickjacking, XSS, exposición de datos, privacidad, enlaces rotos y cadena de
suministro.

Las otras ~806 no se copian porque no tocan nada de lo que hay en este
repositorio: SQL injection, JWT, Active Directory, forense de Windows,
seguridad industrial, respuesta a incidentes… Si algún día hacen falta, el
repositorio entero se instala como complemento de Claude Code en vez de
copiarlo a mano:

```
/plugin marketplace add mukul975/Anthropic-Cybersecurity-Skills
/plugin install cybersecurity-skills
```

## Lo que se hizo con ellas

La revisión del 1/10 y lo que salió está contado en
`bin-cami-cakes/README.md`, apartado **«Seguridad: lo que manda el servidor»**.
El resumen: la web no mandaba ninguna cabecera de seguridad, y ahora manda
siete, con una CSP por hash de cada script. Se puede volver a pasar con

```
python3 verifica_cabeceras.py   # en el cuaderno de trabajo
node z-csp.mjs                  # la web vive con las cabeceras puestas
node z-csp-muerde.mjs           # y la CSP bloquea de verdad
```

El `LICENSE` de al lado es el del repositorio original y cubre las 12 fichas.

[repo]: https://github.com/mukul975/Anthropic-Cybersecurity-Skills
