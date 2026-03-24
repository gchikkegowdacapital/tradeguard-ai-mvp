/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  typescript: {
    strictNullChecks: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  compress: true,
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
