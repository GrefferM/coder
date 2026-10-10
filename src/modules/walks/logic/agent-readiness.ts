import { lostFunctionNote, lostPromptNote, noToolsNote, notFilledAgentNote, notStartedNote } from "../words";
import {
  NO_MODEL_NOTE,
  agentNumbers,
  hasBrokenGrant,
  isAgentFilled,
  isModelFilled,
  unfilledField,
} from "../../../contracts";
import type { Agent, AgentReady, AgentStands, AgentWall, GrantTargets } from "../../../contracts";

/**
 * The first wall an agent meets before its turn is asked, or the agent with its model fully filled in; a person's turn
 * and a sub-agent asked as a tool follow the same rule. The model's ceiling is not checked here.
 */
export function agentReadiness(agent: Agent, stands: AgentStands, targets: GrantTargets): AgentWall | AgentReady {
  const { model, provider, prompt } = stands;

  // A grant pointing at nothing would hand the model a missing tool.
  if (hasBrokenGrant(agent.tools, targets)) {
    return {
      note: lostFunctionNote(agent.name),
      reason: "lostFunction",
    };
  }

  // A provider without function calls cannot serve an agent that holds grants.
  if (agent.tools.length > 0 && provider !== null && !provider.takesTools) {
    return {
      note: noToolsNote(provider.name, agent.name),
      reason: "noTools",
    };
  }

  // The agent names a prompt the project no longer has.
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

  // Without the prices the turn's bill cannot be counted.
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
