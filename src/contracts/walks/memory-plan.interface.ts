/**
 * What a turn does about its memory before it is asked: goes as it stands, has the memory compressed first, or does not
 * go at all.
 */
export type MemoryPlan =
  | {
      kind: "go";
    }
  | {
      kind: "compress";
      /** The most characters the compressed memory may take: the target's share of the ceiling. */
      budget: number;
      /** The agent's threshold and target, in percent, which the compression is made under. */
      at: number;
      to: number;
    }
  | {
      kind: "wall";
      /** What is held back for the memory; zero where the agent keeps none. */
      reserve: number;
      /** What the words and the reserve together must stay under: the threshold, or the ceiling where nothing is held back. */
      limit: number;
    };
