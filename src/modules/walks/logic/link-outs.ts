import { leadsBack } from "./leads-back";
import { isRouteDecided } from "../../../contracts";
import type { Agent, ProjectConfig, ChatStopReason, HandedLine, LinkOut, RouteChoice } from "../../../contracts";

/** Whether a neighbour can take work, and the word when it cannot; switched off is the one word. */
export function cannotTake(to: Agent): ChatStopReason | null {
  return to.isActive ? null : "off";
}

/**
 * Every link out of one turn: whom it leads to, and the word for a neighbour that cannot take the work.
 *
 * A run ends at a link it cannot take: a switched-off agent is neither skipped nor waited for. A link to an agent the
 * project does not hold, or back to where the work came from, is no link out.
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
 * The lines out as the answering agent handed them on. An agent that called no command hands its answer down every
 * line. One that called `pass_to` hands each agent it named what it passed it, and nothing down the others; one that
 * only ended the branch hands nothing anywhere. A line that could not be taken for its own reason keeps that reason.
 */
export function routedOuts(outs: LinkOut[], route: RouteChoice | null, said: string): HandedLine[] {
  return outs.map((out) => routedOut(out, route, said));
}

/** One line as the turn hands it on. */
function routedOut(out: LinkOut, route: RouteChoice | null, said: string): HandedLine {
  if (route === null || !isRouteDecided(route)) {
    return {
      ...out,
      text: said,
    };
  }

  const pass = route.passes.find((one) => one.agentId === out.to.id) ?? null;

  if (pass !== null) {
    return {
      ...out,
      text: pass.text,
    };
  }

  return {
    ...out,
    stopReason: out.stopReason ?? (route.passes.length > 0 ? "notChosen" : "finished"),
    text: "",
  };
}
