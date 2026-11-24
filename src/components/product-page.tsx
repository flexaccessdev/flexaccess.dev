import { ArrowRight, ArrowUpRight, Download, Play } from "lucide-react";
import type { Feature, Product } from "../data";
import { GITHUB_ORG_URL, sharedKeys } from "../data";
import { InstallBlock } from "./install-block";
import { QuickStart } from "./quick-start";
import { SectionHeading } from "./section-heading";
import { FlowDiagram } from "./diagrams";
import { TerminalDemo } from "./terminal-demo";
import { ezvpnFlow, flextunnelFlow } from "./flows";

function groupFeatures(features: Feature[]) {
  const groups = new Map<string, Feature[]>();
  for (const feature of features) {
    const list = groups.get(feature.group) ?? [];
    list.push(feature);
    groups.set(feature.group, list);
  }
  return Array.from(groups, ([name, items]) => ({ name, items }));
}

export function ProductPage({ product }: { product: Product }) {
  const repoUrl = `${GITHUB_ORG_URL}/${product.slug}`;
  const other = product.slug === "ezvpn" ? "flextunnel" : "ezvpn";
  const flow = product.slug === "ezvpn" ? ezvpnFlow : flextunnelFlow;
  const flowFootnote =
    product.slug === "ezvpn"
      ? "In split-tunnel mode, the client routes the server's VPN address and any private prefixes you configure."
      : "Each matching request goes through its destination. Unmatched proxy requests connect directly. Port forwards always use a destination.";
  // Sections alternate between the plain and the tinted background, whichever
  // of the optional ones are present.
  let sectionCount = 0;
  const sectionClass = () =>
    sectionCount++ % 2 === 0 ? "product-section" : "product-section product-section-alt";

  return (
    <article className="product">
      <header className="product-hero">
        <div className="container product-hero-inner">
          <div className="product-hero-copy">
            <p className="kicker">flexaccess.dev / {product.slug}</p>
            <h1 className="product-title">
              <img src={`/${product.slug}.svg`} alt="" className="product-icon" />
              {product.name}
            </h1>
            <p className="lede">{product.tagline}</p>
            <ul className="chip-row">
              {product.chips.map((chip) => (
                <li key={chip} className="chip">
                  {chip}
                </li>
              ))}
              {product.platforms.map((platform) => (
                <li key={platform} className="chip chip-quiet">
                  {platform}
                </li>
              ))}
            </ul>
            <div className="hero-actions">
              <a href="#install" className="button">
                Install
                <Download aria-hidden="true" />
              </a>
              {product.demo ? (
                <a href="#demo" className="button button-ghost">
                  Watch the demo
                  <Play aria-hidden="true" />
                </a>
              ) : null}
              <a href={repoUrl} className="button button-ghost">
                GitHub
                <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </div>

          <dl className="facts" aria-label="At a glance">
            {product.facts.map((fact) => (
              <div key={fact.label} className="fact">
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <section className={sectionClass()}>
        <div className="container">
          <SectionHeading kicker="how it works" title="Encrypted connections by endpoint ID" />
          <FlowDiagram
            items={flow}
            footnote={flowFootnote}
            label={`How ${product.name} carries traffic from your device to the private network`}
          />
          <div className="product-prose">
            {product.summary.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {product.demo ? (
        <section className={sectionClass()} id="demo">
          <div className="container">
            <SectionHeading kicker="demo" title={product.demo.title} lede={product.demo.lede} />
            <TerminalDemo demo={product.demo} />
          </div>
        </section>
      ) : null}

      <section className={sectionClass()}>
        <div className="container">
          <SectionHeading kicker="features" title={`What ${product.name} gives you`} />
          <div className="feature-groups">
            {groupFeatures(product.features).map((group) => (
              <div key={group.name} className="feature-group">
                <h3 className="feature-group-title">{group.name}</h3>
                <ul className="feature-list">
                  {group.items.map((feature) => (
                    <li key={feature.title} className="feature">
                      <h4>{feature.title}</h4>
                      <p>{feature.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={sectionClass()} id="quick-start">
        <div className="container">
          <SectionHeading
            kicker="quick start"
            title="Set up a server and client"
            lede={
              <>
                The CLI flow, condensed from the README. You'll need {product.name} on
                both ends and{" "}
                <a href="/#keys">{sharedKeys.name}</a> on each client.
              </>
            }
          />
          <QuickStart steps={product.quickStart} />
        </div>
      </section>

      <section className={sectionClass()} id="install">
        <div className="container">
          <SectionHeading kicker="install" title="Get the CLI" />
          <InstallBlock commands={product.install} />
          <p className="install-note">
            {product.installNote}{" "}
            <a href="/#keys">
              Set up {sharedKeys.name}
              <ArrowRight aria-hidden="true" />
            </a>
          </p>
        </div>
      </section>

      <section className={sectionClass()}>
        <div className="container">
          <SectionHeading kicker="apps & repos" title="Pick your platform" />
          <ul className="client-grid">
            {product.clients.map((client) => (
              <li key={client.name} className="client-card">
                <span className="client-platform">{client.platform}</span>
                <a href={client.repo} className="client-name">
                  {client.name}
                  <ArrowUpRight aria-hidden="true" />
                </a>
                <p>{client.description}</p>
                {client.distribution ? (
                  <span className="client-dist">{client.distribution}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={sectionClass()}>
        <div className="container fit-grid">
          <div>
            <SectionHeading kicker="good for" title="Where it fits" />
            <ul className="good-for">
              {product.goodFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          {product.notes?.length ? (
            <div>
              <SectionHeading kicker="keep in mind" title="Where it doesn't" />
              <div className="product-notes">
                {product.notes.map((note) => (
                  <div key={note.title} className="product-note">
                    <h3>{note.title}</h3>
                    <p>
                      {note.body}
                      {note.link ? (
                        <>
                          {" "}
                          <a href={note.link.href}>
                            {note.link.label}
                            <ArrowUpRight aria-hidden="true" />
                          </a>
                        </>
                      ) : null}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className={sectionClass()}>
        <div className="container product-cta">
          <a href={repoUrl} className="button">
            View {product.name} on GitHub
            <ArrowUpRight aria-hidden="true" />
          </a>
          <a href={`/${other}`} className="button button-ghost">
            Compare with {other}
            <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </section>
    </article>
  );
}
