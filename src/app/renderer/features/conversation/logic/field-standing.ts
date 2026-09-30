import type { FieldStanding } from "../interfaces";

/**
 * The send field's state: stitched where nothing can be written (nobody aimed at, or the agent off); walking while this
 * conversation has a walk out (typed text waits); open otherwise.
 */
export function fieldStanding(agentId: string | null, isAgentActive: boolean, isWalking: boolean): FieldStanding {
  if (agentId === null || !isAgentActive) {
    return "stitched";
  }

  return isWalking ? "walking" : "open";
}
