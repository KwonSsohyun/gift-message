import type { NextConfig } from "next";

// Set by the GitHub Pages deploy workflow. GitHub Pages only serves static
// files, so that build drops the DB-backed dashboard/reservation routes and
// exports just the client-only gift message page (see
// .github/workflows/deploy-pages.yml).
const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/gift-message" : "";

const nextConfig: NextConfig = {
  ...(isGithubPages && {
    output: "export",
    images: { unoptimized: true },
  }),
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
