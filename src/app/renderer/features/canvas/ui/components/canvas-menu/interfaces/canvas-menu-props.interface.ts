import type { Point } from "../../../../../../utils/math";

export interface CanvasMenuProps {
  /** Where the menu itself stands, in the window. */
  at: Point;
  /** The place on the canvas the menu was opened over — where a new agent would land. */
  contentAt: Point;
  /** Whose menu this is; null for the canvas's own. */
  agentId: string | null;
  /** Whether there is a copy to put down; the act stands dimmed while there is none. */
  isPasteOffered: boolean;
  onAddAgent: (at: Point) => void;
  onPasteAgent: (at: Point) => void;
  onDrawLink: (agentId: string, from: Point) => void;
  onCopyAgent: (agentId: string) => void;
  onDeleteAgent: (agentId: string) => void;
  onDismiss: () => void;
}
