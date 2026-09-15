import { REVEAL_PROJECT_CHANNEL } from "../../../../../contracts";

/** Shows a project's folder in the file manager. */
export async function revealProject(directory: string): Promise<void> {
  await window.electronApi.invoke(REVEAL_PROJECT_CHANNEL, directory);
}
