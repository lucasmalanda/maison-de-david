import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Le dashboard est aussi servi via maisondedavid.ch/login (rewrite depuis le site public)
      allowedOrigins: ["maisondedavid.ch", "www.maisondedavid.ch"],
    },
  },
};

export default nextConfig;
