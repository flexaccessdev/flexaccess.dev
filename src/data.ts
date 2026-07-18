export const GITHUB_ORG_URL = "https://github.com/flexaccessdev";

export interface ClientApp {
  platform: string;
  name: string;
  description: string;
  repo: string;
}

export interface Product {
  slug: "ezvpn" | "flextunnel";
  name: string;
  tagline: string;
  metaDescription: string;
  cardSummary: string;
  chips: string[];
  platforms: string[];
  summary: string[];
  facts: { label: string; value: string }[];
  diagram: string;
  features: { title: string; body: string }[];
  clients: ClientApp[];
  goodFor: string[];
}

export const ezvpn: Product = {
  slug: "ezvpn",
  name: "ezvpn",
  tagline: "The easy-setup VPN for reaching private networks.",
  metaDescription:
    "ezvpn is an open-source VPN that routes IP packets through an encrypted tunnel with NAT traversal built in — no open inbound port, no public IP, no subnet planning. CLI, Linux, macOS, Windows, and iOS clients.",
  cardSummary:
    "Full IP routing to a private network — whole subnets, any protocol — with dynamic client addressing and zero port forwarding.",
  chips: ["IP layer", "root required"],
  platforms: ["CLI", "Linux", "macOS", "Windows", "iOS"],
  summary: [
    "ezvpn creates a virtual network interface and routes IP packets — IPv4, IPv6, or both — through an encrypted QUIC connection. Clients dial the server by its stable endpoint identity, so the server needs no public IP and no open inbound port: hole punching finds a direct path through NAT, and an encrypted relay carries traffic when it can't.",
    "There is no VPN subnet to plan, either. The server assigns client addresses dynamically, so nothing has to be kept collision-free by hand. A typical deployment is a small ezvpn server inside a private network — an AWS VPC, a homelab — that clients join temporarily to reach private resources.",
  ],
  facts: [
    { label: "Access level", value: "IP routing — whole subnets, any protocol" },
    { label: "Privileges", value: "Root / Administrator (creates the network interface)" },
    { label: "Tunnel modes", value: "Split or full, dual-stack IPv4 + IPv6" },
    { label: "Server exposure", value: "No public IP, no open inbound port" },
  ],
  diagram: `your device ══ IP packets over encrypted QUIC ══▶ ezvpn server ──▶ private subnet
(TUN iface)     NAT traversal · relay fallback       (no open port)    any protocol`,
  features: [
    {
      title: "No inbound ports",
      body: "Clients dial a stable endpoint identity — no port forwarding, no dynamic DNS, and it works from behind CGNAT.",
    },
    {
      title: "No subnet planning",
      body: "Client VPN addresses are assigned dynamically by the server, so there are no static IPs to keep collision-free.",
    },
    {
      title: "Split or full tunnel",
      body: "Route explicit private prefixes, or everything — with optional IPv4, IPv6, or dual-stack operation.",
    },
    {
      title: "End-to-end encrypted",
      body: "Traffic rides QUIC with TLS 1.3 from client to server. Relays that carry it can't decrypt it.",
    },
    {
      title: "Token-based auth",
      body: "Per-client tokens layered on cryptographic endpoint identity decide exactly who can connect.",
    },
    {
      title: "Auto-reconnect",
      body: "Keep-alive and idle-timeout health checks re-establish the tunnel when the path drops.",
    },
  ],
  clients: [
    {
      platform: "client and server CLI",
      name: "ezvpn",
      description: "The core — command-line client and server for Linux / macOS / Windows.",
      repo: `${GITHUB_ORG_URL}/ezvpn`,
    },
    {
      platform: "iOS / macOS",
      name: "ezvpn-apple",
      description:
        "The native GUI client for the ezvpn server — an iOS and macOS SwiftUI app with a packet-tunnel extension and multiple saved profiles.",
      repo: `${GITHUB_ORG_URL}/ezvpn-apple`,
    },
    {
      platform: "Windows",
      name: "ezvpn-windows",
      description:
        "The native GUI client for the ezvpn server — a WinUI 3 desktop app driving the same core.",
      repo: `${GITHUB_ORG_URL}/ezvpn-windows`,
    },
  ],
  goodFor: [
    "Private cloud subnets — instances in private or egress-only VPC subnets",
    "Home-hosted servers behind dynamic IPs, NAT, or CGNAT",
    "Temporary split-tunnel access without standing VPN infrastructure",
  ],
};

export const flextunnel: Product = {
  slug: "flextunnel",
  name: "flextunnel",
  tagline: "The rootless split tunnel for private TCP services.",
  metaDescription:
    "flextunnel is an open-source SOCKS5/HTTP proxy split tunnel: reach TCP services behind a server with server-side DNS, no root on either end, no open inbound port — and it runs alongside another VPN, including on iOS. CLI, Linux, macOS, Windows, and iOS clients.",
  cardSummary:
    "Proxy-level access to TCP services behind a server — server-side DNS, userspace sockets, and no admin rights needed on either end.",
  chips: ["proxy layer", "no root"],
  platforms: ["CLI", "Linux", "macOS", "Windows", "iOS"],
  summary: [
    "flextunnel gives you proxy-level access to hosts behind a server — without a VPN. The client runs local SOCKS5 and HTTP proxy listeners; targets on the server-pushed tunnel list are carried over an encrypted QUIC connection to the server, which resolves DNS and makes the outbound TCP connection from its own network. Everything else connects directly from your device.",
    "Because it uses ordinary userspace sockets — no TUN device — neither the client nor the server needs root or admin rights. And because it isn't a VPN, it sidesteps iOS's one-active-VPN-at-a-time restriction and runs happily alongside one.",
  ],
  facts: [
    { label: "Access level", value: "TCP via local SOCKS5 / HTTP proxy listeners" },
    { label: "Privileges", value: "None — no root or admin on either end" },
    { label: "DNS", value: "Resolved on the server's side of the network" },
    { label: "Coexistence", value: "Runs alongside another VPN, including on iOS" },
  ],
  diagram: `local app ──SOCKS5/HTTP──▶ flextunnel client   (127.0.0.1 · no root)
                               │  one encrypted QUIC connection
                               ▼
                           flextunnel server   (no root · no open port)
                               │  resolves DNS, connects from its own network
                               ▼
                           target host:port`,
  features: [
    {
      title: "Zero privileges",
      body: "Ordinary userspace sockets on both ends — no TUN device, so no root, no admin, no elevation prompts.",
    },
    {
      title: "Server-side DNS",
      body: "Reach names that only resolve on the server's network — or the server's own localhost.",
    },
    {
      title: "Split by default",
      body: "Only targets on the server-pushed tunnel list go through the tunnel; everything else connects directly.",
    },
    {
      title: "No inbound ports",
      body: "The same dial-by-identity transport: the server needs no public IP and no port forwarding.",
    },
    {
      title: "Coexists with VPNs",
      body: "It isn't a VPN, so it runs alongside one — sidestepping iOS's one-active-VPN-at-a-time limit.",
    },
    {
      title: "Per-client tokens",
      body: "Every client authenticates with its own token; whoever runs the server decides who gets in.",
    },
  ],
  clients: [
    {
      platform: "client and server CLI",
      name: "flextunnel",
      description: "The core — command-line client and server for Linux / macOS / Windows.",
      repo: `${GITHUB_ORG_URL}/flextunnel`,
    },
    {
      platform: "iOS",
      name: "flextunnel-ios",
      description:
        "Browse private networks in a built-in browser, or forward local ports so other apps can reach them.",
      repo: `${GITHUB_ORG_URL}/flextunnel-ios`,
    },
  ],
  goodFor: [
    "Web UIs, SSH, RDP, and databases that are only reachable from the server's network",
    "Shared or locked-down machines where you can't get admin rights",
    "Running next to a corporate or personal VPN — including on iOS",
  ],
};

export const products: Product[] = [ezvpn, flextunnel];

export interface CompareRow {
  label: string;
  ezvpn: string;
  flextunnel: string;
}

export const comparison: CompareRow[] = [
  {
    label: "You need",
    ezvpn: "Real IP routing — whole subnets, any protocol",
    flextunnel: "TCP access to specific services — web UIs, SSH, databases",
  },
  {
    label: "Privileges",
    ezvpn: "Root / Administrator to create the network interface",
    flextunnel: "None, on either end",
  },
  {
    label: "How apps connect",
    ezvpn: "Transparently, through the system routing table",
    flextunnel: "Through a local SOCKS5 / HTTP proxy",
  },
  {
    label: "Alongside another VPN",
    ezvpn: "iOS allows only one active VPN at a time",
    flextunnel: "Yes — it isn't a VPN",
  },
];
