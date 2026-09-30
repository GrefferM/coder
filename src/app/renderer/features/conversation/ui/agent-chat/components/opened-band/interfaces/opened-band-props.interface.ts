import type { ChatHead } from "../../../interfaces";

export interface OpenedBandProps {
  /** The run shown in the stream's place: its hour and how it ended. */
  head: ChatHead;
  /** The band's act; `null` when there is nothing on screen to export. */
  onExport: (() => void) | null;
}
