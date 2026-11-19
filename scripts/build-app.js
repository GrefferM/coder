// Builds what `npm run build:mac` packages: the main process compiled into dist/, the files it reads beside it,
// the renderer built into dist/renderer, and Coder Hearing built into build/.
//
// Vite is ESM-only, so its Node API is loaded with dynamic `import()` from this CommonJS script.
const path = require("node:path");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { buildHearing } = require("./build-hearing");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const APP_SOURCE = path.join(ROOT, "src", "app");
const APP_BUILT = path.join(DIST, "app");
const RENDERER_ROOT = path.join(APP_SOURCE, "renderer");
const TSC = path.join(ROOT, "node_modules", ".bin", "tsc");

async function main() {
  fs.rmSync(DIST, {
    recursive: true,
    force: true,
  });

  execFileSync(TSC, ["-p", path.join(ROOT, "tsconfig.build.json")], {
    stdio: "inherit",
  });

  // tsc writes only what it compiles: the preload script and the icon are copied as they are.
  fs.copyFileSync(path.join(APP_SOURCE, "preload.js"), path.join(APP_BUILT, "preload.js"));
  fs.cpSync(path.join(APP_SOURCE, "assets"), path.join(APP_BUILT, "assets"), {
    recursive: true,
  });

  buildHearing();

  const { build } = await import("vite");

  await build({
    configFile: path.join(RENDERER_ROOT, "vite.config.mts"),
  });
}

main().catch((failure) => {
  console.error(failure);
  process.exit(1);
});
