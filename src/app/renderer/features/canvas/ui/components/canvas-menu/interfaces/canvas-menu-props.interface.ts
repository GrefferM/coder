import type { Point } from "../../../../../../utils/math";

export interface CanvasMenuProps {
  /** Where the menu itself stands, in the window. */
  at: Point;
  /** The canvas place the menu opened over, where a new agent would land. */
  contentAt: Point;
  /** Whose menu this is; null for the canvas's own. */
  agentId: string | null;
  /** Whether there is a copy to paste; the act is dimmed when none. */
  isPasteOffered: boolean;
  onAddAgent: (at: Point) => void;
  onPasteAgent: (at: Point) => void;
  onDrawLink: (agentId: string, from: Point) => void;
  onCopyAgent: (agentId: string) => void;
  onDeleteAgent: (agentId: string) => void;
  onDismiss: () => void;
}
