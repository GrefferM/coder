import { isOnScreen } from "../../../../../contracts";
import type { WalkSnapshot } from "../interfaces";
import type { WorkingAgent } from "../../../interfaces";

/**
 * Every turn of the conversation on screen still out, oldest first: whose it is and since when. Turns of other
 * conversations are excluded; turn words arrive apart, so the list stands still.
 */
export function workingTurns(walk: WalkSnapshot): WorkingAgent[] {
  const { out, walks } = walk;

  return Object.values(out)
    .filter((standing) => isOnScreen(walk, standing.runKey))
    .sort((one, other) => one.startedAt - other.startedAt)
    .map((standing) => ({
      turnId: standing.turnId,
      agentId: standing.agentId,
      startedAt: standing.startedAt,
      // The block the working card stands in: the walk's question.
      questionId: walks[standing.runKey]?.questionId ?? "",
      askedAt: walks[standing.runKey]?.askedAt ?? standing.startedAt,
    }));
}
