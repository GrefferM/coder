import type { Agent, ProjectModel, TurnCall, TurnHandoff } from "../../../interfaces";
import type { ChatCost } from "./chat-cost.interface";
import type { IncomingWork } from "./incoming-work.interface";

/** One finished turn as the record takes it: what it ran with, what it said, where it went. */
export interface WrittenTurn {
  agent: Agent;
  model: ProjectModel | null;
  prompt: string;
  asked: string;
  /** Characters of memory the turn carried ahead of what it was asked. */
  memoryLength: number;
  said: string;
  state: string;
  cost: ChatCost | null;
  incoming: IncomingWork[];
  handoffs: TurnHandoff[];
  startedAt: number;
  endedAt: number;
  calls: TurnCall[];
}
