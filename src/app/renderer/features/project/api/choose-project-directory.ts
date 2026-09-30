import { CHOOSE_DIRECTORY_CHANNEL } from "../../../../../contracts";

/** Asks the system for a folder; `null` when the chooser is dismissed. */
export async function chooseProjectDirectory(): Promise<string | null> {
  return window.electronApi.invoke(CHOOSE_DIRECTORY_CHANNEL);
}
