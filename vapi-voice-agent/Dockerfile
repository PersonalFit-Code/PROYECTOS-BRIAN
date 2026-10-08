# Imagen para desplegar el servidor en cualquier sitio que acepte Docker
# (Render, Railway, Fly, Cloud Run). Dos etapas: se compila con las
# dependencias de desarrollo y se publica solo con lo necesario para correr.

FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist

# No corre como root: si alguien se cuela, que no sea con todos los permisos.
USER node

# El hosting decide el puerto con la variable PORT; 3000 es solo el valor por
# defecto para correrlo en local.
EXPOSE 3000
CMD ["node", "dist/index.js"]
