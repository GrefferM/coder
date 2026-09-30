import type { AgentChange } from "../interfaces";
import type { AgentStanding, WholeRun } from "../../record";
import type { Agent, ProjectModel } from "../../../interfaces";

/**
 * What changed about a run's agents since it walked: an agent is listed when its name, model or temperature differs, or
 * the project no longer has it. An agent that walked more than once is read off its first turn.
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
