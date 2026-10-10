import { GO_ON_IN_WALKS_CHANNEL } from "../../../../../contracts";

/** The conversation goes on in this run, or in a new one when `null`. */
export async function goOnInWalks(runId: string | null): Promise<void> {
  return window.electronApi.invoke(GO_ON_IN_WALKS_CHANNEL, {
    runId,
  });
}
