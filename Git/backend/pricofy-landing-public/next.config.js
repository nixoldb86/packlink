/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Evitar que Next.js intente pre-renderizar rutas API
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
