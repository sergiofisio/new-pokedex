import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'new-pokedex-one.vercel.app' }],
        destination: 'https://tavernadosjogos.com.br/:path*',
        permanent: true,
      },
    ];
  },
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
