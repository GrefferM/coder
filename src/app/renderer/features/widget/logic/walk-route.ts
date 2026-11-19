import type { Agent, Link } from "../../../interfaces";
import type { WalkKnot } from "../../projection";

/**
 * The way a walk can go from a sphere, as the projection lays a pass out: every switched-on agent the canvas lines
 * reach from it, one knot each by the agent's id, in an order where an agent stands after all that hand work to it.
 */
export function walkRoute(agents: Agent[], links: Link[], sphereId: string): WalkKnot[] {
  const walked = new Set(agents.filter((agent) => agent.isActive).map((agent) => agent.id));
  const reached = reachedFrom(sphereId, links, walked);
  const feeds = links.filter((link) => reached.includes(link.from) && reached.includes(link.to));
  const ordered: string[] = [];

  // A knot is placed once every knot feeding it is; the canvas refuses rings, so each pass places at least one.
  while (ordered.length < reached.length) {
    const next = reached.find(
      (id) =>
        !ordered.includes(id) && feeds.filter((link) => link.to === id).every((link) => ordered.includes(link.from)),
    );

    if (next === undefined) {
      break;
    }

    ordered.push(next);
  }

  return ordered.map((id, place) => ({
    id,
    place,
    fromStepIds: feeds.filter((link) => link.to === id).map((link) => link.from),
  }));
}

/** The agents reached from one along the lines, itself first, in the order found; a switched-off one is not walked. */
function reachedFrom(sphereId: string, links: Link[], walked: Set<string>): string[] {
  const reached = [sphereId];

  for (const from of reached) {
    links
      .filter((link) => link.from === from && walked.has(link.to) && !reached.includes(link.to))
      .forEach((link) => reached.push(link.to));
  }

  return reached;
}
