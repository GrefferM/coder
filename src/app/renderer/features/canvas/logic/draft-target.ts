import { SPHERE_SIZE_PX } from "../../../components/sphere/constants";
import type { Agent } from "../../../interfaces";
import type { Point } from "../../../utils/math";

/**
 * The sphere a line being drawn is over — the end it would take if it were let go now. The line's own
 * sphere is never it, and «over» means the pointer is inside the sphere's own circle, not merely near it.
 */
export function draftTarget(agents: Agent[], fromAgentId: string, at: Point): Agent | null {
  return (
    agents.find(
      (agent) => agent.id !== fromAgentId && Math.hypot(agent.x - at.x, agent.y - at.y) <= SPHERE_SIZE_PX / 2,
    ) ?? null
  );
}
