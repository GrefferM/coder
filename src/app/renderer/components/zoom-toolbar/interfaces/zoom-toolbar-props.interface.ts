import type { ScaleStops } from "../../../utils/math";

export interface ZoomToolbarProps {
  scale: number;
  /** Ends where the buttons go dead; the field's own unless a surface passes its own. */
  stops?: ScaleStops;
  onZoomOut: () => void;
  onZoomIn: () => void;
}
