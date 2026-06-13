import type { NextConfig } from "next";

const r2PublicUrl = process.env.R2_PUBLIC_URL;

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: r2PublicUrl
      ? [new URL(`${r2PublicUrl.replace(/\/$/, "")}/**`)]
      : [],
  },
};

export default nextConfig;
