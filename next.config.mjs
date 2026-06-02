/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a self-contained .next/standalone output for lean Docker images.
  // The production container only ships server.js + traced dependencies —
  // no full node_modules copy needed.
  output: 'standalone',
}

export default nextConfig
