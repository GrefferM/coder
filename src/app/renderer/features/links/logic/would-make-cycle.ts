import type { Link } from "../../../interfaces";

/** Whether `from → to` would close a ring; a self-link is the shortest ring. */
export function wouldMakeCycle(links: Link[], fromAgentId: string, toAgentId: string): boolean {
  if (fromAgentId === toAgentId) {
    return true;
  }

  const seen = new Set<string>();
  const ahead = [toAgentId];

  while (ahead.length > 0) {
    const standing = <string>ahead.pop();

    if (standing === fromAgentId) {
      return true;
    }

    if (seen.has(standing)) {
      continue;
    }

    seen.add(standing);
    ahead.push(...links.filter((link) => link.from === standing).map((link) => link.to));
  }

  return false;
}
