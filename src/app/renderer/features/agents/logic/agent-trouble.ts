import { agentNumbers, modelNumbers } from "../../../logic";
import { notFilledLabel } from "../../../words";
import {
  TROUBLE_LOST_FUNCTION_LABEL,
  TROUBLE_LOST_PROMPT_LABEL,
  TROUBLE_NO_ADDRESS_LABEL,
  TROUBLE_NO_KEY_LABEL,
  TROUBLE_NO_MODEL_LABEL,
  TROUBLE_NO_PROMPT_LABEL,
  TROUBLE_NO_PROVIDER_LABEL,
  TROUBLE_PROVIDER_OFF_LABEL,
} from "../constants";
import { hasBrokenGrant, modelStands } from "../../../logic";
import type { Agent, AgentTrouble, McpLook, ProjectConfig, ProviderState } from "../../../interfaces";

/**
 * An agent's trouble mark, read off the project; a break outranks a fact, and one word stands. What a server offers is
 * not in the project, so it is passed in.
 */
export function agentTrouble(
  agent: Agent,
  config: ProjectConfig,
  providers: ProviderState[],
  looks: Record<string, McpLook> = {},
): AgentTrouble | null {
  const { model, provider } = modelStands(agent.modelId, config.models, providers);

  if (model === null) {
    return broken(TROUBLE_NO_MODEL_LABEL);
  }

  if (provider === null) {
    return broken(TROUBLE_NO_PROVIDER_LABEL);
  }

  // Off on this machine outranks whatever else the provider lacks.
  if (provider.isOff) {
    return broken(TROUBLE_PROVIDER_OFF_LABEL);
  }

  if (provider.needs.includes("key") && provider.keyHint === null) {
    return broken(TROUBLE_NO_KEY_LABEL);
  }

  // A local provider falls back to its customary address, so only one needing its own address breaks.
  if (provider.needs.includes("address") && provider.address === null && provider.customaryAddress === null) {
    return broken(TROUBLE_NO_ADDRESS_LABEL);
  }

  // One word for a grant pointing at nothing: undeclared command, removed server function, gone server, or agent no
  // longer in the project.
  if (
    hasBrokenGrant(agent.tools, {
      commands: config.commands,
      servers: config.servers,
      looks,
      agents: config.agents,
    })
  ) {
    return broken(TROUBLE_LOST_FUNCTION_LABEL);
  }

  // A named prompt the project no longer holds is a break, not «no prompt».
  if (agent.promptId !== null && !config.prompts.some((standing) => standing.id === agent.promptId)) {
    return broken(TROUBLE_LOST_PROMPT_LABEL);
  }

  const notFilled = notFilledLabel([...agentNumbers(agent), ...modelNumbers(model)]);

  // A number missing from the agent or its model breaks it; the mark names the field.
  if (notFilled !== null) {
    return broken(notFilled);
  }

  if (agent.promptId === null) {
    return {
      label: TROUBLE_NO_PROMPT_LABEL,
      isBreak: false,
    };
  }

  return null;
}

function broken(label: string): AgentTrouble {
  return {
    label,
    isBreak: true,
  };
}
