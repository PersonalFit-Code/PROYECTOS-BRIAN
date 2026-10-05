/**
 * CONTORNO DE GALICIA para el mapa de denominaciones de /vinos.
 *
 * DE DÓNDE SALE. De la relación administrativa de Galicia en OpenStreetMap (relation 349036),
 * pedida a Nominatim con `polygon_threshold=0.02` para que llegue ya generalizada, y simplificada
 * después con Douglas-Peucker a una tolerancia de 0,12 unidades del lienzo (≈ 0,6 px al tamaño al
 * que se pinta). De 312 puntos quedan 291.
 *
 * Es un dato VERIFICABLE, no un dibujo a mano: ese era el motivo por el que antes no había silueta
 * en este mapa. Si hay que regenerarlo, la receta está arriba y la fuente es pública.
 *
 * ⚠️ LICENCIA. OpenStreetMap se publica bajo ODbL, que EXIGE atribución visible. La pinta
 * `Denominaciones.tsx` bajo el mapa (`m.vinos.mapCredit`). No quitarla sin sustituir la fuente.
 *
 * SE DESCARTAN LAS ISLAS. La relación trae 594 polígonos: uno es la península (312 puntos) y el
 * resto son islas e islotes de las Rías Baixas, ninguno mayor de 0,0005 unidades² de área. A este
 * tamaño serían motas de polvo, así que solo se queda la península.
 */

/**
 * Encuadre geográfico del lienzo, en grados. El eje Y va al revés que la latitud (arriba = norte).
 * Proyección equirectangular: a 225 × 233 km la distorsión es despreciable y las latitudes salen
 * rectas, que es lo que hace que las distancias entre denominaciones se lean bien.
 *
 * Las posiciones de `map` en `denominaciones.ts` SALEN DE AQUÍ. Si se toca este encuadre hay que recalcular
 * las seis: punto por punto, el mapa dejaría de decir la verdad.
 */
export const GALICIA_BOUNDS = { lonMin: -9.4, lonMax: -6.65, latMax: 43.85, latMin: 41.75 } as const;

/** Proporción real del encuadre (225 × 233 km): prácticamente cuadrado. */
export const GALICIA_RATIO = "aspect-[225/233]";

/** Contorno de la península gallega, en coordenadas 0-100 del lienzo. */
export const GALICIA_OUTLINE =
  "M5.03 38.16 L4.1 38.4 L4.36 39.82 L4.96 40.0 L5.2 40.62 L5.05 41.77 L3.71 44.14 L4.24 44.29 L4.52 44.75 L4.32 45.73 L6.1 43.25 L7.67 44.51 L7.6 42.75 L8.27 43.13 L9.97 44.97 L9.24 47.09 L10.67 48.21 L9.07 50.1 L9.67 50.41 L10.34 52.15 L11.0 52.25 L11.29 52.94 L12.79 51.47 L12.22 50.57 L13.94 49.78 L15.88 51.01 L18.12 48.67 L18.64 49.18 L18.13 49.89 L18.19 50.44 L18.51 50.5 L18.61 51.06 L17.13 50.78 L13.32 54.99 L13.07 57.77 L11.22 60.64 L12.46 60.58 L13.13 61.16 L13.0 63.45 L14.69 62.88 L14.95 61.18 L16.2 60.27 L17.45 60.15 L16.83 59.18 L18.22 57.4 L19.73 59.22 L19.68 58.25 L20.45 57.9 L19.6 57.34 L20.18 55.37 L21.81 57.79 L24.53 55.26 L22.84 59.82 L22.35 59.5 L21.97 60.48 L21.78 60.38 L21.53 60.67 L20.73 60.7 L20.74 61.08 L20.53 61.27 L21.09 61.31 L20.99 61.76 L20.51 61.31 L21.26 63.48 L21.16 64.2 L21.34 64.4 L21.81 64.03 L22.14 64.04 L20.73 64.91 L21.1 66.59 L19.29 66.75 L19.21 64.23 L16.66 66.03 L18.75 66.36 L20.4 69.8 L27.18 67.49 L23.47 71.9 L22.1 72.51 L20.4 71.96 L21.21 74.83 L19.79 73.34 L19.17 76.2 L26.92 74.23 L27.86 71.24 L28.66 71.64 L28.7 74.41 L22.72 77.52 L21.06 80.56 L19.99 80.64 L20.89 82.6 L18.16 82.74 L19.24 94.57 L27.78 85.82 L38.84 84.1 L43.68 80.75 L44.28 84.99 L46.59 84.18 L47.84 85.84 L47.78 87.31 L44.98 88.92 L43.02 92.22 L43.64 94.11 L44.75 93.97 L44.91 96.76 L50.4 96.24 L51.36 94.32 L53.77 93.91 L54.81 91.57 L55.53 95.48 L56.54 93.75 L61.79 92.49 L65.97 93.72 L65.04 96.23 L70.82 94.52 L71.73 97.27 L73.97 95.11 L80.12 93.81 L80.79 89.04 L87.05 90.45 L88.69 86.77 L86.05 84.56 L91.39 77.89 L95.01 77.82 L94.43 76.73 L96.87 73.28 L96.95 70.99 L92.96 68.77 L94.03 67.75 L93.7 64.7 L89.74 63.31 L88.05 64.61 L87.24 64.01 L86.23 64.39 L84.47 63.9 L86.05 60.28 L85.56 57.97 L87.11 57.48 L85.63 55.01 L92.09 50.61 L93.08 48.89 L91.96 46.49 L94.03 46.59 L92.2 41.25 L88.84 38.74 L88.65 40.92 L87.38 39.55 L89.5 36.36 L91.95 36.13 L93.77 33.63 L92.09 31.42 L88.83 34.05 L88.33 30.75 L84.98 28.82 L85.1 25.94 L83.6 26.01 L82.31 22.24 L80.61 21.78 L81.02 19.97 L83.54 20.14 L85.52 17.76 L86.03 14.27 L81.19 14.08 L78.69 13.37 L78.46 14.22 L77.63 14.58 L78.34 13.09 L76.52 12.16 L74.31 8.52 L68.55 6.26 L68.22 5.39 L66.0 6.6 L66.29 7.44 L65.39 9.13 L65.6 8.41 L65.49 8.27 L65.37 8.47 L65.01 8.43 L64.92 8.03 L65.22 6.27 L64.25 4.72 L61.75 5.45 L63.19 3.61 L62.27 2.84 L60.91 4.83 L57.17 6.48 L57.26 7.08 L57.89 7.27 L57.99 7.52 L55.96 6.81 L55.7 7.25 L56.57 8.3 L56.49 8.64 L54.35 8.51 L55.06 8.21 L55.57 8.48 L55.42 6.05 L55.88 6.62 L56.36 6.67 L55.7 3.65 L54.38 3.84 L50.89 6.9 L48.63 6.9 L48.15 9.04 L48.97 9.58 L47.94 10.21 L47.54 8.74 L47.26 9.65 L45.32 11.18 L44.07 10.9 L43.94 11.92 L41.43 13.95 L40.02 13.98 L39.21 13.56 L40.14 15.02 L38.85 16.07 L38.25 18.4 L38.9 18.9 L41.91 16.98 L43.62 17.76 L45.4 15.83 L43.57 18.58 L39.4 19.28 L44.61 20.49 L42.89 21.83 L43.28 24.87 L41.8 23.83 L42.11 23.19 L41.46 22.87 L41.19 22.17 L40.12 22.13 L39.75 21.16 L38.19 21.59 L38.41 21.84 L37.96 22.29 L38.1 22.41 L38.55 22.3 L38.6 22.93 L38.29 23.88 L37.78 24.21 L36.83 24.3 L36.22 23.16 L36.43 22.87 L37.3 23.09 L36.34 21.9 L31.87 23.66 L32.75 23.9 L32.55 24.75 L31.5 25.48 L25.06 26.67 L22.69 26.19 L20.27 24.04 L20.12 25.27 L19.07 25.61 L17.79 25.16 L17.94 25.88 L17.74 26.02 L17.91 26.51 L14.86 27.4 L16.26 27.92 L16.8 29.29 L16.69 29.71 L14.7 30.17 L14.08 29.36 L14.18 29.78 L13.16 31.11 L12.35 31.7 L11.76 31.61 L11.71 31.84 L8.23 31.41 L8.0 32.52 L7.3 33.13 L6.76 32.77 L6.75 33.28 L7.54 34.66 L7.62 34.52 L8.06 34.55 L7.82 34.36 L8.32 33.94 L8.57 33.21 L8.48 35.47 L7.61 36.22 L6.54 35.05 L6.53 36.26 L5.21 36.11 L5.49 37.08 L5.03 38.16 Z";
