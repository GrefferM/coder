import type { Point } from "../../../utils/math";

/** Every act on a sphere: choosing one, putting one down, moving it, taking it away. */
export interface CanvasAgentActs {
  onSelectedAgentIdChange: (agentId: string | null) => void;
  /**
   * A press on a «+» chooses the sphere it stands over — «двох різних виборів на полотні не буває» —
   * and does nothing else: the list it raises lives on the canvas, and the agent's tab is not touched at all.
   */
  onPick: (agentId: string) => void;
  /**
   * A mark of the arc was pressed. The sphere is chosen by that same press — there are never two
   * different choices — and the tab opens on the page of what that mark stood for: a command's grant, a server's
   * functions. A line of the list a «+» raised comes through here as well, and to the same places.
   */
  onOpenTools: (agentId: string, group: string | null, grantId: string | null) => void;
  onAdd: (at: Point) => void;
  onCopy: (agentId: string) => void;
  onPaste: (at: Point) => void;
  onPastedDismiss: () => void;
  onDelete: (agentId: string) => void;
  onMove: (agentId: string, at: Point) => Promise<void>;
}
