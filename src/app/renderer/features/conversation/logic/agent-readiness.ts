import { agentNumbers, hasBrokenGrant, isAgentFilled, isModelFilled } from "../../../logic";
import { lostFunctionNote, lostPromptNote, noToolsNote, notFilledAgentNote, notStartedNote } from "../words";
import { unfilledField } from "../../../words";
import { NO_MODEL_NOTE } from "../constants";
import type { AgentReady, AgentStands, AgentWall } from "../interfaces";
import type { Agent, GrantTargets } from "../../../interfaces";

/**
 * The first wall an agent meets before its turn is asked, or the agent and its model with every number filled in.
 * A person's turn and a sub-agent asked as a tool are both read by this one rule. The question over the model's
 * ceiling is not here: only a packed turn can measure it.
 */
export function agentReadiness(agent: Agent, stands: AgentStands, targets: GrantTargets): AgentWall | AgentReady {
  const { model, provider, prompt } = stands;

  // A grant that points at nothing would hand the model a tool that is not there.
  if (hasBrokenGrant(agent.tools, targets)) {
    return {
      note: lostFunctionNote(agent.name),
      reason: "lostFunction",
    };
  }

  // A provider whose protocol carries no function calls cannot be asked with an agent that holds grants.
  if (agent.tools.length > 0 && provider !== null && !provider.takesTools) {
    return {
      note: noToolsNote(provider.name, agent.name),
      reason: "noTools",
    };
  }

  // A prompt the agent names and the project has lost is a broken tie.
  if (agent.promptId !== null && prompt === null) {
    return {
      note: lostPromptNote(agent.name),
      reason: "lostPrompt",
    };
  }

  if (!isAgentFilled(agent)) {
    return {
      note: notFilledAgentNote(agent.name, unfilledField(agentNumbers(agent)) ?? ""),
      reason: "notFilledAgent",
    };
  }

  if (model === null) {
    return {
      note: NO_MODEL_NOTE,
      reason: "noModel",
    };
  }

  // The prices are among a model's numbers, so a turn whose bill nobody could count is not sent.
  if (!isModelFilled(model)) {
    return {
      note: notStartedNote("notFilled", model, provider),
      reason: "notFilled",
    };
  }

  return {
    agent,
    model,
  };
}
