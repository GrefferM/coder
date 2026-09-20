import {
  CHAT_PROVIDER_SILENT_NOTE,
  LOST_FUNCTION_NOTE_PREFIX,
  LOST_FUNCTION_NOTE_SUFFIX,
  LOST_PROMPT_NOTE_PREFIX,
  LOST_PROMPT_NOTE_SUFFIX,
  NOT_FILLED_AGENT_NOTE_PREFIX,
  NOT_FILLED_NOTE_MIDDLE,
  NOT_FILLED_NOTE_PREFIX,
  NOT_FILLED_NOTE_SUFFIX,
  NO_ADDRESS_NOTE_PREFIX,
  NO_ADDRESS_NOTE_SUFFIX,
  NO_KEY_NOTE_MIDDLE,
  NO_KEY_NOTE_PREFIX,
  NO_KEY_NOTE_SUFFIX,
  NO_PROVIDER_NOTE_PREFIX,
  NO_PROVIDER_NOTE_SUFFIX,
  NO_TOOLS_NOTE_MIDDLE,
  NO_TOOLS_NOTE_PREFIX,
  NO_TOOLS_NOTE_SUFFIX,
} from "../constants";
import { modelNumbers } from "../../../logic";
import { unfilledField } from "../../../words";
import { fieldWord } from "./field-word";
import type { ProjectModel, ProviderState } from "../../../interfaces";
import type { NotStartedWall } from "../interfaces";

/** Which model belongs to which provider, and that the provider has no key. */
export function noKeyNote(modelTitle: string, providerName: string): string {
  return `${NO_KEY_NOTE_PREFIX}${modelTitle}${NO_KEY_NOTE_MIDDLE}${providerName}${NO_KEY_NOTE_SUFFIX}`;
}

/** The provider a model names and nobody declared. */
export function noProviderNote(providerId: string): string {
  return `${NO_PROVIDER_NOTE_PREFIX}${providerId}${NO_PROVIDER_NOTE_SUFFIX}`;
}

/** The provider whose address field is empty — a local one, or a remote one whose address is the person's own. */
export function noAddressNote(providerName: string): string {
  return `${NO_ADDRESS_NOTE_PREFIX}${providerName}${NO_ADDRESS_NOTE_SUFFIX}`;
}

/** Which provider carries no functions, and which agent is holding grants against it. */
export function noToolsNote(providerName: string, agentName: string): string {
  return `${NO_TOOLS_NOTE_PREFIX}${providerName}${NO_TOOLS_NOTE_MIDDLE}${agentName}${NO_TOOLS_NOTE_SUFFIX}`;
}

/** Which agent holds a grant on a function the project no longer has. */
export function lostFunctionNote(agentName: string): string {
  return `${LOST_FUNCTION_NOTE_PREFIX}${agentName}${LOST_FUNCTION_NOTE_SUFFIX}`;
}

/** Which agent points at a prompt the project no longer holds. */
export function lostPromptNote(agentName: string): string {
  return `${LOST_PROMPT_NOTE_PREFIX}${agentName}${LOST_PROMPT_NOTE_SUFFIX}`;
}

/** Which agent is unfinished and which of its two numbers is empty. */
export function notFilledAgentNote(agentName: string, field: string): string {
  return `${NOT_FILLED_AGENT_NOTE_PREFIX}${agentName}${NOT_FILLED_NOTE_MIDDLE}${fieldWord(field)}${NOT_FILLED_NOTE_SUFFIX}`;
}

/** Which model is unfinished and which of its fields is empty. */
export function notFilledNote(modelTitle: string, field: string): string {
  return `${NOT_FILLED_NOTE_PREFIX}${modelTitle}${NOT_FILLED_NOTE_MIDDLE}${fieldWord(field)}${NOT_FILLED_NOTE_SUFFIX}`;
}

/**
 * What each wall says, one row per wall — the union counts them, so a wall added without a sentence does not
 * compile, and none can quietly take another's words.
 */
const WALL_NOTES: Record<NotStartedWall, (model: ProjectModel, provider: ProviderState | null) => string> = {
  noKey: (model, provider) => noKeyNote(model.title, provider?.name ?? model.provider),
  noProvider: (model) => noProviderNote(model.provider),
  noAddress: (model, provider) => noAddressNote(provider?.id ?? model.provider),
  notFilled: (model) => notFilledNote(model.title, unfilledField(modelNumbers(model)) ?? ""),
  // A provider that never answered has neither a model nor a name worth pointing at: the address is where to look.
  silent: () => CHAT_PROVIDER_SILENT_NOTE,
};

/**
 * The card's one sentence, naming the model or the provider the wall is about. Only the walls are written for:
 * the rest of the family says its piece elsewhere, and cannot arrive here to be given the wrong words.
 */
export function notStartedNote(wall: NotStartedWall, model: ProjectModel, provider: ProviderState | null): string {
  return WALL_NOTES[wall](model, provider);
}
