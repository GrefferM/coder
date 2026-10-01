import { grantedToolsLabel } from "../words";
import { isAgentGrant, isCommandGrant, isServerGrant } from "../../../interfaces";
import { writtenNumber } from "../words";
import {
  AGENT_ACTIVE_CHANGE_LABEL,
  AGENT_ACTIVE_DROPPED_LABEL,
  AGENT_ACTIVE_OFF_LABEL,
  AGENT_ACTIVE_ON_LABEL,
  AGENT_WAIT_CHANGE_LABEL,
  AGENT_WAIT_DROPPED_LABEL,
  AGENT_WAIT_ON_LABEL,
  AGENT_WAIT_OFF_LABEL,
  AGENT_THREAD_CHANGE_LABEL,
  AGENT_THREAD_DROPPED_LABEL,
  AGENT_THREAD_ON_LABEL,
  AGENT_THREAD_OFF_LABEL,
  AGENT_COLOR_CHANGE_LABEL,
  AGENT_COLOR_DROPPED_LABEL,
  AGENT_MAX_CALLS_CHANGE_LABEL,
  AGENT_MAX_CALLS_DROPPED_LABEL,
  AGENT_TEMPERATURE_CHANGE_LABEL,
  AGENT_TEMPERATURE_DROPPED_LABEL,
  AGENT_TEMPERATURE_PLACES,
  AGENT_MODEL_CHANGE_LABEL,
  AGENT_MODEL_DROPPED_LABEL,
  AGENT_NAME_CHANGE_LABEL,
  AGENT_NAME_DROPPED_LABEL,
  AGENT_PURPOSE_CHANGE_LABEL,
  AGENT_PURPOSE_DROPPED_LABEL,
  AGENT_NO_PROMPT_LABEL,
  AGENT_PROMPT_CHANGE_LABEL,
  AGENT_PROMPT_DROPPED_LABEL,
  AGENT_COMMANDS_CHANGE_LABEL,
  AGENT_COMMANDS_DROPPED_LABEL,
  AGENT_MCP_CHANGE_LABEL,
  AGENT_MCP_DROPPED_LABEL,
  AGENT_AGENTS_CHANGE_LABEL,
  AGENT_AGENTS_DROPPED_LABEL,
} from "../constants";
import type { FieldChange, ProjectModel, ProjectPrompt, ToolGrant } from "../../../interfaces";
import type { AgentDraft, AgentNaming } from "../interfaces";

/** A model's name in a diff line; its id when no longer in the project. */
function modelTitle(models: ProjectModel[], modelId: string): string {
  return models.find((model) => model.id === modelId)?.title ?? modelId;
}

/** A prompt's name in a diff line; no prompt is worded by the question. */
function promptTitle(prompts: ProjectPrompt[], promptId: string | null): string {
  return prompts.find((prompt) => prompt.id === promptId)?.name ?? AGENT_NO_PROMPT_LABEL;
}

/** Moved fields, written as the question shows them. */
export function agentChanges(saved: AgentDraft, draft: AgentDraft, naming: AgentNaming): FieldChange[] {
  const { models, prompts } = naming;

  /** Words one field's own kind of grants only. */
  const saidOf = (grants: ToolGrant[], isOfKind: (grant: ToolGrant) => boolean) =>
    grantedToolsLabel(grants.filter(isOfKind), naming);

  const written: FieldChange[] = [
    {
      label: AGENT_NAME_CHANGE_LABEL,
      droppedLabel: AGENT_NAME_DROPPED_LABEL,
      was: saved.name,
      now: draft.name,
    },
    {
      label: AGENT_PURPOSE_CHANGE_LABEL,
      droppedLabel: AGENT_PURPOSE_DROPPED_LABEL,
      was: saved.purpose ?? "",
      now: draft.purpose ?? "",
    },
    {
      label: AGENT_MODEL_CHANGE_LABEL,
      droppedLabel: AGENT_MODEL_DROPPED_LABEL,
      was: modelTitle(models, saved.modelId),
      now: modelTitle(models, draft.modelId),
    },
    {
      label: AGENT_PROMPT_CHANGE_LABEL,
      droppedLabel: AGENT_PROMPT_DROPPED_LABEL,
      was: promptTitle(prompts, saved.promptId),
      now: promptTitle(prompts, draft.promptId),
    },
    // «команди» and «MCP» are two tab fields, so two lines.
    {
      label: AGENT_COMMANDS_CHANGE_LABEL,
      droppedLabel: AGENT_COMMANDS_DROPPED_LABEL,
      was: saidOf(saved.tools, isCommandGrant),
      now: saidOf(draft.tools, isCommandGrant),
    },
    {
      label: AGENT_MCP_CHANGE_LABEL,
      droppedLabel: AGENT_MCP_DROPPED_LABEL,
      was: saidOf(saved.tools, isServerGrant),
      now: saidOf(draft.tools, isServerGrant),
    },
    {
      label: AGENT_AGENTS_CHANGE_LABEL,
      droppedLabel: AGENT_AGENTS_DROPPED_LABEL,
      was: saidOf(saved.tools, isAgentGrant),
      now: saidOf(draft.tools, isAgentGrant),
    },
    {
      label: AGENT_COLOR_CHANGE_LABEL,
      droppedLabel: AGENT_COLOR_DROPPED_LABEL,
      was: saved.color,
      now: draft.color,
    },
    {
      label: AGENT_MAX_CALLS_CHANGE_LABEL,
      droppedLabel: AGENT_MAX_CALLS_DROPPED_LABEL,
      was: writtenNumber(saved.maxCalls),
      now: writtenNumber(draft.maxCalls),
    },
    {
      label: AGENT_TEMPERATURE_CHANGE_LABEL,
      droppedLabel: AGENT_TEMPERATURE_DROPPED_LABEL,
      was: writtenNumber(saved.temperature, AGENT_TEMPERATURE_PLACES),
      now: writtenNumber(draft.temperature, AGENT_TEMPERATURE_PLACES),
    },
    {
      label: AGENT_ACTIVE_CHANGE_LABEL,
      droppedLabel: AGENT_ACTIVE_DROPPED_LABEL,
      was: saved.isActive ? AGENT_ACTIVE_ON_LABEL : AGENT_ACTIVE_OFF_LABEL,
      now: draft.isActive ? AGENT_ACTIVE_ON_LABEL : AGENT_ACTIVE_OFF_LABEL,
    },
    {
      label: AGENT_WAIT_CHANGE_LABEL,
      droppedLabel: AGENT_WAIT_DROPPED_LABEL,
      was: saved.waitsForAll ? AGENT_WAIT_ON_LABEL : AGENT_WAIT_OFF_LABEL,
      now: draft.waitsForAll ? AGENT_WAIT_ON_LABEL : AGENT_WAIT_OFF_LABEL,
    },
    {
      label: AGENT_THREAD_CHANGE_LABEL,
      droppedLabel: AGENT_THREAD_DROPPED_LABEL,
      was: saved.keepsThread ? AGENT_THREAD_ON_LABEL : AGENT_THREAD_OFF_LABEL,
      now: draft.keepsThread ? AGENT_THREAD_ON_LABEL : AGENT_THREAD_OFF_LABEL,
    },
  ];

  return written.filter((change) => change.was !== change.now);
}
