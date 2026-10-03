import { OPEN_PROJECT_CHANNEL } from "../../../../../contracts";
import { projectView } from "./project-view";
import type { OpenProject } from "../../../interfaces";

/** Reads the project in a folder and returns it with its folder and this machine's view of it. */
export async function openProject(directory: string): Promise<OpenProject> {
  const { config, print } = await window.electronApi.invoke(OPEN_PROJECT_CHANNEL, {
    directory,
  });

  return {
    directory,
    config,
    print,
    view: await projectView(directory),
  };
}
