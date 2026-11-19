import type { Link } from "../../../interfaces";

/** How many agents work after this one along the canvas lines (52a «→ N»); each is counted once. */
export function onwardCount(agentId: string, links: Link[]): number {
  const reached = new Set<string>();
  const waiting = [agentId];

  while (waiting.length > 0) {
    const from = waiting.pop();

    links
      .filter((link) => link.from === from && !reached.has(link.to) && link.to !== agentId)
      .forEach((link) => {
        reached.add(link.to);
        waiting.push(link.to);
      });
  }

  return reached.size;
}
