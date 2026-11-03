import type { MemoryFacts } from "../runs";
import type { ChatCost } from "../walks/chat-cost.interface";

/**
 * A compression of a tool agent's memory made under its caller's turn. The caller's step pays for it; `facts` is set
 * only for the question's shared memory, which the record keeps.
 */
export interface ToolMemory {
  /** What the composer's call cost at the tool's model's prices; null where the provider counted no tokens. */
  cost: ChatCost | null;
  facts: MemoryFacts | null;
}
