import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { host, root } from "./setup";

const { compileDeck } = await import(pathToFileURL(path.join(host, "packages/presentation/src/compiler/index.ts")).href);
const { getDeckSourceStructure } = await import(pathToFileURL(path.join(host, "packages/presentation/src/speakerNotesSource.ts")).href);
const arguments_ = process.argv.slice(2);
const files = arguments_.length ? arguments_.map(file => path.resolve(file)) :
  fs.readdirSync(path.join(root, "talks"), { recursive: true }).map(String)
    .filter(file => file.endsWith(".mdx")).sort().map(file => path.join(root, "talks", file));
let failures = 0;
for (const file of files) {
  const result = await compileDeck(file);
  if (!result.success) failures++;
  console.log(JSON.stringify({ deck: path.relative(root, file), success: result.success,
    slides: result.success ? getDeckSourceStructure(fs.readFileSync(file, "utf8")).slides.length : undefined,
    errors: result.errors ?? [], warnings: result.warnings ?? [] }));
}
process.exitCode = failures ? 1 : 0;
