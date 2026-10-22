import { Laptop, Lock, Radio, Server, type LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Home hero: how a client reaches a server that has no open port.     */
/* ------------------------------------------------------------------ */

export function DialDiagram() {
  return (
    <svg
      className="dial"
      viewBox="0 0 480 284"
      role="img"
      aria-labelledby="dial-title"
    >
      <title id="dial-title">
        A client behind NAT reaches a server with no open port: the relay carries
        signalling and encrypted fallback traffic, and a hole-punched direct path
        carries the rest.
      </title>

      {/* relay paths */}
      <path className="dial-relay-path" d="M 70 118 C 70 58, 136 46, 200 46" />
      <path className="dial-relay-path" d="M 410 118 C 410 58, 344 46, 280 46" />

      {/* relay pill */}
      <g className="dial-relay">
        <rect x="196" y="24" width="88" height="44" rx="22" />
        <Radio x="212" y="36" width="20" height="20" />
        <text x="240" y="51">relay</text>
      </g>
      <text className="dial-caption" x="240" y="94" textAnchor="middle">
        signalling · encrypted fallback
      </text>

      {/* NAT wall with a punched hole */}
      <g className="dial-wall">
        <rect x="150" y="104" width="12" height="46" rx="6" />
        <rect x="150" y="188" width="12" height="46" rx="6" />
      </g>
      <text className="dial-caption" x="156" y="258" textAnchor="middle">
        NAT / firewall
      </text>

      {/* direct path */}
      <line className="dial-direct" x1="124" y1="169" x2="356" y2="169" />
      <text className="dial-caption dial-accent" x="262" y="156" textAnchor="middle">
        direct · hole-punched
      </text>
      <g className="dial-lock">
        <Lock x="210" y="180" width="13" height="13" />
        <text x="228" y="191">QUIC · TLS 1.3</text>
      </g>

      {/* client node */}
      <g className="dial-node">
        <rect x="16" y="118" width="108" height="100" rx="12" />
        <Laptop x="58" y="130" width="24" height="24" />
        <text className="dial-name" x="70" y="178" textAnchor="middle">
          your device
        </text>
        <text className="dial-sub" x="70" y="198" textAnchor="middle">
          behind NAT
        </text>
      </g>

      {/* server node */}
      <g className="dial-node">
        <rect x="356" y="118" width="108" height="100" rx="12" />
        <Server x="398" y="130" width="24" height="24" />
        <text className="dial-name" x="410" y="178" textAnchor="middle">
          your server
        </text>
        <text className="dial-sub" x="410" y="198" textAnchor="middle">
          no public IP
        </text>
        <text className="dial-sub" x="410" y="212" textAnchor="middle">
          no open port
        </text>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Product pages: a linear flow that stacks vertically on phones.      */
/* ------------------------------------------------------------------ */

export type FlowItem =
  | { kind: "node"; icon: LucideIcon; title: string; sub?: string; accent?: boolean }
  | { kind: "link"; label?: string; sub?: string; style?: "tunnel" | "plain" };

export function FlowDiagram({
  items,
  footnote,
  label,
}: {
  items: FlowItem[];
  footnote?: string;
  label: string;
}) {
  return (
    <figure className="flow">
      <div className="flow-track" role="img" aria-label={label}>
        {items.map((item, index) =>
          item.kind === "node" ? (
            <div
              key={index}
              className={`flow-node${item.accent ? " flow-node-accent" : ""}`}
            >
              <item.icon className="flow-icon" aria-hidden="true" />
              <span className="flow-title">{item.title}</span>
              {item.sub ? <span className="flow-sub">{item.sub}</span> : null}
            </div>
          ) : (
            <div
              key={index}
              className={`flow-link${item.style === "tunnel" ? " flow-link-tunnel" : ""}`}
            >
              {item.label ? <span className="flow-link-label">{item.label}</span> : null}
              <span className="flow-line" />
              {item.sub ? <span className="flow-link-sub">{item.sub}</span> : null}
            </div>
          ),
        )}
      </div>
      {footnote ? <figcaption className="flow-footnote">{footnote}</figcaption> : null}
    </figure>
  );
}
