/** Why a turn never began — the family the card is drawn for, one form on all of them. */
export type NotStartedReason =
  | "noKey"
  | "noModel"
  | "silent"
  | "noProvider"
  | "noAddress"
  | "notFilled"
  | "notFilledAgent"
  | "lostPrompt"
  | "lostFunction"
  | "tooLong";
