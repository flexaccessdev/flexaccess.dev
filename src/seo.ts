import type { MetaDescriptor } from "react-router";
import { SITE_URL } from "../site.config.mjs";

const OG_IMAGE = `${SITE_URL}/flexaccess.svg`;

export function pageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): MetaDescriptor[] {
  const url = path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: OG_IMAGE },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: OG_IMAGE },
    { tagName: "link", rel: "canonical", href: url },
  ];
}
