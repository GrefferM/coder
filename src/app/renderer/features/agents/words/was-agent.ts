import { grantedToolsLabel } from "./granted-tools-label";
import { isAgentGrant, isCommandGrant, isServerGrant } from "../../../interfaces";
import { writtenNumber, writtenPercent } from "./written-number";
import {
  AGENT_ACTIVE_OFF_LABEL,
  AGENT_ACTIVE_ON_LABEL,
  AGENT_WAIT_OFF_LABEL,
  AGENT_WAIT_ON_LABEL,
  AGENT_ROUTE_OFF_LABEL,
  AGENT_ROUTE_ON_LABEL,
  AGENT_MEMORY_WORDS,
  AGENT_NO_PROMPT_LABEL,
  AGENT_TEMPERATURE_PLACES,
} from "../constants";
import type { ToolGrant } from "../../../interfaces";
import type { AgentDraft, AgentNaming, WasAgent } from "../interfaces";

/**
 * What every field was before the draft changed it, worded as its field shows: model and prompt by name, numbers as
 * written, the switch as its own word. Unchanged fields, and every field of a never-saved agent, say nothing.
 */
export function wasAgent(draft: AgentDraft, saved: AgentDraft | null, naming: AgentNaming): WasAgent {
  const { models, prompts } = naming;

  if (saved === null) {
    return {
      name: null,
      purpose: null,
      model: null,
      prompt: null,
      commandTools: null,
      serverTools: null,
      agentTools: null,
      color: null,
      compressAt: null,
      compressTo: null,
      maxCalls: null,
      temperature: null,
      isActive: null,
      waitsForAll: null,
      choosesRoute: null,
      memory: null,
    };
  }

  const modelTitle = (modelId: string) => models.find((model) => model.id === modelId)?.title ?? modelId;
  const promptTitle = (id: string | null) => prompts.find((prompt) => prompt.id === id)?.name ?? AGENT_NO_PROMPT_LABEL;
  /** Each field is compared with its own kind of grant only. */
  const saidOf = (grants: ToolGrant[], isOfKind: (grant: ToolGrant) => boolean) =>
    grantedToolsLabel(grants.filter(isOfKind), naming);
  const savedCommands = saidOf(saved.tools, isCommandGrant);
  const savedServers = saidOf(saved.tools, isServerGrant);
  const savedAgents = saidOf(saved.tools, isAgentGrant);

  return {
    name: saved.name === draft.name ? null : saved.name,
    purpose: saved.purpose === draft.purpose ? null : (saved.purpose ?? ""),
    model: saved.modelId === draft.modelId ? null : modelTitle(saved.modelId),
    prompt: saved.promptId === draft.promptId ? null : promptTitle(saved.promptId),
    // Tools are compared by name: two grants of one function read the same.
    commandTools: savedCommands === saidOf(draft.tools, isCommandGrant) ? null : savedCommands,
    serverTools: savedServers === saidOf(draft.tools, isServerGrant) ? null : savedServers,
    agentTools: savedAgents === saidOf(draft.tools, isAgentGrant) ? null : savedAgents,
    color: saved.color === draft.color ? null : saved.color,
    compressAt: saved.compressAt === draft.compressAt ? null : writtenPercent(saved.compressAt),
    compressTo: saved.compressTo === draft.compressTo ? null : writtenPercent(saved.compressTo),
    maxCalls: saved.maxCalls === draft.maxCalls ? null : writtenNumber(saved.maxCalls),
    temperature:
      saved.temperature === draft.temperature ? null : writtenNumber(saved.temperature, AGENT_TEMPERATURE_PLACES),
    isActive:
      saved.isActive === draft.isActive ? null : saved.isActive ? AGENT_ACTIVE_ON_LABEL : AGENT_ACTIVE_OFF_LABEL,
    waitsForAll:
      saved.waitsForAll === draft.waitsForAll ? null : saved.waitsForAll ? AGENT_WAIT_ON_LABEL : AGENT_WAIT_OFF_LABEL,
    choosesRoute:
      saved.choosesRoute === draft.choosesRoute
        ? null
        : saved.choosesRoute
          ? AGENT_ROUTE_ON_LABEL
          : AGENT_ROUTE_OFF_LABEL,
    memory: saved.memory === draft.memory ? null : AGENT_MEMORY_WORDS[saved.memory],
  };
}
