import type { AgentStands } from "./agent-stands.interface";
import type { Agent, ChatTurn, GrantTargets, ReachableAgent } from "../../../interfaces";

/**
 * Everything one turn is asked with, in one named thing: which turn it is, whose it is and what that agent
 * stands on, what arrived and what stands behind it, and what the turn may reach into. Named rather than
 * handed over in a row, so a caller says which is which and cannot say them in the wrong order.
 */
export interface TurnToAsk {
  /** This turn's own id: the answer comes back under it, and a stop ends it by it. */
  turnId: string;
  agent: Agent;
  /** The model the agent was given, the provider that model answers at, and its prompt. */
  stands: AgentStands;
  /** What arrived — the person's words, or the work a neighbour handed down a line. */
  asked: string;
  /** The agent's own pairs of this conversation; they go to the model ahead of what arrived. */
  thread: ChatTurn[];
  /** What the turn may reach into — the project's commands and servers, and what each server hands over. */
  catalogue: GrantTargets;
  /** Every agent reachable as a tool from this one, by id. */
  agents: ReachableAgent[];
  /** The project's folder, which is where a command runs. */
  directory: string;
}
