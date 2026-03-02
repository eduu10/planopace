import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['database'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'dgalywyr863hv.cloudfront.net' },
      { protocol: 'https', hostname: 'graph.facebook.com' },
      { protocol: 'https', hostname: 'd3nn82uaxijpm6.cloudfront.net' },
    ],
  },
};

export default nextConfig;
