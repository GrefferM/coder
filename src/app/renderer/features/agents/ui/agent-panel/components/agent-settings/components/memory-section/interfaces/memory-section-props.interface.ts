import type { AgentMemory } from "../../../../../../../../../interfaces";

export interface MemorySectionProps {
  memory: AgentMemory;
  /** What the memory was before the draft changed it. */
  wasValue: string | null;
  onMemoryChange: (memory: AgentMemory) => void;
}
