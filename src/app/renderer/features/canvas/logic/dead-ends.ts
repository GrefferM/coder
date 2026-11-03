import { CANVAS_DEAD_PLACE_AWAY_PX } from "../constants";
import { freePlaceNear } from "../../../utils/math";
import type { Agent, Link } from "../../../interfaces";
import type { Point } from "../../../utils/math";

/**
 * Where each end of a line that names nobody stands. A hand-edited or merged file can make one; such a line is drawn
 * rather than hidden.
 *
 * The dead end is put in free space down and to the right of the live end, by the rule that places a new agent. A line
 * with both ends dead is not drawn.
 */
export function deadEnds(agents: Agent[], links: Link[]): Record<string, Point> {
  const placed: Record<string, Point> = {};
  const isLive = (agentId: string) => agents.some((agent) => agent.id === agentId);

  for (const link of links) {
    for (const [end, other] of [
      [link.from, link.to],
      [link.to, link.from],
    ]) {
      // Only an end with no agent in the project is dead.
      if (isLive(end) || placed[end] !== undefined) {
        continue;
      }

      const beside = agents.find((agent) => agent.id === other);

      // Both ends dead: nothing to hang from.
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
