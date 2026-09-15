import { LIST_RECENT_PROJECTS_CHANNEL } from "../../../../../contracts";
import type { ProjectEntry } from "../../../interfaces";

/** Every project this machine knows about. */
export async function listRecentProjects(): Promise<ProjectEntry[]> {
  return window.electronApi.invoke(LIST_RECENT_PROJECTS_CHANNEL);
}
