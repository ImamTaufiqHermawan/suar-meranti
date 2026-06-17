import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
};

export default nextConfig;
