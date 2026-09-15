import type { AgentChange } from "../interfaces";
import type { AgentStanding, WholeRun } from "../../record";
import type { Agent, ProjectModel } from "../../../interfaces";

/**
 * What has changed about this run's agents since it walked. An agent stands here when anything of it is
 * different — its name, the model it ran on, the temperature it ran at — or when the project no longer has it. Where
 * nothing differs there is nothing to hold against anything, and the card says nothing at all.
 *
 * An agent that walked more than once in this pass is read off its first turn: the record keeps every turn's own
 * circumstances, so two turns of one agent can differ, and the card is about the agent rather than about a turn.
 */
export function runChanges(
  run: WholeRun | null,
  standings: AgentStanding[],
  agents: Agent[],
  models: ProjectModel[],
): AgentChange[] {
  if (run === null) {
    return [];
  }

  return standings.flatMap((standing) => {
    const walked = run.walk.find((step) => step.agentId === standing.id) ?? null;

    if (walked === null) {
      return [];
    }

    const now = agents.find((agent) => agent.id === standing.id) ?? null;
    const nowModel = now === null ? null : (models.find((model) => model.id === now.modelId)?.title ?? null);
    const change: AgentChange = {
      id: standing.id,
      name: standing.name,
      isGone: standing.isGone,
      wasModel: walked.model,
      wasTemperature: walked.temperature,
      nowModel,
      nowTemperature: now?.temperature ?? null,
    };
    const stands =
      standing.isGone ||
      standing.wasName !== null ||
      change.wasModel !== change.nowModel ||
      change.wasTemperature !== change.nowTemperature;

    return stands ? [change] : [];
  });
}
