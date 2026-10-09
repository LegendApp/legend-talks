import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { host, root } from "./setup";

const files = fs.readdirSync(path.join(root, "talks"), { recursive: true })
  .map(String).filter(file => /\.test\.[cm]?[jt]sx?$/.test(file)).sort();
let failures = 0;
// Native module mocks must be isolated between suites, matching the Slides runner.
for (const file of files) {
  const child = spawnSync(process.execPath, ["test", "--timeout", "60000", "--preload",
    path.join(host, "apps/slides/src/__tests__/nativeMock.ts"), path.join(root, "talks", file)], {
    cwd: root, stdio: "inherit",
  });
  if (child.error) throw child.error;
  if (child.status !== 0) failures++;
}
console.log(`${files.length - failures}/${files.length} talk test files passed.`);
process.exitCode = failures ? 1 : 0;
