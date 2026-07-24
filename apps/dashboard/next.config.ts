import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@maverick-capital/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eizxlwrqdnihzljvovbh.supabase.co",
      },
    ],
  },
};

export default nextConfig;
