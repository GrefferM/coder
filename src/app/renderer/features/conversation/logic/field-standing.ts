import type { FieldStanding } from "../interfaces";

/**
 * Which of the three states the send field is in. Stitched where nothing can be written — nobody aimed at, or
 * the agent switched off. Walking while this conversation has a walk out: what is typed waits, nothing is sent.
 * Open otherwise.
 */
export function fieldStanding(agentId: string | null, isAgentActive: boolean, isWalking: boolean): FieldStanding {
  if (agentId === null || !isAgentActive) {
    return "stitched";
  }

  return isWalking ? "walking" : "open";
}
