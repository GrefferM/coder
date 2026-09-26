import type { ReactNode, Ref } from "react";
import type { CanvasPillPlace } from "./canvas-pill-place.type";
import type { CanvasPillTone } from "./canvas-pill-tone.type";

/** `isLeaving` fades the pill out and keeps it mounted. */
export interface CanvasPillProps {
  ref?: Ref<HTMLDivElement>;
  gapPx?: number;
  children: ReactNode;
  tone?: CanvasPillTone;
  isLeaving?: boolean;
  /** Bottom unless said otherwise. */
  place?: CanvasPillPlace;
}
