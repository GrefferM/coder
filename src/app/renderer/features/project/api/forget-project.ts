import { FORGET_PROJECT_CHANNEL } from "../../../../../contracts";

/** Drops a project from this machine's list; its folder stays. */
export async function forgetProject(directory: string): Promise<void> {
  await window.electronApi.invoke(FORGET_PROJECT_CHANNEL, {
    directory,
  });
}
