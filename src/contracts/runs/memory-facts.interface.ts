/**
 * One compression of an agent's memory, as the record holds it: the composer's message that stands for everything the
 * memory had up to a place in the run. No step is deleted; the message is read in place of those steps.
 */
export interface MemoryFacts {
  agentId: string;
  /** The question a shared memory belongs to; null for the agent's own thread in the conversation. */
  questionId: string | null;
  /** The place of the last step the message stands for; the steps after it are read as they stand. */
  coversPlace: number;
  /** The composer's words, the one message the model is given in their place. */
  text: string;
  /** Characters of memory before the composer read it, and of what it wrote. */
  lengthBefore: number;
  lengthAfter: number;
  /**
   * The agent's own threshold and target then, in percent of the model's ceiling. A fact of the step like its price: what
   * the agent was set to when it compressed, not what it is set to now.
   */
  compressAt: number;
  compressTo: number;
  /** What the composer's call used; the step that paid for it counts it too. */
  inputTokens: number;
  outputTokens: number;
  /** What it cost at the model's prices then; `null` where they are unknown. */
  money: number | null;
}
