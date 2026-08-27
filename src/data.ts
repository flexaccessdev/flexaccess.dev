export const GITHUB_ORG_URL = "https://github.com/flexaccessdev";

export interface ClientApp {
  platform: string;
  name: string;
  description: string;
  repo: string;
}

export interface InstallCommand {
  label: string;
  command: string;
  note?: string;
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
  install: InstallCommand[];
  installNote: string;
  clients: ClientApp[];
  goodFor: string[];
}

export const ezvpn: Product = {
  slug: "ezvpn",
  name: "ezvpn",
  tagline: "The easy-setup VPN for reaching private networks.",
  metaDescription:
    "ezvpn is an open-source IP-over-QUIC VPN with NAT traversal built in — no open inbound port, no public IP, no subnet planning, and per-client Ed25519 key authentication. CLI for Linux, macOS, and Windows, plus native iOS, macOS, Android, and Windows apps.",
  cardSummary:
    "Full IP routing to a private network — whole subnets, any protocol — with dynamic client addressing, per-client Ed25519 keys instead of certificates or PKI, and no inbound port to open or forward.",
  chips: ["IP layer", "root required"],
  platforms: ["CLI", "Linux", "macOS", "Windows", "iOS", "Android"],
  summary: [
    "ezvpn creates a virtual network interface and routes IP packets — IPv4, IPv6, or both — through an encrypted QUIC connection. By default it runs as a split tunnel, carrying only the private prefixes you need, though the CLI can full-tunnel everything when you want it to. Clients dial the server by its stable endpoint identity, so the server needs no public IP and no open inbound port: hole punching finds a direct path through NAT, and an encrypted relay carries traffic when it can't.",
    "There is no VPN subnet to plan, either. The server assigns client addresses dynamically, so nothing has to be kept collision-free by hand, as long as the number of connected devices fits the subnet's address space. A typical deployment is a small ezvpn server inside a private network — an AWS VPC, a homelab — that clients join temporarily to reach private resources.",
    "Access control is a per-client Ed25519 keypair in the shared flexaccess-keys format: each client generates its own key, and the server keeps the public keys in an ssh-style authorized-keys file. No certificates, no PKI, no shared secret to rotate.",
  ],
  facts: [
    { label: "Access level", value: "IP routing — whole subnets, any protocol" },
    { label: "Privileges", value: "Root / Administrator (creates the network interface)" },
    { label: "Tunnel modes", value: "Split or full, dual-stack IPv4 + IPv6" },
    { label: "Authentication", value: "Per-client Ed25519 keys, authorized-keys style" },
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
      title: "Keys, not certificates",
      body: "Each client authenticates with its own Ed25519 keypair; the server lists the public keys it accepts in an ssh-style authorized-keys file. Generate keys once with flexaccess-keys — no PKI, no shared token.",
    },
    {
      title: "Dual stack",
      body: "Run the tunnel over IPv4, IPv6, or both at once — clients receive an address in each family the server enables.",
    },
    {
      title: "Split DNS on mobile",
      body: "The iOS and Android apps can send DNS for chosen match domains through the tunnel, so private names resolve on the phone without capturing all of its DNS.",
    },
    {
      title: "End-to-end encrypted",
      body: "Traffic rides QUIC with TLS 1.3 from client to server. Relays that carry it can't decrypt it.",
    },
    {
      title: "Auto-reconnect",
      body: "On the CLI, keep-alive and idle-timeout health checks re-establish the tunnel when the path drops. The mobile apps stop cleanly on a network change and reconnect on tap.",
    },
    {
      title: "Fast on Linux",
      body: "Automatic TUN GSO offload on Linux, with software segmentation fallback for peers that don't support it.",
    },
  ],
  install: [
    {
      label: "Linux / macOS",
      command: "curl -sSL https://flexaccessdev.github.io/ezvpn/install.sh | sudo bash",
    },
    {
      label: "Windows (elevated PowerShell)",
      command: "irm https://flexaccessdev.github.io/ezvpn/install.ps1 | iex",
      note: "Windows also needs wintun.dll from wintun.net next to ezvpn.exe.",
    },
  ],
  installNote:
    "The installer downloads the latest release binary and verifies its checksum. Prebuilt binaries cover Linux amd64/arm64, Apple Silicon macOS, and Windows amd64. Client keys are generated with flexaccess-keys.",
  clients: [
    {
      platform: "client and server CLI",
      name: "ezvpn",
      description: "The core — command-line client and server for Linux / macOS / Windows.",
      repo: `${GITHUB_ORG_URL}/ezvpn`,
    },
    {
      platform: "iOS / macOS GUI client",
      name: "ezvpn-apple",
      description:
        "Native SwiftUI client with a packet-tunnel extension: dual-stack split tunnel, split DNS on iOS, multiple saved profiles. macOS ships as a signed, notarized drag-to-Applications .dmg; iOS is built from source under your own team.",
      repo: `${GITHUB_ORG_URL}/ezvpn-apple`,
    },
    {
      platform: "Android GUI client",
      name: "ezvpn-android",
      description:
        "Native Kotlin / Jetpack Compose client running the Rust core inside a VpnService: dual-stack split tunnel, split DNS via an in-tunnel forwarder, always-on VPN support. Android 10+, arm64.",
      repo: `${GITHUB_ORG_URL}/ezvpn-android`,
    },
    {
      platform: "Windows GUI client",
      name: "ezvpn-windows",
      description:
        "Native WinUI 3 desktop app driving the ezvpn core through its C FFI: dual-stack split tunnel, multiple profiles, Ed25519 client keys kept in Windows Credential Manager. Unsigned MSI for personal use.",
      repo: `${GITHUB_ORG_URL}/ezvpn-windows`,
    },
  ],
  goodFor: [
    "Private cloud subnets — instances in private or egress-only VPC subnets",
    "Home-hosted servers behind dynamic IPs, NAT, or CGNAT",
    "Temporary split-tunnel access without standing VPN infrastructure",
    "Reaching a homelab or VPC from a phone — iOS and Android apps included",
  ],
};

export const flextunnel: Product = {
  slug: "flextunnel",
  name: "flextunnel",
  tagline: "The rootless split tunnel for private TCP services.",
  metaDescription:
    "flextunnel is an open-source SOCKS5/HTTP proxy split tunnel over QUIC: reach TCP services behind a server with server-side DNS, per-client Ed25519 keys, no root on either end, no open inbound port — and it runs alongside another VPN, including on iOS. CLI, macOS and Windows tray app, and iOS client.",
  cardSummary:
    "Reach TCP services behind a server over a local SOCKS5 / HTTP proxy or forwarded ports — with server-side DNS, host aliases, server-to-server bridges for networks the server can't reach directly, a zero-config --quick mode, and no admin rights on either end.",
  chips: ["proxy layer", "no root"],
  platforms: ["CLI", "Linux", "macOS", "Windows", "iOS"],
  summary: [
    "flextunnel gives you proxy-level access to hosts behind a server — without a VPN. The client runs local SOCKS5 and HTTP proxy listeners; targets on the server-pushed tunnel list are carried over an encrypted QUIC connection to the server, which resolves DNS and makes the outbound TCP connection from its own network. Everything else connects directly from your device.",
    "Because it uses ordinary userspace sockets — no TUN device — neither the client nor the server needs root or admin rights. And because it isn't a VPN, it sidesteps iOS's one-active-VPN-at-a-time restriction and runs happily alongside one.",
    "Every connection is gated by a per-client Ed25519 keypair in the shared flexaccess-keys format; the server keeps an ssh-style authorized-keys file of the clients it admits. For a throwaway session, --quick skips key files and config entirely — each side just types in the other's endpoint ID.",
  ],
  facts: [
    { label: "Access level", value: "TCP via local SOCKS5 / HTTP proxy listeners" },
    { label: "Privileges", value: "None — no root or admin on either end" },
    { label: "DNS", value: "Resolved on the server's side of the network" },
    { label: "Authentication", value: "Per-client Ed25519 keys, authorized-keys style" },
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
      title: "SOCKS5 & HTTP proxy",
      body: "The client runs local SOCKS5 and HTTP proxy listeners on 127.0.0.1 — point any proxy-aware app at them and its connections to private targets ride the tunnel.",
    },
    {
      title: "Zero privileges",
      body: "Ordinary userspace sockets on both ends — no TUN device, so no root, no admin, no elevation prompts. The installer puts the binary in ~/.local/bin.",
    },
    {
      title: "Server-side DNS & host aliases",
      body: "Reach names that only resolve on the server's network — or the server's own localhost. The server can also map friendly names like server.internal to addresses on its network.",
    },
    {
      title: "Split by default",
      body: "Only targets on the server-pushed tunnel list go through the tunnel; everything else connects directly.",
    },
    {
      title: "Local port forwarding",
      body: "Bind a local port to any host:port on the server's network, so tools that can't use a proxy reach private services as if they were local. Manage forwards live from the client control panel.",
    },
    {
      title: "Server-to-server bridges",
      body: "Chain servers together: one server forwards matching targets over a persistent, authenticated connection to another, which resolves and dials them from its own network — split-tunnel routing that reaches networks a single server can't. Single hop, so mutual bridges can't loop.",
    },
    {
      title: "Quick ephemeral tunnels",
      body: "flextunnel server start --quick and client start --quick: no key files, no config. Each side enters the other's endpoint ID, the session full-tunnels for as long as you need it, and nothing is persisted.",
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
      title: "Per-client keys",
      body: "Every client authenticates with its own Ed25519 keypair, signed into the handshake so a captured handshake can't be replayed; whoever runs the server decides which public keys get in.",
    },
    {
      title: "Built-in status page",
      body: "From any connected client, http://flextunnel.internal shows the server's live status as a page or JSON — always tunneled, regardless of the routed set.",
    },
  ],
  install: [
    {
      label: "Linux / macOS",
      command: "curl -sSL https://flexaccessdev.github.io/flextunnel/install.sh | bash",
    },
    {
      label: "Windows (elevated PowerShell)",
      command: "irm https://flexaccessdev.github.io/flextunnel/install.ps1 | iex",
    },
  ],
  installNote:
    "No root needed to run: on Linux/macOS the installer places the binary in ~/.local/bin. Prebuilt binaries cover Linux amd64/arm64, Apple Silicon macOS, and Windows amd64; a container image is published at ghcr.io/flexaccessdev/flextunnel. Client keys are generated with flexaccess-keys.",
  clients: [
    {
      platform: "client and server CLI",
      name: "flextunnel",
      description:
        "The core — command-line client, server, and live control panel for Linux / macOS / Windows.",
      repo: `${GITHUB_ORG_URL}/flextunnel`,
    },
    {
      platform: "macOS / Windows GUI client",
      name: "flextunnel-desktop",
      description:
        "A menu-bar / system-tray app for macOS and Windows: multiple concurrent profiles, per-profile SOCKS5 / HTTP listeners and port forwards, connection-path view. Shipped as a .dmg and .msi with every stable release.",
      repo: `${GITHUB_ORG_URL}/flextunnel/tree/main/crates/flextunnel-desktop`,
    },
    {
      platform: "iOS client",
      name: "flextunnel-ios",
      description:
        "Browse private networks in a built-in split-tunnel browser, or forward local ports so other apps — SSH, RDP, databases — can reach them. No VPN profile required.",
      repo: `${GITHUB_ORG_URL}/flextunnel-ios`,
    },
  ],
  goodFor: [
    "Web UIs, SSH, RDP, and databases that are only reachable from the server's network",
    "Shared or locked-down machines where you can't get admin rights",
    "Running next to a corporate or personal VPN — including on iOS",
    "A five-minute throwaway tunnel to a box you're sitting at — with --quick",
  ],
};

export const products: Product[] = [ezvpn, flextunnel];

/** Platforms covered by at least one tool, in display order. */
export const allPlatforms: string[] = Array.from(
  new Set(products.flatMap((product) => product.platforms)),
);

export interface SharedRepo {
  name: string;
  summary: string;
  repo: string;
}

export const sharedKeys = {
  name: "flexaccess-keys",
  repo: `${GITHUB_ORG_URL}/flexaccess-keys`,
  tagline: "One key format for every FlexAccess tool.",
  body: "Both tools authenticate clients with the same app-independent Ed25519 key format: a private key file you keep on the client, and one ed25519-pub: line per client in an ssh-style authorized-keys file on the server. flexaccess-keys is the small CLI that generates and inspects those keys — install it once and use it for ezvpn and flextunnel alike.",
  install: [
    {
      label: "Linux / macOS",
      command: "curl -sSL https://flexaccessdev.github.io/flexaccess-keys/install.sh | bash",
    },
    {
      label: "Windows (PowerShell)",
      command: "irm https://flexaccessdev.github.io/flexaccess-keys/install.ps1 | iex",
    },
  ] satisfies InstallCommand[],
  example: `# on each client: generate a keypair, then print its public entry
flexaccess-keys generate-auth-key "alice laptop" -o client.key
flexaccess-keys show-auth-key --private-key-file client.key
#   → ed25519-pub:…  alice laptop

# on the server: authorized_keys, one client per line
ed25519-pub:<public key> alice laptop
ed25519-pub:<public key> build server`,
};

export const sharedRepos: SharedRepo[] = [
  {
    name: "flexaccess-keys",
    summary:
      "The shared Ed25519 key format and CLI — generate-auth-key / show-auth-key — used by both tools.",
    repo: `${GITHUB_ORG_URL}/flexaccess-keys`,
  },
  {
    name: "iroh-common-architecture",
    summary:
      "Design notes and operating guides for the shared transport layer: relays and address lookup, NAT traversal, and self-hosting your own relay.",
    repo: `${GITHUB_ORG_URL}/iroh-common-architecture`,
  },
];

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
    flextunnel: "Through a local SOCKS5 / HTTP proxy or a forwarded port",
  },
  {
    label: "Authentication",
    ezvpn: "Per-client Ed25519 key (flexaccess-keys)",
    flextunnel: "Per-client Ed25519 key (flexaccess-keys), or --quick with no keys at all",
  },
  {
    label: "Phones",
    ezvpn: "iOS and Android apps",
    flextunnel: "iOS app — browser and port forwards, no VPN profile",
  },
  {
    label: "Alongside another VPN",
    ezvpn: "iOS allows only one active VPN at a time",
    flextunnel: "Yes — it isn't a VPN",
  },
];
