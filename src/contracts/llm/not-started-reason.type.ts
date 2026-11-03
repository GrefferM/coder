/** Why a turn never began; the card is drawn by family. */
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
  | "noConsent"
  | "providerOff"
  | "noTools"
  | "tooLong";
