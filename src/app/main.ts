import { app, dialog } from "electron";
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
  WIDGET_IPC_CHANNELS,
  WIDGET_SHELL_IPC_CHANNELS,
  WIDGET_WALK_IPC_CHANNELS,
} from "./ipc";
import {
  AppStage,
  AppWindows,
  SafeStorageCipher,
  SystemShell,
  WindowProjectVoice,
  WindowVoice,
  WindowWalkVoice,
  WindowWidgetVoice,
} from "./services";
import { createBackend } from "./backend";
import type { Backend } from "./backend";
import { APP_ICON_PATH, APP_NAME, DEV_HEARING_APP_PATH, HEARING_APP_NAME, STARTUP_FAILURE_TITLE } from "./constants";

app.setName(APP_NAME);

/** The backend, wired once the app is ready. */
let backend: Backend | null = null;

/** The main window and the widget, by what they are; every push names which one it goes to. */
const windows = new AppWindows();

/** Wires the backend to the windows and registers every domain's IPC channels; answers with the stage. */
async function initializeIpc(): Promise<AppStage> {
  const wired = await createBackend({
    userDataPath: app.getPath("userData"),
    cipher: new SafeStorageCipher(),
    voices: {
      project: new WindowProjectVoice(windows),
      agent: new WindowVoice(windows),
      walk: new WindowWalkVoice(windows),
      widget: new WindowWidgetVoice(windows),
    },
    hearingAppPath: app.isPackaged ? path.join(process.resourcesPath, HEARING_APP_NAME) : DEV_HEARING_APP_PATH,
  });
  const stage = new AppStage({
    windows,
    widgetSettings: wired.widgetSettings,
    onMainFocus: () => void wired.watch.look(),
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
  registerIpcChannels(wired.widgetController, WIDGET_IPC_CHANNELS);
  registerIpcChannels(wired.widgetWalkController, WIDGET_WALK_IPC_CHANNELS);
  registerIpcChannels(stage, WIDGET_SHELL_IPC_CHANNELS);
  registerIpcChannels(new SystemShell(), SHELL_IPC_CHANNELS);

  return stage;
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
    const stage = await initializeIpc();

    applyDockIcon();
    await stage.start();

    // A click on the Dock icon with no window up brings the main window back.
    app.on("activate", () => void stage.openMain());
  })
  .catch(failToStart);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  backend?.stopSchedules();
  void backend?.stopServers();
});
