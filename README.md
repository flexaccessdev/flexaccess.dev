# flexaccess.dev

The home page for [flexaccess.dev](https://flexaccess.dev) — open-source tunneling and VPN utilities from the [flexaccessdev](https://github.com/flexaccessdev) organization.

A fully prerendered static site: React 19 + React Router v7 (framework mode, `ssr: false` with an explicit `prerender` route list), Vite, TypeScript, and vanilla CSS. No server runtime.

## Development

```sh
npm install
npm run dev        # http://localhost:5173
```

## Build

```sh
npm run build      # output in build/client
npm run preview    # serve the built site locally
```

The build runs `react-router build`, then two post-build steps:

- `scripts/flatten-html.mjs` — renames prerendered `route/index.html` files to `route.html` so Cloudflare Pages serves clean URLs without trailing slashes
- `scripts/generate-sitemap.mjs` — writes `sitemap.xml` from the route list in `site.config.mjs`

## Editing content

- `site.config.mjs` — site URL and the list of prerendered routes (drives prerendering, the sitemap, and canonical URLs). Any new route must be added here or it won't be emitted as static HTML.
- `src/data.ts` — all product content (taglines, features, client apps, comparison table)
- `src/routes/` — page components; `src/components/product-page.tsx` renders both product pages
- `src/index.css` — design tokens; `src/app.css` — component styles

## Deployment

Deployed on Cloudflare Pages via the Git integration:

- **Build command:** `npm run build`
- **Build output directory:** `build/client`

`public/_headers` and `public/_redirects` configure caching and the 404 page.
