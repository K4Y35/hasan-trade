import type { NextConfig } from 'next';

const storefront = (process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const api = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/samples/:path*', destination: `${storefront}/samples/:path*` },
      { source: '/uploads/:path*', destination: `${api}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
