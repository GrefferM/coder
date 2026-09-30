import { runStandings } from "./run-standings";
import type { NamedAgent } from "../../../interfaces";
import type { WholeRun } from "../interfaces";

/**
 * A run wearing the names and colours its agents have now, by `runStandings`' rule. Everything a step froze (model,
 * prompt, numbers, prices) is left as is.
 */
export function runNamedToday(run: WholeRun, today: NamedAgent[]): WholeRun {
  const standings = runStandings(run, today);
  const standingOf = (agentId: string) => standings.find((standing) => standing.id === agentId) ?? null;
  const started = standingOf(run.startedByAgentId);

  return {
    ...run,
    startedByAgentName: started?.name ?? run.startedByAgentName,
    startedByAgentColor: started?.color ?? run.startedByAgentColor,
    walk: run.walk.map((step) => {
      const walked = standingOf(step.agentId);

      return {
        ...step,
        agentName: walked?.name ?? step.agentName,
        agentColor: walked?.color ?? step.agentColor,
      };
    }),
  };
}
