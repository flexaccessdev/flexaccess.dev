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
- `src/data.ts` — all product content (taglines, features, install commands, client apps, shared repos, comparison table)
- `src/routes/` — page components; `src/components/product-page.tsx` renders both product pages
- `src/components/` — `code-block.tsx` / `copy-button.tsx` (code with copy-to-clipboard), `install-block.tsx` (install commands), `quick-start.tsx` (numbered walkthrough), `diagrams.tsx` + `flows.ts` (the hero SVG and the per-product flow diagrams), `terminal-demo.tsx` (the terminal recording player), `section-heading.tsx`
- `src/index.css` — design tokens (light and dark, via `prefers-color-scheme`); `src/app.css` — component styles
- `public/og.png` — social-preview image, rendered from `scripts/og/og.html` with `scripts/render-og.sh` (needs a local Chrome; not part of the build)
- `public/demos/` — the terminal recordings on the product pages; see below

## The demo recordings

Each product page plays recordings from `public/demos/`, each an [asciicast](https://docs.asciinema.org/manual/asciicast/v2/) of a real session on two Linux hosts in a tmux window, server on the left and client on the right:

- `ezvpn.cast` — key generation, a four-setting server config, a client connecting by endpoint ID, a ping through the tunnel, and a disconnect
- `flextunnel.cast` — the same keyed setup as ezvpn's: a flexaccess-keys key pair on the client, a two-line server config, the server as a destination in the client's config, and a second shell on the client fetching a page served only on the server's loopback through the SOCKS5 port
- `flextunnel-quick.cast` — a `--quick` session, the second demo on the flextunnel page: each side enters the other's endpoint ID, and the second shell fetches the same page while the client's live panel runs above it

They are played by a self-hosted [asciinema-player](https://docs.asciinema.org/manual/player/), loaded only when the demo scrolls into view (`src/components/terminal-demo.tsx`); its colours are the `flexaccess` theme in `src/app.css`.

`scripts/demo/record-ezvpn.sh` and `scripts/demo/record-flextunnel.sh` re-record them — not part of the build; run one after a release changes what its demo shows, then commit the `.cast`:

```sh
DEMO_SERVER=debian@server-host DEMO_CLIENT=debian@client-host \
  scripts/demo/record-ezvpn.sh --install
DEMO_SERVER=debian@server-host DEMO_CLIENT=debian@client-host \
  scripts/demo/record-flextunnel.sh --install          # flextunnel.cast
DEMO_SERVER=debian@server-host DEMO_CLIENT=debian@client-host \
  scripts/demo/record-flextunnel.sh --quick --install  # flextunnel-quick.cast
```

They need `tmux`, `node` and `asciinema` 3.x locally, and two Linux hosts that this machine can ssh into (with passwordless sudo for ezvpn, which runs as root; flextunnel needs it only for `DEMO_DISABLE_IPV6_IFACE`). The scripts type the commands, wait for the real output, and never edit what was on screen; their keystroke helpers are in `scripts/demo/lib.sh`, and `scripts/demo/finish-cast.mjs` only cuts tmux's teardown off the end and rejects a recording that shows a non-private IP address. `--install` starts the recording with the install one-liners (so it shows the latest release); without it the hosts' already-installed binaries are used, which is how to record an unreleased build. Each script's header lists its environment variables.

If a recording's terminal size or length changes, update `cols`, `rows` and `poster` in its entry in the product's `demos` list in `src/data.ts`; `poster` is a playback time, after pauses are shortened to two seconds.

## Deployment

Deployed on Cloudflare Pages via the Git integration:

- **Build command:** `npm run build`
- **Build output directory:** `build/client`

`public/_headers` and `public/_redirects` configure caching and the 404 page.
