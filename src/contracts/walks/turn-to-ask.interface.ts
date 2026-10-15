import type { AgentStands } from "./agent-stands.interface";
import type { TurnMemory } from "./turn-memory.interface";
import type { ReachableAgent } from "../llm";
import type { Agent, GrantTargets } from "../project";

/**
 * Everything one turn is asked with, named rather than positional: which turn, whose and what the agent stands on, what
 * arrived and stands behind it, and what it may reach.
 */
export interface TurnToAsk {
  /** The turn's own id: the answer comes back under it and a stop ends it by it. */
  turnId: string;
  agent: Agent;
  /** The agent's model, that model's provider, and its prompt. */
  stands: AgentStands;
  /** What arrived: the person's words, or work a neighbour handed down a line. */
  asked: string;
  /** What goes to the model ahead of what arrived: the agent's own thread, or the question's shared memory. */
  memory: TurnMemory;
  /** What the turn may reach: the project's commands, its servers with what each hands over, and its agents. */
  catalogue: GrantTargets;
  /** Every agent reachable as a tool from this one, by id. */
  agents: ReachableAgent[];
  /** The project's folder, which is where a command runs. */
  directory: string;
  /** The row and the question the turn works under; an agent it calls with the shared memory reads that question. */
  runId: string | null;
  questionId: string;
}
