import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

const curriculumPath = fileURLToPath(new URL("./app/content/curriculum", import.meta.url));
const fixturePath = fileURLToPath(new URL("./tests/revision-curriculum.ts", import.meta.url));

function revisionCurriculum(): Plugin {
  return {
    name: "revision-fixture-curriculum",
    enforce: "pre",
    resolveId(source, importer) {
      // The replacement imports the real implementation with explicit content.
      // Redirect all app consumers (SSR and client), not the replacement itself.
      if (!importer || importer.split("?")[0] === fixturePath || !source.startsWith(".")) return;
      if (resolve(dirname(importer.split("?")[0]), source).replace(/\.ts$/, "") === curriculumPath) return fixturePath;
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    ...(mode === "revision-fixture" ? [revisionCurriculum()] : []),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    reactRouter(),
  ],
  environments: { ssr: { build: { sourcemap: true } } },
}));
