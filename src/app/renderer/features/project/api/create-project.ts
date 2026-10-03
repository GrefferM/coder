import { CREATE_PROJECT_CHANNEL } from "../../../../../contracts";
import type { OpenProject } from "../../../interfaces";

/** Turns a folder into a project under the name the form holds. */
export async function createProject(directory: string, name: string): Promise<OpenProject> {
  const { config, print } = await window.electronApi.invoke(CREATE_PROJECT_CHANNEL, {
    directory,
    name,
  });

  return {
    directory,
    config,
    print,
    view: null,
  };
}
