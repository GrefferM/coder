import type { ReactNode } from "react";

import type { SphereMark } from "./sphere-mark.interface";
import type { SphereTrailProps } from "../components/sphere-trail/interfaces";

/** Inputs of one `Sphere`: content, the trouble mark, selected/dimmed/label-hidden flags, select handler. */
export interface SphereProps {
  name: string;
  trouble?: SphereMark | null;
  modelTitle?: string;
  color: string;
  isActive: boolean;
  /** State colour for the dot beside the name. */
  stateColor?: string;
  isSelected: boolean;
  /** The chat writes to this agent; only its halo breathes, not the sphere, grid, neighbours or lines. */
  isAimed?: boolean;
  isDimmed?: boolean;
  /** What the «?» is multiplied by, so it keeps its own size while the graph shrinks. */
  markScale?: number;
  /** Table 11: the canvas is small enough that the model line takes its full tone. */
  isDrawnSmall?: boolean;
  /** The dim third line under the model — the prompt's page and the key with its number. */
  trail?: SphereTrailProps | null;
  /** What stands under the labels — the working pill. */
  underLabel?: ReactNode;
  onSelect: () => void;
}
