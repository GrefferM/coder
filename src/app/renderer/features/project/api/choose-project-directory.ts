import { CHOOSE_DIRECTORY_CHANNEL } from "../../../../../contracts";

/** Asks the system for a folder. `null` when the chooser was dismissed. */
export async function chooseProjectDirectory(): Promise<string | null> {
  return window.electronApi.invoke(CHOOSE_DIRECTORY_CHANNEL);
}
