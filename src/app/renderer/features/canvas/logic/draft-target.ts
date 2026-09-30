import { SPHERE_SIZE_PX } from "../../../components/sphere/constants";
import type { Agent } from "../../../interfaces";
import type { Point } from "../../../utils/math";

/**
 * The sphere a line being drawn is over, i.e. the end it would take if let go now. Never the line's own sphere; «over»
 * means the pointer is inside the sphere's circle.
 */
export function draftTarget(agents: Agent[], fromAgentId: string, at: Point): Agent | null {
  return (
    agents.find(
      (agent) => agent.id !== fromAgentId && Math.hypot(agent.x - at.x, agent.y - at.y) <= SPHERE_SIZE_PX / 2,
    ) ?? null
  );
}
