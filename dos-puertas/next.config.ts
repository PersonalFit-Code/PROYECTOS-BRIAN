import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    /* La carta vivió primero en /barra: los enlaces que ya se hayan compartido siguen funcionando. */
    return [{ source: "/:locale(es)/barra", destination: "/:locale/carta", permanent: true }];
  },
};

export default nextConfig;
