import type { DrawnLine } from "../hooks/use-link-draft/interfaces";
import type { SphereDragState } from "../hooks/use-sphere-drag/interfaces";
import type { Agent } from "../../../interfaces";

/** What is being drawn on the canvas now, and the drawing's size at this scale. */
export interface CanvasDrawing {
  drag: SphereDragState | null;
  /** The line in hand, the cancelled line fading, and the sphere the line is over. */
  draft: DrawnLine | null;
  cancelled: DrawnLine | null;
  target: Agent | null;
  /** The link that stands chosen, so its layer draws it apart. */
  chosenLinkId: string | null;
  markScale: number;
  /** Below this scale a sphere shows its state in tone alone, with no word. */
  isDrawnSmall: boolean;
}
