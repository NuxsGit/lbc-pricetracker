/** @type {import('next').NextConfig} */

// GitHub Pages project site is served from:
//   https://<owner>.github.io/lbc-pricetracker/
// so every asset path is prefixed with the repo name.
const repoName = "lbc-pricetracker";

const nextConfig = {
  reactStrictMode: true,
  // Static site export (no Node server) — perfect for GitHub Pages.
  output: "export",
  // Served under /lbc-pricetracker/ on the Pages host.
  basePath: `/${repoName}`,
  assetPrefix: `/${repoName}`,
  // Friendly direct-file access on GitHub Pages.
  trailingSlash: true,
};

export default nextConfig;
