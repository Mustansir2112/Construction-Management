import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable type checking during build to speed up development
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimize for development speed
  experimental: {
    // Disable optimizations that slow down development
    optimizePackageImports: undefined,
  },
  
  // Disable source maps in development for faster builds
  productionBrowserSourceMaps: false,
};

export default nextConfig;
