// Plain JavaScript: Electron resolves a `.ts` entry through the ESM loader, bypassing ts-node/register.
require("ts-node/register");
require("./agent-main.ts");
