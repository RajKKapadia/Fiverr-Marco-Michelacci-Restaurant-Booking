import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true
  },
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
