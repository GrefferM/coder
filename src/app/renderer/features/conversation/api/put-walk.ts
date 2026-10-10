import { PUT_WALK_CHANNEL } from "../../../../../contracts";
import type { PackedAttachment } from "../../../../../contracts";

/** The person's question, put to one agent; the walk's id, or `null` when the conversation took no question. */
export async function putWalk(agentId: string, text: string, attached: PackedAttachment[]): Promise<string | null> {
  return window.electronApi.invoke(PUT_WALK_CHANNEL, {
    agentId,
    text,
    attached,
  });
}
