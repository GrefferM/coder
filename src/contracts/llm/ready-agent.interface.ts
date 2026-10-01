import type { AgentRun } from "./agent-run.interface";
import type { AgentMemory } from "../project/agent-memory.type";

/** An agent reachable as a tool that can run, with the run its call opens. */
export interface ReadyAgent extends AgentRun {
  agentId: string;
  name: string;
  notReady: null;
  /** Whether the call gives it the question's shared memory; its own or none give it the request alone. */
  memory: AgentMemory;
  /** The context ceiling of its model, in characters, which the request and memory are weighed against. */
  contextCeiling: number;
}
