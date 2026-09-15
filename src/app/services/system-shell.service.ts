import { dialog, shell } from "electron";
import path from "node:path";
import { DIRECTORY_PICKER_TITLE } from "../constants";
import { PROJECT_FILE_NAME } from "../../modules/projects/constants";

/** Electron's own desktop calls: the folder chooser and the file-manager reveal. */
export class SystemShell {
  /** Opens the system's folder chooser. */
  async choose(): Promise<string | null> {
    const result = await dialog.showOpenDialog({
      title: DIRECTORY_PICKER_TITLE,
      properties: ["openDirectory", "createDirectory"],
    });

    if (result.canceled) {
      return null;
    }

    const [directory] = result.filePaths;

    return directory ?? null;
  }

  /** Reveals a project's config file in the system's file manager, with the project's folder open around it. */
  async revealProject(directory: string): Promise<void> {
    shell.showItemInFolder(path.join(directory, PROJECT_FILE_NAME));
  }
}
