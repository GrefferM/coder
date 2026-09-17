import { CANVAS_DEAD_PLACE_AWAY_PX } from "../constants";
import { freePlaceNear } from "../../../utils/math";
import type { Agent, Link } from "../../../interfaces";
import type { Point } from "../../../utils/math";

/**
 * Where every end of a line that names nobody stands. The app never makes one — a deletion takes the lines on
 * it in the same write — but a hand-edited file, a merge or a `git pull` can, and a line the file holds is drawn
 * as it is rather than hidden (50a).
 *
 * A line carries two ids and no place, so the dead end is put in free space a clear field down and to the right
 * of the live one it hangs from, by the rule that places a new agent and a pasted copy. A line with both ends
 * dead is nobody's to call and has no live end to hang from: it is not drawn, and nothing here answers for it.
 */
export function deadEnds(agents: Agent[], links: Link[]): Record<string, Point> {
  const placed: Record<string, Point> = {};
  const isLive = (agentId: string) => agents.some((agent) => agent.id === agentId);

  for (const link of links) {
    for (const [end, other] of [
      [link.from, link.to],
      [link.to, link.from],
    ]) {
      // Only an end the project has no agent for is dead; the live one is drawn as the agent it is.
      if (isLive(end) || placed[end] !== undefined) {
        continue;
      }

      const beside = agents.find((agent) => agent.id === other);

      // Both ends dead: nothing to hang from, and nobody could call it anyway.
      if (beside === undefined) {
        continue;
      }

      placed[end] = freePlaceNear(
        {
          x: beside.x + CANVAS_DEAD_PLACE_AWAY_PX,
          y: beside.y + CANVAS_DEAD_PLACE_AWAY_PX,
        },
        [...agents, ...Object.values(placed)],
      );
    }
  }

  return placed;
}
