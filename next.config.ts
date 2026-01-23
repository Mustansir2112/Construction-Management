import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Turbopack (Next.js 16 default)
  turbopack: {
    // Empty config to silence warnings and use defaults
  },
  
  // Optimize compilation speed
  experimental: {
    // Enable optimizations
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Optimize bundle size and loading
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Optimize images and static assets
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
