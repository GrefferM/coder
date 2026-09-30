import { CLOSE_PROJECT_CHANNEL } from "../../../../../contracts";

/**
 * Tells the main process the open project is put down so it stops watching its folder; for the exit that opens nothing:
 * «Закрити проєкт».
 */
export async function closeProject(): Promise<void> {
  return window.electronApi.invoke(CLOSE_PROJECT_CHANNEL);
}
