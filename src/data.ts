export const GITHUB_ORG_URL = "https://github.com/flexaccessdev";

export interface ClientApp {
  platform: string;
  name: string;
  description: string;
  /** How you get it — signed download, unsigned installer, build from source. */
  distribution?: string;
  repo: string;
}

export interface InstallCommand {
  label: string;
  command: string;
  note?: string;
}

export interface ProductNote {
  title: string;
  body: string;
  link?: { label: string; href: string };
}

export interface Feature {
  title: string;
  body: string;
  /** Heading the feature is grouped under on the product page. */
  group: string;
}

export interface QuickStartStep {
  title: string;
  body?: string;
  code?: string;
  /** Shown in the code block's header, e.g. a file name or "on the server". */
  codeTitle?: string;
  /** A short remark under the code block. */
  aside?: string;
}

/** A terminal recording shown on the product page. */
export interface ProductDemo {
  /** The asciicast, served from public/. Re-record with scripts/demo/. */
  src: string;
  /** Terminal size of the recording, to reserve its space before it loads. */
  cols: number;
  rows: number;
  /** Frame shown before playback, as an asciinema-player poster spec. */
  poster: string;
  title: string;
  lede: string;
  /** Accessible name of the player. */
  label: string;
  caption: string;
}

export interface Product {
  slug: "ezvpn" | "flextunnel";
  name: string;
  tagline: string;
  metaDescription: string;
  cardSummary: string;
  chips: string[];
  platforms: string[];
  /** Three short reasons to pick this tool, shown on the home page. */
  pickWhen: string[];
  summary: string[];
  facts: { label: string; value: string }[];
  features: Feature[];
  demo?: ProductDemo;
  quickStart: QuickStartStep[];
  install: InstallCommand[];
  installNote: string;
  clients: ClientApp[];
  goodFor: string[];
  notes?: ProductNote[];
}

const preReleaseNote = (name: string): ProductNote => ({
  title: "Pre-1.0: keep both ends on the same release",
  body: `While ${name} is in the 0.0.x series there is no backward compatibility between versions. Upgrade clients and servers together, and refresh configs from the current examples when you do. If an upgraded deployment still can't connect, regenerate the server identity key as a fallback — that changes the server's endpoint ID, so update every client profile with the new one.`,
});

export const ezvpn: Product = {
  slug: "ezvpn",
  name: "ezvpn",
  tagline: "The easy-setup VPN for reaching private networks.",
  metaDescription:
    "ezvpn is an open-source IP-over-QUIC VPN with NAT traversal built in — no open inbound port, no public IP, no subnet planning, and per-client Ed25519 key authentication. CLI for Linux, macOS, and Windows, plus native macOS, iOS, and Windows apps.",
  cardSummary:
    "Full IP routing to a private network — whole subnets, any protocol — with dynamic client addressing, per-client Ed25519 keys instead of certificates or PKI, and no inbound port to open or forward.",
  chips: ["IP layer", "needs root"],
  platforms: ["CLI", "Linux", "macOS", "Windows", "iOS"],
  pickWhen: [
    "You want a whole subnet reachable — any protocol, transparently, through the routing table",
    "You can run as root / Administrator on the client",
    "You'd rather have a native VPN app on your Mac, iPhone, or Windows PC",
  ],
  summary: [
    "ezvpn creates a virtual network interface and routes IP packets — IPv4, IPv6, or both — through an encrypted QUIC connection. It runs as a split tunnel, carrying only the private prefixes you ask for; a full tunnel is available on the CLI and the Windows app but is still experimental. Clients dial the server by its stable endpoint identity, so the server needs no public IP and no open inbound port: hole punching finds a direct path through NAT, and an encrypted relay carries traffic when it can't.",
    "There is no VPN subnet to plan, either. The server assigns client addresses dynamically, so nothing has to be kept collision-free by hand. A typical deployment is a small ezvpn server inside a private network — an AWS VPC, a homelab — that clients join temporarily to reach private resources.",
    "Access control is a per-client Ed25519 keypair in the shared flexaccess-keys format: each client generates its own key, and the server keeps the public keys in an ssh-style authorized-keys file. No certificates, no PKI, no shared secret to rotate.",
  ],
  facts: [
    { label: "Access level", value: "IP routing — whole subnets, any protocol" },
    { label: "Privileges", value: "Root / Administrator (creates the network interface)" },
    { label: "Tunnel modes", value: "Split tunnel; full tunnel on CLI and Windows (experimental)" },
    { label: "Authentication", value: "Per-client Ed25519 keys, authorized-keys style" },
    { label: "Server exposure", value: "No public IP, no open inbound port" },
    { label: "Topology", value: "Client ↔ server only — no client-to-client, no site-to-site" },
  ],
  features: [
    {
      group: "Reachability",
      title: "No inbound ports",
      body: "Clients dial a stable endpoint identity — no port forwarding, no dynamic DNS, and it works from behind CGNAT.",
    },
    {
      group: "Reachability",
      title: "Bring your own relays",
      body: "Point both ends at two or more custom relays and public infrastructure is out of the picture. A server that loses its home relay re-homes on another in place — same identity, same sockets, nothing torn down.",
    },
    {
      group: "Reachability",
      title: "Waits out outages",
      body: "Auto-reconnect with exponential backoff, from the very first attempt: a server that's down or not up yet is the ordinary case, not an exit. Status shows failed attempts, the last error, and when the next try is due.",
    },
    {
      group: "Addressing",
      title: "No subnet planning",
      body: "Client VPN addresses are assigned dynamically by the server, so there are no static IPs to keep collision-free.",
    },
    {
      group: "Addressing",
      title: "Dual stack",
      body: "Run the tunnel over IPv4, IPv6, or both at once — clients receive an address in each family the server enables. IPv6-only mode works but is still experimental.",
    },
    {
      group: "Addressing",
      title: "Client isolation by design",
      body: "Clients reach the server's network, never each other: inter-client packets are dropped in userspace before they touch the TUN device. Nothing to firewall, no stale-IP bookkeeping.",
    },
    {
      group: "Addressing",
      title: "Forwarding rules can be permanent",
      body: "Reaching hosts beyond the server itself is ordinary OS routing: enable IP forwarding and add a MASQUERADE rule once. The rules are inert while the tunnel is down, so there are no PostUp / PostDown hooks to script.",
    },
    {
      group: "Routing & DNS",
      title: "Won't swallow your own LAN",
      body: "A split-tunnel route that overlaps the network you're sitting on is refused at connect, and again if that network appears mid-session — on desktop and iOS alike — so the tunnel never cuts off the gateway that carries it.",
    },
    {
      group: "Routing & DNS",
      title: "The underlay stays off the tunnel",
      body: "The server publishes its own transport addresses and the client pins host routes for any a routed prefix would capture, so even a full tunnel can't deadlock on itself. Running on top of another VPN? --exclude-direct-path keeps the tunnel off that overlay.",
    },
    {
      group: "Routing & DNS",
      title: "Split DNS on iOS",
      body: "The iOS app can send DNS for chosen match domains through the tunnel, so private names resolve on the phone without capturing all of its DNS. On desktop and macOS, DNS stays with the OS.",
    },
    {
      group: "Security & performance",
      title: "Keys, not certificates",
      body: "Each client authenticates with its own Ed25519 keypair; the server lists the public keys it accepts in an ssh-style authorized-keys file. Generate keys once with flexaccess-keys — no PKI, no shared token.",
    },
    {
      group: "Security & performance",
      title: "End-to-end encrypted",
      body: "Traffic rides QUIC with TLS 1.3 from client to server. Relays that carry it can't decrypt it.",
    },
    {
      group: "Security & performance",
      title: "No tuning knobs",
      body: "MTU 1280, Cubic, fixed windows: WireGuard-style protocol constants on both ends. Linux gets automatic TUN GSO offload; the macOS CLI data path was recently reworked for roughly 3× the upload and 2× the download throughput.",
    },
  ],
  demo: {
    src: "/demos/ezvpn.cast",
    cols: 161,
    rows: 29,
    poster: "npt:1:28",
    title: "Watch a tunnel come up",
    lede: "Two Linux hosts, recorded as typed. The server, on the left, gets an identity key and a four-setting config. The client, on the right, dials it by endpoint ID, pings it through the tunnel, and disconnects.",
    label: "Terminal recording: setting up an ezvpn server and connecting a client",
    caption:
      "Real output from both hosts, nothing edited; pauses longer than two seconds are shortened on playback. The same steps are written out in the quick start below.",
  },
  quickStart: [
    {
      title: "Generate keys",
      body: "The server gets an identity key, which is what clients dial. Each client gets its own Ed25519 auth key.",
      code: `# on the server
ezvpn generate-server-key --output ./vpn-server.key

# on each client
flexaccess-keys generate-auth-key "alice laptop" -o client.key
flexaccess-keys show-auth-key --private-key-file client.key
#   → ed25519-pub:… alice laptop`,
    },
    {
      title: "Write the server config",
      body: "Paste each client's ed25519-pub line into ./authorized_keys, one per line, and pick a VPN network. That is the whole config.",
      code: `role = "vpnserver"

[network]
network = "10.0.0.0/24"

[auth]
authorized_keys_file = "./authorized_keys"

[iroh]
secret_file = "./vpn-server.key"`,
      codeTitle: "vpn_server.toml",
    },
    {
      title: "Start the server",
      body: "It prints its endpoint ID on startup. No port to open, no IP to publish.",
      code: "sudo ezvpn server start -c vpn_server.toml",
      aside:
        "To reach hosts beyond the server itself, enable net.ipv4.ip_forward and add a MASQUERADE rule for 10.0.0.0/24 on the server's outbound interface. The rules are harmless while the tunnel is down, so they can simply stay.",
    },
    {
      title: "Connect a client",
      body: "Dial the server by its endpoint ID and route the private prefixes you need. Leave --route off to reach only the server itself.",
      code: `sudo ezvpn client start \\
  --server-node-id <SERVER_ENDPOINT_ID> \\
  --auth-key-file ./client.key \\
  --route 192.168.1.0/24

ping 10.0.0.1   # the server's VPN address`,
      aside:
        "On a Mac, iPhone, or Windows PC, the native app does the same: generate a key in-app, paste its public half into authorized_keys, add a profile with the server's endpoint ID, connect.",
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
      note: "The CLI also needs wintun.dll from wintun.net next to ezvpn.exe. The Windows app bundles it.",
    },
  ],
  installNote:
    "The installer downloads the latest release binary and verifies its checksum. Prebuilt binaries cover Linux amd64/arm64, Apple Silicon macOS, and Windows amd64. Client keys are generated with flexaccess-keys.",
  clients: [
    {
      platform: "CLI · client and server",
      name: "ezvpn",
      description: "The core — command-line client and server for Linux / macOS / Windows.",
      distribution: "one-line installer, or cargo build",
      repo: `${GITHUB_ORG_URL}/ezvpn`,
    },
    {
      platform: "macOS / iOS app",
      name: "ezvpn-apple",
      description:
        "Native SwiftUI client with a packet-tunnel extension: dual-stack split tunnel (no full tunnel), multiple saved profiles, keys generated in-app and kept in the Keychain, split DNS on iOS, menu-bar controls on macOS. On a network change it disconnects rather than migrating the session — reconnect manually. The macOS build is a signed, notarized drag-to-Applications .dmg that needs no Apple developer account to run; iOS is built from source under your own team.",
      distribution: "macOS: signed .dmg · iOS: build from source",
      repo: `${GITHUB_ORG_URL}/ezvpn-apple`,
    },
    {
      platform: "Windows app",
      name: "ezvpn-windows",
      description:
        "Native WinUI 3 app driving the ezvpn core through its C FFI: dual-stack split tunnel, multiple profiles, Ed25519 keys kept in Windows Credential Manager, live connection-path view. Closing the window hides it to the system tray with the tunnel still up. It runs elevated, so expect a UAC prompt at launch. The MSI bundles wintun.dll; it is unsigned and scoped for personal use on x64.",
      distribution: "unsigned .msi (x64)",
      repo: `${GITHUB_ORG_URL}/ezvpn-windows`,
    },
  ],
  goodFor: [
    "Private cloud subnets — instances in private or egress-only VPC subnets",
    "Home-hosted servers behind dynamic IPs, NAT, or CGNAT",
    "Temporary split-tunnel access without standing VPN infrastructure",
    "Reaching a homelab or VPC from an iPhone or a Mac with the native app",
  ],
  notes: [
    {
      title: "A server-centred tunnel, on purpose",
      body: "Every client talks only to the server gateway — never to another client — which is exactly what lets client addresses stay dynamic and conflict-free. The server and the desktop client do one thing, tunneling; firewall, NAT, and DNS stay with the OS.",
    },
    {
      title: "Not a mesh, not site-to-site, not an anonymity tool",
      body: "ezvpn gives clients the server's network and nothing else: no client-to-client traffic, and no bridging of two LANs. If you want every device to have a stable IP so peers can address each other, that's Tailscale's job; for a permanent link between two subnets, use WireGuard. And because relays can see connection metadata when they're involved, ezvpn is not for anonymity — only the payload is guaranteed private.",
    },
    preReleaseNote("ezvpn"),
  ],
};

export const flextunnel: Product = {
  slug: "flextunnel",
  name: "flextunnel",
  tagline: "The rootless split tunnel for private TCP services.",
  metaDescription:
    "flextunnel is an open-source SOCKS5/HTTP proxy and port-forwarding split tunnel over QUIC: reach TCP services behind a server with server-side DNS, per-client Ed25519 keys, no root on either end, no open inbound port — and it isn't a VPN, so it needs no VPN profile, even on iOS. CLI, macOS and Windows tray app, and iOS app.",
  cardSummary:
    "Reach TCP services behind a server over a local SOCKS5 / HTTP proxy or forwarded ports — with server-side DNS, host aliases, server-to-server bridges for networks the server can't reach directly, a zero-config --quick mode, and no admin rights on either end.",
  chips: ["proxy layer", "no root"],
  platforms: ["CLI", "Linux", "macOS", "Windows", "iOS"],
  pickWhen: [
    "You need specific TCP services — web UIs, SSH, RDP, databases — not a whole subnet",
    "You can't get root or admin on the machine you're sitting at",
    "You want it next to an existing VPN, or a five-minute throwaway tunnel",
  ],
  summary: [
    "flextunnel gives you proxy-level access to hosts behind a server — without a VPN. The client runs local SOCKS5 and HTTP proxy listeners, and can bind local ports straight to server-side addresses; targets on the server-pushed tunnel list are carried over an encrypted QUIC connection to the server, which resolves DNS and makes the outbound TCP connection from its own network. Everything else connects directly from your device.",
    "Because it uses ordinary userspace sockets — no TUN device — neither the client nor the server needs root or admin rights. And because it isn't a VPN, it needs no VPN profile or network extension, so nothing stops you running one next to it, even on iOS.",
    "Every connection is gated by a per-client Ed25519 keypair in the shared flexaccess-keys format; the server keeps an ssh-style authorized-keys file of the clients it admits. For a throwaway session, --quick skips key files and config entirely — each side just types in the other's endpoint ID.",
  ],
  facts: [
    { label: "Access level", value: "TCP via local SOCKS5 / HTTP proxy listeners or forwarded ports" },
    { label: "Privileges", value: "None — no root or admin on either end" },
    { label: "DNS", value: "Resolved on the server's side of the network" },
    { label: "Authentication", value: "Per-client Ed25519 keys, authorized-keys style" },
    { label: "VPN profile", value: "None — it isn't a VPN, so it sits beside one" },
    { label: "Routing policy", value: "Set once on the server, pushed to every client" },
  ],
  features: [
    {
      group: "Access",
      title: "SOCKS5 & HTTP proxy",
      body: "The client runs local SOCKS5 and HTTP proxy listeners on 127.0.0.1 — point any proxy-aware app at them and its connections to private targets ride the tunnel. The HTTP front-end is there for tools that only speak HTTP proxies or whose SOCKS5 resolves DNS on the client: wget, Docker pulls, npm, JDBC.",
    },
    {
      group: "Access",
      title: "Local port forwarding",
      body: "Bind a local port to any host:port on the server's network, so tools that can't use a proxy — databases, RDP, most GUIs — reach private services as if they were local. Per profile in the desktop and iOS apps; from config on the CLI.",
    },
    {
      group: "Access",
      title: "Zero privileges",
      body: "Ordinary userspace sockets on both ends — no TUN device, so no root, no admin, no elevation prompts. The installer puts the binary in ~/.local/bin.",
    },
    {
      group: "Routing",
      title: "Split by default, enforced twice",
      body: "Only targets on the server-pushed tunnel list go through the tunnel; everything else connects directly. The server enforces the same list as a whitelist on its side, so a misconfigured client can't reach past it.",
    },
    {
      group: "Routing",
      title: "Server-side DNS, aliases, and forwarders",
      body: "Reach names that only resolve on the server's network — or the server's own localhost. Map friendly names like server.internal, or wildcards like *.svc.internal, to addresses on its network, and forward chosen DNS suffixes to per-suffix upstream resolvers with failover and TCP fallback.",
    },
    {
      group: "Routing",
      title: "Server-to-server bridges",
      body: "Chain servers together: one server forwards matching targets over a persistent, authenticated connection to another, which resolves and dials them from its own network — split-tunnel routing that reaches networks a single server can't. Single hop, so mutual bridges can't loop.",
    },
    {
      group: "Routing",
      title: "Quick ephemeral tunnels",
      body: "flextunnel server start --quick and client start --quick: no key files, no config. Each side enters the other's endpoint ID in the terminal, the session full-tunnels for as long as you need it, and nothing is persisted. The server gives up if no client shows within five minutes.",
    },
    {
      group: "Security",
      title: "Per-client keys",
      body: "Every client authenticates with its own Ed25519 keypair, signed into the handshake so a captured handshake can't be replayed; whoever runs the server decides which public keys get in.",
    },
    {
      group: "Security",
      title: "No inbound ports",
      body: "The same dial-by-identity transport: the server needs no public IP and no port forwarding.",
    },
    {
      group: "Security",
      title: "Not a VPN",
      body: "No VPN profile, no network extension, no TUN device. Nothing stops you running it next to a corporate or personal VPN — including on iOS, where the app is a plain app.",
    },
    {
      group: "Resilience & visibility",
      title: "Survives outages",
      body: "Auto-reconnect with backoff from the very first attempt. Local listeners stay bound, off-list targets keep connecting directly, and on-list requests are held for up to 45 s while the link comes back instead of failing.",
    },
    {
      group: "Resilience & visibility",
      title: "Bring your own relays",
      body: "Point both ends at two or more custom relays and public infrastructure is out of the picture. A server that loses its home relay re-homes on another in place, so clients off the LAN aren't stranded.",
    },
    {
      group: "Resilience & visibility",
      title: "Live control panel",
      body: "flextunnel client control attaches a read-only terminal panel to a running client: connection phase, direct or relay path, the pushed routing breakdown, and every port forward's live state.",
    },
    {
      group: "Resilience & visibility",
      title: "Built-in status page",
      body: "From any connected client, http://flextunnel.internal shows the server's live status as a page or JSON — always tunneled, regardless of the routed set.",
    },
  ],
  quickStart: [
    {
      title: "Generate keys",
      body: "The server gets an identity key, which is what clients dial. Each client gets its own Ed25519 auth key.",
      code: `# on the server
flextunnel generate-iroh-key -o server.key

# on each client
flexaccess-keys generate-auth-key "alice laptop" -o client.key
flexaccess-keys show-auth-key --private-key-file client.key
#   → ed25519-pub:… alice laptop`,
    },
    {
      title: "Write the server config",
      body: "Paste each client's ed25519-pub line into ./authorized_keys, then decide what goes through the tunnel. The routed set is set once here and pushed to every client.",
      code: `secret_file = "./server.key"
authorized_keys_file = "./authorized_keys"

# what clients may reach through the tunnel
routed_domains = ["*.internal", "*.corp.example.com"]
routed_cidrs   = ["10.0.0.0/8"]

[host_aliases]
"server.internal" = "127.0.0.1"`,
      codeTitle: "server.toml",
    },
    {
      title: "Start the server",
      body: "It prints its endpoint ID on startup. No port to open, no root needed.",
      code: "flextunnel server start -c server.toml",
    },
    {
      title: "Connect a client and use it",
      body: "Dial the server by its endpoint ID, then point tools at the local proxy. Use socks5h so names resolve on the server's side.",
      code: `flextunnel client start \\
  --server-node-id <SERVER_ENDPOINT_ID> \\
  --auth-key-file client.key \\
  --socks-port 1080

curl -x socks5h://127.0.0.1:1080 http://server.internal:8000/
ssh -o ProxyCommand='nc -X 5 -x 127.0.0.1:1080 %h %p' user@db.internal`,
      aside:
        "Just need a tunnel to a box you're sitting at? Run --quick on both ends instead: no keys, no config, each side types in the other's endpoint ID.",
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
      note: "Elevation is only for the installer, which writes to Program Files. Running flextunnel needs none.",
    },
  ],
  installNote:
    "No root needed to run: on Linux/macOS the installer places the binary in ~/.local/bin. Prebuilt binaries cover Linux amd64/arm64, Apple Silicon macOS, and Windows amd64; a container image is published at ghcr.io/flexaccessdev/flextunnel. Client keys are generated with flexaccess-keys.",
  clients: [
    {
      platform: "CLI · client and server",
      name: "flextunnel",
      description:
        "The core — command-line client, server, and read-only control panel for Linux / macOS / Windows.",
      distribution: "one-line installer, container image, or cargo build",
      repo: `${GITHUB_ORG_URL}/flextunnel`,
    },
    {
      platform: "macOS / Windows app",
      name: "flextunnel-desktop",
      description:
        "A menu-bar / system-tray app for macOS and Windows: any number of profiles connected at once, each with its own SOCKS5 / HTTP listeners and port forwards; keys generated in-app, connection-path view, live per-profile logs, profile export and import, and secrets kept in the macOS Keychain or Windows Credential Manager.",
      distribution: "unsigned .dmg / .msi with every stable release",
      repo: `${GITHUB_ORG_URL}/flextunnel/tree/main/crates/flextunnel-desktop`,
    },
    {
      platform: "iOS app",
      name: "flextunnel-ios",
      description:
        "Browse private networks in a built-in browser — split by hostname when the tunnel set is name-based, everything through the tunnel otherwise — or forward localhost ports so other apps on the phone (SSH, RDP, databases) can reach them, with an opt-in, time-limited background keep-alive. Saved profiles, keys generated on-device and kept in the Keychain, no VPN profile required. Each release publishes an unsigned .ipa to sign under your own Apple team.",
      distribution: "unsigned .ipa, self-signed",
      repo: `${GITHUB_ORG_URL}/flextunnel-ios`,
    },
  ],
  goodFor: [
    "Web UIs, SSH, RDP, and databases that are only reachable from the server's network",
    "Shared or locked-down machines where you can't get admin rights",
    "Sitting next to a corporate or personal VPN — it isn't one, so there's nothing to switch off",
    "A five-minute throwaway tunnel to a box you're sitting at — with --quick",
  ],
  notes: [
    {
      title: "Trusted clients, trusted host",
      body: "flextunnel lets clients you trust reach a server you also run; it is not a multi-tenant service. An authorized client can reach whatever the server's network can — including the server's own localhost — so authorize keys accordingly and scope the server's network reach if that is too broad. The local proxy listeners are unauthenticated and bind 127.0.0.1 only, so the client host is assumed to be single-user.",
    },
    {
      title: "Need UDP forwarding?",
      body: "flextunnel carries TCP only. If you need to forward UDP — WireGuard or OpenVPN over P2P, game servers, VoIP, or UDP services in Kubernetes that kubectl port-forward can't reach — use tunnel-rs: peer-to-peer TCP and UDP port forwarding for Linux, macOS, and Windows over the same encrypted QUIC transport, with the same no-open-port NAT traversal, the same flexaccess-keys Ed25519 authentication, and no root on either end. It's built for development and homelab use rather than production.",
      link: { label: "tunnel-rs on GitHub", href: `${GITHUB_ORG_URL}/tunnel-rs` },
    },
    preReleaseNote("flextunnel"),
  ],
};

export const products: Product[] = [ezvpn, flextunnel];

/** Platforms covered by at least one tool, in display order. */
export const allPlatforms: string[] = Array.from(
  new Set(products.flatMap((product) => product.platforms)),
);

export interface SharedRepo {
  name: string;
  kind: string;
  summary: string;
  repo: string;
}

export const sharedKeys = {
  name: "flexaccess-keys",
  repo: `${GITHUB_ORG_URL}/flexaccess-keys`,
  tagline: "One key format for every FlexAccess tool.",
  body: "Both tools authenticate clients with the same app-independent Ed25519 key format: a private key file you keep on the client, and one ed25519-pub: line per client in an ssh-style authorized-keys file on the server. flexaccess-keys is the small CLI that generates and inspects those keys — install it once and use it for ezvpn and flextunnel alike. The GUI apps generate the same keys in-app, so a phone or a Mac needs no CLI at all.",
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
#   → ed25519-pub:… alice laptop

# on the server: authorized_keys, one client per line
ed25519-pub:<public key> alice laptop
ed25519-pub:<public key> build server`,
};

export const sharedRepos: SharedRepo[] = [
  {
    name: "flexaccess-iroh",
    kind: "transport crate",
    summary:
      "The shared transport layer as code: relay configuration and the per-relay startup probe, the common endpoint builder, in-place home-relay failover for servers, and the endpoint-bound key authentication transcript. Its offline end-to-end suite proves failover against real relays, and a client can start while one relay is down. A fix lands here once and reaches every tool on its next tag bump.",
    repo: `${GITHUB_ORG_URL}/flexaccess-iroh`,
  },
  {
    name: "flexaccess-keys",
    kind: "key format",
    summary:
      "The shared Ed25519 key format — generate-auth-key / show-auth-key on the CLI — used by both tools, with the same library embedded in their GUI apps.",
    repo: `${GITHUB_ORG_URL}/flexaccess-keys`,
  },
  {
    name: "iroh-common-architecture",
    kind: "design notes",
    summary:
      "Design notes and operating guides for the transport layer: relays and address lookup, relay failover, NAT traversal by NAT type, and self-hosting your own relay.",
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
    label: "Desktop apps",
    ezvpn: "macOS app as a signed .dmg, Windows app as an unsigned .msi — plus the CLI",
    flextunnel: "macOS / Windows tray app as unsigned .dmg / .msi — plus the CLI",
  },
  {
    label: "Phones",
    ezvpn: "iOS app, built from source under your own team",
    flextunnel: "iOS app — browser and port forwards, no VPN profile; unsigned .ipa you sign yourself",
  },
  {
    label: "Next to another VPN",
    ezvpn: "It is a VPN — on iOS, only one can be active at a time",
    flextunnel: "It isn't a VPN, so there's nothing to switch off",
  },
  {
    label: "Not for",
    ezvpn: "Client-to-client meshes, site-to-site links, anonymity",
    flextunnel: "UDP, or apps that can't use a proxy or a forwarded port",
  },
];
