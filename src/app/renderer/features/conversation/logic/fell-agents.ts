import { inStreamOrder } from "../../../../../contracts";
import { isOnScreen } from "../../../../../contracts";
import type { ChatMessage, WalkSnapshot } from "../interfaces";

/**
 * An agent whose last turn of this conversation fell and has said nothing since, with the hour it fell. The machine's
 * walls (off, silent, no model) stand in every conversation.
 */
export function fellAgents(walk: WalkSnapshot): Record<string, string> {
  const last: Record<string, ChatMessage> = {};
  const saidHere = Object.entries(walk.walks)
    .filter(([runKey]) => isOnScreen(walk, runKey))
    .flatMap(([, held]) => held.said);

  for (const said of inStreamOrder(saidHere)) {
    if (said.from === "agent") {
      last[said.agentId] = said;
    }
  }

  return Object.fromEntries(
    Object.entries(last)
      .filter(([, said]) => said.isFailure)
      .map(([agentId, said]) => [agentId, said.at]),
  );
}
