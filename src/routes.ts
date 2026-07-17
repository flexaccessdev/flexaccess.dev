import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("ezvpn", "routes/ezvpn.tsx"),
  route("flextunnel", "routes/flextunnel.tsx"),
] satisfies RouteConfig;
