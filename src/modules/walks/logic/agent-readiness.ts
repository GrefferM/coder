import {
  lostFunctionNote,
  lostPromptNote,
  noConsentNote,
  noToolsNote,
  notFilledAgentNote,
  notStartedNote,
} from "../words";
import {
  NO_MODEL_NOTE,
  agentNumbers,
  hasBrokenGrant,
  isAgentFilled,
  isModelFilled,
  unfilledField,
  waitingConsent,
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
      waitsFor: null,
    };
  }

  const waiting = waitingConsent(agent.tools, targets);

  // A granted local server whose run line this machine has not agreed to is not started, so neither is the turn (36k).
  if (waiting !== null) {
    return {
      note: noConsentNote(waiting.name),
      reason: "noConsent",
      waitsFor: waiting.id,
    };
  }

  // A provider without function calls cannot serve an agent that holds grants.
  if (agent.tools.length > 0 && provider !== null && !provider.takesTools) {
    return {
      note: noToolsNote(provider.name, agent.name),
      reason: "noTools",
      waitsFor: null,
    };
  }

  // The agent names a prompt the project no longer has.
  if (agent.promptId !== null && prompt === null) {
    return {
      note: lostPromptNote(agent.name),
      reason: "lostPrompt",
      waitsFor: null,
    };
  }

  if (!isAgentFilled(agent)) {
    return {
      note: notFilledAgentNote(agent.name, unfilledField(agentNumbers(agent)) ?? ""),
      reason: "notFilledAgent",
      waitsFor: null,
    };
  }

  if (model === null) {
    return {
      note: NO_MODEL_NOTE,
      reason: "noModel",
      waitsFor: null,
    };
  }

  // Without its prices and ceilings a turn can be neither bounded nor billed.
  if (!isModelFilled(model)) {
    return {
      note: notStartedNote("notFilled", model, provider),
      reason: "notFilled",
      waitsFor: null,
    };
  }

  return {
    agent,
    model,
  };
}
