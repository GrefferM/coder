import { agentNumbers, modelNumbers } from "../../../logic";
import { notFilledLabel } from "../../../words";
import {
  TROUBLE_LOST_FUNCTION_LABEL,
  TROUBLE_LOST_PROMPT_LABEL,
  TROUBLE_NO_KEY_LABEL,
  TROUBLE_NO_MODEL_LABEL,
  TROUBLE_NO_PROMPT_LABEL,
  TROUBLE_NO_PROVIDER_LABEL,
} from "../constants";
import { hasBrokenGrant } from "../../../logic";
import type { Agent, AgentTrouble, McpLook, ProjectConfig, ProviderState } from "../../../interfaces";

/**
 * An agent's trouble mark, read off the project alone; a break comes before a fact, and one word stands.
 *
 * What a server hands over is not in the project and cannot be read off it, so it is passed in. A project
 * with no servers has none of it, and that is the default.
 */
export function agentTrouble(
  agent: Agent,
  config: ProjectConfig,
  providers: ProviderState[],
  looks: Record<string, McpLook> = {},
): AgentTrouble | null {
  const model = config.models.find((standing) => standing.id === agent.modelId) ?? null;

  if (model === null) {
    return broken(TROUBLE_NO_MODEL_LABEL);
  }

  const provider = providers.find((standing) => standing.id === model.provider) ?? null;

  if (provider === null) {
    return broken(TROUBLE_NO_PROVIDER_LABEL);
  }

  if (provider.kind === "remote" && provider.keyHint === null) {
    return broken(TROUBLE_NO_KEY_LABEL);
  }

  // One word for every way a grant can point at nothing: a command undeclared, a function the server took
  // away, or the server itself gone.
  if (hasBrokenGrant(agent.tools, config.commands, config.servers, looks)) {
    return broken(TROUBLE_LOST_FUNCTION_LABEL);
  }

  // A prompt the agent names and the project no longer holds is a break, not «no prompt at all».
  if (agent.promptId !== null && !config.prompts.some((standing) => standing.id === agent.promptId)) {
    return broken(TROUBLE_LOST_PROMPT_LABEL);
  }

  const notFilled = notFilledLabel([...agentNumbers(agent), ...modelNumbers(model)]);

  // A number missing from the agent or its model breaks it, and the mark names the field.
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
