import { grantedToolsLabel } from "../words";
import { isCommandGrant, isServerGrant } from "../../../interfaces";
import { writtenNumber } from "../words";
import {
  AGENT_ACTIVE_CHANGE_LABEL,
  AGENT_ACTIVE_DROPPED_LABEL,
  AGENT_ACTIVE_OFF_LABEL,
  AGENT_ACTIVE_ON_LABEL,
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
  AGENT_NO_PROMPT_LABEL,
  AGENT_PROMPT_CHANGE_LABEL,
  AGENT_PROMPT_DROPPED_LABEL,
  AGENT_COMMANDS_CHANGE_LABEL,
  AGENT_COMMANDS_DROPPED_LABEL,
  AGENT_MCP_CHANGE_LABEL,
  AGENT_MCP_DROPPED_LABEL,
} from "../constants";
import type {
  FieldChange,
  ProjectCommand,
  ProjectMcpServer,
  ProjectModel,
  ProjectPrompt,
  ToolGrant,
} from "../../../interfaces";
import type { AgentDraft } from "../interfaces";

/** A model as a diff line names it; a model no longer in the project stands as its id. */
function modelTitle(models: ProjectModel[], modelId: string): string {
  return models.find((model) => model.id === modelId)?.title ?? modelId;
}

/** A prompt as a diff line names it; no-prompt is a state of its own and the question names it in words. */
function promptTitle(prompts: ProjectPrompt[], promptId: string | null): string {
  return prompts.find((prompt) => prompt.id === promptId)?.name ?? AGENT_NO_PROMPT_LABEL;
}

/** Moved fields, written as the question shows them. */
export function agentChanges(
  saved: AgentDraft,
  draft: AgentDraft,
  models: ProjectModel[],
  prompts: ProjectPrompt[],
  commands: ProjectCommand[],
  servers: ProjectMcpServer[],
): FieldChange[] {
  /** Each field is asked about its own kind of grant alone, in the words that field shows. */
  const saidOf = (grants: ToolGrant[], isOfKind: (grant: ToolGrant) => boolean) =>
    grantedToolsLabel(grants.filter(isOfKind), commands, servers);

  const written: FieldChange[] = [
    {
      label: AGENT_NAME_CHANGE_LABEL,
      droppedLabel: AGENT_NAME_DROPPED_LABEL,
      was: saved.name,
      now: draft.name,
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
    // Two fields on the tab are two lines in the question: «команди» and «MCP» are not one thing that moved.
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
  ];

  return written.filter((change) => change.was !== change.now);
}
