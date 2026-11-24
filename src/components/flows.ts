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
  { kind: "node", icon: AppWindow, title: "local app" },
  { kind: "link", label: "local proxy or port forward" },
  { kind: "node", icon: Laptop, title: "flextunnel client", sub: "no root" },
  { kind: "link", label: "QUIC to selected destination", sub: "direct or relayed", style: "tunnel" },
  { kind: "node", icon: Server, title: "flextunnel server", sub: "no root · no open port", accent: true },
  { kind: "link", label: "resolves DNS, dials TCP" },
  { kind: "node", icon: Globe, title: "target host:port", sub: "on the server's network" },
];
