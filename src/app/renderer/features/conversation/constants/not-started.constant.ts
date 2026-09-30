import {
  TROUBLE_LOST_FUNCTION_LABEL,
  TROUBLE_NO_TOOLS_LABEL,
  TROUBLE_LOST_PROMPT_LABEL,
  TROUBLE_NO_KEY_LABEL,
  TROUBLE_NO_MODEL_LABEL,
  TROUBLE_NO_PROVIDER_LABEL,
} from "../../agents";
import { STATE_PROVIDER_SILENT_LABEL } from "../../agents";
import { OVER_CEILING_ACT_LABEL, OVER_CEILING_LABEL } from "./over-ceiling.constant";
import { NOT_FILLED_LABEL } from "../../../constants";
import { RUN_STEP_TOO_LONG } from "../../record";
import type { NotStartedEnd } from "../interfaces";
import { LLM_NO_ADDRESS, LLM_NO_KEY, LLM_PROVIDER_NOT_BUILT, LLM_PROVIDER_SILENT } from "../../../../../contracts";
import type { MachineWall } from "../interfaces";
import type { NotStartedReason } from "../../../interfaces";

/**
 * A machine refusal code and the wall of the family it belongs to; the one place codes (the boundary's) and walls
 * (ours) are tied.
 */
export const MACHINE_WALLS: Record<string, MachineWall> = {
  [LLM_NO_KEY]: "noKey",
  [LLM_NO_ADDRESS]: "noAddress",
  [LLM_PROVIDER_SILENT]: "silent",
  [LLM_PROVIDER_NOT_BUILT]: "noProvider",
};

/** The address belongs to the provider, so this is a card of its own, never a mark on a sphere. */
export const NO_ADDRESS_CARD_LABEL = "НЕМА АДРЕСИ";

/** Names the model and which of its fields is empty. */
export const NOT_FILLED_NOTE_PREFIX = "У моделі ";
export const NOT_FILLED_AGENT_NOTE_PREFIX = "В агента ";

/** The sentence for a granted function the project has lost. */
export const LOST_FUNCTION_NOTE_PREFIX = "В агента ";
export const LOST_FUNCTION_NOTE_SUFFIX =
  " лишилась видача на функцію, якої в проєкті немає. Приберіть видачу або оголосіть команду наново, і агент піде.";

/** For a prompt the agent names and the project has lost. */
export const LOST_PROMPT_NOTE_PREFIX = "В агента ";

/** For a provider protocol without functions while the agent holds grants. */
export const NO_TOOLS_NOTE_PREFIX = "Провайдер ";
export const NO_TOOLS_NOTE_MIDDLE = " не вміє викликати функції, а в агента ";
export const NO_TOOLS_NOTE_SUFFIX = " є видачі. Зніміть їх або оберіть модель іншого провайдера, і агент піде.";
export const LOST_PROMPT_NOTE_SUFFIX =
  " зник промпт, на який він посилається. Оберіть промпт наново або зніміть його, і агент піде.";
export const NOT_FILLED_NOTE_MIDDLE = " не заповнено поле «";
export const NOT_FILLED_NOTE_SUFFIX = "». Заповніть його, і агент піде.";

/** One heading for every card. */
export const NOT_STARTED_TITLE = "Хід не почався";
export const NOT_STARTED_FREE_LABEL = "Нічого не надіслано";

/** Per reason: the sphere's word, the one act offered, and the word the record keeps for a step that ended there. */
export const NOT_STARTED_ENDS: Record<NotStartedReason, NotStartedEnd> = {
  noKey: {
    label: TROUBLE_NO_KEY_LABEL,
    actLabel: "ВІДКРИТИ ПРОВАЙДЕРА",
    act: "providers",
    state: "noKey",
  },
  noModel: {
    label: TROUBLE_NO_MODEL_LABEL,
    actLabel: "ВІДКРИТИ НАЛАШТУВАННЯ",
    act: "settings",
    state: "noModel",
  },
  // The act goes to the address and check hour shown in the card, not to pressing the turn again.
  silent: {
    label: STATE_PROVIDER_SILENT_LABEL,
    actLabel: "ВІДКРИТИ ПРОВАЙДЕРА",
    act: "providers",
    // A provider that never answered differs from a model that answered with nothing; the record parts them by word.
    state: "unreachable",
  },
  noProvider: {
    label: TROUBLE_NO_PROVIDER_LABEL,
    actLabel: OVER_CEILING_ACT_LABEL,
    act: "model",
    state: "noProvider",
  },
  noAddress: {
    label: NO_ADDRESS_CARD_LABEL,
    actLabel: "ВІДКРИТИ ПРОВАЙДЕРА",
    act: "providers",
    state: "noAddress",
  },
  // A field nobody wrote is fixed in the form, not in the connection.
  notFilled: {
    label: NOT_FILLED_LABEL,
    actLabel: OVER_CEILING_ACT_LABEL,
    act: "model",
    state: "notFilled",
  },
  // The same word for the agent's own two numbers, fixed in another tab.
  notFilledAgent: {
    label: NOT_FILLED_LABEL,
    actLabel: "ВІДКРИТИ НАЛАШТУВАННЯ",
    act: "settings",
    state: "notFilledAgent",
  },
  // A grant on a command the project has lost; the act leads to the grants.
  lostFunction: {
    label: TROUBLE_LOST_FUNCTION_LABEL,
    actLabel: "ВІДКРИТИ ВИДАЧУ",
    act: "grants",
    state: "lostFunction",
  },
  // The provider cannot carry functions and the agent holds grants; the act leads to the grants, which the person can
  // remove.
  noTools: {
    label: TROUBLE_NO_TOOLS_LABEL,
    actLabel: "ВІДКРИТИ ВИДАЧУ",
    act: "grants",
    state: "noTools",
  },
  // The agent names a prompt the project has lost; the act leads to the field that names it.
  lostPrompt: {
    label: TROUBLE_LOST_PROMPT_LABEL,
    actLabel: "ВІДКРИТИ ПРОМПТ",
    act: "prompt",
    state: "lostPrompt",
  },
  // The one reason with something to say to, and too much of it said.
  tooLong: {
    label: OVER_CEILING_LABEL,
    actLabel: OVER_CEILING_ACT_LABEL,
    act: "model",
    state: RUN_STEP_TOO_LONG,
  },
};
