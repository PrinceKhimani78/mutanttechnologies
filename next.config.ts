import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'mutanttechnologies.com',
          },
        ],
        destination: 'https://www.mutanttechnologies.com/:path*',
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
