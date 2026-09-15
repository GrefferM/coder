import { OPEN_PROJECT_CHANNEL } from "../../../../../contracts";
import { projectView } from "./project-view";
import type { OpenProject } from "../../../interfaces";

/** Reads the project in a folder and returns it with the folder it came from and this machine's own view of it. */
export async function openProject(directory: string): Promise<OpenProject> {
  return {
    directory,
    config: await window.electronApi.invoke(OPEN_PROJECT_CHANNEL, {
      directory,
    }),
    view: await projectView(directory),
  };
}
