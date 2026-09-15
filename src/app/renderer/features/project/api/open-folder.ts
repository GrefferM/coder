import { OPEN_OR_CREATE_PROJECT_CHANNEL } from "../../../../../contracts";
import { projectView } from "./project-view";
import type { OpenProject } from "../../../interfaces";

/** Opens a folder the user chose, making it a project if it is not one yet. */
export async function openFolder(directory: string): Promise<OpenProject> {
  return {
    directory,
    config: await window.electronApi.invoke(OPEN_OR_CREATE_PROJECT_CHANNEL, {
      directory,
    }),
    view: await projectView(directory),
  };
}
