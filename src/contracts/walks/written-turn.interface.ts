import type { Agent, ProjectModel } from "../project";
import type { TurnCall, TurnHandoff } from "../runs";
import type { ChatCost } from "./chat-cost.interface";
import type { IncomingWork } from "./incoming-work.interface";
import type { MemoryFacts } from "../runs";

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
  /** The compressions this turn paid for before it went: its own memory's and its tools'; empty where none was made. */
  memories: MemoryFacts[];
}
