import { AppWindow, Globe, Laptop, Network, Server } from "lucide-react";
import type { FlowItem } from "./diagrams";

export const ezvpnFlow: FlowItem[] = [
  { kind: "node", icon: AppWindow, title: "any app", sub: "unchanged" },
  { kind: "link", label: "system routing table" },
  { kind: "node", icon: Laptop, title: "ezvpn client", sub: "TUN interface · root" },
  { kind: "link", label: "IP packets as QUIC datagrams", sub: "direct or relayed", style: "tunnel" },
  { kind: "node", icon: Server, title: "ezvpn server", sub: "TUN · no open port", accent: true },
  { kind: "link", label: "forwarded by the OS" },
  { kind: "node", icon: Network, title: "private subnet", sub: "any protocol" },
];

export const flextunnelFlow: FlowItem[] = [
  { kind: "node", icon: AppWindow, title: "proxy-aware app", sub: "or a forwarded port" },
  { kind: "link", label: "SOCKS5 / HTTP on 127.0.0.1" },
  { kind: "node", icon: Laptop, title: "flextunnel client", sub: "no root" },
  { kind: "link", label: "one QUIC connection", sub: "direct or relayed", style: "tunnel" },
  { kind: "node", icon: Server, title: "flextunnel server", sub: "no root · no open port", accent: true },
  { kind: "link", label: "resolves DNS, dials TCP" },
  { kind: "node", icon: Globe, title: "target host:port", sub: "on the server's network" },
];
