// Starts the renderer's Vite dev server, then launches Electron pointed at it.
//
// Vite is ESM-only, so its Node API is loaded with dynamic `import()` from this CommonJS script.
const path = require("node:path");
const { spawn } = require("node:child_process");

const RENDERER_ROOT = path.join(__dirname, "..", "src", "app", "renderer");
const BOOTSTRAP_PATH = path.join(__dirname, "..", "src", "app", "bootstrap.js");

async function main() {
  const { createServer } = await import("vite");
  const server = await createServer({
    configFile: path.join(RENDERER_ROOT, "vite.config.mts"),
  });

  await server.listen();
  server.printUrls();

  const address = server.httpServer.address();
  const devServerUrl = `http://localhost:${address.port}`;

  const electronBinary = require("electron");
  const electronProcess = spawn(electronBinary, [BOOTSTRAP_PATH], {
    stdio: "inherit",
    env: { ...process.env, RENDERER_DEV_SERVER_URL: devServerUrl },
  });

  electronProcess.on("exit", async (code) => {
    await server.close();
    process.exit(code ?? 0);
  });
}

main();
