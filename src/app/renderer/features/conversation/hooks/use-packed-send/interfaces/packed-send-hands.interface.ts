import type { PackedSend } from "../../../interfaces";

/** Whether this stream may send now, and the send itself. */
export interface PackedSendHands {
  /** A question of this stream is being packed; another sent meanwhile would begin its walk first. */
  isPacking: (stream: string) => boolean;
  send: (asked: PackedSend) => void;
}
