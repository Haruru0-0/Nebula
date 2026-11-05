/** @type {import('next').NextConfig} */
// Where the API runs (Render today, a home server later). Browser calls to /api are forwarded here.
const backend = (process.env.BACKEND_URL ?? "http://localhost:4000").replace(/\/+$/, "")

const nextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
