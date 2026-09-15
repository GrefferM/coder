import { BrowserWindow } from "electron";
import { PROJECT_CHANGED_CHANNEL } from "../../contracts";
import type { ProjectChanged } from "../../contracts";
import type { ProjectVoice } from "../../modules/projects";

/** Tells the app's one window the open project's file changed on disk; with no window the message is dropped. */
export class WindowProjectVoice implements ProjectVoice {
  changed(directory: string): void {
    const [window] = BrowserWindow.getAllWindows();
    const said: ProjectChanged = {
      directory,
    };

    window?.webContents.send(PROJECT_CHANGED_CHANNEL, said);
  }
}
