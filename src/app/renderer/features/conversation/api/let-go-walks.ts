import { LET_GO_WALKS_CHANNEL } from "../../../../../contracts";

/** The run was deleted by hand; the conversation is emptied if it wrote into it. */
export async function letGoWalks(runId: string): Promise<void> {
  return window.electronApi.invoke(LET_GO_WALKS_CHANNEL, {
    runId,
  });
}
