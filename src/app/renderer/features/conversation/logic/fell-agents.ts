import { inStreamOrder } from "./chat-stream";
import { isOnScreen } from "./is-on-screen";
import type { ChatMessage, WalkState } from "../interfaces";

/**
 * An agent whose last turn of this conversation fell and has said nothing since, with the hour it fell. A fall
 * belongs to one conversation; the walls of the machine — off, silent, no model — stand in all of them alike.
 */
export function fellAgents(walk: WalkState): Record<string, string> {
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
