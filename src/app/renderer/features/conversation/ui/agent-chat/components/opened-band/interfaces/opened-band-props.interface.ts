import type { ChatHead } from "../../../interfaces";

export interface OpenedBandProps {
  /** The run standing in the stream's place — its hour, and how it ended. */
  head: ChatHead;
  /** The band's own act, on its right; null where there is nothing on screen to write out. */
  onExport: (() => void) | null;
}
