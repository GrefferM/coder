import { app, BrowserWindow, dialog } from "electron";
import * as path from "node:path";
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
  DEV_HEARING_APP_PATH,
  HEARING_APP_NAME,
  PRELOAD_SCRIPT_PATH,
  RENDERER_DEV_SERVER_URL,
  RENDERER_INDEX_PATH,
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
  const wired = await createBackend({
    userDataPath: app.getPath("userData"),
    cipher: new SafeStorageCipher(),
    voices: {
      project: new WindowProjectVoice(),
      agent: new WindowVoice(),
      walk: new WindowWalkVoice(),
    },
    hearingAppPath: app.isPackaged ? path.join(process.resourcesPath, HEARING_APP_NAME) : DEV_HEARING_APP_PATH,
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

/** Opens the app's one window, on the Vite dev server under `npm run dev:app` and on the built renderer otherwise. */
async function createWindow(): Promise<void> {
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

  if (RENDERER_DEV_SERVER_URL !== undefined) {
    await window.loadURL(RENDERER_DEV_SERVER_URL);

    return;
  }

  await window.loadFile(RENDERER_INDEX_PATH);
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
