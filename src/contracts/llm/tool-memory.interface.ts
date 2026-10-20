import type { MemoryFacts } from "../runs";
import type { ChatCost } from "../walks/chat-cost.interface";

/**
 * A compression an agent called as a tool made of its memory on the way to a call under its caller's turn. Its cost is
 * the caller's step's to carry; its facts are the record's only where the memory is the question's, which every agent
 * of the question reads, and nothing where the memory lived for the one turn.
 */
export interface ToolMemory {
  /** What the composer's call cost at the tool's model's prices; null where the provider counted no tokens. */
  cost: ChatCost | null;
  facts: MemoryFacts | null;
}
