import type { Route } from "./+types/ezvpn";
import { ezvpn } from "../data";
import { pageMeta } from "../seo";
import { ProductPage } from "../components/product-page";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: `ezvpn — ${ezvpn.tagline}`,
    description: ezvpn.metaDescription,
    path: "/ezvpn",
  });

export default function EzvpnPage() {
  return <ProductPage product={ezvpn} />;
}
