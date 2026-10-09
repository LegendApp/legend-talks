import fs from "node:fs";
import path from "node:path";

export const root = path.resolve(import.meta.dirname, "..");
export const host = path.resolve(process.env.LEGEND_APPS_PATH ?? path.join(root, "../legend-apps"));

function link(source: string, destination: string) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const existing = fs.lstatSync(destination, { throwIfNoEntry: false });
  if (existing) {
    if (!existing.isSymbolicLink()) throw new Error(`Refusing to replace ${destination}.`);
    if (path.resolve(path.dirname(destination), fs.readlinkSync(destination)) === source) return;
    fs.unlinkSync(destination);
  }
  fs.symlinkSync(path.relative(path.dirname(destination), source), destination);
}

if (!fs.existsSync(path.join(host, "packages/presentation/src/compiler/index.ts")) ||
    !fs.existsSync(path.join(host, "node_modules/react/package.json"))) {
  throw new Error("Set LEGEND_APPS_PATH to a Legend Apps checkout with its dependencies installed.");
}

link(host, path.join(root, "test-support/legend-apps"));
const locations = [path.join(host, "apps/slides"), host];
const names = new Set<string>();
for (const location of locations) {
  const manifest = JSON.parse(fs.readFileSync(path.join(location, "package.json"), "utf8"));
  for (const name of Object.keys({ ...manifest.dependencies, ...manifest.devDependencies })) names.add(name);
}
for (const name of names) {
  const source = locations.map(location => path.join(location, "node_modules", name)).find(fs.existsSync);
  if (source) link(source, path.join(root, "node_modules", name));
}
link(path.join(host, "node_modules/.bin"), path.join(root, "node_modules/.bin"));
if (import.meta.main) console.log(`Using Legend Apps at ${host}.`);
