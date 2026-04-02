import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack for better mobile compatibility
  experimental: {
    turbo: undefined,
  },
  // Enable standalone output for Docker deployment
  output: 'standalone',
};

export default nextConfig;
