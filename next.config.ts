import type { NextConfig } from "next";

const r2PublicUrl = process.env.R2_PUBLIC_URL;

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["jsdom", "isomorphic-dompurify"],
  images: {
    remotePatterns: r2PublicUrl
      ? [new URL(`${r2PublicUrl.replace(/\/$/, "")}/**`)]
      : [],
  },
};

export default nextConfig;
