import type { AgentMemory } from "./agent-memory.type";

/** Whether an agent with this memory keeps anything of its calls: only «Вимкнено» does not, and has nothing to compress. */
export function keepsMemory(memory: AgentMemory): boolean {
  return memory !== "none";
}

/** Whether this memory is the question's whole run as the record holds it, not the agent's own thread. */
export function sharesMemory(memory: AgentMemory): boolean {
  return memory === "shared";
}
