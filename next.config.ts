import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Pinata public gateway
      { protocol: "https", hostname: "gateway.pinata.cloud" },
      // Pinata custom dedicated gateways (*.mypinata.cloud)
      { protocol: "https", hostname: "**.mypinata.cloud" },
      // Cloudflare IPFS gateway
      { protocol: "https", hostname: "cloudflare-ipfs.com" },
      // Protocol Labs gateways
      { protocol: "https", hostname: "dweb.link" },
      { protocol: "https", hostname: "ipfs.io" },
    ],
  },
};

import { withSentryConfig } from "@sentry/nextjs";

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "galagiorchi",
  project: "hunty",
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
