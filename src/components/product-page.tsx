import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import type { Product } from "../data";
import { GITHUB_ORG_URL } from "../data";

export function ProductPage({ product }: { product: Product }) {
  const repoUrl = `${GITHUB_ORG_URL}/${product.slug}`;
  const other = product.slug === "ezvpn" ? "flextunnel" : "ezvpn";

  return (
    <article className="product">
      <div className="container">
        <header className="product-hero">
          <p className="kicker">flexaccess.dev / {product.slug}</p>
          <h1 className="product-title">
            <img src={`/${product.slug}.svg`} alt="" className="product-icon" />
            {product.name}
          </h1>
          <p className="lede">{product.tagline}</p>

          <dl className="facts">
            {product.facts.map((fact) => (
              <div key={fact.label} className="fact">
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <section className="product-section product-prose">
          {product.summary.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </section>

        <section className="product-section">
          <h2 className="section-title">How it works</h2>
          <pre className="diagram">{product.diagram}</pre>
        </section>

        <section className="product-section">
          <h2 className="section-title">Features</h2>
          <ul className="feature-grid">
            {product.features.map((feature) => (
              <li key={feature.title} className="feature">
                <Check className="feature-check" aria-hidden="true" />
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="product-section">
          <h2 className="section-title">Apps &amp; repos</h2>
          <ul className="client-list">
            {product.clients.map((client) => (
              <li key={client.name} className="client">
                <span className="client-platform">{client.platform}</span>
                <div className="client-body">
                  <a href={client.repo} className="client-name">
                    {client.name}
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                  <p>{client.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="product-section">
          <h2 className="section-title">Good for</h2>
          <ul className="good-for">
            {product.goodFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <div className="product-cta">
          <a href={repoUrl} className="button">
            View {product.name} on GitHub
            <ArrowUpRight aria-hidden="true" />
          </a>
          <a href={`/${other}`} className="button button-ghost">
            Compare with {other}
            <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
