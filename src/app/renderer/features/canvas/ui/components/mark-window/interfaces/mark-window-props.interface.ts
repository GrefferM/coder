import type { ArmedMarkRow } from "../../../../interfaces";

export interface MarkWindowProps {
  /** Where the mark stands on the screen: the window opens over it, and under it where there is no room above. */
  at: DOMRect;
  /** «ЩЕ 3 СЕРВЕРИ»: the window says what the mark under it would have said. */
  head: string;
  /** Only what is folded — the two standing on the arc are at hand already. */
  rows: ArmedMarkRow[];
  /** A line leads where its mark would have led, and the window shuts: it was a road, not a place. */
  onOpen: (row: ArmedMarkRow) => void;
  onDismiss: () => void;
  /**
   * Whether the hand is on the window itself. It opens on the pointer resting on the «+» and would go the moment
   * the pointer left it — but the way in is across that very gap, so the window says when it holds the hand.
   */
  onHold: (isHeld: boolean) => void;
}
