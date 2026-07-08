import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Full node_modules image so `prisma db push` and the admin-init script
  // are available at container start. See docker/entrypoint.sh.
};

export default nextConfig;
