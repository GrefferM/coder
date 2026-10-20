import type { ChatTurn } from "../llm";

/**
 * What goes to the model ahead of the turn's own words; an agent's memory fills the thread or the shared memory, or
 * neither. Where the memory was compressed, the composer's message stands in front of what came after it.
 */
export interface TurnMemory {
  /** The agent's own pairs in this conversation, after the last compression. */
  thread: ChatTurn[];
  /** The composer's message, told as it opens the turn; empty where the thread was never compressed. */
  composed: string;
  /** What has happened to the question so far, as the record tells it, a compression told in its place; it opens the turn's own words. */
  shared: string;
  /** The place of the last step of the record this memory stands for or tells; zero while it has none. */
  covers: number;
}
