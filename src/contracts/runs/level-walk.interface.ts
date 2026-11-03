import type { LevelNode } from "./level-node.interface";

/** What one pass of the level rule carries: the turns by their `at`, the levels answered, the turns being walked. */
export interface LevelWalk {
  stood: Map<string | null, LevelNode>;
  levels: Record<string, number>;
  over: Set<string>;
}
