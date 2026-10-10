import { STOP_WALKS_CHANNEL } from "../../../../../contracts";

/** Ends every turn of the walk on screen; a walk put away carries on. */
export async function stopWalks(): Promise<void> {
  return window.electronApi.invoke(STOP_WALKS_CHANNEL);
}
