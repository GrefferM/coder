// Plain JavaScript: Electron resolves a `.ts` entry point through the ESM loader, bypassing ts-node/register.
require("ts-node/register");
require("./main.ts");
