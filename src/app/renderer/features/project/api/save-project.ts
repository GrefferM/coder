import { SAVE_PROJECT_CHANNEL } from "../../../../../contracts";
import type { ProjectConfig } from "../../../interfaces";

/**
 * Writes the whole config into the project's folder, made from the reading `basis` names; gives what the folder holds
 * now. Refused when the folder has moved on from that reading.
 */
export async function saveProject(directory: string, config: ProjectConfig, basis: string): Promise<string> {
  return window.electronApi.invoke(SAVE_PROJECT_CHANNEL, {
    directory,
    config,
    basis,
  });
}
