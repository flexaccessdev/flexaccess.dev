import {
  ArrowRight,
  ArrowUpRight,
  DoorClosed,
  KeyRound,
  Laptop,
  Lock,
  Server,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import type { Route } from "./+types/home";
import { GITHUB_ORG_URL, comparison, products } from "../data";
import { pageMeta } from "../seo";

const sharedIdea: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: DoorClosed,
    title: "No inbound ports",
    body: "The server needs no public IP, no open port, and no port forwarding — clients dial a stable cryptographic identity instead of an address.",
  },
  {
    icon: Waypoints,
    title: "NAT traversal built in",
    body: "Direct paths are hole-punched through NAT and CGNAT; an encrypted relay carries traffic whenever a direct path isn't available.",
  },
  {
    icon: Lock,
    title: "End-to-end encrypted",
    body: "Traffic is encrypted from client to server. Relays that forward it can't read it.",
  },
  {
    icon: KeyRound,
    title: "Token-authenticated",
    body: "Every client presents its own auth token — whoever runs the server decides exactly who gets access.",
  },
];

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "flexaccess.dev — reach private networks without opening ports",
    description:
      "Open-source tunneling and VPN utilities. Clients dial the server by a stable cryptographic identity — NAT traversal and relay fallback built in — so the server needs no public IP, no inbound port, and no port forwarding.",
    path: "/",
  });

function TunnelDiagram() {
  return (
    <div className="tunnel-diagram" aria-hidden="true">
      <div className="td-node">
        <Laptop className="td-icon" />
        <span className="td-name">your device</span>
        <span className="td-sub">client</span>
      </div>
      <div className="td-link">
        <span className="td-link-label">encrypted tunnel</span>
        <div className="td-line" />
        <span className="td-link-sub">outbound only</span>
      </div>
      <div className="td-wall">
        <span className="td-wall-seg" />
        <span className="td-wall-seg" />
        <span className="td-wall-label">NAT / firewall</span>
      </div>
      <div className="td-link td-link-short">
        <div className="td-line" />
      </div>
      <div className="td-node">
        <Server className="td-icon" />
        <span className="td-name">private network</span>
        <span className="td-sub">no public IP · no open port</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="kicker">open source · flexaccessdev</p>
            <h1>
              Reach private networks without opening a single port.
            </h1>
            <p className="lede">
              Tunneling and VPN utilities where the client dials the server by a
              stable cryptographic identity — NAT traversal and relay fallback
              built in, everything end-to-end encrypted. The server needs no
              public IP, no inbound port, no port forwarding.
            </p>
            <div className="hero-availability">
              <span className="hero-availability-label">
                Both tools available on
              </span>
              <ul className="hero-platform-list">
                {products[0].platforms.map((platform) => (
                  <li key={platform} className="tool-platform">
                    {platform}
                  </li>
                ))}
              </ul>
            </div>
            <div className="hero-actions">
              <a href="#tools" className="button">
                See the tools
                <ArrowRight aria-hidden="true" />
              </a>
              <a href={GITHUB_ORG_URL} className="button button-ghost">
                GitHub
                <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </div>
          <TunnelDiagram />
        </div>
      </section>

      <section className="strip">
        <div className="container">
          <ul className="idea-grid">
            {sharedIdea.map((idea) => (
              <li key={idea.title} className="idea">
                <idea.icon className="idea-icon" aria-hidden="true" />
                <h2>{idea.title}</h2>
                <p>{idea.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="tools" id="tools">
        <div className="container">
          <h2 className="section-title">The tools</h2>
          <div className="tool-grid">
            {products.map((product) => (
              <article key={product.slug} className="tool-card">
                <p className="kicker">flexaccess.dev/{product.slug}</p>
                <h3 className="tool-title">
                  <img src={`/${product.slug}.svg`} alt="" className="tool-icon" />
                  {product.name}
                </h3>
                <p className="tool-tagline">{product.tagline}</p>
                <ul className="chip-row">
                  {product.chips.map((chip) => (
                    <li key={chip} className="chip">
                      {chip}
                    </li>
                  ))}
                </ul>
                <p className="tool-summary">{product.cardSummary}</p>
                <div className="tool-platforms">
                  <span className="tool-platforms-label">Available on</span>
                  <ul className="tool-platform-list">
                    {product.platforms.map((platform) => (
                      <li key={platform} className="tool-platform">
                        {platform}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="tool-links">
                  <a href={`/${product.slug}`} className="tool-more">
                    Learn more
                    <ArrowRight aria-hidden="true" />
                  </a>
                  <a href={`${GITHUB_ORG_URL}/${product.slug}`} className="tool-repo">
                    GitHub
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="compare" id="which-one">
        <div className="container">
          <h2 className="section-title">Which one do I want?</h2>
          <div className="compare-scroll">
            <div className="compare-table" role="table">
              <div className="compare-row compare-head" role="row">
                <span role="columnheader" />
                <a href="/ezvpn" role="columnheader">
                  <img src="/ezvpn.svg" alt="" className="compare-icon" />
                  ezvpn
                </a>
                <a href="/flextunnel" role="columnheader">
                  <img src="/flextunnel.svg" alt="" className="compare-icon" />
                  flextunnel
                </a>
              </div>
              {comparison.map((row) => (
                <div key={row.label} className="compare-row" role="row">
                  <span className="compare-label" role="rowheader">
                    {row.label}
                  </span>
                  <span role="cell">{row.ezvpn}</span>
                  <span role="cell">{row.flextunnel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
