import { OPEN_WALKS_CHANNEL } from "../../../../../contracts";
import type { ProjectConfig, WalkSnapshot } from "../../../../../contracts";

/** The open project's conversation begins in the backend; it answers with the walks it already holds. */
export async function openWalks(directory: string, config: ProjectConfig): Promise<WalkSnapshot> {
  return window.electronApi.invoke(OPEN_WALKS_CHANNEL, {
    directory,
    config,
  });
}
