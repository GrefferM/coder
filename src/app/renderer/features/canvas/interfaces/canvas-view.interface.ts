import type { CanvasPlace } from "./canvas-place.interface";

/** Where the canvas stands: the place this machine left it and the place the hand moved it to. */
export interface CanvasViewStanding {
  /** Where this machine left the canvas, or `null` to open at home. */
  opening: CanvasPlace | null;
  onChange: (place: CanvasPlace) => void;
}
