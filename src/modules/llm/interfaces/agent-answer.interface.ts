import type { RouteChoice, ToolMemory } from "../../../contracts/llm";
import type { ChatCost } from "../../../contracts/walks/chat-cost.interface";
import type { TurnCall } from "../../../contracts/runs";

/** One turn's answer; a stop is an answer too, and counts are 0 when the provider gave none. */
export interface AgentAnswer {
  text: string;
  isStopped: boolean;
  isCallsExhausted: boolean;
  /** The answer reached its ceiling, so it is cut mid-word. */
  isCeilingHit: boolean;
  inputTokens: number;
  outputTokens: number;
  calls: TurnCall[];
  /** What the agents it called cost, their own turns and the agents they called in turn; their compressions are in `memories`. */
  called: ChatCost | null;
  /** Every compression the agents it called made of their memories, and what each cost. */
  memories: ToolMemory[];
  /** Where the agent chose to send its answer; null where it chose nothing, and the answer goes down every line. */
  route: RouteChoice | null;
}
