import { leadsBack } from "./leads-back";
import type { Agent, ProjectConfig, ChatStopReason, LinkOut } from "../../../contracts";

/** Whether a neighbour can take work, and the word when it cannot; switched off is the one word. */
export function cannotTake(to: Agent): ChatStopReason | null {
  return to.isActive ? null : "off";
}

/**
 * Every link out of one turn: whom it leads to, and the word for a neighbour that cannot take the work.
 *
 * A run ends at a link it cannot take: a switched-off agent is neither skipped nor waited for. A link to an agent the
 * project no longer holds, or back to where the work came from, is no link out.
 */
export function linkOuts(config: ProjectConfig, from: Agent): LinkOut[] {
  return config.links
    .filter((link) => link.from === from.id)
    .flatMap((link) => {
      const to = config.agents.find((standing) => standing.id === link.to) ?? null;

      // A line leading back into the walk's own path is no link out; the last wall against a ring.
      return to === null || leadsBack(config, from.id, to.id)
        ? []
        : [
            {
              linkId: link.id,
              to,
              stopReason: cannotTake(to),
            },
          ];
    });
}
