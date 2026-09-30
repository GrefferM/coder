import type { ArmedMarkRow } from "../../../../interfaces";

export interface MarkWindowProps {
  /** Where the mark stands on screen; the window opens above it, or below when there is no room. */
  at: DOMRect;
  /** «ЩЕ 3 СЕРВЕРИ»: what the mark under it would say. */
  head: string;
  /** Only the folded marks; the two on the arc are already at hand. */
  rows: ArmedMarkRow[];
  /** A line leads where its mark would, and the window shuts. */
  onOpen: (row: ArmedMarkRow) => void;
  onDismiss: () => void;
  /** Whether the pointer is on the window itself; while it is, leaving the mark does not close it. */
  onHold: (isHeld: boolean) => void;
}
