import type { PackedSend } from "../../../interfaces";

/** The two hands of a send with files: whether this stream may send now, and the sending itself. */
export interface PackedSendHands {
  /** A question of this stream is still being packed: another sent meanwhile would begin its walk first. */
  isPacking: (stream: string) => boolean;
  send: (asked: PackedSend) => void;
}
