import type { ToolMemory } from "../../../contracts/llm";
import type { ChatCost } from "../../../contracts/walks/chat-cost.interface";

/**
 * A sub-agent's turn; when it could not run to an answer, `isFailed` and `text` says why. What it cost, with the agents
 * it called in turn, and the compressions of memory made for it on the way are spent either way, and go up with it.
 */
export interface AgentTurnOutcome {
  text: string;
  isFailed: boolean;
  /** What its own turn and the agents it called cost at their models' prices; their compressions are not in it. */
  cost: ChatCost | null;
  memories: ToolMemory[];
}
