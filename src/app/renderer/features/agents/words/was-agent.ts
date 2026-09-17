import { grantedToolsLabel } from "./granted-tools-label";
import { isCommandGrant, isServerGrant } from "../../../interfaces";
import { writtenNumber } from "./written-number";
import {
  AGENT_ACTIVE_OFF_LABEL,
  AGENT_ACTIVE_ON_LABEL,
  AGENT_NO_PROMPT_LABEL,
  AGENT_TEMPERATURE_PLACES,
} from "../constants";
import type { ToolGrant } from "../../../interfaces";
import type { AgentDraft, AgentNaming, WasAgent } from "../interfaces";

/**
 * What every field of the agent was before the draft changed it, each in the words its own field shows —
 * a model and a prompt by their names, the numbers as they are written, the switch as its own word. A field standing
 * as it was saved says nothing, and nothing is said at all about an agent that has never been saved.
 */
export function wasAgent(draft: AgentDraft, saved: AgentDraft | null, naming: AgentNaming): WasAgent {
  const { models, prompts, commands, servers } = naming;

  if (saved === null) {
    return {
      name: null,
      model: null,
      prompt: null,
      commandTools: null,
      serverTools: null,
      color: null,
      maxCalls: null,
      temperature: null,
      isActive: null,
    };
  }

  const modelTitle = (modelId: string) => models.find((model) => model.id === modelId)?.title ?? modelId;
  const promptTitle = (id: string | null) => prompts.find((prompt) => prompt.id === id)?.name ?? AGENT_NO_PROMPT_LABEL;
  /** Each field is compared with its own kind of grant alone, and says what stood in that field. */
  const saidOf = (grants: ToolGrant[], isOfKind: (grant: ToolGrant) => boolean) =>
    grantedToolsLabel(grants.filter(isOfKind), commands, servers);
  const savedCommands = saidOf(saved.tools, isCommandGrant);
  const savedServers = saidOf(saved.tools, isServerGrant);

  return {
    name: saved.name === draft.name ? null : saved.name,
    model: saved.modelId === draft.modelId ? null : modelTitle(saved.modelId),
    prompt: saved.promptId === draft.promptId ? null : promptTitle(saved.promptId),
    // The tools are compared by what they are called: two grants of one function read the same and changed nothing.
    commandTools: savedCommands === saidOf(draft.tools, isCommandGrant) ? null : savedCommands,
    serverTools: savedServers === saidOf(draft.tools, isServerGrant) ? null : savedServers,
    color: saved.color === draft.color ? null : saved.color,
    maxCalls: saved.maxCalls === draft.maxCalls ? null : writtenNumber(saved.maxCalls),
    temperature:
      saved.temperature === draft.temperature ? null : writtenNumber(saved.temperature, AGENT_TEMPERATURE_PLACES),
    isActive:
      saved.isActive === draft.isActive ? null : saved.isActive ? AGENT_ACTIVE_ON_LABEL : AGENT_ACTIVE_OFF_LABEL,
  };
}
