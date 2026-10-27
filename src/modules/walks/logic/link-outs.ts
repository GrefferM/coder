import { leadsBack } from "./leads-back";
import type { Agent, ProjectConfig, ChatStopReason, LinkOut, RouteChoice } from "../../../contracts";

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

/**
 * The lines out as the answering agent chose them: where it ended the branch none is taken, where it named agents only
 * theirs are. A line that could not be taken for its own reason keeps that reason; an agent that chose nothing takes all.
 */
export function routedOuts(outs: LinkOut[], route: RouteChoice | null): LinkOut[] {
  // A choice that names nobody and ends nothing chooses nothing.
  if (route === null || (!route.isFinished && route.toAgentIds.length === 0)) {
    return outs;
  }

  return outs.map((out) => {
    if (out.stopReason !== null) {
      return out;
    }

    if (route.isFinished) {
      return {
        ...out,
        stopReason: "finished",
      };
    }

    return route.toAgentIds.includes(out.to.id)
      ? out
      : {
          ...out,
          stopReason: "notChosen",
        };
  });
}
