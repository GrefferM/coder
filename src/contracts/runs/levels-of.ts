import type { LevelNode } from "./level-node.interface";

/**
 * The step of the walk each turn stands on: unfed turns on the first, others below the deepest that fed them,
 * simultaneous turns on the same step. Shared by the stream, the projection and the record's search.
 */
export function levelsOf(nodes: LevelNode[]): Record<string, number> {
  const stood = new Map(nodes.filter((node) => node.at !== null).map((node) => [node.at, node]));
  const levels: Record<string, number> = {};

  function levelOf(node: LevelNode, over: Set<string>): number {
    if (levels[node.id] !== undefined) {
      return levels[node.id];
    }

    // A walk holding a way back to itself is not walked twice.
    over.add(node.id);

    const fed = node.fedBy
      .map((at) => stood.get(at))
      .filter((one): one is LevelNode => one !== undefined && !over.has(one.id))
      .map((one) => levelOf(one, over));

    over.delete(node.id);
    levels[node.id] = fed.length === 0 ? 1 : Math.max(...fed) + 1;

    return levels[node.id];
  }

  for (const node of nodes) {
    levelOf(node, new Set());
  }

  return levels;
}
