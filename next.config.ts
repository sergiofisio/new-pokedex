import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokeAPI/sprites/**',
      },
      {
        protocol: 'https',
        hostname: 'bitbucket.org',
        pathname: '/infinitefusionsprites/**',
      },
      {
        protocol: 'https',
        hostname: 'art.hearthstonejson.com',
        pathname: '/v1/**',
      },
    ],
  },
};

export default nextConfig;
