import { PROJECT_CHANGED_CHANNEL } from "../../contracts";
import type { ProjectChanged } from "../../contracts";
import type { ProjectVoice } from "../../modules/projects";
import type { AppWindows } from "./app-windows.service";

/** Tells the main window the open project's file changed on disk; dropped while it is not open. */
export class WindowProjectVoice implements ProjectVoice {
  constructor(private readonly windows: AppWindows) {}

  changed(directory: string): void {
    const said: ProjectChanged = {
      directory,
    };

    this.windows.toMain(PROJECT_CHANGED_CHANNEL, said);
  }
}
