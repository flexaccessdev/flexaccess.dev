import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import { Github } from "lucide-react";
import type { Route } from "./+types/root";
import indexStylesheet from "./index.css?url";
import appStylesheet from "./app.css?url";
import { SITE_URL } from "../site.config.mjs";
import { GITHUB_ORG_URL } from "./data";

const SITE_NAME = "flexaccess.dev";
const DEFAULT_TITLE = "flexaccess.dev — reach private networks without opening ports";
const DEFAULT_DESCRIPTION =
  "Open-source tunneling and VPN utilities. Clients dial the server by a stable cryptographic identity — NAT traversal and relay fallback built in — so the server needs no public IP, no inbound port, and no port forwarding.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/flexaccess.svg`;

export const links: Route.LinksFunction = () => [
  { rel: "icon", type: "image/svg+xml", href: "/flexaccess.svg" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
  },
  { rel: "stylesheet", href: indexStylesheet },
  { rel: "stylesheet", href: appStylesheet },
];

export const meta: Route.MetaFunction = () => [
  { title: DEFAULT_TITLE },
  { name: "description", content: DEFAULT_DESCRIPTION },
  { property: "og:site_name", content: SITE_NAME },
  { property: "og:type", content: "website" },
  { property: "og:title", content: DEFAULT_TITLE },
  { property: "og:description", content: DEFAULT_DESCRIPTION },
  { property: "og:url", content: `${SITE_URL}/` },
  { property: "og:image", content: DEFAULT_OG_IMAGE },
  { name: "twitter:card", content: "summary" },
  { name: "twitter:title", content: DEFAULT_TITLE },
  { name: "twitter:description", content: DEFAULT_DESCRIPTION },
  { name: "twitter:image", content: DEFAULT_OG_IMAGE },
  { tagName: "link", rel: "canonical", href: `${SITE_URL}/` },
];

function navLinkClass(currentPath: string, target: string) {
  return `nav-link${currentPath === target ? " active" : ""}`;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="site">
          <header className="site-header">
            <div className="container header-inner">
              <a href="/" className="brand">
                <img src="/flexaccess.svg" alt="" className="brand-logo" />
                <span className="brand-name">flexaccess.dev</span>
              </a>

              <nav className="site-nav" aria-label="Main">
                <a href="/ezvpn" className={navLinkClass(pathname, "/ezvpn")}>
                  <img src="/ezvpn.svg" alt="" className="nav-product-icon" />
                  ezvpn
                </a>
                <a href="/flextunnel" className={navLinkClass(pathname, "/flextunnel")}>
                  <img src="/flextunnel.svg" alt="" className="nav-product-icon" />
                  flextunnel
                </a>
                <a href={GITHUB_ORG_URL} className="nav-link nav-link-external">
                  <Github className="nav-github-icon" aria-hidden="true" />
                  GitHub
                </a>
              </nav>
            </div>
          </header>

          <main className="content">{children}</main>

          <footer className="site-footer">
            <div className="container footer-inner">
              <p>Open-source tunneling and VPN utilities for reaching private networks.</p>
              <a href={GITHUB_ORG_URL}>flexaccessdev on GitHub</a>
            </div>
          </footer>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}
