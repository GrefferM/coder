import type { CanvasPlace } from "./canvas-place.interface";

/** Where the canvas stands: where this machine left it, and where the hand has moved it to. */
export interface CanvasViewStanding {
  /** Where this machine left the canvas last time, or `null` to open at home. */
  opening: CanvasPlace | null;
  onChange: (place: CanvasPlace) => void;
}
