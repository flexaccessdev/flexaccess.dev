import type { Route } from "./+types/flextunnel";
import { flextunnel } from "../data";
import { pageMeta } from "../seo";
import { ProductPage } from "../components/product-page";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: `flextunnel — ${flextunnel.tagline}`,
    description: flextunnel.metaDescription,
    path: "/flextunnel",
  });

export default function FlextunnelPage() {
  return <ProductPage product={flextunnel} />;
}
