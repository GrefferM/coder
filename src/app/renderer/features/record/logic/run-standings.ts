import type { NamedAgent } from "../../../interfaces";
import type { AgentStanding, WholeRun } from "../interfaces";

/**
 * Every agent this run walked with, held against the project now; the one place deciding an agent's on-screen name:
 * today's name and colour win, the record's stand for a gone agent. Prices, models and prompts are not touched.
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
