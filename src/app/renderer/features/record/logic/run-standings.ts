import type { NamedAgent } from "../../../interfaces";
import type { AgentStanding, WholeRun } from "../interfaces";

/**
 * Every agent this run walked with, held against the project as it stands now. This is the one place that
 * decides what a run's agent is called: today's name and colour win, the record's stand for an agent that is gone,
 * and what the record kept is carried along rather than overwritten. Prices, models and prompts are never touched
 * here — those the step keeps, and they are what «тоді проти сьогодні» is made of.
 */
export function runStandings(run: WholeRun | null, today: NamedAgent[]): AgentStanding[] {
  if (run === null) {
    return [];
  }

  const standings = new Map<string, AgentStanding>();
  const stand = (wrote: NamedAgent) => {
    if (standings.has(wrote.id)) {
      return;
    }

    const now = today.find((agent) => agent.id === wrote.id) ?? null;

    standings.set(wrote.id, {
      id: wrote.id,
      name: now?.name ?? wrote.name,
      color: now?.color ?? wrote.color,
      wasName: now === null || now.name === wrote.name ? null : wrote.name,
      isGone: now === null,
    });
  };

  stand({
    id: run.startedByAgentId,
    name: run.startedByAgentName,
    color: run.startedByAgentColor,
  });

  for (const step of run.walk) {
    stand({
      id: step.agentId,
      name: step.agentName,
      color: step.agentColor,
    });
  }

  return [...standings.values()];
}
