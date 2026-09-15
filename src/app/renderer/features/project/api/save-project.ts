import { SAVE_PROJECT_CHANNEL } from "../../../../../contracts";
import type { ProjectConfig } from "../../../interfaces";

/** Writes the whole config into the project's folder. */
export async function saveProject(directory: string, config: ProjectConfig): Promise<void> {
  await window.electronApi.invoke(SAVE_PROJECT_CHANNEL, {
    directory,
    config,
  });
}
