import { app, BrowserWindow, dialog } from "electron";
import { createDataSource } from "../modules";
import { createCommandsModule } from "../modules/commands";
import { createLlmModule } from "../modules/llm";
import { createMcpModule } from "../modules/mcp";
import { createProjectModule } from "../modules/projects";
import { createProvidersModule } from "../modules/providers";
import { createRunModule } from "../modules/runs";
import { createSecretsModule } from "../modules/secrets";
import {
  registerIpcChannels,
  DELETIONS_IPC_CHANNELS,
  LLM_IPC_CHANNELS,
  MCP_IPC_CHANNELS,
  PROJECTS_IPC_CHANNELS,
  PROVIDERS_IPC_CHANNELS,
  RUNS_IPC_CHANNELS,
  SHELL_IPC_CHANNELS,
} from "./ipc";
import { SafeStorageCipher, SystemShell, WindowProjectVoice, WindowVoice } from "./services";
import type { McpClient } from "../modules/mcp";
import {
  APP_ICON_PATH,
  APP_NAME,
  PRELOAD_SCRIPT_PATH,
  RENDERER_DEV_SERVER_URL,
  STARTUP_FAILURE_TITLE,
  WINDOW_BACKGROUND_COLOR,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from "./constants";

app.setName(APP_NAME);

/** The one client every MCP server is reached through; null until a server is asked for. */
let mcpClient: McpClient | null = null;

/** Opens the SQLite database, applies pending migrations, registers every domain's IPC channels. */
async function initializeIpc(): Promise<void> {
  const dataSource = createDataSource(app.getPath("userData"));

  await dataSource.initialize();
  await dataSource.runMigrations();

  const { controller: projectController, deletionController } = createProjectModule(
    dataSource,
    new WindowProjectVoice(),
  );
  const { service: secretService } = createSecretsModule(new SafeStorageCipher(), app.getPath("userData"));
  const { controller: providerController, service: providerService } = createProvidersModule(
    secretService,
    app.getPath("userData"),
  );
  const { controller: runController, keeper: runKeeper } = createRunModule(dataSource);

  // Closes a run left open by a closing app.
  await runKeeper.settleOpen();
  // Counts the thirty days at startup.
  await runKeeper.sweep();

  const { runner: commandRunner } = createCommandsModule();

  // A local server is a process this app started, so this app stops it.
  const { controller: mcpController, client } = createMcpModule(secretService, dataSource);

  mcpClient = client;

  const { controller: llmController } = createLlmModule(providerService, new WindowVoice(), commandRunner, client);
  const systemShell = new SystemShell();

  registerIpcChannels(projectController, PROJECTS_IPC_CHANNELS);
  registerIpcChannels(deletionController, DELETIONS_IPC_CHANNELS);
  registerIpcChannels(providerController, PROVIDERS_IPC_CHANNELS);
  registerIpcChannels(llmController, LLM_IPC_CHANNELS);
  registerIpcChannels(mcpController, MCP_IPC_CHANNELS);
  registerIpcChannels(runController, RUNS_IPC_CHANNELS);
  registerIpcChannels(systemShell, SHELL_IPC_CHANNELS);
}

/** Opens the app's one window, pointed at the Vite dev server. */
async function createWindow(): Promise<void> {
  if (!RENDERER_DEV_SERVER_URL) {
    throw new Error("RENDERER_DEV_SERVER_URL is not set — run this app through `npm run dev:app`.");
  }

  const window = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    backgroundColor: WINDOW_BACKGROUND_COLOR,
    icon: APP_ICON_PATH,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: PRELOAD_SCRIPT_PATH,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await window.loadURL(RENDERER_DEV_SERVER_URL);
}

/** Sets the Dock icon on macOS; a packaged build takes it from the bundle. */
function applyDockIcon(): void {
  app.dock?.setIcon(APP_ICON_PATH);
}

/** Names the startup failure in a system dialog, then quits. */
function failToStart(failure: unknown): void {
  dialog.showErrorBox(STARTUP_FAILURE_TITLE, failure instanceof Error ? failure.message : String(failure));
  app.quit();
}

app
  .whenReady()
  .then(async () => {
    await initializeIpc();
    await createWindow();
    applyDockIcon();
  })
  .catch(failToStart);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  void mcpClient?.closeAll();
});
