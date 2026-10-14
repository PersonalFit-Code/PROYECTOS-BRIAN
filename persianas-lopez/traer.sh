#!/bin/sh
# Instalación en Vercel. Si el despliegue solo lleva la configuración (sin el código),
# descarga el código de este repositorio en el commit indicado en version.txt.
set -e
if [ ! -f package.json ]; then
  SHA=$(cat version.txt)
  curl -fsSL "https://codeload.github.com/personalfit-code/proyectos-brian/tar.gz/$SHA" \
    | tar -xz --strip-components=2 "proyectos-brian-$SHA/persianas-lopez"
fi
npm install --no-audit --no-fund
