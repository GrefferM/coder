import { runStandings } from "./run-standings";
import type { NamedAgent } from "../../../interfaces";
import type { WholeRun } from "../interfaces";

/**
 * The agents of an opened run as named on screen: today's name and colour win; the record's copy stands only for an
 * agent the project no longer has. The chat gets a name and a colour only; prices are not taken from here.
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
