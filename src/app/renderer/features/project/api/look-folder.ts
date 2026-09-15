import { LOOK_PROJECT_CHANNEL } from "../../../../../contracts";
import type { FolderContents } from "../../../interfaces";

/** What the chosen folder holds, asked before anything is written to it. */
export async function lookFolder(directory: string): Promise<FolderContents> {
  return window.electronApi.invoke(LOOK_PROJECT_CHANNEL, {
    directory,
  });
}
