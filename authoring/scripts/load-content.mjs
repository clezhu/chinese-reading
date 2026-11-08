import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

/** Load trusted repository TS without changing the app's extensionless imports.
 * TypeScript erases type imports; remaining local dependencies become data URLs.
 * This is a CLI/test loader, not a sandbox or a production module loader.
 */
export async function loadContent(path) {
  const cache = new Map();
  async function compile(filename, ancestors = []) {
    filename = resolve(filename);
    if (ancestors.includes(filename)) throw new Error(`Runtime import cycle: ${filename}`);
    if (cache.has(filename)) return cache.get(filename);
    const source = await readFile(filename, "utf8");
    let { outputText } = ts.transpileModule(source, {
      fileName: filename,
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    });
    const imports = ts.preProcessFile(outputText).importedFiles;
    for (const ref of imports.reverse()) {
      if (!ref.fileName.startsWith(".")) throw new Error(`Only local content imports supported: ${ref.fileName}`);
      let dependency = resolve(filename, "..", ref.fileName);
      if (!extname(dependency)) dependency += ".ts";
      const url = await compile(dependency, [...ancestors, filename]);
      outputText = outputText.slice(0, ref.pos) + JSON.stringify(url) +
        outputText.slice(ref.pos + ref.fileName.length + 2);
    }
    const url = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
    cache.set(filename, url);
    return url;
  }
  return import(await compile(resolve(repoRoot, path)));
}
