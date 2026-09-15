import { runStandings } from "./run-standings";
import type { NamedAgent } from "../../../interfaces";
import type { WholeRun } from "../interfaces";

/**
 * Who the agents of an opened run are called on screen. Today's name and colour win — an agent renamed or
 * recoloured since reads as it is now, not as it was. The record's copy stands for one alone: an agent the project no
 * longer has, whose conversation would otherwise lose its name. Prices are never taken from here; those the step keeps.
 *
 * What the standing knows besides — the record's own name, and that the agent is gone — stays with the projection,
 * which has a word for it. The chat is handed a name and a colour and nothing more.
 */
export function runAgents(run: WholeRun | null, today: NamedAgent[]): NamedAgent[] {
  const gone = runStandings(run, today)
    .filter((standing) => standing.isGone)
    .map(({ id, name, color }) => ({
      id,
      name,
      color,
    }));

  return [...today, ...gone];
}
