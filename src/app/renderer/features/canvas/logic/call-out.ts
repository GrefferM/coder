import type { CallOut, WorkingAgent } from "../../../interfaces";

/**
 * What one agent has out this moment — a command by its own name, a server by the server's. A turn is what holds a call, and an agent may hold several
 * turns at once — the rows stand oldest first, so the call shown is the one of the same turn the work
 * pill wears. Nothing where the agent is not working, and nothing where its turn is calling nobody.
 */
export function callOut(working: WorkingAgent[], callsOut: Record<string, CallOut>, agentId: string): CallOut | null {
  const held = working.find((one) => one.agentId === agentId) ?? null;

  return held === null ? null : (callsOut[held.turnId] ?? null);
}
