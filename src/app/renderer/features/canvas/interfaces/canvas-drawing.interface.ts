import type { DrawnLine } from "../hooks/use-link-draft/interfaces";
import type { SphereDragState } from "../hooks/use-sphere-drag/interfaces";
import type { Agent } from "../../../interfaces";

/** What is being drawn on the canvas this moment, and how big the drawing is at this scale. */
export interface CanvasDrawing {
  /** The one sphere being dragged, or `null` when none is. */
  drag: SphereDragState | null;
  /** The line in hand, the one crossed out while it fades, and the sphere the line is over. */
  draft: DrawnLine | null;
  cancelled: DrawnLine | null;
  target: Agent | null;
  /** The link that stands chosen, so its layer draws it apart. */
  chosenLinkId: string | null;
  markScale: number;
  /** Below this scale a sphere says its state in tone alone, having no room for the word. */
  isDrawnSmall: boolean;
}
