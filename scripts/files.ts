import fs from "node:fs";
import path from "node:path";
import { root } from "./setup";

export function talkFiles() {
  return fs.readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !entry.name.startsWith(".") &&
      !["node_modules", "test-support", "scripts", "docs"].includes(entry.name))
    .flatMap(entry => fs.readdirSync(path.join(root, entry.name), { recursive: true })
      .map(file => path.join(root, entry.name, String(file))))
    .sort();
}
