import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // Disabled to allow dynamic Admin Panel & Database fetching
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
