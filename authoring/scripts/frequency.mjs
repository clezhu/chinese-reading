import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export function selectCharacters(rows, { start = 1, limit = 30, exclude = "" } = {}) {
  if (!Number.isSafeInteger(start) || start < 1 || start > rows.length) {
    throw new Error(`start must be an integer from 1 to ${rows.length}`);
  }
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 200) {
    throw new Error("limit must be an integer from 1 to 200");
  }
  const excluded = new Set(exclude);
  return rows.filter((row) => row.rank >= start && !excluded.has(row.hanzi))
    .slice(0, limit).map(({ rank, hanzi, count }) => ({ rank, hanzi, count }));
}

function main(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    if (!["--start", "--limit", "--exclude"].includes(key) || args[i + 1] === undefined) {
      throw new Error("Usage: npm run authoring:frequency -- [--start 1] [--limit 30] [--exclude 我的是]");
    }
    const name = key.slice(2);
    if (Object.hasOwn(options, name)) throw new Error(`Repeated option: ${key}`);
    options[name] = name === "exclude" ? args[i + 1] : Number(args[i + 1]);
  }
  const rows = JSON.parse(readFileSync(new URL("../data/subtlex-ch-characters.json", import.meta.url), "utf8"));
  console.log(JSON.stringify(selectCharacters(rows, options), null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
