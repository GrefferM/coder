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
import type { NotStartedEnd } from "../interfaces";
import { NOT_STARTED_STATES } from "../../../../../contracts/walks";
import type { NotStartedReason } from "../../../interfaces";

export { MACHINE_WALLS } from "../../../../../contracts/walks";

/** The address belongs to the provider, so this is a card of its own, never a mark on a sphere. */
export const NO_ADDRESS_CARD_LABEL = "НЕМА АДРЕСИ";

export * from "../../../../../contracts/walks/agent-wall-notes.constant";

/** One heading for every card. */
export const NOT_STARTED_TITLE = "Хід не почався";
export const NOT_STARTED_FREE_LABEL = "Нічого не надіслано";

/** Per reason: the sphere's word, the one act offered, and the word the record keeps for a step that ended there. */
export const NOT_STARTED_ENDS: Record<NotStartedReason, NotStartedEnd> = {
  noKey: {
    label: TROUBLE_NO_KEY_LABEL,
    actLabel: "ВІДКРИТИ ПРОВАЙДЕРА",
    act: "providers",
    state: NOT_STARTED_STATES.noKey,
  },
  noModel: {
    label: TROUBLE_NO_MODEL_LABEL,
    actLabel: "ВІДКРИТИ НАЛАШТУВАННЯ",
    act: "settings",
    state: NOT_STARTED_STATES.noModel,
  },
  // The act goes to the address and check hour shown in the card, not to pressing the turn again.
  silent: {
    label: STATE_PROVIDER_SILENT_LABEL,
    actLabel: "ВІДКРИТИ ПРОВАЙДЕРА",
    act: "providers",
    // A provider that never answered differs from a model that answered with nothing; the record parts them by word.
    state: NOT_STARTED_STATES.silent,
  },
  noProvider: {
    label: TROUBLE_NO_PROVIDER_LABEL,
    actLabel: OVER_CEILING_ACT_LABEL,
    act: "model",
    state: NOT_STARTED_STATES.noProvider,
  },
  noAddress: {
    label: NO_ADDRESS_CARD_LABEL,
    actLabel: "ВІДКРИТИ ПРОВАЙДЕРА",
    act: "providers",
    state: NOT_STARTED_STATES.noAddress,
  },
  // A field nobody wrote is fixed in the form, not in the connection.
  notFilled: {
    label: NOT_FILLED_LABEL,
    actLabel: OVER_CEILING_ACT_LABEL,
    act: "model",
    state: NOT_STARTED_STATES.notFilled,
  },
  // The same word for the agent's own two numbers, fixed in another tab.
  notFilledAgent: {
    label: NOT_FILLED_LABEL,
    actLabel: "ВІДКРИТИ НАЛАШТУВАННЯ",
    act: "settings",
    state: NOT_STARTED_STATES.notFilledAgent,
  },
  // A grant on a command the project has lost; the act leads to the grants.
  lostFunction: {
    label: TROUBLE_LOST_FUNCTION_LABEL,
    actLabel: "ВІДКРИТИ ВИДАЧУ",
    act: "grants",
    state: NOT_STARTED_STATES.lostFunction,
  },
  // The provider cannot carry functions and the agent holds grants; the act leads to the grants, which the person can
  // remove.
  noTools: {
    label: TROUBLE_NO_TOOLS_LABEL,
    actLabel: "ВІДКРИТИ ВИДАЧУ",
    act: "grants",
    state: NOT_STARTED_STATES.noTools,
  },
  // The agent names a prompt the project has lost; the act leads to the field that names it.
  lostPrompt: {
    label: TROUBLE_LOST_PROMPT_LABEL,
    actLabel: "ВІДКРИТИ ПРОМПТ",
    act: "prompt",
    state: NOT_STARTED_STATES.lostPrompt,
  },
  // A granted local server whose run line waits for this machine's consent; the act opens the window of 36k over it, and
  // the card carries no word of its own, as the frame draws it.
  noConsent: {
    label: null,
    actLabel: "ПОКАЗАТИ, ЩО ЗАПУСТИТЬСЯ",
    act: "consent",
    state: NOT_STARTED_STATES.noConsent,
  },
  // The one reason with something to say to, and too much of it said.
  tooLong: {
    label: OVER_CEILING_LABEL,
    actLabel: OVER_CEILING_ACT_LABEL,
    act: "model",
    state: NOT_STARTED_STATES.tooLong,
  },
};
