import type { RouteChoice } from "./route-choice.interface";
import type { ToolMemory } from "./tool-memory.interface";
import type { ChatCost } from "../walks/chat-cost.interface";
import type { TurnCall } from "../runs";

export interface SaidTurn {
  text: string;
  isStopped: boolean;
  isCallsExhausted: boolean;
  isCeilingHit: boolean;
  inputTokens: number;
  outputTokens: number;
  /** Every call the turn made, in the order it made them. */
  calls: TurnCall[];
  /** What the agents it called as tools cost, their own turns and the agents they called in turn; their compressions are in `memories`. */
  called: ChatCost | null;
  /** Every compression the agents it called as tools made for their memories, and what each cost. */
  memories: ToolMemory[];
  /** Where the agent chose to send its answer; null where it chose nothing, and the answer goes down every line. */
  route: RouteChoice | null;
}
