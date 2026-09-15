// TypeORM's CLI (yargs) works out how many leading process.argv entries are the runtime and script
// path — normally 2, matching plain Node. It drops only 1 when process.versions.electron is set and
// process.defaultApp is falsy, which is exactly the state ELECTRON_RUN_AS_NODE leaves the process in
// (used here so this CLI loads the same native better-sqlite3 build the Electron app itself uses) —
// Electron only sets process.defaultApp during its own normal app bootstrap, which
// ELECTRON_RUN_AS_NODE skips. Setting it here restores the plain-Node argv layout the CLI expects.
process.defaultApp = true;
require("ts-node").register();
require("typeorm/cli");
