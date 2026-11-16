import type { Config } from "@react-router/dev/config";
import { routes } from "./site.config.mjs";

export default {
  appDirectory: "src",
  ssr: false,
  prerender: routes.map((r) => r.path),
  future: {
    v8_middleware: true,
    v8_splitRouteModules: true,
    v8_viteEnvironmentApi: true,
    v8_passThroughRequests: true,
    v8_trailingSlashAwareDataRequests: true,
  },
} satisfies Config;
