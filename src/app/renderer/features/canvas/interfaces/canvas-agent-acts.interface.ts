import type { Point } from "../../../utils/math";

/** Every act on a sphere: choose, put down, move, remove. */
export interface CanvasAgentActs {
  onSelectedAgentIdChange: (agentId: string | null) => void;
  /** A press on a «+» only chooses the sphere it stands over; the agent's tab is untouched. */
  onPick: (agentId: string) => void;
  /**
   * A mark of the arc was pressed: chooses the sphere and opens the tab on the page of what the mark stood for (a
   * command's grant, a server's functions). A line of a «+» list comes here too.
   */
  onOpenTools: (agentId: string, group: string | null, grantId: string | null) => void;
  onAdd: (at: Point) => void;
  onCopy: (agentId: string) => void;
  onPaste: (at: Point) => void;
  onPastedDismiss: () => void;
  onDelete: (agentId: string) => void;
  onMove: (agentId: string, at: Point) => Promise<void>;
}
