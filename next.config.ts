import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/creators/:username",
        destination: "/u/:username",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "zrordxixzhczgxdhcmku.supabase.co",
      },
    ],
  },
};

export default nextConfig;
