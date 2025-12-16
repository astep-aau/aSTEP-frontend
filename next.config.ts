import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: '/cross-group',
        destination: '/docs/cross-group/',
        permanent: false,
      },
      {
        source: '/cross-group/:path*',
        destination: '/docs/cross-group/:path*',
        permanent: false,
      },
      {
        source: '/time-series',
        destination: '/docs/time-series/',
        permanent: false,
      },
      {
        source: '/time-series/:path*',
        destination: '/docs/time-series/:path*',
        permanent: false,
      },
      {
        source: '/group-3',
        destination: '/docs/group-3/',
        permanent: false,
      },
      {
        source: '/group-3/:path*',
        destination: '/docs/group-3/:path*',
        permanent: false,
      },
      {
        source: '/group-6',
        destination: '/docs/group-6/',
        permanent: false,
      },
      {
        source: '/group-6/:path*',
        destination: '/docs/group-6/:path*',
        permanent: false,
      },
      {
        source: '/group-11',
        destination: '/docs/group-11/',
        permanent: false,
      },
      {
        source: '/group-11/:path*',
        destination: '/docs/group-11/:path*',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite /docs/ to /docs/index.html
        {
          source: '/docs/',
          destination: '/docs/index.html',
        },
        // Rewrite /docs to /docs/index.html
        {
          source: '/docs',
          destination: '/docs/index.html',
        },
        // Rewrite /docs/some-path/ to /docs/some-path/index.html
        {
          source: '/docs/:path*/',
          destination: '/docs/:path*/index.html',
        },
      ],
    };
  },
  webpack: (config, { isServer }) => {
    // Exclude docs directory from webpack compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules', '**/docs/**'],
    };
    return config;
  },
};

export default nextConfig;
