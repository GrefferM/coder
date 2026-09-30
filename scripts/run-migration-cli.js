// Under `ELECTRON_RUN_AS_NODE`, `defaultApp` restores the plain-Node `process.argv` layout TypeORM's CLI expects.
process.defaultApp = true;
require("ts-node").register();
require("typeorm/cli");
