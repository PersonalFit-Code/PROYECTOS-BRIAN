import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    /* Calidades que el proyecto pide de verdad. Next 16 ya no acepta cualquier valor: solo sirve los
       de esta lista, y lo que no esté aquí lo rebaja a 75 con un aviso en consola. Pasaba con la foto
       de la terraza (82, en la portada y en la sección de experiencia) y con la galería (80 y 88),
       que se estaban sirviendo peor de lo que pedía el código sin que nadie lo notara. */
    qualities: [75, 80, 82, 88],
  },
};

export default nextConfig;
