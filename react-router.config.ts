import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  // Build-time mode only: no runtime env flag, test route, or published lesson.
  buildDirectory: import.meta.env.MODE === "revision-fixture" ? ".wrangler/revision-build" : "build",
} satisfies Config;
