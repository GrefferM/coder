import type { ChatHead } from "../../../interfaces";

export interface OpenedBandProps {
  /** The conversation on screen, an opened run or the live chat: its hour and how it stands. */
  head: ChatHead;
  /** The band's act; `null` when there is nothing on screen to export. */
  onExport: (() => void) | null;
}
