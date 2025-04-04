import { NextConfig } from 'next';

// Just use the basic properties that are definitely in the type definitions
const nextConfig: Partial<NextConfig> = {
  typescript: {
    // Ignore TypeScript errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint errors
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;