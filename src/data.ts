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
  /** Anchor of the demo's section; the hero links to the first demo's. */
  id: string;
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
  /** Terminal recordings, each in its own section, the primary one first. */
  demos: ProductDemo[];
  quickStart: QuickStartStep[];
  install: InstallCommand[];
  installNote: string;
  clients: ClientApp[];
  goodFor: string[];
  notes?: ProductNote[];
}

export const ezvpn: Product = {
  slug: "ezvpn",
  name: "ezvpn",
  tagline: "The easy-setup VPN for reaching private networks.",
  metaDescription:
    "ezvpn is an open-source IP-over-QUIC VPN with NAT traversal, dynamic client addressing, and per-client Ed25519 authentication. The server needs no public IP or inbound port. CLI for Linux, macOS, and Windows, plus native macOS, iOS, and Windows apps.",
  cardSummary:
    "Full IP routing to a private network — whole subnets, any protocol — with dynamic client addressing, per-client Ed25519 keys instead of certificates or PKI, and no inbound port to open or forward.",
  chips: ["IP layer", "needs root"],
  platforms: ["CLI", "Linux", "macOS", "Windows", "iOS"],
  pickWhen: [
    "You want a whole subnet reachable — any protocol, transparently, through the routing table",
    "You can run the CLI as root / Administrator",
    "You'd rather have a native VPN app on your Mac, iPhone, or Windows PC",
  ],
  summary: [
    "ezvpn creates a virtual network interface and routes IP packets — IPv4, IPv6, or both — through an encrypted QUIC connection. It runs as a split tunnel, carrying only the private prefixes you ask for; a full tunnel is available on the CLI and the Windows app but is still experimental. Clients dial the server by its stable endpoint identity, so the server needs no public IP and no open inbound port: hole punching finds a direct path through NAT, and an encrypted relay carries traffic when it can't.",
    "The model is WireGuard's remote-access one, without the open port: one ezvpn server on one device at a site — a homelab, an AWS VPC — and remote clients that dial in to it. Nothing else at the site installs anything. Route the site's prefixes and every device there answers at the address it already has; route nothing and you reach the server host alone, at its VPN address. Tailscale starts from the other end: each device you want to reach joins the tailnet as a node of its own, with a subnet router as the add-on for devices that can't run it. In ezvpn the gateway is the whole model.",
    "Choose a VPN prefix on the server and it assigns client addresses dynamically by default. Clients join to reach private resources without managing a static address for each device.",
    "Access control is a per-client Ed25519 keypair in the shared flexaccess-keys format: each client generates its own key, and the server keeps the public keys in an ssh-style authorized-keys file. No certificates, no PKI, no shared secret to rotate.",
  ],
  facts: [
    { label: "Access level", value: "IP routing — whole subnets, any protocol" },
    { label: "Privileges", value: "CLI requires root / Administrator to create the network interface" },
    { label: "Tunnel modes", value: "Split tunnel; full tunnel on CLI and Windows (experimental)" },
    { label: "Authentication", value: "Per-client Ed25519 keys, authorized-keys style" },
    { label: "Server exposure", value: "No public IP, no open inbound port" },
    { label: "Topology", value: "One server per site, clients dial in — no client-to-client, no site-to-site" },
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
      title: "Dynamic client addresses",
      body: "Clients receive VPN addresses from the server's configured pools. Choose prefixes that don't overlap the networks you need to reach.",
    },
    {
      group: "Addressing",
      title: "Dual stack",
      body: "Carry IPv4 traffic, IPv6 traffic, or both. Clients normally receive an address in each family that the server enables. IPv6-only mode is experimental.",
    },
    {
      group: "Addressing",
      title: "Client isolation by design",
      body: "Clients reach the server's network, never each other: inter-client packets are dropped in userspace before they touch the TUN device. Nothing to firewall, no stale-IP bookkeeping.",
    },
    {
      group: "Addressing",
      title: "The site keeps its own addresses",
      body: "One server reaches a whole site: the devices behind it run no VPN software and get no VPN address, and clients use the LAN IPs those devices already have. 192.168.1.20 at home is still 192.168.1.20 from the road.",
    },
    {
      group: "Addressing",
      title: "Forwarding rules can be permanent",
      body: "To reach the site LAN, enable IP forwarding and allow forwarded traffic through the server firewall. Give replies a path back to the VPN prefix using NAT or a route. These rules can stay in place between sessions.",
    },
    {
      group: "Routing & DNS",
      title: "Won't swallow your own LAN",
      body: "A split-tunnel route that overlaps your local network is refused at connect. The desktop CLI and Windows app also stop if that conflict appears during a session. The macOS and iOS apps disconnect on a physical network change.",
    },
    {
      group: "Routing & DNS",
      title: "The underlay stays off the tunnel",
      body: "The client adds bypass routes for public server or relay addresses that a VPN route would capture. On the CLI, --exclude-direct-path prefers a direct path outside the specified CIDR or a relay when either is available.",
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
      title: "Fixed MTU and automatic offload",
      body: "The tunnel MTU is 1280. QUIC uses Cubic by default with fixed send and receive windows, and Linux uses TUN GSO where available. The CLI offers congestion-control and initial-window overrides for testing.",
    },
  ],
  demos: [
    {
      id: "demo",
      src: "/demos/ezvpn.cast",
      cols: 161,
      rows: 29,
      poster: "npt:1:30",
      title: "Watch a tunnel come up",
      lede: "Two Linux hosts, recorded as typed. The server, on the left, gets an identity key and a four-setting config. The client, on the right, dials it by endpoint ID, pings it at its VPN address through the tunnel, and disconnects. This is the simplest use: one machine reached by its VPN address, with no routes and no NAT.",
      label: "Terminal recording: setting up an ezvpn server and connecting a client",
      caption:
        "Real output from both hosts, nothing edited; pauses longer than two seconds are shortened on playback. The same steps are written out in the quick start below.",
    },
  ],
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
      body: "Paste each client's ed25519-pub line into ./authorized_keys, one per line. Choose a VPN prefix that doesn't overlap the LAN you want to reach.",
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
        "For LAN access, set up IP forwarding, firewall rules, and a return path with NAT or routing. See docs/Server-Site-Gateway.md in the repo for both IPv4 and IPv6.",
    },
    {
      title: "Connect a client",
      body: "Replace SERVER_ENDPOINT_ID with the ID printed by the server. This command reaches the server at its VPN address. For access to the LAN behind it, add --route with the site's IPv4 prefix or --route6 with its IPv6 prefix.",
      code: `sudo ezvpn client start \\
  --server-node-id "SERVER_ENDPOINT_ID" \\
  --auth-key-file ./client.key`,
    },
    {
      title: "Verify the connection",
      body: "From a second terminal on the client, ping the server's VPN address.",
      code: "ping 10.0.0.1",
      aside:
        "On a Mac, iPhone, or Windows PC, you can generate a key in the native app, add its public entry to the server's authorized_keys file, and connect with a profile using the server's endpoint ID.",
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
      note: "Place the amd64 wintun.dll from wintun.net next to ezvpn.exe or in the system PATH. The Windows app bundles it.",
    },
  ],
  installNote:
    "By default the installer downloads the latest stable release and verifies its checksum. Prebuilt binaries cover Linux amd64/arm64, Apple Silicon macOS, and Windows amd64. Client keys are generated with flexaccess-keys.",
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
        "Native SwiftUI client with dual-stack split tunneling, saved profiles, Keychain-backed keys, iOS split DNS, and macOS menu-bar controls. Reconnect manually after a physical network change. On macOS, install the signed, notarized .dmg to Applications and approve the system extension in System Settings. On iOS, build and sign the app under your own Apple Developer team.",
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
    "A whole home or office LAN from one gateway device — every device at its original IP, nothing installed on any of them",
    "One machine behind a dynamic IP, NAT, or CGNAT, reached at the server's VPN address",
    "Private cloud subnets — instances in private or egress-only VPC subnets",
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
      body: "ezvpn gives clients the server's network and nothing else: no client-to-client traffic, and no bridging of two LANs. If you want every device to run its own node and have a stable IP so peers can address each other, that's Tailscale's job — and its subnet routers cover the gateway arrangement too. ezvpn shares WireGuard's remote-access shape but not its site-to-site one: for a permanent link between two subnets, use WireGuard. And because relays can see connection metadata when they're involved, ezvpn is not for anonymity — only the payload is guaranteed private.",
    },
    {
      title: "Pre-1.0 · Keep both ends on the same core release",
      body: "Compatibility between 0.0.x core releases is unsupported. Upgrade clients and servers together and refresh configs from the current examples. If the upgraded deployment still can't connect, you can regenerate the server identity key and update every client profile with the resulting endpoint ID.",
    },
  ],
};

export const flextunnel: Product = {
  slug: "flextunnel",
  name: "flextunnel",
  tagline: "The rootless split tunnel for private TCP services.",
  metaDescription:
    "flextunnel is an open-source SOCKS5/HTTP proxy and port-forwarding split tunnel over QUIC: reach TCP services behind a server with server-side DNS, per-client Ed25519 keys, no root on either end, no open inbound port — and it isn't a VPN, so it needs no VPN profile, even on iOS. CLI, macOS and Windows tray app, and iOS app.",
  cardSummary:
    "Reach private TCP services through local SOCKS5 / HTTP proxies or forwarded ports. One client can reach multiple servers on demand, with server-side DNS and a zero-config --quick mode for one-off sessions.",
  chips: ["proxy layer", "no root"],
  platforms: ["CLI", "Linux", "macOS", "Windows", "iOS"],
  pickWhen: [
    "You need specific TCP services — web UIs, SSH, RDP, databases — not a whole subnet",
    "You can't get root or admin on the machine you're sitting at",
    "You want it next to an existing VPN, or a five-minute throwaway tunnel",
  ],
  summary: [
    "A flextunnel client configures each server as a named destination. The optional local SOCKS5 and HTTP proxies send matching requests through that destination over an encrypted QUIC connection. The server resolves hostnames and opens the TCP connection from its own network. Unmatched proxy requests connect directly from your device. Local port forwards always use a destination.",
    "Because it uses ordinary userspace sockets — no TUN device — neither the client nor the server needs root or admin rights. And because it isn't a VPN, it needs no VPN profile or network extension, so nothing stops you running one next to it, even on iOS.",
    "Regular connections authenticate with per-client Ed25519 keys in the shared flexaccess-keys format. The server keeps an SSH-style authorized-keys file. For a throwaway session, --quick authenticates both ends with the endpoint IDs you exchange at the prompts.",
  ],
  facts: [
    { label: "Access level", value: "TCP via local SOCKS5 / HTTP proxy listeners or forwarded ports" },
    { label: "Privileges", value: "None — no root or admin on either end" },
    { label: "DNS", value: "Tunneled hostnames resolve on the destination server" },
    { label: "Authentication", value: "Per-client Ed25519 keys or endpoint IDs in --quick mode" },
    { label: "VPN profile", value: "None — it isn't a VPN, so it sits beside one" },
    { label: "Routing policy", value: "Client selects a destination, server enforces its own allowlist" },
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
      body: "Bind a loopback port to a host and port reached through a destination. Database clients, RDP, and other apps can connect to the local port. Set up forwards in the desktop or iOS app, or in the CLI client config.",
    },
    {
      group: "Access",
      title: "Zero privileges",
      body: "The client and server run with ordinary user privileges. The Linux and macOS CLI installer writes to ~/.local/bin. The Windows CLI installer needs elevation for its system-wide install.",
    },
    {
      group: "Routing",
      title: "Routes per destination",
      body: "The client's most specific hostname or IP rule selects a server. That server checks the target against its own allowed domains and IP ranges. Requests through a proxy with no matching route connect directly.",
    },
    {
      group: "Routing",
      title: "Server-side DNS and host aliases",
      body: "Resolve private names on the destination server. The server can map exact names or wildcard suffixes to another hostname or IP. Use <name>.localhost.flextunnel.internal to reach the destination server's own loopback.",
    },
    {
      group: "Routing",
      title: "Quick ephemeral tunnels",
      body: "Run flextunnel client start --quick and flextunnel server start --quick, then enter each side's endpoint ID at the other side's prompt. All requests through the enabled proxies use the tunnel. The session is temporary, and the server exits if the client fails to connect within five minutes.",
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
      title: "Connects on demand",
      body: "The first request to a destination waits up to 45 seconds while the client connects. A dropped connection is retried with backoff when requests need it. Unused connections close after five minutes by default, and other destinations can keep serving traffic.",
    },
    {
      group: "Resilience & visibility",
      title: "Bring your own relays",
      body: "Point both ends at two or more custom relays and public infrastructure is out of the picture. A server that loses its home relay re-homes on another in place, so clients off the LAN aren't stranded.",
    },
    {
      group: "Resilience & visibility",
      title: "Live control panel",
      body: "flextunnel client control attaches a read-only terminal panel to a running client. It shows each destination's connection state and path, the configured routes, and the live state of port forwards.",
    },
    {
      group: "Resilience & visibility",
      title: "Built-in status page",
      body: "Through a local proxy, http://flextunnel.internal/ shows client status without dialing a server. Open /servers/<name>/ for that destination's server status. Both views also offer status.txt and status.json.",
    },
  ],
  demos: [
    {
      id: "demo",
      src: "/demos/flextunnel.cast",
      cols: 161,
      rows: 39,
      poster: "npt:1:42",
      title: "Watch a tunnel come up",
      lede: "Two Linux hosts install flextunnel as ordinary users. On the right, the client makes an Ed25519 key pair with flexaccess-keys. On the left, the server gets an identity key, the client's public key, and a two-line config. The client names the server as a destination by its endpoint ID and opens a SOCKS5 port. A second client shell fetches a page served only on the server's loopback, and that first request is what connects the destination.",
      label: "Terminal recording: setting up a flextunnel server and connecting a client",
      caption:
        "Real output from both hosts, nothing edited; pauses longer than two seconds are shortened on playback. The same steps are written out in the quick start below.",
    },
    {
      id: "demo-quick",
      src: "/demos/flextunnel-quick.cast",
      cols: 161,
      rows: 39,
      poster: "npt:1:11",
      title: "Or a throwaway tunnel with --quick",
      lede: "Two Linux hosts install flextunnel and run --quick as ordinary users. On the right, the client prints its endpoint ID. On the left, the server authorizes exactly that ID and prints its own. The client dials it and opens a SOCKS5 port. A second client shell fetches a page served only on the server's loopback, and the panel shows the path went direct. Quitting the panel disconnects without saving keys or configuration.",
      label: "Terminal recording: a flextunnel quick-mode session between a server and a client",
      caption:
        "Real output from both hosts, nothing edited; pauses longer than two seconds are shortened on playback.",
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
      body: "Paste each client's ed25519-pub line into ./authorized_keys. Add the domains and IP ranges this server should accept. Its own loopback is always reachable by authorized clients.",
      code: `secret_file = "./server.key"
authorized_keys_file = "./authorized_keys"

# Optional targets behind this server
routed_domains = ["*.corp.example"]
routed_cidrs = ["10.0.0.0/8"]`,
      codeTitle: "server.toml",
    },
    {
      title: "Start the server",
      body: "It prints its endpoint ID on startup. No port to open, no root needed.",
      code: "flextunnel server start -c server.toml",
    },
    {
      title: "Write the client config",
      body: "Name the destination and replace SERVER_ENDPOINT_ID with the ID printed by the server. The example sends the same domains and IP ranges that the server allows to this destination.",
      code: `socks_port = 1080
auth_key_file = "./client.key"

[[destinations]]
name = "office"
server_node_id = "SERVER_ENDPOINT_ID"
routed_domains = ["*.corp.example"]
routed_cidrs = ["10.0.0.0/8"]`,
      codeTitle: "client.toml",
    },
    {
      title: "Start the client",
      body: "The client opens the local SOCKS5 listener and dials a destination on its first request.",
      code: "flextunnel client start -c client.toml",
    },
    {
      title: "Use the tunnel",
      body: "If a web service is listening on the server's loopback port 8000, fetch it from a second terminal on the client. Use socks5h so the proxy receives the hostname.",
      code: "curl -x socks5h://127.0.0.1:1080 http://office.localhost.flextunnel.internal:8000/",
      aside:
        "For a one-off session, run --quick on both ends and enter each side's endpoint ID at the other side's prompt.",
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
      platform: "macOS / Windows app · client and server",
      name: "flextunnel-desktop",
      description:
        "The menu-bar or system-tray app can run a client and a server at the same time. One client manages multiple destinations and shares its optional SOCKS5 and HTTP listeners across them. The app supports local port forwards, in-app keys, live logs, a connection-path view, and import and export for destinations and forwards. It encrypts stored secrets with a key kept in the macOS Keychain or Windows Credential Manager.",
      distribution: "unsigned .dmg (Apple Silicon) / .msi (Windows x64)",
      repo: `${GITHUB_ORG_URL}/flextunnel/tree/main/crates/flextunnel-desktop`,
    },
    {
      platform: "iOS app",
      name: "flextunnel-ios",
      description:
        "Browse private sites through the in-app browser or forward localhost ports for apps like SSH and RDP. One session can reach multiple saved destinations using their configured routes. The app keeps keys in the Keychain. Port forwarding offers an opt-in, time-limited background keep-alive. The app runs without a VPN profile.",
      distribution: "alpha prerelease · unsigned .ipa to sign with your Apple Developer team",
      repo: `${GITHUB_ORG_URL}/flextunnel-ios`,
    },
  ],
  goodFor: [
    "Web UIs, SSH, RDP, and databases that are only reachable from the server's network",
    "A device you control where you can run a user-space client without admin rights",
    "Sitting next to a corporate or personal VPN — it isn't one, so there's nothing to switch off",
    "A throwaway TCP tunnel to a machine you can access, using --quick",
  ],
  notes: [
    {
      title: "Trusted clients, trusted host",
      body: "Authorize keys only for trusted clients. Authorized clients can reach the server's loopback as well as targets allowed by its routing policy. Use host-level controls to limit the server's network reach. Any local user or process that can reach a proxy listener on 127.0.0.1 can use it without authenticating.",
    },
    {
      title: "Need UDP forwarding?",
      body: "flextunnel carries TCP only. If you need to forward UDP — WireGuard or OpenVPN over P2P, game servers, VoIP, or UDP services in Kubernetes that kubectl port-forward can't reach — use tunnel-rs: peer-to-peer TCP and UDP port forwarding for Linux, macOS, and Windows over the same encrypted QUIC transport, with the same no-open-port NAT traversal, the same flexaccess-keys Ed25519 authentication, and no root on either end. It's built for development and homelab use rather than production.",
      link: { label: "tunnel-rs on GitHub", href: `${GITHUB_ORG_URL}/tunnel-rs` },
    },
    {
      title: "Check configs when upgrading",
      body: "Compare your server and client configs with the current examples before upgrading. Regular clients now declare their servers and routes in [[destinations]] tables.",
    },
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
      "The shared crate implements relay configuration, reachability probes, endpoint creation, in-place server relay failover, and endpoint-bound authentication. Each tool picks up changes when it updates its dependency.",
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
    name: "flexaccess-iroh/docs",
    kind: "design notes",
    summary:
      "Design notes and operating guides for the transport layer, kept next to the crate that implements it: relays and address lookup, relay failover, NAT traversal by NAT type, and self-hosting your own relay.",
    repo: `${GITHUB_ORG_URL}/flexaccess-iroh/tree/main/docs`,
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
    ezvpn: "CLI runs as root / Administrator",
    flextunnel: "Runs with ordinary user privileges",
  },
  {
    label: "How apps connect",
    ezvpn: "Transparently, through the system routing table",
    flextunnel: "Through a local SOCKS5 / HTTP proxy or a forwarded port",
  },
  {
    label: "Authentication",
    ezvpn: "Per-client Ed25519 key (flexaccess-keys)",
    flextunnel: "Per-client Ed25519 key (flexaccess-keys), or exchanged endpoint IDs in --quick mode",
  },
  {
    label: "Desktop apps",
    ezvpn: "macOS app as a signed .dmg, Windows app as an unsigned .msi — plus the CLI",
    flextunnel: "macOS / Windows tray app as unsigned .dmg / .msi — plus the CLI",
  },
  {
    label: "Phones",
    ezvpn: "iOS app, built from source under your own team",
    flextunnel: "iOS alpha with browser and port forwards, no VPN profile. Sign the unsigned .ipa with your Apple Developer team.",
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
