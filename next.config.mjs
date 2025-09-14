/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Configure dynamic routes that use request.cookies or request.url
  experimental: {
    serverComponentsExternalPackages: ['mysql2', 'sequelize'],
    // This makes sure dynamic API routes work during build
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Set output to standalone for simpler deployment
  output: 'standalone',
  // Set environment variable for static build detection
  env: {
    NEXT_STATIC_BUILD: 'true',
    STATIC_BUILD: 'true',
  },
}

export default nextConfig
