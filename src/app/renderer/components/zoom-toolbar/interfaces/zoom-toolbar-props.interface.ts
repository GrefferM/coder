import type { ScaleStops } from "../../../utils/math";

export interface ZoomToolbarProps {
  scale: number;
  /** The ends the buttons go dead at; the field's own unless a surface keeps its own. */
  stops?: ScaleStops;
  onZoomOut: () => void;
  onZoomIn: () => void;
}
