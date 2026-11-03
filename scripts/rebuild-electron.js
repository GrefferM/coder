// Builds better-sqlite3 against the Electron in node_modules, the runtime that loads it: the app, `test:back` and
// the migrations. `npm install` builds it for the Node that ran the install, which Electron refuses to load.
const { execFileSync } = require("node:child_process");
const { version } = require("electron/package.json");

execFileSync(
  "npm",
  [
    "rebuild",
    "better-sqlite3",
    "--runtime=electron",
    `--target=${version}`,
    "--dist-url=https://electronjs.org/headers",
  ],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
  },
);
