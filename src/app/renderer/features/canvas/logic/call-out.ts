import type { CallOut, WorkingAgent } from "../../../interfaces";

/**
 * What one agent has out now: a command by its name, a server by the server's. With several turns the oldest row wins,
 * matching the work pill. Nothing when the agent is not working or its turn calls nobody.
 */
export function callOut(working: WorkingAgent[], callsOut: Record<string, CallOut>, agentId: string): CallOut | null {
  const held = working.find((one) => one.agentId === agentId) ?? null;

  return held === null ? null : (callsOut[held.turnId] ?? null);
}
