import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  transpilePackages: ["@zuridesk/api-client", "@zuridesk/ui"]
};

export default nextConfig;
