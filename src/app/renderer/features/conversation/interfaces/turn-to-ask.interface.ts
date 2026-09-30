import type { AgentStands } from "./agent-stands.interface";
import type { Agent, ChatTurn, GrantTargets, ReachableAgent } from "../../../interfaces";

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
  /** The agent's own pairs in this conversation; they go to the model ahead of what arrived. */
  thread: ChatTurn[];
  /** What the turn may reach: the project's commands and servers, and what each server hands over. */
  catalogue: GrantTargets;
  /** Every agent reachable as a tool from this one, by id. */
  agents: ReachableAgent[];
  /** The project's folder, which is where a command runs. */
  directory: string;
}
