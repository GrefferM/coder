// Packs the built app with electron-builder, signed by this machine's own identity where it holds one
// (`signing-identity.js`) and ad hoc otherwise.
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { signingIdentity } = require("./signing-identity");

const BUILDER = path.join(__dirname, "..", "node_modules", ".bin", "electron-builder");

execFileSync(BUILDER, ["--mac", `--config.mac.identity=${signingIdentity()}`], {
  stdio: "inherit",
});
