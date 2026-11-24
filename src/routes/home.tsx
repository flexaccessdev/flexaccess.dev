import {
  ArrowRight,
  ArrowUpRight,
  DoorClosed,
  KeyRound,
  Lock,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import type { Route } from "./+types/home";
import {
  GITHUB_ORG_URL,
  allPlatforms,
  comparison,
  products,
  sharedKeys,
  sharedRepos,
} from "../data";
import { pageMeta } from "../seo";
import { InstallBlock } from "../components/install-block";
import { CodeBlock } from "../components/code-block";
import { SectionHeading } from "../components/section-heading";
import { DialDiagram } from "../components/diagrams";

const sharedIdea: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: DoorClosed,
    title: "No inbound ports",
    body: "The server needs no public IP, no open port, and no port forwarding. Clients dial a stable endpoint ID — itself an Ed25519 public key — instead of an address.",
  },
  {
    icon: Waypoints,
    title: "NAT traversal built in",
    body: "The tools try to establish a direct path through NAT and CGNAT. A relay carries encrypted traffic when a direct path is unavailable. A connection can switch to direct when a path opens up.",
  },
  {
    icon: Lock,
    title: "End-to-end encrypted",
    body: "Traffic rides QUIC with TLS 1.3 from client to server. Relays that forward it see only ciphertext and connection metadata — never plaintext.",
  },
  {
    icon: KeyRound,
    title: "Key-authenticated",
    body: "The server checks each regular client's Ed25519 public key against its authorized-keys file. In flextunnel's quick mode, peers authenticate using the endpoint IDs they exchange.",
  },
];

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "flexaccess.dev — reach private networks without opening ports",
    description:
      "Open-source tunneling and VPN utilities for Linux, macOS, Windows, and iOS. Clients dial the server by a stable cryptographic identity — NAT traversal and relay fallback built in — so the server needs no public IP, no inbound port, and no port forwarding.",
    path: "/",
  });

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="kicker">open source · flexaccessdev</p>
            <h1>Reach private networks without opening a single port.</h1>
            <p className="lede">
              Tunneling and VPN utilities built on iroh. Clients dial the server by a
              stable cryptographic identity, so it needs no public IP, no inbound
              port, and no port forwarding — NAT traversal, relay fallback, and
              per-client keys are built in.
            </p>
            <div className="hero-availability">
              <span className="hero-availability-label">Available on</span>
              <ul className="chip-row">
                {allPlatforms.map((platform) => (
                  <li key={platform} className="chip chip-quiet">
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
          <div className="hero-visual">
            <DialDiagram />
          </div>
        </div>
      </section>

      <section className="strip" aria-label="What every tool shares">
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
          <SectionHeading
            kicker="the tools"
            title="Two tools, one transport"
            lede="Same dial-by-identity connection, same keys, same relays. They differ in which layer they give you — and whether you need root to get it."
          />
          <div className="tool-grid">
            {products.map((product) => (
              <article key={product.slug} className="tool-card">
                <div className="tool-head">
                  <img src={`/${product.slug}.svg`} alt="" className="tool-icon" />
                  <div>
                    <h3 className="tool-title">{product.name}</h3>
                    <p className="tool-tagline">{product.tagline}</p>
                  </div>
                </div>
                <ul className="chip-row">
                  {product.chips.map((chip) => (
                    <li key={chip} className="chip">
                      {chip}
                    </li>
                  ))}
                </ul>
                <p className="tool-summary">{product.cardSummary}</p>
                <div className="tool-pick">
                  <span className="tool-pick-label">Pick it when</span>
                  <ul className="tool-pick-list">
                    {product.pickWhen.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="tool-links">
                  <a href={`/${product.slug}`} className="button">
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
          <SectionHeading
            kicker="which one"
            title="Which one do I want?"
            lede="Side by side, on the things that decide it."
          />
          <div className="compare-scroll">
            <div className="compare-table" role="table">
              <div className="compare-row compare-head" role="row">
                <span role="columnheader" />
                {products.map((product) => (
                  <a key={product.slug} href={`/${product.slug}`} role="columnheader">
                    <img src={`/${product.slug}.svg`} alt="" className="compare-icon" />
                    {product.name}
                  </a>
                ))}
              </div>
              {comparison.map((row) => (
                <div key={row.label} className="compare-row" role="row">
                  <span className="compare-label" role="rowheader">
                    {row.label}
                  </span>
                  <span role="cell" data-label="ezvpn">
                    {row.ezvpn}
                  </span>
                  <span role="cell" data-label="flextunnel">
                    {row.flextunnel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="keys" id="keys">
        <div className="container keys-inner">
          <div className="keys-copy">
            <SectionHeading
              kicker={`shared · ${sharedKeys.name}`}
              title={sharedKeys.tagline}
              lede={sharedKeys.body}
            />
            <InstallBlock commands={sharedKeys.install} />
            <a href={sharedKeys.repo} className="tool-repo keys-repo">
              {sharedKeys.name} on GitHub
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
          <div className="keys-example">
            <CodeBlock code={sharedKeys.example} title="generate · show · authorize" noCopy />
          </div>
        </div>
      </section>

      <section className="shared-repos">
        <div className="container">
          <SectionHeading
            kicker="under the hood"
            title="One foundation, kept in its own repos"
            lede="Both tools share a transport crate and key format. Configure both ends with the same list of at least two custom relays to avoid public iroh relays and discovery services."
          />
          <ul className="repo-grid">
            {sharedRepos.map((repo) => (
              <li key={repo.name} className="repo-card">
                <span className="repo-kind">{repo.kind}</span>
                <a href={repo.repo} className="client-name">
                  {repo.name}
                  <ArrowUpRight aria-hidden="true" />
                </a>
                <p>{repo.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
