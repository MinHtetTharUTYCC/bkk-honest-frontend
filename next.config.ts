import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/bkk-honest',
  // assetPrefix: '/bkk-honest/',
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-dbd03c09002b4ceaaee0a3dc11e66401.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
