import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    staleTimes: {
      dynamic: 0
    }
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig
