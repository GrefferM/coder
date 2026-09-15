import { runStandings } from "./run-standings";
import type { NamedAgent } from "../../../interfaces";
import type { WholeRun } from "../interfaces";

/**
 * A run wearing the names and colours its agents go by now. The rule is `runStandings`' own, so the
 * projection and the conversation read the same run the same way. Everything else a step froze is left where it is:
 * the model, the prompt, the numbers and the prices are what the turn ran on, and they are the whole point of holding
 * «then» against «today».
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
