import { spawnSync } from "node:child_process";
import path from "node:path";
import { host, root } from "./setup";

const child = spawnSync(path.join(host, "node_modules/.bin/tsc"), ["--noEmit", "--project", path.join(root, "tsconfig.json")], {
  cwd: root, stdio: "inherit",
});
if (child.error) throw child.error;
process.exitCode = child.status ?? 1;
