import { isOnScreen } from "./is-on-screen";
import type { WalkState } from "../interfaces";
import type { WorkingAgent } from "../../../interfaces";

/**
 * Every turn of the conversation on screen still out, oldest first: whose it is and since when. A turn of
 * another conversation is not here, and the words a turn is saying arrive apart, so this list stands still.
 */
export function workingTurns(walk: WalkState): WorkingAgent[] {
  const { out, walks } = walk;

  return Object.values(out)
    .filter((standing) => isOnScreen(walk, standing.runKey))
    .sort((one, other) => one.startedAt - other.startedAt)
    .map((standing) => ({
      turnId: standing.turnId,
      agentId: standing.agentId,
      startedAt: standing.startedAt,
      // The block the working card stands in is the walk's question, and the walk names it.
      questionId: walks[standing.runKey]?.questionId ?? "",
      askedAt: walks[standing.runKey]?.askedAt ?? standing.startedAt,
    }));
}
