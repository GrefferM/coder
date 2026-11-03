import { RUN_STEP_TOO_LONG } from "../runs";
import type { NotStartedReason } from "../llm";

/** Per reason, the word the record keeps for a step that ended there. */
export const NOT_STARTED_STATES: Record<NotStartedReason, string> = {
  noKey: "noKey",
  noModel: "noModel",
  // A provider that never answered differs from a model that answered with nothing; the record parts them by word.
  silent: "unreachable",
  noProvider: "noProvider",
  noAddress: "noAddress",
  notFilled: "notFilled",
  notFilledAgent: "notFilledAgent",
  lostFunction: "lostFunction",
  noConsent: "noConsent",
  providerOff: "providerOff",
  noTools: "noTools",
  lostPrompt: "lostPrompt",
  tooLong: RUN_STEP_TOO_LONG,
};
