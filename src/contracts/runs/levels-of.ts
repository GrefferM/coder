import type { LevelNode } from "./level-node.interface";

/**
 * Which step of the walk each turn stands on: a turn nobody fed on the first, every other one below the deepest
 * that fed it, turns that ran at once on the same step.
 *
 * The rule is one, and three places ask it — the stream counts it over its own cards, the projection over the
 * steps of a run, and the record's search over the steps of many runs at once. Two of those are in the window and
 * one is behind the bridge, which is why the rule stands here: counted apart it could be corrected once, and then
 * a turn would stand on one step in the stream and another in the search, about the same walk.
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
