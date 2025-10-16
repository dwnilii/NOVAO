import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    // This is no longer needed as we use the /api/verify-pin route
    // NEXT_PUBLIC_ADMIN_PIN: process.env.NEXT_PUBLIC_ADMIN_PIN,
  },
  webpack: (config, { isServer }) => {
    // This is to make sqlite3 work with Next.js
    config.externals.push('sqlite3');
    return config;
  }
};

export default nextConfig;
