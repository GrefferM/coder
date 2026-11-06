import { PUT_WALK_CHANNEL } from "../../../../../contracts";
import type { PutWalk, PutWalkAnswer } from "../../../../../contracts";

/** The person's question, put to one agent; the walk and the question, or `null` when the conversation took none. */
export async function putWalk(ask: PutWalk): Promise<PutWalkAnswer | null> {
  return window.electronApi.invoke(PUT_WALK_CHANNEL, ask);
}
