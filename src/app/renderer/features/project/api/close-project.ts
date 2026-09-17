import { CLOSE_PROJECT_CHANNEL } from "../../../../../contracts";

/**
 * Says the open project has been put down, so the main process stops listening to its folder. A project opened
 * after it moves the watch on its own, so this is for the way out that opens nothing: «Закрити проєкт».
 */
export async function closeProject(): Promise<void> {
  return window.electronApi.invoke(CLOSE_PROJECT_CHANNEL);
}
