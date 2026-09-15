import {
  TROUBLE_LOST_FUNCTION_LABEL,
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
 * The refusal code the machine sends, and the wall of the family it is. One row per code: the codes are the
 * boundary's and the walls are ours, and this is the one place the two are tied together.
 */
export const MACHINE_WALLS: Record<string, MachineWall> = {
  [LLM_NO_KEY]: "noKey",
  [LLM_NO_ADDRESS]: "noAddress",
  [LLM_PROVIDER_SILENT]: "silent",
  [LLM_PROVIDER_NOT_BUILT]: "noProvider",
};

/** An address belongs to the provider, so this word is a card of its own and never a mark on a sphere. */
export const NO_ADDRESS_CARD_LABEL = "НЕМА АДРЕСИ";

/** The sentence under it — which model it is and which of its fields is empty. */
export const NOT_FILLED_NOTE_PREFIX = "У моделі ";
export const NOT_FILLED_AGENT_NOTE_PREFIX = "В агента ";

/** The sentence for a granted function the project has lost. */
export const LOST_FUNCTION_NOTE_PREFIX = "В агента ";
export const LOST_FUNCTION_NOTE_SUFFIX =
  " лишилась видача на функцію, якої в проєкті немає. Приберіть видачу або оголосіть команду наново, і агент піде.";

/** The sentence for a prompt the agent names and the project has lost. */
export const LOST_PROMPT_NOTE_PREFIX = "В агента ";
export const LOST_PROMPT_NOTE_SUFFIX =
  " зник промпт, на який він посилається. Оберіть промпт наново або зніміть його, і агент піде.";
export const NOT_FILLED_NOTE_MIDDLE = " не заповнено поле «";
export const NOT_FILLED_NOTE_SUFFIX = "». Заповніть його, і агент піде.";

/** One heading for all of them — the turn did not begin, so there is nothing to look at. */
export const NOT_STARTED_TITLE = "Хід не почався";
export const NOT_STARTED_FREE_LABEL = "Нічого не надіслано";

/**
 * The family, one row per reason — the word the sphere gives it, the one act it offers, and the word the
 * record keeps for a step that ended there. The union counts the rows; nothing counts them in prose.
 */
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
  // The address and the hour it was checked stand in the card and say where to look, so the act goes
  // there rather than pressing the turn again — the one reason that passes by itself is not one to press through.
  silent: {
    label: STATE_PROVIDER_SILENT_LABEL,
    actLabel: "ВІДКРИТИ ПРОВАЙДЕРА",
    act: "providers",
    // A provider that never answered is not a model that answered with nothing, and the record parts them by word.
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
  // A field nobody wrote is mended in the form, not in the connection.
  notFilled: {
    label: NOT_FILLED_LABEL,
    actLabel: OVER_CEILING_ACT_LABEL,
    act: "model",
    state: "notFilled",
  },
  // The same word for the agent's own two numbers, mended one tab away rather than in the catalogue.
  notFilledAgent: {
    label: NOT_FILLED_LABEL,
    actLabel: "ВІДКРИТИ НАЛАШТУВАННЯ",
    act: "settings",
    state: "notFilledAgent",
  },
  // A grant on a command the project has lost — the act leads to the grants, where the tie hangs.
  lostFunction: {
    label: TROUBLE_LOST_FUNCTION_LABEL,
    actLabel: "ВІДКРИТИ ВИДАЧУ",
    act: "grants",
    state: "lostFunction",
  },
  // The agent names a prompt the project has lost — the act leads to the field that still names it.
  lostPrompt: {
    label: TROUBLE_LOST_PROMPT_LABEL,
    actLabel: "ВІДКРИТИ ПРОМПТ",
    act: "prompt",
    state: "lostPrompt",
  },
  // The one reason where there is something to say to — and too much of it said.
  tooLong: {
    label: OVER_CEILING_LABEL,
    actLabel: OVER_CEILING_ACT_LABEL,
    act: "model",
    state: RUN_STEP_TOO_LONG,
  },
};
