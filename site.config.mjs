// Single source of truth for the site's base URL and static routes.
// Consumed by react-router.config.ts (prerender), scripts/generate-sitemap.mjs,
// and the route modules in src/ (canonical / OpenGraph URLs).

export const SITE_URL = "https://flexaccess.dev";

export const routes = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/ezvpn", changefreq: "weekly", priority: "0.8" },
  { path: "/flextunnel", changefreq: "weekly", priority: "0.8" },
];
