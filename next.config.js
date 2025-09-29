/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['graph.facebook.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Configurações para Railway
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
}

module.exports = nextConfig
