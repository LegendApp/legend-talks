import { plugin } from "bun";
import path from "node:path";
import { host } from "./setup";
import { resolveEffectPack } from "../test-support/legend-apps/packages/presentation/src/compiler/effectPacks";

plugin({
  name: "installed-slides-effects",
  setup(build) {
    build.onResolve({ filter: /^slides:/ }, args => ({
      path: resolveEffectPack(args.path, path.join(host, "packages/slides-effects/packs")).file,
    }));
  },
});
