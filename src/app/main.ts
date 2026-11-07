import { app, BrowserWindow, dialog } from "electron";
import {
  registerIpcChannels,
  DELETIONS_IPC_CHANNELS,
  MCP_IPC_CHANNELS,
  SCHEDULES_IPC_CHANNELS,
  PROJECTS_IPC_CHANNELS,
  PROVIDERS_IPC_CHANNELS,
  RUNS_IPC_CHANNELS,
  SHELL_IPC_CHANNELS,
  SPEECH_IPC_CHANNELS,
  WALKS_IPC_CHANNELS,
} from "./ipc";
import { SafeStorageCipher, SystemShell, WindowProjectVoice, WindowVoice, WindowWalkVoice } from "./services";
import { createBackend } from "./backend";
import type { Backend } from "./backend";
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

/** The backend, wired once the app is ready. */
let backend: Backend | null = null;

/** Wires the backend to the one window and registers every domain's IPC channels. */
async function initializeIpc(): Promise<void> {
  const wired = await createBackend(app.getPath("userData"), new SafeStorageCipher(), {
    project: new WindowProjectVoice(),
    agent: new WindowVoice(),
    walk: new WindowWalkVoice(),
  });

  backend = wired;

  // Closes a run left open by a closing app.
  await wired.keeper.settleOpen();
  // Counts the thirty days at startup.
  await wired.keeper.sweep();

  registerIpcChannels(wired.projectController, PROJECTS_IPC_CHANNELS);
  registerIpcChannels(wired.deletionController, DELETIONS_IPC_CHANNELS);
  registerIpcChannels(wired.providerController, PROVIDERS_IPC_CHANNELS);
  registerIpcChannels(wired.speechController, SPEECH_IPC_CHANNELS);
  registerIpcChannels(wired.mcpController, MCP_IPC_CHANNELS);
  registerIpcChannels(wired.runController, RUNS_IPC_CHANNELS);
  registerIpcChannels(wired.walkController, WALKS_IPC_CHANNELS);
  registerIpcChannels(wired.scheduleController, SCHEDULES_IPC_CHANNELS);
  registerIpcChannels(new SystemShell(), SHELL_IPC_CHANNELS);
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

  // Coming back from an editor, a change the file system did not deliver is read now, not at the next save.
  window.on("focus", () => {
    void backend?.watch.look();
  });

  await window.loadURL(RENDERER_DEV_SERVER_URL);
}

/** Sets the Dock icon on macOS; a packaged build takes it from the bundle. */
function applyDockIcon(): void {
  app.dock?.setIcon(APP_ICON_PATH);
}

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
  backend?.stopSchedules();
  void backend?.stopServers();
});
